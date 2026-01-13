import type { PrismaClient, ChatGroup, ChatGroupMember, ChatGroupMemberRole } from '@prisma/client'

export class ChatGroupRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new chat group with initial members
   */
  async createChatGroup(
    name: string,
    createdBy: string,
    memberIds: string[]
  ): Promise<ChatGroup> {
    return this.prisma.chatGroup.create({
      data: {
        name,
        createdBy,
        members: {
          create: [
            // Creator is admin
            { userId: createdBy, role: 'admin' },
            // Other members
            ...memberIds
              .filter((id) => id !== createdBy)
              .map((userId) => ({
                userId,
                role: 'member' as ChatGroupMemberRole,
              })),
          ],
        },
      },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                extension: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })
  }

  /**
   * Get chat group by ID with active members
   */
  async getGroup(chatGroupId: string): Promise<ChatGroup | null> {
    return this.prisma.chatGroup.findUnique({
      where: {
        id: chatGroupId,
        deletedAt: null,
      },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                extension: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })
  }

  /**
   * Get all chat groups for a user
   */
  async getUserGroups(userId: string): Promise<ChatGroup[]> {
    return this.prisma.chatGroup.findMany({
      where: {
        deletedAt: null,
        members: {
          some: {
            userId,
            leftAt: null,
          },
        },
      },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                extension: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        lastActivity: 'desc',
      },
    })
  }

  /**
   * Add a member to a chat group
   */
  async addMember(
    chatGroupId: string,
    userId: string,
    role: ChatGroupMemberRole = 'member'
  ): Promise<ChatGroupMember> {
    return this.prisma.chatGroupMember.create({
      data: {
        chatGroupId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            extension: true,
          },
        },
      },
    })
  }

  /**
   * Remove a member from a chat group (soft delete)
   */
  async removeMember(chatGroupId: string, userId: string): Promise<ChatGroupMember> {
    return this.prisma.chatGroupMember.updateMany({
      where: {
        chatGroupId,
        userId,
        leftAt: null,
      },
      data: {
        leftAt: new Date(),
      },
    }) as any
  }

  /**
   * Update chat group name
   */
  async updateChatGroupName(chatGroupId: string, name: string): Promise<ChatGroup> {
    return this.prisma.chatGroup.update({
      where: { id: chatGroupId },
      data: {
        name,
        updatedAt: new Date(),
      },
    })
  }

  /**
   * Delete chat group (soft delete)
   */
  async deleteChatGroup(chatGroupId: string): Promise<ChatGroup> {
    return this.prisma.chatGroup.update({
      where: { id: chatGroupId },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  /**
   * Get member role in chat group
   */
  async getMemberRole(chatGroupId: string, userId: string): Promise<ChatGroupMemberRole | null> {
    const member = await this.prisma.chatGroupMember.findFirst({
      where: {
        chatGroupId,
        userId,
        leftAt: null,
      },
      select: {
        role: true,
      },
    })

    return member?.role || null
  }

  /**
   * Get active member count for a chat group
   */
  async getActiveMemberCount(chatGroupId: string): Promise<number> {
    return this.prisma.chatGroupMember.count({
      where: {
        chatGroupId,
        leftAt: null,
      },
    })
  }

  /**
   * Update last activity timestamp
   */
  async updateLastActivity(chatGroupId: string): Promise<void> {
    await this.prisma.chatGroup.update({
      where: { id: chatGroupId },
      data: {
        lastActivity: new Date(),
      },
    })
  }

  /**
   * Check if user is member of chat group
   */
  async isMember(chatGroupId: string, userId: string): Promise<boolean> {
    const count = await this.prisma.chatGroupMember.count({
      where: {
        chatGroupId,
        userId,
        leftAt: null,
      },
    })

    return count > 0
  }

  /**
   * Check if user is admin of chat group
   */
  async isAdmin(chatGroupId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.chatGroupMember.findFirst({
      where: {
        chatGroupId,
        userId,
        leftAt: null,
        role: 'admin',
      },
    })

    return !!member
  }
}
