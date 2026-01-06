import { useQuery } from '@tanstack/react-query'
import { userApi } from '@ucaas/api-client'

/**
 * Fetch all users from the backend
 *
 * Configured with:
 * - staleTime: 60 seconds (users change infrequently)
 * - Automatic retries on failure
 */
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userApi.list({ page: 1, pageSize: 100 })
      return response.data
    },
    staleTime: 60 * 1000, // Users don't change frequently
  })
}

/**
 * Fetch a single user by ID
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => userApi.getById(userId),
    enabled: !!userId,
    staleTime: 60 * 1000,
  })
}
