import type { ChatMessage, Conversation } from '@ucaas/shared'

const STORAGE_KEY = 'voxera_chat_messages'

export class ChatService {
  // Load all conversations from localStorage
  static loadConversations(): Conversation[] {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []

    try {
      const parsed = JSON.parse(data)
      // Convert date strings back to Date objects
      return parsed.map((conv: Conversation) => ({
        ...conv,
        messages: conv.messages.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }))
    } catch {
      return []
    }
  }

  // Save all conversations to localStorage
  static saveConversations(conversations: Conversation[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  }

  // Get conversation with a specific user
  static getConversation(currentUserId: string, contactUserId: string): ChatMessage[] {
    const conversations = this.loadConversations()
    const conversation = conversations.find(
      (conv) =>
        conv.contactUserId === contactUserId ||
        (conv.contactUserId === currentUserId && contactUserId === currentUserId)
    )

    if (!conversation) return []

    // Filter messages relevant to this conversation
    return conversation.messages.filter(
      (msg) =>
        (msg.fromUserId === currentUserId && msg.toUserId === contactUserId) ||
        (msg.fromUserId === contactUserId && msg.toUserId === currentUserId)
    )
  }

  // Save a message object to localStorage (for WebSocket messages)
  static saveMessage(message: ChatMessage): void {
    const conversations = this.loadConversations()

    // Determine conversation key based on current user
    // We'll try both possible conversation keys
    const key1 = message.toUserId
    const key2 = message.fromUserId

    let conversation = conversations.find(
      (conv) => conv.contactUserId === key1 || conv.contactUserId === key2
    )

    if (!conversation) {
      // Create new conversation with the other user (not the current user)
      conversation = {
        contactUserId: message.toUserId,
        messages: [],
      }
      conversations.push(conversation)
    }

    // Avoid duplicates
    if (!conversation.messages.some((m) => m.id === message.id)) {
      conversation.messages.push(message)
      this.saveConversations(conversations)
    }
  }

  // Send a message
  static sendMessage(
    fromUserId: string,
    toUserId: string,
    content: string
  ): ChatMessage {
    const conversations = this.loadConversations()

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromUserId,
      toUserId,
      content,
      timestamp: new Date(),
      read: false,
    }

    // Find or create conversation
    let conversation = conversations.find((conv) => conv.contactUserId === toUserId)

    if (!conversation) {
      conversation = {
        contactUserId: toUserId,
        messages: [],
      }
      conversations.push(conversation)
    }

    conversation.messages.push(message)
    this.saveConversations(conversations)

    return message
  }

  // Mark messages as read
  static markMessagesAsRead(currentUserId: string, contactUserId: string): void {
    const conversations = this.loadConversations()

    conversations.forEach((conv) => {
      conv.messages.forEach((msg) => {
        if (msg.fromUserId === contactUserId && msg.toUserId === currentUserId) {
          msg.read = true
        }
      })
    })

    this.saveConversations(conversations)
  }

  // Get unread count for a contact
  static getUnreadCount(currentUserId: string, contactUserId: string): number {
    const conversations = this.loadConversations()
    let count = 0

    conversations.forEach((conv) => {
      conv.messages.forEach((msg) => {
        if (
          msg.fromUserId === contactUserId &&
          msg.toUserId === currentUserId &&
          !msg.read
        ) {
          count++
        }
      })
    })

    return count
  }

  // Get last message with a contact
  static getLastMessage(
    currentUserId: string,
    contactUserId: string
  ): ChatMessage | undefined {
    const messages = this.getConversation(currentUserId, contactUserId)
    return messages[messages.length - 1]
  }

  // Clear all messages (for testing)
  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}
