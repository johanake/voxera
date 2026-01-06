import { Router } from 'express'
import type { UserController } from '../controllers/userController.js'
import type { CallHistoryController } from '../controllers/callHistoryController.js'
import type { ChatController } from '../controllers/chatController.js'
import { createUserRoutes } from './userRoutes.js'
import { createCallHistoryRoutes } from './callHistoryRoutes.js'
import { createChatRoutes } from './chatRoutes.js'

export function createApiRoutes(
  userController: UserController,
  callHistoryController: CallHistoryController,
  chatController: ChatController
): Router {
  const router = Router()

  router.use('/users', createUserRoutes(userController))
  router.use('/call-history', createCallHistoryRoutes(callHistoryController))
  router.use('/chat', createChatRoutes(chatController))

  return router
}
