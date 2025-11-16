/**
 * React Query hook for tracking document processing progress.
 *
 * Polls the backend every 2 seconds to track asynchronous document processing status.
 */

import { useQuery } from '@tanstack/react-query'
import { documentApi } from '../services/document-api'
import { queryKeys } from '@/lib/query-keys'

/**
 * Query hook for fetching document processing progress with automatic polling.
 *
 * Polls every 2 seconds when enabled to track the progress of document
 * processing operations like chunking and embedding. Automatically stops
 * polling when tab is not visible.
 *
 * @param id - The document UUID to track
 * @param enabled - Whether to enable polling (default: false)
 * @returns Query result with progress data and loading/error states
 *
 * @example
 * ```tsx
 * const { data: progress } = useDocumentProgress(
 *   documentId,
 *   status === 'processing'
 * );
 *
 * return (
 *   <ProgressBar
 *     value={progress?.percentage || 0}
 *     label={progress?.status}
 *   />
 * );
 * ```
 */
export function useDocumentProgress(id: string, enabled: boolean = false) {
  return useQuery({
    queryKey: queryKeys.documents.progress(id),
    queryFn: () => documentApi.getProgress(id),
    enabled: enabled && !!id,
    refetchInterval: 2000, // Poll every 2 seconds
    refetchIntervalInBackground: false,
  })
}
