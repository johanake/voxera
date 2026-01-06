import type { User, ListResponse, ApiResponse } from '@ucaas/shared'

// Get API base URL from environment or use default
// In browser: window.__VITE_API_URL__ (set by Vite)
// In Node: process.env.VITE_API_URL
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && (window as any).__VITE_API_URL__) {
    return (window as any).__VITE_API_URL__
  }
  return 'http://localhost:5000/api/v1'
}

const API_BASE_URL = getApiBaseUrl()

export const userApi = {
  async list(params: {
    page?: number
    pageSize?: number
    search?: string
    status?: string[]
    role?: string[]
  }): Promise<ListResponse<User>> {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.set('page', params.page.toString())
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString())
    if (params.search) queryParams.set('search', params.search)
    if (params.status) params.status.forEach((s) => queryParams.append('status', s))
    if (params.role) params.role.forEach((r) => queryParams.append('role', r))

    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`)
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  },

  async getById(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`)
    if (!response.ok) throw new Error('Failed to fetch user')
    const data: ApiResponse<User> = await response.json()
    if (!data.data) throw new Error('User not found')
    return data.data
  },

  async create(user: {
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
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create user')
    }
    const data: ApiResponse<User> = await response.json()
    if (!data.data) throw new Error('Failed to create user')
    return data.data
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to update user')
    }
    const data: ApiResponse<User> = await response.json()
    if (!data.data) throw new Error('Failed to update user')
    return data.data
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete user')
  },

  async updateStatus(id: string, status: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) throw new Error('Failed to update status')
    const data: ApiResponse<User> = await response.json()
    if (!data.data) throw new Error('Failed to update status')
    return data.data
  },
}
