/**
 * React Query hook for fetching a single document.
 *
 * Provides cached access to document metadata and details.
 */

import { useQuery } from '@tanstack/react-query'
import { documentApi } from '../services/document-api'
import { queryKeys } from '@/lib/query-keys'

/**
 * Query hook for fetching a single document by ID.
 *
 * Automatically caches document data and only executes when ID is provided.
 *
 * @param id - The document UUID to fetch
 * @returns Query result with document data and loading/error states
 *
 * @example
 * ```tsx
 * const { data: document, isLoading, error } = useDocument(documentId);
 *
 * if (isLoading) return <Skeleton />;
 * if (error) return <ErrorMessage />;
 *
 * return (
 *   <div>
 *     <h1>{document.name}</h1>
 *     <p>Status: {document.status}</p>
 *   </div>
 * );
 * ```
 */
export function useDocument(id: string) {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => documentApi.getById(id),
    enabled: !!id,
  })
}
