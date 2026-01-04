import type { FC } from 'react'
import { useChat } from '../contexts/ChatContext'
import ContactsList from '../components/chat/ContactsList'
import MessagesList from '../components/chat/MessagesList'
import MessageInput from '../components/chat/MessageInput'

const WebChat: FC = () => {
  const { selectedContact } = useChat()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Web Chat</h1>
        <p className="mt-2 text-gray-600">Instant messaging with your team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
        {/* Contacts List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ContactsList />
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            {selectedContact ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedContact.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedContact.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{selectedContact.status}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select a contact to start chatting</p>
            )}
          </div>

          {/* Messages Area */}
          <MessagesList />

          {/* Message Input */}
          <MessageInput />
        </div>
      </div>
    </div>
  )
}

export default WebChat
