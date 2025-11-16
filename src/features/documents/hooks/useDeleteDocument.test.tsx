/**
 * Tests for useDeleteDocument hook.
 *
 * Covers document deletion mutation with cache invalidation and error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDeleteDocument } from './useDeleteDocument'
import { documentApi } from '../services/document-api'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('../services/document-api', () => ({
  documentApi: {
    delete: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useDeleteDocument', () => {
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

  describe('successful deletion', () => {
    it('should delete document successfully', async () => {
      vi.mocked(documentApi.delete).mockResolvedValue()

      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-123')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(documentApi.delete).toHaveBeenCalledWith('doc-123')
      expect(documentApi.delete).toHaveBeenCalledTimes(1)
    })

    it('should show success toast on successful deletion', async () => {
      vi.mocked(documentApi.delete).mockResolvedValue()

      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-456')

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Document deleted successfully')
      })
    })

    it('should invalidate project queries after deletion', async () => {
      vi.mocked(documentApi.delete).mockResolvedValue()

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-789')

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['projects'],
        })
      })
    })

    it('should handle multiple sequential deletions', async () => {
      vi.mocked(documentApi.delete).mockResolvedValue()

      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-1')
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      result.current.mutate('doc-2')
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(documentApi.delete).toHaveBeenCalledTimes(2)
      expect(documentApi.delete).toHaveBeenNthCalledWith(1, 'doc-1')
      expect(documentApi.delete).toHaveBeenNthCalledWith(2, 'doc-2')
    })

    it('should call onSuccess callback when provided', async () => {
      vi.mocked(documentApi.delete).mockResolvedValue()

      const onSuccess = vi.fn()
      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-callback', { onSuccess })

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })
  })

  describe('loading state', () => {
    it('should set isPending to true during deletion', async () => {
      vi.mocked(documentApi.delete).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-loading')

      // Need to wait for the mutation to start
      await waitFor(() => {
        expect(result.current.isPending).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.isPending).toBe(false)
      })
    })

    it('should not be pending initially', () => {
      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      expect(result.current.isPending).toBe(false)
      expect(result.current.isIdle).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle deletion errors', async () => {
      const error = new Error('Network error')
      vi.mocked(documentApi.delete).mockRejectedValue(error)

      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-error')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('should show error toast with message', async () => {
      const error = new Error('Document not found')
      vi.mocked(documentApi.delete).mockRejectedValue(error)

      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-not-found')

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Document not found',
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
      vi.mocked(documentApi.delete).mockRejectedValue(error)

      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-no-msg')

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to delete document',
          expect.any(Object)
        )
      })
    })

    it('should provide retry action in error toast', async () => {
      const error = new Error('Server error')
      vi.mocked(documentApi.delete).mockRejectedValue(error)

      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-retry')

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
      vi.mocked(documentApi.delete).mockRejectedValue(error)

      const onError = vi.fn()
      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-error-callback', { onError })

      await waitFor(() => {
        expect(onError).toHaveBeenCalled()
      })

      expect(onError.mock.calls[0][0]).toEqual(error)
      expect(onError.mock.calls[0][1]).toBe('doc-error-callback')
    })

    it('should handle non-Error thrown values', async () => {
      vi.mocked(documentApi.delete).mockRejectedValue('String error')

      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-string-error')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to delete document',
        expect.any(Object)
      )
    })
  })

  describe('retry functionality', () => {
    it('should allow manual retry after error', async () => {
      const error = new Error('Temporary error')
      vi.mocked(documentApi.delete)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce()

      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      // First attempt fails
      result.current.mutate('doc-retry-manual')
      await waitFor(() => expect(result.current.isError).toBe(true))

      // Second attempt succeeds
      result.current.mutate('doc-retry-manual')
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(documentApi.delete).toHaveBeenCalledTimes(2)
    })

    it('should trigger retry from error toast action', async () => {
      const error = new Error('Retriable error')
      vi.mocked(documentApi.delete).mockRejectedValue(error)

      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-retry-toast')

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      // Extract retry callback from toast
      const errorCall = vi.mocked(toast.error).mock.calls[0]
      const toastOptions = errorCall[1] as { action?: { label: string; onClick: () => void } }
      const retryCallback = toastOptions?.action?.onClick

      expect(retryCallback).toBeDefined()

      // Trigger retry
      vi.mocked(documentApi.delete).mockResolvedValueOnce()
      retryCallback?.()

      await waitFor(() => {
        expect(documentApi.delete).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('mutation reset', () => {
    it('should reset mutation state', async () => {
      vi.mocked(documentApi.delete).mockResolvedValue()

      const { result } = renderHook(() => useDeleteDocument(), { wrapper })

      result.current.mutate('doc-reset')
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
