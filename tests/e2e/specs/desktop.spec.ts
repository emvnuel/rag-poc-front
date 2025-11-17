/**
 * E2E Tests: Desktop and Large Screen Optimization (User Story 3)
 * 
 * Tests responsive behavior on desktop viewports (1024px-2560px+)
 * Verifies multi-column layouts, sidebars, smooth transitions, and optimized information density
 * 
 * Tasks: T059-T063
 */

import { test, expect } from '@playwright/test'
import { VIEWPORTS } from '../fixtures/viewports'
import {
  assertNoHorizontalScroll,
  getGridColumnCount,
} from '../helpers/responsive-helpers'

test.describe('Desktop Usage (1920px viewport)', () => {
  test.use(VIEWPORTS.desktop)

  /**
   * T059: E2E test - Desktop chat shows three-column layout with sources
   * 
   * Verifies desktop chat interface uses multi-column layout:
   * - Main messages area
   * - Sources sidebar (visible by default)
   * Optimal use of wide screen space
   */
  test('should show three-column chat layout with sources sidebar', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      
      const chatLink = page.locator('a[href*="chat"]').first()
      if (await chatLink.isVisible()) {
        await chatLink.click()
        await page.waitForLoadState('networkidle')
        
        // Check chat container layout
        const chatContainer = page.locator('[data-testid="chat-container"]').first()
        if (await chatContainer.isVisible()) {
          // Should be flex-row on desktop (side-by-side)
          const flexDirection = await chatContainer.evaluate((el) => 
            window.getComputedStyle(el).flexDirection
          )
          expect(flexDirection).toBe('row')
        }
        
        // Sources sidebar should be visible on desktop
        const sourcesSidebar = page.locator('aside').first()
        if (await sourcesSidebar.count() > 0) {
          await expect(sourcesSidebar).toBeVisible()
          
          // Sidebar should have reasonable width (not too narrow or wide)
          const sidebarBox = await sourcesSidebar.boundingBox()
          expect(sidebarBox?.width).toBeGreaterThan(250)
          expect(sidebarBox?.width).toBeLessThan(500)
        }
      }
    }
  })

  /**
   * T060: E2E test - Desktop documents show 3-4 column grid
   * 
   * Verifies document grid adapts to desktop viewport with 3-4 columns
   * based on screen width (lg: 3 cols, xl: 4 cols)
   */
  test('should display documents in 3-4 column grid', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      const documentGrid = page.locator('[data-testid="document-grid"]').first()
      
      if (await documentGrid.isVisible()) {
        const columns = await getGridColumnCount(documentGrid)
        
        // Desktop (1920px) should show 3-4 columns
        // lg: (1024px) = 3 cols, xl: (1280px) = 4 cols
        expect(columns).toBeGreaterThanOrEqual(3)
        expect(columns).toBeLessThanOrEqual(4)
      }
    }
  })

  /**
   * T061: E2E test - Desktop header shows inline navigation
   * 
   * Verifies desktop header displays horizontal navigation instead of
   * hamburger menu, making navigation more discoverable
   */
  test('should show inline navigation (no hamburger menu)', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Mobile menu trigger should be hidden on desktop
    const mobileMenuTrigger = page.locator('button[aria-label*="menu" i], button[aria-label*="navigation" i]').first()
    const mobileMenuVisible = await mobileMenuTrigger.isVisible().catch(() => false)
    
    expect(mobileMenuVisible).toBe(false)
    
    // Desktop navigation should be visible (if nav links exist)
    const desktopNav = page.locator('nav:not([role="dialog"])').first()
    if (await desktopNav.count() > 0) {
      const desktopNavVisible = await desktopNav.isVisible()
      expect(desktopNavVisible).toBe(true)
    }
  })

  /**
   * T062: E2E test - Browser window resize has smooth transitions
   * 
   * Verifies that resizing browser doesn't cause jarring layout shifts
   * Measures Cumulative Layout Shift (CLS) during resize
   */
  test('should have smooth transitions during resize', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Record initial layout
    const initialScrollHeight = await page.evaluate(() => document.documentElement.scrollHeight)
    
    // Resize to slightly smaller
    await page.setViewportSize({ width: 1600, height: 1080 })
    await page.waitForTimeout(300) // Allow transitions to complete
    
    // Check no horizontal scroll introduced
    await assertNoHorizontalScroll(page)
    
    // Resize to larger
    await page.setViewportSize({ width: 2560, height: 1440 })
    await page.waitForTimeout(300)
    
    // Check content still accessible
    const finalScrollHeight = await page.evaluate(() => document.documentElement.scrollHeight)
    
    // Content height shouldn't drastically change (indicates layout shift)
    const heightDiff = Math.abs(finalScrollHeight - initialScrollHeight)
    const percentChange = (heightDiff / initialScrollHeight) * 100
    
    // Allow up to 10% height change (some adjustment expected with more columns)
    expect(percentChange).toBeLessThan(10)
  })

  /**
   * T063: E2E test - Ultra-wide maintains max-width containers
   * 
   * Verifies content doesn't stretch excessively on ultra-wide screens
   * Max-width containers keep line lengths readable
   */
  test('should maintain reasonable max-width on ultra-wide', async ({ browser }) => {
    // Test on ultra-wide viewport
    const context = await browser.newContext({
      viewport: { width: 2560, height: 1440 },
    })
    const newPage = await context.newPage()
    
    await newPage.goto('/projects')
    await newPage.waitForLoadState('networkidle')
    
    // Check that main container has max-width
    const container = newPage.locator('[class*="container"]').first()
    if (await container.isVisible()) {
      const containerWidth = await container.evaluate((el) => 
        el.getBoundingClientRect().width
      )
      
      // Container shouldn't exceed reasonable max-width (e.g., 1400-1600px)
      expect(containerWidth).toBeLessThan(1700)
      
      // But should still use substantial portion of screen
      expect(containerWidth).toBeGreaterThan(1200)
    }
    
    await context.close()
  })

  /**
   * Additional desktop UX tests
   */
  test('should have no horizontal scroll on all pages', async ({ page }) => {
    // Projects page
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    await assertNoHorizontalScroll(page)
    
    // Documents page
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      await assertNoHorizontalScroll(page)
      
      // Chat page
      const chatLink = page.locator('a[href*="chat"]').first()
      if (await chatLink.isVisible()) {
        await chatLink.click()
        await page.waitForLoadState('networkidle')
        await assertNoHorizontalScroll(page)
      }
    }
  })

  test('should have generous spacing on desktop', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Check container padding (should be generous on desktop)
    const container = page.locator('[class*="container"]').first()
    if (await container.isVisible()) {
      const padding = await container.evaluate((el) => {
        const style = window.getComputedStyle(el)
        return {
          left: parseInt(style.paddingLeft, 10),
          right: parseInt(style.paddingRight, 10),
          top: parseInt(style.paddingTop, 10),
        }
      })
      
      // Desktop should have at least 24px padding, up to 32px
      expect(padding.left).toBeGreaterThanOrEqual(24)
    }
  })

  test('should optimize project list for desktop', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectGrid = page.locator('[data-testid="projects-grid"]').first()
    
    if (await projectGrid.isVisible()) {
      const columns = await getGridColumnCount(projectGrid)
      
      // Desktop should show 2-3 project columns
      expect(columns).toBeGreaterThanOrEqual(2)
      expect(columns).toBeLessThanOrEqual(3)
    }
  })

  test('should show compact project selector on desktop', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      // Project selector on desktop should be compact (not full-width)
      const projectSelector = page.locator('[data-testid="project-selector"]').first()
      
      if (await projectSelector.isVisible()) {
        const box = await projectSelector.boundingBox()
        const viewportWidth = page.viewportSize()?.width || 1920
        
        // Should be less than 30% of viewport width on desktop
        expect(box?.width).toBeLessThan(viewportWidth * 0.3)
      }
    }
  })

  test('should handle long content with proper line length', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      
      const chatLink = page.locator('a[href*="chat"]').first()
      if (await chatLink.isVisible()) {
        await chatLink.click()
        await page.waitForLoadState('networkidle')
        
        // Check chat messages have reasonable line length
        const messageContent = page.locator('[data-testid="message-content"]').first()
        
        if (await messageContent.isVisible()) {
          const box = await messageContent.boundingBox()
          
          // Message content shouldn't exceed ~800px for readability
          // (roughly 75 characters at 16px font)
          expect(box?.width).toBeLessThan(900)
        }
      }
    }
  })
})

/**
 * Ultra-Wide Desktop Tests (2560x1440)
 * Tests behavior on very large screens
 */
test.describe('Ultra-Wide Desktop Usage (2560px viewport)', () => {
  test.use(VIEWPORTS.desktopLarge)

  test('should show maximum grid columns', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      const documentGrid = page.locator('[data-testid="document-grid"]').first()
      
      if (await documentGrid.isVisible()) {
        const columns = await getGridColumnCount(documentGrid)
        
        // Ultra-wide should show 4 columns (xl: breakpoint)
        expect(columns).toBe(4)
      }
    }
  })

  test('should maintain readability with max-width constraints', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Main content should be centered with reasonable max-width
    const main = page.locator('main').first()
    if (await main.isVisible()) {
      const mainBox = await main.boundingBox()
      const viewportWidth = page.viewportSize()?.width || 2560
      
      // Main content shouldn't be full viewport width on ultra-wide
      expect(mainBox?.width).toBeLessThan(viewportWidth * 0.9)
    }
  })

  test('should have no excessive whitespace', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Content should utilize the available space reasonably
    const container = page.locator('[class*="container"]').first()
    if (await container.isVisible()) {
      const containerWidth = await container.evaluate((el) => 
        el.getBoundingClientRect().width
      )
      
      // Should be substantial but not excessive
      expect(containerWidth).toBeGreaterThan(1200)
      expect(containerWidth).toBeLessThan(1800)
    }
  })
})
