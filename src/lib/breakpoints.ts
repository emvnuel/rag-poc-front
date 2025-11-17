/**
 * Tailwind breakpoint constants and media queries for responsive design
 * 
 * @see {@link https://tailwindcss.com/docs/breakpoints}
 */

/**
 * Tailwind breakpoint values (px)
 * These match the default Tailwind configuration
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1400,
} as const

/**
 * Common media query strings for responsive design
 * Use with window.matchMedia() or useMediaQuery hook
 * 
 * @example
 * ```ts
 * const isMobile = useMediaQuery(MEDIA_QUERIES.mobile)
 * const hasTouch = useMediaQuery(MEDIA_QUERIES.touch)
 * ```
 */
export const MEDIA_QUERIES = {
  /** Mobile devices: < 768px */
  mobile: '(max-width: 767px)',
  
  /** Tablet devices: 768px - 1023px */
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  
  /** Desktop devices: >= 1024px */
  desktop: '(min-width: 1024px)',
  
  /** Touch devices (no hover support) */
  touch: '(hover: none) and (pointer: coarse)',
  
  /** Mouse/trackpad devices (hover support) */
  mouse: '(hover: hover) and (pointer: fine)',
  
  /** Reduced motion preference */
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const

/**
 * Device category type
 */
export type DeviceCategory = 'mobile' | 'tablet' | 'desktop'
