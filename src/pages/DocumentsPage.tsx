import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UploadTabs } from '@/features/documents/components/UploadTabs'
import { DocumentList } from '@/features/documents/components/DocumentList'
import { DocumentDetailDialog } from '@/features/documents/components/DocumentDetailDialog'
import { DeleteDocumentDialog } from '@/features/documents/components/DeleteDocumentDialog'
import { DocumentSearch } from '@/features/documents/components/DocumentSearch'
import { DocumentFilters } from '@/features/documents/components/DocumentFilters'
import { DocumentSort } from '@/features/documents/components/DocumentSort'
import { BulkActions } from '@/features/documents/components/BulkActions'
import { useProjectDocuments } from '@/features/documents/hooks/useProjectDocuments'
import { useDocumentSearch } from '@/features/documents/hooks/useDocumentSearch'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import type { Document } from '@/types/document'

/**
 * Main documents page integrating upload, list, and management features
 */
export function DocumentsPage() {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const {
    data: documents = [],
    isLoading,
    refetch,
    isRefetching,
  } = useProjectDocuments(projectId || '')

  const showLoading = useDelayedLoading(isLoading)

  const {
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
  } = useDocumentSearch()

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
    setDetailDialogOpen(true)
  }

  const handleDeleteDocument = (document: Document) => {
    setSelectedDocument(document)
    setDeleteDialogOpen(true)
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleBulkDelete = () => {
    // Delete all selected documents
    // This will be implemented when we handle bulk delete
    console.log('Bulk delete:', Array.from(selectedDocuments))
  }

  const handleSelectAllDocuments = (selectAll: boolean) => {
    const allIds = documents.map(doc => doc.id)
    handleSelectAll(allIds, selectAll)
  }

  if (!projectId) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="text-center">
          <p className="text-destructive">{t('errors.noProjectId')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{t('documents.title')}</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t('documents.subtitle')}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefetching}
          className="w-full sm:w-auto"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`}
          />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Upload Section */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-base md:text-lg lg:text-xl font-semibold mb-4">{t('documents.uploadDocuments')}</h2>
        <UploadTabs projectId={projectId} />
      </div>

      {/* Documents List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg lg:text-xl font-semibold">
            {t('documents.yourDocuments')}
            {!isLoading && (
              <span className="text-xs md:text-sm font-normal text-muted-foreground ml-2">
                ({documents.length})
              </span>
            )}
          </h2>
        </div>

        {/* Search, Filter, and Sort Controls */}
        <div className="flex flex-col gap-4 mb-6">
          <DocumentSearch
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <DocumentFilters
              selectedTypes={selectedTypes}
              selectedStatuses={selectedStatuses}
              onTypesChange={setSelectedTypes}
              onStatusesChange={setSelectedStatuses}
            />
            <DocumentSort
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedDocuments.size}
          onClearSelection={clearSelection}
          onBulkDelete={handleBulkDelete}
        />

        {/* Document Grid */}
        <DocumentList
          documents={documents}
          isLoading={showLoading}
          searchQuery={searchQuery}
          selectedTypes={selectedTypes}
          selectedStatuses={selectedStatuses}
          sortBy={sortBy}
          sortOrder={sortOrder}
          selectedDocuments={selectedDocuments}
          onSelect={handleSelect}
          onSelectAll={handleSelectAllDocuments}
          onView={handleViewDocument}
          onDelete={handleDeleteDocument}
        />
      </div>

      {/* Dialogs */}
      <DocumentDetailDialog
        document={selectedDocument}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
      <DeleteDocumentDialog
        document={selectedDocument}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
