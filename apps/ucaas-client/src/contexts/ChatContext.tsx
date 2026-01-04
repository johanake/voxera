import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import type { ChatMessage, ChatContact } from '@ucaas/shared'
import { ChatService } from '../services/chatService'
import { socketService } from '../services/socketService'
import { useAuth } from './AuthContext'

interface ChatContextType {
  contacts: ChatContact[]
  selectedContact: ChatContact | null
  messages: ChatMessage[]
  isConnected: boolean
  typingUsers: Set<string>
  selectContact: (contactUserId: string) => void
  sendMessage: (content: string) => void
  refreshContacts: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, availableUsers } = useAuth()
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const selectedContactRef = useRef<ChatContact | null>(null)

  // Load contacts based on available users
  const refreshContacts = useCallback(() => {
    if (!currentUser) {
      setContacts([])
      return
    }

    const contactsList: ChatContact[] = availableUsers
      .filter((user) => user.id !== currentUser.id)
      .map((user) => {
        const lastMessage = ChatService.getLastMessage(currentUser.id, user.id)
        const unreadCount = ChatService.getUnreadCount(currentUser.id, user.id)

        return {
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          status: onlineUsers.has(user.id) ? 'online' : 'offline',
          lastMessage,
          unreadCount,
          isTyping: typingUsers.has(user.id),
        }
      })

    // Sort by last message time (most recent first)
    contactsList.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp.getTime() ?? 0
      const bTime = b.lastMessage?.timestamp.getTime() ?? 0
      return bTime - aTime
    })

    setContacts(contactsList)
  }, [currentUser, availableUsers, onlineUsers, typingUsers])

  useEffect(() => {
  selectedContactRef.current = selectedContact
}, [selectedContact])

  // Connect socket when currentUser is available
  useEffect(() => {
  if (!currentUser) {
    socketService.disconnect()
    return
  }

  // Connect once
  socketService.connect(currentUser.id, currentUser.extension, 'online')

  // Subscribe to events
  const unsubMessage = socketService.onMessage((message) => {
    ChatService.saveMessage(message)
    setMessages((prev) => {
      const contactId = selectedContactRef.current?.userId
      if (
        contactId &&
        (message.fromUserId === contactId || message.toUserId === contactId)
      ) {
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      }
      return prev
    })
    refreshContacts()
  })

  const unsubTyping = socketService.onTyping((userId, isTyping) => {
    setTypingUsers((prev) => {
      const newSet = new Set(prev)
      isTyping ? newSet.add(userId) : newSet.delete(userId)
      return newSet
    })
    refreshContacts()
  })

  const unsubStatus = socketService.onStatusChange((userId, status) => {
    setOnlineUsers((prev) => {
      const newSet = new Set(prev)
      status === 'offline' || !status ? newSet.delete(userId) : newSet.add(userId)
      return newSet
    })
    refreshContacts()
  })

  const unsubOnline = socketService.onOnlineUsers((userIds) => {
    setOnlineUsers(new Set(userIds))
    refreshContacts()
  })

  const unsubConnection = socketService.onConnectionChange(setIsConnected)

  return () => {
    unsubMessage()
    unsubTyping()
    unsubStatus()
    unsubOnline()
    unsubConnection()
    socketService.disconnect()
  }
}, [currentUser]) // ✅ Only run when currentUser changes



  // Refresh contacts when connection status or online users change
  useEffect(() => {
    refreshContacts()
  }, [refreshContacts])

  // Select a contact and load their messages
  const selectContact = useCallback(
    (contactUserId: string) => {
      if (!currentUser) return

      const contact = contacts.find((c) => c.userId === contactUserId)
      if (!contact) return

      setSelectedContact(contact)

      // Load messages from localStorage
      const conversationMessages = ChatService.getConversation(
        currentUser.id,
        contactUserId
      )
      setMessages(conversationMessages)

      // Mark messages as read (both locally and on server if connected)
      ChatService.markMessagesAsRead(currentUser.id, contactUserId)
      if (isConnected) {
        socketService.markAsRead(contactUserId)
      }

      // Refresh contacts to update unread count
      refreshContacts()
    },
    [currentUser, contacts, isConnected, refreshContacts]
  )

  // Send a message
  const sendMessage = useCallback(
    (content: string) => {
      if (!currentUser || !selectedContact) return

      if (isConnected) {
        // Send via WebSocket
        socketService.sendMessage(selectedContact.userId, content)
      } else {
        // Fallback to localStorage
        const message = ChatService.sendMessage(
          currentUser.id,
          selectedContact.userId,
          content
        )

        // Update local state
        setMessages((prev) => [...prev, message])
        refreshContacts()
      }
    },
    [currentUser, selectedContact, isConnected, refreshContacts]
  )

  return (
    <ChatContext.Provider
      value={{
        contacts,
        selectedContact,
        messages,
        isConnected,
        typingUsers,
        selectContact,
        sendMessage,
        refreshContacts,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
