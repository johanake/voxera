import { Router } from 'express'
import type { UserController } from '../controllers/userController.js'
import { validate } from '../middleware/validation.js'
import { createUserSchema, updateUserSchema } from '@ucaas/shared'

export function createUserRoutes(controller: UserController): Router {
  const router = Router()

  router.get('/', controller.list)
  router.get('/:id', controller.getById)
  router.post('/', validate(createUserSchema), controller.create)
  router.put('/:id', validate(updateUserSchema), controller.update)
  router.delete('/:id', controller.delete)
  router.patch('/:id/status', controller.updateStatus)

  return router
}
