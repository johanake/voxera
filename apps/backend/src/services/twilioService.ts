import twilio from 'twilio'
import type { TwilioConfig } from '@ucaas/shared'

const { Twilio, jwt } = twilio

export class TwilioService {
  private client: twilio.Twilio
  private config: TwilioConfig

  constructor(config: TwilioConfig) {
    this.config = config
    this.client = new Twilio(config.accountSid, config.authToken)
  }

  /**
   * Generate Twilio Access Token for browser Twilio Device SDK
   * Token expires after 1 hour
   */
  generateAccessToken(userId: string, extension: string): string {
    const AccessToken = jwt.AccessToken
    const VoiceGrant = AccessToken.VoiceGrant

    // Create access token with identity
    const token = new AccessToken(
      this.config.accountSid,
      this.config.apiKey,
      this.config.apiSecret,
      {
        identity: `user_${userId}`,
        ttl: 3600, // 1 hour
      }
    )

    // Create Voice grant
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: this.config.twimlAppSid,
      incomingAllow: true,
    })

    token.addGrant(voiceGrant)

    return token.toJwt()
  }

  /**
   * Generate TwiML to dial a user's browser via Twilio Client
   */
  generateDialClientTwiML(userId: string, extension: string, callId: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="30" record="record-from-answer">
    <Client>
      <Identity>user_${userId}</Identity>
      <Parameter name="callId" value="${callId}" />
      <Parameter name="extension" value="${extension}" />
    </Client>
  </Dial>
</Response>`
  }

  /**
   * Generate TwiML for busy/unavailable message
   */
  generateBusyTwiML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">The person you are calling is currently unavailable. Please try again later.</Say>
  <Hangup/>
</Response>`
  }

  /**
   * Generate TwiML for voicemail (future enhancement)
   */
  generateVoicemailTwiML(greetingText?: string): string {
    const greeting = greetingText || 'Please leave a message after the tone.'

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${greeting}</Say>
  <Record maxLength="180" playBeep="true" />
  <Say voice="alice">Thank you for your message. Goodbye.</Say>
  <Hangup/>
</Response>`
  }

  /**
   * Get call details from Twilio API
   */
  async getCallDetails(callSid: string) {
    try {
      return await this.client.calls(callSid).fetch()
    } catch (error) {
      console.error(`Error fetching call details for ${callSid}:`, error)
      throw error
    }
  }

  /**
   * Update an active call (modify, redirect, etc.)
   */
  async updateCall(callSid: string, updates: Record<string, any>) {
    try {
      return await this.client.calls(callSid).update(updates)
    } catch (error) {
      console.error(`Error updating call ${callSid}:`, error)
      throw error
    }
  }

  /**
   * End an active call
   */
  async endCall(callSid: string): Promise<void> {
    try {
      await this.client.calls(callSid).update({ status: 'completed' })
    } catch (error) {
      console.error(`Error ending call ${callSid}:`, error)
      throw error
    }
  }

  /**
   * Validate Twilio webhook signature (for production security)
   */
  validateWebhookSignature(
    authToken: string,
    signature: string,
    url: string,
    params: Record<string, any>
  ): boolean {
    return twilio.validateRequest(authToken, signature, url, params)
  }
}
