import { Router } from 'express'
import type { CallHistoryController } from '../controllers/callHistoryController.js'

export function createCallHistoryRoutes(controller: CallHistoryController): Router {
  const router = Router()

  router.get('/', controller.list)
  router.get('/:id', controller.getById)
  router.post('/', controller.create)

  return router
}
