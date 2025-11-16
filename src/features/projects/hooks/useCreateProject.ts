/**
 * React Query hook for creating projects.
 *
 * Handles project creation with cache invalidation and error handling.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProjectInfoResponse, ProjectCreateRequest } from '@/services/api/generated/types.gen';
import { create } from '../services/project-api';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';

/**
 * Mutation hook for creating a new project.
 *
 * Automatically invalidates project list cache and shows success/error toasts.
 *
 * @returns Mutation result with mutate function and loading/error states
 *
 * @example
 * ```tsx
 * const { mutate: createProject, isPending } = useCreateProject();
 *
 * const handleSubmit = (name: string) => {
 *   createProject(
 *     { name },
 *     {
 *       onSuccess: (project) => {
 *         navigate(`/projects/${project.id}/documents`);
 *       }
 *     }
 *   );
 * };
 * ```
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ProjectInfoResponse, Error, ProjectCreateRequest>({
    mutationFn: create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success('Project created successfully');
    },
    onError: (error, variables) => {
      toast.error('Failed to create project', {
        description: error.message || 'Please try again.',
        action: {
          label: 'Retry',
          onClick: () => mutation.mutate(variables),
        },
      });
    },
  });

  return mutation;
};
