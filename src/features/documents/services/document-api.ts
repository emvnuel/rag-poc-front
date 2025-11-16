/**
 * Document API service for document operations.
 *
 * Handles all document-related API operations including uploading files,
 * processing text and websites, and managing document lifecycle.
 */

import { httpClient } from '@/services/http/client'
import type { Document, DocumentProgress } from '@/types/document'

/**
 * Document API service for CRUD operations and document processing.
 */
export const documentApi = {
  /**
   * Uploads a file document to a project for processing.
   *
   * Supports PDF, DOCX, TXT, and MD files up to 25MB.
   * The file will be processed asynchronously in the background.
   *
   * @param file - The file to upload
   * @param projectId - The UUID of the project to add the document to
   * @returns Promise resolving when upload completes
   * @throws Error if the upload fails or file validation fails
   *
   * @example
   * ```ts
   * const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
   * await documentApi.uploadFile(file, 'project-uuid');
   * ```
   */
  uploadFile: async (file: File, projectId: string): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)
    
    await httpClient.post('/documents/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Processes raw text as a document in a project.
   *
   * The text will be chunked and embedded for semantic search.
   *
   * @param text - The text content to process
   * @param projectId - The UUID of the project to add the document to
   * @returns Promise resolving when processing completes
   * @throws Error if the request fails
   *
   * @example
   * ```ts
   * await documentApi.processText('This is important information...', 'project-uuid');
   * ```
   */
  processText: async (text: string, projectId: string): Promise<void> => {
    await httpClient.post('/documents/texts', { text, projectId })
  },

  /**
   * Processes a website URL as a document in a project.
   *
   * The website content will be scraped, chunked, and embedded for semantic search.
   *
   * @param url - The website URL to process
   * @param projectId - The UUID of the project to add the document to
   * @returns Promise resolving when processing starts
   * @throws Error if the URL is invalid or request fails
   *
   * @example
   * ```ts
   * await documentApi.processWebsite('https://example.com/docs', 'project-uuid');
   * ```
   */
  processWebsite: async (url: string, projectId: string): Promise<void> => {
    await httpClient.post('/documents/websites', { url, projectId })
  },

  /**
   * Fetches a single document by ID.
   *
   * @param id - The document UUID
   * @returns Promise resolving to document metadata
   * @throws Error if the document is not found or request fails
   *
   * @example
   * ```ts
   * const doc = await documentApi.getById('doc-uuid');
   * console.log(doc.name, doc.status);
   * ```
   */
  getById: async (id: string): Promise<Document> => {
    const response = await httpClient.get<Document>(`/documents/${id}`)
    return response.data
  },

  /**
   * Fetches the full content of a document.
   *
   * @param id - The document UUID
   * @returns Promise resolving to document content as string
   * @throws Error if the document is not found or request fails
   *
   * @example
   * ```ts
   * const content = await documentApi.getContent('doc-uuid');
   * console.log(content);
   * ```
   */
  getContent: async (id: string): Promise<string> => {
    const response = await httpClient.get<string>(`/documents/${id}/content`)
    return response.data
  },

  /**
   * Fetches the processing progress for a document.
   *
   * Useful for tracking asynchronous processing status.
   *
   * @param id - The document UUID
   * @returns Promise resolving to progress information
   * @throws Error if the document is not found or request fails
   *
   * @example
   * ```ts
   * const progress = await documentApi.getProgress('doc-uuid');
   * console.log(`${progress.percentage}% complete`);
   * ```
   */
  getProgress: async (id: string): Promise<DocumentProgress> => {
    const response = await httpClient.get<DocumentProgress>(`/documents/${id}/progress`)
    return response.data
  },

  /**
   * Deletes a document permanently.
   *
   * @param id - The document UUID to delete
   * @returns Promise resolving when deletion completes
   * @throws Error if the document is not found or request fails
   *
   * @example
   * ```ts
   * await documentApi.delete('doc-uuid');
   * ```
   */
  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/documents/${id}`)
  },
}
