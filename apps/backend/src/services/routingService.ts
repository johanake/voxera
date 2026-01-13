import type { PrismaClient } from '@prisma/client'
import type { RoutingConditions } from '@ucaas/shared'

interface RoutingResult {
  targetUserId: string
  targetExtension: string
}

export class RoutingService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Evaluate routing rules for an incoming PSTN call
   * Returns the target user to receive the call, or null if no route found
   */
  async evaluateRouting(
    phoneNumberId: string,
    callerNumber: string
  ): Promise<RoutingResult | null> {
    // Fetch all enabled rules for this phone number, ordered by priority (ascending)
    const rules = await this.prisma.pBXRoutingRule.findMany({
      where: {
        phoneNumberId,
        enabled: true,
      },
      orderBy: {
        priority: 'asc', // Lower priority number = higher priority
      },
    })

    const now = new Date()

    // Evaluate each rule in priority order
    for (const rule of rules) {
      const conditions = rule.conditions as RoutingConditions

      // Check if this rule's conditions match
      if (this.matchesConditions(conditions, callerNumber, now)) {
        // Rule matched! Check the target type
        if (rule.targetType === 'user' && rule.targetUserId) {
          // Fetch the target user
          const user = await this.prisma.user.findUnique({
            where: { id: rule.targetUserId },
            select: {
              id: true,
              extension: true,
              status: true,
            },
          })

          // Check if user is valid and active
          if (user?.extension && user.status === 'active') {
            return {
              targetUserId: user.id,
              targetExtension: user.extension,
            }
          }
        }
        // TODO: Handle other target types (IVR, voicemail, external)
      }
    }

    // No matching rule found, check for default assignment
    const phoneNumber = await this.prisma.phoneNumber.findUnique({
      where: { id: phoneNumberId },
    })

    // If phone number is directly assigned to a user, use that
    if (phoneNumber?.assignmentType === 'user' && phoneNumber.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: phoneNumber.assignedToId },
        select: {
          id: true,
          extension: true,
          status: true,
        },
      })

      if (user?.extension && user.status === 'active') {
        return {
          targetUserId: user.id,
          targetExtension: user.extension,
        }
      }
    }

    // No valid routing found
    return null
  }

  /**
   * Check if routing conditions match the current call
   */
  private matchesConditions(
    conditions: RoutingConditions,
    callerNumber: string,
    now: Date
  ): boolean {
    // If no conditions specified, rule always matches
    if (
      !conditions ||
      (Object.keys(conditions).length === 0 &&
        (!conditions.callerIds || conditions.callerIds.length === 0) &&
        (!conditions.daysOfWeek || conditions.daysOfWeek.length === 0) &&
        (!conditions.timeRanges || conditions.timeRanges.length === 0))
    ) {
      return true
    }

    // Match caller ID patterns
    if (conditions.callerIds && conditions.callerIds.length > 0) {
      const matchesCallerId = conditions.callerIds.some((pattern) => {
        // Support exact match or wildcard patterns
        if (pattern.includes('*')) {
          const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
          return regex.test(callerNumber)
        }
        return callerNumber === pattern
      })

      if (!matchesCallerId) {
        return false
      }
    }

    // Match day of week (0=Sunday, 6=Saturday)
    if (conditions.daysOfWeek && conditions.daysOfWeek.length > 0) {
      const currentDay = now.getDay()
      if (!conditions.daysOfWeek.includes(currentDay)) {
        return false
      }
    }

    // Match time ranges (HH:MM format, 24-hour)
    if (conditions.timeRanges && conditions.timeRanges.length > 0) {
      const currentTime = now.toTimeString().slice(0, 5) // Get "HH:MM"

      const matchesAnyTimeRange = conditions.timeRanges.some((range) => {
        // Simple string comparison works for HH:MM format
        return currentTime >= range.start && currentTime <= range.end
      })

      if (!matchesAnyTimeRange) {
        return false
      }
    }

    // All conditions matched
    return true
  }

  /**
   * Create a default routing rule for a phone number
   * Useful for quick setup: route all calls to a specific user
   */
  async createDefaultRule(
    phoneNumberId: string,
    customerId: string,
    targetUserId: string
  ): Promise<void> {
    await this.prisma.pBXRoutingRule.create({
      data: {
        phoneNumberId,
        customerId,
        name: 'Default Route - All Calls',
        priority: 999, // Low priority (evaluated last)
        enabled: true,
        conditions: {}, // No conditions = always match
        targetType: 'user',
        targetUserId,
      },
    })
  }

  /**
   * Create a business hours routing rule
   * Routes calls to a user during business hours (Mon-Fri, 9am-5pm)
   */
  async createBusinessHoursRule(
    phoneNumberId: string,
    customerId: string,
    targetUserId: string,
    startTime: string = '09:00',
    endTime: string = '17:00'
  ): Promise<void> {
    await this.prisma.pBXRoutingRule.create({
      data: {
        phoneNumberId,
        customerId,
        name: 'Business Hours Route',
        priority: 10, // High priority
        enabled: true,
        conditions: {
          daysOfWeek: [1, 2, 3, 4, 5], // Monday-Friday
          timeRanges: [{ start: startTime, end: endTime }],
        },
        targetType: 'user',
        targetUserId,
        fallbackAction: 'voicemail',
      },
    })
  }
}
