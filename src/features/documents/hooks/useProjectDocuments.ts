/**
 * React Query hook for fetching all documents in a project.
 *
 * Provides cached access to project's document list with automatic refetching.
 */

import { useQuery } from '@tanstack/react-query'
import { projectDocumentApi } from '../services/project-api'
import { queryKeys } from '@/lib/query-keys'

/**
 * Query hook for fetching all documents belonging to a project.
 *
 * Automatically caches document list with 2-minute stale time.
 * Only executes when projectId is provided.
 *
 * @param projectId - The project UUID to fetch documents for
 * @returns Query result with documents array and loading/error states
 *
 * @example
 * ```tsx
 * const { data: documents, isLoading } = useProjectDocuments(projectId);
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     <h2>{documents.length} Documents</h2>
 *     <DocumentList documents={documents} />
 *   </div>
 * );
 * ```
 */
export function useProjectDocuments(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.documents(projectId),
    queryFn: () => projectDocumentApi.getDocuments(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
