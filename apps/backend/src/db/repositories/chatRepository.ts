import type { PrismaClient, ChatMessage } from '@prisma/client'

export class ChatRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    id: string
    fromUserId: string
    toUserId: string
    content: string
    timestamp: Date
    read: boolean
  }): Promise<ChatMessage> {
    return this.prisma.chatMessage.create({ data })
  }

  async getConversation(
    userId1: string,
    userId2: string,
    limit = 100
  ): Promise<ChatMessage[]> {
    return this.prisma.chatMessage
      .findMany({
        where: {
          OR: [
            { fromUserId: userId1, toUserId: userId2 },
            { fromUserId: userId2, toUserId: userId1 },
          ],
        },
        include: {
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
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      })
      .then((messages: ChatMessage[]) => messages.reverse()) // Oldest first
  }

  async getById(messageId: string): Promise<ChatMessage | null> {
    return this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
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
      },
    })
  }

  async markAsRead(fromUserId: string, toUserId: string): Promise<void> {
    await this.prisma.chatMessage.updateMany({
      where: {
        fromUserId,
        toUserId,
        read: false,
      },
      data: { read: true },
    })
  }

  async getUnreadCount(toUserId: string, fromUserId: string): Promise<number> {
    return this.prisma.chatMessage.count({
      where: {
        toUserId,
        fromUserId,
        read: false,
      },
    })
  }
}
