import { useState } from 'react'
import type { FC } from 'react'
import type { ChatGroupContact } from '@ucaas/shared'

interface ChatGroupHeaderProps {
  chatGroup: ChatGroupContact
  onUpdateName: (name: string) => void
  onLeave: () => void
  onDelete: () => void
}

export const ChatGroupHeader: FC<ChatGroupHeaderProps> = ({
  chatGroup,
  onUpdateName,
  onLeave,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(chatGroup.name)
  const [showMenu, setShowMenu] = useState(false)

  const isAdmin = chatGroup.userRole === 'admin'

  const handleSaveName = () => {
    if (editedName.trim() && editedName.trim() !== chatGroup.name) {
      onUpdateName(editedName.trim())
    }
    setIsEditing(false)
    setEditedName(chatGroup.name)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedName(chatGroup.name)
  }

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave this chat group?')) {
      onLeave()
      setShowMenu(false)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this chat group? This action cannot be undone.')) {
      onDelete()
      setShowMenu(false)
    }
  }

  return (
    <div className="border-b border-gray-200 px-6 py-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveName()
                  } else if (e.key === 'Escape') {
                    handleCancelEdit()
                  }
                }}
              />
              <button
                onClick={handleSaveName}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">{chatGroup.name}</h2>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit group name"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {chatGroup.memberCount} {chatGroup.memberCount === 1 ? 'member' : 'members'}
                {isAdmin && ' • You are admin'}
              </p>
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={handleLeave}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Leave Group
                </button>
                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete Group
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Member List Preview */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex -space-x-2">
          {chatGroup.members.slice(0, 5).map((member) => (
            <div
              key={member.id}
              className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
              title={`${member.user?.firstName} ${member.user?.lastName}`}
            >
              {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
            </div>
          ))}
        </div>
        {chatGroup.memberCount > 5 && (
          <span className="text-sm text-gray-500">
            +{chatGroup.memberCount - 5} more
          </span>
        )}
      </div>
    </div>
  )
}
