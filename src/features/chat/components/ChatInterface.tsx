/**
 * ChatInterface component combines message list, input, and manages chat state.
 *
 * Main chat UI component handling message flow and conversation management.
 */

import { useState } from 'react';
import type { SearchResult } from '@/services/api/generated/types.gen';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import { useChatSession } from '../hooks/useChatSession';
import { useSendChatMessage } from '../hooks/useSendChatMessage';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { Button } from '@/components/ui/button';

export interface ChatInterfaceProps {
  projectId: string;
}

/**
 * Complete chat interface with message history and input.
 *
 * Features:
 * - Message display with user/assistant distinction
 * - Source citations for responses
 * - Loading states during API calls
 * - Empty state with suggested questions
 * - Conversation history management (last 10 messages)
 * - New session button to clear history
 * - Token usage and model info display
 * - "No relevant information" message handling
 *
 * @param props - Component props
 * @param props.projectId - ID of the current project/workspace
 */
export const ChatInterface = ({ projectId }: ChatInterfaceProps) => {
  const { messages, addMessage, clearMessages, getHistory } = useChatSession();
  const { mutate: sendMessage, isPending } = useSendChatMessage();
  const showLoading = useDelayedLoading(isPending);
  const [currentSources, setCurrentSources] = useState<SearchResult[]>([]);
  const [tokenInfo, setTokenInfo] = useState<{
    model?: string;
    promptEvalCount?: number;
    evalCount?: number;
    totalDuration?: number;
  } | null>(null);

  const handleSend = (message: string) => {
    // Add user message immediately
    addMessage({ role: 'user', content: message });

    // Send to API with conversation history
    sendMessage(
      {
        projectId,
        message,
        history: getHistory(),
      },
      {
        onSuccess: (response) => {
          // Add assistant response
          const assistantMessage = response.response || 'No relevant information found.';
          addMessage({ role: 'assistant', content: assistantMessage });

          // Update sources and token info
          setCurrentSources(response.sources || []);
          setTokenInfo({
            model: response.model,
            promptEvalCount: response.promptEvalCount,
            evalCount: response.evalCount,
            totalDuration: response.totalDuration,
          });
        },
        onError: () => {
          // Add error message as assistant response
          addMessage({
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
          });
        },
      }
    );
  };

  const handleNewSession = () => {
    clearMessages();
    setCurrentSources([]);
    setTokenInfo(null);
  };

  const handleSuggestionClick = (question: string) => {
    handleSend(question);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with new session button */}
      <div className="border-b bg-background p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Chat</h1>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleNewSession}>
            New Session
          </Button>
        )}
      </div>

      {/* Messages area */}
      {messages.length === 0 ? (
        <EmptyState onSuggestionClick={handleSuggestionClick} />
      ) : (
        <ChatMessageList
          messages={messages}
          sources={currentSources}
          isLoading={showLoading}
        />
      )}

      {/* Token info footer */}
      {tokenInfo && (
        <div className="border-t bg-muted/50 px-4 py-2">
          <div className="text-xs text-muted-foreground flex gap-4">
            {tokenInfo.model && <span>Model: {tokenInfo.model}</span>}
            {tokenInfo.promptEvalCount !== undefined && (
              <span>Prompt: {tokenInfo.promptEvalCount} tokens</span>
            )}
            {tokenInfo.evalCount !== undefined && (
              <span>Response: {tokenInfo.evalCount} tokens</span>
            )}
            {tokenInfo.totalDuration !== undefined && (
              <span>Time: {(tokenInfo.totalDuration / 1e9).toFixed(2)}s</span>
            )}
          </div>
        </div>
      )}

      {/* Input area */}
      <ChatInput onSend={handleSend} disabled={isPending} />
    </div>
  );
};
