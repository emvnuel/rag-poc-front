import { Badge } from '@/components/ui/badge'
import { Clock, Loader2, CheckCircle } from 'lucide-react'
import type { DocumentStatus } from '@/types/document'
import { cn } from '@/lib/utils'

interface DocumentStatusBadgeProps {
  status: DocumentStatus
  className?: string
}

/**
 * Badge component displaying document processing status with icon
 */
export function DocumentStatusBadge({
  status,
  className,
}: DocumentStatusBadgeProps) {
  const config = {
    NOT_PROCESSED: {
      label: 'Not Processed',
      icon: Clock,
      variant: 'secondary' as const,
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    PROCESSING: {
      label: 'Processing',
      icon: Loader2,
      variant: 'secondary' as const,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      animated: true,
    },
    PROCESSED: {
      label: 'Processed',
      icon: CheckCircle,
      variant: 'secondary' as const,
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
  }

  const statusConfig = config[status]
  const { label, icon: Icon, variant, className: statusClassName } = statusConfig
  const animated = 'animated' in statusConfig ? statusConfig.animated : false

  return (
    <Badge variant={variant} className={cn(statusClassName, className)}>
      <Icon className={cn('h-3 w-3 mr-1', animated && 'animate-spin')} />
      {label}
    </Badge>
  )
}
