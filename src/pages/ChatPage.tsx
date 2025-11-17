/**
 * ChatPage - Main page for the chat interface.
 *
 * Integrates ChatInterface with workspace context and routing.
 */

import { useParams } from 'react-router-dom';
import { ChatInterface } from '@/features/chat/components/ChatInterface';

/**
 * Page component for the chat interface.
 *
 * Extracts project ID from route params and passes to ChatInterface.
 * Shows error state if no project ID is present.
 */
export const ChatPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">No Project Selected</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Please select a project from the workspace selector to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return <ChatInterface projectId={projectId} />;
};
