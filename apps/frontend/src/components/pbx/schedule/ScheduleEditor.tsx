import { useState } from 'react'
import type { Schedule, DaySchedule, DayOfWeek } from '@ucaas/shared'
import { Input, Select, Button } from '../../ui'
import DayScheduleRow from './DayScheduleRow'

interface ScheduleEditorProps {
  schedule?: Schedule
  onSave: (schedule: Schedule) => void
  onCancel: () => void
}

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'UTC', label: 'UTC' },
]

const daysOfWeek: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const createDefaultDaySchedule = (day: DayOfWeek): DaySchedule => ({
  day,
  enabled: false,
  timeBlocks: [],
})

const ScheduleEditor = ({ schedule, onSave, onCancel }: ScheduleEditorProps) => {
  const [name, setName] = useState(schedule?.name || '')
  const [description, setDescription] = useState(schedule?.description || '')
  const [timezone, setTimezone] = useState(schedule?.timezone || 'America/New_York')
  const [days, setDays] = useState<DaySchedule[]>(
    schedule?.days || daysOfWeek.map(createDefaultDaySchedule)
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleDayChange = (dayIndex: number, daySchedule: DaySchedule) => {
    const newDays = [...days]
    newDays[dayIndex] = daySchedule
    setDays(newDays)
  }

  const handleApplyToWeekdays = () => {
    const mondaySchedule = days.find((d) => d.day === 'monday')
    if (!mondaySchedule || !mondaySchedule.enabled) {
      alert('Please configure Monday first, then apply to all weekdays.')
      return
    }

    const weekdayIndices = [0, 1, 2, 3, 4] // Mon-Fri
    const newDays = days.map((day, index) => {
      if (weekdayIndices.includes(index)) {
        return {
          ...day,
          enabled: true,
          timeBlocks: [...mondaySchedule.timeBlocks],
        }
      }
      return day
    })
    setDays(newDays)
  }

  const handleApplyToWeekend = () => {
    const saturdaySchedule = days.find((d) => d.day === 'saturday')
    if (!saturdaySchedule || !saturdaySchedule.enabled) {
      alert('Please configure Saturday first, then apply to weekend.')
      return
    }

    const weekendIndices = [5, 6] // Sat-Sun
    const newDays = days.map((day, index) => {
      if (weekendIndices.includes(index)) {
        return {
          ...day,
          enabled: true,
          timeBlocks: [...saturdaySchedule.timeBlocks],
        }
      }
      return day
    })
    setDays(newDays)
  }

  const handleApplyToAll = () => {
    const firstEnabledDay = days.find((d) => d.enabled)
    if (!firstEnabledDay) {
      alert('Please configure at least one day first, then apply to all days.')
      return
    }

    const newDays = days.map((day) => ({
      ...day,
      enabled: true,
      timeBlocks: [...firstEnabledDay.timeBlocks],
    }))
    setDays(newDays)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Schedule name is required'
    }

    const enabledDays = days.filter((d) => d.enabled)
    if (enabledDays.length === 0) {
      newErrors.days = 'At least one day must be enabled'
    }

    // Validate time blocks
    enabledDays.forEach((day) => {
      day.timeBlocks.forEach((block) => {
        if (block.start >= block.end) {
          newErrors.days = 'End time must be after start time'
        }
      })
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) {
      return
    }

    const now = new Date()
    const savedSchedule: Schedule = {
      id: schedule?.id || `schedule-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      timezone,
      days,
      holidays: schedule?.holidays || [],
      createdAt: schedule?.createdAt || now,
      updatedAt: now,
    }

    onSave(savedSchedule)
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h4>

        <div className="space-y-4">
          <Input
            label="Schedule Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="e.g., Business Hours, Weekend Schedule"
            required
          />

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional description..."
            />
          </div>

          <Select
            label="Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            options={timezones}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={handleApplyToWeekdays}>
            Apply Monday to Weekdays
          </Button>
          <Button size="sm" variant="ghost" onClick={handleApplyToWeekend}>
            Apply Saturday to Weekend
          </Button>
          <Button size="sm" variant="ghost" onClick={handleApplyToAll}>
            Apply to All Days
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Configure one day, then use these buttons to copy the settings to other days.
        </p>
      </div>

      {/* Day Configuration */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Daily Hours</h4>
          {errors.days && <p className="text-sm text-red-600">{errors.days}</p>}
        </div>
        <div className="space-y-2">
          {days.map((day, index) => (
            <DayScheduleRow
              key={day.day}
              daySchedule={day}
              onChange={(updatedDay) => handleDayChange(index, updatedDay)}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save Schedule</Button>
      </div>
    </div>
  )
}

export default ScheduleEditor
