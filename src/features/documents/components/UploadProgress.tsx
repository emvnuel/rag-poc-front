import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface UploadProgressItem {
  id: string
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'success' | 'error'
  error?: string
}

interface UploadProgressProps {
  items: UploadProgressItem[]
  onRemove?: (id: string) => void
}

/**
 * Display upload progress bars for multiple files/operations
 */
export function UploadProgress({ items, onRemove }: UploadProgressProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
      <h3 className="text-sm font-medium text-muted-foreground">
        Upload Progress ({items.length})
      </h3>
      {items.map((item) => (
        <div key={item.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {item.status === 'uploading' && (
                <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
              )}
              {item.status === 'processing' && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500 flex-shrink-0" />
              )}
              {item.status === 'success' && (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              )}
              {item.status === 'error' && (
                <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              )}
              <span className="text-sm truncate">{item.fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-xs font-medium',
                  item.status === 'success' && 'text-green-500',
                  item.status === 'error' && 'text-destructive',
                  (item.status === 'uploading' || item.status === 'processing') &&
                    'text-muted-foreground'
                )}
              >
                {item.status === 'uploading' && `${Math.round(item.progress)}%`}
                {item.status === 'processing' && 'Processing...'}
                {item.status === 'success' && 'Complete'}
                {item.status === 'error' && 'Failed'}
              </span>
              {onRemove && (item.status === 'success' || item.status === 'error') && (
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                  aria-label="Remove"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          {(item.status === 'uploading' || item.status === 'processing') && (
            <Progress
              value={item.status === 'uploading' ? item.progress : undefined}
              className="h-1"
            />
          )}
          {item.status === 'error' && item.error && (
            <p className="text-xs text-destructive">{item.error}</p>
          )}
        </div>
      ))}
    </div>
  )
}
