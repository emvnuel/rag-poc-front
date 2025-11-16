import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { DocumentType, DocumentStatus } from '@/types/document'

interface DocumentFiltersProps {
  selectedTypes: DocumentType[]
  selectedStatuses: DocumentStatus[]
  onTypesChange: (types: DocumentType[]) => void
  onStatusesChange: (statuses: DocumentStatus[]) => void
}

const DOCUMENT_TYPES: DocumentType[] = ['FILE', 'TEXT', 'WEBSITE']
const DOCUMENT_STATUSES: DocumentStatus[] = ['NOT_PROCESSED', 'PROCESSING', 'PROCESSED']

const TYPE_LABELS: Record<DocumentType, string> = {
  FILE: 'File',
  TEXT: 'Text',
  WEBSITE: 'Website',
}

const STATUS_LABELS: Record<DocumentStatus, string> = {
  NOT_PROCESSED: 'Not Processed',
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
}

/**
 * Filter dropdown component for document type and status filtering
 */
export function DocumentFilters({
  selectedTypes,
  selectedStatuses,
  onTypesChange,
  onStatusesChange,
}: DocumentFiltersProps) {
  const activeFiltersCount = selectedTypes.length + selectedStatuses.length

  const handleTypeToggle = (type: DocumentType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type))
    } else {
      onTypesChange([...selectedTypes, type])
    }
  }

  const handleStatusToggle = (status: DocumentStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter((s) => s !== status))
    } else {
      onStatusesChange([...selectedStatuses, status])
    }
  }

  const handleClearAll = () => {
    onTypesChange([])
    onStatusesChange([])
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Document Type</DropdownMenuLabel>
          {DOCUMENT_TYPES.map((type) => (
            <DropdownMenuCheckboxItem
              key={type}
              checked={selectedTypes.includes(type)}
              onCheckedChange={() => handleTypeToggle(type)}
            >
              {TYPE_LABELS[type]}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {DOCUMENT_STATUSES.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={selectedStatuses.includes(status)}
              onCheckedChange={() => handleStatusToggle(status)}
            >
              {STATUS_LABELS[status]}
            </DropdownMenuCheckboxItem>
          ))}

          {activeFiltersCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="w-full justify-start text-xs"
                >
                  <X className="h-3 w-3 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
