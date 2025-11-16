/**
 * Document search API service for direct semantic search without chat context.
 *
 * Provides direct access to document search functionality for advanced use cases.
 */

import type { SearchRequest, SearchResponse } from '@/services/api/generated/types.gen';
import { httpClient } from '@/services/http/client';

/**
 * Performs semantic search across documents in a project.
 *
 * @param data - Search request containing query text and project ID
 * @returns Promise resolving to search results with document chunks and similarity scores
 * @throws Error if the API request fails
 */
export const search = async (data: SearchRequest): Promise<SearchResponse> => {
  const response = await httpClient.post<SearchResponse>('/documents/search', data);
  return response.data;
};
