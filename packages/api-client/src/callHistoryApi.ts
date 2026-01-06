import type { ListResponse, ApiResponse } from '@ucaas/shared'

// Get API base URL from environment or use default
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && (window as any).__VITE_API_URL__) {
    return (window as any).__VITE_API_URL__
  }
  if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
    return process.env.VITE_API_URL
  }
  return 'http://localhost:5000/api/v1'
}

const API_BASE_URL = getApiBaseUrl()

export interface CallHistoryEntry {
  id: string
  userId: string
  contactName: string
  contactExtension: string
  direction: 'inbound' | 'outbound'
  timestamp: Date
  duration?: number
  answered: boolean
}

export const callHistoryApi = {
  /**
   * List call history with optional filters
   */
  async list(params: {
    userId?: string
    page?: number
    pageSize?: number
  }): Promise<ListResponse<CallHistoryEntry>> {
    const queryParams = new URLSearchParams()
    if (params.userId) queryParams.set('userId', params.userId)
    if (params.page) queryParams.set('page', params.page.toString())
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString())

    const response = await fetch(`${API_BASE_URL}/call-history?${queryParams}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch call history')
    }

    const data: ListResponse<CallHistoryEntry> = await response.json()
    // Convert timestamp strings to Date objects
    return {
      ...data,
      data: data.data.map((entry) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      })),
    }
  },

  /**
   * Create a new call history entry
   */
  async create(
    entry: Omit<CallHistoryEntry, 'id'>
  ): Promise<CallHistoryEntry> {
    const response = await fetch(`${API_BASE_URL}/call-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create call history entry')
    }

    const data: ApiResponse<CallHistoryEntry> = await response.json()
    if (!data.data) throw new Error('No data returned')

    // Convert timestamp string to Date object
    return {
      ...data.data,
      timestamp: new Date(data.data.timestamp),
    }
  },
}
