/**
 * E2E Tests for Chat Interface (User Story 2)
 * 
 * Tests cover:
 * - Asking questions and receiving answers
 * - Source citations display
 * - Follow-up questions maintaining context
 * - No relevant information message
 * - Conversation history
 * - New chat session creation
 */

import { test, expect } from '@playwright/test';
import { testProject, testChatMessages, testFilePath } from '../fixtures/test-data';

test.describe('Chat Interface and Q&A', () => {
  let projectId: string;

  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Create a test project
    await page.getByRole('button', { name: /create project/i }).click();
    await page.getByLabel(/project name/i).fill(testProject.name);
    await page.getByRole('button', { name: /create/i }).click();

    // Wait for project to be created and navigate to it
    await expect(page.getByText(testProject.name)).toBeVisible();
    await page.getByText(testProject.name).click();

    // Extract project ID from URL for cleanup
    const url = page.url();
    const match = url.match(/\/projects\/([^/]+)/);
    if (match) {
      projectId = match[1];
    }

    // Upload a test document for querying
    await page.getByRole('tab', { name: /documents/i }).click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);
    
    // Wait for document to be processed
    await expect(page.getByText(/processed/i)).toBeVisible({ timeout: 30000 });

    // Navigate to chat
    await page.getByRole('tab', { name: /chat/i }).click();
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

  test('should send a message and receive AI response with sources', async ({ page }) => {
    // Type a question
    await page.getByPlaceholder(/ask a question/i).fill(testChatMessages.simpleQuery);
    await page.getByRole('button', { name: /send/i }).click();

    // Verify user message appears
    await expect(page.getByText(testChatMessages.simpleQuery)).toBeVisible();

    // Wait for AI response
    await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible({ timeout: 15000 });

    // Verify response contains relevant information
    const assistantMessage = page.locator('[data-testid="assistant-message"]').first();
    await expect(assistantMessage).toContainText(/react/i);

    // Verify source citations are displayed
    await expect(page.getByText(/sources/i)).toBeVisible();
    await expect(page.locator('[data-testid="source-citation"]')).toBeVisible();
  });

  test('should maintain conversation context for follow-up questions', async ({ page }) => {
    // Send first question
    await page.getByPlaceholder(/ask a question/i).fill(testChatMessages.simpleQuery);
    await page.getByRole('button', { name: /send/i }).click();
    await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible({ timeout: 15000 });

    // Send follow-up question
    await page.getByPlaceholder(/ask a question/i).fill(testChatMessages.followUpQuery);
    await page.getByRole('button', { name: /send/i }).click();

    // Verify both messages are in history
    const messages = page.locator('[data-testid="chat-message"]');
    await expect(messages).toHaveCount(4); // 2 user messages + 2 assistant messages
  });

  test('should display source citations as expandable cards', async ({ page }) => {
    // Send a question
    await page.getByPlaceholder(/ask a question/i).fill(testChatMessages.simpleQuery);
    await page.getByRole('button', { name: /send/i }).click();
    await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible({ timeout: 15000 });

    // Verify source citation exists
    const sourceCitation = page.locator('[data-testid="source-citation"]').first();
    await expect(sourceCitation).toBeVisible();

    // Click to expand source
    await sourceCitation.click();

    // Verify expanded content shows document chunk
    await expect(page.getByText(/chunk text/i)).toBeVisible();
    await expect(page.getByText(/source/i)).toBeVisible();
  });

  test('should show loading indicator while waiting for response', async ({ page }) => {
    // Send a question
    await page.getByPlaceholder(/ask a question/i).fill(testChatMessages.simpleQuery);
    await page.getByRole('button', { name: /send/i }).click();

    // Verify loading indicator appears
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByText(/loading/i).or(page.locator('[data-testid="typing-indicator"]'))).toBeVisible();

    // Wait for response
    await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible({ timeout: 15000 });

    // Verify loading indicator disappears
    await expect(page.getByRole('status')).not.toBeVisible();
  });

  test('should display "no relevant information" message when query has no matches', async ({ page }) => {
    // Send a question with no relevant information
    await page.getByPlaceholder(/ask a question/i).fill(testChatMessages.noResultsQuery);
    await page.getByRole('button', { name: /send/i }).click();

    // Wait for response
    await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible({ timeout: 15000 });

    // Verify message indicates no relevant information found
    const assistantMessage = page.locator('[data-testid="assistant-message"]').first();
    await expect(assistantMessage).toContainText(/no relevant information|couldn't find|don't have information/i);
  });

  test('should display token usage and model information', async ({ page }) => {
    // Send a question
    await page.getByPlaceholder(/ask a question/i).fill(testChatMessages.simpleQuery);
    await page.getByRole('button', { name: /send/i }).click();
    await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible({ timeout: 15000 });

    // Verify footer displays token usage and model
    await expect(page.getByText(/tokens|model/i)).toBeVisible();
  });

  test('should clear history and start new chat session', async ({ page }) => {
    // Send a question to create history
    await page.getByPlaceholder(/ask a question/i).fill(testChatMessages.simpleQuery);
    await page.getByRole('button', { name: /send/i }).click();
    await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible({ timeout: 15000 });

    // Click new chat button
    await page.getByRole('button', { name: /new chat|clear history/i }).click();

    // Verify chat history is cleared
    const messages = page.locator('[data-testid="chat-message"]');
    await expect(messages).toHaveCount(0);

    // Verify empty state is shown
    await expect(page.getByText(/start a conversation|ask a question/i)).toBeVisible();
  });

  test('should auto-scroll to bottom when new messages arrive', async ({ page }) => {
    // Send multiple questions to create a long conversation
    for (let i = 0; i < 3; i++) {
      await page.getByPlaceholder(/ask a question/i).fill(`Question ${i + 1}: ${testChatMessages.simpleQuery}`);
      await page.getByRole('button', { name: /send/i }).click();
      await page.waitForTimeout(2000);
    }

    // Wait for last response
    await expect(page.locator('[data-testid="assistant-message"]').last()).toBeVisible({ timeout: 15000 });

    // Verify the last message is visible (meaning auto-scroll worked)
    const lastMessage = page.locator('[data-testid="chat-message"]').last();
    await expect(lastMessage).toBeInViewport();
  });

  test('should debounce input to prevent excessive API calls', async ({ page }) => {
    // Type quickly without sending
    await page.getByPlaceholder(/ask a question/i).fill('Quick typing test');
    await page.getByPlaceholder(/ask a question/i).press('Backspace');
    await page.getByPlaceholder(/ask a question/i).fill('More typing');

    // Verify no messages are sent automatically
    const messages = page.locator('[data-testid="chat-message"]');
    await expect(messages).toHaveCount(0);

    // Only send when explicitly clicking send button
    await page.getByRole('button', { name: /send/i }).click();
    await expect(messages).toHaveCount(1); // Only user message
  });

  test('should show suggested questions in empty state', async ({ page }) => {
    // Navigate to chat with no history
    await page.getByRole('tab', { name: /chat/i }).click();

    // Verify empty state with suggested questions
    await expect(page.getByText(/suggested questions|try asking/i)).toBeVisible();
    const suggestedQuestions = page.locator('[data-testid="suggested-question"]');
    expect(await suggestedQuestions.count()).toBeGreaterThan(0);

    // Click a suggested question
    await page.locator('[data-testid="suggested-question"]').first().click();

    // Verify question is filled in input
    const input = page.getByPlaceholder(/ask a question/i);
    await expect(input).not.toBeEmpty();
  });

  test('should handle enter key to send message', async ({ page }) => {
    // Type a question
    await page.getByPlaceholder(/ask a question/i).fill(testChatMessages.simpleQuery);

    // Press Enter to send
    await page.getByPlaceholder(/ask a question/i).press('Enter');

    // Verify message is sent
    await expect(page.getByText(testChatMessages.simpleQuery)).toBeVisible();
    await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible({ timeout: 15000 });
  });

  test('should display error message on API failure', async ({ page }) => {
    // Mock API failure by intercepting request
    await page.route('**/chat', route => {
      route.abort();
    });

    // Send a question
    await page.getByPlaceholder(/ask a question/i).fill(testChatMessages.simpleQuery);
    await page.getByRole('button', { name: /send/i }).click();

    // Verify error message is displayed
    await expect(page.getByText(/error|failed|try again/i)).toBeVisible();
  });

  test('should show empty state when no documents are uploaded', async ({ page }) => {
    // Create a new project without documents
    await page.goto('/');
    await page.getByRole('button', { name: /create project/i }).click();
    await page.getByLabel(/project name/i).fill('Empty Project');
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText('Empty Project')).toBeVisible();
    await page.getByText('Empty Project').click();

    // Navigate to chat
    await page.getByRole('tab', { name: /chat/i }).click();

    // Verify message indicating no documents
    await expect(page.getByText(/no documents|upload documents first/i)).toBeVisible();
  });
});
