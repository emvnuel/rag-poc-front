/**
 * Project API service for managing projects (workspaces).
 *
 * Handles all project-related API operations including CRUD operations.
 */

import type {
  ProjectInfoResponse,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  Uuid,
} from '@/services/api/generated/types.gen';
import { httpClient } from '@/services/http/client';

/**
 * Fetches all projects for the current user.
 *
 * @returns Promise resolving to array of project information
 * @throws Error if the API request fails
 */
export const getAll = async (): Promise<ProjectInfoResponse[]> => {
  const response = await httpClient.get<ProjectInfoResponse[]>('/projects');
  return response.data;
};

/**
 * Creates a new project.
 *
 * @param data - Project creation data including name
 * @returns Promise resolving to created project information
 * @throws Error if the API request fails
 */
export const create = async (data: ProjectCreateRequest): Promise<ProjectInfoResponse> => {
  const response = await httpClient.post<ProjectInfoResponse>('/projects', data);
  return response.data;
};

/**
 * Fetches a single project by ID.
 *
 * @param id - Project UUID
 * @returns Promise resolving to project information
 * @throws Error if the API request fails
 */
export const getById = async (id: Uuid): Promise<ProjectInfoResponse> => {
  const response = await httpClient.get<ProjectInfoResponse>(`/projects/${id}`);
  return response.data;
};

/**
 * Updates an existing project.
 *
 * @param id - Project UUID
 * @param data - Project update data
 * @returns Promise resolving to updated project information
 * @throws Error if the API request fails
 */
export const update = async (id: Uuid, data: ProjectUpdateRequest): Promise<ProjectInfoResponse> => {
  const response = await httpClient.put<ProjectInfoResponse>(`/projects/${id}`, data);
  return response.data;
};

/**
 * Deletes a project.
 *
 * @param id - Project UUID
 * @returns Promise resolving when deletion is complete
 * @throws Error if the API request fails
 */
export const deleteProject = async (id: Uuid): Promise<void> => {
  await httpClient.delete(`/projects/${id}`);
};
