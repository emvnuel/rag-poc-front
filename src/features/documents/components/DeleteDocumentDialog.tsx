import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import type { Document } from '@/types/document'
import { useDeleteDocument } from '../hooks/useDeleteDocument'
import { toast } from 'sonner'

interface DeleteDocumentDialogProps {
  document: Document | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * Confirmation dialog for deleting a document
 */
export function DeleteDocumentDialog({
  document,
  open,
  onOpenChange,
  onSuccess,
}: DeleteDocumentDialogProps) {
  const { mutate: deleteDocument, isPending } = useDeleteDocument()

  if (!document) return null

  const handleDelete = () => {
    deleteDocument(document.id, {
      onSuccess: () => {
        toast.success(`"${document.fileName}" deleted successfully`)
        onOpenChange(false)
        onSuccess?.()
      },
      onError: (error) => {
        toast.error(
          `Failed to delete "${document.fileName}": ${error.message}`
        )
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10 flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <DialogTitle>Delete Document</DialogTitle>
              <DialogDescription className="mt-2">
                Are you sure you want to delete this document? This action cannot be
                undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-muted rounded-lg p-3 my-4">
          <p className="text-sm font-medium">{document.fileName}</p>
          <p className="text-xs text-muted-foreground mt-1">ID: {document.id}</p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
