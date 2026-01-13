import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { QueueNodeData } from '@ucaas/shared'
import { Badge } from '../../ui'

const QueueNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as QueueNodeData
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 border-l-4 border-l-blue-600 p-4 min-w-[200px] transition-all ${
        selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-gray-200'
      } ${!nodeData.valid ? 'border-red-500 bg-red-50 border-l-red-600' : ''}`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-blue-600 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="text-xs font-medium text-gray-500 uppercase">Queue</span>
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
        <div className="flex flex-wrap gap-2">
          <Badge variant="info" size="sm">
            {nodeData.agentUserIds.length} {nodeData.agentUserIds.length === 1 ? 'agent' : 'agents'}
          </Badge>
          <Badge variant="gray" size="sm">
            {nodeData.routingStrategy}
          </Badge>
        </div>
        {nodeData.maxWaitTime && (
          <div className="text-xs text-gray-500">Max wait: {nodeData.maxWaitTime}s</div>
        )}
      </div>

      {/* Output Handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="next"
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ left: '50%' }}
      />
      {nodeData.overflowAction && (
        <Handle
          type="source"
          position={Position.Right}
          id="overflow"
          className="w-3 h-3 bg-yellow-500 border-2 border-white"
        />
      )}
    </div>
  )
})

QueueNode.displayName = 'QueueNode'

export default QueueNode
