import type { ChatMessage, ApiResponse } from '@ucaas/shared'

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

export const chatApi = {
  /**
   * Fetch conversation history between current user and a contact
   */
  async getConversation(
    currentUserId: string,
    contactUserId: string,
    limit = 100
  ): Promise<ChatMessage[]> {
    const queryParams = new URLSearchParams()
    queryParams.set('currentUserId', currentUserId)
    queryParams.set('limit', limit.toString())

    const response = await fetch(
      `${API_BASE_URL}/chat/conversations/${contactUserId}/messages?${queryParams}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch conversation')
    }

    const data: ApiResponse<ChatMessage[]> = await response.json()
    if (!data.data) throw new Error('No conversation data returned')
    return data.data
  },

  /**
   * Mark messages from a contact as read
   */
  async markAsRead(currentUserId: string, fromUserId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chat/conversations/${fromUserId}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to mark messages as read')
    }
  },
}
