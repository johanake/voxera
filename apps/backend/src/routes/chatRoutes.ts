import { Router } from 'express'
import type { ChatController } from '../controllers/chatController.js'

export function createChatRoutes(controller: ChatController): Router {
  const router = Router()

  router.get('/conversations/:contactId/messages', controller.getConversation)
  router.patch('/conversations/:contactId/read', controller.markAsRead)

  return router
}
