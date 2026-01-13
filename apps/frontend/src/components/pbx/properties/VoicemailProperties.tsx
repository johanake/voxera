import type { VoicemailNodeData } from '@ucaas/shared'
import type { ValidationErrors } from '../../../hooks/usePBXValidation'
import { Input, Select } from '../../ui'

interface VoicemailPropertiesProps {
  data: VoicemailNodeData
  onChange: (updatedData: Partial<VoicemailNodeData>) => void
  errors: ValidationErrors
}

// Mock users for mailbox selection
const mockUsers = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: 'user-3', name: 'Bob Johnson', email: 'bob@example.com' },
  { id: 'user-4', name: 'Alice Williams', email: 'alice@example.com' },
  { id: 'user-5', name: 'Charlie Brown', email: 'charlie@example.com' },
]

const VoicemailProperties = ({ data, onChange, errors }: VoicemailPropertiesProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Voicemail Configuration</h4>
        <p className="text-sm text-gray-600 mb-4">
          Configure voicemail settings to capture messages when calls cannot be answered.
        </p>
      </div>

      <Input
        label="Label"
        value={data.label}
        onChange={(e) => onChange({ label: e.target.value })}
        error={errors.label}
        placeholder="e.g., Sales Voicemail, Support Messages"
        required
      />

      <Select
        label="Mailbox Owner"
        value={data.mailboxUserId || ''}
        onChange={(e) => onChange({ mailboxUserId: e.target.value })}
        options={[
          { value: '', label: 'Select a user...' },
          ...mockUsers.map((user) => ({
            value: user.id,
            label: `${user.name} (${user.email})`,
          })),
        ]}
        error={errors.mailboxUserId}
        required
      />

      <div>
        <label htmlFor="greetingMessage" className="block text-sm font-medium text-gray-700 mb-1">
          Custom Greeting
        </label>
        <textarea
          id="greetingMessage"
          value={data.greetingMessage || ''}
          onChange={(e) => onChange({ greetingMessage: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter a custom voicemail greeting message (optional)..."
        />
        <p className="mt-1 text-xs text-gray-500">
          If not specified, a default greeting will be used.
        </p>
      </div>

      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-900">Features</h5>

        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.transcriptionEnabled}
            onChange={(e) => onChange({ transcriptionEnabled: e.target.checked })}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Enable Transcription</div>
            <div className="text-xs text-gray-500">
              Automatically transcribe voicemail messages to text
            </div>
          </div>
        </label>

        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.emailNotification}
            onChange={(e) => onChange({ emailNotification: e.target.checked })}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Email Notification</div>
            <div className="text-xs text-gray-500">
              Send email notification to mailbox owner when new messages arrive
            </div>
          </div>
        </label>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0"
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
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">Terminal Node</p>
            <p>
              This node ends the call flow after capturing the voicemail message. No additional
              routing is required.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoicemailProperties
