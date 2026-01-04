export interface ChatMessage {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  timestamp: Date
  read: boolean
}

export interface ChatContact {
  userId: string
  name: string
  status: 'online' | 'offline' | 'busy' | 'away'
  lastMessage?: ChatMessage
  unreadCount: number
}

export interface Conversation {
  contactUserId: string
  messages: ChatMessage[]
}
