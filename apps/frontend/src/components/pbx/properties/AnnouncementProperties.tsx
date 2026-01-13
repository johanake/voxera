import type { AnnouncementNodeData } from '@ucaas/shared'
import type { ValidationErrors } from '../../../hooks/usePBXValidation'
import { Input } from '../../ui'

interface AnnouncementPropertiesProps {
  data: AnnouncementNodeData
  onChange: (updatedData: Partial<AnnouncementNodeData>) => void
  errors: ValidationErrors
}

const AnnouncementProperties = ({ data, onChange, errors }: AnnouncementPropertiesProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Announcement Configuration</h4>
        <p className="text-sm text-gray-600 mb-4">
          Play a message to callers before routing them to the next destination.
        </p>
      </div>

      <Input
        label="Label"
        value={data.label}
        onChange={(e) => onChange({ label: e.target.value })}
        error={errors.label}
        placeholder="e.g., Welcome Message, Holiday Hours"
        required
      />

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message Text <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          value={data.message || ''}
          onChange={(e) => onChange({ message: e.target.value })}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.message ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter the message text..."
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        <p className="mt-1 text-xs text-gray-500">
          This text will be converted to speech or displayed to agents.
        </p>
      </div>

      <div className="space-y-3">
        <h5 className="text-sm font-medium text-gray-900">Audio Options</h5>

        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.textToSpeech}
            onChange={(e) => onChange({ textToSpeech: e.target.checked })}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Text-to-Speech</div>
            <div className="text-xs text-gray-500">
              Automatically convert the message text to speech
            </div>
          </div>
        </label>

        <Input
          label="Audio File URL (Optional)"
          value={data.audioFileUrl || ''}
          onChange={(e) => onChange({ audioFileUrl: e.target.value })}
          placeholder="https://example.com/audio/welcome.mp3"
        />
        <p className="text-xs text-gray-500 -mt-2">
          If provided, this audio file will be played instead of text-to-speech.
        </p>
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
            <p className="font-medium mb-1">Next Destination Required</p>
            <p>
              After playing the announcement, you must connect this node to the next destination
              (queue, voicemail, etc.).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementProperties
