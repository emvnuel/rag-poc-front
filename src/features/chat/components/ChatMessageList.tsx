/**
 * ChatMessageList component renders conversation history with auto-scroll.
 *
 * Displays all messages in chronological order with automatic scroll to bottom.
 */

import { useEffect, useRef, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ChatMessage as ChatMessageType, SearchResult } from '@/services/api/generated/types.gen';
import { ChatMessage } from './ChatMessage';
import { SourceCitation } from './SourceCitation';

export interface ChatMessageListProps {
  messages: ChatMessageType[];
  sources?: SearchResult[];
  isLoading?: boolean;
}

/**
 * Displays the full conversation history with automatic scroll to bottom.
 *
 * Shows user and assistant messages with source citations after assistant responses.
 * Automatically scrolls to show the latest message when new messages arrive.
 *
 * @param props - Component props
 * @param props.messages - Array of chat messages to display
 * @param props.sources - Optional array of source citations for the latest response
 * @param props.isLoading - Whether a response is currently being loaded
 */
export const ChatMessageList = memo(function ChatMessageList({ messages, sources, isLoading }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Use virtual scrolling for large message lists (>50 messages)
  const useVirtualScrolling = messages.length > 50;
  
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual is intentionally used for performance optimization with large lists
  const rowVirtualizer = useVirtualizer({
    count: useVirtualScrolling ? messages.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated height of each message
    overscan: 10, // Render 10 extra items above/below viewport for smooth scrolling
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!useVirtualScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (parentRef.current) {
      // For virtual scrolling, scroll to bottom of container
      parentRef.current.scrollTop = parentRef.current.scrollHeight;
    }
  }, [messages, isLoading, useVirtualScrolling]);

  // Render with virtual scrolling for large lists
  if (useVirtualScrolling) {
    return (
      <div ref={parentRef} className="flex-1 overflow-y-auto p-4" style={{ contain: 'strict' }}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const message = messages[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="pb-4">
                  <ChatMessage message={message} />
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse text-sm text-muted-foreground">
                    Thinking...
                  </div>
                </div>
              </div>
            </div>
          )}

          {sources && sources.length > 0 && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[80%]">
                <SourceCitation sources={sources} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard layout for smaller message lists (≤50 messages)
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}

      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
            <div className="flex items-center gap-2">
              <div className="animate-pulse text-sm text-muted-foreground">
                Thinking...
              </div>
            </div>
          </div>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div className="flex justify-start mb-4">
          <div className="max-w-[80%]">
            <SourceCitation sources={sources} />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
});
