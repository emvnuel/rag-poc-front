/**
 * ChatMessage component displays individual user and assistant messages.
 *
 * Differentiates between user and assistant messages with different styling and alignment.
 */

import type { ChatMessage as ChatMessageType } from '@/services/api/generated/types.gen';
import { cn } from '@/lib/utils';

export interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Displays a single chat message with appropriate styling based on role.
 *
 * User messages are right-aligned with blue background.
 * Assistant messages are left-aligned with gray background.
 *
 * @param props - Component props
 * @param props.message - Chat message object with role and content
 */
export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
};
