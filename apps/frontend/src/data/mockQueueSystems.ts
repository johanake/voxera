import type {
  QueueSystem,
  Schedule,
  QueueNodeData,
  CallingGroupNodeData,
  ForwardNodeData,
  ScheduleNodeData,
  AnnouncementNodeData,
  IVRMenuNodeData,
  VoicemailNodeData,
  EntryPointNodeData,
  HangupNodeData,
} from '@ucaas/shared'

// ============================================================================
// Mock Schedules
// ============================================================================

export const mockSchedules: Schedule[] = [
  {
    id: 'schedule-1',
    name: 'Business Hours',
    description: 'Standard weekday business hours',
    timezone: 'Europe/Stockholm',
    days: [
      {
        day: 'monday',
        enabled: true,
        timeBlocks: [
          { start: '09:00', end: '12:00' },
          { start: '13:00', end: '17:00' },
        ],
      },
      {
        day: 'tuesday',
        enabled: true,
        timeBlocks: [
          { start: '09:00', end: '12:00' },
          { start: '13:00', end: '17:00' },
        ],
      },
      {
        day: 'wednesday',
        enabled: true,
        timeBlocks: [
          { start: '09:00', end: '12:00' },
          { start: '13:00', end: '17:00' },
        ],
      },
      {
        day: 'thursday',
        enabled: true,
        timeBlocks: [
          { start: '09:00', end: '12:00' },
          { start: '13:00', end: '17:00' },
        ],
      },
      {
        day: 'friday',
        enabled: true,
        timeBlocks: [
          { start: '09:00', end: '12:00' },
          { start: '13:00', end: '16:00' },
        ],
      },
      {
        day: 'saturday',
        enabled: false,
        timeBlocks: [],
      },
      {
        day: 'sunday',
        enabled: false,
        timeBlocks: [],
      },
    ],
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  },
  {
    id: 'schedule-2',
    name: '24/7 Support',
    description: 'Always available - all day, every day',
    timezone: 'Europe/Stockholm',
    days: [
      {
        day: 'monday',
        enabled: true,
        timeBlocks: [{ start: '00:00', end: '23:59' }],
      },
      {
        day: 'tuesday',
        enabled: true,
        timeBlocks: [{ start: '00:00', end: '23:59' }],
      },
      {
        day: 'wednesday',
        enabled: true,
        timeBlocks: [{ start: '00:00', end: '23:59' }],
      },
      {
        day: 'thursday',
        enabled: true,
        timeBlocks: [{ start: '00:00', end: '23:59' }],
      },
      {
        day: 'friday',
        enabled: true,
        timeBlocks: [{ start: '00:00', end: '23:59' }],
      },
      {
        day: 'saturday',
        enabled: true,
        timeBlocks: [{ start: '00:00', end: '23:59' }],
      },
      {
        day: 'sunday',
        enabled: true,
        timeBlocks: [{ start: '00:00', end: '23:59' }],
      },
    ],
    createdAt: new Date('2024-01-05T10:00:00Z'),
    updatedAt: new Date('2024-01-05T10:00:00Z'),
  },
]

// ============================================================================
// Mock Queue Systems
// ============================================================================

export const mockQueueSystems: QueueSystem[] = [
  // System 1: Main Sales Line with Business Hours
  {
    id: 'queue-sys-1',
    customerId: 'cust-1',
    name: 'Main Sales Line',
    description: 'Primary inbound sales routing with business hours check',
    status: 'active',
    nodes: [
      {
        id: 'node-1',
        type: 'entry-point',
        label: 'Incoming Call',
        phoneNumberId: 'num-1',
        phoneNumber: '+46 8 123 4567',
        description: 'Main sales number',
        valid: true,
      } as EntryPointNodeData,
      {
        id: 'node-2',
        type: 'schedule',
        label: 'Business Hours Check',
        scheduleId: 'schedule-1',
        scheduleName: 'Business Hours',
        withinHoursTargetNodeId: 'node-3',
        outsideHoursTargetNodeId: 'node-6',
        valid: true,
      } as ScheduleNodeData,
      {
        id: 'node-3',
        type: 'announcement',
        label: 'Welcome Message',
        message:
          'Thank you for calling Voxera. You will be connected to our sales team.',
        textToSpeech: true,
        skipable: false,
        nextNodeId: 'node-4',
        valid: true,
      } as AnnouncementNodeData,
      {
        id: 'node-4',
        type: 'queue',
        label: 'Sales Queue',
        agentUserIds: ['user-1', 'user-2'],
        routingStrategy: 'longest-idle',
        maxWaitTime: 300,
        maxQueueSize: 10,
        overflowAction: 'voicemail',
        overflowTargetNodeId: 'node-5',
        recordCalls: true,
        valid: true,
      } as QueueNodeData,
      {
        id: 'node-5',
        type: 'voicemail',
        label: 'Sales Voicemail',
        mailboxUserId: 'user-1',
        transcriptionEnabled: true,
        emailNotification: true,
        valid: true,
      } as VoicemailNodeData,
      {
        id: 'node-6',
        type: 'announcement',
        label: 'After Hours Message',
        message:
          'Our offices are currently closed. Please call back during business hours: Monday-Friday 9 AM to 5 PM.',
        textToSpeech: true,
        skipable: false,
        nextNodeId: 'node-7',
        valid: true,
      } as AnnouncementNodeData,
      {
        id: 'node-7',
        type: 'voicemail',
        label: 'After Hours Voicemail',
        mailboxUserId: 'user-1',
        greetingMessage: 'Please leave a message after the beep.',
        transcriptionEnabled: true,
        emailNotification: true,
        valid: true,
      } as VoicemailNodeData,
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'default',
      },
      {
        id: 'edge-2',
        source: 'node-2',
        target: 'node-3',
        label: 'Business Hours',
        type: 'conditional',
      },
      {
        id: 'edge-3',
        source: 'node-2',
        target: 'node-6',
        label: 'After Hours',
        type: 'conditional',
      },
      {
        id: 'edge-4',
        source: 'node-3',
        target: 'node-4',
        type: 'default',
      },
      {
        id: 'edge-5',
        source: 'node-4',
        target: 'node-5',
        label: 'Overflow',
        type: 'timeout',
      },
      {
        id: 'edge-6',
        source: 'node-6',
        target: 'node-7',
        type: 'default',
      },
    ],
    schedules: [mockSchedules[0]],
    viewport: {
      x: 100,
      y: 100,
      zoom: 1,
    },
    createdAt: new Date('2024-01-10T10:00:00Z'),
    updatedAt: new Date('2024-01-12T14:30:00Z'),
    createdBy: 'user-1',
  },

  // System 2: Support Hotline with IVR Menu
  {
    id: 'queue-sys-2',
    customerId: 'cust-1',
    name: 'Support Hotline',
    description: 'Technical support with IVR menu routing',
    status: 'active',
    nodes: [
      {
        id: 'node-1',
        type: 'entry-point',
        label: 'Support Line',
        phoneNumberId: 'num-2',
        phoneNumber: '+46 8 999 0000',
        description: 'Support hotline',
        valid: true,
      } as EntryPointNodeData,
      {
        id: 'node-2',
        type: 'ivr-menu',
        label: 'Support Menu',
        menuPrompt:
          'Press 1 for technical support, 2 for billing, or 3 for general inquiries.',
        options: [
          { digit: '1', label: 'Technical Support', targetNodeId: 'node-3' },
          { digit: '2', label: 'Billing', targetNodeId: 'node-4' },
          { digit: '3', label: 'General', targetNodeId: 'node-5' },
        ],
        timeout: 10,
        invalidRetries: 3,
        invalidTargetNodeId: 'node-6',
        textToSpeech: true,
        valid: true,
      } as IVRMenuNodeData,
      {
        id: 'node-3',
        type: 'queue',
        label: 'Tech Support Queue',
        agentUserIds: ['user-2'],
        routingStrategy: 'round-robin',
        maxWaitTime: 180,
        recordCalls: true,
        valid: true,
      } as QueueNodeData,
      {
        id: 'node-4',
        type: 'calling-group',
        label: 'Billing Team',
        extensions: ['101', '102', '103'],
        rotationType: 'simultaneous',
        ringDuration: 30,
        voicemailEnabled: true,
        valid: true,
      } as CallingGroupNodeData,
      {
        id: 'node-5',
        type: 'forward',
        label: 'Forward to Manager',
        targetUserId: 'user-1',
        ringDuration: 30,
        valid: true,
      } as ForwardNodeData,
      {
        id: 'node-6',
        type: 'hangup',
        label: 'Invalid Selection',
        reason: 'Too many invalid selections',
        valid: true,
      } as HangupNodeData,
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'default',
      },
      {
        id: 'edge-2',
        source: 'node-2',
        target: 'node-3',
        label: '1',
        type: 'conditional',
      },
      {
        id: 'edge-3',
        source: 'node-2',
        target: 'node-4',
        label: '2',
        type: 'conditional',
      },
      {
        id: 'edge-4',
        source: 'node-2',
        target: 'node-5',
        label: '3',
        type: 'conditional',
      },
      {
        id: 'edge-5',
        source: 'node-2',
        target: 'node-6',
        label: 'Invalid',
        type: 'conditional',
      },
    ],
    schedules: [],
    viewport: {
      x: 50,
      y: 50,
      zoom: 1,
    },
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T09:00:00Z'),
    createdBy: 'user-1',
  },

  // System 3: Customer Service (Draft)
  {
    id: 'queue-sys-3',
    customerId: 'cust-1',
    name: 'Customer Service',
    description: 'General customer service line - under development',
    status: 'draft',
    nodes: [
      {
        id: 'node-1',
        type: 'entry-point',
        label: 'Customer Service Line',
        phoneNumberId: 'num-3',
        phoneNumber: '+46 8 555 1234',
        description: 'General customer service',
        valid: true,
      } as EntryPointNodeData,
      {
        id: 'node-2',
        type: 'queue',
        label: 'Customer Service Queue',
        agentUserIds: ['user-1', 'user-2', 'user-3'],
        routingStrategy: 'all-agents',
        maxWaitTime: 240,
        maxQueueSize: 20,
        recordCalls: true,
        valid: true,
      } as QueueNodeData,
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'default',
      },
    ],
    schedules: [],
    viewport: {
      x: 150,
      y: 150,
      zoom: 1,
    },
    createdAt: new Date('2024-01-20T11:00:00Z'),
    updatedAt: new Date('2024-01-20T11:00:00Z'),
    createdBy: 'user-1',
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a queue system by ID
 */
export const getQueueSystemById = (id: string): QueueSystem | undefined => {
  return mockQueueSystems.find((system) => system.id === id)
}

/**
 * Get all schedules for a queue system
 */
export const getSchedulesForSystem = (systemId: string): Schedule[] => {
  const system = getQueueSystemById(systemId)
  return system?.schedules || []
}

/**
 * Get a schedule by ID across all systems
 */
export const getScheduleById = (scheduleId: string): Schedule | undefined => {
  return mockSchedules.find((schedule) => schedule.id === scheduleId)
}
