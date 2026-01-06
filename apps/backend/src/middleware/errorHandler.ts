import type { Request, Response, NextFunction } from 'express'
import type { ErrorResponse } from '@ucaas/shared'

export function errorHandler(
  err: any,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) {
  console.error('Error:', err)

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Resource already exists',
          details: { field: err.meta?.target },
        },
      })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Resource not found' },
      })
    }
  }

  // Custom application errors
  if (err.message === 'User not found') {
    return res.status(404).json({
      error: { code: 'USER_NOT_FOUND', message: err.message },
    })
  }

  if (err.message === 'Email already exists') {
    return res.status(409).json({
      error: { code: 'EMAIL_EXISTS', message: err.message },
    })
  }

  // Default error
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  })
}
