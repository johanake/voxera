import { useState } from 'react'
import type { QueueNodeData } from '@ucaas/shared'
import type { ValidationErrors } from '../../../hooks/usePBXValidation'
import { Input, Select } from '../../ui'

interface QueuePropertiesProps {
  data: QueueNodeData
  onChange: (updatedData: Partial<QueueNodeData>) => void
  errors: ValidationErrors
}

// Mock users (agents)
const mockUsers = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: 'user-3', name: 'Bob Johnson', email: 'bob@example.com' },
  { id: 'user-4', name: 'Alice Williams', email: 'alice@example.com' },
  { id: 'user-5', name: 'Charlie Brown', email: 'charlie@example.com' },
  { id: 'user-6', name: 'David Lee', email: 'david@example.com' },
]

const routingStrategies = [
  { value: 'round-robin', label: 'Round Robin - Distribute evenly across agents' },
  { value: 'longest-idle', label: 'Longest Idle - Route to agent idle the longest' },
  { value: 'skills-based', label: 'Skills Based - Match caller to skilled agent' },
  { value: 'all-agents', label: 'All Agents - Ring all agents simultaneously' },
]

const overflowActions = [
  { value: '', label: 'No overflow action' },
  { value: 'voicemail', label: 'Voicemail' },
  { value: 'forward', label: 'Forward' },
  { value: 'hangup', label: 'Hangup' },
  { value: 'callback', label: 'Callback' },
]

const QueueProperties = ({ data, onChange, errors }: QueuePropertiesProps) => {
  const [selectedAgent, setSelectedAgent] = useState('')

  const handleAddAgent = () => {
    if (selectedAgent && !data.agentUserIds.includes(selectedAgent)) {
      onChange({ agentUserIds: [...data.agentUserIds, selectedAgent] })
      setSelectedAgent('')
    }
  }

  const handleRemoveAgent = (agentId: string) => {
    onChange({ agentUserIds: data.agentUserIds.filter((id) => id !== agentId) })
  }

  const getAgentLabel = (agentId: string) => {
    const user = mockUsers.find((u) => u.id === agentId)
    return user ? `${user.name} (${user.email})` : agentId
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Queue Configuration</h4>
        <p className="text-sm text-gray-600 mb-4">
          Configure an agent queue with routing rules, capacity limits, and overflow handling.
        </p>
      </div>

      <Input
        label="Label"
        value={data.label}
        onChange={(e) => onChange({ label: e.target.value })}
        error={errors.label}
        placeholder="e.g., Sales Queue, Support Queue"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agents <span className="text-red-500">*</span>
        </label>

        <div className="flex space-x-2 mb-3">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an agent...</option>
            {mockUsers
              .filter((user) => !data.agentUserIds.includes(user.id))
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={handleAddAgent}
            disabled={!selectedAgent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>

        {data.agentUserIds.length > 0 ? (
          <div className="space-y-2">
            {data.agentUserIds.map((agentId) => (
              <div
                key={agentId}
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
                  <span className="text-sm font-medium text-gray-900">{getAgentLabel(agentId)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAgent(agentId)}
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
            <p className="text-sm text-gray-500">No agents added yet</p>
          </div>
        )}

        {errors.agents && <p className="mt-2 text-sm text-red-600">{errors.agents}</p>}
      </div>

      <Select
        label="Routing Strategy"
        value={data.routingStrategy}
        onChange={(e) =>
          onChange({
            routingStrategy: e.target.value as 'round-robin' | 'longest-idle' | 'skills-based' | 'all-agents',
          })
        }
        options={routingStrategies}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="maxWaitTime" className="block text-sm font-medium text-gray-700 mb-1">
            Max Wait Time (seconds)
          </label>
          <input
            type="number"
            id="maxWaitTime"
            value={data.maxWaitTime || ''}
            onChange={(e) => onChange({ maxWaitTime: e.target.value ? Number(e.target.value) : undefined })}
            min={10}
            max={3600}
            placeholder="Optional"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.maxWaitTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.maxWaitTime && <p className="mt-1 text-sm text-red-600">{errors.maxWaitTime}</p>}
          <p className="mt-1 text-xs text-gray-500">10-3600 seconds</p>
        </div>

        <div>
          <label htmlFor="maxQueueSize" className="block text-sm font-medium text-gray-700 mb-1">
            Max Queue Size
          </label>
          <input
            type="number"
            id="maxQueueSize"
            value={data.maxQueueSize || ''}
            onChange={(e) => onChange({ maxQueueSize: e.target.value ? Number(e.target.value) : undefined })}
            min={1}
            placeholder="Optional"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.maxQueueSize ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.maxQueueSize && <p className="mt-1 text-sm text-red-600">{errors.maxQueueSize}</p>}
          <p className="mt-1 text-xs text-gray-500">Min: 1 caller</p>
        </div>
      </div>

      <div>
        <Select
          label="Overflow Action"
          value={data.overflowAction || ''}
          onChange={(e) =>
            onChange({
              overflowAction: e.target.value ? (e.target.value as 'voicemail' | 'forward' | 'hangup' | 'callback') : undefined,
            })
          }
          options={overflowActions}
        />
        <p className="mt-1 text-xs text-gray-500">What happens when queue is full or wait time exceeded</p>
        {errors.overflowTarget && <p className="mt-1 text-sm text-red-600">{errors.overflowTarget}</p>}
      </div>

      {data.overflowAction && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Overflow Edge Required</p>
              <p>
                Connect an "Overflow" edge from this node to route calls when the overflow action is
                triggered.
              </p>
            </div>
          </div>
        </div>
      )}

      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.recordCalls}
          onChange={(e) => onChange({ recordCalls: e.target.checked })}
          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">Record Calls</div>
          <div className="text-xs text-gray-500">Automatically record all calls handled by this queue</div>
        </div>
      </label>
    </div>
  )
}

export default QueueProperties
