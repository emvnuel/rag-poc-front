/**
 * React Query hook for uploading files with progress tracking.
 *
 * Handles file uploads with simulated progress updates and cache invalidation.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { documentApi } from '../services/document-api'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'
import { useState } from 'react'

/**
 * Mutation hook for uploading files to a project.
 *
 * Provides progress tracking (0-100) during upload and automatically
 * invalidates document cache on success. Shows success/error toasts.
 *
 * @returns Mutation result with mutate function, loading/error states, and progress percentage
 *
 * @example
 * ```tsx
 * const { mutate: uploadFile, isPending, progress } = useUploadFile();
 *
 * const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0];
 *   if (file) {
 *     uploadFile({ file, projectId: currentProjectId });
 *   }
 * };
 *
 * // Show progress
 * {isPending && <ProgressBar value={progress} />}
 * ```
 */
export function useUploadFile() {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState(0)

  const mutation = useMutation({
    mutationFn: async ({ file, projectId }: { file: File; projectId: string }) => {
      setProgress(0)
      // Simulate progress - in production this would use axios onUploadProgress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      try {
        await documentApi.uploadFile(file, projectId)
        setProgress(100)
        clearInterval(progressInterval)
      } catch (error) {
        clearInterval(progressInterval)
        throw error
      }
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.documents(projectId) })
      toast.success('File uploaded successfully')
      setProgress(0)
    },
    onError: (error: Error, variables) => {
      toast.error(error.message || 'Failed to upload file', {
        action: {
          label: 'Retry',
          onClick: () => mutation.mutate(variables),
        },
      })
      setProgress(0)
    },
  })

  return { ...mutation, progress }
}
