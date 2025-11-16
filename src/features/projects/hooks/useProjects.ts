/**
 * React Query hook for fetching all projects.
 *
 * Provides cached access to the user's project list with automatic refetching.
 */

import { useQuery } from '@tanstack/react-query';
import type { ProjectInfoResponse } from '@/services/api/generated/types.gen';
import { getAll } from '../services/project-api';
import { queryKeys } from '@/lib/query-keys';

/**
 * Query hook for fetching all projects.
 *
 * Automatically caches project list and refetches when stale.
 * Useful for project selection dropdowns and project list pages.
 *
 * @returns Query result with projects array and loading/error states
 *
 * @example
 * ```tsx
 * const { data: projects, isLoading, error } = useProjects();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return projects.map(project => <ProjectCard key={project.id} project={project} />);
 * ```
 */
export const useProjects = () => {
  return useQuery<ProjectInfoResponse[], Error>({
    queryKey: queryKeys.projects.all,
    queryFn: getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
