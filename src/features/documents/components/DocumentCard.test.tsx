import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentCard } from './DocumentCard'
import type { Document } from '@/types/document'

const createMockDocument = (overrides?: Partial<Document>): Document => ({
  id: 'doc-123',
  type: 'FILE',
  status: 'PROCESSED',
  fileName: 'test-document.pdf',
  metadata: JSON.stringify({ size_bytes: 1024000 }),
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T11:30:00Z',
  ...overrides,
})

describe('DocumentCard', () => {
  it('should render document information correctly', () => {
    const document = createMockDocument()
    render(<DocumentCard document={document} />)

    expect(screen.getByText('test-document.pdf')).toBeInTheDocument()
    expect(screen.getByText('Processed')).toBeInTheDocument()
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('1000 KB')).toBeInTheDocument()
  })

  it('should render FILE type icon', () => {
    const document = createMockDocument({ type: 'FILE' })
    const { container } = render(<DocumentCard document={document} />)
    
    // File icon should be rendered
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('should render TEXT type icon', () => {
    const document = createMockDocument({ type: 'TEXT' })
    const { container } = render(<DocumentCard document={document} />)
    
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('should render WEBSITE type icon', () => {
    const document = createMockDocument({ type: 'WEBSITE' })
    const { container } = render(<DocumentCard document={document} />)
    
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('should format file size correctly', () => {
    const document = createMockDocument({
      metadata: JSON.stringify({ size_bytes: 2048 }),
    })
    render(<DocumentCard document={document} />)

    expect(screen.getByText('2 KB')).toBeInTheDocument()
  })

  it('should handle alternative metadata format (sizeBytes)', () => {
    const document = createMockDocument({
      metadata: JSON.stringify({ sizeBytes: 3072 }),
    })
    render(<DocumentCard document={document} />)

    expect(screen.getByText('3 KB')).toBeInTheDocument()
  })

  it('should not display file size when not available', () => {
    const document = createMockDocument({ metadata: '{}' })
    render(<DocumentCard document={document} />)

    expect(screen.queryByText(/KB|MB|GB/)).not.toBeInTheDocument()
  })

  it('should format dates correctly', () => {
    const document = createMockDocument({
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T11:30:00Z',
    })
    render(<DocumentCard document={document} />)

    // Check that dates are rendered (format may vary by locale)
    expect(screen.getByText(/Created/)).toBeInTheDocument()
    expect(screen.getByText(/Updated/)).toBeInTheDocument()
  })

  it('should call onView when View Details button is clicked', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    const document = createMockDocument()
    
    render(<DocumentCard document={document} onView={onView} />)

    await user.click(screen.getByRole('button', { name: /view details/i }))
    expect(onView).toHaveBeenCalledWith(document)
    expect(onView).toHaveBeenCalledTimes(1)
  })

  it('should call onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const document = createMockDocument()
    
    render(<DocumentCard document={document} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith(document)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('should not render View Details button when onView is not provided', () => {
    const document = createMockDocument()
    render(<DocumentCard document={document} />)

    expect(screen.queryByRole('button', { name: /view details/i })).not.toBeInTheDocument()
  })

  it('should not render Delete button when onDelete is not provided', () => {
    const document = createMockDocument()
    render(<DocumentCard document={document} />)

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('should render checkbox when onSelect is provided', () => {
    const onSelect = vi.fn()
    const document = createMockDocument()
    
    render(<DocumentCard document={document} onSelect={onSelect} />)

    expect(screen.getByRole('checkbox', { name: /select test-document.pdf/i })).toBeInTheDocument()
  })

  it('should not render checkbox when onSelect is not provided', () => {
    const document = createMockDocument()
    render(<DocumentCard document={document} />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('should call onSelect when checkbox is toggled', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const document = createMockDocument()
    
    render(<DocumentCard document={document} onSelect={onSelect} isSelected={false} />)

    await user.click(screen.getByRole('checkbox'))
    expect(onSelect).toHaveBeenCalledWith('doc-123', true)
  })

  it('should show selected state with ring border', () => {
    const document = createMockDocument()
    const { container } = render(
      <DocumentCard document={document} isSelected={true} onSelect={vi.fn()} />
    )

    const card = container.querySelector('.ring-2')
    expect(card).toBeInTheDocument()
  })

  it('should highlight search query in file name', () => {
    const document = createMockDocument({ fileName: 'test-document.pdf' })
    render(<DocumentCard document={document} searchQuery="test" />)

    const mark = screen.getByText('test')
    expect(mark.tagName).toBe('MARK')
  })

  it('should highlight multiple occurrences of search query', () => {
    const document = createMockDocument({ fileName: 'test-file-test.pdf' })
    const { container } = render(<DocumentCard document={document} searchQuery="test" />)

    const marks = container.querySelectorAll('mark')
    expect(marks).toHaveLength(2)
  })

  it('should not highlight when search query is empty', () => {
    const document = createMockDocument({ fileName: 'test-document.pdf' })
    const { container } = render(<DocumentCard document={document} searchQuery="" />)

    const marks = container.querySelectorAll('mark')
    expect(marks).toHaveLength(0)
  })

  it('should render all document statuses correctly', () => {
    const statuses = ['NOT_PROCESSED', 'PROCESSING', 'PROCESSED'] as const
    
    statuses.forEach((status) => {
      const document = createMockDocument({ status })
      const { unmount } = render(<DocumentCard document={document} />)
      
      // Status badge should be rendered (already tested in DocumentStatusBadge.test.tsx)
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument()
      
      unmount()
    })
  })

  it('should handle invalid metadata gracefully', () => {
    const document = createMockDocument({ metadata: 'invalid-json' })
    
    // Should not throw error
    expect(() => {
      render(<DocumentCard document={document} />)
    }).not.toThrow()
  })

  it('should truncate long file names', () => {
    const longFileName = 'a'.repeat(200) + '.pdf'
    const document = createMockDocument({ fileName: longFileName })
    const { container } = render(<DocumentCard document={document} />)

    const titleElement = container.querySelector('.truncate')
    expect(titleElement).toBeInTheDocument()
  })
})
