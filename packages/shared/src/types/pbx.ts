// PBX and IVR Queue System Types

// ============================================================================
// Node Types
// ============================================================================

export type NodeType =
  | 'entry-point'
  | 'queue'
  | 'calling-group'
  | 'forward'
  | 'schedule'
  | 'announcement'
  | 'ivr-menu'
  | 'voicemail'
  | 'hangup'

// ============================================================================
// Routing and Strategy Types
// ============================================================================

export type RoutingStrategy = 'round-robin' | 'longest-idle' | 'skills-based' | 'all-agents'
export type RotationType = 'simultaneous' | 'sequential' | 'round-robin'
export type OverflowAction = 'voicemail' | 'forward' | 'hangup' | 'callback'

// ============================================================================
// Schedule Types
// ============================================================================

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface TimeBlock {
  start: string // HH:MM format (e.g., "09:00")
  end: string // HH:MM format (e.g., "17:00")
}

export interface DaySchedule {
  day: DayOfWeek
  enabled: boolean
  timeBlocks: TimeBlock[]
}

export interface Schedule {
  id: string
  name: string
  description?: string
  timezone: string
  days: DaySchedule[]
  holidays?: Date[]
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Node Data Interfaces
// ============================================================================

export interface BaseNodeData {
  id: string
  type: NodeType
  label: string
  description?: string
  valid?: boolean
  validationErrors?: string[]
}

export interface QueueNodeData extends BaseNodeData {
  type: 'queue'
  agentUserIds: string[]
  routingStrategy: RoutingStrategy
  maxWaitTime?: number // seconds
  maxQueueSize?: number
  overflowAction?: OverflowAction
  overflowTargetNodeId?: string
  recordCalls: boolean
}

export interface CallingGroupNodeData extends BaseNodeData {
  type: 'calling-group'
  extensions: string[]
  rotationType: RotationType
  ringDuration: number // seconds
  voicemailEnabled: boolean
}

export interface ForwardNodeData extends BaseNodeData {
  type: 'forward'
  targetUserId: string
  ringDuration?: number
  conditions?: ForwardCondition[]
  fallbackNodeId?: string
}

export interface ForwardCondition {
  type: 'time' | 'caller-id' | 'queue-depth'
  operator: 'equals' | 'greater-than' | 'less-than' | 'contains'
  value: string | number
}

export interface ScheduleNodeData extends BaseNodeData {
  type: 'schedule'
  scheduleId: string
  scheduleName?: string // Denormalized for display
  withinHoursTargetNodeId?: string
  outsideHoursTargetNodeId?: string
}

export interface AnnouncementNodeData extends BaseNodeData {
  type: 'announcement'
  message: string
  audioFileUrl?: string
  textToSpeech: boolean
  skipable: boolean
  nextNodeId?: string
}

export interface IVRMenuNodeData extends BaseNodeData {
  type: 'ivr-menu'
  menuPrompt: string
  audioFileUrl?: string
  options: IVROption[]
  timeout: number
  invalidRetries: number
  invalidTargetNodeId?: string
  timeoutTargetNodeId?: string
}

export interface IVROption {
  digit: string // '0'-'9', '*', '#'
  label: string
  targetNodeId?: string
}

export interface VoicemailNodeData extends BaseNodeData {
  type: 'voicemail'
  mailboxUserId: string
  greetingMessage?: string
  transcriptionEnabled: boolean
  emailNotification: boolean
}

export interface EntryPointNodeData extends BaseNodeData {
  type: 'entry-point'
  phoneNumberId: string
  phoneNumber?: string // Denormalized
  description: string
}

export interface HangupNodeData extends BaseNodeData {
  type: 'hangup'
  reason?: string
}

export type NodeData =
  | QueueNodeData
  | CallingGroupNodeData
  | ForwardNodeData
  | ScheduleNodeData
  | AnnouncementNodeData
  | IVRMenuNodeData
  | VoicemailNodeData
  | EntryPointNodeData
  | HangupNodeData

// ============================================================================
// Edge Types
// ============================================================================

export interface FlowEdge {
  id: string
  source: string
  target: string
  label?: string
  type?: 'default' | 'conditional' | 'timeout'
  condition?: string
  animated?: boolean
}

// ============================================================================
// Queue System Types
// ============================================================================

export type QueueSystemStatus = 'draft' | 'active' | 'inactive' | 'archived'

export interface QueueSystem {
  id: string
  customerId: string
  name: string
  description?: string
  status: QueueSystemStatus
  nodes: NodeData[]
  edges: FlowEdge[]
  schedules: Schedule[]
  viewport?: {
    x: number
    y: number
    zoom: number
  }
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// ============================================================================
// Helper Types
// ============================================================================

export interface QueueSystemGroup {
  bundleName: string
  tierName: string
  systems: QueueSystem[]
}

// ============================================================================
// Utility Types for React Flow Integration
// ============================================================================

export interface ReactFlowNode<T extends NodeData = NodeData> {
  id: string
  type: NodeType
  data: T
  position: { x: number; y: number }
  selected?: boolean
}

export interface ReactFlowEdge extends FlowEdge {
  sourceHandle?: string
  targetHandle?: string
}
