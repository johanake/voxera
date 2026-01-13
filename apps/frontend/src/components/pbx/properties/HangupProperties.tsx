import type { HangupNodeData } from '@ucaas/shared'
import type { ValidationErrors } from '../../../hooks/usePBXValidation'
import { Input } from '../../ui'

interface HangupPropertiesProps {
  data: HangupNodeData
  onChange: (updatedData: Partial<HangupNodeData>) => void
  errors: ValidationErrors
}

const HangupProperties = ({ data, onChange, errors }: HangupPropertiesProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Hangup Configuration</h4>
        <p className="text-sm text-gray-600 mb-4">
          The hangup node ends the call. Configure a label to identify this endpoint.
        </p>
      </div>

      <Input
        label="Label"
        value={data.label}
        onChange={(e) => onChange({ label: e.target.value })}
        error={errors.label}
        placeholder="e.g., End Call, Goodbye"
        required
      />

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
            <p className="font-medium mb-1">Terminal Node</p>
            <p>This node ends the call flow. No additional routing is required.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HangupProperties
