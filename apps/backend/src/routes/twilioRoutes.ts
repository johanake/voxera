import { Router } from 'express'
import type { TwilioController } from '../controllers/TwilioController.js'

export function createTwilioRoutes(twilioController: TwilioController): Router {
  const router = Router()

  // Webhook endpoints (called by Twilio)
  router.post('/voice/incoming', twilioController.handleIncomingCall)
  router.post('/voice/status', twilioController.handleStatusCallback)

  // Token generation (called by frontend)
  router.post('/token', twilioController.generateToken)

  // Call management
  router.post('/call-history', twilioController.createCallHistory)
  router.get('/calls/:callSid', twilioController.getCallDetails)
  router.post('/calls/:callSid/end', twilioController.endCall)

  // Health check
  router.get('/health', twilioController.healthCheck)

  return router
}
