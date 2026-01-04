import type {
  User,
  License,
  PhoneNumber,
  Bundle,
  PortingRequest,
} from '@ucaas/shared'

import type {
  ApiResponse,
  ListResponse,
  CreateUserDto,
  UpdateUserDto,
  AssignLicenseDto,
  PurchaseLicensesDto,
  AssignNumberDto,
  PurchaseNumberDto,
  CreatePortingRequestDto,
  CallSession,
  ChatMessage,
  Contact,
  LoginDto,
  AuthResponse,
} from './types'

export type * from './types'

export interface VoxeraApiClientConfig {
  baseUrl: string
  token?: string
  onUnauthorized?: () => void
}

export class VoxeraApiClient {
  private baseUrl: string
  private token?: string
  private onUnauthorized?: () => void

  constructor(config: VoxeraApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.token = config.token
    this.onUnauthorized = config.onUnauthorized
  }

  // Set authentication token
  setToken(token: string): void {
    this.token = token
  }

  // Clear authentication token
  clearToken(): void {
    this.token = undefined
  }

  // Generic fetch wrapper with error handling
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      this.onUnauthorized?.()
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }))
      throw new Error(error.message || 'Request failed')
    }

    return response.json()
  }

  // ===== Authentication =====

  async login(data: LoginDto): Promise<AuthResponse> {
    return this.fetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async logout(): Promise<void> {
    await this.fetch('/api/auth/logout', { method: 'POST' })
    this.clearToken()
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.fetch<ApiResponse<User>>('/api/auth/me')
    return response.data
  }

  // ===== Users =====

  async getUsers(params?: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    role?: string
  }): Promise<ListResponse<User>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.role) queryParams.append('role', params.role)

    return this.fetch<ListResponse<User>>(`/api/users?${queryParams}`)
  }

  async getUser(id: string): Promise<User> {
    const response = await this.fetch<ApiResponse<User>>(`/api/users/${id}`)
    return response.data
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await this.fetch<ApiResponse<User>>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await this.fetch<ApiResponse<User>>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data
  }

  async deleteUser(id: string): Promise<void> {
    await this.fetch(`/api/users/${id}`, { method: 'DELETE' })
  }

  // ===== Licenses =====

  async getLicenses(params?: {
    page?: number
    pageSize?: number
    status?: string
    userId?: string
  }): Promise<ListResponse<License>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.userId) queryParams.append('userId', params.userId)

    return this.fetch<ListResponse<License>>(`/api/licenses?${queryParams}`)
  }

  async getLicense(id: string): Promise<License> {
    const response = await this.fetch<ApiResponse<License>>(`/api/licenses/${id}`)
    return response.data
  }

  async assignLicense(licenseId: string, data: AssignLicenseDto): Promise<License> {
    const response = await this.fetch<ApiResponse<License>>(
      `/api/licenses/${licenseId}/assign`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
    return response.data
  }

  async unassignLicense(licenseId: string): Promise<License> {
    const response = await this.fetch<ApiResponse<License>>(
      `/api/licenses/${licenseId}/unassign`,
      {
        method: 'POST',
      }
    )
    return response.data
  }

  async purchaseLicenses(data: PurchaseLicensesDto): Promise<License[]> {
    const response = await this.fetch<ApiResponse<License[]>>('/api/licenses/purchase', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data
  }

  // ===== Bundles =====

  async getBundles(params?: { status?: string }): Promise<ListResponse<Bundle>> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)

    return this.fetch<ListResponse<Bundle>>(`/api/bundles?${queryParams}`)
  }

  async getBundle(id: string): Promise<Bundle> {
    const response = await this.fetch<ApiResponse<Bundle>>(`/api/bundles/${id}`)
    return response.data
  }

  // ===== Phone Numbers =====

  async getPhoneNumbers(params?: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    assignmentType?: string
  }): Promise<ListResponse<PhoneNumber>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.assignmentType) queryParams.append('assignmentType', params.assignmentType)

    return this.fetch<ListResponse<PhoneNumber>>(`/api/phone-numbers?${queryParams}`)
  }

  async getPhoneNumber(id: string): Promise<PhoneNumber> {
    const response = await this.fetch<ApiResponse<PhoneNumber>>(`/api/phone-numbers/${id}`)
    return response.data
  }

  async assignPhoneNumber(numberId: string, data: AssignNumberDto): Promise<PhoneNumber> {
    const response = await this.fetch<ApiResponse<PhoneNumber>>(
      `/api/phone-numbers/${numberId}/assign`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
    return response.data
  }

  async unassignPhoneNumber(numberId: string): Promise<PhoneNumber> {
    const response = await this.fetch<ApiResponse<PhoneNumber>>(
      `/api/phone-numbers/${numberId}/unassign`,
      {
        method: 'POST',
      }
    )
    return response.data
  }

  async purchasePhoneNumber(data: PurchaseNumberDto): Promise<PhoneNumber> {
    const response = await this.fetch<ApiResponse<PhoneNumber>>('/api/phone-numbers/purchase', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data
  }

  async searchAvailableNumbers(params: {
    country: string
    type: string
    region?: string
    pattern?: string
  }): Promise<PhoneNumber[]> {
    const queryParams = new URLSearchParams()
    queryParams.append('country', params.country)
    queryParams.append('type', params.type)
    if (params.region) queryParams.append('region', params.region)
    if (params.pattern) queryParams.append('pattern', params.pattern)

    const response = await this.fetch<ApiResponse<PhoneNumber[]>>(
      `/api/phone-numbers/available?${queryParams}`
    )
    return response.data
  }

  // ===== Porting =====

  async getPortingRequests(params?: {
    status?: string
  }): Promise<ListResponse<PortingRequest>> {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)

    return this.fetch<ListResponse<PortingRequest>>(`/api/porting-requests?${queryParams}`)
  }

  async getPortingRequest(id: string): Promise<PortingRequest> {
    const response = await this.fetch<ApiResponse<PortingRequest>>(
      `/api/porting-requests/${id}`
    )
    return response.data
  }

  async createPortingRequest(data: CreatePortingRequestDto): Promise<PortingRequest> {
    const response = await this.fetch<ApiResponse<PortingRequest>>('/api/porting-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data
  }

  // ===== UCaaS - Calls =====

  async initiateCall(from: string, to: string): Promise<CallSession> {
    const response = await this.fetch<ApiResponse<CallSession>>('/api/calls/initiate', {
      method: 'POST',
      body: JSON.stringify({ from, to }),
    })
    return response.data
  }

  async endCall(callId: string): Promise<CallSession> {
    const response = await this.fetch<ApiResponse<CallSession>>(`/api/calls/${callId}/end`, {
      method: 'POST',
    })
    return response.data
  }

  async getCallHistory(params?: {
    userId?: string
    page?: number
    pageSize?: number
  }): Promise<ListResponse<CallSession>> {
    const queryParams = new URLSearchParams()
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

    return this.fetch<ListResponse<CallSession>>(`/api/calls/history?${queryParams}`)
  }

  // ===== UCaaS - Chat =====

  async sendChatMessage(to: string, content: string): Promise<ChatMessage> {
    const response = await this.fetch<ApiResponse<ChatMessage>>('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ to, content }),
    })
    return response.data
  }

  async getChatMessages(params: {
    contactId: string
    page?: number
    pageSize?: number
  }): Promise<ListResponse<ChatMessage>> {
    const queryParams = new URLSearchParams()
    queryParams.append('contactId', params.contactId)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

    return this.fetch<ListResponse<ChatMessage>>(`/api/chat/messages?${queryParams}`)
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.fetch(`/api/chat/messages/${messageId}/read`, {
      method: 'POST',
    })
  }

  async getContacts(): Promise<Contact[]> {
    const response = await this.fetch<ApiResponse<Contact[]>>('/api/chat/contacts')
    return response.data
  }

  async updateStatus(status: 'online' | 'offline' | 'busy' | 'away'): Promise<void> {
    await this.fetch('/api/chat/status', {
      method: 'POST',
      body: JSON.stringify({ status }),
    })
  }
}
