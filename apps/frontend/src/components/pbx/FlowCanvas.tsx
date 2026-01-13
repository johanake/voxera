import { useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { QueueSystem, NodeData, NodeType } from '@ucaas/shared'
import { Button } from '../ui'
import { useToast } from '../../contexts/ToastContext'

// Import node components
import QueueNode from './nodes/QueueNode'
import CallingGroupNode from './nodes/CallingGroupNode'
import ForwardNode from './nodes/ForwardNode'
import ScheduleNode from './nodes/ScheduleNode'
import AnnouncementNode from './nodes/AnnouncementNode'
import IVRMenuNode from './nodes/IVRMenuNode'
import VoicemailNode from './nodes/VoicemailNode'
import EntryPointNode from './nodes/EntryPointNode'
import HangupNode from './nodes/HangupNode'

// Import edge components
import DefaultEdge from './edges/DefaultEdge'
import ConditionalEdge from './edges/ConditionalEdge'
import TimeoutEdge from './edges/TimeoutEdge'

// Define node types mapping
const nodeTypes = {
  'entry-point': EntryPointNode,
  queue: QueueNode,
  'calling-group': CallingGroupNode,
  forward: ForwardNode,
  schedule: ScheduleNode,
  announcement: AnnouncementNode,
  'ivr-menu': IVRMenuNode,
  voicemail: VoicemailNode,
  hangup: HangupNode,
}

// Define edge types mapping
const edgeTypes = {
  default: DefaultEdge,
  conditional: ConditionalEdge,
  timeout: TimeoutEdge,
}

interface FlowCanvasProps {
  queueSystem: QueueSystem
  onNodesChange: (nodeData: NodeData[]) => void
  onEdgesChange: (edges: QueueSystem['edges']) => void
  onNodeSelect: (node: NodeData | null) => void
}

// Convert NodeData to React Flow Node format
const toReactFlowNodes = (nodeData: NodeData[]): Node[] => {
  return nodeData.map((data, index) => ({
    id: data.id,
    type: data.type,
    data: data as unknown as Record<string, unknown>,
    position: {
      x: 400, // Single column centered
      y: 100 + index * 250, // Stack vertically with 250px spacing
    },
  }))
}

// Convert QueueSystem edges to React Flow edges
const toReactFlowEdges = (edges: QueueSystem['edges']): Edge[] => {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type || 'default',
    label: edge.label,
    animated: edge.animated,
  }))
}

// Helper function to create default node data based on type
const createDefaultNodeData = (type: NodeType): NodeData => {
  const baseId = `${type}-${Date.now()}`
  const baseData = {
    id: baseId,
    type,
    label: `New ${type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
    valid: false,
    validationErrors: [],
  }

  // Type-specific defaults
  switch (type) {
    case 'entry-point':
      return { ...baseData, type: 'entry-point', phoneNumberId: '', description: '' }
    case 'queue':
      return {
        ...baseData,
        type: 'queue',
        agentUserIds: [],
        routingStrategy: 'round-robin',
        recordCalls: false,
      }
    case 'calling-group':
      return {
        ...baseData,
        type: 'calling-group',
        extensions: [],
        rotationType: 'simultaneous',
        ringDuration: 30,
        voicemailEnabled: false,
      }
    case 'forward':
      return { ...baseData, type: 'forward', targetUserId: '' }
    case 'schedule':
      return { ...baseData, type: 'schedule', scheduleId: '' }
    case 'announcement':
      return { ...baseData, type: 'announcement', message: '', textToSpeech: true, skipable: false }
    case 'ivr-menu':
      return {
        ...baseData,
        type: 'ivr-menu',
        menuPrompt: '',
        options: [],
        timeout: 5,
        invalidRetries: 3,
      }
    case 'voicemail':
      return {
        ...baseData,
        type: 'voicemail',
        mailboxUserId: '',
        transcriptionEnabled: false,
        emailNotification: false,
      }
    case 'hangup':
      return { ...baseData, type: 'hangup' }
    default:
      throw new Error(`Unknown node type: ${type}`)
  }
}

const FlowCanvas = ({ queueSystem, onNodesChange, onEdgesChange, onNodeSelect }: FlowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()
  const toast = useToast()

  // Initialize nodes and edges from queue system
  const [nodes, setNodes, handleNodesChange] = useNodesState(toReactFlowNodes(queueSystem.nodes))
  const [edges, setEdges, handleEdgesChange] = useEdgesState(toReactFlowEdges(queueSystem.edges))

  // Get node color for minimap
  const getNodeColor = useCallback((node: Node) => {
    const colors: Record<string, string> = {
      'entry-point': '#9CA3AF',
      queue: '#3B82F6',
      'calling-group': '#10B981',
      forward: '#8B5CF6',
      schedule: '#F59E0B',
      announcement: '#14B8A6',
      'ivr-menu': '#F97316',
      voicemail: '#EF4444',
      hangup: '#DC2626',
    }
    return colors[node.type || 'default'] || '#6B7280'
  }, [])

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect(node.data as unknown as NodeData)
    },
    [onNodeSelect]
  )

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    onNodeSelect(null)
  }, [onNodeSelect])

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      // Validate connection
      if (connection.source === connection.target) {
        toast.error('Cannot connect a node to itself')
        return
      }

      // Get source and target node data
      const sourceNode = queueSystem.nodes.find((n) => n.id === connection.source)
      const targetNode = queueSystem.nodes.find((n) => n.id === connection.target)

      if (!sourceNode || !targetNode) {
        toast.error('Invalid connection: Node not found')
        return
      }

      // Terminal nodes cannot have outgoing connections
      const terminalTypes: NodeType[] = ['voicemail', 'hangup']
      if (terminalTypes.includes(sourceNode.type)) {
        toast.error(`${sourceNode.type} nodes cannot have outgoing connections (they are terminal nodes)`)
        return
      }

      // Entry point nodes cannot have incoming connections
      if (targetNode.type === 'entry-point') {
        toast.error('Entry point nodes cannot have incoming connections (they are starting points)')
        return
      }

      // Create edge with default type
      setEdges((eds) => addEdge({ ...connection, type: 'default' }, eds))
      toast.success('Connection created successfully')
    },
    [setEdges, queueSystem.nodes, toast]
  )

  // Sync nodes to parent when they change
  useEffect(() => {
    const nodeData = nodes.map((n) => n.data as unknown as NodeData)
    onNodesChange(nodeData)
  }, [nodes, onNodesChange])

  // Sync edges to parent when they change
  useEffect(() => {
    const edgeData = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label as string | undefined,
      type: (e.type as 'default' | 'conditional' | 'timeout') || 'default',
      condition: undefined,
      animated: e.animated,
    }))
    onEdgesChange(edgeData)
  }, [edges, onEdgesChange])

  // Proactive node layout
  const onLayout = useCallback(() => {
    // Simple auto-layout: arrange nodes vertically (top to bottom)
    setNodes((nds) =>
      nds.map((node, index) => ({
        ...node,
        position: {
          x: 400, // Single column centered
          y: 100 + index * 250, // Stack vertically with 250px spacing
        },
      }))
    )
  }, [setNodes])

  // Handle drag over (required for drop to work)
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle drop from palette
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow') as NodeType
      if (!type) return

      // Get drop position
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      // Create new node data
      const newNodeData = createDefaultNodeData(type)

      // Add node to React Flow
      const newNode: Node = {
        id: newNodeData.id,
        type: newNodeData.type,
        position,
        data: newNodeData as unknown as Record<string, unknown>,
      }

      setNodes((nds) => nds.concat(newNode))

      // Update parent with new node data
      const allNodeData = [...queueSystem.nodes, newNodeData]
      onNodesChange(allNodeData)

      // Auto-select the new node and open properties
      onNodeSelect(newNodeData)
    },
    [screenToFlowPosition, setNodes, queueSystem.nodes, onNodesChange, onNodeSelect]
  )

  // Handle node deletion
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      // Get IDs of deleted nodes
      const deletedIds = new Set(deleted.map((n) => n.id))

      // Update parent with remaining nodes
      const remainingNodes = queueSystem.nodes.filter((n) => !deletedIds.has(n.id))
      onNodesChange(remainingNodes)

      // Close properties panel if deleted node was selected
      onNodeSelect(null)
    },
    [queueSystem.nodes, onNodesChange, onNodeSelect]
  )

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes as any}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={2}
        deleteKeyCode="Delete"
      >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
      <Controls showInteractive={false} />
      <MiniMap
        nodeColor={getNodeColor}
        className="bg-gray-100 border-2 border-gray-300 rounded"
        maskColor="rgba(0, 0, 0, 0.1)"
      />
      <Panel position="top-right" className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={onLayout}>
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            Auto Layout
          </Button>
        </div>
      </Panel>
      </ReactFlow>
    </div>
  )
}

export default FlowCanvas
