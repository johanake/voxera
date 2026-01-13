import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { ScheduleNodeData } from '@ucaas/shared'
import { Badge } from '../../ui'

const ScheduleNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as ScheduleNodeData
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 border-l-4 border-l-yellow-600 p-4 min-w-[200px] transition-all ${
        selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-gray-200'
      } ${!nodeData.valid ? 'border-red-500 bg-red-50 border-l-red-600' : ''}`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-yellow-500 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-yellow-600 mr-2"
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
          <span className="text-xs font-medium text-gray-500 uppercase">Schedule</span>
        </div>
        {!nodeData.valid && (
          <Badge variant="danger" size="sm">
            !
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-900">{nodeData.label}</div>
        {nodeData.scheduleName && (
          <div className="flex items-center text-xs text-gray-600">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium">{nodeData.scheduleName}</span>
          </div>
        )}
      </div>

      {/* Output Handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="within-hours"
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="outside-hours"
        className="w-3 h-3 bg-gray-500 border-2 border-white"
        style={{ left: '70%' }}
      />
    </div>
  )
})

ScheduleNode.displayName = 'ScheduleNode'

export default ScheduleNode
