/**
 * Viewport configurations for E2E testing across different device sizes
 * 
 * These viewports correspond to common real-world devices and are used
 * in Playwright tests to verify responsive behavior.
 */

import type { ViewportSize } from '@playwright/test'

/**
 * Standard viewport configurations matching real devices
 */
export const VIEWPORTS = {
  /** iPhone SE - Smallest mobile target (320px width in landscape) */
  mobile: {
    width: 375,
    height: 667,
  } as ViewportSize,

  /** iPhone 12 Pro - Modern mobile standard */
  mobileModern: {
    width: 390,
    height: 844,
  } as ViewportSize,

  /** Edge case - Very small mobile (iPhone SE in some views) */
  mobileSmall: {
    width: 320,
    height: 568,
  } as ViewportSize,

  /** iPad - Standard tablet portrait */
  tablet: {
    width: 768,
    height: 1024,
  } as ViewportSize,

  /** iPad Pro - Large tablet/small desktop */
  tabletLarge: {
    width: 1024,
    height: 1366,
  } as ViewportSize,

  /** Standard desktop - 1080p */
  desktop: {
    width: 1920,
    height: 1080,
  } as ViewportSize,

  /** Large desktop - 2K */
  desktopLarge: {
    width: 2560,
    height: 1440,
  } as ViewportSize,
} as const

/**
 * Viewport categories for easy iteration in tests
 */
export const VIEWPORT_CATEGORIES = {
  mobile: [VIEWPORTS.mobile, VIEWPORTS.mobileModern, VIEWPORTS.mobileSmall],
  tablet: [VIEWPORTS.tablet, VIEWPORTS.tabletLarge],
  desktop: [VIEWPORTS.desktop, VIEWPORTS.desktopLarge],
} as const

/**
 * All viewports as an array for comprehensive testing
 */
export const ALL_VIEWPORTS = [
  { name: 'Mobile (iPhone SE)', ...VIEWPORTS.mobile },
  { name: 'Mobile (iPhone 12 Pro)', ...VIEWPORTS.mobileModern },
  { name: 'Mobile Small (320px)', ...VIEWPORTS.mobileSmall },
  { name: 'Tablet (iPad)', ...VIEWPORTS.tablet },
  { name: 'Tablet Large (iPad Pro)', ...VIEWPORTS.tabletLarge },
  { name: 'Desktop (1920x1080)', ...VIEWPORTS.desktop },
  { name: 'Desktop Large (2560x1440)', ...VIEWPORTS.desktopLarge },
] as const

/**
 * Priority viewports for quick smoke testing
 * These represent the most critical device sizes to test
 */
export const PRIORITY_VIEWPORTS = [
  { name: 'Mobile (iPhone SE)', ...VIEWPORTS.mobile },
  { name: 'Tablet (iPad)', ...VIEWPORTS.tablet },
  { name: 'Desktop (1920x1080)', ...VIEWPORTS.desktop },
] as const
