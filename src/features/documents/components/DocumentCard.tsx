import { FileText, Globe, File, Trash2, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DocumentStatusBadge } from './DocumentStatusBadge'
import type { Document, DocumentType } from '@/types/document'
import { cn } from '@/lib/utils'

interface DocumentCardProps {
  document: Document
  isSelected?: boolean
  onSelect?: (documentId: string, selected: boolean) => void
  onView?: (document: Document) => void
  onDelete?: (document: Document) => void
  searchQuery?: string
}

/**
 * Card component displaying individual document with metadata
 * Supports multi-select for bulk operations
 */
export function DocumentCard({ 
  document, 
  isSelected = false,
  onSelect,
  onView, 
  onDelete,
  searchQuery 
}: DocumentCardProps) {
  const getTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'FILE':
        return 'File'
      case 'TEXT':
        return 'Text'
      case 'WEBSITE':
        return 'Website'
    }
  }

  const renderTypeIcon = () => {
    switch (document.type) {
      case 'FILE':
        return <File className="h-5 w-5" />
      case 'TEXT':
        return <FileText className="h-5 w-5" />
      case 'WEBSITE':
        return <Globe className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  /**
   * Highlights search query matches in text
   * Returns text with <mark> tags around matches
   */
  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) {
      return text
    }

    const parts: React.ReactNode[] = []
    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    let lastIndex = 0
    let matchIndex = lowerText.indexOf(lowerQuery)

    while (matchIndex !== -1) {
      // Add text before match
      if (matchIndex > lastIndex) {
        parts.push(text.slice(lastIndex, matchIndex))
      }

      // Add highlighted match
      const matchText = text.slice(matchIndex, matchIndex + query.length)
      parts.push(
        <mark key={matchIndex} className="bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded">
          {matchText}
        </mark>
      )

      lastIndex = matchIndex + query.length
      matchIndex = lowerText.indexOf(lowerQuery, lastIndex)
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts
  }

  const getFileSize = (): string | null => {
    try {
      const meta = JSON.parse(document.metadata)
      const bytes = meta.size_bytes || meta.sizeBytes
      return bytes ? formatFileSize(bytes) : null
    } catch {
      return null
    }
  }

  const fileSize = getFileSize()

  return (
    <Card className={cn(
      "p-3 md:p-4 hover:shadow-md transition-shadow",
      isSelected && "ring-2 ring-primary"
    )}>
      <div className="flex items-start gap-2 md:gap-3">
        {onSelect && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked: boolean) => onSelect(document.id, checked)}
            aria-label={`Select ${document.fileName}`}
            className="mt-1"
          />
        )}
        <div className={cn(
          'p-2 rounded-lg flex-shrink-0',
          'bg-primary/10 text-primary'
        )}>
          {renderTypeIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-sm md:text-base truncate" title={document.fileName}>
              {searchQuery ? highlightText(document.fileName, searchQuery) : document.fileName}
            </h3>
            <DocumentStatusBadge status={document.status} />
          </div>

          <div className="flex flex-col gap-1 text-xs md:text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-muted rounded text-xs">
                {getTypeLabel(document.type)}
              </span>
              {fileSize && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-xs">{fileSize}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span title={`Created: ${document.createdAt}`} className="text-xs">
                Created {formatDate(document.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span title={`Updated: ${document.updatedAt}`} className="text-xs">
                Updated {formatDate(document.updatedAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(document)}
                className="h-11 sm:h-8 text-sm sm:text-xs justify-start sm:justify-center"
              >
                <Eye className="h-4 w-4 sm:h-3 sm:w-3 mr-2 sm:mr-1" />
                View Details
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(document)}
                className="h-11 sm:h-8 text-sm sm:text-xs text-destructive hover:text-destructive hover:bg-destructive/10 justify-start sm:justify-center"
              >
                <Trash2 className="h-4 w-4 sm:h-3 sm:w-3 mr-2 sm:mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
