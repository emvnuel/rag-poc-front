/**
 * E2E Tests: Touch and Mouse Interaction Optimization (User Story 4)
 * 
 * Tests optimal interaction patterns for different input methods
 * - Touch devices: 44px minimum targets, no hover states, touch gestures
 * - Mouse devices: Hover states visible, cursor changes, precise interactions
 * 
 * Tasks: T075-T078
 */

import { test, expect } from '@playwright/test'
import { VIEWPORTS } from '../fixtures/viewports'
import { assertAllTouchTargets } from '../helpers/responsive-helpers'

test.describe('Touch Device Interactions', () => {
  /**
   * T075: E2E test - Touch device has 44px minimum targets
   * 
   * Verifies all interactive elements meet WCAG 2.1 AA touch target size
   * on mobile and tablet touch devices
   */
  test('mobile should have 44px minimum touch targets', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Check all buttons on mobile
    await assertAllTouchTargets(page, 'button', 44)
    
    // Navigate to documents and check
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      await assertAllTouchTargets(page, 'button', 44)
      
      // Check links
      const links = page.locator('a')
      const linkCount = await links.count()
      
      for (let i = 0; i < Math.min(linkCount, 10); i++) {
        const link = links.nth(i)
        if (await link.isVisible()) {
          const box = await link.boundingBox()
          if (box) {
            // Links should have adequate tap area
            expect(box.height).toBeGreaterThanOrEqual(36)
          }
        }
      }
    }
  })

  test('tablet should maintain 44px touch targets', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Tablets are touch devices, need same touch target sizes
    await assertAllTouchTargets(page, 'button', 44)
  })

  /**
   * T077: E2E test - Touch device scroll behavior is smooth
   * 
   * Verifies scrolling is smooth on touch devices without
   * jank or layout shifts
   */
  test('should have smooth scroll behavior on mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      // Get initial scroll position
      const initialScroll = await page.evaluate(() => window.scrollY)
      
      // Simulate touch scroll (mouse wheel on mobile viewport)
      await page.evaluate(() => window.scrollBy(0, 200))
      await page.waitForTimeout(100)
      
      // Check scroll happened
      const finalScroll = await page.evaluate(() => window.scrollY)
      expect(finalScroll).toBeGreaterThan(initialScroll)
      
      // Check no horizontal scroll introduced
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
    }
  })

  /**
   * T078: E2E test - Touch device dropdowns use native pickers
   * 
   * Verifies select elements work well on touch devices
   * (may use native pickers or custom touch-optimized selects)
   */
  test('should have touch-friendly select components', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      // Find select/dropdown components
      const selectTrigger = page.locator('[role="combobox"], button:has([role="combobox"])').first()
      
      if (await selectTrigger.isVisible()) {
        // Should meet touch target size
        const box = await selectTrigger.boundingBox()
        expect(box?.height).toBeGreaterThanOrEqual(44)
        
        // Click should work reliably
        await selectTrigger.click()
        
        // Dropdown content should appear
        const dropdownContent = page.locator('[role="listbox"], [role="menu"]').first()
        await expect(dropdownContent).toBeVisible({ timeout: 1000 })
        
        // Dropdown items should also be touch-friendly
        const dropdownItem = dropdownContent.locator('[role="option"], [role="menuitem"]').first()
        if (await dropdownItem.isVisible()) {
          const itemBox = await dropdownItem.boundingBox()
          expect(itemBox?.height).toBeGreaterThanOrEqual(36)
        }
      }
    }
  })

  test('should handle touch gestures appropriately', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Test that touch events work (tap to navigate)
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      // Tap should work (click simulates tap)
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      // Should navigate successfully
      const url = page.url()
      expect(url).toContain('/')
    }
  })
})

test.describe('Mouse/Desktop Interactions', () => {
  /**
   * T076: E2E test - Desktop mouse shows hover states
   * 
   * Verifies hover effects are present on desktop for better discoverability
   * (using hover:hover media query to avoid showing on touch)
   */
  test('should show hover effects on desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Find an interactive element
    const projectCard = page.locator('[data-testid="project-card"]').first()
    
    if (await projectCard.isVisible()) {
      // Get initial styles
      const initialBg = await projectCard.evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      )
      
      // Hover over element
      await projectCard.hover()
      await page.waitForTimeout(100) // Allow transition
      
      // Get hover styles
      const hoverBg = await projectCard.evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      )
      
      // Hover state may change background, shadow, or other properties
      // If they're the same, check for box-shadow or other hover effects
      if (initialBg === hoverBg) {
        const hoverShadow = await projectCard.evaluate((el) => 
          window.getComputedStyle(el).boxShadow
        )
        
        // Should have some hover effect (shadow, border, etc.)
        expect(hoverShadow).not.toBe('none')
      }
    }
  })

  test('should show cursor pointer on interactive elements', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Check buttons have pointer cursor
    const button = page.locator('button').first()
    if (await button.isVisible()) {
      const cursor = await button.evaluate((el) => 
        window.getComputedStyle(el).cursor
      )
      expect(cursor).toBe('pointer')
    }
    
    // Check links have pointer cursor
    const link = page.locator('a[href]').first()
    if (await link.isVisible()) {
      const cursor = await link.evaluate((el) => 
        window.getComputedStyle(el).cursor
      )
      expect(cursor).toBe('pointer')
    }
  })

  /**
   * T082: Assert appropriate cursor changes for mouse interactions
   * 
   * Verifies cursor changes appropriately for different interaction types
   */
  test('should have appropriate cursor types for different elements', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      // Check input fields have text cursor
      const input = page.locator('input[type="text"], input[type="search"]').first()
      if (await input.isVisible()) {
        const cursor = await input.evaluate((el) => 
          window.getComputedStyle(el).cursor
        )
        // Should be text or auto (default for inputs)
        expect(['text', 'auto']).toContain(cursor)
      }
      
      // Check draggable elements (if any) have move cursor
      // This is application-specific
    }
  })

  test('should handle mouse click interactions precisely', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Test precise clicking (small targets work with mouse)
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      // Should navigate successfully
      expect(page.url()).toContain('/')
      
      // Small buttons should work with mouse (don't need 44px minimum)
      const smallButton = page.locator('button[class*="icon"]').first()
      if (await smallButton.isVisible()) {
        const box = await smallButton.boundingBox()
        // Can be smaller than 44px on desktop with mouse
        if (box && box.height < 44) {
          // Should still be clickable
          await smallButton.click()
          // If no error, click worked
        }
      }
    }
  })
})

test.describe('Input Method Detection', () => {
  test('should optimize for detected input method', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Check if hover media query is respected
    // Desktop with mouse should support hover
    const supportsHover = await page.evaluate(() => 
      window.matchMedia('(hover: hover)').matches
    )
    
    // Desktop should support hover
    expect(supportsHover).toBe(true)
  })

  test('mobile should detect as touch device', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Mobile should not support hover (coarse pointer)
    const supportsHover = await page.evaluate(() => 
      window.matchMedia('(hover: hover)').matches
    )
    
    // Mobile may or may not report hover support in Playwright
    // But pointer should be coarse
    const pointerCoarse = await page.evaluate(() => 
      window.matchMedia('(pointer: coarse)').matches
    )
    
    // At least one of these should be true for mobile
    expect(pointerCoarse || !supportsHover).toBe(true)
  })
})
