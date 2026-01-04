import { useState, useRef, useEffect } from 'react'
import type { FC, FormEvent, ChangeEvent } from 'react'
import { useChat } from '../../contexts/ChatContext'
import { socketService } from '../../services/socketService'

const MessageInput: FC = () => {
  const { selectedContact, sendMessage, isConnected } = useChat()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<number | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)

    if (!selectedContact || !isConnected) return

    // Start typing indicator if not already typing
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true)
      socketService.startTyping(selectedContact.userId)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      if (selectedContact) {
        socketService.stopTyping(selectedContact.userId)
      }
    }, 1000)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!message.trim() || !selectedContact) return

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false)
      socketService.stopTyping(selectedContact.userId)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }

    sendMessage(message.trim())
    setMessage('')
  }

  const placeholder = selectedContact
    ? isConnected
      ? 'Type a message...'
      : 'Offline - message will be sent when reconnected'
    : 'Select a contact to start chatting'

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={!selectedContact}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
        />
        <button
          type="submit"
          disabled={!selectedContact || !message.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default MessageInput
