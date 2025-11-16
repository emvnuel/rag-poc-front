/**
 * React Query hook for processing raw text as documents.
 *
 * Handles text processing with cache invalidation and error handling.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { documentApi } from '../services/document-api'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'

/**
 * Mutation hook for processing raw text as a document.
 *
 * Converts text into a searchable document in the project's knowledge base.
 * Automatically invalidates document cache and shows success/error toasts.
 *
 * @returns Mutation result with mutate function and loading/error states
 *
 * @example
 * ```tsx
 * const { mutate: processText, isPending } = useProcessText();
 *
 * const handleSubmit = (text: string) => {
 *   processText(
 *     { text, projectId: currentProjectId },
 *     {
 *       onSuccess: () => {
 *         console.log('Text added to knowledge base');
 *       }
 *     }
 *   );
 * };
 * ```
 */
export function useProcessText() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ text, projectId }: { text: string; projectId: string }) =>
      documentApi.processText(text, projectId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.documents(projectId) })
      toast.success('Text processed successfully')
    },
    onError: (error: Error, variables) => {
      toast.error(error.message || 'Failed to process text', {
        action: {
          label: 'Retry',
          onClick: () => mutation.mutate(variables),
        },
      })
    },
  })

  return mutation
}
