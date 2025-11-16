/**
 * Unit tests for query key factory
 * 
 * Tests type-safe cache key generation for React Query
 */

import { describe, it, expect } from 'vitest';
import { queryKeys } from './query-keys';

describe('queryKeys.projects', () => {
  it('should generate all projects key', () => {
    expect(queryKeys.projects.all).toEqual(['projects']);
  });

  it('should generate project detail key', () => {
    const projectId = '550e8400-e29b-41d4-a716-446655440000';
    expect(queryKeys.projects.detail(projectId)).toEqual(['projects', projectId]);
  });

  it('should generate project documents key', () => {
    const projectId = '550e8400-e29b-41d4-a716-446655440000';
    expect(queryKeys.projects.documents(projectId)).toEqual([
      'projects',
      projectId,
      'documents',
    ]);
  });

  it('should generate unique keys for different project IDs', () => {
    const projectId1 = '550e8400-e29b-41d4-a716-446655440000';
    const projectId2 = '660e8400-e29b-41d4-a716-446655440000';
    
    expect(queryKeys.projects.detail(projectId1)).not.toEqual(
      queryKeys.projects.detail(projectId2)
    );
  });

  it('should generate keys as readonly arrays', () => {
    const key = queryKeys.projects.all;
    expect(Array.isArray(key)).toBe(true);
  });

  it('should handle empty string project ID', () => {
    const key = queryKeys.projects.detail('');
    expect(key).toEqual(['projects', '']);
  });

  it('should handle special characters in project ID', () => {
    const projectId = 'project-with-special-chars_123';
    const key = queryKeys.projects.detail(projectId);
    expect(key).toEqual(['projects', projectId]);
  });
});

describe('queryKeys.documents', () => {
  it('should generate document detail key', () => {
    const documentId = 'doc-123';
    expect(queryKeys.documents.detail(documentId)).toEqual(['documents', documentId]);
  });

  it('should generate document content key', () => {
    const documentId = 'doc-123';
    expect(queryKeys.documents.content(documentId)).toEqual([
      'documents',
      documentId,
      'content',
    ]);
  });

  it('should generate document progress key', () => {
    const documentId = 'doc-123';
    expect(queryKeys.documents.progress(documentId)).toEqual([
      'documents',
      documentId,
      'progress',
    ]);
  });

  it('should generate unique keys for different document IDs', () => {
    const docId1 = 'doc-123';
    const docId2 = 'doc-456';
    
    expect(queryKeys.documents.detail(docId1)).not.toEqual(
      queryKeys.documents.detail(docId2)
    );
  });

  it('should differentiate between detail, content, and progress keys', () => {
    const documentId = 'doc-123';
    
    const detailKey = queryKeys.documents.detail(documentId);
    const contentKey = queryKeys.documents.content(documentId);
    const progressKey = queryKeys.documents.progress(documentId);
    
    expect(detailKey).not.toEqual(contentKey);
    expect(detailKey).not.toEqual(progressKey);
    expect(contentKey).not.toEqual(progressKey);
  });

  it('should handle UUID format document IDs', () => {
    const documentId = '550e8400-e29b-41d4-a716-446655440000';
    const key = queryKeys.documents.detail(documentId);
    expect(key).toEqual(['documents', documentId]);
  });
});

describe('queryKeys.chat', () => {
  it('should generate chat session key', () => {
    const projectId = 'project-123';
    const sessionId = 'session-456';
    
    expect(queryKeys.chat.session(projectId, sessionId)).toEqual([
      'chat',
      projectId,
      sessionId,
    ]);
  });

  it('should generate unique keys for different project IDs', () => {
    const projectId1 = 'project-123';
    const projectId2 = 'project-456';
    const sessionId = 'session-789';
    
    expect(queryKeys.chat.session(projectId1, sessionId)).not.toEqual(
      queryKeys.chat.session(projectId2, sessionId)
    );
  });

  it('should generate unique keys for different session IDs', () => {
    const projectId = 'project-123';
    const sessionId1 = 'session-456';
    const sessionId2 = 'session-789';
    
    expect(queryKeys.chat.session(projectId, sessionId1)).not.toEqual(
      queryKeys.chat.session(projectId, sessionId2)
    );
  });

  it('should handle empty string IDs', () => {
    const key = queryKeys.chat.session('', '');
    expect(key).toEqual(['chat', '', '']);
  });
});

describe('queryKeys.search', () => {
  it('should generate search results key', () => {
    const projectId = 'project-123';
    const query = 'machine learning';
    
    expect(queryKeys.search.results(projectId, query)).toEqual([
      'search',
      projectId,
      query,
    ]);
  });

  it('should generate unique keys for different queries', () => {
    const projectId = 'project-123';
    const query1 = 'machine learning';
    const query2 = 'deep learning';
    
    expect(queryKeys.search.results(projectId, query1)).not.toEqual(
      queryKeys.search.results(projectId, query2)
    );
  });

  it('should generate unique keys for different project IDs', () => {
    const projectId1 = 'project-123';
    const projectId2 = 'project-456';
    const query = 'machine learning';
    
    expect(queryKeys.search.results(projectId1, query)).not.toEqual(
      queryKeys.search.results(projectId2, query)
    );
  });

  it('should handle empty query string', () => {
    const projectId = 'project-123';
    const key = queryKeys.search.results(projectId, '');
    expect(key).toEqual(['search', projectId, '']);
  });

  it('should handle queries with special characters', () => {
    const projectId = 'project-123';
    const query = 'C++ programming & data structures';
    const key = queryKeys.search.results(projectId, query);
    expect(key).toEqual(['search', projectId, query]);
  });

  it('should preserve query case sensitivity', () => {
    const projectId = 'project-123';
    const query1 = 'Machine Learning';
    const query2 = 'machine learning';
    
    expect(queryKeys.search.results(projectId, query1)).not.toEqual(
      queryKeys.search.results(projectId, query2)
    );
  });

  it('should preserve query whitespace', () => {
    const projectId = 'project-123';
    const query1 = 'machine learning';
    const query2 = 'machine  learning'; // Double space
    
    expect(queryKeys.search.results(projectId, query1)).not.toEqual(
      queryKeys.search.results(projectId, query2)
    );
  });
});

describe('queryKeys structure', () => {
  it('should have all required top-level keys', () => {
    expect(queryKeys).toHaveProperty('projects');
    expect(queryKeys).toHaveProperty('documents');
    expect(queryKeys).toHaveProperty('chat');
    expect(queryKeys).toHaveProperty('search');
  });

  it('should have all projects methods', () => {
    expect(queryKeys.projects).toHaveProperty('all');
    expect(queryKeys.projects).toHaveProperty('detail');
    expect(queryKeys.projects).toHaveProperty('documents');
  });

  it('should have all documents methods', () => {
    expect(queryKeys.documents).toHaveProperty('detail');
    expect(queryKeys.documents).toHaveProperty('content');
    expect(queryKeys.documents).toHaveProperty('progress');
  });

  it('should have chat session method', () => {
    expect(queryKeys.chat).toHaveProperty('session');
  });

  it('should have search results method', () => {
    expect(queryKeys.search).toHaveProperty('results');
  });

  it('should return array keys', () => {
    expect(Array.isArray(queryKeys.projects.all)).toBe(true);
    expect(Array.isArray(queryKeys.projects.detail('id'))).toBe(true);
    expect(Array.isArray(queryKeys.documents.detail('id'))).toBe(true);
    expect(Array.isArray(queryKeys.chat.session('p', 's'))).toBe(true);
    expect(Array.isArray(queryKeys.search.results('p', 'q'))).toBe(true);
  });

  it('should maintain consistent key structure', () => {
    // All project keys should start with 'projects'
    expect(queryKeys.projects.all[0]).toBe('projects');
    expect(queryKeys.projects.detail('id')[0]).toBe('projects');
    expect(queryKeys.projects.documents('id')[0]).toBe('projects');
    
    // All document keys should start with 'documents'
    expect(queryKeys.documents.detail('id')[0]).toBe('documents');
    expect(queryKeys.documents.content('id')[0]).toBe('documents');
    expect(queryKeys.documents.progress('id')[0]).toBe('documents');
    
    // Chat keys should start with 'chat'
    expect(queryKeys.chat.session('p', 's')[0]).toBe('chat');
    
    // Search keys should start with 'search'
    expect(queryKeys.search.results('p', 'q')[0]).toBe('search');
  });
});
