import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { DocumentTypeIcon } from './DocumentTypeIcon'
import type { DocumentType } from '@/types/document'

describe('DocumentTypeIcon', () => {
  it('should render FILE type icon with correct color', () => {
    const { container } = render(<DocumentTypeIcon type="FILE" />)
    
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('text-blue-500')
    expect(icon).toHaveAttribute('aria-label', 'FILE document')
  })

  it('should render TEXT type icon with correct color', () => {
    const { container } = render(<DocumentTypeIcon type="TEXT" />)
    
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('text-green-500')
    expect(icon).toHaveAttribute('aria-label', 'TEXT document')
  })

  it('should render WEBSITE type icon with correct color', () => {
    const { container } = render(<DocumentTypeIcon type="WEBSITE" />)
    
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('text-purple-500')
    expect(icon).toHaveAttribute('aria-label', 'WEBSITE document')
  })

  it('should apply custom className alongside default classes', () => {
    const { container } = render(<DocumentTypeIcon type="FILE" className="custom-icon-class" />)
    
    const icon = container.querySelector('svg')
    expect(icon).toHaveClass('custom-icon-class')
    expect(icon).toHaveClass('text-blue-500')
  })

  it('should render all document types correctly', () => {
    const types: DocumentType[] = ['FILE', 'TEXT', 'WEBSITE']
    
    types.forEach((type) => {
      const { container } = render(<DocumentTypeIcon type={type} />)
      const icon = container.querySelector('svg')
      
      expect(icon).toHaveAttribute('aria-label', `${type} document`)
    })
  })
})
