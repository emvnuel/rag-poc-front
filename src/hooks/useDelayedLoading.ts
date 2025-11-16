import { useEffect, useState } from 'react'

/**
 * Hook that delays showing a loading state for a specified time to prevent
 * flashing indicators for fast operations.
 * 
 * Per constitution requirement: "Loading states MUST be shown for async operations >200ms"
 * 
 * @param isLoading - The actual loading state from the query/mutation
 * @param delay - Delay in milliseconds before showing loading state (default: 200ms)
 * @returns Boolean indicating whether to show the loading indicator
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useQuery(...)
 * const showLoading = useDelayedLoading(isLoading)
 * 
 * return showLoading ? <Skeleton /> : <Content data={data} />
 * ```
 */
export function useDelayedLoading(isLoading: boolean, delay = 200): boolean {
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    // Only handle the loading state change via timer
    let timer: ReturnType<typeof setTimeout> | null = null

    if (isLoading) {
      // Start timer to show loading after delay
      timer = setTimeout(() => {
        setShowLoading(true)
      }, delay)
    }

    // Cleanup function handles both clearing timer and resetting state
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
      if (!isLoading) {
        // Hide loading in cleanup when isLoading becomes false
        setShowLoading(false)
      }
    }
  }, [isLoading, delay])

  return showLoading
}
