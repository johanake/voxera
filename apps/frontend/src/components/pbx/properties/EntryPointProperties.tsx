import type { EntryPointNodeData } from '@ucaas/shared'
import type { ValidationErrors } from '../../../hooks/usePBXValidation'
import { Input, Select } from '../../ui'

interface EntryPointPropertiesProps {
  data: EntryPointNodeData
  onChange: (updatedData: Partial<EntryPointNodeData>) => void
  errors: ValidationErrors
}

// Mock phone numbers for selection
const mockPhoneNumbers = [
  { id: 'pn-1', number: '+1 (555) 100-0001', type: 'mobile' },
  { id: 'pn-2', number: '+1 (555) 100-0002', type: 'geographic' },
  { id: 'pn-3', number: '+1 (800) 555-0123', type: 'toll-free' },
  { id: 'pn-4', number: '+1 (555) 200-0001', type: 'mobile' },
  { id: 'pn-5', number: '+1 (555) 300-0001', type: 'geographic' },
]

const EntryPointProperties = ({ data, onChange, errors }: EntryPointPropertiesProps) => {
  const handlePhoneNumberChange = (phoneNumberId: string) => {
    const selected = mockPhoneNumbers.find((pn) => pn.id === phoneNumberId)
    onChange({
      phoneNumberId,
      phoneNumber: selected?.number || '',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Entry Point Configuration</h4>
        <p className="text-sm text-gray-600 mb-4">
          Entry points are the starting nodes for incoming calls. Each entry point is associated with
          a phone number.
        </p>
      </div>

      <Input
        label="Label"
        value={data.label}
        onChange={(e) => onChange({ label: e.target.value })}
        error={errors.label}
        placeholder="e.g., Main Sales Line, Support Hotline"
        required
      />

      <Select
        label="Phone Number"
        value={data.phoneNumberId || ''}
        onChange={(e) => handlePhoneNumberChange(e.target.value)}
        options={[
          { value: '', label: 'Select a phone number...' },
          ...mockPhoneNumbers.map((pn) => ({
            value: pn.id,
            label: `${pn.number} (${pn.type})`,
          })),
        ]}
        error={errors.phoneNumberId}
        required
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Describe the purpose of this entry point..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
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
            <p className="font-medium mb-1">Starting Point</p>
            <p>
              This is where calls enter your queue system. You must connect this to other nodes to
              route the call.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EntryPointProperties
