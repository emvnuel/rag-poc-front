/**
 * Project API service for project-related document operations.
 *
 * Provides access to documents associated with specific projects.
 */

import { httpClient } from '@/services/http/client'
import type { Document } from '@/types/document'

/**
 * Project document API service for fetching documents within a project.
 */
export const projectDocumentApi = {
  /**
   * Fetches all documents belonging to a specific project.
   *
   * @param projectId - The UUID of the project
   * @returns Promise resolving to array of documents in the project
   * @throws Error if the API request fails
   *
   * @example
   * ```ts
   * const documents = await projectDocumentApi.getDocuments('123e4567-e89b-12d3-a456-426614174000');
   * console.log(`Found ${documents.length} documents`);
   * ```
   */
  getDocuments: async (projectId: string): Promise<Document[]> => {
    const response = await httpClient.get<Document[]>(`/projects/${projectId}/documents`)
    return response.data
  },
}
