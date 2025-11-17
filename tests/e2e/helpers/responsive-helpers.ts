/**
 * Helper functions for responsive design E2E testing
 * 
 * These utilities help test responsive layouts, touch targets, and viewport behavior
 */

import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Check if a page has horizontal scroll (indicates layout overflow)
 * 
 * @param page - Playwright page instance
 * @returns Promise<boolean> - true if horizontal scroll exists
 * 
 * @example
 * ```ts
 * const hasScroll = await hasHorizontalScroll(page)
 * expect(hasScroll).toBe(false) // No horizontal scroll expected
 * ```
 */
export async function hasHorizontalScroll(page: Page): Promise<boolean> {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
  return scrollWidth > clientWidth
}

/**
 * Assert that a page does not have horizontal scroll
 * 
 * @param page - Playwright page instance
 * 
 * @example
 * ```ts
 * await assertNoHorizontalScroll(page)
 * ```
 */
export async function assertNoHorizontalScroll(page: Page): Promise<void> {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
  
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // Allow 1px tolerance for rounding
}

/**
 * Get the dimensions of an element
 * 
 * @param locator - Playwright locator
 * @returns Promise<{ width: number; height: number } | null>
 */
export async function getElementDimensions(
  locator: Locator
): Promise<{ width: number; height: number } | null> {
  const box = await locator.boundingBox()
  if (!box) return null
  
  return {
    width: box.width,
    height: box.height,
  }
}

/**
 * Check if an element meets minimum touch target size (WCAG 2.1 AA: 44x44px)
 * 
 * @param locator - Playwright locator
 * @param minSize - Minimum size in pixels (default: 44)
 * @returns Promise<boolean> - true if element meets minimum size
 * 
 * @example
 * ```ts
 * const button = page.locator('button').first()
 * const isTouchFriendly = await isTouchTargetSizeValid(button)
 * expect(isTouchFriendly).toBe(true)
 * ```
 */
export async function isTouchTargetSizeValid(
  locator: Locator,
  minSize: number = 44
): Promise<boolean> {
  const dims = await getElementDimensions(locator)
  if (!dims) return false
  
  return dims.width >= minSize && dims.height >= minSize
}

/**
 * Assert that an element meets minimum touch target size
 * 
 * @param locator - Playwright locator
 * @param minSize - Minimum size in pixels (default: 44)
 * 
 * @example
 * ```ts
 * const button = page.locator('button[type="submit"]')
 * await assertTouchTargetSize(button)
 * ```
 */
export async function assertTouchTargetSize(
  locator: Locator,
  minSize: number = 44
): Promise<void> {
  const dims = await getElementDimensions(locator)
  
  expect(dims).not.toBeNull()
  expect(dims!.width).toBeGreaterThanOrEqual(minSize)
  expect(dims!.height).toBeGreaterThanOrEqual(minSize)
}

/**
 * Assert that all elements matching a selector meet minimum touch target size
 * 
 * @param page - Playwright page instance
 * @param selector - CSS selector or role selector
 * @param minSize - Minimum size in pixels (default: 44)
 * 
 * @example
 * ```ts
 * // Check all buttons on page
 * await assertAllTouchTargets(page, 'button', 44)
 * ```
 */
export async function assertAllTouchTargets(
  page: Page,
  selector: string,
  minSize: number = 44
): Promise<void> {
  const elements = page.locator(selector)
  const count = await elements.count()
  
  for (let i = 0; i < count; i++) {
    const element = elements.nth(i)
    const isVisible = await element.isVisible()
    
    // Only check visible elements
    if (isVisible) {
      try {
        await assertTouchTargetSize(element, minSize)
      } catch (error) {
        // Add context about which button failed
        const text = await element.textContent().catch(() => '')
        const ariaLabel = await element.getAttribute('aria-label').catch(() => '')
        const classList = await element.getAttribute('class').catch(() => '') || ''
        throw new Error(`Button ${i} failed size check (text: "${text}", aria-label: "${ariaLabel}", class: "${classList.substring(0, 100)}..."): ${error}`)
      }
    }
  }
}

/**
 * Get current viewport width
 * 
 * @param page - Playwright page instance
 * @returns Promise<number> - viewport width in pixels
 */
export async function getViewportWidth(page: Page): Promise<number> {
  return await page.evaluate(() => window.innerWidth)
}

/**
 * Get current viewport height
 * 
 * @param page - Playwright page instance
 * @returns Promise<number> - viewport height in pixels
 */
export async function getViewportHeight(page: Page): Promise<number> {
  return await page.evaluate(() => window.innerHeight)
}

/**
 * Check if viewport is mobile size (< 768px)
 * 
 * @param page - Playwright page instance
 * @returns Promise<boolean>
 */
export async function isMobileViewport(page: Page): Promise<boolean> {
  const width = await getViewportWidth(page)
  return width < 768
}

/**
 * Check if viewport is tablet size (768px - 1023px)
 * 
 * @param page - Playwright page instance
 * @returns Promise<boolean>
 */
export async function isTabletViewport(page: Page): Promise<boolean> {
  const width = await getViewportWidth(page)
  return width >= 768 && width < 1024
}

/**
 * Check if viewport is desktop size (>= 1024px)
 * 
 * @param page - Playwright page instance
 * @returns Promise<boolean>
 */
export async function isDesktopViewport(page: Page): Promise<boolean> {
  const width = await getViewportWidth(page)
  return width >= 1024
}

/**
 * Get computed grid column count
 * 
 * @param locator - Grid container locator
 * @returns Promise<number> - number of grid columns
 * 
 * @example
 * ```ts
 * const grid = page.locator('[data-testid="document-grid"]')
 * const columns = await getGridColumnCount(grid)
 * expect(columns).toBe(2) // Expect 2 columns on tablet
 * ```
 */
export async function getGridColumnCount(locator: Locator): Promise<number> {
  const columnTemplate = await locator.evaluate((el) => {
    return window.getComputedStyle(el).gridTemplateColumns
  })
  
  // Count the number of column definitions
  // Example: "1fr 1fr 1fr" = 3 columns
  const columns = columnTemplate.split(' ').filter(col => col.trim() !== '').length
  return columns
}

/**
 * Assert font size meets minimum requirement
 * 
 * @param locator - Element locator
 * @param minSize - Minimum font size in pixels (default: 16)
 * 
 * @example
 * ```ts
 * const input = page.locator('input[type="text"]')
 * await assertMinimumFontSize(input, 16) // Prevents iOS auto-zoom
 * ```
 */
export async function assertMinimumFontSize(
  locator: Locator,
  minSize: number = 16
): Promise<void> {
  const fontSize = await locator.evaluate((el) => {
    return parseInt(window.getComputedStyle(el).fontSize, 10)
  })
  
  expect(fontSize).toBeGreaterThanOrEqual(minSize)
}
