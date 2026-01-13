import type { Server, Socket } from 'socket.io'
import { ChatGroupService } from '../services/chatGroupService.js'

export function setupChatGroupHandlers(io: Server, chatGroupService: ChatGroupService) {
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId

    if (!userId) {
      console.log('Socket connected without userId, skipping chat group handlers')
      return
    }

    // Join user to all their chat group rooms
    chatGroupService.getUserChatGroups(userId).then((groups) => {
      groups.forEach((group) => {
        socket.join(`chatgroup:${group.id}`)
        console.log(`User ${userId} joined chat group room: ${group.id}`)
      })
    }).catch((err) => {
      console.error('Error loading user chat groups:', err)
    })

    /**
     * Create a new chat group
     */
    socket.on('chatgroup:create', async ({ name, memberIds }: { name: string; memberIds: string[] }) => {
      try {
        const group = await chatGroupService.createChatGroup(name, userId, memberIds)

        // Join creator to the chat group room
        socket.join(`chatgroup:${group.id}`)

        // Notify all members about the new chat group
        io.to(`chatgroup:${group.id}`).emit('chatgroup:created', group)

        // Join other members to the chat group room
        const memberSockets = await io.fetchSockets()
        memberSockets.forEach((memberSocket) => {
          if (memberIds.includes(memberSocket.data.userId)) {
            memberSocket.join(`chatgroup:${group.id}`)
          }
        })

        console.log(`Chat group created: ${group.id} by user ${userId}`)
      } catch (error: any) {
        socket.emit('error', {
          code: 'CHATGROUP_CREATE_FAILED',
          message: error.message || 'Failed to create chat group',
        })
      }
    })

    /**
     * Send a message to a chat group
     */
    socket.on('chatgroup:message:send', async ({ chatGroupId, content }: { chatGroupId: string; content: string }) => {
      try {
        const message = await chatGroupService.sendMessage(chatGroupId, userId, content)

        // Broadcast message to all members in the chat group
        io.to(`chatgroup:${chatGroupId}`).emit('chatgroup:message:receive', message)

        console.log(`Message sent to chat group ${chatGroupId} by user ${userId}`)
      } catch (error: any) {
        socket.emit('error', {
          code: 'CHATGROUP_MESSAGE_SEND_FAILED',
          message: error.message || 'Failed to send message',
        })
      }
    })

    /**
     * Mark chat group messages as read
     */
    socket.on('chatgroup:messages:read', async ({ chatGroupId, upToMessageId }: { chatGroupId: string; upToMessageId: string }) => {
      try {
        await chatGroupService.markMessagesAsRead(chatGroupId, userId, upToMessageId)

        // Notify other members that user has read messages
        socket.to(`chatgroup:${chatGroupId}`).emit('chatgroup:messages:read', {
          chatGroupId,
          userId,
          upToMessageId,
        })

        console.log(`User ${userId} marked messages as read in chat group ${chatGroupId}`)
      } catch (error: any) {
        console.error('Error marking chat group messages as read:', error)
      }
    })

    /**
     * Load chat group message history
     */
    socket.on('chatgroup:messages:load', async ({ chatGroupId, limit, before }: { chatGroupId: string; limit?: number; before?: string }) => {
      try {
        const result = await chatGroupService.getChatGroupMessages(chatGroupId, userId, limit, before)

        socket.emit('chatgroup:messages:loaded', {
          chatGroupId,
          messages: result.messages,
          hasMore: result.hasMore,
        })

        console.log(`Loaded ${result.messages.length} messages for chat group ${chatGroupId}`)
      } catch (error: any) {
        socket.emit('error', {
          code: 'CHATGROUP_MESSAGES_LOAD_FAILED',
          message: error.message || 'Failed to load messages',
        })
      }
    })

    /**
     * Update chat group name (admin only)
     */
    socket.on('chatgroup:update:name', async ({ chatGroupId, name }: { chatGroupId: string; name: string }) => {
      try {
        const group = await chatGroupService.updateChatGroupName(chatGroupId, name, userId)

        // Notify all members about the name change
        io.to(`chatgroup:${chatGroupId}`).emit('chatgroup:updated', group)

        console.log(`Chat group ${chatGroupId} name updated to "${name}" by user ${userId}`)
      } catch (error: any) {
        socket.emit('error', {
          code: 'CHATGROUP_UPDATE_FAILED',
          message: error.message || 'Failed to update chat group',
        })
      }
    })

    /**
     * Add member to chat group (admin only)
     */
    socket.on('chatgroup:member:add', async ({ chatGroupId, newUserId }: { chatGroupId: string; newUserId: string }) => {
      try {
        const member = await chatGroupService.addMember(chatGroupId, newUserId, userId)

        // Add new member to the chat group room
        const memberSockets = await io.fetchSockets()
        const newMemberSocket = memberSockets.find((s) => s.data.userId === newUserId)
        if (newMemberSocket) {
          newMemberSocket.join(`chatgroup:${chatGroupId}`)
        }

        // Notify all members (including new member) about the addition
        io.to(`chatgroup:${chatGroupId}`).emit('chatgroup:member:added', {
          chatGroupId,
          member,
        })

        console.log(`User ${newUserId} added to chat group ${chatGroupId} by admin ${userId}`)
      } catch (error: any) {
        socket.emit('error', {
          code: 'CHATGROUP_ADD_MEMBER_FAILED',
          message: error.message || 'Failed to add member',
        })
      }
    })

    /**
     * Remove member from chat group (admin only)
     */
    socket.on('chatgroup:member:remove', async ({ chatGroupId, removeUserId }: { chatGroupId: string; removeUserId: string }) => {
      try {
        await chatGroupService.removeMember(chatGroupId, removeUserId, userId)

        // Notify all members about the removal
        io.to(`chatgroup:${chatGroupId}`).emit('chatgroup:member:removed', {
          chatGroupId,
          userId: removeUserId,
        })

        // Remove the user from the chat group room
        const memberSockets = await io.fetchSockets()
        const removedMemberSocket = memberSockets.find((s) => s.data.userId === removeUserId)
        if (removedMemberSocket) {
          removedMemberSocket.leave(`chatgroup:${chatGroupId}`)
        }

        console.log(`User ${removeUserId} removed from chat group ${chatGroupId} by admin ${userId}`)
      } catch (error: any) {
        socket.emit('error', {
          code: 'CHATGROUP_REMOVE_MEMBER_FAILED',
          message: error.message || 'Failed to remove member',
        })
      }
    })

    /**
     * Leave chat group
     */
    socket.on('chatgroup:leave', async ({ chatGroupId }: { chatGroupId: string }) => {
      try {
        await chatGroupService.leaveChatGroup(chatGroupId, userId)

        // Notify other members that user left
        socket.to(`chatgroup:${chatGroupId}`).emit('chatgroup:member:left', {
          chatGroupId,
          userId,
        })

        // Leave the chat group room
        socket.leave(`chatgroup:${chatGroupId}`)

        // Notify the leaving user
        socket.emit('chatgroup:left', { chatGroupId })

        console.log(`User ${userId} left chat group ${chatGroupId}`)
      } catch (error: any) {
        socket.emit('error', {
          code: 'CHATGROUP_LEAVE_FAILED',
          message: error.message || 'Failed to leave chat group',
        })
      }
    })

    /**
     * Delete chat group (admin only)
     */
    socket.on('chatgroup:delete', async ({ chatGroupId }: { chatGroupId: string }) => {
      try {
        await chatGroupService.deleteChatGroup(chatGroupId, userId)

        // Notify all members that chat group was deleted
        io.to(`chatgroup:${chatGroupId}`).emit('chatgroup:deleted', { chatGroupId })

        // Remove all members from the chat group room
        const sockets = await io.in(`chatgroup:${chatGroupId}`).fetchSockets()
        sockets.forEach((s) => {
          s.leave(`chatgroup:${chatGroupId}`)
        })

        console.log(`Chat group ${chatGroupId} deleted by admin ${userId}`)
      } catch (error: any) {
        socket.emit('error', {
          code: 'CHATGROUP_DELETE_FAILED',
          message: error.message || 'Failed to delete chat group',
        })
      }
    })
  })
}
