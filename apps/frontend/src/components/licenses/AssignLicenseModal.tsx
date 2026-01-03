import { useState, useEffect } from 'react'
import type { License, User } from '@ucaas/shared'
import { Modal, Button, Input } from '../ui'

interface AssignLicenseModalProps {
  isOpen: boolean
  onClose: () => void
  license: License | null
  users: User[]
  onAssign: (licenseId: string, userId: string) => void
}

const AssignLicenseModal = ({ isOpen, onClose, license, users, onAssign }: AssignLicenseModalProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSelectedUserId(null)
    }
  }, [isOpen])

  if (!license) return null

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return (
      fullName.includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.department?.toLowerCase().includes(query)
    )
  })

  const handleAssign = () => {
    if (selectedUserId) {
      onAssign(license.id, selectedUserId)
    }
  }

  const selectedUser = users.find(u => u.id === selectedUserId)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign License to User" size="md">
      <div className="space-y-6">
        {/* License Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900">License</h4>
          <p className="text-blue-700 mt-1">
            {license.bundleName} - {license.tierName}
          </p>
        </div>

        {/* Search Users */}
        <div>
          <Input
            label="Search Users"
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* User List */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select User
          </label>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No users found
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedUserId === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.department && (
                        <p className="text-xs text-gray-400 mt-1">{user.department}</p>
                      )}
                    </div>
                    {selectedUserId === user.id && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected User Summary */}
        {selectedUser && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900">Assigning to:</h4>
            <p className="text-green-700 mt-1">
              {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
            </p>
          </div>
        )}

        {/* Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            ℹ️ The user will receive a notification email once the license is assigned.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleAssign} disabled={!selectedUserId}>
          Assign License
        </Button>
      </div>
    </Modal>
  )
}

export default AssignLicenseModal
