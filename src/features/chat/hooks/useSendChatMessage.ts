/**
 * React Query hook for sending chat messages with optimistic updates.
 *
 * Handles chat message submission with immediate UI feedback and error recovery.
 */

import { useMutation } from '@tanstack/react-query';
import type { ChatRequest, ChatResponse } from '@/services/api/generated/types.gen';
import { sendMessage } from '../services/chat-api';
import { toast } from 'sonner';

/**
 * Mutation hook for sending chat messages with optimistic updates.
 *
 * Provides immediate feedback to users while waiting for the backend response.
 * Automatically shows error toasts on failure with retry button.
 *
 * @returns Mutation result with mutate function and loading/error states
 *
 * @example
 * ```tsx
 * const { mutate: sendChatMessage, isPending } = useSendChatMessage();
 *
 * sendChatMessage(
 *   { projectId: '123', message: 'What is RAG?', history: [] },
 *   {
 *     onSuccess: (response) => {
 *       console.log('Answer:', response.response);
 *     }
 *   }
 * );
 * ```
 */
export const useSendChatMessage = () => {
  const mutation = useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: sendMessage,
    onError: (error, variables) => {
      toast.error('Failed to send message', {
        description: error.message || 'Unable to get a response. Please try again.',
        action: {
          label: 'Retry',
          onClick: () => mutation.mutate(variables),
        },
      });
    },
  });

  return mutation;
};
