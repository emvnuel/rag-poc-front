/**
 * Unit tests for chat-api service.
 *
 * Tests the sendMessage function that handles chat interactions with the RAG backend.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendMessage } from './chat-api';
import { httpClient } from '@/services/http/client';
import type { ChatRequest, ChatResponse } from '@/services/api/generated/types.gen';

// Mock the httpClient
vi.mock('@/services/http/client', () => ({
  httpClient: {
    post: vi.fn(),
  },
}));

describe('chat-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send a chat message and return response', async () => {
      const mockRequest: ChatRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'What is React?',
      };

      const mockResponse: ChatResponse = {
        response: 'React is a JavaScript library for building user interfaces.',
        sources: [
          {
            id: 'doc-1',
            source: 'React Documentation',
            chunkText: 'React is a JavaScript library...',
            chunkIndex: 0,
            distance: 0.05,
          },
        ],
        evalCount: 150,
        model: 'gpt-4',
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await sendMessage(mockRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/chat', mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should send message with conversation history', async () => {
      const mockRequest: ChatRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Tell me more',
        history: [
          {
            role: 'user',
            content: 'What is React?',
          },
          {
            role: 'assistant',
            content: 'React is a JavaScript library...',
          },
        ],
      };

      const mockResponse: ChatResponse = {
        response: 'React was created by Facebook...',
        sources: [],
        evalCount: 100,
        model: 'gpt-4',
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await sendMessage(mockRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/chat', mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should include sources in response when available', async () => {
      const mockRequest: ChatRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Show me examples',
      };

      const mockResponse: ChatResponse = {
        response: 'Here are some examples...',
        sources: [
          {
            id: 'doc-1',
            source: 'Examples.md',
            chunkText: 'Example 1: Basic component',
            chunkIndex: 0,
            distance: 0.08,
          },
          {
            id: 'doc-2',
            source: 'Advanced.md',
            chunkText: 'Example 2: Advanced pattern',
            chunkIndex: 1,
            distance: 0.12,
          },
        ],
        evalCount: 200,
        model: 'gpt-4',
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await sendMessage(mockRequest);

      expect(result.sources).toHaveLength(2);
      expect(result.sources![0].distance).toBe(0.08);
    });

    it('should return empty sources array when no matches found', async () => {
      const mockRequest: ChatRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'What is quantum physics?',
      };

      const mockResponse: ChatResponse = {
        response: 'I could not find relevant information in the documents.',
        sources: [],
        evalCount: 50,
        model: 'gpt-4',
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await sendMessage(mockRequest);

      expect(result.sources).toEqual([]);
    });

    it('should include token usage and model information', async () => {
      const mockRequest: ChatRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Test message',
      };

      const mockResponse: ChatResponse = {
        response: 'Response',
        sources: [],
        evalCount: 250,
        model: 'gpt-4-turbo',
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await sendMessage(mockRequest);

      expect(result.evalCount).toBe(250);
      expect(result.model).toBe('gpt-4-turbo');
    });

    it('should throw error when API request fails', async () => {
      const mockRequest: ChatRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Test message',
      };

      const apiError = {
        status: 500,
        message: 'Internal server error',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(apiError);

      await expect(sendMessage(mockRequest)).rejects.toEqual(apiError);
    });

    it('should throw error when project not found (404)', async () => {
      const mockRequest: ChatRequest = {
        projectId: 'non-existent-project',
        message: 'Test message',
      };

      const apiError = {
        status: 404,
        message: 'Project not found',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(apiError);

      await expect(sendMessage(mockRequest)).rejects.toEqual(apiError);
    });

    it('should throw error on network failure', async () => {
      const mockRequest: ChatRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Test message',
      };

      const networkError = {
        status: 500,
        message: 'Network error',
        code: 'ECONNREFUSED',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(networkError);

      await expect(sendMessage(mockRequest)).rejects.toMatchObject({
        code: 'ECONNREFUSED',
      });
    });

    it('should handle timeout errors (120s chat timeout)', async () => {
      const mockRequest: ChatRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Complex query requiring long processing',
      };

      const timeoutError = {
        status: 500,
        message: 'Request timeout',
        code: 'ECONNABORTED',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(timeoutError);

      await expect(sendMessage(mockRequest)).rejects.toMatchObject({
        code: 'ECONNABORTED',
      });
    });

    it('should handle rate limit errors (429)', async () => {
      const mockRequest: ChatRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Test message',
      };

      const rateLimitError = {
        status: 429,
        message: 'Too many requests. Please try again later.',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(rateLimitError);

      await expect(sendMessage(mockRequest)).rejects.toMatchObject({
        status: 429,
      });
    });

    it('should send request to correct endpoint', async () => {
      const mockRequest: ChatRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Test',
      };

      const mockResponse: ChatResponse = {
        response: 'Response',
        sources: [],
        evalCount: 50,
        model: 'gpt-4',
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      await sendMessage(mockRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/chat', expect.any(Object));
      expect(httpClient.post).toHaveBeenCalledTimes(1);
    });

    it('should handle empty message gracefully', async () => {
      const mockRequest: ChatRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        message: '',
      };

      const mockResponse: ChatResponse = {
        response: 'Please provide a message.',
        sources: [],
        evalCount: 10,
        model: 'gpt-4',
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await sendMessage(mockRequest);

      expect(result).toEqual(mockResponse);
    });

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(5000);
      const mockRequest: ChatRequest = {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        message: longMessage,
      };

      const mockResponse: ChatResponse = {
        response: 'Response to long message',
        sources: [],
        evalCount: 1500,
        model: 'gpt-4',
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await sendMessage(mockRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/chat', mockRequest);
      expect(result.evalCount).toBe(1500);
    });
  });
});
