/**
 * Unit tests for project-document-api service.
 *
 * Tests fetching documents for specific projects.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectDocumentApi } from './project-api';
import { httpClient } from '@/services/http/client';
import type { Document } from '@/types/document';

// Mock the httpClient
vi.mock('@/services/http/client', () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

describe('project-document-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDocuments', () => {
    it('should fetch all documents for a project', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDocuments: Document[] = [
        {
          id: 'doc-1',
          fileName: 'document1.pdf',
          type: 'FILE',
          status: 'PROCESSED',
          metadata: '{}',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'doc-2',
          fileName: 'document2.txt',
          type: 'TEXT',
          status: 'PROCESSED',
          metadata: '{}',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ];

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockDocuments });

      const result = await projectDocumentApi.getDocuments(projectId);

      expect(httpClient.get).toHaveBeenCalledWith(`/projects/${projectId}/documents`);
      expect(result).toEqual(mockDocuments);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when project has no documents', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: [] });

      const result = await projectDocumentApi.getDocuments(projectId);

      expect(result).toEqual([]);
    });

    it('should fetch documents with different types', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDocuments: Document[] = [
        {
          id: 'doc-1',
          fileName: 'file.pdf',
          type: 'FILE',
          status: 'PROCESSED',
          metadata: '{}',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'doc-2',
          fileName: 'text-doc',
          type: 'TEXT',
          status: 'PROCESSED',
          metadata: '{}',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        {
          id: 'doc-3',
          fileName: 'website-content',
          type: 'WEBSITE',
          status: 'PROCESSED',
          metadata: '{"url": "https://example.com"}',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        },
      ];

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockDocuments });

      const result = await projectDocumentApi.getDocuments(projectId);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('FILE');
      expect(result[1].type).toBe('TEXT');
      expect(result[2].type).toBe('WEBSITE');
    });

    it('should fetch documents with different statuses', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDocuments: Document[] = [
        {
          id: 'doc-1',
          fileName: 'processed.pdf',
          type: 'FILE',
          status: 'PROCESSED',
          metadata: '{}',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'doc-2',
          fileName: 'processing.pdf',
          type: 'FILE',
          status: 'PROCESSING',
          metadata: '{}',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        {
          id: 'doc-3',
          fileName: 'not-processed.pdf',
          type: 'FILE',
          status: 'NOT_PROCESSED',
          metadata: '{}',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        },
      ];

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockDocuments });

      const result = await projectDocumentApi.getDocuments(projectId);

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe('PROCESSED');
      expect(result[1].status).toBe('PROCESSING');
      expect(result[2].status).toBe('NOT_PROCESSED');
    });

    it('should throw error when project not found (404)', async () => {
      const projectId = 'non-existent-project';

      const apiError = {
        status: 404,
        message: 'Project not found',
      };

      vi.mocked(httpClient.get).mockRejectedValueOnce(apiError);

      await expect(projectDocumentApi.getDocuments(projectId)).rejects.toEqual(apiError);
    });

    it('should throw error on API failure', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      const apiError = {
        status: 500,
        message: 'Internal server error',
      };

      vi.mocked(httpClient.get).mockRejectedValueOnce(apiError);

      await expect(projectDocumentApi.getDocuments(projectId)).rejects.toEqual(apiError);
    });

    it('should include metadata in documents', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDocuments: Document[] = [
        {
          id: 'doc-1',
          fileName: 'website-doc',
          type: 'WEBSITE',
          status: 'PROCESSED',
          metadata: '{"url": "https://example.com", "title": "Example Site"}',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockDocuments });

      const result = await projectDocumentApi.getDocuments(projectId);

      expect(result[0].metadata).toBe('{"url": "https://example.com", "title": "Example Site"}');
    });

    it('should handle large number of documents', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDocuments: Document[] = Array.from({ length: 100 }, (_, i) => ({
        id: `doc-${i}`,
        fileName: `document-${i}.pdf`,
        type: 'FILE' as const,
        status: 'PROCESSED' as const,
        metadata: '{}',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }));

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockDocuments });

      const result = await projectDocumentApi.getDocuments(projectId);

      expect(result).toHaveLength(100);
    });

    it('should include timestamps for all documents', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDocuments: Document[] = [
        {
          id: 'doc-1',
          fileName: 'document.pdf',
          type: 'FILE',
          status: 'PROCESSED',
          metadata: '{}',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-02T15:30:00Z',
        },
      ];

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockDocuments });

      const result = await projectDocumentApi.getDocuments(projectId);

      expect(result[0].createdAt).toBe('2024-01-01T10:00:00Z');
      expect(result[0].updatedAt).toBe('2024-01-02T15:30:00Z');
    });

    it('should send request to correct endpoint with project ID', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDocuments: Document[] = [];

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockDocuments });

      await projectDocumentApi.getDocuments(projectId);

      expect(httpClient.get).toHaveBeenCalledWith(`/projects/${projectId}/documents`);
      expect(httpClient.get).toHaveBeenCalledTimes(1);
    });

    it('should handle documents with different file names', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDocuments: Document[] = [
        {
          id: 'doc-1',
          fileName: 'document.pdf',
          type: 'FILE',
          status: 'PROCESSED',
          metadata: '{}',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'doc-2',
          fileName: 'notes with spaces.txt',
          type: 'FILE',
          status: 'PROCESSED',
          metadata: '{}',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        {
          id: 'doc-3',
          fileName: 'special-chars_123.docx',
          type: 'FILE',
          status: 'PROCESSED',
          metadata: '{}',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        },
      ];

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockDocuments });

      const result = await projectDocumentApi.getDocuments(projectId);

      expect(result[0].fileName).toBe('document.pdf');
      expect(result[1].fileName).toBe('notes with spaces.txt');
      expect(result[2].fileName).toBe('special-chars_123.docx');
    });

    it('should handle invalid project ID format', async () => {
      const projectId = 'invalid-uuid';

      const apiError = {
        status: 400,
        message: 'Invalid project ID format',
      };

      vi.mocked(httpClient.get).mockRejectedValueOnce(apiError);

      await expect(projectDocumentApi.getDocuments(projectId)).rejects.toMatchObject({
        status: 400,
      });
    });
  });
});
