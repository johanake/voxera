import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { VoicemailNodeData } from '@ucaas/shared'
import { Badge } from '../../ui'

const VoicemailNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as VoicemailNodeData
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 border-l-4 border-l-red-600 p-4 min-w-[200px] transition-all ${
        selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-gray-200'
      } ${!nodeData.valid ? 'border-red-500 bg-red-50 border-l-red-600' : ''}`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-red-600 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs font-medium text-gray-500 uppercase">Voicemail</span>
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
          <span>User ID: {nodeData.mailboxUserId}</span>
        </div>
        <div className="flex gap-2">
          {nodeData.transcriptionEnabled && (
            <Badge variant="info" size="sm">
              Transcription
            </Badge>
          )}
          {nodeData.emailNotification && (
            <Badge variant="success" size="sm">
              Email
            </Badge>
          )}
        </div>
      </div>

      {/* No output handle - terminal node */}
    </div>
  )
})

VoicemailNode.displayName = 'VoicemailNode'

export default VoicemailNode
