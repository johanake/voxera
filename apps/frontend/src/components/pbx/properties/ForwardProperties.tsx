import type { ForwardNodeData } from '@ucaas/shared'
import type { ValidationErrors } from '../../../hooks/usePBXValidation'
import { Input, Select } from '../../ui'

interface ForwardPropertiesProps {
  data: ForwardNodeData
  onChange: (updatedData: Partial<ForwardNodeData>) => void
  errors: ValidationErrors
}

// Mock users for forwarding target
const mockUsers = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', extension: '101' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', extension: '102' },
  { id: 'user-3', name: 'Bob Johnson', email: 'bob@example.com', extension: '103' },
  { id: 'user-4', name: 'Alice Williams', email: 'alice@example.com', extension: '104' },
  { id: 'user-5', name: 'Charlie Brown', email: 'charlie@example.com', extension: '105' },
]

const ForwardProperties = ({ data, onChange, errors }: ForwardPropertiesProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Forward Configuration</h4>
        <p className="text-sm text-gray-600 mb-4">
          Forward calls to a specific user. You can configure ring duration and fallback behavior.
        </p>
      </div>

      <Input
        label="Label"
        value={data.label}
        onChange={(e) => onChange({ label: e.target.value })}
        error={errors.label}
        placeholder="e.g., Forward to Manager, Sales Rep"
        required
      />

      <Select
        label="Target User"
        value={data.targetUserId || ''}
        onChange={(e) => onChange({ targetUserId: e.target.value })}
        options={[
          { value: '', label: 'Select a user...' },
          ...mockUsers.map((user) => ({
            value: user.id,
            label: `${user.name} (Ext: ${user.extension})`,
          })),
        ]}
        error={errors.targetUserId}
        required
      />

      <div>
        <label htmlFor="ringDuration" className="block text-sm font-medium text-gray-700 mb-1">
          Ring Duration (seconds)
        </label>
        <input
          type="number"
          id="ringDuration"
          value={data.ringDuration || 30}
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
              You can connect a "No Answer" edge from this node to route calls when the user doesn't
              answer within the ring duration.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForwardProperties
