/**
 * E2E Tests for Document Upload and Management (User Story 1)
 * 
 * Tests cover:
 * - Document upload via file, text, and website
 * - Progress tracking during processing
 * - Document list display
 * - Document metadata viewing
 * - Document deletion
 */

import { test, expect } from '@playwright/test';
import { testProject, testDocuments, testFilePath } from '../fixtures/test-data';

test.describe('Document Upload and Management', () => {
  let projectId: string;

  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Create a test project
    await page.getByRole('button', { name: /create project/i }).click();
    await page.getByLabel(/project name/i).fill(testProject.name);
    await page.getByRole('button', { name: /create/i }).click();

    // Wait for project to be created and navigate to documents page
    await expect(page.getByText(testProject.name)).toBeVisible();
    await page.getByText(testProject.name).click();

    // Extract project ID from URL for cleanup
    const url = page.url();
    const match = url.match(/\/projects\/([^/]+)/);
    if (match) {
      projectId = match[1];
    }
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Delete test project
    if (projectId) {
      await page.goto('/');
      await page.getByRole('button', { name: /options/i }).first().click();
      await page.getByRole('menuitem', { name: /delete/i }).click();
      await page.getByRole('button', { name: /confirm/i }).click();
    }
  });

  test('should upload a file document successfully', async ({ page }) => {
    // Navigate to documents tab
    await page.getByRole('tab', { name: /documents/i }).click();

    // Upload file using dropzone
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);

    // Wait for upload progress
    await expect(page.getByRole('progressbar')).toBeVisible();

    // Wait for document to appear in list with PROCESSED status
    await expect(page.getByText('sample.txt')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/processed/i)).toBeVisible();

    // Verify document card displays metadata
    const documentCard = page.locator('[data-testid="document-card"]').first();
    await expect(documentCard).toContainText('sample.txt');
    await expect(documentCard).toContainText(/FILE/i);
  });

  test('should add text document successfully', async ({ page }) => {
    // Navigate to documents tab
    await page.getByRole('tab', { name: /documents/i }).click();

    // Switch to text upload tab
    await page.getByRole('tab', { name: /text/i }).click();

    // Fill in text content
    await page.getByLabel(/text content/i).fill(testDocuments.textDocument.text);
    await page.getByRole('button', { name: /add text/i }).click();

    // Wait for success notification
    await expect(page.getByText(/successfully added/i)).toBeVisible();

    // Verify document appears in list
    await expect(page.getByText(/TEXT/i)).toBeVisible();
    await expect(page.getByText(/processed/i)).toBeVisible({ timeout: 30000 });
  });

  test('should process website URL successfully', async ({ page }) => {
    // Navigate to documents tab
    await page.getByRole('tab', { name: /documents/i }).click();

    // Switch to website upload tab
    await page.getByRole('tab', { name: /website/i }).click();

    // Fill in URL
    await page.getByLabel(/url/i).fill(testDocuments.websiteUrl.url);
    await page.getByRole('button', { name: /process website/i }).click();

    // Wait for success notification
    await expect(page.getByText(/successfully added/i)).toBeVisible();

    // Verify document appears in list
    await expect(page.getByText(/WEBSITE/i)).toBeVisible();
  });

  test('should display document details in modal', async ({ page }) => {
    // First upload a document
    await page.getByRole('tab', { name: /documents/i }).click();
    await page.getByRole('tab', { name: /text/i }).click();
    await page.getByLabel(/text content/i).fill(testDocuments.textDocument.text);
    await page.getByRole('button', { name: /add text/i }).click();

    // Wait for document to be processed
    await expect(page.getByText(/processed/i)).toBeVisible({ timeout: 30000 });

    // Click on document card to view details
    const documentCard = page.locator('[data-testid="document-card"]').first();
    await documentCard.click();

    // Verify modal displays document details
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/document details/i);
    await expect(modal).toContainText(/type/i);
    await expect(modal).toContainText(/status/i);
    await expect(modal).toContainText(/created/i);
  });

  test('should delete document successfully', async ({ page }) => {
    // First upload a document
    await page.getByRole('tab', { name: /documents/i }).click();
    await page.getByRole('tab', { name: /text/i }).click();
    await page.getByLabel(/text content/i).fill(testDocuments.textDocument.text);
    await page.getByRole('button', { name: /add text/i }).click();

    // Wait for document to appear
    await expect(page.getByText(/processed/i)).toBeVisible({ timeout: 30000 });

    // Click delete button on document card
    await page.locator('[data-testid="document-card"]').first().hover();
    await page.getByRole('button', { name: /delete/i }).first().click();

    // Confirm deletion in dialog
    await page.getByRole('button', { name: /confirm/i }).click();

    // Verify success notification
    await expect(page.getByText(/successfully deleted/i)).toBeVisible();

    // Verify document no longer in list
    await expect(page.getByText(testDocuments.textDocument.text)).not.toBeVisible();
  });

  test('should validate file type and size', async ({ page }) => {
    // Navigate to documents tab
    await page.getByRole('tab', { name: /documents/i }).click();

    // Verify the validation message exists in the UI
    await expect(page.getByText(/pdf, docx, txt, or md/i)).toBeVisible();
    await expect(page.getByText(/25mb/i)).toBeVisible();
  });

  test('should show progress during document processing', async ({ page }) => {
    // Navigate to documents tab
    await page.getByRole('tab', { name: /documents/i }).click();

    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);

    // Verify progress indicator appears
    await expect(page.getByRole('progressbar')).toBeVisible();

    // Verify status changes from NOT_PROCESSED to PROCESSING to PROCESSED
    await expect(page.getByText(/processing/i)).toBeVisible();
    await expect(page.getByText(/processed/i)).toBeVisible({ timeout: 30000 });
  });

  test('should filter documents by type', async ({ page }) => {
    // Upload multiple document types
    await page.getByRole('tab', { name: /documents/i }).click();

    // Upload text document
    await page.getByRole('tab', { name: /text/i }).click();
    await page.getByLabel(/text content/i).fill(testDocuments.textDocument.text);
    await page.getByRole('button', { name: /add text/i }).click();
    await expect(page.getByText(/successfully added/i)).toBeVisible();

    // Upload file document
    await page.getByRole('tab', { name: /file/i }).click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);
    await expect(page.getByText(/successfully uploaded/i)).toBeVisible();

    // Wait for both documents to be processed
    await page.waitForTimeout(5000);

    // Apply filter for TEXT type only
    await page.getByLabel(/filter by type/i).click();
    await page.getByRole('option', { name: /text/i }).click();

    // Verify only TEXT documents are shown
    const documentCards = page.locator('[data-testid="document-card"]');
    await expect(documentCards).toHaveCount(1);
    await expect(documentCards.first()).toContainText(/TEXT/i);
  });

  test('should search documents by filename', async ({ page }) => {
    // Upload a document
    await page.getByRole('tab', { name: /documents/i }).click();
    await page.getByRole('tab', { name: /text/i }).click();
    await page.getByLabel(/text content/i).fill(testDocuments.textDocument.text);
    await page.getByRole('button', { name: /add text/i }).click();
    await expect(page.getByText(/processed/i)).toBeVisible({ timeout: 30000 });

    // Search for document
    await page.getByPlaceholder(/search documents/i).fill('test');

    // Verify search results update
    const documentCards = page.locator('[data-testid="document-card"]');
    await expect(documentCards).toHaveCount(1);
  });
});
