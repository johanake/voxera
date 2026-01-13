import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { IVRMenuNodeData } from '@ucaas/shared'
import { Badge } from '../../ui'

const IVRMenuNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as IVRMenuNodeData
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 border-l-4 border-l-orange-600 p-4 min-w-[200px] transition-all ${
        selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-gray-200'
      } ${!nodeData.valid ? 'border-red-500 bg-red-50 border-l-red-600' : ''}`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-orange-600 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <span className="text-xs font-medium text-gray-500 uppercase">IVR Menu</span>
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
        <div className="text-xs text-gray-600 line-clamp-2">{nodeData.menuPrompt}</div>
        <div className="flex flex-wrap gap-1">
          {nodeData.options.map((opt) => (
            <Badge key={opt.digit} variant="gray" size="sm">
              {opt.digit}
            </Badge>
          ))}
        </div>
        <div className="text-xs text-gray-500">
          {nodeData.options.length} option{nodeData.options.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
    </div>
  )
})

IVRMenuNode.displayName = 'IVRMenuNode'

export default IVRMenuNode
