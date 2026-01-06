import type { PrismaClient, User, Prisma } from '@prisma/client'
import type { PaginationParams, PaginationResult } from '../utils/pagination.js'
import { getPaginationParams, createPaginationResult } from '../utils/pagination.js'

export interface UserFilters {
  search?: string
  status?: string[]
  role?: string[]
  customerId: string
}

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    })
  }

  async findMany(
    filters: UserFilters,
    pagination: PaginationParams
  ): Promise<PaginationResult<User>> {
    const { skip, take, page, pageSize } = getPaginationParams(pagination)

    const where: Prisma.UserWhereInput = {
      customerId: filters.customerId,
      deletedAt: null,
      ...(filters.status?.length && { status: { in: filters.status as any } }),
      ...(filters.role?.length && { role: { in: filters.role as any } }),
      ...(filters.search && {
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    }

    const [data, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ])

    return createPaginationResult(data, totalItems, page, pageSize)
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data })
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    })
  }

  async delete(id: string, deletedBy: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    })
  }

  async updateStatus(id: string, status: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { status: status as any, updatedAt: new Date() },
    })
  }

  async updateLastLogin(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    })
  }
}
