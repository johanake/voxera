import { useEffect, useRef } from 'react'
import type { FC } from 'react'
import { useChat } from '../../contexts/ChatContext'
import { useAuth } from '../../contexts/AuthContext'

const MessagesList: FC = () => {
  const { messages, selectedContact, typingUsers } = useChat()
  const { currentUser } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isContactTyping = selectedContact && typingUsers.has(selectedContact.userId)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!selectedContact) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No conversation selected</p>
          <p className="text-gray-500 text-sm mt-1">
            Choose a contact from the list to start messaging
          </p>
        </div>
      </div>
    )
  }

const formatTime = (date: string | Date) => {
  // Convert string to Date if needed
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>No messages yet</p>
          <p className="text-sm mt-1">Send a message to start the conversation</p>
        </div>
      ) : (
        messages.map((message) => {
          const isCurrentUser = message.fromUserId === currentUser?.id

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isCurrentUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          )
        })
      )}

      {/* Typing Indicator */}
      {isContactTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-200 rounded-lg px-4 py-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessagesList
