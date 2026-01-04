import type { Server, Socket } from 'socket.io'
import type { CallStorage } from '../services/callStorage.js'
import type { ChatStorage } from '../services/chatStorage.js'
import type {
  CallInitiatePayload,
  CallAnswerPayload,
  CallRejectPayload,
  CallEndPayload,
  WebRTCOfferPayload,
  WebRTCAnswerPayload,
  WebRTCIceCandidatePayload,
} from '@ucaas/shared'

export function setupSoftphoneHandlers(
  io: Server,
  callStorage: CallStorage,
  chatStorage: ChatStorage
) {
  io.on('connection', (socket: Socket) => {
    let currentUserId: string | null = null
    let currentExtension: string | null = null

    // Listen to user:register to capture extension
    socket.on(
      'user:register',
      ({ userId, extension }: { userId: string; extension?: string }) => {
        currentUserId = userId
        currentExtension = extension || null

        if (extension) {
          callStorage.registerExtension(userId, extension)
        }
      }
    )

    /**
     * CALL INITIATE
     * User dials an extension to start a call
     */
    socket.on('call:initiate', (payload: CallInitiatePayload) => {
      try {
        const { callId, fromUserId, fromExtension, fromName, toExtension } = payload

        console.log(`Call initiate: ${fromExtension} → ${toExtension}`)

        // Validate caller
        if (fromUserId !== currentUserId) {
          console.log("Validating caller failed. fromUserId:", fromUserId, "currentUserId:", currentUserId)
          socket.emit('call:failed', { reason: 'Unauthorized call attempt' })
          return
        }

        // Lookup recipient by extension
        const toUserId = callStorage.getUserByExtension(toExtension)
        if (!toUserId) {
          socket.emit('call:failed', { reason: `Extension ${toExtension} not found` })
          return
        }

        // Check if recipient is online
        const recipientSession = chatStorage.getUserSession(toUserId)
        if (!recipientSession) {
          socket.emit('call:failed', { reason: 'User is offline' })
          return
        }

        // Check if recipient is busy
        if (callStorage.isUserInCall(toUserId)) {
          socket.emit('call:failed', { reason: 'User is busy' })
          return
        }

        // Check if caller is already in a call
        if (callStorage.isUserInCall(fromUserId)) {
          socket.emit('call:failed', { reason: 'You are already in a call' })
          return
        }

        // Create call session
        callStorage.createCall(callId, fromUserId, fromExtension, toUserId, toExtension)

        // Notify recipient
        io.to(`user:${toUserId}`).emit('call:incoming', {
          callId,
          fromUserId,
          fromName,
          fromExtension,
        })

        // Notify caller that call is ringing
        socket.emit('call:ringing', { callId })
      } catch (error) {
        console.error('Error in call:initiate:', error)
        socket.emit('call:failed', { reason: 'Internal server error' })
      }
    })

    /**
     * CALL ANSWER
     * Recipient answers the incoming call
     */
    socket.on('call:answer', (payload: CallAnswerPayload) => {
      try {
        const { callId, fromUserId } = payload

        console.log(`Call answer: ${callId}`)

        // Get call session
        const call = callStorage.getCall(callId)
        if (!call) {
          socket.emit('error', { code: 'CALL_NOT_FOUND', message: 'Call does not exist' })
          return
        }

        // Validate that this is the recipient
        if (call.toUserId !== fromUserId) {
          socket.emit('error', {
            code: 'UNAUTHORIZED',
            message: 'You are not the recipient of this call',
          })
          return
        }

        // Validate call state
        if (call.state !== 'ringing') {
          socket.emit('error', {
            code: 'INVALID_STATE',
            message: `Cannot answer call in state: ${call.state}`,
          })
          return
        }

        // Update call state
        callStorage.updateCallState(callId, 'connecting')

        // Notify both parties
        io.to(`user:${call.fromUserId}`).emit('call:answered', { callId })
        io.to(`user:${call.toUserId}`).emit('call:answered', { callId })
      } catch (error) {
        console.error('Error in call:answer:', error)
        socket.emit('error', { code: 'SERVER_ERROR', message: 'Internal server error' })
      }
    })

    /**
     * CALL REJECT
     * Recipient rejects the incoming call
     */
    socket.on('call:reject', (payload: CallRejectPayload) => {
      try {
        const { callId, fromUserId, reason } = payload

        console.log(`Call reject: ${callId} - ${reason || 'No reason'}`)

        // Get call session
        const call = callStorage.getCall(callId)
        if (!call) {
          return // Call might have already ended
        }

        // Validate that this is the recipient
        if (call.toUserId !== fromUserId) {
          socket.emit('error', {
            code: 'UNAUTHORIZED',
            message: 'You are not the recipient of this call',
          })
          return
        }

        // Notify caller
        io.to(`user:${call.fromUserId}`).emit('call:rejected', { callId, reason })

        // End call session
        callStorage.endCall(callId)
      } catch (error) {
        console.error('Error in call:reject:', error)
      }
    })

    /**
     * CALL END
     * Either party ends the active call
     */
    socket.on('call:end', (payload: CallEndPayload) => {
      try {
        const { callId, fromUserId } = payload

        console.log(`Call end: ${callId}`)

        // Get call session
        const call = callStorage.getCall(callId)
        if (!call) {
          return // Call might have already ended
        }

        // Validate that user is part of the call
        if (call.fromUserId !== fromUserId && call.toUserId !== fromUserId) {
          socket.emit('error', {
            code: 'UNAUTHORIZED',
            message: 'You are not part of this call',
          })
          return
        }

        // Notify both parties
        io.to(`user:${call.fromUserId}`).emit('call:ended', { callId })
        io.to(`user:${call.toUserId}`).emit('call:ended', { callId })

        // End call session
        callStorage.endCall(callId)
      } catch (error) {
        console.error('Error in call:end:', error)
      }
    })

    /**
     * WEBRTC OFFER
     * Forward SDP offer from caller to recipient
     */
    socket.on('webrtc:offer', (payload: WebRTCOfferPayload) => {
      try {
        const { callId, fromUserId, offer } = payload

        console.log(`WebRTC offer for call: ${callId}`)

        // Get call session
        const call = callStorage.getCall(callId)
        if (!call) {
          socket.emit('error', { code: 'CALL_NOT_FOUND', message: 'Call does not exist' })
          return
        }

        // Validate sender is the caller
        if (call.fromUserId !== fromUserId) {
          socket.emit('error', {
            code: 'UNAUTHORIZED',
            message: 'Only caller can send offer',
          })
          return
        }

        // Forward offer to recipient
        io.to(`user:${call.toUserId}`).emit('webrtc:offer', { callId, offer })
      } catch (error) {
        console.error('Error in webrtc:offer:', error)
        socket.emit('error', { code: 'SERVER_ERROR', message: 'Failed to forward offer' })
      }
    })

    /**
     * WEBRTC ANSWER
     * Forward SDP answer from recipient to caller
     */
    socket.on('webrtc:answer', (payload: WebRTCAnswerPayload) => {
      try {
        const { callId, fromUserId, answer } = payload

        console.log(`WebRTC answer for call: ${callId}`)

        // Get call session
        const call = callStorage.getCall(callId)
        if (!call) {
          socket.emit('error', { code: 'CALL_NOT_FOUND', message: 'Call does not exist' })
          return
        }

        // Validate sender is the recipient
        if (call.toUserId !== fromUserId) {
          socket.emit('error', {
            code: 'UNAUTHORIZED',
            message: 'Only recipient can send answer',
          })
          return
        }

        // Update call state to connected
        callStorage.updateCallState(callId, 'connecting')

        // Forward answer to caller
        io.to(`user:${call.fromUserId}`).emit('webrtc:answer', { callId, answer })
      } catch (error) {
        console.error('Error in webrtc:answer:', error)
        socket.emit('error', { code: 'SERVER_ERROR', message: 'Failed to forward answer' })
      }
    })

    /**
     * WEBRTC ICE CANDIDATE
     * Forward ICE candidates bidirectionally
     */
    socket.on('webrtc:ice-candidate', (payload: WebRTCIceCandidatePayload) => {
      try {
        const { callId, fromUserId, candidate } = payload

        // Get call session
        const call = callStorage.getCall(callId)
        if (!call) {
          // Call might have ended, silently ignore
          return
        }

        // Determine other party
        let otherUserId: string
        if (call.fromUserId === fromUserId) {
          otherUserId = call.toUserId
        } else if (call.toUserId === fromUserId) {
          otherUserId = call.fromUserId
        } else {
          socket.emit('error', {
            code: 'UNAUTHORIZED',
            message: 'You are not part of this call',
          })
          return
        }

        // Forward ICE candidate to other party
        io.to(`user:${otherUserId}`).emit('webrtc:ice-candidate', { callId, candidate })
      } catch (error) {
        console.error('Error in webrtc:ice-candidate:', error)
      }
    })

    /**
     * DISCONNECT
     * Handle user disconnect - end any active calls
     */
    socket.on('disconnect', () => {
      if (currentUserId) {
        // Check for active call
        const activeCall = callStorage.getUserActiveCall(currentUserId)
        if (activeCall) {
          console.log(`User ${currentUserId} disconnected during call ${activeCall.callId}`)

          // Determine other party
          const otherUserId =
            activeCall.fromUserId === currentUserId
              ? activeCall.toUserId
              : activeCall.fromUserId

          // Notify other party
          io.to(`user:${otherUserId}`).emit('call:ended', { callId: activeCall.callId })

          // End call session
          callStorage.endCall(activeCall.callId)
        }

        // Unregister extension
        if (currentExtension) {
          callStorage.unregisterExtension(currentUserId)
        }
      }
    })
  })

  console.log('Softphone handlers initialized')
}
