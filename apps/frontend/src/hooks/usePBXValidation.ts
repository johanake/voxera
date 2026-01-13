import type {
  NodeData,
  QueueNodeData,
  CallingGroupNodeData,
  ForwardNodeData,
  ScheduleNodeData,
  AnnouncementNodeData,
  IVRMenuNodeData,
  VoicemailNodeData,
  EntryPointNodeData,
  QueueSystem,
} from '@ucaas/shared'

/**
 * Validation errors keyed by field name
 */
export type ValidationErrors = Record<string, string>

/**
 * Validate a single node based on its type
 */
export const validateNode = (node: NodeData): ValidationErrors => {
  const errors: ValidationErrors = {}

  // Common validations
  if (!node.label?.trim()) {
    errors.label = 'Label is required'
  }

  // Type-specific validations
  switch (node.type) {
    case 'entry-point': {
      const entryNode = node as EntryPointNodeData
      if (!entryNode.phoneNumberId) {
        errors.phoneNumberId = 'Phone number is required'
      }
      if (!entryNode.description?.trim()) {
        errors.description = 'Description is required'
      }
      break
    }

    case 'queue': {
      const queueNode = node as QueueNodeData
      if (!queueNode.agentUserIds || queueNode.agentUserIds.length === 0) {
        errors.agents = 'At least one agent is required'
      }
      if (queueNode.maxWaitTime && (queueNode.maxWaitTime < 10 || queueNode.maxWaitTime > 3600)) {
        errors.maxWaitTime = 'Max wait time must be between 10 and 3600 seconds'
      }
      if (queueNode.maxQueueSize && queueNode.maxQueueSize < 1) {
        errors.maxQueueSize = 'Max queue size must be at least 1'
      }
      if (queueNode.overflowAction && !queueNode.overflowTargetNodeId) {
        errors.overflowTarget = 'Overflow target is required when overflow action is set'
      }
      break
    }

    case 'calling-group': {
      const groupNode = node as CallingGroupNodeData
      if (!groupNode.extensions || groupNode.extensions.length === 0) {
        errors.extensions = 'At least one extension is required'
      }
      if (groupNode.ringDuration < 5 || groupNode.ringDuration > 120) {
        errors.ringDuration = 'Ring duration must be between 5 and 120 seconds'
      }
      break
    }

    case 'forward': {
      const forwardNode = node as ForwardNodeData
      if (!forwardNode.targetUserId) {
        errors.targetUserId = 'Target user is required'
      }
      if (forwardNode.ringDuration && (forwardNode.ringDuration < 5 || forwardNode.ringDuration > 120)) {
        errors.ringDuration = 'Ring duration must be between 5 and 120 seconds'
      }
      break
    }

    case 'schedule': {
      const scheduleNode = node as ScheduleNodeData
      if (!scheduleNode.scheduleId) {
        errors.scheduleId = 'Schedule is required'
      }
      if (!scheduleNode.withinHoursTargetNodeId) {
        errors.withinHoursTarget = 'Within hours target is required'
      }
      if (!scheduleNode.outsideHoursTargetNodeId) {
        errors.outsideHoursTarget = 'Outside hours target is required'
      }
      break
    }

    case 'announcement': {
      const announcementNode = node as AnnouncementNodeData
      if (!announcementNode.message?.trim()) {
        errors.message = 'Message is required'
      }
      if (announcementNode.textToSpeech && !announcementNode.nextNodeId) {
        errors.nextNode = 'Next node is required'
      }
      break
    }

    case 'ivr-menu': {
      const ivrNode = node as IVRMenuNodeData
      if (!ivrNode.menuPrompt?.trim()) {
        errors.menuPrompt = 'Menu prompt is required'
      }
      if (!ivrNode.options || ivrNode.options.length === 0) {
        errors.options = 'At least one menu option is required'
      } else {
        // Check for duplicate digits
        const digits = ivrNode.options.map((o) => o.digit)
        const duplicates = digits.filter((d, i) => digits.indexOf(d) !== i)
        if (duplicates.length > 0) {
          errors.options = `Duplicate digits: ${[...new Set(duplicates)].join(', ')}`
        }

        // Check that all options have labels
        const missingLabels = ivrNode.options.filter((o) => !o.label?.trim())
        if (missingLabels.length > 0) {
          errors.options = 'All options must have labels'
        }
      }
      if (ivrNode.timeout < 3 || ivrNode.timeout > 60) {
        errors.timeout = 'Timeout must be between 3 and 60 seconds'
      }
      if (ivrNode.invalidRetries < 1 || ivrNode.invalidRetries > 5) {
        errors.invalidRetries = 'Invalid retries must be between 1 and 5'
      }
      break
    }

    case 'voicemail': {
      const voicemailNode = node as VoicemailNodeData
      if (!voicemailNode.mailboxUserId) {
        errors.mailboxUserId = 'Mailbox user is required'
      }
      break
    }

    case 'hangup': {
      // Hangup nodes only need a label
      break
    }
  }

  return errors
}

/**
 * Validate an entire queue system
 */
export const validateQueueSystem = (system: QueueSystem): string[] => {
  const errors: string[] = []

  // Check for at least one entry point
  const entryPoints = system.nodes.filter((n) => n.type === 'entry-point')
  if (entryPoints.length === 0) {
    errors.push('Queue system must have at least one entry point')
  }

  // Check for orphaned nodes (nodes not reachable from any entry point)
  const reachableNodeIds = findReachableNodes(system)
  const orphanedNodes = system.nodes.filter(
    (n) => !reachableNodeIds.has(n.id) && n.type !== 'entry-point'
  )
  if (orphanedNodes.length > 0) {
    errors.push(
      `${orphanedNodes.length} node(s) are not reachable from entry points: ${orphanedNodes
        .map((n) => n.label)
        .join(', ')}`
    )
  }

  // Check for dangling connections
  system.edges.forEach((edge) => {
    const sourceExists = system.nodes.some((n) => n.id === edge.source)
    const targetExists = system.nodes.some((n) => n.id === edge.target)
    if (!sourceExists) {
      errors.push(`Edge ${edge.id} has invalid source node`)
    }
    if (!targetExists) {
      errors.push(`Edge ${edge.id} has invalid target node`)
    }
  })

  // Check for cycles without exit (infinite loops)
  if (hasInfiniteLoop(system)) {
    errors.push('Queue system has routing loops without exit points')
  }

  // Validate each node
  system.nodes.forEach((node) => {
    const nodeErrors = validateNode(node)
    if (Object.keys(nodeErrors).length > 0) {
      errors.push(
        `Node "${node.label}" has validation errors: ${Object.values(nodeErrors).join(', ')}`
      )
    }
  })

  return errors
}

/**
 * Find all nodes reachable from entry points using BFS
 */
const findReachableNodes = (system: QueueSystem): Set<string> => {
  const reachable = new Set<string>()
  const entryPoints = system.nodes.filter((n) => n.type === 'entry-point').map((n) => n.id)
  const queue = [...entryPoints]

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    if (reachable.has(nodeId)) continue

    reachable.add(nodeId)

    // Find all edges from this node
    const outgoingEdges = system.edges.filter((e) => e.source === nodeId)
    outgoingEdges.forEach((edge) => {
      if (!reachable.has(edge.target)) {
        queue.push(edge.target)
      }
    })
  }

  return reachable
}

/**
 * Check for infinite loops (cycles without terminal nodes)
 */
const hasInfiniteLoop = (system: QueueSystem): boolean => {
  const terminalTypes = ['voicemail', 'hangup']

  // Build adjacency list
  const graph = new Map<string, string[]>()
  system.nodes.forEach((node) => {
    graph.set(node.id, [])
  })
  system.edges.forEach((edge) => {
    const neighbors = graph.get(edge.source) || []
    neighbors.push(edge.target)
    graph.set(edge.source, neighbors)
  })

  // DFS to detect cycles
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  const hasCycle = (nodeId: string): boolean => {
    visited.add(nodeId)
    recursionStack.add(nodeId)

    const neighbors = graph.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) {
          return true
        }
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle - check if it contains a terminal node
        const node = system.nodes.find((n) => n.id === neighbor)
        if (node && !terminalTypes.includes(node.type)) {
          return true
        }
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  // Check from all entry points
  const entryPoints = system.nodes.filter((n) => n.type === 'entry-point')
  for (const entry of entryPoints) {
    if (hasCycle(entry.id)) {
      return true
    }
  }

  return false
}

/**
 * Hook to use validation in components
 */
export const usePBXValidation = () => {
  return {
    validateNode,
    validateQueueSystem,
  }
}
