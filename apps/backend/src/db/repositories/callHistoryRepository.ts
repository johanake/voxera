import type { PrismaClient, CallHistory, Prisma } from '@prisma/client'
import type { PaginationParams, PaginationResult } from '../utils/pagination.js'
import { getPaginationParams, createPaginationResult } from '../utils/pagination.js'

export interface CallHistoryFilters {
  userId?: string
}

export interface CreateCallHistoryDto {
  userId: string
  contactName: string
  contactExtension: string
  direction: 'inbound' | 'outbound'
  timestamp: Date
  duration?: number
  answered: boolean
}

export class CallHistoryRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<CallHistory | null> {
    return this.prisma.callHistory.findUnique({
      where: { id },
    })
  }

  async findMany(
    filters: CallHistoryFilters,
    pagination: PaginationParams
  ): Promise<PaginationResult<CallHistory>> {
    const { skip, take, page, pageSize } = getPaginationParams(pagination)

    const where: Prisma.CallHistoryWhereInput = {
      ...(filters.userId && { userId: filters.userId }),
    }

    const [data, totalItems] = await Promise.all([
      this.prisma.callHistory.findMany({
        where,
        skip,
        take,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.callHistory.count({ where }),
    ])

    return createPaginationResult(data, totalItems, page, pageSize)
  }

  async create(data: CreateCallHistoryDto): Promise<CallHistory> {
    return this.prisma.callHistory.create({
      data: {
        userId: data.userId,
        contactName: data.contactName,
        contactExtension: data.contactExtension,
        direction: data.direction,
        timestamp: data.timestamp,
        duration: data.duration,
        answered: data.answered,
      },
    })
  }
}
