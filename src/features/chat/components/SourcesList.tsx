/**
 * SourcesList component displays document sources for chat responses.
 *
 * Shows list of source documents with metadata for desktop sidebar.
 */

import type { SearchResult } from '@/services/api/generated/types.gen';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

export interface SourcesListProps {
  sources: SearchResult[];
  className?: string;
}

/**
 * Displays a list of source documents from chat responses.
 *
 * Features:
 * - Document title with file icon
 * - Distance/relevance badge
 * - Chunk excerpt preview
 * - Responsive card layout
 *
 * @param props - Component props
 * @param props.sources - Array of source documents
 * @param props.className - Optional className for styling
 */
export function SourcesList({ sources, className }: SourcesListProps) {
  if (sources.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">
          No sources available yet. Ask a question to see relevant documents.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <Card key={source.id || index} className="p-3">
            <CardHeader className="p-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <CardTitle className="text-sm font-medium truncate">
                    {source.source || 'Untitled Document'}
                  </CardTitle>
                </div>
                {source.distance !== undefined && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {source.distance.toFixed(2)}
                  </Badge>
                )}
              </div>
              {source.chunkIndex !== undefined && (
                <CardDescription className="text-xs">
                  Chunk {source.chunkIndex + 1}
                </CardDescription>
              )}
            </CardHeader>
            {source.chunkText && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                {source.chunkText}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
