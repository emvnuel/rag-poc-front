/**
 * Unit tests for project-api service.
 *
 * Tests all project operations including CRUD operations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAll, create, getById, update, deleteProject } from './project-api';
import { httpClient } from '@/services/http/client';
import type {
  ProjectInfoResponse,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  Uuid,
} from '@/services/api/generated/types.gen';

// Mock the httpClient
vi.mock('@/services/http/client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('project-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all projects successfully', async () => {
      const mockProjects: ProjectInfoResponse[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Project 1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          documentCount: 5,
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          name: 'Project 2',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          documentCount: 3,
        },
      ];

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockProjects });

      const result = await getAll();

      expect(httpClient.get).toHaveBeenCalledWith('/projects');
      expect(result).toEqual(mockProjects);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no projects exist', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: [] });

      const result = await getAll();

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      const apiError = {
        status: 500,
        message: 'Internal server error',
      };

      vi.mocked(httpClient.get).mockRejectedValueOnce(apiError);

      await expect(getAll()).rejects.toEqual(apiError);
    });

    it('should include document count in projects', async () => {
      const mockProjects: ProjectInfoResponse[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Project',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          documentCount: 10,
        },
      ];

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockProjects });

      const result = await getAll();

      expect(result[0].documentCount).toBe(10);
    });
  });

  describe('create', () => {
    it('should create a new project successfully', async () => {
      const createRequest: ProjectCreateRequest = {
        name: 'New Project',
      };

      const mockResponse: ProjectInfoResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'New Project',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        documentCount: 0,
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await create(createRequest);

      expect(httpClient.post).toHaveBeenCalledWith('/projects', createRequest);
      expect(result).toEqual(mockResponse);
      expect(result.documentCount).toBe(0);
    });

    it('should create project with long name', async () => {
      const createRequest: ProjectCreateRequest = {
        name: 'A'.repeat(200),
      };

      const mockResponse: ProjectInfoResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: createRequest.name,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        documentCount: 0,
      };

      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await create(createRequest);

      expect(result.name).toHaveLength(200);
    });

    it('should throw error on validation failure', async () => {
      const createRequest: ProjectCreateRequest = {
        name: '',
      };

      const apiError = {
        status: 400,
        message: 'Project name is required',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(apiError);

      await expect(create(createRequest)).rejects.toEqual(apiError);
    });

    it('should throw error on creation failure', async () => {
      const createRequest: ProjectCreateRequest = {
        name: 'Test Project',
      };

      const apiError = {
        status: 500,
        message: 'Failed to create project',
      };

      vi.mocked(httpClient.post).mockRejectedValueOnce(apiError);

      await expect(create(createRequest)).rejects.toEqual(apiError);
    });
  });

  describe('getById', () => {
    it('should fetch project by ID successfully', async () => {
      const projectId: Uuid = '123e4567-e89b-12d3-a456-426614174000';

      const mockProject: ProjectInfoResponse = {
        id: projectId,
        name: 'Test Project',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        documentCount: 7,
      };

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockProject });

      const result = await getById(projectId);

      expect(httpClient.get).toHaveBeenCalledWith(`/projects/${projectId}`);
      expect(result).toEqual(mockProject);
    });

    it('should throw error when project not found (404)', async () => {
      const projectId: Uuid = 'non-existent-project';

      const apiError = {
        status: 404,
        message: 'Project not found',
      };

      vi.mocked(httpClient.get).mockRejectedValueOnce(apiError);

      await expect(getById(projectId)).rejects.toEqual(apiError);
    });

    it('should throw error on API failure', async () => {
      const projectId: Uuid = '123e4567-e89b-12d3-a456-426614174000';

      const apiError = {
        status: 500,
        message: 'Internal server error',
      };

      vi.mocked(httpClient.get).mockRejectedValueOnce(apiError);

      await expect(getById(projectId)).rejects.toEqual(apiError);
    });
  });

  describe('update', () => {
    it('should update project successfully', async () => {
      const projectId: Uuid = '123e4567-e89b-12d3-a456-426614174000';
      const updateRequest: ProjectUpdateRequest = {
        name: 'Updated Project Name',
      };

      const mockResponse: ProjectInfoResponse = {
        id: projectId,
        name: 'Updated Project Name',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        documentCount: 5,
      };

      vi.mocked(httpClient.put).mockResolvedValueOnce({ data: mockResponse });

      const result = await update(projectId, updateRequest);

      expect(httpClient.put).toHaveBeenCalledWith(`/projects/${projectId}`, updateRequest);
      expect(result).toEqual(mockResponse);
      expect(result.name).toBe('Updated Project Name');
    });

    it('should update project with long name', async () => {
      const projectId: Uuid = '123e4567-e89b-12d3-a456-426614174000';
      const updateRequest: ProjectUpdateRequest = {
        name: 'B'.repeat(200),
      };

      const mockResponse: ProjectInfoResponse = {
        id: projectId,
        name: updateRequest.name,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        documentCount: 0,
      };

      vi.mocked(httpClient.put).mockResolvedValueOnce({ data: mockResponse });

      const result = await update(projectId, updateRequest);

      expect(result.name).toHaveLength(200);
    });

    it('should throw error when project not found', async () => {
      const projectId: Uuid = 'non-existent-project';
      const updateRequest: ProjectUpdateRequest = {
        name: 'Updated Name',
      };

      const apiError = {
        status: 404,
        message: 'Project not found',
      };

      vi.mocked(httpClient.put).mockRejectedValueOnce(apiError);

      await expect(update(projectId, updateRequest)).rejects.toEqual(apiError);
    });

    it('should throw error on validation failure', async () => {
      const projectId: Uuid = '123e4567-e89b-12d3-a456-426614174000';
      const updateRequest: ProjectUpdateRequest = {
        name: '',
      };

      const apiError = {
        status: 400,
        message: 'Project name is required',
      };

      vi.mocked(httpClient.put).mockRejectedValueOnce(apiError);

      await expect(update(projectId, updateRequest)).rejects.toEqual(apiError);
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      const projectId: Uuid = '123e4567-e89b-12d3-a456-426614174000';

      vi.mocked(httpClient.delete).mockResolvedValueOnce({ data: null });

      await deleteProject(projectId);

      expect(httpClient.delete).toHaveBeenCalledWith(`/projects/${projectId}`);
    });

    it('should throw error when project not found', async () => {
      const projectId: Uuid = 'non-existent-project';

      const apiError = {
        status: 404,
        message: 'Project not found',
      };

      vi.mocked(httpClient.delete).mockRejectedValueOnce(apiError);

      await expect(deleteProject(projectId)).rejects.toEqual(apiError);
    });

    it('should throw error when project has documents', async () => {
      const projectId: Uuid = '123e4567-e89b-12d3-a456-426614174000';

      const apiError = {
        status: 409,
        message: 'Cannot delete project with existing documents',
      };

      vi.mocked(httpClient.delete).mockRejectedValueOnce(apiError);

      await expect(deleteProject(projectId)).rejects.toEqual(apiError);
    });

    it('should throw error on deletion failure', async () => {
      const projectId: Uuid = '123e4567-e89b-12d3-a456-426614174000';

      const apiError = {
        status: 500,
        message: 'Failed to delete project',
      };

      vi.mocked(httpClient.delete).mockRejectedValueOnce(apiError);

      await expect(deleteProject(projectId)).rejects.toEqual(apiError);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete project lifecycle', async () => {
      // Create project
      const createRequest: ProjectCreateRequest = { name: 'Test Project' };
      const mockCreated: ProjectInfoResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Project',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        documentCount: 0,
      };
      vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockCreated });
      const created = await create(createRequest);
      expect(created.name).toBe('Test Project');

      // Get by ID
      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockCreated });
      const fetched = await getById(created.id!);
      expect(fetched.id).toBe(created.id);

      // Update
      const updateRequest: ProjectUpdateRequest = { name: 'Updated Project' };
      const mockUpdated: ProjectInfoResponse = { ...mockCreated, name: 'Updated Project' };
      vi.mocked(httpClient.put).mockResolvedValueOnce({ data: mockUpdated });
      const updated = await update(created.id!, updateRequest);
      expect(updated.name).toBe('Updated Project');

      // Get all
      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: [mockUpdated] });
      const all = await getAll();
      expect(all).toHaveLength(1);

      // Delete
      vi.mocked(httpClient.delete).mockResolvedValueOnce({ data: null });
      await deleteProject(created.id!);

      expect(httpClient.post).toHaveBeenCalledTimes(1);
      expect(httpClient.get).toHaveBeenCalledTimes(2);
      expect(httpClient.put).toHaveBeenCalledTimes(1);
      expect(httpClient.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple projects', async () => {
      // Create multiple projects
      const mockProjects: ProjectInfoResponse[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Project 1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          documentCount: 2,
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          name: 'Project 2',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          documentCount: 5,
        },
        {
          id: '323e4567-e89b-12d3-a456-426614174000',
          name: 'Project 3',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
          documentCount: 0,
        },
      ];

      vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockProjects });

      const result = await getAll();

      expect(result).toHaveLength(3);
      expect(result[0].documentCount).toBe(2);
      expect(result[1].documentCount).toBe(5);
      expect(result[2].documentCount).toBe(0);
    });
  });
});
