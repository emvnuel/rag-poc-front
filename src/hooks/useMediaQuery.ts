import { useState, useEffect } from 'react'

/**
 * Hook to detect if a media query matches
 * 
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the query matches the current viewport
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isMobile = useMediaQuery('(max-width: 767px)')
 *   const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
 *   
 *   return (
 *     <div>
 *       {isMobile ? <MobileView /> : <DesktopView />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    // Initialize with current match state (SSR-safe)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    // Create media query list
    const media = window.matchMedia(query)

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener (modern API)
    media.addEventListener('change', listener)

    // Cleanup
    return () => {
      media.removeEventListener('change', listener)
    }
  }, [query])

  return matches
}
