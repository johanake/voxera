import type { NodeType } from '@ucaas/shared'

interface NodeCategory {
  label: string
  nodes: NodeDefinition[]
}

interface NodeDefinition {
  type: NodeType
  label: string
  icon: React.ReactNode
  description: string
  color: string
}

const NodePalette = () => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const nodeCategories: NodeCategory[] = [
    {
      label: 'Entry & Routing',
      nodes: [
        {
          type: 'entry-point',
          label: 'Entry Point',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          ),
          description: 'Starting point for calls',
          color: 'text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200',
        },
        {
          type: 'queue',
          label: 'Queue',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
          description: 'Route to agent queue',
          color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200',
        },
        {
          type: 'calling-group',
          label: 'Calling Group',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
          description: 'Ring multiple extensions',
          color: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200',
        },
        {
          type: 'forward',
          label: 'Forward',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          description: 'Forward to individual',
          color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200',
        },
      ],
    },
    {
      label: 'Logic & Control',
      nodes: [
        {
          type: 'schedule',
          label: 'Schedule',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          description: 'Business hours routing',
          color: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
        },
        {
          type: 'ivr-menu',
          label: 'IVR Menu',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          ),
          description: 'Interactive menu',
          color: 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200',
        },
      ],
    },
    {
      label: 'Actions',
      nodes: [
        {
          type: 'announcement',
          label: 'Announcement',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          ),
          description: 'Play message',
          color: 'text-teal-600 bg-teal-50 hover:bg-teal-100 border-teal-200',
        },
        {
          type: 'voicemail',
          label: 'Voicemail',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          ),
          description: 'Leave voicemail',
          color: 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200',
        },
        {
          type: 'hangup',
          label: 'Hangup',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          description: 'End call',
          color: 'text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200',
        },
      ],
    },
  ]

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Node Library</h3>
      <p className="text-xs text-gray-500 mb-4">Drag and drop nodes onto the canvas</p>

      {nodeCategories.map((category) => (
        <div key={category.label} className="mb-6">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">{category.label}</h4>
          <div className="space-y-2">
            {category.nodes.map((node) => (
              <div
                key={node.type}
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
                className={`flex items-start p-3 rounded-lg border-2 cursor-move transition-colors ${node.color}`}
              >
                <div className="mr-2 mt-0.5">{node.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{node.label}</div>
                  <div className="text-xs opacity-75 mt-0.5">{node.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default NodePalette
