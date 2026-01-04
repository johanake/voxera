import type {
  User,
  License,
  PhoneNumber,
  Bundle,
  PortingRequest,
} from '@ucaas/shared'

// Generic API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

// Request DTOs
export interface CreateUserDto {
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  department?: string
  employeeId?: string
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  status?: string
}

export interface AssignLicenseDto {
  userId: string
}

export interface PurchaseLicensesDto {
  bundleId: string
  tierId: string
  quantity: number
}

export interface AssignNumberDto {
  assignmentType: 'user' | 'pbx' | 'ivr'
  assignedToId: string
}

export interface PurchaseNumberDto {
  number: string
  type: string
  country: string
  region?: string
}

export interface CreatePortingRequestDto {
  phoneNumber: string
  currentProvider: string
  accountNumber: string
  pin?: string
  documents?: string[]
}

// UCaaS-specific types
export interface CallSession {
  id: string
  from: string
  to: string
  status: 'ringing' | 'connected' | 'ended' | 'failed'
  startedAt: Date
  endedAt?: Date
  duration?: number
}

export interface ChatMessage {
  id: string
  from: string
  to: string
  content: string
  timestamp: Date
  read: boolean
}

export interface Contact {
  id: string
  name: string
  phoneNumber?: string
  email?: string
  status: 'online' | 'offline' | 'busy' | 'away'
}

// Auth types
export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
  expiresAt: Date
}
