import { useState, useEffect } from 'react'
import type { PhoneNumber, AssignmentType } from '@ucaas/shared'
import { Modal, Button, Input } from '../ui'

interface AssignTarget {
  id: string
  name: string
  type: AssignmentType
  description?: string
}

// Mock assignment targets
const mockUsers: AssignTarget[] = [
  { id: 'user-1', name: 'John Doe', type: 'user', description: 'john@acme.com' },
  { id: 'user-2', name: 'Jane Smith', type: 'user', description: 'jane@acme.com' },
  { id: 'user-3', name: 'Bob Johnson', type: 'user', description: 'bob@acme.com' },
]

const mockPBXs: AssignTarget[] = [
  { id: 'pbx-1', name: 'Main Office PBX', type: 'pbx', description: '50 extensions' },
  { id: 'pbx-2', name: 'Sales Team PBX', type: 'pbx', description: '20 extensions' },
  { id: 'pbx-3', name: 'Support Center PBX', type: 'pbx', description: '30 extensions' },
]

const mockIVRs: AssignTarget[] = [
  { id: 'ivr-1', name: 'Customer Support IVR', type: 'ivr', description: 'Main customer support flow' },
  { id: 'ivr-2', name: 'Sales Routing IVR', type: 'ivr', description: 'Route calls to sales team' },
  { id: 'ivr-3', name: 'After Hours IVR', type: 'ivr', description: 'After business hours messages' },
]

interface AssignNumberModalProps {
  isOpen: boolean
  onClose: () => void
  phoneNumber: PhoneNumber | null
  onAssign: (numberId: string, assignmentType: AssignmentType, targetId: string, targetName: string) => void
}

const AssignNumberModal = ({ isOpen, onClose, phoneNumber, onAssign }: AssignNumberModalProps) => {
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('user')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setAssignmentType('user')
      setSearchQuery('')
      setSelectedTargetId(null)
    }
  }, [isOpen])

  if (!phoneNumber) return null

  const getTargetList = (): AssignTarget[] => {
    switch (assignmentType) {
      case 'user':
        return mockUsers
      case 'pbx':
        return mockPBXs
      case 'ivr':
        return mockIVRs
      default:
        return []
    }
  }

  const filteredTargets = getTargetList().filter(target => {
    const query = searchQuery.toLowerCase()
    return (
      target.name.toLowerCase().includes(query) ||
      target.description?.toLowerCase().includes(query) ||
      ''
    )
  })

  const handleAssign = () => {
    if (!selectedTargetId) return

    const selectedTarget = getTargetList().find(t => t.id === selectedTargetId)
    if (!selectedTarget) return

    onAssign(phoneNumber.id, assignmentType, selectedTargetId, selectedTarget.name)
  }

  const selectedTarget = getTargetList().find(t => t.id === selectedTargetId)

  const getTypeIcon = (type: AssignmentType) => {
    const icons: Record<string, JSX.Element> = {
      user: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      pbx: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      ivr: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    }
    return icons[type] || icons.user
  }

  const getTypeLabel = (type: AssignmentType) => {
    const labels: Record<AssignmentType, string> = {
      user: 'User',
      pbx: 'PBX System',
      ivr: 'IVR Flow',
      unassigned: 'Unassigned',
    }
    return labels[type]
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Phone Number" size="md">
      <div className="space-y-6">
        {/* Number Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900">Phone Number</h4>
          <p className="text-lg font-bold text-blue-700 mt-1">{phoneNumber.number}</p>
          {phoneNumber.region && (
            <p className="text-sm text-blue-600">
              {phoneNumber.region}, {phoneNumber.country}
            </p>
          )}
        </div>

        {/* Assignment Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign To
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['user', 'pbx', 'ivr'] as AssignmentType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setAssignmentType(type)
                  setSelectedTargetId(null)
                  setSearchQuery('')
                }}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  assignmentType === type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-center mb-1">
                  {getTypeIcon(type)}
                </div>
                <span className="text-xs font-medium">{getTypeLabel(type)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div>
          <Input
            label={`Search ${getTypeLabel(assignmentType)}s`}
            placeholder={`Search by name...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Target List */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select {getTypeLabel(assignmentType)}
          </label>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {filteredTargets.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No {getTypeLabel(assignmentType).toLowerCase()}s found
              </div>
            ) : (
              filteredTargets.map(target => (
                <div
                  key={target.id}
                  onClick={() => setSelectedTargetId(target.id)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedTargetId === target.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{target.name}</p>
                      {target.description && (
                        <p className="text-sm text-gray-500">{target.description}</p>
                      )}
                    </div>
                    {selectedTargetId === target.id && (
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

        {/* Selected Target Summary */}
        {selectedTarget && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900">Assigning to:</h4>
            <div className="flex items-center space-x-2 mt-1">
              <div className="text-green-700">{getTypeIcon(assignmentType)}</div>
              <div>
                <p className="text-green-700 font-medium">{selectedTarget.name}</p>
                {selectedTarget.description && (
                  <p className="text-sm text-green-600">{selectedTarget.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            {assignmentType === 'user' && (
              <>The user will be able to make and receive calls using this number.</>
            )}
            {assignmentType === 'pbx' && (
              <>This number will be the main incoming number for the PBX system.</>
            )}
            {assignmentType === 'ivr' && (
              <>Calls to this number will be routed through the selected IVR flow.</>
            )}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleAssign} disabled={!selectedTargetId}>
          Assign Number
        </Button>
      </div>
    </Modal>
  )
}

export default AssignNumberModal
