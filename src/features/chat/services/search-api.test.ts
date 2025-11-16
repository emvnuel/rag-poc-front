/**
 * Unit tests for search-api service.
 *
 * Tests the search function that performs semantic search across documents.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { search } from './search-api';
import { httpClient } from '@/services/http/client';
import type { SearchRequest, SearchResponse } from '@/services/api/generated/types.gen';

// Mock the httpClient
vi.mock('@/services/http/client', () => ({
  httpClient: {
    post: vi.fn(),
  },
}));

describe('search-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('search', () => {
    it('should perform semantic search and return results', async () => {
      const mockRequest: SearchRequest = {
        query: 'What is React?',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const mockResponse: SearchResponse = {
        results: [
          {
            id: 'chunk-1',
            source: 'React Documentation',
            chunkText: 'React is a JavaScript library for building user interfaces.',
            chunkIndex: 0,
            distance: 0.05,
          },
          {
            id: 'chunk-2',
            source: 'React Tutorial',
            chunkText: 'React makes it painless to create interactive UIs.',
            chunkIndex: 1,
            distance: 0.08,
          },
        ],
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await search(mockRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/documents/search', mockRequest);
      expect(result).toEqual(mockResponse);
      expect(result.results).toHaveLength(2);
    });

    it('should return empty results when no matches found', async () => {
      const mockRequest: SearchRequest = {
        query: 'quantum physics',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const mockResponse: SearchResponse = {
        results: [],
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await search(mockRequest);

      expect(result.results).toEqual([]);
    });

    it('should include distance scores in results', async () => {
      const mockRequest: SearchRequest = {
        query: 'React hooks',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const mockResponse: SearchResponse = {
        results: [
          {
            id: 'chunk-1',
            source: 'Hooks Guide',
            chunkText: 'Hooks let you use state and other React features without writing a class.',
            chunkIndex: 0,
            distance: 0.03,
          },
        ],
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await search(mockRequest);

      expect(result.results![0].distance).toBe(0.03);
    });

    it('should include chunk index and text in results', async () => {
      const mockRequest: SearchRequest = {
        query: 'useState',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const mockResponse: SearchResponse = {
        results: [
          {
            id: 'chunk-5',
            source: 'Hooks Reference',
            chunkText: 'useState is a Hook that lets you add React state to function components.',
            chunkIndex: 5,
            distance: 0.02,
          },
        ],
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await search(mockRequest);

      expect(result.results![0].chunkIndex).toBe(5);
      expect(result.results![0].chunkText).toContain('useState');
    });

    it('should return results sorted by relevance (distance)', async () => {
      const mockRequest: SearchRequest = {
        query: 'components',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const mockResponse: SearchResponse = {
        results: [
          {
            id: 'chunk-1',
            source: 'Components Guide',
            chunkText: 'Components are the building blocks of React.',
            chunkIndex: 0,
            distance: 0.01,
          },
          {
            id: 'chunk-2',
            source: 'Advanced Components',
            chunkText: 'Higher-order components are an advanced technique.',
            chunkIndex: 3,
            distance: 0.15,
          },
        ],
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await search(mockRequest);

      // Verify first result has lower distance (more relevant)
      expect(result.results![0].distance).toBeLessThan(result.results![1].distance!);
    });

    it('should throw error when project not found (404)', async () => {
      const mockRequest: SearchRequest = {
        query: 'test query',
        projectId: 'non-existent-project',
      };

      const apiError = {
        status: 404,
        message: 'Project not found',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(apiError);

      await expect(search(mockRequest)).rejects.toEqual(apiError);
    });

    it('should throw error on API failure', async () => {
      const mockRequest: SearchRequest = {
        query: 'test query',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const apiError = {
        status: 500,
        message: 'Internal server error',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(apiError);

      await expect(search(mockRequest)).rejects.toEqual(apiError);
    });

    it('should throw error on network failure', async () => {
      const mockRequest: SearchRequest = {
        query: 'test query',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const networkError = {
        status: 500,
        message: 'Network error',
        code: 'ECONNREFUSED',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(networkError);

      await expect(search(mockRequest)).rejects.toMatchObject({
        code: 'ECONNREFUSED',
      });
    });

    it('should handle empty query gracefully', async () => {
      const mockRequest: SearchRequest = {
        query: '',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const mockResponse: SearchResponse = {
        results: [],
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await search(mockRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/documents/search', mockRequest);
      expect(result.results).toEqual([]);
    });

    it('should handle very long queries', async () => {
      const longQuery = 'a'.repeat(5000);
      const mockRequest: SearchRequest = {
        query: longQuery,
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const mockResponse: SearchResponse = {
        results: [
          {
            id: 'chunk-1',
            source: 'Document',
            chunkText: 'Result text',
            chunkIndex: 0,
            distance: 0.5,
          },
        ],
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await search(mockRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/documents/search', mockRequest);
      expect(result.results).toHaveLength(1);
    });

    it('should send request to correct endpoint', async () => {
      const mockRequest: SearchRequest = {
        query: 'test',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const mockResponse: SearchResponse = {
        results: [],
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      await search(mockRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/documents/search', expect.any(Object));
      expect(httpClient.post).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple results from same document', async () => {
      const mockRequest: SearchRequest = {
        query: 'React state',
        projectId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const mockResponse: SearchResponse = {
        results: [
          {
            id: 'chunk-1',
            source: 'React Guide',
            chunkText: 'State is a special variable in React.',
            chunkIndex: 0,
            distance: 0.04,
          },
          {
            id: 'chunk-2',
            source: 'React Guide',
            chunkText: 'State can be updated using setState.',
            chunkIndex: 1,
            distance: 0.06,
          },
        ],
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await search(mockRequest);

      expect(result.results).toHaveLength(2);
      expect(result.results![0].source).toBe('React Guide');
      expect(result.results![1].source).toBe('React Guide');
    });

    it('should handle bad request errors (400)', async () => {
      const mockRequest: SearchRequest = {
        query: 'test',
        projectId: 'invalid-uuid',
      };

      const apiError = {
        status: 400,
        message: 'Bad Request',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(apiError);

      await expect(search(mockRequest)).rejects.toMatchObject({
        status: 400,
      });
    });
  });
});
