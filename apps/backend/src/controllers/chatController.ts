import asyncHandler from 'express-async-handler'
import type { Request, Response, RequestHandler } from 'express'
import type { ApiResponse } from '@ucaas/shared'
import type { ChatService } from '../services/chatService.js'
import type { ChatMessage } from '@prisma/client'

export class ChatController {
  constructor(private chatService: ChatService) {}

  /**
   * GET /api/v1/chat/conversations/:contactId/messages
   * Fetch conversation history between current user and a contact
   */
  getConversation: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { contactId } = req.params
    const { limit = 100, currentUserId } = req.query

    if (!currentUserId) {
      res.status(400).json({ success: false, message: 'currentUserId is required' })
      return
    }

    const messages = await this.chatService.getConversation(
      currentUserId as string,
      contactId,
      Number(limit)
    )

    res.json({ success: true, data: messages })
  })

  /**
   * PATCH /api/v1/chat/conversations/:contactId/read
   * Mark messages from a contact as read
   */
  markAsRead: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { contactId } = req.params
    const { currentUserId } = req.body

    if (!currentUserId) {
      res.status(400).json({ success: false, message: 'currentUserId is required' })
      return
    }

    // Mark messages FROM contactId TO currentUserId as read
    await this.chatService.markAsRead(contactId, currentUserId as string)

    res.json({ success: true, message: 'Messages marked as read' })
  })
}
