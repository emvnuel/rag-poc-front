/**
 * Tests for useProcessWebsite hook.
 *
 * Covers website processing mutation with cache invalidation and error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProcessWebsite } from './useProcessWebsite'
import { documentApi } from '../services/document-api'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('../services/document-api', () => ({
  documentApi: {
    processWebsite: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useProcessWebsite', () => {
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
    it('should process website successfully', async () => {
      vi.mocked(documentApi.processWebsite).mockResolvedValue()

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'https://example.com', projectId: 'project-123' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(documentApi.processWebsite).toHaveBeenCalledWith('https://example.com', 'project-123')
      expect(documentApi.processWebsite).toHaveBeenCalledTimes(1)
    })

    it('should show success toast on successful processing', async () => {
      vi.mocked(documentApi.processWebsite).mockResolvedValue()

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'https://docs.example.com', projectId: 'project-456' })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Website processed successfully')
      })
    })

    it('should invalidate project documents cache after processing', async () => {
      vi.mocked(documentApi.processWebsite).mockResolvedValue()

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'https://blog.example.com', projectId: 'project-789' })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['projects', 'project-789', 'documents'],
        })
      })
    })

    it('should handle URLs with query parameters', async () => {
      vi.mocked(documentApi.processWebsite).mockResolvedValue()

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      const url = 'https://example.com/docs?section=api&version=2'
      result.current.mutate({ url, projectId: 'project-query' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(documentApi.processWebsite).toHaveBeenCalledWith(url, 'project-query')
    })

    it('should handle URLs with fragments', async () => {
      vi.mocked(documentApi.processWebsite).mockResolvedValue()

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      const url = 'https://example.com/page#section-1'
      result.current.mutate({ url, projectId: 'project-fragment' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(documentApi.processWebsite).toHaveBeenCalledWith(url, 'project-fragment')
    })

    it('should call onSuccess callback when provided', async () => {
      vi.mocked(documentApi.processWebsite).mockResolvedValue()

      const onSuccess = vi.fn()
      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate(
        { url: 'https://callback.test', projectId: 'project-callback' },
        { onSuccess }
      )

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })
  })

  describe('loading state', () => {
    it('should set isPending to true during processing', async () => {
      vi.mocked(documentApi.processWebsite).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'https://loading.test', projectId: 'project-loading' })

      await waitFor(() => {
        expect(result.current.isPending).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.isPending).toBe(false)
      })
    })

    it('should not be pending initially', () => {
      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      expect(result.current.isPending).toBe(false)
      expect(result.current.isIdle).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle processing errors', async () => {
      const error = new Error('Failed to scrape website')
      vi.mocked(documentApi.processWebsite).mockRejectedValue(error)

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'https://error.test', projectId: 'project-error' })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('should show error toast with message', async () => {
      const error = new Error('Website not accessible')
      vi.mocked(documentApi.processWebsite).mockRejectedValue(error)

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'https://invalid.test', projectId: 'project-invalid' })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Website not accessible',
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
      vi.mocked(documentApi.processWebsite).mockRejectedValue(error)

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'https://nomsg.test', projectId: 'project-no-msg' })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to process website',
          expect.any(Object)
        )
      })
    })

    it('should provide retry action in error toast', async () => {
      const error = new Error('Temporary scraping error')
      vi.mocked(documentApi.processWebsite).mockRejectedValue(error)

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'https://retry.test', projectId: 'project-retry' })

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
      vi.mocked(documentApi.processWebsite).mockRejectedValue(error)

      const onError = vi.fn()
      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate(
        { url: 'https://error-cb.test', projectId: 'project-error-cb' },
        { onError }
      )

      await waitFor(() => {
        expect(onError).toHaveBeenCalled()
      })

      expect(onError.mock.calls[0][0]).toEqual(error)
    })

    it('should handle invalid URL error', async () => {
      const error = new Error('Invalid URL format')
      vi.mocked(documentApi.processWebsite).mockRejectedValue(error)

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'not-a-url', projectId: 'project-invalid-url' })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error?.message).toBe('Invalid URL format')
    })
  })

  describe('retry functionality', () => {
    it('should allow manual retry after error', async () => {
      const error = new Error('Temporary error')
      vi.mocked(documentApi.processWebsite)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce()

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      // First attempt fails
      result.current.mutate({ url: 'https://retry.test', projectId: 'project-retry' })
      await waitFor(() => expect(result.current.isError).toBe(true))

      // Second attempt succeeds
      result.current.mutate({ url: 'https://retry.test', projectId: 'project-retry' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(documentApi.processWebsite).toHaveBeenCalledTimes(2)
    })

    it('should trigger retry from error toast action', async () => {
      const error = new Error('Retriable error')
      vi.mocked(documentApi.processWebsite).mockRejectedValue(error)

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'https://toast.test', projectId: 'project-toast' })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      // Extract and trigger retry callback
      const errorCall = vi.mocked(toast.error).mock.calls[0]
      const toastOptions = errorCall[1] as { action?: { label: string; onClick: () => void } }
      const retryCallback = toastOptions?.action?.onClick

      expect(retryCallback).toBeDefined()

      vi.mocked(documentApi.processWebsite).mockResolvedValueOnce()
      retryCallback?.()

      await waitFor(() => {
        expect(documentApi.processWebsite).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('multiple projects', () => {
    it('should process websites for different projects independently', async () => {
      vi.mocked(documentApi.processWebsite).mockResolvedValue()

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'https://site1.com', projectId: 'project-1' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      result.current.mutate({ url: 'https://site2.com', projectId: 'project-2' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(documentApi.processWebsite).toHaveBeenCalledTimes(2)
      expect(documentApi.processWebsite).toHaveBeenNthCalledWith(1, 'https://site1.com', 'project-1')
      expect(documentApi.processWebsite).toHaveBeenNthCalledWith(2, 'https://site2.com', 'project-2')
    })

    it('should invalidate correct project cache', async () => {
      vi.mocked(documentApi.processWebsite).mockResolvedValue()

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'https://specific.com', projectId: 'project-specific' })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['projects', 'project-specific', 'documents'],
        })
      })
    })
  })

  describe('mutation reset', () => {
    it('should reset mutation state', async () => {
      vi.mocked(documentApi.processWebsite).mockResolvedValue()

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'https://reset.test', projectId: 'project-reset' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      result.current.reset()

      await waitFor(() => {
        expect(result.current.isIdle).toBe(true)
      })

      expect(result.current.isSuccess).toBe(false)
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('different URL protocols', () => {
    it('should handle http URLs', async () => {
      vi.mocked(documentApi.processWebsite).mockResolvedValue()

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'http://example.com', projectId: 'project-http' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(documentApi.processWebsite).toHaveBeenCalledWith('http://example.com', 'project-http')
    })

    it('should handle https URLs', async () => {
      vi.mocked(documentApi.processWebsite).mockResolvedValue()

      const { result } = renderHook(() => useProcessWebsite(), { wrapper })

      result.current.mutate({ url: 'https://secure.example.com', projectId: 'project-https' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(documentApi.processWebsite).toHaveBeenCalledWith('https://secure.example.com', 'project-https')
    })
  })
})
