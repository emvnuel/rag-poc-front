/**
 * EmptyState component for new chat sessions with suggested questions.
 *
 * Provides helpful starting prompts for users beginning a conversation.
 */

import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';

export interface EmptyStateProps {
  onSuggestionClick?: (question: string) => void;
}

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
  const { t } = useTranslation();

  const suggestedQuestions = [
    t('chatEmptyState.suggestion1'),
    t('chatEmptyState.suggestion2'),
    t('chatEmptyState.suggestion3'),
    t('chatEmptyState.suggestion4'),
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full space-y-4 md:space-y-6 lg:space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">{t('chatEmptyState.title')}</h2>
          <p className="text-sm md:text-base text-muted-foreground px-2">
            {t('chatEmptyState.description')}
          </p>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold text-muted-foreground px-2">
            {t('chatEmptyState.tryAsking')}
          </div>
          <div className="grid gap-2">
            {suggestedQuestions.map((question, index) => (
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
