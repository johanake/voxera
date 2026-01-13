import type { ChatStorage, StoredMessage } from './chatStorage.js'
import type { ChatRepository } from '../db/repositories/chatRepository.js'

export class ChatService {
  constructor(
    private chatStorage: ChatStorage,
    private chatRepository: ChatRepository
  ) {}

  async saveMessage(message: StoredMessage): Promise<void> {
    // Save to in-memory cache for fast access during active session
    this.chatStorage.saveMessage(message)

    // Persist to database asynchronously
    await this.chatRepository.create({
      id: message.id,
      fromUserId: message.fromUserId,
      toUserId: message.toUserId,
      content: message.content,
      timestamp: message.timestamp,
      read: message.read,
    })
  }

  async getConversation(userId1: string, userId2: string, limit = 100): Promise<StoredMessage[]> {
    // Load from database (source of truth)
    return this.chatRepository.getConversation(userId1, userId2, limit)
  }

  async getMessage(messageId: string) {
    return this.chatRepository.getById(messageId)
  }

  async markAsRead(fromUserId: string, toUserId: string): Promise<void> {
    // Update in database
    await this.chatRepository.markAsRead(fromUserId, toUserId)

    // Update in-memory cache
    this.chatStorage.markAsRead(fromUserId, toUserId)
  }

  async getUnreadCount(toUserId: string, fromUserId: string): Promise<number> {
    return this.chatRepository.getUnreadCount(toUserId, fromUserId)
  }

  // Delegate session management to ChatStorage (in-memory only)
  addUserSession(userId: string, socketId: string, status: 'online' | 'away' | 'busy') {
    this.chatStorage.addUserSession(userId, socketId, status)
  }

  removeUserSession(socketId: string) {
    this.chatStorage.removeUserSession(socketId)
  }

  getUserSession(userId: string) {
    return this.chatStorage.getUserSession(userId)
  }

  getOnlineUsers() {
    return this.chatStorage.getOnlineUsers()
  }

  updateUserStatus(userId: string, status: 'online' | 'away' | 'busy') {
    this.chatStorage.updateUserStatus(userId, status)
  }
}
