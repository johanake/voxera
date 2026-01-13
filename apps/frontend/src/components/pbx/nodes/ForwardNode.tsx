import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { ForwardNodeData } from '@ucaas/shared'
import { Badge } from '../../ui'

const ForwardNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as ForwardNodeData
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 border-l-4 border-l-purple-600 p-4 min-w-[200px] transition-all ${
        selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-gray-200'
      } ${!nodeData.valid ? 'border-red-500 bg-red-50 border-l-red-600' : ''}`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-purple-600 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs font-medium text-gray-500 uppercase">Forward</span>
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
        <div className="flex items-center text-xs text-gray-600">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>User ID: {nodeData.targetUserId}</span>
        </div>
        {nodeData.ringDuration && (
          <div className="text-xs text-gray-500">Ring: {nodeData.ringDuration}s</div>
        )}
      </div>

      {/* Output Handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="next"
        className="w-3 h-3 bg-purple-500 border-2 border-white"
        style={{ left: '50%' }}
      />
      {nodeData.fallbackNodeId && (
        <Handle
          type="source"
          position={Position.Right}
          id="fallback"
          className="w-3 h-3 bg-yellow-500 border-2 border-white"
        />
      )}
    </div>
  )
})

ForwardNode.displayName = 'ForwardNode'

export default ForwardNode
