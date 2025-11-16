/**
 * React Query hook for deleting documents.
 *
 * Handles document deletion with cache invalidation and error handling.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { documentApi } from '../services/document-api'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'

/**
 * Mutation hook for deleting a document.
 *
 * Automatically invalidates project documents cache and shows success/error toasts.
 * Provides retry functionality on failure.
 *
 * @returns Mutation result with mutate function and loading/error states
 *
 * @example
 * ```tsx
 * const { mutate: deleteDocument, isPending } = useDeleteDocument();
 *
 * const handleDelete = (documentId: string) => {
 *   deleteDocument(documentId, {
 *     onSuccess: () => {
 *       console.log('Document deleted');
 *     }
 *   });
 * };
 * ```
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => documentApi.delete(id),
    onSuccess: () => {
      // Invalidate all project documents queries
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      toast.success('Document deleted successfully')
    },
    onError: (error: Error, variables) => {
      toast.error(error.message || 'Failed to delete document', {
        action: {
          label: 'Retry',
          onClick: () => mutation.mutate(variables),
        },
      })
    },
  })

  return mutation
}
