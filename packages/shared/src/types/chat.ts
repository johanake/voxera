// Chat message interface
export interface ChatMessage {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  timestamp: Date
  read: boolean
}

// Chat contact interface
export interface ChatContact {
  userId: string
  name: string
  status: 'online' | 'offline' | 'busy' | 'away'
  lastMessage?: ChatMessage
  unreadCount: number
  isTyping?: boolean
}

// Conversation interface (for storage)
export interface Conversation {
  contactUserId: string
  messages: ChatMessage[]
}

// Socket event payload types
export interface UserRegisterPayload {
  userId: string
  status: 'online' | 'busy' | 'away'
}

export interface MessageSendPayload {
  toUserId: string
  content: string
}

export interface TypingPayload {
  toUserId: string
}

export interface MessageReadPayload {
  fromUserId: string
}

export interface TypingIndicationPayload {
  fromUserId: string
  isTyping: boolean
}

export interface UserStatusPayload {
  userId: string
  status?: 'online' | 'busy' | 'away' | 'offline'
}

export interface ConversationLoadPayload {
  withUserId: string
  limit?: number
}
