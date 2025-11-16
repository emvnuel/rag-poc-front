/**
 * React hook for managing document list UI state.
 *
 * Provides comprehensive state management for document filtering, sorting,
 * searching, and bulk selection operations.
 */

import { useState, useCallback } from 'react'
import type { DocumentType, DocumentStatus } from '@/types/document'
import type { SortField, SortOrder } from '../components/DocumentSort'

interface UseDocumentSearchResult {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedTypes: DocumentType[]
  setSelectedTypes: (types: DocumentType[]) => void
  selectedStatuses: DocumentStatus[]
  setSelectedStatuses: (statuses: DocumentStatus[]) => void
  sortBy: SortField
  setSortBy: (field: SortField) => void
  sortOrder: SortOrder
  setSortOrder: (order: SortOrder) => void
  selectedDocuments: Set<string>
  handleSelect: (documentId: string, selected: boolean) => void
  handleSelectAll: (documentIds: string[], selectAll: boolean) => void
  clearSelection: () => void
  clearAllFilters: () => void
}

/**
 * Hook for managing document list UI state including search, filters, sorting, and selection.
 *
 * Provides all state management needed for a document list interface with:
 * - Text search
 * - Type and status filtering
 * - Sorting by field and order
 * - Single and bulk selection
 * - Clear filters functionality
 *
 * @returns Object containing all state values and handlers
 *
 * @example
 * ```tsx
 * const {
 *   searchQuery,
 *   setSearchQuery,
 *   selectedDocuments,
 *   handleSelect,
 *   clearAllFilters
 * } = useDocumentSearch();
 *
 * // Use in document list
 * <SearchInput value={searchQuery} onChange={setSearchQuery} />
 * <DocumentList
 *   onSelect={handleSelect}
 *   selectedIds={selectedDocuments}
 * />
 * ```
 */
export function useDocumentSearch(): UseDocumentSearchResult {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<DocumentType[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<DocumentStatus[]>([])
  const [sortBy, setSortBy] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())

  const handleSelect = useCallback((documentId: string, selected: boolean) => {
    setSelectedDocuments(prev => {
      const next = new Set(prev)
      if (selected) {
        next.add(documentId)
      } else {
        next.delete(documentId)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback((documentIds: string[], selectAll: boolean) => {
    if (selectAll) {
      setSelectedDocuments(new Set(documentIds))
    } else {
      setSelectedDocuments(new Set())
    }
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedDocuments(new Set())
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedTypes([])
    setSelectedStatuses([])
    setSortBy('date')
    setSortOrder('desc')
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    selectedStatuses,
    setSelectedStatuses,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedDocuments,
    handleSelect,
    handleSelectAll,
    clearSelection,
    clearAllFilters,
  }
}
