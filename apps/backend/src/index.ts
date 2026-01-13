import express, { Request, Response } from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { API_VERSION, type ApiResponse, type TwilioConfig } from '@ucaas/shared'
import { prisma, disconnectDatabase } from './config/database.js'
import { UserRepository } from './db/repositories/userRepository.js'
import { ChatRepository } from './db/repositories/chatRepository.js'
import { CallHistoryRepository } from './db/repositories/callHistoryRepository.js'
import { ReactionRepository } from './db/repositories/reactionRepository.js'
import { ChatGroupRepository } from './db/repositories/chatGroupRepository.js'
import { ChatGroupMessageRepository } from './db/repositories/chatGroupMessageRepository.js'
import { UserService } from './services/userService.js'
import { ChatStorage } from './services/chatStorage.js'
import { ChatService } from './services/chatService.js'
import { ReactionService } from './services/reactionService.js'
import { ChatGroupService } from './services/chatGroupService.js'
import { CallStorage } from './services/callStorage.js'
import { CallHistoryService } from './services/callHistoryService.js'
import { TwilioService } from './services/twilioService.js'
import { RoutingService } from './services/routingService.js'
import { UserController } from './controllers/userController.js'
import { CallHistoryController } from './controllers/callHistoryController.js'
import { ChatController } from './controllers/chatController.js'
import { TwilioController } from './controllers/TwilioController.js'
import { createApiRoutes } from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import { setupChatHandlers } from './socket/chatHandler.js'
import { setupSoftphoneHandlers } from './socket/softphoneHandler.js'
import { setupChatGroupHandlers } from './socket/chatGroupHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Allowed origins for CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3001',
  process.env.UCAAS_CLIENT_URL || 'http://localhost:3002',
]

// Middleware (must be before routes)
app.use(helmet())
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // Parse form data for Twilio webhooks
app.use(morgan('dev'))

// Create HTTP server
const httpServer = createServer(app)

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
})

// Initialize repositories
const userRepository = new UserRepository(prisma)
const chatRepository = new ChatRepository(prisma)
const callHistoryRepository = new CallHistoryRepository(prisma)
const reactionRepository = new ReactionRepository(prisma)
const chatGroupRepository = new ChatGroupRepository(prisma)
const chatGroupMessageRepository = new ChatGroupMessageRepository(prisma)

// Initialize services
const userService = new UserService(userRepository)
const callHistoryService = new CallHistoryService(callHistoryRepository)
const reactionService = new ReactionService(reactionRepository)
const chatGroupService = new ChatGroupService(chatGroupRepository, chatGroupMessageRepository)

// Initialize storage services (in-memory)
const chatStorage = new ChatStorage()
const callStorage = new CallStorage()

// Initialize hybrid chat service
const chatService = new ChatService(chatStorage, chatRepository)

// Initialize Twilio configuration
const twilioConfig: TwilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  apiKey: process.env.TWILIO_API_KEY || '',
  apiSecret: process.env.TWILIO_API_SECRET || '',
  twimlAppSid: process.env.TWILIO_TWIML_APP_SID || '',
}

// Initialize Twilio services
const twilioService = new TwilioService(twilioConfig)
const routingService = new RoutingService(prisma)

// Initialize controllers
const userController = new UserController(userService)
const callHistoryController = new CallHistoryController(callHistoryService)
const chatController = new ChatController(chatService)
const twilioController = new TwilioController(
  twilioService,
  routingService,
  callStorage,
  chatStorage,
  io,
  prisma
)

// Mount API routes
const apiRoutes = createApiRoutes(
  userController,
  callHistoryController,
  chatController,
  twilioController
)
app.use('/api/v1', apiRoutes)

// Initialize socket handlers
setupChatHandlers(io, chatService, reactionService)
setupSoftphoneHandlers(io, callStorage, chatStorage)
setupChatGroupHandlers(io, chatGroupService)

// Health check route
app.get('/api/health', (_req: Request, res: Response<ApiResponse<{ status: string; version: string }>>) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: API_VERSION,
    },
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Socket.io server initialized`)
  console.log(`API routes mounted at /api/v1`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...')
  await disconnectDatabase()
  httpServer.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
