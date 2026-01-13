import { useState, useCallback, useMemo } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import type { QueueSystem, NodeData, Schedule } from '@ucaas/shared'
import { mockQueueSystems } from '../data/mockQueueSystems'
import { Button, Badge } from '../components/ui'
import FlowCanvas from '../components/pbx/FlowCanvas'
import NodePalette from '../components/pbx/NodePalette'
import PropertiesPanel from '../components/pbx/PropertiesPanel'
import SchedulePanel from '../components/pbx/schedule/SchedulePanel'
import { useToast } from '../contexts/ToastContext'

const PBX = () => {
  const toast = useToast()

  // Queue systems data
  const [queueSystems, setQueueSystems] = useState<QueueSystem[]>(mockQueueSystems)
  const [activeSystemId, setActiveSystemId] = useState<string | null>(
    queueSystems[0]?.id || null
  )

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false)
  const [showSchedulePanel, setShowSchedulePanel] = useState(false)
  const [showNodePalette, setShowNodePalette] = useState(true)
  const [showNewSystemModal, setShowNewSystemModal] = useState(false)

  // Derived state
  const activeSystem = useMemo(
    () => queueSystems.find((qs) => qs.id === activeSystemId),
    [queueSystems, activeSystemId]
  )

  const selectedNode = useMemo(
    () => activeSystem?.nodes.find((n) => n.id === selectedNodeId),
    [activeSystem, selectedNodeId]
  )

  // Handlers
  const handleTabSelect = useCallback((systemId: string) => {
    setActiveSystemId(systemId)
    setSelectedNodeId(null)
    setShowPropertiesPanel(false)
    setShowSchedulePanel(false)
  }, [])

  const handleNodeSelect = useCallback((node: NodeData | null) => {
    setSelectedNodeId(node?.id || null)
    if (node) {
      setShowPropertiesPanel(true)
      setShowSchedulePanel(false)
    } else {
      setShowPropertiesPanel(false)
    }
  }, [])

  const handleNodesChange = useCallback(
    (nodeData: NodeData[]) => {
      setQueueSystems((systems) =>
        systems.map((sys) =>
          sys.id === activeSystemId
            ? {
                ...sys,
                nodes: nodeData,
              }
            : sys
        )
      )
    },
    [activeSystemId]
  )

  const handleEdgesChange = useCallback(
    (edges: QueueSystem['edges']) => {
      setQueueSystems((systems) =>
        systems.map((sys) =>
          sys.id === activeSystemId
            ? {
                ...sys,
                edges,
              }
            : sys
        )
      )
    },
    [activeSystemId]
  )

  const handleCreateSystem = useCallback(
    (newSystem: QueueSystem) => {
      setQueueSystems((systems) => [...systems, newSystem])
      setActiveSystemId(newSystem.id)
      setShowNewSystemModal(false)
    },
    []
  )

  // TODO: Will be used in new system modal
  console.debug('Create system handler:', handleCreateSystem)

  const handleSave = useCallback(() => {
    if (activeSystem) {
      // Save to localStorage for now (Phase 1)
      localStorage.setItem('voxera-queue-systems', JSON.stringify(queueSystems))
      toast.success('Queue system saved successfully!')
    }
  }, [activeSystem, queueSystems, toast])

  const toggleSchedulePanel = useCallback(() => {
    setShowSchedulePanel((prev) => !prev)
    if (!showSchedulePanel) {
      setShowPropertiesPanel(false)
    }
  }, [showSchedulePanel])

  const handleSchedulesChange = useCallback(
    (schedules: Schedule[]) => {
      setQueueSystems((systems) =>
        systems.map((sys) =>
          sys.id === activeSystemId
            ? {
                ...sys,
                schedules,
              }
            : sys
        )
      )
    },
    [activeSystemId]
  )

  const handleNodeChange = useCallback(
    (updatedNode: NodeData) => {
      setQueueSystems((systems) =>
        systems.map((sys) =>
          sys.id === activeSystemId
            ? {
                ...sys,
                nodes: sys.nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n)),
              }
            : sys
        )
      )
    },
    [activeSystemId]
  )

  const getStatusColor = (status: QueueSystem['status']) => {
    const colors = {
      active: 'success' as const,
      draft: 'warning' as const,
      inactive: 'gray' as const,
      archived: 'gray' as const,
    }
    return colors[status]
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto flex-1">
            {queueSystems.map((system) => (
              <button
                key={system.id}
                onClick={() => handleTabSelect(system.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeSystemId === system.id
                    ? 'border-primary-300 text-primary-500'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span>{system.name}</span>
                <Badge
                  variant={getStatusColor(system.status)}
                  size="sm"
                  className="ml-2"
                >
                  {system.status}
                </Badge>
              </button>
            ))}

            <button
              onClick={() => setShowNewSystemModal(true)}
              className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 transition-colors whitespace-nowrap"
            >
              + New System
            </button>
          </div>

          {/* Toolbar Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleSchedulePanel}
              className={showSchedulePanel ? 'bg-gray-100' : ''}
            >
              <svg
                className="w-4 h-4 mr-2"
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
              Schedules
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Node Palette */}
        {showNodePalette && (
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="flex items-center justify-between p-4 pb-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Node Library</h3>
              <button
                onClick={() => setShowNodePalette(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <NodePalette />
          </div>
        )}

        {/* Toggle palette button when hidden */}
        {!showNodePalette && (
          <button
            onClick={() => setShowNodePalette(true)}
            className="absolute top-20 left-4 z-10 bg-white border border-gray-300 rounded p-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        {/* Center: Flow Canvas */}
        <div className="flex-1 relative bg-gray-100">
          {activeSystem ? (
            <ReactFlowProvider>
              <FlowCanvas
                queueSystem={activeSystem}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onNodeSelect={handleNodeSelect}
              />
            </ReactFlowProvider>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-sm">No queue system selected</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Properties Panel */}
        {showPropertiesPanel && selectedNode && (
          <div className="w-96 bg-white border-l border-gray-200 overflow-hidden">
            <PropertiesPanel
              node={selectedNode}
              onChange={handleNodeChange}
              onClose={() => setShowPropertiesPanel(false)}
            />
          </div>
        )}

        {/* Right: Schedule Panel */}
        {showSchedulePanel && activeSystem && (
          <div className="w-[500px] bg-white border-l border-gray-200 overflow-hidden">
            <SchedulePanel
              schedules={activeSystem.schedules}
              onChange={handleSchedulesChange}
              onClose={() => setShowSchedulePanel(false)}
            />
          </div>
        )}
      </div>

      {/* New System Modal (Placeholder) */}
      {showNewSystemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Queue System</h2>
            <p className="text-sm text-gray-600 mb-6">
              New system modal will be implemented later
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowNewSystemModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowNewSystemModal(false)}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PBX
