import { useState } from 'react'
import type {
  NodeData,
  EntryPointNodeData,
  QueueNodeData,
  CallingGroupNodeData,
  ForwardNodeData,
  ScheduleNodeData,
  AnnouncementNodeData,
  IVRMenuNodeData,
  VoicemailNodeData,
  HangupNodeData,
} from '@ucaas/shared'
import { Button } from '../ui'
import { validateNode, type ValidationErrors } from '../../hooks/usePBXValidation'

// Import property form components
import QueueProperties from './properties/QueueProperties'
import CallingGroupProperties from './properties/CallingGroupProperties'
import ForwardProperties from './properties/ForwardProperties'
import ScheduleProperties from './properties/ScheduleProperties'
import AnnouncementProperties from './properties/AnnouncementProperties'
import IVRMenuProperties from './properties/IVRMenuProperties'
import VoicemailProperties from './properties/VoicemailProperties'
import EntryPointProperties from './properties/EntryPointProperties'
import HangupProperties from './properties/HangupProperties'

interface PropertiesPanelProps {
  node: NodeData
  onChange: (updatedNode: NodeData) => void
  onClose: () => void
}

const PropertiesPanel = ({ node, onChange, onClose }: PropertiesPanelProps) => {
  const [formData, setFormData] = useState<NodeData>(node)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (updatedData: Partial<NodeData>) => {
    setFormData((prev) => ({ ...prev, ...updatedData } as NodeData))
    setHasChanges(true)
    // Clear errors for changed fields
    const newErrors = { ...errors }
    Object.keys(updatedData).forEach((key) => {
      delete newErrors[key]
    })
    setErrors(newErrors)
  }

  const handleSave = () => {
    // Validate the node
    const validationErrors = validateNode(formData)

    if (Object.keys(validationErrors).length === 0) {
      // Update with validation success
      onChange({
        ...formData,
        valid: true,
        validationErrors: [],
      })
      onClose()
    } else {
      // Show validation errors
      setErrors(validationErrors)
      // Update node with validation failure
      onChange({
        ...formData,
        valid: false,
        validationErrors: Object.values(validationErrors),
      })
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      const confirmDiscard = window.confirm('You have unsaved changes. Discard them?')
      if (!confirmDiscard) return
    }
    onClose()
  }

  const renderProperties = () => {
    switch (node.type) {
      case 'entry-point':
        return <EntryPointProperties data={formData as EntryPointNodeData} onChange={handleChange} errors={errors} />
      case 'queue':
        return <QueueProperties data={formData as QueueNodeData} onChange={handleChange} errors={errors} />
      case 'calling-group':
        return <CallingGroupProperties data={formData as CallingGroupNodeData} onChange={handleChange} errors={errors} />
      case 'forward':
        return <ForwardProperties data={formData as ForwardNodeData} onChange={handleChange} errors={errors} />
      case 'schedule':
        return <ScheduleProperties data={formData as ScheduleNodeData} onChange={handleChange} errors={errors} />
      case 'announcement':
        return <AnnouncementProperties data={formData as AnnouncementNodeData} onChange={handleChange} errors={errors} />
      case 'ivr-menu':
        return <IVRMenuProperties data={formData as IVRMenuNodeData} onChange={handleChange} errors={errors} />
      case 'voicemail':
        return <VoicemailProperties data={formData as VoicemailNodeData} onChange={handleChange} errors={errors} />
      case 'hangup':
        return <HangupProperties data={formData as HangupNodeData} onChange={handleChange} errors={errors} />
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No properties available for this node type</p>
          </div>
        )
    }
  }

  const getNodeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'entry-point': 'Entry Point',
      queue: 'Queue',
      'calling-group': 'Calling Group',
      forward: 'Forward',
      schedule: 'Schedule',
      announcement: 'Announcement',
      'ivr-menu': 'IVR Menu',
      voicemail: 'Voicemail',
      hangup: 'Hangup',
    }
    return labels[type] || type
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Node Properties</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center">
          <span className="text-xs font-medium text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded">
            {getNodeTypeLabel(node.type)}
          </span>
          {hasChanges && (
            <span className="ml-2 text-xs text-yellow-600 font-medium">• Unsaved changes</span>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {renderProperties()}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {Object.keys(errors).length > 0 && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <div className="font-medium mb-1">Validation errors:</div>
            <ul className="list-disc list-inside space-y-0.5">
              {Object.values(errors).map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PropertiesPanel
