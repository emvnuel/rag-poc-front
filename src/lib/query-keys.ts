/**
 * Query key factory for type-safe cache keys
 * Provides consistent query key structure across the application
 */
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    documents: (id: string) => ['projects', id, 'documents'] as const,
  },
  documents: {
    detail: (id: string) => ['documents', id] as const,
    content: (id: string) => ['documents', id, 'content'] as const,
    progress: (id: string) => ['documents', id, 'progress'] as const,
  },
  chat: {
    session: (projectId: string, sessionId: string) =>
      ['chat', projectId, sessionId] as const,
  },
  search: {
    results: (projectId: string, query: string) =>
      ['search', projectId, query] as const,
  },
}
