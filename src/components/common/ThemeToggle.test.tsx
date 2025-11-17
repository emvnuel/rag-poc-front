/**
 * Unit tests for ThemeToggle component.
 *
 * Tests theme toggle functionality.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}))

describe('ThemeToggle', () => {
  it('should render toggle button', async () => {
    const mockSetTheme = vi.fn()
    const { useTheme } = await import('next-themes')
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    } as any)

    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it('should toggle from light to dark theme', async () => {
    const user = userEvent.setup()
    const mockSetTheme = vi.fn()
    const { useTheme } = await import('next-themes')
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    } as any)

    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    await user.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should toggle from dark to light theme', async () => {
    const user = userEvent.setup()
    const mockSetTheme = vi.fn()
    const { useTheme } = await import('next-themes')
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    } as any)

    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    await user.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('should have proper aria-label', async () => {
    const mockSetTheme = vi.fn()
    const { useTheme } = await import('next-themes')
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    } as any)

    render(<ThemeToggle />)

    const button = screen.getByLabelText('Toggle theme')
    expect(button).toBeInTheDocument()
  })

  it('should display sun and moon icons', async () => {
    const mockSetTheme = vi.fn()
    const { useTheme } = await import('next-themes')
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    } as any)

    const { container } = render(<ThemeToggle />)

    // Check for icon SVG elements
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThanOrEqual(2) // Sun and Moon icons
  })
})
