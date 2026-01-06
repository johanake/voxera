import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '@ucaas/api-client'

/**
 * Fetch conversation history between current user and a contact
 *
 * Configured with:
 * - staleTime: 0 (always fetch fresh on mount)
 * - gcTime: 5 minutes (keep in cache)
 */
export function useChatConversation(currentUserId: string, contactUserId: string) {
  return useQuery({
    queryKey: ['chat', 'conversation', currentUserId, contactUserId],
    queryFn: () => chatApi.getConversation(currentUserId, contactUserId),
    enabled: !!currentUserId && !!contactUserId,
    staleTime: 0, // Always fetch fresh messages on mount
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })
}

/**
 * Mark messages from a contact as read
 *
 * Invalidates the conversation query on success to refetch with updated read status
 */
export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ currentUserId, fromUserId }: { currentUserId: string; fromUserId: string }) =>
      chatApi.markAsRead(currentUserId, fromUserId),
    onSuccess: (_, { currentUserId, fromUserId }) => {
      // Invalidate conversation to refetch with updated read status
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversation', currentUserId, fromUserId],
      })
    },
  })
}
