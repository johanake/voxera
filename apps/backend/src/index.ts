import express, { Request, Response } from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { API_VERSION, type ApiResponse } from '@ucaas/shared'
import { ChatStorage } from './services/chatStorage.js'
import { CallStorage } from './services/callStorage.js'
import { setupChatHandlers } from './socket/chatHandler.js'
import { setupSoftphoneHandlers } from './socket/softphoneHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Create HTTP server
const httpServer = createServer(app)

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3002',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
})

// Initialize chat storage and handlers
const chatStorage = new ChatStorage()
setupChatHandlers(io, chatStorage)

// Initialize call storage and softphone handlers
const callStorage = new CallStorage()
setupSoftphoneHandlers(io, callStorage, chatStorage)

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
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Socket.io server initialized`)
})
