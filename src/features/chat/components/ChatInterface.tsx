/**
 * ChatInterface component combines message list, input, and manages chat state.
 *
 * Main chat UI component handling message flow and conversation management.
 */

import { useState, useMemo } from 'react';
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
 * - Loading states during API calls
 * - Empty state with suggested questions
 * - Conversation history management (last 10 messages)
 * - New session button to clear history
 * - "No relevant information" message handling
 * - Citation tooltips for source references
 *
 * @param props - Component props
 * @param props.projectId - ID of the current project/workspace
 */
export const ChatInterface = ({ projectId }: ChatInterfaceProps) => {
  const { messages, addMessage, clearMessages, getHistory } = useChatSession();
  const { mutate: sendMessage, isPending } = useSendChatMessage();
  const showLoading = useDelayedLoading(isPending);
  const [sourcesData, setSourcesData] = useState<SearchResult[]>([]);

  // Create a map of source IDs to source data for quick lookup
  const sourcesMap = useMemo(() => {
    const map = new Map<string, SearchResult>();
    sourcesData.forEach((source) => {
      if (source.id) {
        map.set(source.id.toLowerCase(), source);
      }
    });
    return map;
  }, [sourcesData]);

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
          
          // Store sources for citation lookup
          if (response.sources) {
            setSourcesData(response.sources);
          }
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
    setSourcesData([]);
  };

  const handleSuggestionClick = (question: string) => {
    handleSend(question);
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Header with new session button */}
      <div className="border-b bg-background p-3 md:p-4 flex justify-between items-center flex-shrink-0">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold">Chat</h1>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleNewSession} className="h-9 md:h-8 text-sm">
            <span className="hidden sm:inline">New Session</span>
            <span className="sm:hidden">New</span>
          </Button>
        )}
      </div>

      {/* Messages area - grows to fill available space */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={handleSuggestionClick} />
        ) : (
          <ChatMessageList
            messages={messages}
            isLoading={showLoading}
            sources={sourcesMap}
          />
        )}
      </div>

      {/* Input area - stays at bottom */}
      <div className="flex-shrink-0">
        <ChatInput onSend={handleSend} disabled={isPending} />
      </div>
    </div>
  );
};
