/**
 * Unit tests for useUploadFile hook
 * 
 * Tests file upload functionality including:
 * - File upload with progress tracking
 * - Success toast notifications
 * - Error handling with retry
 * - Cache invalidation
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { ReactNode } from 'react';
import { useUploadFile } from './useUploadFile';
import * as documentApi from '../services/document-api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../services/document-api');
vi.mock('sonner');

describe('useUploadFile', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test to avoid state leakage
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  const createMockFile = (name: string, size: number = 1024): File => {
    const blob = new Blob(['x'.repeat(size)], { type: 'application/pdf' });
    return new File([blob], name, { type: 'application/pdf' });
  };

  it('should initialize with progress at 0', () => {
    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createWrapper(),
    });

    expect(result.current.progress).toBe(0);
    expect(result.current.isPending).toBe(false);
  });

  it('should successfully upload a file with progress tracking', async () => {
    const mockFile = createMockFile('test.pdf');
    const projectId = '550e8400-e29b-41d4-a716-446655440000';

    vi.mocked(documentApi.documentApi.uploadFile).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createWrapper(),
    });

    // Start upload
    result.current.mutate({ file: mockFile, projectId });

    // Progress should start
    expect(result.current.isPending).toBe(true);
    expect(result.current.progress).toBe(0);

    // Simulate progress interval ticks
    await vi.advanceTimersByTimeAsync(200);
    expect(result.current.progress).toBeGreaterThan(0);
    expect(result.current.progress).toBeLessThanOrEqual(90);

    await vi.advanceTimersByTimeAsync(200);
    expect(result.current.progress).toBeGreaterThan(10);
    expect(result.current.progress).toBeLessThanOrEqual(90);

    // Wait for upload to complete
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.progress).toBe(0); // Reset after success
    expect(documentApi.documentApi.uploadFile).toHaveBeenCalledWith(mockFile, projectId);
  });

  it('should show success toast on upload completion', async () => {
    const mockFile = createMockFile('test.pdf');
    const projectId = '550e8400-e29b-41d4-a716-446655440000';

    vi.mocked(documentApi.documentApi.uploadFile).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ file: mockFile, projectId });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(toast.success).toHaveBeenCalledWith('File uploaded successfully');
  });

  it('should invalidate project documents cache on success', async () => {
    const mockFile = createMockFile('test.pdf');
    const projectId = '550e8400-e29b-41d4-a716-446655440000';

    vi.mocked(documentApi.documentApi.uploadFile).mockResolvedValue(undefined);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ file: mockFile, projectId });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['projects', projectId, 'documents'],
    });
  });

  it('should show error toast on upload failure', async () => {
    const mockFile = createMockFile('test.pdf');
    const projectId = '550e8400-e29b-41d4-a716-446655440000';
    const errorMessage = 'Network error';

    vi.mocked(documentApi.documentApi.uploadFile).mockRejectedValue(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ file: mockFile, projectId });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith(
      errorMessage,
      expect.objectContaining({
        action: expect.objectContaining({
          label: 'Retry',
          onClick: expect.any(Function),
        }),
      })
    );
  });

  it('should reset progress on error', async () => {
    const mockFile = createMockFile('test.pdf');
    const projectId = '550e8400-e29b-41d4-a716-446655440000';

    vi.mocked(documentApi.documentApi.uploadFile).mockRejectedValue(
      new Error('Upload failed')
    );

    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ file: mockFile, projectId });

    // Wait for progress to start
    await vi.advanceTimersByTimeAsync(200);
    expect(result.current.progress).toBeGreaterThan(0);

    // Wait for error
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.progress).toBe(0);
  });

  it('should handle retry from error toast', async () => {
    const mockFile = createMockFile('test.pdf');
    const projectId = '550e8400-e29b-41d4-a716-446655440000';

    vi.mocked(documentApi.documentApi.uploadFile)
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ file: mockFile, projectId });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Get retry function from toast.error call
    const toastErrorCall = vi.mocked(toast.error).mock.calls[0];
    const retryAction = (toastErrorCall[1] as any)?.action;
    expect(retryAction).toBeDefined();

    // Trigger retry
    retryAction.onClick();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(documentApi.documentApi.uploadFile).toHaveBeenCalledTimes(2);
  });

  it('should handle large files', async () => {
    const largeFile = createMockFile('large.pdf', 10 * 1024 * 1024); // 10MB
    const projectId = '550e8400-e29b-41d4-a716-446655440000';

    vi.mocked(documentApi.documentApi.uploadFile).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ file: largeFile, projectId });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(documentApi.documentApi.uploadFile).toHaveBeenCalledWith(
      largeFile,
      projectId
    );
  });

  it('should progress from 0 to 90 before completion', async () => {
    const mockFile = createMockFile('test.pdf');
    const projectId = '550e8400-e29b-41d4-a716-446655440000';

    // Mock with delay to observe progress
    vi.mocked(documentApi.documentApi.uploadFile).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(undefined), 2000))
    );

    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ file: mockFile, projectId });

    expect(result.current.progress).toBe(0);

    // Advance multiple times
    for (let i = 0; i < 9; i++) {
      await vi.advanceTimersByTimeAsync(200);
      expect(result.current.progress).toBeLessThanOrEqual(90);
    }
  });

  it('should handle error without message', async () => {
    const mockFile = createMockFile('test.pdf');
    const projectId = '550e8400-e29b-41d4-a716-446655440000';

    vi.mocked(documentApi.documentApi.uploadFile).mockRejectedValue(
      new Error()
    );

    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ file: mockFile, projectId });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith(
      'Failed to upload file',
      expect.any(Object)
    );
  });

  it('should handle multiple sequential uploads', async () => {
    const file1 = createMockFile('test1.pdf');
    const file2 = createMockFile('test2.pdf');
    const projectId = '550e8400-e29b-41d4-a716-446655440000';

    vi.mocked(documentApi.documentApi.uploadFile).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createWrapper(),
    });

    // First upload
    result.current.mutate({ file: file1, projectId });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Second upload
    result.current.mutate({ file: file2, projectId });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(documentApi.documentApi.uploadFile).toHaveBeenCalledTimes(2);
  });

  it('should provide isPending state during upload', async () => {
    const mockFile = createMockFile('test.pdf');
    const projectId = '550e8400-e29b-41d4-a716-446655440000';

    vi.mocked(documentApi.documentApi.uploadFile).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(undefined), 1000))
    );

    const { result } = renderHook(() => useUploadFile(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);

    result.current.mutate({ file: mockFile, projectId });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
  });
});
