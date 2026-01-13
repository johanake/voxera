import { useState, useRef, useEffect } from 'react'
import type { FC } from 'react'
import type { MessageReaction } from '@ucaas/shared'
import { ALLOWED_REACTION_EMOJIS } from '@ucaas/shared'
import { useAuth } from '../../contexts/AuthContext'

interface MessageReactionsProps {
  messageId: string
  reactions: MessageReaction[]
  onReactionToggle: (emoji: string) => void
  isOwnMessage: boolean
}

export const MessageReactions: FC<MessageReactionsProps> = ({
  messageId: _messageId,
  reactions,
  onReactionToggle,
  isOwnMessage,
}) => {
  const { currentUser } = useAuth()
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false)
      }
    }

    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPickerOpen])

  // Group reactions by emoji
  const reactionGroups = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = []
    }
    acc[reaction.emoji].push(reaction)
    return acc
  }, {} as Record<string, MessageReaction[]>)

  const hasUserReacted = (emoji: string) => {
    return reactionGroups[emoji]?.some((r) => r.userId === currentUser?.id) || false
  }

  const getUserNames = (reactions: MessageReaction[]) => {
    return reactions
      .map((r) => r.user?.firstName || 'Unknown')
      .join(', ')
  }

  const handleReactionClick = (emoji: string) => {
    onReactionToggle(emoji)
    setIsPickerOpen(false)
  }

  return (
    <div
      className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      {/* Existing reactions */}
      {Object.entries(reactionGroups).map(([emoji, emojiReactions]) => (
        <button
          key={emoji}
          onClick={() => onReactionToggle(emoji)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
            hasUserReacted(emoji)
              ? 'bg-primary-50 border-primary-300 border'
              : 'bg-gray-100 border-gray-200 border hover:bg-gray-200'
          }`}
          title={getUserNames(emojiReactions)}
        >
          <span>{emoji}</span>
          <span className="text-gray-700 font-medium">{emojiReactions.length}</span>
        </button>
      ))}

      {/* Add reaction dropdown */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors text-gray-500 ${
            isPickerOpen ? 'bg-gray-200' : 'hover:bg-gray-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {/* Emoji picker dropdown */}
        {isPickerOpen && (
          <div className="absolute bottom-full left-0 mb-1 flex bg-white shadow-lg rounded-lg border border-gray-200 p-1 gap-1 z-10">
            {ALLOWED_REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-lg ${
                  hasUserReacted(emoji) ? 'bg-primary-50' : ''
                }`}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
