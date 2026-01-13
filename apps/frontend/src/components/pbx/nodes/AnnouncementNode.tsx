import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { AnnouncementNodeData } from '@ucaas/shared'
import { Badge } from '../../ui'

const AnnouncementNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as AnnouncementNodeData
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 border-l-4 border-l-teal-600 p-4 min-w-[200px] transition-all ${
        selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-gray-200'
      } ${!nodeData.valid ? 'border-red-500 bg-red-50 border-l-red-600' : ''}`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-teal-500 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-teal-600 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
          <span className="text-xs font-medium text-gray-500 uppercase">Announcement</span>
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
        <div className="text-xs text-gray-600 line-clamp-2">{nodeData.message}</div>
        <div className="flex gap-2">
          {nodeData.textToSpeech && (
            <Badge variant="info" size="sm">
              TTS
            </Badge>
          )}
          {nodeData.skipable && (
            <Badge variant="gray" size="sm">
              Skipable
            </Badge>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-teal-500 border-2 border-white"
      />
    </div>
  )
})

AnnouncementNode.displayName = 'AnnouncementNode'

export default AnnouncementNode
