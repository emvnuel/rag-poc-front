import { Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface BulkActionsProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkDelete: () => void
}

/**
 * Toolbar for bulk operations on selected documents
 */
export function BulkActions({
  selectedCount,
  onClearSelection,
  onBulkDelete,
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 p-4 bg-primary/10 rounded-lg border border-primary/20 mb-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm font-medium">
          {selectedCount} selected
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-7"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          className="h-8"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete {selectedCount} {selectedCount === 1 ? 'Document' : 'Documents'}
        </Button>
      </div>
    </div>
  )
}
