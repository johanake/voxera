import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { API_VERSION, type ApiResponse } from '@ucaas/shared'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.get('/api/health', (_req: Request, res: Response<ApiResponse<{ status: string; version: string }>>) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: API_VERSION,
    },
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
