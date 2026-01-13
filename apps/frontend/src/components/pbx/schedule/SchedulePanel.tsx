import { useState } from 'react'
import type { Schedule } from '@ucaas/shared'
import ScheduleList from './ScheduleList'
import ScheduleEditor from './ScheduleEditor'

interface SchedulePanelProps {
  schedules: Schedule[]
  onChange: (schedules: Schedule[]) => void
  onClose: () => void
}

type ViewMode = 'list' | 'create' | 'edit'

const SchedulePanel = ({ schedules, onChange, onClose }: SchedulePanelProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)

  const handleCreate = () => {
    setViewMode('create')
    setEditingScheduleId(null)
  }

  const handleEdit = (scheduleId: string) => {
    setEditingScheduleId(scheduleId)
    setViewMode('edit')
  }

  const handleDelete = (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      onChange(schedules.filter((s) => s.id !== scheduleId))
    }
  }

  const handleSave = (schedule: Schedule) => {
    if (viewMode === 'create') {
      // Add new schedule
      onChange([...schedules, schedule])
    } else {
      // Update existing schedule
      onChange(schedules.map((s) => (s.id === schedule.id ? schedule : s)))
    }
    setViewMode('list')
    setEditingScheduleId(null)
  }

  const handleCancel = () => {
    setViewMode('list')
    setEditingScheduleId(null)
  }

  const editingSchedule = editingScheduleId ? schedules.find((s) => s.id === editingScheduleId) : null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {viewMode === 'list' && 'Business Hours Schedules'}
            {viewMode === 'create' && 'Create Schedule'}
            {viewMode === 'edit' && 'Edit Schedule'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
        {viewMode === 'list' && (
          <p className="text-sm text-gray-600">
            Manage business hours schedules for routing calls based on time of day.
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {viewMode === 'list' && (
          <ScheduleList
            schedules={schedules}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
          />
        )}

        {viewMode === 'create' && (
          <ScheduleEditor onSave={handleSave} onCancel={handleCancel} />
        )}

        {viewMode === 'edit' && editingSchedule && (
          <ScheduleEditor schedule={editingSchedule} onSave={handleSave} onCancel={handleCancel} />
        )}
      </div>

      {/* Footer with info */}
      {viewMode === 'list' && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
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
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">How to use schedules</p>
              <p className="text-gray-600">
                Add a Schedule node to your queue system and select one of these schedules. Calls will
                be routed differently based on whether they occur within or outside business hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchedulePanel
