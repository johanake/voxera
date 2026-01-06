import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { ChatMessage, ChatContact } from '@ucaas/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useChatConversation } from '../hooks/useChat'
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
  const queryClient = useQueryClient()
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const selectedContactRef = useRef<ChatContact | null>(null)

  // Fetch conversation from backend when contact is selected
  const { data: backendMessages = [], isLoading: _isLoadingMessages } = useChatConversation(
    currentUser?.id || '',
    selectedContact?.userId || ''
  )

  // Merge backend messages with localStorage messages (hybrid approach)
  const messages = useMemo(() => {
    if (!currentUser || !selectedContact) return []

    const localMessages = ChatService.getConversation(currentUser.id, selectedContact.userId)

    // Create a map of backend message IDs for deduplication
    const backendIds = new Set(backendMessages.map((m) => m.id))

    // Get local-only messages (not yet in backend)
    const localOnlyMessages = localMessages.filter((m) => !backendIds.has(m.id))

    // Merge and sort by timestamp
    return [...backendMessages, ...localOnlyMessages].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    )
  }, [backendMessages, currentUser, selectedContact])

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
    // Save to localStorage (offline fallback)
    ChatService.saveMessage(message)

    // Update React Query cache
    const contactId =
      message.fromUserId === currentUser?.id ? message.toUserId : message.fromUserId

    queryClient.setQueryData<ChatMessage[]>(
      ['chat', 'conversation', currentUser?.id, contactId],
      (old = []) => {
        // Avoid duplicates
        if (old.some((m) => m.id === message.id)) return old
        return [...old, message]
      }
    )

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
        // Send via WebSocket - socket handler will update React Query cache
        socketService.sendMessage(selectedContact.userId, content)
      } else {
        // Fallback to localStorage when offline
        const message = ChatService.sendMessage(
          currentUser.id,
          selectedContact.userId,
          content
        )

        // Update React Query cache optimistically
        queryClient.setQueryData<ChatMessage[]>(
          ['chat', 'conversation', currentUser.id, selectedContact.userId],
          (old = []) => [...old, message]
        )

        refreshContacts()
      }
    },
    [currentUser, selectedContact, isConnected, refreshContacts, queryClient]
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
