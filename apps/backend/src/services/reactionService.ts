import { ReactionRepository } from '../db/repositories/reactionRepository.js'

const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉']

export class ReactionService {
  constructor(private reactionRepository: ReactionRepository) {}

  async toggleReaction(messageId: string, userId: string, emoji: string) {
    // Validate emoji
    if (!ALLOWED_EMOJIS.includes(emoji)) {
      throw new Error(`Invalid emoji. Allowed: ${ALLOWED_EMOJIS.join(', ')}`)
    }

    return this.reactionRepository.toggle(messageId, userId, emoji)
  }

  async getReactions(messageId: string) {
    return this.reactionRepository.getByMessage(messageId)
  }
}
