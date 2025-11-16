/**
 * Application route paths
 */
export const ROUTES = {
  HOME: '/',
  PROJECTS: '/',
  PROJECT: (projectId: string) => `/projects/${projectId}`,
  DOCUMENTS: (projectId: string) => `/projects/${projectId}/documents`,
  CHAT: (projectId: string) => `/projects/${projectId}/chat`,
  KNOWLEDGE_GRAPH: (projectId: string) => `/projects/${projectId}/knowledge-graph`,
} as const
