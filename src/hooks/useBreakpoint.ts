import { useMediaQuery } from './useMediaQuery'
import { MEDIA_QUERIES, type DeviceCategory } from '@/lib/breakpoints'

/**
 * Hook to get the current device category based on Tailwind breakpoints
 * 
 * @returns 'mobile' | 'tablet' | 'desktop'
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const breakpoint = useBreakpoint()
 *   
 *   return (
 *     <div>
 *       {breakpoint === 'mobile' && <MobileNav />}
 *       {breakpoint === 'tablet' && <TabletNav />}
 *       {breakpoint === 'desktop' && <DesktopNav />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useBreakpoint(): DeviceCategory {
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile)
  const isTablet = useMediaQuery(MEDIA_QUERIES.tablet)

  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  return 'desktop'
}
