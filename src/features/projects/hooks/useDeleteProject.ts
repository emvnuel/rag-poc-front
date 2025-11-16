/**
 * React Query hook for deleting projects.
 *
 * Handles project deletion with cache invalidation and error handling.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Uuid } from '@/services/api/generated/types.gen';
import { deleteProject } from '../services/project-api';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';

/**
 * Mutation hook for deleting a project.
 *
 * Automatically invalidates project list cache and shows success/error toasts.
 * Removes all related cached data for the deleted project.
 *
 * @returns Mutation result with mutate function and loading/error states
 *
 * @example
 * ```tsx
 * const { mutate: deleteProject, isPending } = useDeleteProject();
 *
 * const handleDelete = (id: string) => {
 *   deleteProject(id, {
 *     onSuccess: () => {
 *       navigate('/');
 *     }
 *   });
 * };
 * ```
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, Uuid>({
    mutationFn: deleteProject,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(projectId) });
      queryClient.removeQueries({ queryKey: queryKeys.projects.documents(projectId) });
      toast.success('Project deleted successfully');
    },
    onError: (error, variables) => {
      toast.error('Failed to delete project', {
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
