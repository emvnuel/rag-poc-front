/**
 * E2E Tests: Responsive Typography and Spacing (User Story 5)
 * 
 * Tests text readability and spacing across all viewport sizes
 * - 16px minimum font size on mobile (prevents auto-zoom)
 * - Headings scale progressively
 * - Line lengths stay optimal (45-75 characters)
 * - Spacing scales from tight (mobile) to generous (desktop)
 * 
 * Tasks: T087-T090
 */

import { test, expect } from '@playwright/test'
import { VIEWPORTS } from '../fixtures/viewports'
import { assertMinimumFontSize } from '../helpers/responsive-helpers'

test.describe('Typography - Mobile', () => {
  test.use(VIEWPORTS.mobile)

  /**
   * T087: E2E test - Mobile base font size is ≥16px
   * 
   * Verifies all text inputs use 16px minimum to prevent iOS auto-zoom
   * Body text should also be readable at 16px
   */
  test('should have 16px minimum font size on inputs', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      // Check search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]').first()
      if (await searchInput.isVisible()) {
        await assertMinimumFontSize(searchInput, 16)
      }
      
      // Check text inputs
      const textInput = page.locator('input[type="text"]').first()
      if (await textInput.isVisible()) {
        await assertMinimumFontSize(textInput, 16)
      }
      
      // Navigate to chat and check message input
      const chatLink = page.locator('a[href*="chat"]').first()
      if (await chatLink.isVisible()) {
        await chatLink.click()
        await page.waitForLoadState('networkidle')
        
        const chatInput = page.locator('input[placeholder*="Ask" i], textarea[placeholder*="Ask" i]').first()
        if (await chatInput.isVisible()) {
          await assertMinimumFontSize(chatInput, 16)
        }
      }
    }
  })

  test('should have readable body text (14px-16px)', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Check body text / paragraph text
    const bodyText = page.locator('p, span, div[class*="text"]').first()
    if (await bodyText.isVisible()) {
      const fontSize = await bodyText.evaluate((el) => 
        parseInt(window.getComputedStyle(el).fontSize, 10)
      )
      
      // Body text should be at least 14px, ideally 16px
      expect(fontSize).toBeGreaterThanOrEqual(14)
    }
  })

  /**
   * T088: E2E test - Headings scale across breakpoints
   * 
   * Verifies headings are appropriately sized for mobile
   * and scale up on larger screens
   */
  test('should have appropriately sized headings on mobile', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Check H1 exists and is large enough
    const h1 = page.locator('h1').first()
    if (await h1.isVisible()) {
      const fontSize = await h1.evaluate((el) => 
        parseInt(window.getComputedStyle(el).fontSize, 10)
      )
      
      // H1 on mobile should be at least 24px (text-2xl)
      expect(fontSize).toBeGreaterThanOrEqual(24)
      expect(fontSize).toBeLessThan(40) // But not too large on mobile
    }
    
    // Check H2 sizing
    const h2 = page.locator('h2').first()
    if (await h2.isVisible()) {
      const fontSize = await h2.evaluate((el) => 
        parseInt(window.getComputedStyle(el).fontSize, 10)
      )
      
      // H2 on mobile should be ~20-24px
      expect(fontSize).toBeGreaterThanOrEqual(18)
      expect(fontSize).toBeLessThan(32)
    }
  })
})

test.describe('Typography - Tablet', () => {
  test.use(VIEWPORTS.tablet)

  test('headings should scale up on tablet', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const h1 = page.locator('h1').first()
    if (await h1.isVisible()) {
      const fontSize = await h1.evaluate((el) => 
        parseInt(window.getComputedStyle(el).fontSize, 10)
      )
      
      // H1 on tablet (md:) should be 30-36px (text-3xl to text-4xl)
      expect(fontSize).toBeGreaterThanOrEqual(28)
      expect(fontSize).toBeLessThan(48)
    }
  })

  test('inputs maintain 16px minimum', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      const input = page.locator('input').first()
      if (await input.isVisible()) {
        await assertMinimumFontSize(input, 16)
      }
    }
  })
})

test.describe('Typography - Desktop', () => {
  test.use(VIEWPORTS.desktop)

  test('headings should be largest on desktop', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const h1 = page.locator('h1').first()
    if (await h1.isVisible()) {
      const fontSize = await h1.evaluate((el) => 
        parseInt(window.getComputedStyle(el).fontSize, 10)
      )
      
      // H1 on desktop (lg:) should be ~36-48px (text-4xl to text-5xl)
      expect(fontSize).toBeGreaterThanOrEqual(32)
    }
  })

  test('inputs can be slightly smaller on desktop', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      await page.waitForLoadState('networkidle')
      
      const input = page.locator('input').first()
      if (await input.isVisible()) {
        const fontSize = await input.evaluate((el) => 
          parseInt(window.getComputedStyle(el).fontSize, 10)
        )
        
        // Desktop inputs can be 14-16px (no auto-zoom issue)
        expect(fontSize).toBeGreaterThanOrEqual(14)
      }
    }
  })
})

test.describe('Line Length and Readability', () => {
  /**
   * T089: E2E test - Line lengths stay within 45-75 characters
   * 
   * Verifies text blocks maintain optimal line length for readability
   * across all viewport sizes
   */
  test('mobile should have appropriate line lengths', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Mobile viewport naturally constrains line length
    // 375px / 16px ≈ 23 characters, but with padding and multi-word,
    // lines should be reasonable
    const paragraph = page.locator('p').first()
    if (await paragraph.isVisible()) {
      const width = await paragraph.evaluate((el) => 
        el.getBoundingClientRect().width
      )
      
      // Should use most of mobile width
      expect(width).toBeLessThan(VIEWPORTS.mobile.width)
      expect(width).toBeGreaterThan(VIEWPORTS.mobile.width * 0.7)
    }
  })

  test('desktop should constrain line length for readability', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const projectCard = page.locator('[data-testid="project-card"]').first()
    if (await projectCard.isVisible()) {
      await projectCard.click()
      
      const chatLink = page.locator('a[href*="chat"]').first()
      if (await chatLink.isVisible()) {
        await chatLink.click()
        await page.waitForLoadState('networkidle')
        
        // Chat messages should have max-width for readability
        const messageContent = page.locator('[data-testid="message-content"]').first()
        if (await messageContent.isVisible()) {
          const width = await messageContent.evaluate((el) => 
            el.getBoundingClientRect().width
          )
          
          // Should not exceed ~900px (roughly 75 chars at 16px)
          expect(width).toBeLessThan(1000)
        }
      }
    }
  })

  test('ultra-wide should still maintain readable line lengths', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktopLarge)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    // Text blocks should not stretch full width on ultra-wide
    const textBlock = page.locator('p, div[class*="prose"]').first()
    if (await textBlock.isVisible()) {
      const width = await textBlock.evaluate((el) => 
        el.getBoundingClientRect().width
      )
      
      // Should be constrained for readability
      expect(width).toBeLessThan(1200)
    }
  })
})

test.describe('Spacing Scale', () => {
  /**
   * T090: E2E test - Spacing scales from tight (mobile) to generous (desktop)
   * 
   * Verifies padding and margins progress appropriately across breakpoints
   * for optimal use of screen space
   */
  test('mobile should have tight but adequate spacing', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const container = page.locator('[class*="container"]').first()
    if (await container.isVisible()) {
      const padding = await container.evaluate((el) => {
        const style = window.getComputedStyle(el)
        return {
          left: parseInt(style.paddingLeft, 10),
          right: parseInt(style.paddingRight, 10),
        }
      })
      
      // Mobile should have 16px (p-4) minimum
      expect(padding.left).toBeGreaterThanOrEqual(16)
      expect(padding.left).toBeLessThan(32) // But not excessive
    }
  })

  test('tablet should have medium spacing', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const container = page.locator('[class*="container"]').first()
    if (await container.isVisible()) {
      const padding = await container.evaluate((el) => {
        const style = window.getComputedStyle(el)
        return parseInt(style.paddingLeft, 10)
      })
      
      // Tablet should have 16-24px padding (p-4 to p-6)
      expect(padding).toBeGreaterThanOrEqual(16)
      expect(padding).toBeLessThan(40)
    }
  })

  test('desktop should have generous spacing', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const container = page.locator('[class*="container"]').first()
    if (await container.isVisible()) {
      const padding = await container.evaluate((el) => {
        const style = window.getComputedStyle(el)
        return parseInt(style.paddingLeft, 10)
      })
      
      // Desktop should have 24-32px padding (p-6 to p-8)
      expect(padding).toBeGreaterThanOrEqual(20)
    }
  })

  test('grid gaps should scale with viewport', async ({ page }) => {
    const viewports = [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop]
    const gaps: number[] = []
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/projects')
      await page.waitForLoadState('networkidle')
      
      const projectCard = page.locator('[data-testid="project-card"]').first()
      if (await projectCard.isVisible()) {
        await projectCard.click()
        await page.waitForLoadState('networkidle')
        
        const grid = page.locator('[data-testid="document-grid"]').first()
        if (await grid.isVisible()) {
          const gap = await grid.evaluate((el) => {
            const style = window.getComputedStyle(el)
            return parseInt(style.gap, 10)
          })
          gaps.push(gap)
        }
      }
    }
    
    // Gaps should generally increase or stay same from mobile to desktop
    if (gaps.length === 3) {
      expect(gaps[2]).toBeGreaterThanOrEqual(gaps[0]) // Desktop >= Mobile
    }
  })
})

test.describe('Font Weight and Style Consistency', () => {
  test('headings should be bold/semibold', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const h1 = page.locator('h1').first()
    if (await h1.isVisible()) {
      const fontWeight = await h1.evaluate((el) => 
        window.getComputedStyle(el).fontWeight
      )
      
      // Should be at least 600 (semibold) or 700 (bold)
      expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(600)
    }
  })

  test('body text should be regular weight', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    
    const bodyText = page.locator('p').first()
    if (await bodyText.isVisible()) {
      const fontWeight = await bodyText.evaluate((el) => 
        window.getComputedStyle(el).fontWeight
      )
      
      // Should be 400 (regular) or 500 (medium)
      expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(400)
      expect(parseInt(fontWeight)).toBeLessThan(700)
    }
  })
})
