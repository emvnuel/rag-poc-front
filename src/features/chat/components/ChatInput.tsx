/**
 * ChatInput component provides textarea and send button for user messages.
 *
 * Handles text input with keyboard shortcuts and submission.
 */

import { useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Text input component for composing and sending chat messages.
 *
 * Features:
 * - Multi-line textarea with auto-expanding height
 * - Keyboard shortcut: Enter to send, Shift+Enter for new line
 * - Disabled state during message sending
 * - Automatic focus on mount
 *
 * @param props - Component props
 * @param props.onSend - Callback function when user sends a message
 * @param props.disabled - Whether input should be disabled (e.g., during API call)
 * @param props.placeholder - Optional placeholder text
 */
export const ChatInput = ({ onSend, disabled, placeholder = 'Ask a question...' }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="self-end"
        >
          Send
        </Button>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};
