/**
 * React Query hook for semantic document search with debouncing.
 *
 * Provides search-as-you-type functionality for direct document search.
 */

import { useQuery } from '@tanstack/react-query';
import type { SearchRequest, SearchResponse } from '@/services/api/generated/types.gen';
import { search } from '../services/search-api';
import { queryKeys } from '@/lib/query-keys';

/**
 * Query hook for searching documents with debouncing.
 *
 * Automatically debounces search queries to prevent excessive API calls.
 * Only executes search when query is non-empty.
 *
 * @param params - Search parameters (query and projectId)
 * @param options - Optional query options including enabled flag
 * @returns Query result with search results and loading/error states
 *
 * @example
 * ```tsx
 * const { data: results, isLoading } = useDocumentSearch(
 *   { query: searchTerm, projectId: '123' },
 *   { enabled: searchTerm.length > 2 }
 * );
 * ```
 */
export const useDocumentSearch = (
  params: SearchRequest,
  options?: { enabled?: boolean }
) => {
  return useQuery<SearchResponse, Error>({
    queryKey: queryKeys.search.results(params.projectId, params.query),
    queryFn: () => search(params),
    enabled: options?.enabled !== false && params.query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};
