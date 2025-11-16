import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type SortField = 'name' | 'date' | 'size'
export type SortOrder = 'asc' | 'desc'

interface DocumentSortProps {
  sortBy: SortField
  sortOrder: SortOrder
  onSortByChange: (field: SortField) => void
  onSortOrderChange: (order: SortOrder) => void
}

const SORT_FIELD_LABELS: Record<SortField, string> = {
  name: 'Name',
  date: 'Date',
  size: 'Size',
}

/**
 * Sort dropdown component for document ordering
 */
export function DocumentSort({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: DocumentSortProps) {
  const toggleSortOrder = () => {
    onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const SortIcon = sortOrder === 'asc' ? ArrowUp : ArrowDown

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Sort: {SORT_FIELD_LABELS[sortBy]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sortBy}
            onValueChange={(value) => onSortByChange(value as SortField)}
          >
            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={toggleSortOrder}
        className="w-10 p-0"
        aria-label={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      >
        <SortIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
