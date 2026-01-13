import type { ChatGroup, ChatGroupMember, ChatGroupMessage, ChatGroupMemberRole } from '@prisma/client'
import { ChatGroupRepository } from '../db/repositories/chatGroupRepository.js'
import { ChatGroupMessageRepository } from '../db/repositories/chatGroupMessageRepository.js'

const MAX_MEMBERS = 50
const MIN_NAME_LENGTH = 1
const MAX_NAME_LENGTH = 100

export class ChatGroupService {
  constructor(
    private chatGroupRepo: ChatGroupRepository,
    private chatGroupMessageRepo: ChatGroupMessageRepository
  ) {}

  /**
   * Create a new chat group
   */
  async createChatGroup(
    name: string,
    createdBy: string,
    memberIds: string[]
  ): Promise<ChatGroup> {
    // Validate name
    if (!name || name.trim().length < MIN_NAME_LENGTH) {
      throw new Error('Chat group name is required')
    }
    if (name.length > MAX_NAME_LENGTH) {
      throw new Error(`Chat group name must not exceed ${MAX_NAME_LENGTH} characters`)
    }

    // Ensure creator is included in members
    const allMemberIds = Array.from(new Set([createdBy, ...memberIds]))

    // Validate member count
    if (allMemberIds.length > MAX_MEMBERS) {
      throw new Error(`Chat group cannot have more than ${MAX_MEMBERS} members`)
    }

    return this.chatGroupRepo.createChatGroup(name.trim(), createdBy, allMemberIds)
  }

  /**
   * Get chat group by ID
   */
  async getChatGroup(chatGroupId: string, userId: string): Promise<ChatGroup | null> {
    const group = await this.chatGroupRepo.getGroup(chatGroupId)

    if (!group) {
      return null
    }

    // Verify user is a member
    const isMember = await this.chatGroupRepo.isMember(chatGroupId, userId)
    if (!isMember) {
      throw new Error('You are not a member of this chat group')
    }

    return group
  }

  /**
   * Get all chat groups for a user
   */
  async getUserChatGroups(userId: string): Promise<ChatGroup[]> {
    return this.chatGroupRepo.getUserGroups(userId)
  }

  /**
   * Add member to chat group (admin only)
   */
  async addMember(
    chatGroupId: string,
    userId: string,
    requestingUserId: string
  ): Promise<ChatGroupMember> {
    // Check if requesting user is admin
    const isAdmin = await this.chatGroupRepo.isAdmin(chatGroupId, requestingUserId)
    if (!isAdmin) {
      throw new Error('Only admins can add members to the chat group')
    }

    // Check member count
    const currentCount = await this.chatGroupRepo.getActiveMemberCount(chatGroupId)
    if (currentCount >= MAX_MEMBERS) {
      throw new Error(`Chat group cannot have more than ${MAX_MEMBERS} members`)
    }

    // Check if user is already a member
    const isMember = await this.chatGroupRepo.isMember(chatGroupId, userId)
    if (isMember) {
      throw new Error('User is already a member of this chat group')
    }

    return this.chatGroupRepo.addMember(chatGroupId, userId)
  }

  /**
   * Remove member from chat group (admin only)
   */
  async removeMember(
    chatGroupId: string,
    userId: string,
    requestingUserId: string
  ): Promise<ChatGroupMember> {
    // Check if requesting user is admin
    const isAdmin = await this.chatGroupRepo.isAdmin(chatGroupId, requestingUserId)
    if (!isAdmin) {
      throw new Error('Only admins can remove members from the chat group')
    }

    // Cannot remove the creator
    const group = await this.chatGroupRepo.getGroup(chatGroupId)
    if (group?.createdBy === userId) {
      throw new Error('Cannot remove the creator from the chat group')
    }

    return this.chatGroupRepo.removeMember(chatGroupId, userId)
  }

  /**
   * Leave chat group
   */
  async leaveChatGroup(chatGroupId: string, userId: string): Promise<void> {
    const isMember = await this.chatGroupRepo.isMember(chatGroupId, userId)
    if (!isMember) {
      throw new Error('You are not a member of this chat group')
    }

    await this.chatGroupRepo.removeMember(chatGroupId, userId)

    // If last member leaves, delete the group
    const remainingCount = await this.chatGroupRepo.getActiveMemberCount(chatGroupId)
    if (remainingCount === 0) {
      await this.chatGroupRepo.deleteChatGroup(chatGroupId)
    }
  }

  /**
   * Update chat group name (admin only)
   */
  async updateChatGroupName(
    chatGroupId: string,
    name: string,
    requestingUserId: string
  ): Promise<ChatGroup> {
    // Validate name
    if (!name || name.trim().length < MIN_NAME_LENGTH) {
      throw new Error('Chat group name is required')
    }
    if (name.length > MAX_NAME_LENGTH) {
      throw new Error(`Chat group name must not exceed ${MAX_NAME_LENGTH} characters`)
    }

    // Check if requesting user is admin
    const isAdmin = await this.chatGroupRepo.isAdmin(chatGroupId, requestingUserId)
    if (!isAdmin) {
      throw new Error('Only admins can update the chat group name')
    }

    return this.chatGroupRepo.updateChatGroupName(chatGroupId, name.trim())
  }

  /**
   * Delete chat group (admin only)
   */
  async deleteChatGroup(chatGroupId: string, requestingUserId: string): Promise<ChatGroup> {
    // Check if requesting user is admin
    const isAdmin = await this.chatGroupRepo.isAdmin(chatGroupId, requestingUserId)
    if (!isAdmin) {
      throw new Error('Only admins can delete the chat group')
    }

    return this.chatGroupRepo.deleteChatGroup(chatGroupId)
  }

  /**
   * Send message to chat group
   */
  async sendMessage(
    chatGroupId: string,
    fromUserId: string,
    content: string
  ): Promise<ChatGroupMessage> {
    // Verify user is a member
    const isMember = await this.chatGroupRepo.isMember(chatGroupId, fromUserId)
    if (!isMember) {
      throw new Error('You are not a member of this chat group')
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Message content is required')
    }

    const message = await this.chatGroupMessageRepo.create(chatGroupId, fromUserId, content.trim())

    // Update last activity
    await this.chatGroupRepo.updateLastActivity(chatGroupId)

    return message
  }

  /**
   * Get messages for a chat group
   */
  async getChatGroupMessages(
    chatGroupId: string,
    userId: string,
    limit: number = 50,
    before?: string
  ): Promise<{ messages: ChatGroupMessage[]; hasMore: boolean }> {
    // Verify user is a member
    const isMember = await this.chatGroupRepo.isMember(chatGroupId, userId)
    if (!isMember) {
      throw new Error('You are not a member of this chat group')
    }

    const messages = await this.chatGroupMessageRepo.getChatGroupMessages(
      chatGroupId,
      limit + 1,
      before
    )

    const hasMore = messages.length > limit
    const resultMessages = hasMore ? messages.slice(0, limit) : messages

    return {
      messages: resultMessages.reverse(), // Oldest first
      hasMore,
    }
  }

  /**
   * Mark chat group messages as read
   */
  async markMessagesAsRead(
    chatGroupId: string,
    userId: string,
    upToMessageId: string
  ): Promise<number> {
    // Verify user is a member
    const isMember = await this.chatGroupRepo.isMember(chatGroupId, userId)
    if (!isMember) {
      throw new Error('You are not a member of this chat group')
    }

    return this.chatGroupMessageRepo.markChatGroupMessagesAsRead(chatGroupId, userId, upToMessageId)
  }

  /**
   * Get unread count for a user in a chat group
   */
  async getUnreadCount(chatGroupId: string, userId: string): Promise<number> {
    const isMember = await this.chatGroupRepo.isMember(chatGroupId, userId)
    if (!isMember) {
      return 0
    }

    return this.chatGroupMessageRepo.getUnreadCountForUser(chatGroupId, userId)
  }

  /**
   * Get member role
   */
  async getMemberRole(chatGroupId: string, userId: string): Promise<ChatGroupMemberRole | null> {
    return this.chatGroupRepo.getMemberRole(chatGroupId, userId)
  }
}
