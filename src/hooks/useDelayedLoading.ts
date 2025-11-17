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
    let timer: ReturnType<typeof setTimeout> | null = null

    if (isLoading) {
      // Start timer to show loading after delay
      timer = setTimeout(() => {
        setShowLoading(true)
      }, delay)
    } else {
      // Immediately hide loading when isLoading becomes false
      // eslint-disable-next-line react-hooks/set-state-in-effect -- This is intentional: we need to synchronize showLoading state with isLoading prop immediately when loading completes
      setShowLoading(false)
    }

    // Cleanup: clear timer if component unmounts or effect re-runs
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [isLoading, delay])

  return showLoading
}
