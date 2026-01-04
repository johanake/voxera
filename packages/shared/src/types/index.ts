// User Types
export type UserRole = 'customer_admin' | 'manager' | 'user'
export type UserStatus = 'active' | 'suspended' | 'invited' | 'inactive'

export interface NotificationPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  newLicenseAssigned: boolean
  numberPortingUpdates: boolean
}

export interface User {
  id: string
  customerId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  extension?: string
  role: UserRole
  status: UserStatus
  preferences: NotificationPreferences
  employeeId?: string
  department?: string
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// Bundle Types
export type BundleCategory = 'mobile' | 'fixed' | 'pbx' | 'ivr' | 'hybrid'
export type BundleStatus = 'active' | 'draft' | 'archived'

export interface Capability {
  id: string
  name: string
  type: 'feature' | 'quota' | 'setting'
  value: boolean | number | string
  description?: string
}

export interface BundleTier {
  id: string
  name: string
  description: string
  pricing: {
    monthlyFee: number
    setupFee: number
    currency: string
  }
  capabilities: Capability[]
  limits: {
    maxConcurrentCalls?: number
    includedMinutes?: number
    includedSMS?: number
    storageGB?: number
  }
  sortOrder: number
}

export interface Bundle {
  id: string
  tenantId: string
  name: string
  description: string
  category: BundleCategory
  status: BundleStatus
  tiers: BundleTier[]
  isPublic: boolean
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

// License Types
export type LicenseStatus = 'active' | 'suspended' | 'unassigned' | 'expired'

export interface License {
  id: string
  customerId: string
  bundleId: string
  tierId: string
  userId?: string
  status: LicenseStatus
  bundleName?: string
  tierName?: string
  activatedAt?: Date
  expiresAt?: Date
}

// Phone Number Types
export type PhoneNumberType = 'mobile' | 'geographic' | 'toll-free' | 'national' | 'premium'
export type PhoneNumberStatus = 'active' | 'reserved' | 'pending' | 'porting' | 'cancelled'
export type AssignmentType = 'user' | 'pbx' | 'ivr' | 'unassigned'

export interface PhoneNumber {
  id: string
  customerId: string
  number: string
  type: PhoneNumberType
  status: PhoneNumberStatus
  country: string
  region?: string
  assignmentType: AssignmentType
  assignedToId?: string
  assignedToName?: string
  monthlyFee: number
  currency: string
  purchasedAt?: Date
  activatedAt?: Date
  portingRequestId?: string
}

export type PortingStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'

export interface PortingRequest {
  id: string
  customerId: string
  phoneNumber: string
  currentProvider: string
  accountNumber: string
  pin?: string
  status: PortingStatus
  requestedDate: Date
  scheduledDate?: Date
  completedDate?: Date
  rejectionReason?: string
  documents?: string[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ListResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

// Export chat types
export * from './chat.js'

// Export softphone types
export * from './softphone.js'
