import { useState } from 'react'
import type { FC } from 'react'
import { useChat } from '../../contexts/ChatContext'
import { CreateChatGroupModal } from './CreateChatGroupModal'

const ContactsList: FC = () => {
  const {
    contacts,
    selectedContact,
    chatGroups,
    selectedChatGroup,
    selectContact,
    selectChatGroup,
    createChatGroup,
    isConnected,
  } = useChat()

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)

  const formatTimestamp = (date: Date | string | undefined) => {
    if (!date) return ''

    // Convert string timestamps to Date objects
    const dateObj = typeof date === 'string' ? new Date(date) : date

    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return dateObj.toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'busy':
        return 'bg-red-500'
      case 'away':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-3 py-2">
          <p className="text-xs text-yellow-800 font-medium">Offline - Reconnecting...</p>
        </div>
      )}

      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search contacts..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Chat Groups Section */}
        {chatGroups.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Groups
              </h3>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                title="Create new group"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {chatGroups.map((group) => (
                <button
                  key={group.chatGroupId}
                  onClick={() => selectChatGroup(group.chatGroupId)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedChatGroup?.chatGroupId === group.chatGroupId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Group Icon */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      </div>
                    </div>

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {group.name}
                        </p>
                        {group.lastMessage && (
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {formatTimestamp(group.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                          {group.lastMessage && ` • ${group.lastMessage.content.substring(0, 30)}${group.lastMessage.content.length > 30 ? '...' : ''}`}
                        </p>
                        {group.unreadCount > 0 && (
                          <span className="ml-2 flex-shrink-0 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                            {group.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create Group Button (if no groups) */}
        {chatGroups.length === 0 && (
          <div className="border-b border-gray-200">
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Create New Group</span>
            </button>
          </div>
        )}

        {/* Direct Messages Section */}
        <div className="px-4 py-2 bg-gray-50">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Direct Messages
          </h3>
        </div>

        {contacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No contacts available
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {contacts.map((contact) => (
              <button
                key={contact.userId}
                onClick={() => selectContact(contact.userId)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedContact?.userId === contact.userId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {contact.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(
                        contact.status
                      )} rounded-full border-2 border-white`}
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {contact.name}
                      </p>
                      {contact.lastMessage && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTimestamp(contact.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      {contact.isTyping ? (
                        <p className="text-sm text-blue-500 italic">typing...</p>
                      ) : (
                        <p className="text-sm text-gray-600 truncate">
                          {contact.lastMessage?.content || 'No messages yet'}
                        </p>
                      )}
                      {contact.unreadCount > 0 && (
                        <span className="ml-2 flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateChatGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreate={(name, memberIds) => {
          createChatGroup(name, memberIds)
          setShowCreateGroupModal(false)
        }}
      />
    </div>
  )
}

export default ContactsList
