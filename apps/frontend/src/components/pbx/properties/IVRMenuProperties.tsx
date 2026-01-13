import { useState } from 'react'
import type { IVRMenuNodeData, IVROption } from '@ucaas/shared'
import type { ValidationErrors } from '../../../hooks/usePBXValidation'
import { Input } from '../../ui'

interface IVRMenuPropertiesProps {
  data: IVRMenuNodeData
  onChange: (updatedData: Partial<IVRMenuNodeData>) => void
  errors: ValidationErrors
}

const availableDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '#']

const IVRMenuProperties = ({ data, onChange, errors }: IVRMenuPropertiesProps) => {
  const [newOptionDigit, setNewOptionDigit] = useState('')
  const [newOptionLabel, setNewOptionLabel] = useState('')

  const usedDigits = data.options.map((opt) => opt.digit)
  const availableUnusedDigits = availableDigits.filter((d) => !usedDigits.includes(d))

  const handleAddOption = () => {
    if (newOptionDigit && newOptionLabel.trim()) {
      const newOption: IVROption = {
        digit: newOptionDigit,
        label: newOptionLabel.trim(),
        targetNodeId: undefined,
      }
      onChange({ options: [...data.options, newOption] })
      setNewOptionDigit('')
      setNewOptionLabel('')
    }
  }

  const handleRemoveOption = (digit: string) => {
    onChange({ options: data.options.filter((opt) => opt.digit !== digit) })
  }

  const handleUpdateOptionLabel = (digit: string, label: string) => {
    onChange({
      options: data.options.map((opt) => (opt.digit === digit ? { ...opt, label } : opt)),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">IVR Menu Configuration</h4>
        <p className="text-sm text-gray-600 mb-4">
          Create an interactive voice menu where callers can press digits to route their call.
        </p>
      </div>

      <Input
        label="Label"
        value={data.label}
        onChange={(e) => onChange({ label: e.target.value })}
        error={errors.label}
        placeholder="e.g., Main Menu, Department Selection"
        required
      />

      <div>
        <label htmlFor="menuPrompt" className="block text-sm font-medium text-gray-700 mb-1">
          Menu Prompt <span className="text-red-500">*</span>
        </label>
        <textarea
          id="menuPrompt"
          value={data.menuPrompt || ''}
          onChange={(e) => onChange({ menuPrompt: e.target.value })}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.menuPrompt ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="e.g., Press 1 for Sales, Press 2 for Support, Press 3 for Billing..."
        />
        {errors.menuPrompt && <p className="mt-1 text-sm text-red-600">{errors.menuPrompt}</p>}
        <p className="mt-1 text-xs text-gray-500">This message will be played to callers</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Menu Options <span className="text-red-500">*</span>
        </label>

        {data.options.length > 0 && (
          <div className="space-y-2 mb-3">
            {data.options.map((option) => (
              <div
                key={option.digit}
                className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {option.digit}
                </div>
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => handleUpdateOptionLabel(option.digit, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Option label..."
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(option.digit)}
                  className="text-red-600 hover:text-red-800 transition-colors p-2"
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
        )}

        <div className="flex space-x-2">
          <select
            value={newOptionDigit}
            onChange={(e) => setNewOptionDigit(e.target.value)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={availableUnusedDigits.length === 0}
          >
            <option value="">Digit</option>
            {availableUnusedDigits.map((digit) => (
              <option key={digit} value={digit}>
                {digit}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newOptionLabel}
            onChange={(e) => setNewOptionLabel(e.target.value)}
            placeholder="Option label (e.g., Sales, Support)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddOption()
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddOption}
            disabled={!newOptionDigit || !newOptionLabel.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>

        {errors.options && <p className="mt-2 text-sm text-red-600">{errors.options}</p>}

        {data.options.length === 0 && (
          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-sm text-gray-500">No menu options added yet</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-1">
            Timeout (seconds)
          </label>
          <input
            type="number"
            id="timeout"
            value={data.timeout}
            onChange={(e) => onChange({ timeout: Number(e.target.value) })}
            min={3}
            max={60}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.timeout ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.timeout && <p className="mt-1 text-sm text-red-600">{errors.timeout}</p>}
          <p className="mt-1 text-xs text-gray-500">3-60 seconds</p>
        </div>

        <div>
          <label htmlFor="invalidRetries" className="block text-sm font-medium text-gray-700 mb-1">
            Invalid Retries
          </label>
          <input
            type="number"
            id="invalidRetries"
            value={data.invalidRetries}
            onChange={(e) => onChange({ invalidRetries: Number(e.target.value) })}
            min={1}
            max={5}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.invalidRetries ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.invalidRetries && <p className="mt-1 text-sm text-red-600">{errors.invalidRetries}</p>}
          <p className="mt-1 text-xs text-gray-500">1-5 attempts</p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h5 className="text-sm font-semibold text-purple-900 mb-3">Routing Instructions</h5>
        <div className="space-y-2 text-sm text-purple-800">
          <div className="flex items-start">
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
            <p>
              <span className="font-medium">Digit Options:</span> Connect edges labeled with each digit to
              route callers based on their selection
            </p>
          </div>
          <div className="flex items-start">
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
            <p>
              <span className="font-medium">Timeout:</span> Connect a "Timeout" edge for when callers
              don't press anything
            </p>
          </div>
          <div className="flex items-start">
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
            <p>
              <span className="font-medium">Invalid:</span> Connect an "Invalid" edge for when callers
              exceed retry attempts
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IVRMenuProperties
