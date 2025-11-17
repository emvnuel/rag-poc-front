import { useMemo, useRef, memo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { DocumentCard } from './DocumentCard'
import type { Document, DocumentType, DocumentStatus } from '@/types/document'
import type { SortField, SortOrder } from './DocumentSort'
import { FileX, SearchX } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

interface DocumentListProps {
  documents: Document[]
  isLoading?: boolean
  searchQuery?: string
  selectedTypes?: DocumentType[]
  selectedStatuses?: DocumentStatus[]
  sortBy?: SortField
  sortOrder?: SortOrder
  selectedDocuments?: Set<string>
  onSelect?: (documentId: string, selected: boolean) => void
  onSelectAll?: (selectAll: boolean) => void
  onView?: (document: Document) => void
  onDelete?: (document: Document) => void
}

/**
 * Render grid/list of DocumentCards with empty and loading states
 * Supports client-side filtering by search, type, status and sorting
 */
export const DocumentList = memo(function DocumentList({
  documents,
  isLoading,
  searchQuery = '',
  selectedTypes = [],
  selectedStatuses = [],
  sortBy = 'date',
  sortOrder = 'desc',
  selectedDocuments,
  onSelect,
  onSelectAll,
  onView,
  onDelete,
}: DocumentListProps) {
  // Filter and sort documents
  const processedDocuments = useMemo(() => {
    let filtered = [...documents]

    // Search filter (case-insensitive, searches fileName and metadata)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((doc) => {
        const fileNameMatch = doc.fileName.toLowerCase().includes(query)
        const metadataMatch = doc.metadata.toLowerCase().includes(query)
        return fileNameMatch || metadataMatch
      })
    }

    // Type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((doc) => selectedTypes.includes(doc.type))
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((doc) => selectedStatuses.includes(doc.status))
    }

    // Helper function to parse size from metadata
    const getSizeFromMetadata = (doc: Document): number => {
      try {
        const meta = JSON.parse(doc.metadata)
        return meta.size_bytes || meta.sizeBytes || 0
      } catch {
        return 0
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName)
          break
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'size':
          comparison = getSizeFromMetadata(a) - getSizeFromMetadata(b)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [documents, searchQuery, selectedTypes, selectedStatuses, sortBy, sortOrder])

  const hasActiveFilters = searchQuery.trim() || selectedTypes.length > 0 || selectedStatuses.length > 0
  
  // Virtual scrolling setup for large lists (>50 documents)
  const parentRef = useRef<HTMLDivElement>(null)
  const useVirtualScrolling = processedDocuments.length > 50
  
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual is intentionally used for performance optimization with large lists
  const rowVirtualizer = useVirtualizer({
    count: useVirtualScrolling ? processedDocuments.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // Estimated height of each card
    overscan: 5, // Render 5 extra items above/below viewport
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-lg bg-muted animate-pulse"
            aria-label="Loading document"
          />
        ))}
      </div>
    )
  }

  // Empty state for no documents
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <FileX className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No documents yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Upload your first document using the tabs above to get started with your knowledge base.
        </p>
      </div>
    )
  }

  // Empty state for filtered results
  if (processedDocuments.length === 0 && hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <SearchX className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No matching documents</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    )
  }

  const allSelected = processedDocuments.length > 0 && 
    processedDocuments.every(doc => selectedDocuments?.has(doc.id))
  const someSelected = processedDocuments.some(doc => selectedDocuments?.has(doc.id))

  // Render with virtual scrolling for large lists
  if (useVirtualScrolling) {
    return (
      <>
        {onSelectAll && processedDocuments.length > 0 && (
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked: boolean) => onSelectAll(checked)}
              aria-label="Select all documents"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectAll(!allSelected)}
              className="h-8 text-sm"
            >
              {allSelected ? 'Deselect All' : someSelected ? `Select All (${processedDocuments.length})` : `Select All (${processedDocuments.length})`}
            </Button>
          </div>
        )}
        <div 
          ref={parentRef} 
          className="h-[600px] overflow-auto"
          style={{ contain: 'strict' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const document = processedDocuments[virtualRow.index]
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="px-1 pb-4">
                    <DocumentCard
                      document={document}
                      isSelected={selectedDocuments?.has(document.id)}
                      onSelect={onSelect}
                      onView={onView}
                      onDelete={onDelete}
                      searchQuery={searchQuery}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  // Standard grid layout for smaller lists (≤50 documents)
  return (
    <>
      {onSelectAll && processedDocuments.length > 0 && (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked: boolean) => onSelectAll(checked)}
            aria-label="Select all documents"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectAll(!allSelected)}
            className="h-8 text-sm"
          >
            {allSelected ? 'Deselect All' : someSelected ? `Select All (${processedDocuments.length})` : `Select All (${processedDocuments.length})`}
          </Button>
        </div>
      )}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {processedDocuments.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            isSelected={selectedDocuments?.has(document.id)}
            onSelect={onSelect}
            onView={onView}
            onDelete={onDelete}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </>
  )
})
