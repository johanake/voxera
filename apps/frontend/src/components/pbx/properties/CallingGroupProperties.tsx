import { useState } from 'react'
import type { CallingGroupNodeData } from '@ucaas/shared'
import type { ValidationErrors } from '../../../hooks/usePBXValidation'
import { Input, Select } from '../../ui'

interface CallingGroupPropertiesProps {
  data: CallingGroupNodeData
  onChange: (updatedData: Partial<CallingGroupNodeData>) => void
  errors: ValidationErrors
}

// Mock users with extensions
const mockUsers = [
  { id: 'user-1', name: 'John Doe', extension: '101' },
  { id: 'user-2', name: 'Jane Smith', extension: '102' },
  { id: 'user-3', name: 'Bob Johnson', extension: '103' },
  { id: 'user-4', name: 'Alice Williams', extension: '104' },
  { id: 'user-5', name: 'Charlie Brown', extension: '105' },
  { id: 'user-6', name: 'David Lee', extension: '106' },
  { id: 'user-7', name: 'Emma Davis', extension: '107' },
]

const routingStrategies = [
  { value: 'simultaneous', label: 'Simultaneous - Ring all extensions at once' },
  { value: 'sequential', label: 'Sequential - Ring extensions one by one' },
  { value: 'round-robin', label: 'Round Robin - Distribute calls evenly' },
]

const CallingGroupProperties = ({ data, onChange, errors }: CallingGroupPropertiesProps) => {
  const [selectedUser, setSelectedUser] = useState('')

  const handleAddExtension = () => {
    if (selectedUser && !data.extensions.includes(selectedUser)) {
      onChange({ extensions: [...data.extensions, selectedUser] })
      setSelectedUser('')
    }
  }

  const handleRemoveExtension = (extension: string) => {
    onChange({ extensions: data.extensions.filter((ext) => ext !== extension) })
  }

  const getExtensionLabel = (extension: string) => {
    const user = mockUsers.find((u) => u.extension === extension)
    return user ? `${user.name} (Ext: ${user.extension})` : extension
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Calling Group Configuration</h4>
        <p className="text-sm text-gray-600 mb-4">
          Ring multiple extensions simultaneously or in sequence. Perfect for department or team calls.
        </p>
      </div>

      <Input
        label="Label"
        value={data.label}
        onChange={(e) => onChange({ label: e.target.value })}
        error={errors.label}
        placeholder="e.g., Sales Team, Support Group"
        required
      />

      <Select
        label="Routing Strategy"
        value={data.rotationType}
        onChange={(e) => onChange({ rotationType: e.target.value as 'simultaneous' | 'sequential' | 'round-robin' })}
        options={routingStrategies}
      />

      <div>
        <label htmlFor="ringDuration" className="block text-sm font-medium text-gray-700 mb-1">
          Ring Duration (seconds)
        </label>
        <input
          type="number"
          id="ringDuration"
          value={data.ringDuration}
          onChange={(e) => onChange({ ringDuration: Number(e.target.value) })}
          min={5}
          max={120}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.ringDuration ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.ringDuration && (
          <p className="mt-1 text-sm text-red-600">{errors.ringDuration}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">How long to ring before moving to next action (5-120 seconds)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Extensions <span className="text-red-500">*</span>
        </label>

        <div className="flex space-x-2 mb-3">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an extension...</option>
            {mockUsers
              .filter((user) => !data.extensions.includes(user.extension))
              .map((user) => (
                <option key={user.id} value={user.extension}>
                  {user.name} (Ext: {user.extension})
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={handleAddExtension}
            disabled={!selectedUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>

        {data.extensions.length > 0 ? (
          <div className="space-y-2">
            {data.extensions.map((extension) => (
              <div
                key={extension}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-gray-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">
                    {getExtensionLabel(extension)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExtension(extension)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-sm text-gray-500">No extensions added yet</p>
          </div>
        )}

        {errors.extensions && (
          <p className="mt-2 text-sm text-red-600">{errors.extensions}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">No Answer Handling</p>
            <p>
              You can connect a "No Answer" edge from this node to route calls when no one answers within
              the ring duration.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CallingGroupProperties
