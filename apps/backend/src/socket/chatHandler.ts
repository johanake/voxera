import type { Server, Socket } from 'socket.io'
import type { StoredMessage } from '../services/chatStorage.js'
import type { ChatService } from '../services/chatService.js'
import type { ReactionService } from '../services/reactionService.js'

// Utility function to generate unique IDs
function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function setupChatHandlers(io: Server, chatService: ChatService, reactionService: ReactionService) {
  io.on('connection', (socket: Socket) => {
    let currentUserId: string | null = null

    console.log(`Socket connected: ${socket.id}`)

    // User registration
    socket.on('user:register', ({ userId, extension, status }: { userId: string; extension?: string; status: 'online' | 'away' | 'busy' }) => {
      try {
        currentUserId = userId

        // Join user's personal room
        socket.join(`user:${userId}`)

        // Store session
        chatService.addUserSession(userId, socket.id, status)

        console.log(`User registered: ${userId} (extension: ${extension || 'none'}, status: ${status})`)

        // Broadcast to all other users that this user is online
        socket.broadcast.emit('user:online', { userId, status })

        // Send current online users to the newly connected user
        const onlineUsers = chatService.getOnlineUsers()
        socket.emit('users:online', { userIds: onlineUsers })
      } catch (error) {
        console.error('Error in user:register:', error)
        socket.emit('error', { code: 'REGISTRATION_FAILED', message: 'Failed to register user' })
      }
    })

    // Send message
    socket.on('message:send', async ({ toUserId, content }: { toUserId: string; content: string }) => {
      try {
        if (!currentUserId) {
          socket.emit('error', { code: 'NOT_AUTHENTICATED', message: 'User not registered' })
          return
        }

        // Validate message
        if (!content || content.trim().length === 0) {
          socket.emit('error', { code: 'INVALID_MESSAGE', message: 'Message cannot be empty' })
          return
        }

        if (content.length > 5000) {
          socket.emit('error', { code: 'MESSAGE_TOO_LONG', message: 'Message exceeds 5000 characters' })
          return
        }

        const message: StoredMessage = {
          id: generateId(),
          fromUserId: currentUserId,
          toUserId,
          content: content.trim(),
          timestamp: new Date(),
          read: false,
        }

        // Save message to storage and database
        await chatService.saveMessage(message)

        console.log(`Message from ${currentUserId} to ${toUserId}: "${content.substring(0, 50)}..."`)

        // Send to recipient's room
        io.to(`user:${toUserId}`).emit('message:receive', message)

        // Confirm to sender
        socket.emit('message:sent', message)
      } catch (error) {
        console.error('Error in message:send:', error)
        socket.emit('error', { code: 'MESSAGE_SEND_FAILED', message: 'Failed to send message' })
      }
    })

    // Mark messages as read
    socket.on('message:read', async ({ fromUserId }: { fromUserId: string }) => {
      try {
        if (!currentUserId) {
          return
        }

        await chatService.markAsRead(fromUserId, currentUserId)

        console.log(`Messages from ${fromUserId} to ${currentUserId} marked as read`)

        // Notify sender that messages were read
        io.to(`user:${fromUserId}`).emit('messages:read', { byUserId: currentUserId })
      } catch (error) {
        console.error('Error in message:read:', error)
      }
    })

    // Typing indicators
    socket.on('typing:start', ({ toUserId }: { toUserId: string }) => {
      try {
        if (!currentUserId) {
          return
        }

        io.to(`user:${toUserId}`).emit('typing:indication', {
          fromUserId: currentUserId,
          isTyping: true,
        })
      } catch (error) {
        console.error('Error in typing:start:', error)
      }
    })

    socket.on('typing:stop', ({ toUserId }: { toUserId: string }) => {
      try {
        if (!currentUserId) {
          return
        }

        io.to(`user:${toUserId}`).emit('typing:indication', {
          fromUserId: currentUserId,
          isTyping: false,
        })
      } catch (error) {
        console.error('Error in typing:stop:', error)
      }
    })

    // User status change
    socket.on('user:status_change', ({ status }: { status: 'online' | 'away' | 'busy' }) => {
      try {
        if (!currentUserId) {
          return
        }

        chatService.updateUserStatus(currentUserId, status)

        console.log(`User ${currentUserId} changed status to ${status}`)

        // Broadcast status change to all users
        socket.broadcast.emit('user:status_changed', { userId: currentUserId, status })
      } catch (error) {
        console.error('Error in user:status_change:', error)
      }
    })

    // Get conversation history
    socket.on('conversation:load', async ({ withUserId, limit }: { withUserId: string; limit?: number }) => {
      try {
        if (!currentUserId) {
          socket.emit('error', { code: 'NOT_AUTHENTICATED', message: 'User not registered' })
          return
        }

        const messages = await chatService.getConversation(currentUserId, withUserId, limit || 100)

        socket.emit('conversation:loaded', { withUserId, messages })
      } catch (error) {
        console.error('Error in conversation:load:', error)
        socket.emit('error', { code: 'LOAD_FAILED', message: 'Failed to load conversation' })
      }
    })

    // Toggle reaction on message
    socket.on('reaction:toggle', async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      try {
        if (!currentUserId) {
          socket.emit('error', { code: 'NOT_AUTHENTICATED', message: 'User not registered' })
          return
        }

        // Toggle the reaction
        const result = await reactionService.toggleReaction(messageId, currentUserId, emoji)

        // Get updated reactions for this message
        const reactions = await reactionService.getReactions(messageId)

        // Fetch the message to get participants
        const message = await chatService.getMessage(messageId)
        if (!message) {
          socket.emit('error', { code: 'MESSAGE_NOT_FOUND', message: 'Message not found' })
          return
        }

        console.log(`Reaction ${result.action} by ${currentUserId} on message ${messageId}: ${emoji}`)

        // Broadcast to both participants in the conversation
        const participants = [message.fromUserId, message.toUserId]

        participants.forEach((userId) => {
          io.to(`user:${userId}`).emit('reaction:updated', {
            messageId,
            reactions,
            action: result.action,
            userId: currentUserId,
            emoji,
          })
        })
      } catch (error) {
        console.error('Error in reaction:toggle:', error)
        socket.emit('error', {
          code: 'REACTION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to toggle reaction',
        })
      }
    })

    // Disconnect
    socket.on('disconnect', () => {
      try {
        if (currentUserId) {
          chatService.removeUserSession(socket.id)
          console.log(`User disconnected: ${currentUserId}`)

          // Broadcast to all users that this user is offline
          socket.broadcast.emit('user:offline', { userId: currentUserId })
        } else {
          console.log(`Socket disconnected: ${socket.id} (no user registered)`)
        }
      } catch (error) {
        console.error('Error in disconnect:', error)
      }
    })
  })

  console.log('Socket.io chat handlers initialized')
}
