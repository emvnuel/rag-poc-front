/**
 * Unit tests for OfflineBanner component.
 *
 * Tests the offline banner that displays when network is lost.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfflineBanner } from './OfflineBanner'
import * as useOnlineStatusModule from '@/hooks/useOnlineStatus'

// Mock the useOnlineStatus hook
vi.mock('@/hooks/useOnlineStatus')

describe('OfflineBanner', () => {
  it('should not render when online', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue(true)

    const { container } = render(<OfflineBanner />)

    expect(container.firstChild).toBeNull()
  })

  it('should render banner when offline', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue(false)

    render(<OfflineBanner />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/no internet connection/i)).toBeInTheDocument()
  })

  it('should have proper ARIA attributes', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue(false)

    render(<OfflineBanner />)

    const banner = screen.getByRole('alert')
    expect(banner).toHaveAttribute('aria-live', 'assertive')
  })

  it('should display warning icon', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue(false)

    const { container } = render(<OfflineBanner />)

    // Check for WifiOff icon (svg element)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should be fixed at top of screen', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue(false)

    const { container } = render(<OfflineBanner />)

    const banner = container.firstChild as HTMLElement
    expect(banner).toHaveClass('fixed')
    expect(banner).toHaveClass('top-0')
    expect(banner).toHaveClass('z-50')
  })

  it('should show informative message about features', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue(false)

    render(<OfflineBanner />)

    expect(screen.getByText(/some features may be unavailable/i)).toBeInTheDocument()
  })
})
