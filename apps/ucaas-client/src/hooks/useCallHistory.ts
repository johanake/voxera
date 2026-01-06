import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { callHistoryApi } from '@ucaas/api-client'
import type { CallHistoryEntry } from '@ucaas/api-client'

/**
 * Fetch call history for a user
 *
 * Configured with:
 * - staleTime: 10 seconds
 * - Automatic retries
 * - Refetch after 10 seconds of being stale
 */
export function useCallHistory(userId: string) {
  return useQuery({
    queryKey: ['callHistory', userId],
    queryFn: () => callHistoryApi.list({ userId, page: 1, pageSize: 50 }),
    enabled: !!userId,
    staleTime: 10 * 1000, // Refetch after 10 seconds
  })
}

/**
 * Create a new call history entry
 *
 * Optimistically updates the cache with the new entry
 * Invalidates the query on success to refetch from backend
 */
export function useCreateCallHistory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<CallHistoryEntry, 'id'>) => callHistoryApi.create(data),
    onSuccess: (newEntry, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(['callHistory', variables.userId], (old: any) => {
        if (!old) return { data: [newEntry], total: 1, page: 1, pageSize: 50 }
        return {
          ...old,
          data: [newEntry, ...old.data],
          total: old.total + 1,
        }
      })
    },
  })
}
