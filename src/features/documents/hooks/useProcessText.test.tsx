/**
 * Tests for useProcessText hook.
 *
 * Covers text processing mutation with cache invalidation and error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProcessText } from './useProcessText'
import { documentApi } from '../services/document-api'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('../services/document-api', () => ({
  documentApi: {
    processText: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useProcessText', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('successful processing', () => {
    it('should process text successfully', async () => {
      vi.mocked(documentApi.processText).mockResolvedValue()

      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate({ text: 'Sample text', projectId: 'project-123' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(documentApi.processText).toHaveBeenCalledWith('Sample text', 'project-123')
      expect(documentApi.processText).toHaveBeenCalledTimes(1)
    })

    it('should show success toast on successful processing', async () => {
      vi.mocked(documentApi.processText).mockResolvedValue()

      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate({ text: 'Test content', projectId: 'project-456' })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Text processed successfully')
      })
    })

    it('should invalidate project documents cache after processing', async () => {
      vi.mocked(documentApi.processText).mockResolvedValue()

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate({ text: 'Document text', projectId: 'project-789' })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['projects', 'project-789', 'documents'],
        })
      })
    })

    it('should handle long text content', async () => {
      vi.mocked(documentApi.processText).mockResolvedValue()

      const longText = 'A'.repeat(10000)
      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate({ text: longText, projectId: 'project-long' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(documentApi.processText).toHaveBeenCalledWith(longText, 'project-long')
    })

    it('should call onSuccess callback when provided', async () => {
      vi.mocked(documentApi.processText).mockResolvedValue()

      const onSuccess = vi.fn()
      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate(
        { text: 'Callback test', projectId: 'project-callback' },
        { onSuccess }
      )

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })
  })

  describe('loading state', () => {
    it('should set isPending to true during processing', async () => {
      vi.mocked(documentApi.processText).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate({ text: 'Loading test', projectId: 'project-loading' })

      await waitFor(() => {
        expect(result.current.isPending).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.isPending).toBe(false)
      })
    })

    it('should not be pending initially', () => {
      const { result } = renderHook(() => useProcessText(), { wrapper })

      expect(result.current.isPending).toBe(false)
      expect(result.current.isIdle).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle processing errors', async () => {
      const error = new Error('Processing failed')
      vi.mocked(documentApi.processText).mockRejectedValue(error)

      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate({ text: 'Error test', projectId: 'project-error' })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('should show error toast with message', async () => {
      const error = new Error('Text validation failed')
      vi.mocked(documentApi.processText).mockRejectedValue(error)

      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate({ text: 'Invalid', projectId: 'project-invalid' })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Text validation failed',
          expect.objectContaining({
            action: expect.objectContaining({
              label: 'Retry',
            }),
          })
        )
      })
    })

    it('should show default error message when error has no message', async () => {
      const error = new Error()
      vi.mocked(documentApi.processText).mockRejectedValue(error)

      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate({ text: 'No message', projectId: 'project-no-msg' })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to process text',
          expect.any(Object)
        )
      })
    })

    it('should provide retry action in error toast', async () => {
      const error = new Error('Temporary error')
      vi.mocked(documentApi.processText).mockRejectedValue(error)

      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate({ text: 'Retry test', projectId: 'project-retry' })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      const errorCall = vi.mocked(toast.error).mock.calls[0]
      expect(errorCall[1]).toHaveProperty('action')
      expect(errorCall[1]?.action).toHaveProperty('label', 'Retry')
      expect(errorCall[1]?.action).toHaveProperty('onClick')
    })

    it('should call onError callback when provided', async () => {
      const error = new Error('Test error')
      vi.mocked(documentApi.processText).mockRejectedValue(error)

      const onError = vi.fn()
      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate(
        { text: 'Error callback', projectId: 'project-error-cb' },
        { onError }
      )

      await waitFor(() => {
        expect(onError).toHaveBeenCalled()
      })

      expect(onError.mock.calls[0][0]).toEqual(error)
    })
  })

  describe('retry functionality', () => {
    it('should allow manual retry after error', async () => {
      const error = new Error('Temporary error')
      vi.mocked(documentApi.processText)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce()

      const { result } = renderHook(() => useProcessText(), { wrapper })

      // First attempt fails
      result.current.mutate({ text: 'Retry', projectId: 'project-retry' })
      await waitFor(() => expect(result.current.isError).toBe(true))

      // Second attempt succeeds
      result.current.mutate({ text: 'Retry', projectId: 'project-retry' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(documentApi.processText).toHaveBeenCalledTimes(2)
    })

    it('should trigger retry from error toast action', async () => {
      const error = new Error('Retriable error')
      vi.mocked(documentApi.processText).mockRejectedValue(error)

      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate({ text: 'Toast retry', projectId: 'project-toast' })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      // Extract and trigger retry callback
      const errorCall = vi.mocked(toast.error).mock.calls[0]
      const toastOptions = errorCall[1] as { action?: { label: string; onClick: () => void } }
      const retryCallback = toastOptions?.action?.onClick

      expect(retryCallback).toBeDefined()

      vi.mocked(documentApi.processText).mockResolvedValueOnce()
      retryCallback?.()

      await waitFor(() => {
        expect(documentApi.processText).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('multiple projects', () => {
    it('should process text for different projects independently', async () => {
      vi.mocked(documentApi.processText).mockResolvedValue()

      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate({ text: 'Text 1', projectId: 'project-1' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      result.current.mutate({ text: 'Text 2', projectId: 'project-2' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(documentApi.processText).toHaveBeenCalledTimes(2)
      expect(documentApi.processText).toHaveBeenNthCalledWith(1, 'Text 1', 'project-1')
      expect(documentApi.processText).toHaveBeenNthCalledWith(2, 'Text 2', 'project-2')
    })

    it('should invalidate correct project cache', async () => {
      vi.mocked(documentApi.processText).mockResolvedValue()

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate({ text: 'Text', projectId: 'project-specific' })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['projects', 'project-specific', 'documents'],
        })
      })
    })
  })

  describe('mutation reset', () => {
    it('should reset mutation state', async () => {
      vi.mocked(documentApi.processText).mockResolvedValue()

      const { result } = renderHook(() => useProcessText(), { wrapper })

      result.current.mutate({ text: 'Reset test', projectId: 'project-reset' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      result.current.reset()

      await waitFor(() => {
        expect(result.current.isIdle).toBe(true)
      })

      expect(result.current.isSuccess).toBe(false)
      expect(result.current.data).toBeUndefined()
    })
  })
})
