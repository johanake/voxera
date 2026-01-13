import type { Schedule } from '@ucaas/shared'
import { Button, Badge } from '../../ui'

interface ScheduleListProps {
  schedules: Schedule[]
  onEdit: (scheduleId: string) => void
  onDelete: (scheduleId: string) => void
  onCreate: () => void
}

const ScheduleList = ({ schedules, onEdit, onDelete, onCreate }: ScheduleListProps) => {
  const getDaysEnabled = (schedule: Schedule): string => {
    const enabledDays = schedule.days.filter((d) => d.enabled).map((d) => d.day)
    if (enabledDays.length === 0) return 'No days enabled'
    if (enabledDays.length === 7) return 'All days'
    if (enabledDays.length === 5 && !enabledDays.includes('saturday') && !enabledDays.includes('sunday')) {
      return 'Weekdays'
    }
    if (enabledDays.length === 2 && enabledDays.includes('saturday') && enabledDays.includes('sunday')) {
      return 'Weekends'
    }
    return `${enabledDays.length} days`
  }

  const getTotalTimeBlocks = (schedule: Schedule): number => {
    return schedule.days.reduce((total, day) => total + (day.enabled ? day.timeBlocks.length : 0), 0)
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules yet</h3>
        <p className="text-sm text-gray-600 mb-6">
          Create your first business hours schedule to route calls based on time of day.
        </p>
        <Button onClick={onCreate}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Schedule
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onCreate} size="sm">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Schedule
        </Button>
      </div>

      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-base font-semibold text-gray-900">{schedule.name}</h4>
                  <Badge variant="info" size="sm">
                    {schedule.timezone}
                  </Badge>
                </div>

                {schedule.description && (
                  <p className="text-sm text-gray-600 mb-3">{schedule.description}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{getDaysEnabled(schedule)}</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5 text-gray-400"
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
                    <span>{getTotalTimeBlocks(schedule)} time blocks</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onEdit(schedule.id)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit schedule"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(schedule.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete schedule"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScheduleList
