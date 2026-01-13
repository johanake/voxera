import type { TimeBlock } from '@ucaas/shared'

interface TimeBlockInputProps {
  timeBlock: TimeBlock
  onChange: (timeBlock: TimeBlock) => void
  onRemove: () => void
  showRemove?: boolean
}

const TimeBlockInput = ({ timeBlock, onChange, onRemove, showRemove = true }: TimeBlockInputProps) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 flex-1">
        <div className="flex-1">
          <input
            type="time"
            value={timeBlock.start}
            onChange={(e) => onChange({ ...timeBlock, start: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <span className="text-gray-500 font-medium">to</span>
        <div className="flex-1">
          <input
            type="time"
            value={timeBlock.end}
            onChange={(e) => onChange({ ...timeBlock, end: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>
      {showRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove time block"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

export default TimeBlockInput
