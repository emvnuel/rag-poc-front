/**
 * Project (Workspace) entity representing an isolated workspace
 */
export interface Project {
  id: string // UUID format
  name: string // Min 1 char, non-empty pattern
  createdAt: string // ISO 8601 date-time
  updatedAt: string // ISO 8601 date-time
  documentCount: number // Total documents in project
}

/**
 * Request payload for creating a new project
 */
export interface ProjectCreateRequest {
  name: string // Required, non-empty
}

/**
 * Request payload for updating an existing project
 */
export interface ProjectUpdateRequest {
  name: string // Required, non-empty
}

/**
 * API response type for list of projects
 */
export type ProjectListResponse = Project[]
