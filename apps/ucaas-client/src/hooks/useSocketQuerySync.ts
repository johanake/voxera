import { useQueryClient } from '@tanstack/react-query'
import type { ChatMessage } from '@ucaas/shared'

/**
 * Utility hook for syncing Socket.IO events with React Query cache
 *
 * Provides helper functions to update the React Query cache when
 * Socket.IO events arrive, ensuring real-time updates are reflected
 * in the cached data.
 */
export function useSocketQuerySync() {
  const queryClient = useQueryClient()

  /**
   * Update chat conversation cache when a new message is received via Socket.IO
   *
   * @param message - The chat message received from Socket.IO
   * @param currentUserId - The ID of the current user
   */
  const updateChatCache = (message: ChatMessage, currentUserId: string) => {
    const contactId = message.fromUserId === currentUserId ? message.toUserId : message.fromUserId

    queryClient.setQueryData<ChatMessage[]>(
      ['chat', 'conversation', currentUserId, contactId],
      (old = []) => {
        // Avoid duplicates
        if (old.some((m) => m.id === message.id)) return old
        return [...old, message]
      }
    )
  }

  /**
   * Invalidate call history query to refetch latest data
   *
   * Useful when a call ends to ensure the history is up-to-date
   *
   * @param userId - The user ID whose call history should be invalidated
   */
  const invalidateCallHistory = (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['callHistory', userId] })
  }

  /**
   * Invalidate all queries for a specific query key pattern
   *
   * @param queryKey - The query key pattern to invalidate
   */
  const invalidateQueries = (queryKey: unknown[]) => {
    queryClient.invalidateQueries({ queryKey })
  }

  /**
   * Set query data directly (optimistic update)
   *
   * @param queryKey - The query key to update
   * @param data - The new data or update function
   */
  const setQueryData = <T>(queryKey: unknown[], data: T | ((old: T | undefined) => T)) => {
    queryClient.setQueryData<T>(queryKey, data)
  }

  return {
    updateChatCache,
    invalidateCallHistory,
    invalidateQueries,
    setQueryData,
  }
}
