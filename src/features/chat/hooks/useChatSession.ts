/**
 * React hook for managing client-side chat session state.
 *
 * Provides conversation history management with automatic context window management.
 */

import { useState, useCallback } from 'react';
import type { ChatMessage } from '@/services/api/generated/types.gen';

/**
 * Maximum number of messages to include in conversation history.
 * Prevents token limit issues while maintaining relevant context.
 */
const MAX_HISTORY_LENGTH = 10;

export interface ChatSessionState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  getHistory: () => ChatMessage[];
}

/**
 * Hook for managing chat session state including message history.
 *
 * Automatically manages conversation context window (last 10 messages)
 * to prevent token limit issues while maintaining relevant context.
 *
 * @returns Chat session state and control functions
 *
 * @example
 * ```tsx
 * const { messages, addMessage, clearMessages, getHistory } = useChatSession();
 *
 * // Add user message
 * addMessage({ role: 'user', content: 'What is RAG?' });
 *
 * // Get history for API request (last 10 messages)
 * const history = getHistory();
 *
 * // Clear all messages
 * clearMessages();
 * ```
 */
export const useChatSession = (): ChatSessionState => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const getHistory = useCallback((): ChatMessage[] => {
    // Return last N messages for context, excluding the current message being sent
    return messages.slice(-MAX_HISTORY_LENGTH);
  }, [messages]);

  return {
    messages,
    addMessage,
    clearMessages,
    getHistory,
  };
};
