import { Router } from 'express'
import type { UserController } from '../controllers/userController.js'
import { createUserRoutes } from './userRoutes.js'

export function createApiRoutes(userController: UserController): Router {
  const router = Router()

  router.use('/users', createUserRoutes(userController))

  return router
}
