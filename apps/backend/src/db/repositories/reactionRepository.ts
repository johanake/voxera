import { PrismaClient, MessageReaction } from '@prisma/client'

export class ReactionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    messageId: string
    userId: string
    emoji: string
  }): Promise<MessageReaction> {
    return this.prisma.messageReaction.create({ data })
  }

  async delete(messageId: string, userId: string, emoji: string): Promise<void> {
    await this.prisma.messageReaction.delete({
      where: {
        messageId_userId_emoji: { messageId, userId, emoji },
      },
    })
  }

  async getByMessage(messageId: string): Promise<MessageReaction[]> {
    return this.prisma.messageReaction.findMany({
      where: { messageId },
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

  async toggle(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<{ action: 'added' | 'removed' }> {
    const existing = await this.prisma.messageReaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
    })

    if (existing) {
      await this.delete(messageId, userId, emoji)
      return { action: 'removed' }
    } else {
      await this.create({ messageId, userId, emoji })
      return { action: 'added' }
    }
  }
}
