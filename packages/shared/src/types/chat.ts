// Chat message interface
export interface ChatMessage {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  timestamp: Date
  read: boolean
  reactions?: MessageReaction[]
}

// Message reaction interface
export interface MessageReaction {
  id: string
  messageId: string
  userId: string
  emoji: string
  timestamp: Date
  user?: {
    id: string
    firstName: string
    lastName: string
  }
}

// Allowed reaction emojis
export const ALLOWED_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'] as const
export type ReactionEmoji = typeof ALLOWED_REACTION_EMOJIS[number]

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

// Reaction event payload types
export interface ReactionTogglePayload {
  messageId: string
  emoji: ReactionEmoji
}

export interface ReactionUpdatedPayload {
  messageId: string
  reactions: MessageReaction[]
  action: 'added' | 'removed'
  userId: string
  emoji: string
}

// ============================================================================
// CHAT GROUPS
// ============================================================================

// Chat group interface
export interface ChatGroup {
  id: string
  name: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  lastActivity: Date
  members: ChatGroupMember[]
  creator?: {
    id: string
    firstName: string
    lastName: string
  }
}

// Chat group member interface
export interface ChatGroupMember {
  id: string
  chatGroupId: string
  userId: string
  role: 'admin' | 'member'
  joinedAt: Date
  leftAt?: Date
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    extension?: string
  }
}

// Chat group message interface
export interface ChatGroupMessage {
  id: string
  chatGroupId: string
  fromUserId: string
  content: string
  timestamp: Date
  sender?: {
    id: string
    firstName: string
    lastName: string
    email: string
    extension?: string
  }
  reactions?: MessageReaction[]
  readBy?: ChatGroupMessageRead[]
}

// Chat group message read interface
export interface ChatGroupMessageRead {
  id: string
  messageId: string
  userId: string
  readAt: Date
  user?: {
    id: string
    firstName: string
    lastName: string
  }
}

// Chat group contact interface (for UI display)
export interface ChatGroupContact {
  chatGroupId: string
  name: string
  memberCount: number
  lastMessage?: ChatGroupMessage
  unreadCount: number
  members: ChatGroupMember[]
  userRole?: 'admin' | 'member'
}

// Chat group event payload types
export interface ChatGroupCreatePayload {
  name: string
  memberIds: string[]
}

export interface ChatGroupMessageSendPayload {
  chatGroupId: string
  content: string
}

export interface ChatGroupMessagesReadPayload {
  chatGroupId: string
  upToMessageId: string
}

export interface ChatGroupMessagesLoadPayload {
  chatGroupId: string
  limit?: number
  before?: string
}

export interface ChatGroupUpdateNamePayload {
  chatGroupId: string
  name: string
}

export interface ChatGroupMemberAddPayload {
  chatGroupId: string
  newUserId: string
}

export interface ChatGroupMemberRemovePayload {
  chatGroupId: string
  removeUserId: string
}

export interface ChatGroupLeavePayload {
  chatGroupId: string
}

export interface ChatGroupDeletePayload {
  chatGroupId: string
}
