import type { PrismaClient, ChatGroupMessage, ChatGroupMessageRead } from '@prisma/client'

export class ChatGroupMessageRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new chat group message
   */
  async create(
    chatGroupId: string,
    fromUserId: string,
    content: string
  ): Promise<ChatGroupMessage> {
    return this.prisma.chatGroupMessage.create({
      data: {
        chatGroupId,
        fromUserId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            extension: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        readBy: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * Get messages for a chat group with pagination
   */
  async getChatGroupMessages(
    chatGroupId: string,
    limit: number = 50,
    before?: string
  ): Promise<ChatGroupMessage[]> {
    return this.prisma.chatGroupMessage.findMany({
      where: {
        chatGroupId,
        ...(before && {
          id: { lt: before },
        }),
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            extension: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        readBy: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    })
  }

  /**
   * Mark a message as read by a user
   */
  async markAsRead(messageId: string, userId: string): Promise<ChatGroupMessageRead> {
    return this.prisma.chatGroupMessageRead.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      create: {
        messageId,
        userId,
      },
      update: {
        readAt: new Date(),
      },
      include: {
        user: {
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
   * Mark all messages in a chat group as read by a user up to a specific message
   */
  async markChatGroupMessagesAsRead(
    chatGroupId: string,
    userId: string,
    upToMessageId: string
  ): Promise<number> {
    // Get all message IDs up to the specified message
    const messages = await this.prisma.chatGroupMessage.findMany({
      where: {
        chatGroupId,
        id: { lte: upToMessageId },
        fromUserId: { not: userId }, // Don't mark own messages as read
      },
      select: {
        id: true,
      },
    })

    const messageIds = messages.map((m) => m.id)

    // Create read receipts for messages not already marked as read
    const result = await this.prisma.chatGroupMessageRead.createMany({
      data: messageIds.map((messageId) => ({
        messageId,
        userId,
      })),
      skipDuplicates: true,
    })

    return result.count
  }

  /**
   * Get read count for a specific message
   */
  async getReadCount(messageId: string): Promise<number> {
    return this.prisma.chatGroupMessageRead.count({
      where: {
        messageId,
      },
    })
  }

  /**
   * Get unread count for a user in a chat group
   */
  async getUnreadCountForUser(chatGroupId: string, userId: string): Promise<number> {
    // Count messages in the group that are not sent by the user
    // and don't have a read receipt from the user
    const unreadCount = await this.prisma.chatGroupMessage.count({
      where: {
        chatGroupId,
        fromUserId: { not: userId },
        readBy: {
          none: {
            userId,
          },
        },
      },
    })

    return unreadCount
  }

  /**
   * Get last message for a chat group
   */
  async getLastMessage(chatGroupId: string): Promise<ChatGroupMessage | null> {
    return this.prisma.chatGroupMessage.findFirst({
      where: {
        chatGroupId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    })
  }

  /**
   * Get message by ID
   */
  async getById(messageId: string): Promise<ChatGroupMessage | null> {
    return this.prisma.chatGroupMessage.findUnique({
      where: {
        id: messageId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            extension: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        readBy: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })
  }
}
