import { QueryClient } from '@tanstack/react-query'

/**
 * Creates and configures the React Query client with sensible defaults
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        const errorWithStatus = error as { status?: number }
        if (errorWithStatus?.status && errorWithStatus.status >= 400 && errorWithStatus.status < 500) {
          return false
        }
        // Retry up to 2 times for 5xx errors
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
})
