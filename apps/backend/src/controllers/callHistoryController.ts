import asyncHandler from 'express-async-handler'
import type { Request, Response, RequestHandler } from 'express'
import type { ApiResponse } from '@ucaas/shared'
import type { CallHistoryService } from '../services/callHistoryService.js'
import type { CallHistory } from '@prisma/client'

export class CallHistoryController {
  constructor(private callHistoryService: CallHistoryService) {}

  list: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, pageSize = 50, userId } = req.query

    const result = await this.callHistoryService.list(
      {
        userId: userId as string | undefined,
      },
      {
        page: Number(page),
        pageSize: Number(pageSize),
      }
    )

    res.json(result)
  })

  getById: RequestHandler = asyncHandler(
    async (req: Request, res: Response<ApiResponse<CallHistory>>) => {
      const entry = await this.callHistoryService.getById(req.params.id)
      res.json({ success: true, data: entry })
    }
  )

  create: RequestHandler = asyncHandler(
    async (req: Request, res: Response<ApiResponse<CallHistory>>) => {
      const entry = await this.callHistoryService.create(req.body)
      res.status(201).json({ success: true, data: entry })
    }
  )
}
