/**
 * Citation component displays a citation marker with tooltip showing source details.
 *
 * Citations appear as superscript numbers that show source information on hover.
 */

import type { SearchResult } from '@/services/api/generated/types.gen';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface CitationProps {
  id: string;
  source: SearchResult | undefined;
  index: number;
}

/**
 * Displays a citation marker with hover tooltip.
 *
 * Shows source document name, full chunk text content, and similarity score on hover.
 * Tooltip is scrollable for long content.
 *
 * @param props - Component props
 * @param props.id - UUID of the citation source
 * @param props.source - Source result data from the API
 * @param props.index - Display index for the citation number
 */
export const Citation = ({ id, source, index }: CitationProps) => {
  if (!source) {
    // Fallback for missing sources - still show the citation but with ID only
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <sup className="cursor-help text-blue-400 hover:text-blue-300 mx-0.5 text-xs">
              [{index}]
            </sup>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[calc(100vw-2rem)] sm:max-w-sm">
            <div className="text-xs">
              <p className="font-semibold mb-1">Source ID</p>
              <p className="text-muted-foreground font-mono text-[10px] break-all">{id}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const similarityScore = source.distance !== undefined 
    ? ((1 - source.distance) * 100).toFixed(1) 
    : 'N/A';

  // Clean up source name by removing chunk information (e.g., " - chunk 21")
  const cleanSourceName = (sourceName: string): string => {
    return sourceName.replace(/\s*-\s*chunk\s+\d+$/i, '').trim();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <sup className="cursor-help text-blue-400 hover:text-blue-300 mx-0.5 text-xs">
            [{index}]
          </sup>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[50vh] sm:max-h-96 overflow-y-auto">
          <div className="text-xs space-y-2">
            <div>
              <p className="font-semibold mb-1">Source</p>
              <p className="text-muted-foreground break-words">
                {source.source ? cleanSourceName(source.source) : 'Unknown'}
              </p>
            </div>
            
            {source.chunkText && (
              <div>
                <p className="font-semibold mb-1">Content</p>
                <p className="text-muted-foreground whitespace-pre-wrap break-words">
                  {source.chunkText}
                </p>
              </div>
            )}
            
            <div className="pt-1 border-t border-border">
              <span className="text-[10px] text-muted-foreground">
                Similarity: {similarityScore}%
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
