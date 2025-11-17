import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { DocumentStatusBadge } from './DocumentStatusBadge'
import type { Document, DocumentType } from '@/types/document'
import { FileText, Globe, File, Calendar, Clock } from 'lucide-react'

interface DocumentDetailDialogProps {
  document: Document | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Modal showing full document metadata and details
 */
export function DocumentDetailDialog({
  document,
  open,
  onOpenChange,
}: DocumentDetailDialogProps) {
  const [parsedMetadata, setParsedMetadata] = useState<Record<string, unknown> | null>(
    null
  )

  if (!document) return null

  // Parse metadata on open
  const getMetadata = () => {
    if (parsedMetadata) return parsedMetadata
    try {
      const parsed = JSON.parse(document.metadata)
      setParsedMetadata(parsed)
      return parsed
    } catch {
      return {}
    }
  }

  const metadata = getMetadata()

  const getTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'FILE':
        return 'File Upload'
      case 'TEXT':
        return 'Text Snippet'
      case 'WEBSITE':
        return 'Website'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  const renderTypeIcon = () => {
    switch (document.type) {
      case 'FILE':
        return <File className="h-6 w-6" />
      case 'TEXT':
        return <FileText className="h-6 w-6" />
      case 'WEBSITE':
        return <Globe className="h-6 w-6" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] md:max-h-[80vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <div className="flex items-start gap-2 md:gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
              {renderTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg md:text-xl break-words">
                {document.fileName}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                {getTypeLabel(document.type)}
              </DialogDescription>
            </div>
            <DocumentStatusBadge status={document.status} />
          </div>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 mt-3 md:mt-4">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground mb-1 text-xs md:text-sm">Document ID</dt>
                <dd className="font-mono text-xs break-all">{document.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-1 text-xs md:text-sm">Type</dt>
                <dd className="text-sm">{getTypeLabel(document.type)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-1 flex items-center gap-1 text-xs md:text-sm">
                  <Calendar className="h-3 w-3" />
                  Created
                </dt>
                <dd className="text-sm">{formatDate(document.createdAt)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground mb-1 flex items-center gap-1 text-xs md:text-sm">
                  <Clock className="h-3 w-3" />
                  Last Updated
                </dt>
                <dd className="text-sm">{formatDate(document.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Metadata */}
          {Object.keys(metadata).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Metadata</h3>
              <div className="bg-muted rounded-lg p-3 md:p-4">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
