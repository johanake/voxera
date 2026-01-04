export interface StoredMessage {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  timestamp: Date
  read: boolean
}

export interface UserSession {
  userId: string
  socketId: string
  connectedAt: Date
  status: 'online' | 'away' | 'busy'
}

export class ChatStorage {
  // Map<conversationKey, messages[]>
  private messages: Map<string, StoredMessage[]> = new Map()

  // Map<socketId, UserSession>
  private userSessions: Map<string, UserSession> = new Map()

  // Map<userId, socketId> for quick lookup
  private userToSocket: Map<string, string> = new Map()

  /**
   * Get normalized conversation key for two users
   * Always sorts user IDs to ensure same key regardless of order
   */
  private getConversationKey(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join(':')
  }

  /**
   * Save a message to storage
   */
  saveMessage(message: StoredMessage): void {
    const key = this.getConversationKey(message.fromUserId, message.toUserId)

    if (!this.messages.has(key)) {
      this.messages.set(key, [])
    }

    this.messages.get(key)!.push(message)
  }

  /**
   * Get conversation history between two users
   */
  getConversation(userId1: string, userId2: string, limit = 100): StoredMessage[] {
    const key = this.getConversationKey(userId1, userId2)
    const messages = this.messages.get(key) || []

    // Return last N messages
    return messages.slice(-limit)
  }

  /**
   * Mark all messages from one user to another as read
   */
  markAsRead(fromUserId: string, toUserId: string): void {
    const key = this.getConversationKey(fromUserId, toUserId)
    const messages = this.messages.get(key) || []

    messages.forEach((msg) => {
      if (msg.fromUserId === fromUserId && msg.toUserId === toUserId) {
        msg.read = true
      }
    })
  }

  /**
   * Get unread message count from a specific user
   */
  getUnreadCount(userId: string, contactUserId: string): number {
    const key = this.getConversationKey(userId, contactUserId)
    const messages = this.messages.get(key) || []

    return messages.filter(
      (msg) => msg.fromUserId === contactUserId && msg.toUserId === userId && !msg.read
    ).length
  }

  /**
   * Add user session when they connect
   */
  addUserSession(userId: string, socketId: string, status: 'online' | 'away' | 'busy'): void {
    const session: UserSession = {
      userId,
      socketId,
      connectedAt: new Date(),
      status,
    }

    this.userSessions.set(socketId, session)
    this.userToSocket.set(userId, socketId)
  }

  /**
   * Remove user session when they disconnect
   */
  removeUserSession(socketId: string): UserSession | null {
    const session = this.userSessions.get(socketId)

    if (session) {
      this.userSessions.delete(socketId)
      this.userToSocket.delete(session.userId)
      return session
    }

    return null
  }

  /**
   * Get user session by userId
   */
  getUserSession(userId: string): UserSession | undefined {
    const socketId = this.userToSocket.get(userId)
    if (!socketId) return undefined

    return this.userSessions.get(socketId)
  }

  /**
   * Get all online user IDs
   */
  getOnlineUsers(): string[] {
    return Array.from(this.userToSocket.keys())
  }

  /**
   * Update user status
   */
  updateUserStatus(userId: string, status: 'online' | 'away' | 'busy'): void {
    const socketId = this.userToSocket.get(userId)
    if (!socketId) return

    const session = this.userSessions.get(socketId)
    if (session) {
      session.status = status
    }
  }

  /**
   * Get last message in a conversation
   */
  getLastMessage(userId1: string, userId2: string): StoredMessage | undefined {
    const messages = this.getConversation(userId1, userId2)
    return messages[messages.length - 1]
  }
}
