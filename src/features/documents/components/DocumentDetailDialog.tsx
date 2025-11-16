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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
              {renderTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl break-words">
                {document.fileName}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {getTypeLabel(document.type)}
              </DialogDescription>
            </div>
            <DocumentStatusBadge status={document.status} />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Information</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground mb-1">Document ID</dt>
                <dd className="font-mono text-xs break-all">{document.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-1">Type</dt>
                <dd>{getTypeLabel(document.type)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created
                </dt>
                <dd>{formatDate(document.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last Updated
                </dt>
                <dd>{formatDate(document.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Metadata */}
          {Object.keys(metadata).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Metadata</h3>
              <div className="bg-muted rounded-lg p-4">
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
