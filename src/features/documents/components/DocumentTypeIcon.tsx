import { FileText, Globe, File } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DocumentType } from '@/types/document'
import { cn } from '@/lib/utils'

interface DocumentTypeIconProps {
  type: DocumentType
  className?: string
}

const TYPE_ICONS: Record<DocumentType, LucideIcon> = {
  FILE: File,
  TEXT: FileText,
  WEBSITE: Globe,
}

const TYPE_COLORS: Record<DocumentType, string> = {
  FILE: 'text-blue-500',
  TEXT: 'text-green-500',
  WEBSITE: 'text-purple-500',
}

/**
 * Display appropriate icon for document type with color coding
 */
export function DocumentTypeIcon({ type, className }: DocumentTypeIconProps) {
  const Icon = TYPE_ICONS[type]
  const colorClass = TYPE_COLORS[type]

  return <Icon className={cn(colorClass, className)} aria-label={`${type} document`} />
}
