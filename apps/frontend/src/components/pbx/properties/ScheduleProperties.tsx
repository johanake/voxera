import type { ScheduleNodeData } from '@ucaas/shared'
import type { ValidationErrors } from '../../../hooks/usePBXValidation'
import { Input, Select } from '../../ui'

interface SchedulePropertiesProps {
  data: ScheduleNodeData
  onChange: (updatedData: Partial<ScheduleNodeData>) => void
  errors: ValidationErrors
}

// Mock schedules
const mockSchedules = [
  { id: 'schedule-1', name: 'Business Hours (9-5 Mon-Fri)', description: 'Standard weekday hours' },
  { id: 'schedule-2', name: 'Extended Hours (8-8 Mon-Sat)', description: 'Extended weekday and Saturday' },
  { id: 'schedule-3', name: '24/7 Schedule', description: 'Always open' },
  { id: 'schedule-4', name: 'Weekend Only', description: 'Saturday and Sunday only' },
]

const ScheduleProperties = ({ data, onChange, errors }: SchedulePropertiesProps) => {
  const selectedSchedule = mockSchedules.find((s) => s.id === data.scheduleId)

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Schedule Configuration</h4>
        <p className="text-sm text-gray-600 mb-4">
          Route calls based on business hours. Define different paths for when you're open vs closed.
        </p>
      </div>

      <Input
        label="Label"
        value={data.label}
        onChange={(e) => onChange({ label: e.target.value })}
        error={errors.label}
        placeholder="e.g., Business Hours Check, Weekend Routing"
        required
      />

      <div>
        <Select
          label="Schedule"
          value={data.scheduleId || ''}
          onChange={(e) => onChange({ scheduleId: e.target.value })}
          options={[
            { value: '', label: 'Select a schedule...' },
            ...mockSchedules.map((schedule) => ({
              value: schedule.id,
              label: schedule.name,
            })),
          ]}
          error={errors.scheduleId}
          required
        />
        {selectedSchedule && (
          <p className="mt-1 text-xs text-gray-500">{selectedSchedule.description}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-semibold text-blue-900 mb-3">Routing Paths</h5>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Within Hours</div>
              <div className="text-xs text-gray-600 mt-0.5">
                Connect a "Within Hours" edge to route calls during business hours
              </div>
              {errors.withinHoursTarget && (
                <p className="mt-1 text-xs text-red-600">{errors.withinHoursTarget}</p>
              )}
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Outside Hours</div>
              <div className="text-xs text-gray-600 mt-0.5">
                Connect an "Outside Hours" edge to route calls when closed
              </div>
              {errors.outsideHoursTarget && (
                <p className="mt-1 text-xs text-red-600">{errors.outsideHoursTarget}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-1">Schedule Management</p>
            <p>
              You can create and edit schedules in the Schedule panel. Click the "Schedules" button in
              the toolbar to manage your business hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScheduleProperties
