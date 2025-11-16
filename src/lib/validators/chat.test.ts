/**
 * Unit tests for chat validation schemas.
 *
 * Tests Zod schemas for chat messages, requests, and search queries.
 */

import { describe, it, expect } from 'vitest';
import {
  chatMessageSchema,
  chatRequestSchema,
  searchRequestSchema,
  type ChatMessageInput,
  type ChatRequestInput,
  type SearchRequestInput,
} from './chat';

describe('chatMessageSchema', () => {
  it('should validate valid user message', () => {
    const validMessage: ChatMessageInput = {
      role: 'user',
      content: 'What is RAG?',
    };

    const result = chatMessageSchema.safeParse(validMessage);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validMessage);
    }
  });

  it('should validate valid assistant message', () => {
    const validMessage: ChatMessageInput = {
      role: 'assistant',
      content: 'RAG stands for Retrieval-Augmented Generation.',
    };

    const result = chatMessageSchema.safeParse(validMessage);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validMessage);
    }
  });

  it('should reject invalid role', () => {
    const invalidMessage = {
      role: 'system',
      content: 'Test message',
    };

    const result = chatMessageSchema.safeParse(invalidMessage);
    expect(result.success).toBe(false);
  });

  it('should reject missing content', () => {
    const invalidMessage = {
      role: 'user',
    };

    const result = chatMessageSchema.safeParse(invalidMessage);
    expect(result.success).toBe(false);
  });

  it('should accept empty content string', () => {
    const message = {
      role: 'user',
      content: '',
    };

    const result = chatMessageSchema.safeParse(message);
    expect(result.success).toBe(true);
  });
});

describe('chatRequestSchema', () => {
  const validProjectId = '550e8400-e29b-41d4-a716-446655440000';

  it('should validate valid chat request without history', () => {
    const validRequest: ChatRequestInput = {
      projectId: validProjectId,
      message: 'What is RAG?',
    };

    const result = chatRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validRequest);
    }
  });

  it('should validate valid chat request with history', () => {
    const validRequest: ChatRequestInput = {
      projectId: validProjectId,
      message: 'Tell me more',
      history: [
        { role: 'user', content: 'What is RAG?' },
        { role: 'assistant', content: 'RAG stands for Retrieval-Augmented Generation.' },
      ],
    };

    const result = chatRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validRequest);
    }
  });

  it('should reject empty message', () => {
    const invalidRequest = {
      projectId: validProjectId,
      message: '',
    };

    const result = chatRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Message cannot be empty');
    }
  });

  it('should reject whitespace-only message', () => {
    const invalidRequest = {
      projectId: validProjectId,
      message: '   ',
    };

    const result = chatRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Message cannot be only whitespace');
    }
  });

  it('should reject invalid UUID format', () => {
    const invalidRequest = {
      projectId: 'not-a-uuid',
      message: 'What is RAG?',
    };

    const result = chatRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid project ID');
    }
  });

  it('should reject empty project ID', () => {
    const invalidRequest = {
      projectId: '',
      message: 'What is RAG?',
    };

    const result = chatRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should accept message with special characters', () => {
    const validRequest = {
      projectId: validProjectId,
      message: 'What is RAG? How does it work? 🤔',
    };

    const result = chatRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should accept message with newlines', () => {
    const validRequest = {
      projectId: validProjectId,
      message: 'Line 1\nLine 2\nLine 3',
    };

    const result = chatRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });
});

describe('searchRequestSchema', () => {
  const validProjectId = '550e8400-e29b-41d4-a716-446655440000';

  it('should validate valid search request', () => {
    const validRequest: SearchRequestInput = {
      query: 'machine learning',
      projectId: validProjectId,
    };

    const result = searchRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validRequest);
    }
  });

  it('should reject empty query', () => {
    const invalidRequest = {
      query: '',
      projectId: validProjectId,
    };

    const result = searchRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Search query cannot be empty');
    }
  });

  it('should reject whitespace-only query', () => {
    const invalidRequest = {
      query: '   ',
      projectId: validProjectId,
    };

    const result = searchRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Search query cannot be only whitespace');
    }
  });

  it('should reject invalid project ID format', () => {
    const invalidRequest = {
      query: 'machine learning',
      projectId: 'invalid-uuid',
    };

    const result = searchRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid project ID');
    }
  });

  it('should accept query with special characters', () => {
    const validRequest = {
      query: 'C++ programming & data structures',
      projectId: validProjectId,
    };

    const result = searchRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should accept multi-word query', () => {
    const validRequest = {
      query: 'how to implement retrieval augmented generation',
      projectId: validProjectId,
    };

    const result = searchRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });
});
