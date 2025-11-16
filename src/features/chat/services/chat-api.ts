/**
 * Chat API service for sending messages and receiving responses with source citations.
 *
 * Handles chat interactions with the RAG backend, including conversation history management.
 */

import type { ChatRequest, ChatResponse } from '@/services/api/generated/types.gen';
import { httpClient } from '@/services/http/client';

/**
 * Sends a chat message to the backend and receives a response with sources.
 *
 * @param data - Chat request containing project ID, message, and optional history
 * @returns Promise resolving to chat response with answer and source citations
 * @throws Error if the API request fails
 */
export const sendMessage = async (data: ChatRequest): Promise<ChatResponse> => {
  const response = await httpClient.post<ChatResponse>('/chat', data);
  return response.data;
};
