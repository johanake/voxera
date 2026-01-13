import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { EntryPointNodeData } from '@ucaas/shared'

const EntryPointNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as EntryPointNodeData
  return (
    <div
      className={`bg-white rounded-lg shadow-md border-2 p-4 min-w-[220px] transition-all ${
        selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-gray-300'
      } ${!nodeData.valid ? 'border-red-500 bg-red-50' : ''}`}
    >
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-500 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase">Entry Point</div>
            <div className="text-sm font-semibold text-gray-900">{nodeData.label}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1 mt-3">
        {nodeData.phoneNumber && (
          <div className="flex items-center text-xs text-gray-600">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span className="font-medium">{nodeData.phoneNumber}</span>
          </div>
        )}
        {nodeData.description && (
          <div className="text-xs text-gray-500">{nodeData.description}</div>
        )}
      </div>

      {/* Validation indicator */}
      {!nodeData.valid && nodeData.validationErrors && nodeData.validationErrors.length > 0 && (
        <div className="mt-2 flex items-start space-x-1">
          <svg className="w-3 h-3 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-xs text-red-600">{nodeData.validationErrors[0]}</div>
        </div>
      )}
    </div>
  )
})

EntryPointNode.displayName = 'EntryPointNode'

export default EntryPointNode
