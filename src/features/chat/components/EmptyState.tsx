/**
 * EmptyState component for new chat sessions with suggested questions.
 *
 * Provides helpful starting prompts for users beginning a conversation.
 */

import { Card } from '@/components/ui/card';

export interface EmptyStateProps {
  onSuggestionClick?: (question: string) => void;
}

const SUGGESTED_QUESTIONS = [
  'What are the key points in the uploaded documents?',
  'Can you summarize the main topics?',
  'What information is available about [specific topic]?',
  'How are these concepts related?',
];

/**
 * Empty state display for new chat sessions.
 *
 * Shows welcome message and suggested questions to help users get started.
 * Optionally allows clicking suggestions to auto-fill the input.
 *
 * @param props - Component props
 * @param props.onSuggestionClick - Optional callback when a suggested question is clicked
 */
export const EmptyState = ({ onSuggestionClick }: EmptyStateProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full space-y-4 md:space-y-6 lg:space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">Start a Conversation</h2>
          <p className="text-sm md:text-base text-muted-foreground px-2">
            Ask questions about your uploaded documents and get answers with source citations.
          </p>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold text-muted-foreground px-2">
            Try asking:
          </div>
          <div className="grid gap-2">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <Card
                key={index}
                className="p-3 md:p-4 cursor-pointer hover:bg-accent transition-colors active:scale-[0.98]"
                onClick={() => onSuggestionClick?.(question)}
              >
                <p className="text-sm md:text-base">{question}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
