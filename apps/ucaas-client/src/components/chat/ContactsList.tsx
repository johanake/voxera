import type { FC } from 'react'
import { useChat } from '../../contexts/ChatContext'

const ContactsList: FC = () => {
  const { contacts, selectedContact, selectContact, isConnected } = useChat()

  const formatTimestamp = (date: Date | undefined) => {
    if (!date) return ''

    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
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
    </div>
  )
}

export default ContactsList
