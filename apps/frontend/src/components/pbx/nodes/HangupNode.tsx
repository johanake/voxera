import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { HangupNodeData } from '@ucaas/shared'

const HangupNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as HangupNodeData
  return (
    <div
      className={`bg-white rounded-full shadow-sm border-2 p-3 w-24 h-24 flex items-center justify-center transition-all ${
        selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-red-300'
      } ${!nodeData.valid ? 'border-red-500 bg-red-50' : ''}`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />

      {/* Content */}
      <div className="text-center">
        <svg
          className="w-8 h-8 text-red-600 mx-auto mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <div className="text-xs font-semibold text-red-600">Hangup</div>
      </div>

      {/* No output handle - terminal node */}
    </div>
  )
})

HangupNode.displayName = 'HangupNode'

export default HangupNode
