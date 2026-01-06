import { QueryClient } from '@tanstack/react-query'

/**
 * Configured React Query client for the UCaaS application
 *
 * Configuration:
 * - staleTime: 30 seconds - data is considered fresh for this duration
 * - gcTime: 5 minutes - cached data is kept in memory for this duration
 * - retry: 3 attempts with exponential backoff
 * - refetchOnWindowFocus: enabled - refetch when user returns to the app
 * - refetchOnReconnect: enabled - refetch when internet reconnects
 * - networkMode: online - queries fail when offline (localStorage fallback in place)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
})
