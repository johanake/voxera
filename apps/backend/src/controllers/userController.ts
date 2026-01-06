import asyncHandler from 'express-async-handler'
import type { Request, Response, RequestHandler } from 'express'
import type { ApiResponse, User } from '@ucaas/shared'
import type { UserService } from '../services/userService.js'
import type { User as PrismaUser } from '@prisma/client'

export class UserController {
  constructor(private userService: UserService) {}

  list: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, pageSize = 20, search, status, role } = req.query

    const result = await this.userService.list(
      {
        customerId: 'cust-1', // TODO: Extract from auth token
        search: search as string,
        status: status ? (Array.isArray(status) ? (status as string[]) : [status as string]) : undefined,
        role: role ? (Array.isArray(role) ? (role as string[]) : [role as string]) : undefined,
      },
      {
        page: Number(page),
        pageSize: Number(pageSize),
      }
    )

    res.json(result)
  })

  getById: RequestHandler = asyncHandler(async (req: Request, res: Response<ApiResponse<User>>) => {
    const user = await this.userService.getById(req.params.id)
    res.json({ success: true, data: user as any as User })
  })

  create: RequestHandler = asyncHandler(async (req: Request, res: Response<ApiResponse<User>>) => {
    const user = await this.userService.create({
      ...req.body,
      customerId: 'cust-1', // TODO: Extract from auth token
      createdBy: 'system', // TODO: Extract from auth token
    })
    res.status(201).json({ success: true, data: user as any as User })
  })

  update: RequestHandler = asyncHandler(async (req: Request, res: Response<ApiResponse<User>>) => {
    const user = await this.userService.update(req.params.id, req.body)
    res.json({ success: true, data: user as any as User })
  })

  delete: RequestHandler = asyncHandler(async (req: Request, res: Response<ApiResponse<User>>) => {
    const user = await this.userService.delete(
      req.params.id,
      'system' // TODO: Extract from auth token
    )
    res.json({ success: true, data: user as any as User })
  })

  updateStatus: RequestHandler = asyncHandler(async (req: Request, res: Response<ApiResponse<User>>) => {
    const { status } = req.body
    const user = await this.userService.updateStatus(req.params.id, status)
    res.json({ success: true, data: user as any as User })
  })
}
