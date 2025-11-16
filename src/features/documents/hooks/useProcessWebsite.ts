/**
 * React Query hook for processing website URLs as documents.
 *
 * Handles website scraping and processing with cache invalidation and error handling.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { documentApi } from '../services/document-api'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'

/**
 * Mutation hook for processing a website URL as a document.
 *
 * Scrapes website content and adds it to the project's knowledge base.
 * Automatically invalidates document cache and shows success/error toasts.
 *
 * @returns Mutation result with mutate function and loading/error states
 *
 * @example
 * ```tsx
 * const { mutate: processWebsite, isPending } = useProcessWebsite();
 *
 * const handleSubmit = (url: string) => {
 *   processWebsite(
 *     { url, projectId: currentProjectId },
 *     {
 *       onSuccess: () => {
 *         console.log('Website added to knowledge base');
 *       }
 *     }
 *   );
 * };
 * ```
 */
export function useProcessWebsite() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ url, projectId }: { url: string; projectId: string }) =>
      documentApi.processWebsite(url, projectId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.documents(projectId) })
      toast.success('Website processed successfully')
    },
    onError: (error: Error, variables) => {
      toast.error(error.message || 'Failed to process website', {
        action: {
          label: 'Retry',
          onClick: () => mutation.mutate(variables),
        },
      })
    },
  })

  return mutation
}
