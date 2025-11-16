/**
 * Unit tests for LoadingFallback component.
 *
 * Tests the loading skeleton UI displayed during lazy loading.
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LoadingFallback } from './LoadingFallback'

describe('LoadingFallback', () => {
  it('should render loading skeletons', () => {
    const { container } = render(<LoadingFallback />)

    // Should have 3 skeleton elements
    const skeletons = container.querySelectorAll('.h-12, .h-32, .h-24')
    expect(skeletons.length).toBe(3)
  })

  it('should be centered on screen', () => {
    const { container } = render(<LoadingFallback />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('flex')
    expect(wrapper).toHaveClass('min-h-screen')
    expect(wrapper).toHaveClass('items-center')
    expect(wrapper).toHaveClass('justify-center')
  })

  it('should have max-width constraint', () => {
    const { container } = render(<LoadingFallback />)

    const contentWrapper = container.querySelector('.max-w-md')
    expect(contentWrapper).toBeInTheDocument()
  })

  it('should render with proper spacing', () => {
    const { container } = render(<LoadingFallback />)

    const contentWrapper = container.querySelector('.space-y-4')
    expect(contentWrapper).toBeInTheDocument()
  })
})
