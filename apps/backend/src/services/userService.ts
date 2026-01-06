import type { User } from '@prisma/client'
import type { UserRepository, UserFilters } from '../db/repositories/userRepository.js'
import type { PaginationParams, PaginationResult } from '../db/utils/pagination.js'

export interface CreateUserInput {
  customerId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  extension?: string
  role: 'customer_admin' | 'manager' | 'user'
  department?: string
  preferences?: {
    emailNotifications: boolean
    smsNotifications: boolean
    newLicenseAssigned: boolean
    numberPortingUpdates: boolean
  }
  createdBy: string
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  extension?: string
  role?: 'customer_admin' | 'manager' | 'user'
  department?: string
  preferences?: {
    emailNotifications: boolean
    smsNotifications: boolean
    newLicenseAssigned: boolean
    numberPortingUpdates: boolean
  }
}

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async list(
    filters: UserFilters,
    pagination: PaginationParams
  ): Promise<PaginationResult<User>> {
    return this.userRepository.findMany(filters, pagination)
  }

  async getById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  async create(input: CreateUserInput): Promise<User> {
    // Validate email uniqueness
    const existing = await this.userRepository.findByEmail(input.email)
    if (existing) {
      throw new Error('Email already exists')
    }

    return this.userRepository.create({
      customerId: input.customerId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      extension: input.extension,
      role: input.role,
      status: 'invited',
      department: input.department,
      preferences: input.preferences || {
        emailNotifications: true,
        smsNotifications: false,
        newLicenseAssigned: true,
        numberPortingUpdates: true,
      },
      createdBy: input.createdBy,
    })
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    // Validate user exists
    await this.getById(id)

    // Validate email uniqueness if changing
    if (input.email) {
      const existing = await this.userRepository.findByEmail(input.email)
      if (existing && existing.id !== id) {
        throw new Error('Email already exists')
      }
    }

    return this.userRepository.update(id, input)
  }

  async delete(id: string, deletedBy: string): Promise<User> {
    await this.getById(id)
    return this.userRepository.delete(id, deletedBy)
  }

  async updateStatus(id: string, status: string): Promise<User> {
    await this.getById(id)
    return this.userRepository.updateStatus(id, status)
  }
}
