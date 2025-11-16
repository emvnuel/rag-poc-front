/**
 * Tests for useDocumentProgress hook.
 *
 * Covers document progress tracking with polling functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDocumentProgress } from './useDocumentProgress'
import { documentApi } from '../services/document-api'
import type { DocumentProgress } from '@/types/document'

// Mock dependencies
vi.mock('../services/document-api', () => ({
  documentApi: {
    getProgress: vi.fn(),
  },
}))

describe('useDocumentProgress', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  const mockProgress = (percentage: number): DocumentProgress => ({
    progressPercentage: percentage,
  })

  describe('basic functionality', () => {
    it('should not fetch when disabled', async () => {
      const { result } = renderHook(
        () => useDocumentProgress('doc-123', false),
        { wrapper }
      )

      expect(documentApi.getProgress).not.toHaveBeenCalled()
      expect(result.current.data).toBeUndefined()
      expect(result.current.isFetching).toBe(false)
    })

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(
        () => useDocumentProgress('', true),
        { wrapper }
      )

      expect(documentApi.getProgress).not.toHaveBeenCalled()
      expect(result.current.data).toBeUndefined()
    })

    it('should fetch progress when enabled', async () => {
      const progress = mockProgress(50)
      vi.mocked(documentApi.getProgress).mockResolvedValue(progress)

      const { result } = renderHook(
        () => useDocumentProgress('doc-456', true),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(documentApi.getProgress).toHaveBeenCalledWith('doc-456')
      expect(result.current.data).toEqual(progress)
    })

    it('should return loading state while fetching', async () => {
      vi.mocked(documentApi.getProgress).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockProgress(30)), 100))
      )

      const { result } = renderHook(
        () => useDocumentProgress('doc-loading', true),
        { wrapper }
      )

      expect(result.current.isLoading || result.current.isFetching).toBe(true)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })

    it('should handle empty document id with enabled=true', async () => {
      const { result } = renderHook(
        () => useDocumentProgress('', true),
        { wrapper }
      )

      expect(result.current.data).toBeUndefined()
      expect(documentApi.getProgress).not.toHaveBeenCalled()
    })
  })

  describe('enabled/disabled toggle', () => {
    it('should fetch when toggled from disabled to enabled', async () => {
      const progress = mockProgress(40)
      vi.mocked(documentApi.getProgress).mockResolvedValue(progress)

      const { result, rerender } = renderHook(
        ({ enabled }) => useDocumentProgress('doc-toggle', enabled),
        { wrapper, initialProps: { enabled: false } }
      )

      // Initially disabled - no fetch
      expect(documentApi.getProgress).not.toHaveBeenCalled()

      // Enable fetching
      rerender({ enabled: true })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(documentApi.getProgress).toHaveBeenCalledWith('doc-toggle')
      expect(result.current.data).toEqual(progress)
    })

    it('should not refetch when toggled from enabled to disabled', async () => {
      const progress = mockProgress(60)
      vi.mocked(documentApi.getProgress).mockResolvedValue(progress)

      const { rerender } = renderHook(
        ({ enabled }) => useDocumentProgress('doc-stop', enabled),
        { wrapper, initialProps: { enabled: true } }
      )

      await waitFor(() => {
        expect(documentApi.getProgress).toHaveBeenCalledTimes(1)
      })

      // Disable fetching
      rerender({ enabled: false })

      // Should not fetch again
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(documentApi.getProgress).toHaveBeenCalledTimes(1)
    })
  })

  describe('progress data', () => {
    it('should return progress percentage', async () => {
      const progress = mockProgress(75)
      vi.mocked(documentApi.getProgress).mockResolvedValue(progress)

      const { result } = renderHook(
        () => useDocumentProgress('doc-percent', true),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.data?.progressPercentage).toBe(75)
      })
    })

    it('should handle 0% progress', async () => {
      const progress = mockProgress(0)
      vi.mocked(documentApi.getProgress).mockResolvedValue(progress)

      const { result } = renderHook(
        () => useDocumentProgress('doc-zero', true),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.data?.progressPercentage).toBe(0)
      })
    })

    it('should handle 100% progress', async () => {
      const progress = mockProgress(100)
      vi.mocked(documentApi.getProgress).mockResolvedValue(progress)

      const { result } = renderHook(
        () => useDocumentProgress('doc-complete', true),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.data?.progressPercentage).toBe(100)
      })
    })
  })

  describe('error handling', () => {
    it('should handle fetch errors', async () => {
      const error = new Error('Failed to fetch progress')
      vi.mocked(documentApi.getProgress).mockRejectedValue(error)

      const { result } = renderHook(
        () => useDocumentProgress('doc-error', true),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('should handle network errors', async () => {
      const error = new Error('Network error')
      vi.mocked(documentApi.getProgress).mockRejectedValue(error)

      const { result } = renderHook(
        () => useDocumentProgress('doc-network', true),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error?.message).toBe('Network error')
    })

    it('should not throw when API returns unexpected format', async () => {
      vi.mocked(documentApi.getProgress).mockResolvedValue({} as DocumentProgress)

      const { result } = renderHook(
        () => useDocumentProgress('doc-invalid', true),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual({})
    })
  })

  describe('document id changes', () => {
    it('should refetch when document id changes', async () => {
      const progress1 = mockProgress(40)
      const progress2 = mockProgress(60)

      vi.mocked(documentApi.getProgress)
        .mockResolvedValueOnce(progress1)
        .mockResolvedValueOnce(progress2)

      const { result, rerender } = renderHook(
        ({ id }) => useDocumentProgress(id, true),
        { wrapper, initialProps: { id: 'doc-1' } }
      )

      await waitFor(() => {
        expect(result.current.data).toEqual(progress1)
      })

      expect(documentApi.getProgress).toHaveBeenCalledWith('doc-1')

      // Change document ID
      rerender({ id: 'doc-2' })

      await waitFor(() => {
        expect(documentApi.getProgress).toHaveBeenCalledWith('doc-2')
      })

      await waitFor(() => {
        expect(result.current.data).toEqual(progress2)
      })

      expect(documentApi.getProgress).toHaveBeenCalledTimes(2)
    })

    it('should use correct query key for different document ids', async () => {
      const progress = mockProgress(50)
      vi.mocked(documentApi.getProgress).mockResolvedValue(progress)

      const { result: result1 } = renderHook(
        () => useDocumentProgress('doc-a', true),
        { wrapper }
      )

      const { result: result2 } = renderHook(
        () => useDocumentProgress('doc-b', true),
        { wrapper }
      )

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true)
        expect(result2.current.isSuccess).toBe(true)
      })

      expect(documentApi.getProgress).toHaveBeenCalledWith('doc-a')
      expect(documentApi.getProgress).toHaveBeenCalledWith('doc-b')
      expect(documentApi.getProgress).toHaveBeenCalledTimes(2)
    })
  })

  describe('query configuration', () => {
    it('should be enabled only when both id exists and enabled is true', () => {
      const { result: result1 } = renderHook(
        () => useDocumentProgress('doc-123', true),
        { wrapper }
      )

      const { result: result2 } = renderHook(
        () => useDocumentProgress('', true),
        { wrapper }
      )

      const { result: result3 } = renderHook(
        () => useDocumentProgress('doc-456', false),
        { wrapper }
      )

      // Only result1 should fetch
      expect(result1.current.isFetching || result1.current.isLoading).toBe(true)
      expect(result2.current.isFetching).toBe(false)
      expect(result3.current.isFetching).toBe(false)
    })

    it('should handle undefined enabled parameter (defaults to false)', () => {
      const { result } = renderHook(
        () => useDocumentProgress('doc-default'),
        { wrapper }
      )

      expect(documentApi.getProgress).not.toHaveBeenCalled()
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('concurrent requests', () => {
    it('should handle multiple concurrent progress requests', async () => {
      const progress1 = mockProgress(25)
      const progress2 = mockProgress(75)

      vi.mocked(documentApi.getProgress).mockImplementation(async (id) => {
        return id === 'doc-1' ? progress1 : progress2
      })

      const { result: result1 } = renderHook(
        () => useDocumentProgress('doc-1', true),
        { wrapper }
      )

      const { result: result2 } = renderHook(
        () => useDocumentProgress('doc-2', true),
        { wrapper }
      )

      await waitFor(() => {
        expect(result1.current.isSuccess).toBe(true)
        expect(result2.current.isSuccess).toBe(true)
      })

      expect(result1.current.data).toEqual(progress1)
      expect(result2.current.data).toEqual(progress2)
    })
  })
})
