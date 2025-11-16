import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DocumentStatusBadge } from './DocumentStatusBadge'
import type { DocumentStatus } from '@/types/document'

describe('DocumentStatusBadge', () => {
  it('should render NOT_PROCESSED status with correct label and icon', () => {
    render(<DocumentStatusBadge status="NOT_PROCESSED" />)
    
    expect(screen.getByText('Not Processed')).toBeInTheDocument()
    // Clock icon should be rendered
    const badge = screen.getByText('Not Processed').closest('div')
    expect(badge).toHaveClass('bg-yellow-100')
  })

  it('should render PROCESSING status with correct label and spinning icon', () => {
    render(<DocumentStatusBadge status="PROCESSING" />)
    
    expect(screen.getByText('Processing')).toBeInTheDocument()
    const badge = screen.getByText('Processing').closest('div')
    expect(badge).toHaveClass('bg-blue-100')
    // Icon should have animate-spin class
    const icon = badge?.querySelector('svg')
    expect(icon).toHaveClass('animate-spin')
  })

  it('should render PROCESSED status with correct label and icon', () => {
    render(<DocumentStatusBadge status="PROCESSED" />)
    
    expect(screen.getByText('Processed')).toBeInTheDocument()
    const badge = screen.getByText('Processed').closest('div')
    expect(badge).toHaveClass('bg-green-100')
  })

  it('should apply custom className alongside default classes', () => {
    render(<DocumentStatusBadge status="PROCESSED" className="custom-class" />)
    
    const badge = screen.getByText('Processed').closest('div')
    expect(badge).toHaveClass('custom-class')
    expect(badge).toHaveClass('bg-green-100')
  })

  it('should render all status types correctly', () => {
    const statuses: DocumentStatus[] = ['NOT_PROCESSED', 'PROCESSING', 'PROCESSED']
    const { rerender } = render(<DocumentStatusBadge status="NOT_PROCESSED" />)
    
    statuses.forEach((status) => {
      rerender(<DocumentStatusBadge status={status} />)
      
      const expectedLabel = status === 'NOT_PROCESSED' 
        ? 'Not Processed' 
        : status.charAt(0) + status.slice(1).toLowerCase()
      
      expect(screen.getByText(expectedLabel)).toBeInTheDocument()
    })
  })
})
