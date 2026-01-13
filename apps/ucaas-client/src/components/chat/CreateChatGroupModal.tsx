import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { useUsers } from '../../hooks/useUsers'
import { useAuth } from '../../contexts/AuthContext'

interface CreateChatGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, memberIds: string[]) => void
}

const MAX_MEMBERS = 50

export const CreateChatGroupModal: FC<CreateChatGroupModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const { currentUser } = useAuth()
  const { data: users = [] } = useUsers()
  const [groupName, setGroupName] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setGroupName('')
      setSelectedUserIds(new Set())
      setSearchQuery('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const availableUsers = users.filter((user) => user.id !== currentUser?.id)
  const filteredUsers = availableUsers.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase()) ||
           user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.extension?.includes(searchQuery)
  })

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      if (newSelected.size >= MAX_MEMBERS - 1) { // -1 for creator
        alert(`Cannot add more than ${MAX_MEMBERS} members (including yourself)`)
        return
      }
      newSelected.add(userId)
    }
    setSelectedUserIds(newSelected)
  }

  const handleCreate = () => {
    if (!groupName.trim()) {
      alert('Please enter a group name')
      return
    }

    if (selectedUserIds.size === 0) {
      alert('Please select at least one member')
      return
    }

    onCreate(groupName.trim(), Array.from(selectedUserIds))
  }

  const selectedCount = selectedUserIds.size + 1 // +1 for creator

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create Chat Group</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {/* Group Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
          </div>

          {/* Member Count */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Select Members *
              </label>
              <span className="text-sm text-gray-600">
                {selectedCount} / {MAX_MEMBERS}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* User List */}
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {searchQuery ? 'No users found' : 'No available users'}
              </p>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUserIds.has(user.id)
                return (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary-50 border-2 border-primary-300'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleUser(user.id)}
                      className="w-4 h-4 text-primary-300 rounded focus:ring-primary-300"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.extension && `Ext: ${user.extension} • `}
                        {user.email}
                      </div>
                    </div>
                  </label>
                )
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedUserIds.size === 0}
            className="flex-1 px-4 py-2 text-white bg-primary-300 rounded-lg hover:bg-primary-400 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  )
}
