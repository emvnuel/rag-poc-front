/**
 * Unit tests for useSendChatMessage hook
 * 
 * Tests the chat message sending functionality including:
 * - Successful message sending
 * - Error handling with toast notifications
 * - Retry functionality
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { useSendChatMessage } from './useSendChatMessage'
import * as chatApi from '../services/chat-api'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('../services/chat-api')
vi.mock('sonner')

describe('useSendChatMessage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    // Create a new QueryClient for each test to avoid state leakage
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  it('should successfully send a chat message', async () => {
    const mockResponse = {
      response: 'This is a test response',
      messages: [
        { role: 'user', content: 'Test question' },
        { role: 'assistant', content: 'This is a test response' },
      ],
      sources: [],
      model: 'llama3',
      totalDuration: 1000000000,
      promptEvalCount: 10,
      evalCount: 20,
    }

    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useSendChatMessage(), { wrapper: createWrapper() })

    const chatRequest = {
      projectId: 'test-project-id',
      message: 'Test question',
      history: [],
    }

    // Send message
    result.current.mutate(chatRequest)

    // Wait for mutation to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(chatApi.sendMessage).toHaveBeenCalledWith(chatRequest, expect.any(Object))
    expect(result.current.data).toEqual(mockResponse)
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('should show error toast when message sending fails', async () => {
    const mockError = new Error('Network error')
    vi.mocked(chatApi.sendMessage).mockRejectedValue(mockError)

    const { result } = renderHook(() => useSendChatMessage(), { wrapper: createWrapper() })

    const chatRequest = {
      projectId: 'test-project-id',
      message: 'Test question',
      history: [],
    }

    // Send message
    result.current.mutate(chatRequest)

    // Wait for mutation to fail
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('Failed to send message', {
      description: 'Network error',
      action: expect.objectContaining({
        label: 'Retry',
      }),
    })
  })

  it('should handle API error with custom error message', async () => {
    const mockError = new Error('Custom API error')
    vi.mocked(chatApi.sendMessage).mockRejectedValue(mockError)

    const { result } = renderHook(() => useSendChatMessage(), { wrapper: createWrapper() })

    const chatRequest = {
      projectId: 'test-project-id',
      message: 'Test question',
      history: [],
    }

    result.current.mutate(chatRequest)

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('Failed to send message', {
      description: 'Custom API error',
      action: expect.any(Object),
    })
  })

  it('should include conversation history in request', async () => {
    const mockResponse = {
      response: 'Response with context',
      messages: [],
      sources: [],
      model: 'llama3',
      totalDuration: 1000000000,
      promptEvalCount: 15,
      evalCount: 25,
    }

    vi.mocked(chatApi.sendMessage).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useSendChatMessage(), { wrapper: createWrapper() })

    const chatRequest = {
      projectId: 'test-project-id',
      message: 'Follow-up question',
      history: [
        { role: 'user', content: 'First question' },
        { role: 'assistant', content: 'First answer' },
      ],
    }

    result.current.mutate(chatRequest)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(chatApi.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        history: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'First question' }),
          expect.objectContaining({ role: 'assistant', content: 'First answer' }),
        ]),
      }),
      expect.any(Object)
    )
  })

  it('should provide retry action in error toast', async () => {
    const mockError = new Error('Temporary failure')
    vi.mocked(chatApi.sendMessage).mockRejectedValue(mockError)

    const { result } = renderHook(() => useSendChatMessage(), { wrapper: createWrapper() })

    const chatRequest = {
      projectId: 'test-project-id',
      message: 'Test question',
      history: [],
    }

    result.current.mutate(chatRequest)

    await waitFor(() => expect(result.current.isError).toBe(true))

    const toastCall = vi.mocked(toast.error).mock.calls[0]
    expect(toastCall[1]).toHaveProperty('action')
    expect(toastCall[1]?.action).toHaveProperty('label', 'Retry')
    expect(toastCall[1]?.action).toHaveProperty('onClick')
  })

  it('should transition through loading states correctly', async () => {
    const mockResponse = {
      response: 'Test response',
      messages: [],
      sources: [],
      model: 'llama3',
      totalDuration: 1000000000,
      promptEvalCount: 10,
      evalCount: 20,
    }

    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    vi.mocked(chatApi.sendMessage).mockReturnValue(promise as any)

    const { result } = renderHook(() => useSendChatMessage(), { wrapper: createWrapper() })

    expect(result.current.isPending).toBe(false)

    const chatRequest = {
      projectId: 'test-project-id',
      message: 'Test question',
      history: [],
    }

    result.current.mutate(chatRequest)

    // Should be pending immediately
    await waitFor(() => expect(result.current.isPending).toBe(true))

    // Resolve the promise
    resolvePromise!(mockResponse)

    // Should complete successfully
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.isPending).toBe(false)
  })
})
