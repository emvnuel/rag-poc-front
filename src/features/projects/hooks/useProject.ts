/**
 * React Query hook for fetching a single project.
 *
 * Provides cached access to project details with automatic refetching.
 */

import { useQuery } from '@tanstack/react-query';
import type { ProjectInfoResponse, Uuid } from '@/services/api/generated/types.gen';
import { getById } from '../services/project-api';
import { queryKeys } from '@/lib/query-keys';

/**
 * Query hook for fetching a single project by ID.
 *
 * Automatically caches project data and refetches when stale.
 * Only executes query when projectId is provided.
 *
 * @param projectId - Project UUID to fetch
 * @returns Query result with project data and loading/error states
 *
 * @example
 * ```tsx
 * const { data: project, isLoading } = useProject(projectId);
 *
 * if (isLoading) return <Skeleton />;
 * return <h1>{project?.name}</h1>;
 * ```
 */
export const useProject = (projectId: Uuid | undefined) => {
  return useQuery<ProjectInfoResponse, Error>({
    queryKey: queryKeys.projects.detail(projectId!),
    queryFn: () => getById(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
