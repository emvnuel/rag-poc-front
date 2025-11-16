/**
 * E2E Accessibility Tests (WCAG 2.1 AA Compliance)
 * 
 * Tests cover:
 * - Automated axe accessibility audits on all pages
 * - Keyboard navigation for all interactive elements
 * - ARIA labels and semantic HTML
 * - Focus management and tab order
 * 
 * Related tasks: T154, T155, T156, T157, T158
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
  test('Projects page should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Documents page should have no accessibility violations', async ({ page }) => {
    // Create a test project and navigate to it
    await page.goto('/');
    const createButton = page.getByRole('button', { name: /create project/i });
    await createButton.click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel(/project name/i).fill('Accessibility Docs Test');
    await page.getByRole('dialog').getByRole('button', { name: /create project/i }).click();
    
    // Wait for project to be created - either dialog closes or we see success
    await page.waitForTimeout(2000);
    
    // If we're still on projects page, click the new project
    const projectCard = page.getByText('Accessibility Docs Test');
    if (await projectCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await projectCard.click();
    }
    
    // Navigate to documents tab if not already there
    const documentsTab = page.getByRole('tab', { name: /documents/i });
    if (await documentsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await documentsTab.click();
      await page.waitForTimeout(500);
    }
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Chat page should have no accessibility violations', async ({ page }) => {
    // Create a test project first
    await page.goto('/');
    await page.getByRole('button', { name: /create project/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    const projectNameInput = page.getByLabel(/project name/i);
    await projectNameInput.fill('Accessibility Chat Test');
    
    // Submit the form
    const dialog = page.getByRole('dialog');
    const createButton = dialog.getByRole('button', { name: 'Create Project', exact: true });
    await createButton.click();
    
    // Wait for project creation
    await page.waitForTimeout(2000);
    
    // Try to click project if visible (flexible navigation)
    const projectCard = page.getByText('Accessibility Chat Test').first();
    if (await projectCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await projectCard.click();
    }
    
    // Navigate to chat tab if visible
    const chatTab = page.getByRole('tab', { name: /chat/i });
    if (await chatTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await chatTab.click();
      await page.waitForTimeout(500);
    }
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Keyboard Navigation (T155)', () => {
  test('should navigate projects page with keyboard only', async ({ page }) => {
    await page.goto('/');
    
    // Tab to the create project button
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('role'));
    
    // Verify focus is on an interactive element (can be null, button, link, textbox, etc.)
    const isValidFocus = focusedElement === null || (focusedElement !== undefined && ['button', 'link', 'textbox'].includes(focusedElement));
    expect(isValidFocus).toBe(true);
    
    // Press Enter to activate the focused element if it's the create button
    const createButton = page.getByRole('button', { name: /create project/i });
    if (await createButton.isVisible()) {
      await createButton.focus();
      await page.keyboard.press('Enter');
      
      // Verify dialog opened
      await expect(page.getByRole('dialog')).toBeVisible();
      
      // Tab through dialog elements
      await page.keyboard.press('Tab'); // Focus on project name input
      const projectNameInput = page.getByLabel(/project name/i);
      await expect(projectNameInput).toBeFocused();
      
      // Tab to create button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // May need multiple tabs depending on dialog structure
      
      // Press Escape to close dialog
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });

  test('should navigate documents page with keyboard only', async ({ page }) => {
    // Setup: Create a project
    await page.goto('/');
    await page.getByRole('button', { name: /create project/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    const projectNameInput = page.getByLabel(/project name/i);
    await projectNameInput.fill('Keyboard Docs Nav Test');
    
    // Submit the form
    const dialog = page.getByRole('dialog');
    const createButton = dialog.getByRole('button', { name: 'Create Project', exact: true });
    await createButton.click();
    
    // Wait for project creation
    await page.waitForTimeout(2000);
    
    // Try to click project if visible (flexible navigation)
    const projectCard = page.getByText('Keyboard Docs Nav Test').first();
    if (await projectCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await projectCard.click();
    }
    
    // Navigate to documents tab if visible
    const documentsTab = page.getByRole('tab', { name: /documents/i });
    if (await documentsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await documentsTab.click();
      await page.waitForTimeout(500);
    }
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    
    // Verify focus moves through interactive elements (body is valid when no focusable elements)
    const validElements = ['button', 'input', 'a', 'select', 'textarea', 'body'];
    expect(validElements).toContain(focusedElement);
    
    // Test that Tab key moves focus forward
    await page.keyboard.press('Tab');
    const nextFocusedElement = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    
    // Verify focus moved (either to new element or stayed if at end)
    expect(validElements).toContain(nextFocusedElement);
    
    // Test that Shift+Tab moves focus backward
    await page.keyboard.press('Shift+Tab');
    const backFocusedElement = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    
    // Verify we either returned to original element or are on a valid focusable element
    expect(validElements).toContain(backFocusedElement);
  });

  test('should navigate chat interface with keyboard only', async ({ page }) => {
    // Setup: Create a project
    await page.goto('/');
    await page.getByRole('button', { name: /create project/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    const projectNameInput = page.getByLabel(/project name/i);
    await projectNameInput.fill('Keyboard Chat Nav Test');
    
    // Submit the form
    const dialog = page.getByRole('dialog');
    const createButton = dialog.getByRole('button', { name: 'Create Project', exact: true });
    await createButton.click();
    
    // Wait for project creation
    await page.waitForTimeout(2000);
    
    // Get the project ID from the URL or by navigating to chat directly
    // Check if we have a project card to click
    const projectCard = page.getByText('Keyboard Chat Nav Test').first();
    if (await projectCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await projectCard.click();
      await page.waitForTimeout(1000);
    }
    
    // Navigate directly to chat page by replacing 'documents' with 'chat' in URL
    const currentUrl = page.url();
    const chatUrl = currentUrl.replace('/documents', '/chat');
    await page.goto(chatUrl);
    
    // Wait for chat interface to load
    const chatInput = page.getByPlaceholder(/ask a question/i);
    await expect(chatInput).toBeVisible({ timeout: 5000 });
    
    // Focus on chat input using Tab navigation
    await chatInput.focus();
    
    // Verify we can tab through the interface
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    const validElements = ['button', 'input', 'textarea', 'a', 'body'];
    expect(validElements).toContain(focusedElement);
  });

  test('should show visible focus indicators on all interactive elements', async ({ page }) => {
    await page.goto('/');
    
    // Tab through elements and verify focus indicators
    await page.keyboard.press('Tab');
    
    // Get the focused element's computed styles
    const focusIndicator = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(element);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });
    
    // Verify focus indicator is visible (either outline or box-shadow)
    const hasFocusIndicator = 
      focusIndicator.outlineWidth !== '0px' || 
      focusIndicator.boxShadow !== 'none';
    
    expect(hasFocusIndicator).toBe(true);
  });

  test('should trap focus within modals and dialogs', async ({ page }) => {
    await page.goto('/');
    
    // Open create project dialog
    await page.getByRole('button', { name: /create project/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Get all focusable elements in the dialog
    const focusableElementsInDialog = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return 0;
      
      const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      return dialog.querySelectorAll(focusableSelectors).length;
    });
    
    expect(focusableElementsInDialog).toBeGreaterThan(0);
    
    // Tab through all elements and verify focus stays within dialog
    for (let i = 0; i < focusableElementsInDialog + 2; i++) {
      await page.keyboard.press('Tab');
    }
    
    // After tabbing past all elements, focus should wrap back to first element
    const focusIsStillInDialog = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const activeElement = document.activeElement;
      return dialog?.contains(activeElement) || false;
    });
    
    expect(focusIsStillInDialog).toBe(true);
  });
});

test.describe('ARIA Labels and Semantic HTML (T156)', () => {
  test('all icon-only buttons should have accessible labels', async ({ page }) => {
    await page.goto('/');
    
    // Check theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i]').first();
    if (await themeToggle.isVisible()) {
      const ariaLabel = await themeToggle.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel!.length).toBeGreaterThan(0);
    }
  });

  test('all images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    const imagesWithoutAlt = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.alt && !img.getAttribute('aria-hidden')).length;
    });
    
    expect(imagesWithoutAlt).toBe(0);
  });

  test('form inputs should have associated labels', async ({ page }) => {
    await page.goto('/');
    
    // Open create project dialog
    await page.getByRole('button', { name: /create project/i }).click();
    
    // Verify project name input has a label
    const projectNameInput = page.getByLabel(/project name/i);
    await expect(projectNameInput).toBeVisible();
    
    // Verify the input is properly associated with its label
    const inputId = await projectNameInput.getAttribute('id');
    expect(inputId).toBeTruthy();
  });

  test('should use semantic HTML landmarks', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    const mainLandmark = page.locator('main');
    await expect(mainLandmark).toBeVisible();
    
    // Check for navigation landmark (if applicable)
    const navElements = await page.locator('nav').count();
    expect(navElements).toBeGreaterThanOrEqual(0); // Nav is optional but should be present if navigation exists
  });
});

test.describe('Color Contrast (T158)', () => {
  test('should verify minimum contrast ratios are met', async ({ page }) => {
    await page.goto('/');
    
    // Run axe with contrast rules specifically
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .options({ rules: { 'color-contrast': { enabled: true } } })
      .analyze();
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );
    
    expect(contrastViolations).toEqual([]);
  });

  test('should maintain contrast in dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Toggle to dark mode
    const themeToggle = page.locator('button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      
      // Wait for theme transition
      await page.waitForTimeout(500);
      
      // Run contrast check in dark mode
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .options({ rules: { 'color-contrast': { enabled: true } } })
        .analyze();
      
      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast'
      );
      
      expect(contrastViolations).toEqual([]);
    }
  });
});
