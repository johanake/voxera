import type { CallHistory } from '@prisma/client'
import type {
  CallHistoryRepository,
  CallHistoryFilters,
  CreateCallHistoryDto,
} from '../db/repositories/callHistoryRepository.js'
import type { PaginationParams, PaginationResult } from '../db/utils/pagination.js'

export class CallHistoryService {
  constructor(private callHistoryRepository: CallHistoryRepository) {}

  async list(
    filters: CallHistoryFilters,
    pagination: PaginationParams
  ): Promise<PaginationResult<CallHistory>> {
    return this.callHistoryRepository.findMany(filters, pagination)
  }

  async getById(id: string): Promise<CallHistory> {
    const entry = await this.callHistoryRepository.findById(id)
    if (!entry) {
      throw new Error('Call history entry not found')
    }
    return entry
  }

  async create(data: CreateCallHistoryDto): Promise<CallHistory> {
    // Validate required fields
    if (!data.userId) {
      throw new Error('userId is required')
    }
    if (!data.contactName) {
      throw new Error('contactName is required')
    }
    if (!data.contactExtension) {
      throw new Error('contactExtension is required')
    }
    if (!data.direction || !['inbound', 'outbound'].includes(data.direction)) {
      throw new Error('direction must be either inbound or outbound')
    }

    return this.callHistoryRepository.create(data)
  }
}
