import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { ChatMessage, ChatContact, ChatGroupMessage, ChatGroupContact } from '@ucaas/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useChatConversation } from '../hooks/useChat'
import { ChatService } from '../services/chatService'
import { socketService } from '../services/socketService'
import { useAuth } from './AuthContext'

interface ChatContextType {
  contacts: ChatContact[]
  selectedContact: ChatContact | null
  messages: ChatMessage[]
  chatGroups: ChatGroupContact[]
  selectedChatGroup: ChatGroupContact | null
  chatGroupMessages: ChatGroupMessage[]
  isConnected: boolean
  typingUsers: Set<string>
  selectContact: (contactUserId: string) => void
  selectChatGroup: (chatGroupId: string) => void
  sendMessage: (content: string) => void
  sendChatGroupMessage: (chatGroupId: string, content: string) => void
  createChatGroup: (name: string, memberIds: string[]) => void
  updateChatGroupName: (chatGroupId: string, name: string) => void
  leaveChatGroup: (chatGroupId: string) => void
  deleteChatGroup: (chatGroupId: string) => void
  refreshContacts: () => void
  refreshChatGroups: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, availableUsers } = useAuth()
  const queryClient = useQueryClient()
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [chatGroups, setChatGroups] = useState<ChatGroupContact[]>([])
  const [selectedChatGroup, setSelectedChatGroup] = useState<ChatGroupContact | null>(null)
  const [chatGroupMessages, setChatGroupMessages] = useState<ChatGroupMessage[]>([])
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

    // Merge and sort by timestamp (handle both Date objects and string timestamps)
    return [...backendMessages, ...localOnlyMessages].sort(
      (a, b) => {
        const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime()
        const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime()
        return aTime - bTime
      }
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
      const aTime = a.lastMessage?.timestamp
        ? (a.lastMessage.timestamp instanceof Date
          ? a.lastMessage.timestamp.getTime()
          : new Date(a.lastMessage.timestamp).getTime())
        : 0
      const bTime = b.lastMessage?.timestamp
        ? (b.lastMessage.timestamp instanceof Date
          ? b.lastMessage.timestamp.getTime()
          : new Date(b.lastMessage.timestamp).getTime())
        : 0
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
  socketService.connect(currentUser.id, currentUser.extension ?? undefined, 'online')

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

  const unsubReaction = socketService.onReactionUpdated((data) => {
    // Update React Query cache for the conversation containing this message
    // Find which conversation this message belongs to by checking all cached conversations
    const cachedData = queryClient.getQueriesData<ChatMessage[]>({
      queryKey: ['chat', 'conversation', currentUser?.id],
    })

    cachedData.forEach(([queryKey, messages]) => {
      if (!messages) return

      const messageIndex = messages.findIndex((m) => m.id === data.messageId)
      if (messageIndex === -1) return

      // Update the message with new reactions
      const updatedMessages = [...messages]
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        reactions: data.reactions,
      }

      queryClient.setQueryData(queryKey, updatedMessages)
    })
  })

  // Chat group event subscriptions
  const unsubChatGroupCreated = socketService.onChatGroupCreated((chatGroup) => {
    // Convert ChatGroup to ChatGroupContact
    const chatGroupContact: ChatGroupContact = {
      chatGroupId: chatGroup.id,
      name: chatGroup.name,
      memberCount: chatGroup.members.length,
      unreadCount: 0,
      members: chatGroup.members,
      userRole: chatGroup.members.find((m) => m.userId === currentUser?.id)?.role,
    }
    setChatGroups((prev) => [chatGroupContact, ...prev])
  })

  const unsubChatGroupMessage = socketService.onChatGroupMessage((message) => {
    // Add message to chat group messages if it's the selected group
    if (selectedChatGroup && message.chatGroupId === selectedChatGroup.chatGroupId) {
      setChatGroupMessages((prev) => [...prev, message])
    }

    // Update unread count for the group
    setChatGroups((prev) =>
      prev.map((group) =>
        group.chatGroupId === message.chatGroupId
          ? {
              ...group,
              lastMessage: message,
              unreadCount:
                selectedChatGroup?.chatGroupId === message.chatGroupId
                  ? group.unreadCount
                  : group.unreadCount + 1,
            }
          : group
      )
    )
  })

  const unsubChatGroupUpdated = socketService.onChatGroupUpdated((chatGroup) => {
    setChatGroups((prev) =>
      prev.map((group) =>
        group.chatGroupId === chatGroup.id
          ? {
              ...group,
              name: chatGroup.name,
              memberCount: chatGroup.members.length,
              members: chatGroup.members,
            }
          : group
      )
    )

    // Update selected group if it matches
    if (selectedChatGroup && selectedChatGroup.chatGroupId === chatGroup.id) {
      setSelectedChatGroup((prev) =>
        prev
          ? {
              ...prev,
              name: chatGroup.name,
              memberCount: chatGroup.members.length,
              members: chatGroup.members,
            }
          : null
      )
    }
  })

  const unsubChatGroupLeft = socketService.onChatGroupLeft((data) => {
    // Remove group from list
    setChatGroups((prev) => prev.filter((g) => g.chatGroupId !== data.chatGroupId))

    // Deselect if it was selected
    if (selectedChatGroup && selectedChatGroup.chatGroupId === data.chatGroupId) {
      setSelectedChatGroup(null)
      setChatGroupMessages([])
    }
  })

  const unsubChatGroupDeleted = socketService.onChatGroupDeleted((data) => {
    // Remove group from list
    setChatGroups((prev) => prev.filter((g) => g.chatGroupId !== data.chatGroupId))

    // Deselect if it was selected
    if (selectedChatGroup && selectedChatGroup.chatGroupId === data.chatGroupId) {
      setSelectedChatGroup(null)
      setChatGroupMessages([])
    }
  })

  return () => {
    unsubMessage()
    unsubTyping()
    unsubStatus()
    unsubOnline()
    unsubConnection()
    unsubReaction()
    unsubChatGroupCreated()
    unsubChatGroupMessage()
    unsubChatGroupUpdated()
    unsubChatGroupLeft()
    unsubChatGroupDeleted()
    socketService.disconnect()
  }
}, [currentUser, queryClient, selectedChatGroup]) // ✅ Only run when currentUser changes



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

  // Chat Group Methods
  const refreshChatGroups = useCallback(() => {
    // Chat groups will be loaded via Socket.io events
    // This is a placeholder for future REST API integration
  }, [])

  const selectChatGroup = useCallback(
    (chatGroupId: string) => {
      const group = chatGroups.find((g) => g.chatGroupId === chatGroupId)
      if (!group) return

      setSelectedChatGroup(group)
      setSelectedContact(null) // Deselect 1-on-1 contact

      // Load chat group messages
      if (isConnected) {
        socketService.loadChatGroupMessages(chatGroupId, 50)
      }
    },
    [chatGroups, isConnected]
  )

  const sendChatGroupMessage = useCallback(
    (chatGroupId: string, content: string) => {
      if (!currentUser || !isConnected) return

      socketService.sendChatGroupMessage(chatGroupId, content)
    },
    [currentUser, isConnected]
  )

  const createChatGroup = useCallback(
    (name: string, memberIds: string[]) => {
      if (!currentUser || !isConnected) return

      socketService.createChatGroup(name, memberIds)
    },
    [currentUser, isConnected]
  )

  const updateChatGroupName = useCallback(
    (chatGroupId: string, name: string) => {
      if (!currentUser || !isConnected) return

      socketService.updateChatGroupName(chatGroupId, name)
    },
    [currentUser, isConnected]
  )

  const leaveChatGroup = useCallback(
    (chatGroupId: string) => {
      if (!currentUser || !isConnected) return

      socketService.leaveChatGroup(chatGroupId)
    },
    [currentUser, isConnected]
  )

  const deleteChatGroup = useCallback(
    (chatGroupId: string) => {
      if (!currentUser || !isConnected) return

      socketService.deleteChatGroup(chatGroupId)
    },
    [currentUser, isConnected]
  )

  return (
    <ChatContext.Provider
      value={{
        contacts,
        selectedContact,
        messages,
        chatGroups,
        selectedChatGroup,
        chatGroupMessages,
        isConnected,
        typingUsers,
        selectContact,
        selectChatGroup,
        sendMessage,
        sendChatGroupMessage,
        createChatGroup,
        updateChatGroupName,
        leaveChatGroup,
        deleteChatGroup,
        refreshContacts,
        refreshChatGroups,
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
