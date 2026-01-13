import type { DaySchedule, TimeBlock } from '@ucaas/shared'
import TimeBlockInput from './TimeBlockInput'

interface DayScheduleRowProps {
  daySchedule: DaySchedule
  onChange: (daySchedule: DaySchedule) => void
}

const dayLabels: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

const DayScheduleRow = ({ daySchedule, onChange }: DayScheduleRowProps) => {
  const handleToggle = () => {
    if (!daySchedule.enabled) {
      // When enabling, add a default time block if none exist
      const newTimeBlocks =
        daySchedule.timeBlocks.length > 0
          ? daySchedule.timeBlocks
          : [{ start: '09:00', end: '17:00' }]
      onChange({ ...daySchedule, enabled: true, timeBlocks: newTimeBlocks })
    } else {
      onChange({ ...daySchedule, enabled: false })
    }
  }

  const handleTimeBlockChange = (index: number, timeBlock: TimeBlock) => {
    const newTimeBlocks = [...daySchedule.timeBlocks]
    newTimeBlocks[index] = timeBlock
    onChange({ ...daySchedule, timeBlocks: newTimeBlocks })
  }

  const handleAddTimeBlock = () => {
    const newTimeBlocks = [...daySchedule.timeBlocks, { start: '09:00', end: '17:00' }]
    onChange({ ...daySchedule, timeBlocks: newTimeBlocks })
  }

  const handleRemoveTimeBlock = (index: number) => {
    const newTimeBlocks = daySchedule.timeBlocks.filter((_, i) => i !== index)
    onChange({ ...daySchedule, timeBlocks: newTimeBlocks })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start space-x-4">
        {/* Day name and toggle */}
        <div className="w-32 flex-shrink-0">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={daySchedule.enabled}
              onChange={handleToggle}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-900">
              {dayLabels[daySchedule.day]}
            </span>
          </label>
        </div>

        {/* Time blocks */}
        <div className="flex-1">
          {daySchedule.enabled ? (
            <div className="space-y-2">
              {daySchedule.timeBlocks.map((timeBlock, index) => (
                <TimeBlockInput
                  key={index}
                  timeBlock={timeBlock}
                  onChange={(tb) => handleTimeBlockChange(index, tb)}
                  onRemove={() => handleRemoveTimeBlock(index)}
                  showRemove={daySchedule.timeBlocks.length > 1}
                />
              ))}
              <button
                type="button"
                onClick={handleAddTimeBlock}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add time block
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Closed</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DayScheduleRow
