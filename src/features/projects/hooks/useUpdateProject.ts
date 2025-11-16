/**
 * React Query hook for updating projects.
 *
 * Handles project updates with cache invalidation and error handling.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProjectInfoResponse, ProjectUpdateRequest, Uuid } from '@/services/api/generated/types.gen';
import { update } from '../services/project-api';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';

/**
 * Mutation hook for updating an existing project.
 *
 * Automatically invalidates affected cache entries and shows success/error toasts.
 *
 * @returns Mutation result with mutate function and loading/error states
 *
 * @example
 * ```tsx
 * const { mutate: updateProject, isPending } = useUpdateProject();
 *
 * const handleUpdate = (id: string, name: string) => {
 *   updateProject({ id, data: { name } });
 * };
 * ```
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ProjectInfoResponse,
    Error,
    { id: Uuid; data: ProjectUpdateRequest }
  >({
    mutationFn: ({ id, data }) => update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.id) });
      toast.success('Project updated successfully');
    },
    onError: (error, variables) => {
      toast.error('Failed to update project', {
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
