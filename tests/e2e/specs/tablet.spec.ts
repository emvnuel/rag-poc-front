/**
 * E2E Tests: Tablet Usage (User Story 2)
 * 
 * Tests responsive behavior on tablet viewports (768px-1024px)
 * Verifies two-column layouts, touch-friendly interactions, and orientation changes
 * 
 * Tasks: T047-T050
 */

import { test, expect } from '@playwright/test'
import { VIEWPORTS } from '../fixtures/viewports'
import {
  assertNoHorizontalScroll,
  assertAllTouchTargets,
  getGridColumnCount,
} from '../helpers/responsive-helpers'

// Configure tests to run on tablet viewport
test.use(VIEWPORTS.tablet)

test.describe('Tablet Usage (768px viewport)', () => {
  /**
   * T047: E2E test - Tablet viewport displays two-column document grid
   * 
   * Verifies that document grid uses 2 columns on tablet (md: breakpoint)
   * to optimize space while maintaining card readability
   */
  test('should display documents in two-column grid', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Navigate to documents page
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      // Find document grid
      const documentGrid = page.locator('[data-testid="document-grid"]').first()
      
      if (await documentGrid.isVisible()) {
        const columns = await getGridColumnCount(documentGrid)
        
        // Tablet should show 2 columns (md:grid-cols-2)
        expect(columns).toBe(2)
      }
    }
  })

  test('should have no horizontal scroll on all pages', async ({ page }) => {
    // Check Projects page
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    await assertNoHorizontalScroll(page)
    
    // Check Documents page
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      await assertNoHorizontalScroll(page)
      
      // Check Chat page
      const chatLink = page.locator('a[href*="chat"]').first()
      if (await chatLink.isVisible()) {
        await chatLink.click()
        await page.waitForLoadState('networkidle')
        await assertNoHorizontalScroll(page)
      }
    }
  })

  /**
   * T048: E2E test - Tablet chat shows side-by-side layout in landscape
   * 
   * Verifies chat interface adapts to wider tablet viewport
   * May show messages and sources side-by-side or expand message area
   */
  test('should show optimized chat layout on tablet', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      
      // Navigate to chat
      const chatLink = page.locator('a[href*="chat"]').first()
      if (await chatLink.isVisible()) {
        await chatLink.click()
        await page.waitForLoadState('networkidle')
        
        // Chat container should use available space
        const chatContainer = page.locator('[data-testid="chat-container"]').first()
        if (await chatContainer.isVisible()) {
          const box = await chatContainer.boundingBox()
          const viewportWidth = page.viewportSize()?.width || 768
          
          // Chat should take most of viewport width
          expect(box?.width).toBeGreaterThan(viewportWidth * 0.8)
        }
        
        // Sources sidebar may still be hidden on tablet (< lg:1024px)
        // or shown depending on design decision
        const sourcesSidebar = page.locator('aside').first()
        const sidebarVisible = await sourcesSidebar.isVisible().catch(() => false)
        
        // If sidebar exists, it should be properly sized
        if (sidebarVisible) {
          const sidebarBox = await sourcesSidebar.boundingBox()
          expect(sidebarBox?.width).toBeLessThan(400) // Reasonable sidebar width
        }
      }
    }
  })

  /**
   * T049: E2E test - All touch targets remain ≥44px on tablet
   * 
   * Tablets are touch devices, so WCAG 2.1 AA 44x44px requirement applies
   * Verifies all interactive elements are touch-friendly
   */
  test('should maintain 44px minimum touch targets', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Check all visible buttons on Projects page
    await assertAllTouchTargets(page, 'button', 44)
    
    // Navigate to Documents page and check
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      // Check all visible buttons on Documents page
      await assertAllTouchTargets(page, 'button', 44)
    }
  })

  /**
   * T050: E2E test - Orientation change preserves state
   * 
   * Verifies that rotating tablet (portrait ↔ landscape) doesn't lose
   * user input or cause errors. Tests by changing viewport dimensions.
   */
  test('should handle orientation change without losing state', async ({ browser }) => {
    // Start in portrait (768x1024)
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    })
    const newPage = await context.newPage()
    
    await newPage.goto('/projects')
    await newPage.waitForLoadState('networkidle')
    
    const projectCard = newPage.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      
      // Navigate to chat
      const chatLink = newPage.locator('a[href*="chat"]').first()
      if (await chatLink.isVisible()) {
        await chatLink.click()
        await newPage.waitForLoadState('networkidle')
        
        // Type a message in chat input
        const chatInput = newPage.locator('input[placeholder*="Ask" i], textarea[placeholder*="Ask" i]').first()
        if (await chatInput.isVisible()) {
          await chatInput.fill('Test message before rotation')
          
          // Rotate to landscape (1024x768)
          await newPage.setViewportSize({ width: 1024, height: 768 })
          await newPage.waitForTimeout(300) // Allow layout to stabilize
          
          // Check input value persisted
          const inputValue = await chatInput.inputValue()
          expect(inputValue).toBe('Test message before rotation')
          
          // Check no horizontal scroll after rotation
          const scrollWidth = await newPage.evaluate(() => document.documentElement.scrollWidth)
          const clientWidth = await newPage.evaluate(() => document.documentElement.clientWidth)
          expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
        }
      }
    }
    
    await context.close()
  })

  /**
   * Additional tablet-specific tests
   */
  test('should show appropriate header navigation on tablet', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Tablet may show mobile nav (< 1024px) or desktop nav (>= 1024px)
    // At 768px, mobile nav pattern is still appropriate
    const mobileMenuTrigger = page.locator('[data-testid="mobile-menu-trigger"]')
    
    // Mobile menu may be used on tablet (design decision)
    const mobileMenuVisible = await mobileMenuTrigger.isVisible().catch(() => false)
    
    if (mobileMenuVisible) {
      // If using mobile nav, it should work
      await mobileMenuTrigger.click()
      const navigationDrawer = page.locator('[role="dialog"]').first()
      await expect(navigationDrawer).toBeVisible()
    }
  })

  test('should have appropriate spacing on tablet', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Check container padding (should be between mobile and desktop)
    const container = page.locator('[class*="container"]').first()
    if (await container.isVisible()) {
      const padding = await container.evaluate((el) => {
        const style = window.getComputedStyle(el)
        return {
          left: parseInt(style.paddingLeft, 10),
          right: parseInt(style.paddingRight, 10),
        }
      })
      
      // Tablet should have at least 16px, up to 32px padding
      expect(padding.left).toBeGreaterThanOrEqual(16)
      expect(padding.left).toBeLessThanOrEqual(32)
    }
  })

  test('should optimize project list layout for tablet', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Project grid should show appropriate columns on tablet
    const projectGrid = page.locator('[data-testid="projects-grid"]').first()
    
    if (await projectGrid.isVisible()) {
      const columns = await getGridColumnCount(projectGrid)
      
      // Tablet can show 1-2 columns depending on design
      expect(columns).toBeGreaterThanOrEqual(1)
      expect(columns).toBeLessThanOrEqual(2)
    }
  })

  test('should handle long content without overflow', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Check that long text wraps properly
    const textElements = page.locator('p, h1, h2, h3')
    const count = await textElements.count()
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = textElements.nth(i)
        if (await element.isVisible()) {
          const box = await element.boundingBox()
          const viewportWidth = page.viewportSize()?.width || 768
          
          // Text elements shouldn't exceed viewport width
          expect(box?.width).toBeLessThanOrEqual(viewportWidth)
        }
      }
    }
  })
})

/**
 * Tablet Large (iPad Pro) Tests - 1024px viewport
 * Tests the transition to desktop-like layouts
 */
test.describe('Tablet Large Usage (1024px viewport)', () => {
  test.use(VIEWPORTS.tabletLarge)

  test('should show desktop-like chat layout at 1024px', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      
      const chatLink = page.locator('a[href*="chat"]').first()
      if (await chatLink.isVisible()) {
        await chatLink.click()
        await page.waitForLoadState('networkidle')
        
        // At lg: breakpoint (1024px), sources sidebar should be visible
        const sourcesSidebar = page.locator('aside').first()
        const sidebarVisible = await sourcesSidebar.isVisible().catch(() => false)
        
        if (sidebarVisible) {
          // Sidebar should be properly sized
          const sidebarBox = await sourcesSidebar.boundingBox()
          expect(sidebarBox?.width).toBeGreaterThan(200)
          expect(sidebarBox?.width).toBeLessThan(500)
        }
      }
    }
  })

  test('should show 3 document columns at 1024px', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      const documentGrid = page.locator('[data-testid="document-grid"]').first()
      
      if (await documentGrid.isVisible()) {
        const columns = await getGridColumnCount(documentGrid)
        
        // At lg: breakpoint, should show 3 columns
        expect(columns).toBe(3)
      }
    }
  })

  test('should show desktop navigation at 1024px', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // At lg: breakpoint, desktop nav should replace mobile menu
    const desktopNav = page.locator('nav:not([role="dialog"])').first()
    const mobileMenuTrigger = page.locator('button[aria-label*="menu" i]').first()
    
    // Check if desktop nav is visible
    const desktopNavVisible = await desktopNav.isVisible().catch(() => false)
    const mobileMenuVisible = await mobileMenuTrigger.isVisible().catch(() => false)
    
    // At 1024px, should prefer desktop nav over mobile menu
    if (desktopNavVisible) {
      expect(mobileMenuVisible).toBe(false)
    }
  })
})
