import asyncHandler from 'express-async-handler'
import type { Request, Response, RequestHandler } from 'express'
import type { Server } from 'socket.io'
import type { PrismaClient } from '@prisma/client'
import type { TwilioService } from '../services/twilioService.js'
import type { RoutingService } from '../services/routingService.js'
import type { CallStorage } from '../services/callStorage.js'
import type { ChatStorage } from '../services/chatStorage.js'

export class TwilioController {
  constructor(
    private twilioService: TwilioService,
    private routingService: RoutingService,
    private callStorage: CallStorage,
    private chatStorage: ChatStorage,
    private io: Server,
    private prisma: PrismaClient
  ) {}

  /**
   * Handle incoming call webhook from Twilio
   * This is called when someone dials your Twilio phone number
   *
   * Endpoint: POST /api/v1/twilio/voice/incoming
   * Called by: Twilio (webhook)
   */
  handleIncomingCall: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { CallSid, From, To, CallStatus, CallerName } = req.body

    console.log(`[Twilio Webhook] Incoming call: ${From} → ${To} (${CallSid})`)

    // 1. Look up the phone number in database
    const phoneNumber = await this.prisma.phoneNumber.findUnique({
      where: { number: To },
    })

    if (!phoneNumber) {
      console.error(`[Twilio] Phone number ${To} not found in database`)
      res.type('text/xml').send(this.twilioService.generateBusyTwiML())
      return
    }

    console.log(`[Twilio] Phone number found: ${phoneNumber.id}, status: ${phoneNumber.status}`)

    // Check if phone number is active
    if (phoneNumber.status !== 'active') {
      console.log(`[Twilio] Phone number ${To} is not active (status: ${phoneNumber.status})`)
      res.type('text/xml').send(this.twilioService.generateBusyTwiML())
      return
    }

    // 2. Evaluate routing rules to find target user
    const routing = await this.routingService.evaluateRouting(phoneNumber.id, From)

    if (!routing) {
      console.log(`[Twilio] No routing found for ${To}`)
      res.type('text/xml').send(this.twilioService.generateBusyTwiML())
      return
    }

    console.log(`[Twilio] Routing to user ${routing.targetUserId} (ext: ${routing.targetExtension})`)

    // 3. Check if user is online (has active WebSocket connection)
    const userSession = this.chatStorage.getUserSession(routing.targetUserId)
    if (!userSession) {
      console.log(`[Twilio] Target user ${routing.targetUserId} is offline`)
      res.type('text/xml').send(this.twilioService.generateBusyTwiML())
      return
    }

    console.log(`[Twilio] User is online, socket ID: ${userSession.socketId}`)

    // 4. Check if user is already in a call
    if (this.callStorage.isUserInCall(routing.targetUserId)) {
      console.log(`[Twilio] Target user ${routing.targetUserId} is already in a call`)
      res.type('text/xml').send(this.twilioService.generateBusyTwiML())
      return
    }

    // 5. Generate unique call ID
    const callId = `pstn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // 6. Create PSTN call session in memory
    this.callStorage.createPSTNCall({
      callId,
      twilioCallSid: CallSid,
      fromNumber: From,
      toExtension: routing.targetExtension,
      toUserId: routing.targetUserId,
    })

    // 7. Emit incoming call event to user via Socket.io
    console.log(`[Twilio] Emitting call:incoming:pstn to user ${routing.targetUserId}`)
    this.io.to(`user:${routing.targetUserId}`).emit('call:incoming:pstn', {
      callId,
      callSid: CallSid,
      fromNumber: From,
      fromName: CallerName || From,
      toExtension: routing.targetExtension,
    })

    // 8. Generate TwiML to dial the user's browser (Twilio Client)
    const twiml = this.twilioService.generateDialClientTwiML(
      routing.targetUserId,
      routing.targetExtension,
      callId
    )

    console.log(`[Twilio] Returning TwiML to dial user_${routing.targetUserId}`)

    // Return TwiML response
    res.type('text/xml').send(twiml)
  })

  /**
   * Handle call status callback from Twilio
   * Called when call status changes (answered, completed, failed, etc.)
   *
   * Endpoint: POST /api/v1/twilio/voice/status
   * Called by: Twilio (webhook)
   */
  handleStatusCallback: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { CallSid, CallStatus, CallDuration, RecordingUrl, RecordingSid } = req.body

    console.log(`[Twilio Status] ${CallSid} - ${CallStatus} (duration: ${CallDuration}s)`)

    // Find the call in our storage
    const pstnCall = this.callStorage.getCallBySid(CallSid)

    // Update call history in database
    await this.prisma.callHistory.updateMany({
      where: { twilioCallSid: CallSid },
      data: {
        twilioStatus: CallStatus,
        duration: CallDuration ? parseInt(CallDuration) : undefined,
        recordingUrl: RecordingUrl,
      },
    })

    // Clean up call storage if call ended
    if (CallStatus === 'completed' || CallStatus === 'failed' || CallStatus === 'canceled') {
      if (pstnCall) {
        this.callStorage.endPSTNCall(pstnCall.callId)
        console.log(`[Twilio Status] Cleaned up call session: ${pstnCall.callId}`)

        // Emit call ended event to user
        this.io.to(`user:${pstnCall.toUserId}`).emit('call:ended:pstn', {
          callId: pstnCall.callId,
          callSid: CallSid,
          status: CallStatus,
          duration: CallDuration ? parseInt(CallDuration) : undefined,
        })
      }
    }

    res.sendStatus(200)
  })

  /**
   * Generate Twilio access token for user
   * Called by frontend when user logs in
   *
   * Endpoint: POST /api/v1/twilio/token
   * Called by: Frontend
   */
  generateToken: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { userId, extension } = req.body

    if (!userId || !extension) {
      res.status(400).json({ error: 'userId and extension are required' })
      return
    }

    console.log(`[Twilio] Generating access token for user ${userId} (ext: ${extension})`)

    // Generate token (expires in 1 hour)
    const token = this.twilioService.generateAccessToken(userId, extension)

    res.json({
      token,
      expiresIn: 3600, // 1 hour in seconds
    })
  })

  /**
   * Create a call history entry when PSTN call is answered
   *
   * Endpoint: POST /api/v1/twilio/call-history
   * Called by: Frontend (when call is answered)
   */
  createCallHistory: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { callId, twilioCallSid, userId, contactName, contactNumber, direction } = req.body

    console.log(`[Twilio] Creating call history for ${callId}`)

    // Get user to verify and get extension
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { extension: true },
    })

    if (!user?.extension) {
      res.status(404).json({ error: 'User not found or has no extension' })
      return
    }

    // Create call history entry
    const callHistory = await this.prisma.callHistory.create({
      data: {
        userId,
        contactName,
        contactExtension: contactNumber, // For PSTN, we store phone number here
        direction: direction || 'inbound',
        timestamp: new Date(),
        answered: true,
        callType: 'pstn_inbound',
        phoneNumber: contactNumber,
        twilioCallSid,
      },
    })

    res.json({
      success: true,
      data: callHistory,
    })
  })

  /**
   * Get Twilio call details
   * Useful for debugging or admin dashboard
   *
   * Endpoint: GET /api/v1/twilio/calls/:callSid
   */
  getCallDetails: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { callSid } = req.params

    try {
      const callDetails = await this.twilioService.getCallDetails(callSid)

      res.json({
        success: true,
        data: callDetails,
      })
    } catch (error) {
      console.error(`[Twilio] Error fetching call details:`, error)
      res.status(404).json({
        success: false,
        error: 'Call not found',
      })
    }
  })

  /**
   * End an active call programmatically
   *
   * Endpoint: POST /api/v1/twilio/calls/:callSid/end
   */
  endCall: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { callSid } = req.params

    try {
      await this.twilioService.endCall(callSid)

      res.json({
        success: true,
        message: 'Call ended successfully',
      })
    } catch (error) {
      console.error(`[Twilio] Error ending call:`, error)
      res.status(500).json({
        success: false,
        error: 'Failed to end call',
      })
    }
  })

  /**
   * Health check endpoint for Twilio webhooks
   * Useful for verifying webhook configuration
   *
   * Endpoint: GET /api/v1/twilio/health
   */
  healthCheck: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Twilio Integration',
    })
  })
}
