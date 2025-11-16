/**
 * SourceCitation component displays source documents as expandable cards.
 *
 * Shows document sources with similarity scores and relevant text chunks.
 */

import type { SearchResult } from '@/services/api/generated/types.gen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface SourceCitationProps {
  sources: SearchResult[];
}

/**
 * Displays source citations as cards with document information and similarity scores.
 *
 * Each source shows:
 * - Document filename/source
 * - Relevant text chunk
 * - Similarity score (distance metric)
 * - Chunk index
 *
 * @param props - Component props
 * @param props.sources - Array of search results to display as citations
 */
export const SourceCitation = ({ sources }: SourceCitationProps) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="text-sm font-semibold text-muted-foreground">
        Sources ({sources.length})
      </div>
      <div className="space-y-2">
        {sources.map((source, index) => (
          <Card key={source.id || index} className="text-sm">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm font-medium truncate">
                  {source.source || 'Unknown source'}
                </CardTitle>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    Chunk {source.chunkIndex ?? 0}
                  </Badge>
                  {source.distance !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {(1 - source.distance).toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-muted-foreground line-clamp-3">
                {source.chunkText}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
