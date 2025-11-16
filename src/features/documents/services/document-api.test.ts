/**
 * Unit tests for document-api service.
 *
 * Tests all document operations including upload, processing, retrieval, and deletion.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { documentApi } from './document-api';
import { httpClient } from '@/services/http/client';
import type { Document, DocumentProgress } from '@/types/document';

// Mock the httpClient
vi.mock('@/services/http/client', () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('document-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a PDF file successfully', async () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });

      await documentApi.uploadFile(file, projectId);

      expect(httpClient.post).toHaveBeenCalledWith(
        '/documents/files',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });

    it('should include file and projectId in FormData', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      let capturedFormData: FormData | undefined;
      vi.mocked(httpClient.post).mockImplementationOnce((_url, data) => {
        capturedFormData = data as FormData;
        return Promise.resolve({ data: null });
      });

      await documentApi.uploadFile(file, projectId);

      expect(capturedFormData).toBeInstanceOf(FormData);
      expect(capturedFormData!.get('file')).toBe(file);
      expect(capturedFormData!.get('projectId')).toBe(projectId);
    });

    it('should upload a DOCX file successfully', async () => {
      const file = new File(['content'], 'document.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });

      await documentApi.uploadFile(file, projectId);

      expect(httpClient.post).toHaveBeenCalled();
    });

    it('should upload a TXT file successfully', async () => {
      const file = new File(['plain text content'], 'notes.txt', { type: 'text/plain' });
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });

      await documentApi.uploadFile(file, projectId);

      expect(httpClient.post).toHaveBeenCalled();
    });

    it('should upload a MD file successfully', async () => {
      const file = new File(['# Markdown content'], 'readme.md', { type: 'text/markdown' });
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });

      await documentApi.uploadFile(file, projectId);

      expect(httpClient.post).toHaveBeenCalled();
    });

    it('should throw error on upload failure', async () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      const apiError = {
        status: 500,
        message: 'Upload failed',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(apiError);

      await expect(documentApi.uploadFile(file, projectId)).rejects.toEqual(apiError);
    });

    it('should handle large file uploads (uses 30s timeout)', async () => {
      const largeContent = 'a'.repeat(20 * 1024 * 1024); // 20MB
      const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });

      await documentApi.uploadFile(file, projectId);

      expect(httpClient.post).toHaveBeenCalled();
    });
  });

  describe('processText', () => {
    it('should process text document successfully', async () => {
      const text = 'This is important information about React.';
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });

      await documentApi.processText(text, projectId);

      expect(httpClient.post).toHaveBeenCalledWith('/documents/texts', { text, projectId });
    });

    it('should process long text content', async () => {
      const longText = 'a'.repeat(10000);
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });

      await documentApi.processText(longText, projectId);

      expect(httpClient.post).toHaveBeenCalledWith('/documents/texts', {
        text: longText,
        projectId,
      });
    });

    it('should throw error on processing failure', async () => {
      const text = 'Test content';
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      const apiError = {
        status: 500,
        message: 'Processing failed',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(apiError);

      await expect(documentApi.processText(text, projectId)).rejects.toEqual(apiError);
    });

    it('should handle empty text gracefully', async () => {
      const text = '';
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });

      await documentApi.processText(text, projectId);

      expect(httpClient.post).toHaveBeenCalled();
    });
  });

  describe('processWebsite', () => {
    it('should process website URL successfully', async () => {
      const url = 'https://example.com/docs';
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });

      await documentApi.processWebsite(url, projectId);

      expect(httpClient.post).toHaveBeenCalledWith('/documents/websites', { url, projectId });
    });

    it('should process http URLs', async () => {
      const url = 'http://example.com/page';
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });

      await documentApi.processWebsite(url, projectId);

      expect(httpClient.post).toHaveBeenCalled();
    });

    it('should process URLs with query parameters', async () => {
      const url = 'https://example.com/docs?section=api&version=2';
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });

      await documentApi.processWebsite(url, projectId);

      expect(httpClient.post).toHaveBeenCalledWith('/documents/websites', { url, projectId });
    });

    it('should throw error on invalid URL', async () => {
      const url = 'not-a-valid-url';
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      const apiError = {
        status: 400,
        message: 'Invalid URL format',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(apiError);

      await expect(documentApi.processWebsite(url, projectId)).rejects.toEqual(apiError);
    });

    it('should throw error on unreachable website', async () => {
      const url = 'https://nonexistent-domain-12345.com';
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      const apiError = {
        status: 500,
        message: 'Failed to fetch website content',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(apiError);

      await expect(documentApi.processWebsite(url, projectId)).rejects.toEqual(apiError);
    });
  });

  describe('getById', () => {
    it('should fetch document by ID successfully', async () => {
      const documentId = 'doc-123';
      const mockDocument: Document = {
        id: documentId,
        fileName: 'Test Document',
        type: 'FILE',
        status: 'PROCESSED',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        metadata: '{}',
      };

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockDocument });

      const result = await documentApi.getById(documentId);

      expect(httpClient.get).toHaveBeenCalledWith(`/documents/${documentId}`);
      expect(result).toEqual(mockDocument);
    });

    it('should throw error when document not found', async () => {
      const documentId = 'non-existent-doc';

      const apiError = {
        status: 404,
        message: 'Document not found',
      };

      vi.mocked(httpClient.get).mockRejectedValueOnce(apiError);

      await expect(documentApi.getById(documentId)).rejects.toEqual(apiError);
    });
  });

  describe('getContent', () => {
    it('should fetch document content successfully', async () => {
      const documentId = 'doc-123';
      const mockContent = 'This is the full document content.';

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockContent });

      const result = await documentApi.getContent(documentId);

      expect(httpClient.get).toHaveBeenCalledWith(`/documents/${documentId}/content`);
      expect(result).toEqual(mockContent);
    });

    it('should fetch long document content', async () => {
      const documentId = 'doc-123';
      const mockContent = 'a'.repeat(50000);

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockContent });

      const result = await documentApi.getContent(documentId);

      expect(result.length).toBe(50000);
    });

    it('should throw error when document not found', async () => {
      const documentId = 'non-existent-doc';

      const apiError = {
        status: 404,
        message: 'Document not found',
      };

      vi.mocked(httpClient.get).mockRejectedValueOnce(apiError);

      await expect(documentApi.getContent(documentId)).rejects.toEqual(apiError);
    });
  });

  describe('getProgress', () => {
    it('should fetch document processing progress', async () => {
      const documentId = 'doc-123';
      const mockProgress: DocumentProgress = {
        progressPercentage: 75,
      };

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockProgress });

      const result = await documentApi.getProgress(documentId);

      expect(httpClient.get).toHaveBeenCalledWith(`/documents/${documentId}/progress`);
      expect(result).toEqual(mockProgress);
    });

    it('should fetch progress at 0%', async () => {
      const documentId = 'doc-123';
      const mockProgress: DocumentProgress = {
        progressPercentage: 0,
      };

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockProgress });

      const result = await documentApi.getProgress(documentId);

      expect(result.progressPercentage).toBe(0);
    });

    it('should fetch progress at 100%', async () => {
      const documentId = 'doc-123';
      const mockProgress: DocumentProgress = {
        progressPercentage: 100,
      };

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockProgress });

      const result = await documentApi.getProgress(documentId);

      expect(result.progressPercentage).toBe(100);
    });

    it('should throw error when document not found', async () => {
      const documentId = 'non-existent-doc';

      const apiError = {
        status: 404,
        message: 'Document not found',
      };

      vi.mocked(httpClient.get).mockRejectedValueOnce(apiError);

      await expect(documentApi.getProgress(documentId)).rejects.toEqual(apiError);
    });
  });

  describe('delete', () => {
    it('should delete document successfully', async () => {
      const documentId = 'doc-123';

      vi.mocked(httpClient.delete).mockResolvedValueOnce({ data: null });

      await documentApi.delete(documentId);

      expect(httpClient.delete).toHaveBeenCalledWith(`/documents/${documentId}`);
    });

    it('should throw error when document not found', async () => {
      const documentId = 'non-existent-doc';

      const apiError = {
        status: 404,
        message: 'Document not found',
      };

      vi.mocked(httpClient.delete).mockRejectedValueOnce(apiError);

      await expect(documentApi.delete(documentId)).rejects.toEqual(apiError);
    });

    it('should throw error when deletion fails', async () => {
      const documentId = 'doc-123';

      const apiError = {
        status: 500,
        message: 'Failed to delete document',
      };

      vi.mocked(httpClient.delete).mockRejectedValueOnce(apiError);

      await expect(documentApi.delete(documentId)).rejects.toEqual(apiError);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete document lifecycle', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';
      const documentId = 'doc-123';

      // Upload
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });
      await documentApi.uploadFile(file, projectId);

      // Get progress
      const mockProgress: DocumentProgress = { progressPercentage: 50 };
      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockProgress });
      const progress = await documentApi.getProgress(documentId);
      expect(progress.progressPercentage).toBe(50);

      // Get document
      const mockDocument: Document = {
        id: documentId,
        fileName: 'test.pdf',
        type: 'FILE',
        status: 'PROCESSED',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        metadata: '{}',
      };
      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockDocument });
      const doc = await documentApi.getById(documentId);
      expect(doc.status).toBe('PROCESSED');

      // Delete
      vi.mocked(httpClient.delete).mockResolvedValueOnce({ data: null });
      await documentApi.delete(documentId);

      expect(httpClient.post).toHaveBeenCalled();
      expect(httpClient.get).toHaveBeenCalledTimes(2);
      expect(httpClient.delete).toHaveBeenCalled();
    });

    it('should handle multiple document types in same project', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';

      // Upload file
      const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });
      await documentApi.uploadFile(file, projectId);

      // Process text
      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });
      await documentApi.processText('Important notes', projectId);

      // Process website
      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: null });
      await documentApi.processWebsite('https://example.com', projectId);

      expect(httpClient.post).toHaveBeenCalledTimes(3);
    });
  });
});
