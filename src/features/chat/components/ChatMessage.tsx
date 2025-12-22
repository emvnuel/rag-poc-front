/**
 * ChatMessage component displays individual user and assistant messages.
 *
 * Differentiates between user and assistant messages with different styling and alignment.
 * Assistant messages support markdown formatting with syntax highlighting and citation tooltips.
 */

import React, { useMemo } from 'react';
import type { ChatMessage as ChatMessageType, SearchResult } from '@/services/api/generated/types.gen';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { Citation } from './Citation';

export interface ChatMessageProps {
  message: ChatMessageType;
  sources?: Map<string, SearchResult>;
}

interface CitationData {
  uuid: string;
  number: number;
}

/**
 * Parse and replace citations in content with placeholder markers.
 * Returns cleaned content and citation data for rendering.
 */
const processContent = (content: string): { processedContent: string; citations: CitationData[] } => {
  const citationMap = new Map<string, number>();
  const citations: CitationData[] = [];
  let citationIndex = 1;
  
  // Match UUIDs in square brackets format: [uuid]
  const uuidPattern = /\[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]/gi;
  
  // Replace UUIDs with numbered placeholders and collect citation data
  const processedContent = content.replace(uuidPattern, (_match, uuid) => {
    const lowerUuid = uuid.toLowerCase();
    
    if (!citationMap.has(lowerUuid)) {
      citationMap.set(lowerUuid, citationIndex);
      citations.push({ uuid: lowerUuid, number: citationIndex });
      citationIndex++;
    }
    
    const number = citationMap.get(lowerUuid)!;
    // Use a marker that won't be processed by markdown - using special unicode character
    return `§§CITE§${number}§${lowerUuid}§§`;
  });
  
  return { processedContent, citations };
};

/**
 * Process React children recursively to find and replace citation markers with Citation components.
 */
const processChildren = (
  children: React.ReactNode,
  sources?: Map<string, SearchResult>
): React.ReactNode => {
  return React.Children.map(children, (child) => {
    // If it's a string, check for citation markers
    if (typeof child === 'string') {
      // Updated pattern to match the new marker format
      const citationPattern = /§§CITE§(\d+)§([0-9a-f-]+)§§/g;
      const hasCitations = citationPattern.test(child);
      
      if (hasCitations) {
        // Reset regex lastIndex
        citationPattern.lastIndex = 0;
        
        const parts: (string | React.ReactElement)[] = [];
        let lastIndex = 0;
        let match;
        
        while ((match = citationPattern.exec(child)) !== null) {
          // Add text before citation
          if (match.index > lastIndex) {
            parts.push(child.substring(lastIndex, match.index));
          }
          
          // Add citation component
          const citationNumber = parseInt(match[1], 10);
          const uuid = match[2];
          const source = sources?.get(uuid);
          
          parts.push(
            <Citation 
              key={`${uuid}-${match.index}`}
              id={uuid}
              source={source}
              index={citationNumber}
            />
          );
          
          lastIndex = citationPattern.lastIndex;
        }
        
        // Add remaining text
        if (lastIndex < child.length) {
          parts.push(child.substring(lastIndex));
        }
        
        return <React.Fragment key="citations">{parts}</React.Fragment>;
      }
      
      return child;
    }
    
    // If it's a React element, recursively process its children
    if (React.isValidElement(child) && child.props && typeof child.props === 'object' && 'children' in child.props) {
      const childProps = child.props as { children?: React.ReactNode };
      return React.cloneElement(
        child,
        child.props as object,
        processChildren(childProps.children, sources)
      );
    }
    
    return child;
  });
};

/**
 * Displays a single chat message with appropriate styling based on role.
 *
 * User messages are right-aligned with blue background and plain text.
 * Assistant messages are left-aligned with gray background and markdown rendering.
 * Supports tables, code blocks with syntax highlighting, lists, citations, and other markdown features.
 *
 * @param props - Component props
 * @param props.message - Chat message object with role and content
 * @param props.sources - Map of source IDs to source data for citation tooltips
 */
export const ChatMessage = ({ message, sources }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  
  // Process content to replace UUIDs with citation markers
  const { processedContent } = useMemo(
    () => processContent(message.content || ''),
    [message.content]
  );

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
        {isUser ? (
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : (
          <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-pre:bg-background prose-pre:text-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Style code blocks
                pre: ({ children, ...props }) => (
                  <pre className="overflow-x-auto rounded-md bg-zinc-100 dark:bg-zinc-950 p-4 text-sm" {...props}>
                    {children}
                  </pre>
                ),
                // Style inline code
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1 py-0.5 text-sm" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                // Style links
                a: ({ children, ...props }) => (
                  <a className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline" {...props}>
                    {children}
                  </a>
                ),
                // Style tables
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="border-collapse border border-border w-full" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children, ...props }) => (
                  <th className="border border-border px-4 py-2 bg-muted font-semibold text-left" {...props}>
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td className="border border-border px-4 py-2" {...props}>
                    {children}
                  </td>
                ),
                // Style lists - process children to replace citation markers
                ul: ({ children, ...props }) => (
                  <ul className="list-disc pl-5 space-y-1 my-2 [&_ul]:mt-1 [&_ul]:mb-0 [&_ol]:mt-1 [&_ol]:mb-0" {...props}>
                    {processChildren(children, sources)}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol className="list-decimal pl-5 space-y-1 my-2 [&_ul]:mt-1 [&_ul]:mb-0 [&_ol]:mt-1 [&_ol]:mb-0" {...props}>
                    {processChildren(children, sources)}
                  </ol>
                ),
                // Style paragraphs - process children to replace citation markers
                p: ({ children, ...props }) => (
                  <p className="my-2" {...props}>
                    {processChildren(children, sources)}
                  </p>
                ),
                // Style headings - process children to replace citation markers
                h1: ({ children, ...props }) => (
                  <h1 className="text-xl font-bold mt-4 mb-2" {...props}>
                    {processChildren(children, sources)}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2 className="text-lg font-bold mt-3 mb-2" {...props}>
                    {processChildren(children, sources)}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3 className="text-base font-bold mt-2 mb-1" {...props}>
                    {processChildren(children, sources)}
                  </h3>
                ),
                // Style blockquotes - process children to replace citation markers
                blockquote: ({ children, ...props }) => (
                  <blockquote className="border-l-4 border-border pl-4 italic my-2" {...props}>
                    {processChildren(children, sources)}
                  </blockquote>
                ),
                // Process list items
                li: ({ children, ...props }) => (
                  <li {...props}>
                    {processChildren(children, sources)}
                  </li>
                ),
              }}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
