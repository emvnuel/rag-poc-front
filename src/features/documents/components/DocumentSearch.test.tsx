import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentSearch } from './DocumentSearch'

describe('DocumentSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render search input with default placeholder', () => {
    const onChange = vi.fn()
    render(<DocumentSearch value="" onChange={onChange} />)

    expect(screen.getByPlaceholderText('Search documents...')).toBeInTheDocument()
    expect(screen.getByLabelText('Search documents')).toBeInTheDocument()
  })

  it('should render search input with custom placeholder', () => {
    const onChange = vi.fn()
    render(
      <DocumentSearch
        value=""
        onChange={onChange}
        placeholder="Find your files..."
      />
    )

    expect(screen.getByPlaceholderText('Find your files...')).toBeInTheDocument()
  })

  it('should display initial value in input', () => {
    const onChange = vi.fn()
    render(<DocumentSearch value="test query" onChange={onChange} />)

    const input = screen.getByLabelText('Search documents') as HTMLInputElement
    expect(input.value).toBe('test query')
  })

  it('should update local value when typing', async () => {
    const user = userEvent.setup({ delay: null })
    const onChange = vi.fn()
    render(<DocumentSearch value="" onChange={onChange} />)

    const input = screen.getByLabelText('Search documents')
    await user.type(input, 'new query')

    expect((input as HTMLInputElement).value).toBe('new query')
  })

  it('should debounce onChange calls by default (300ms)', async () => {
    const user = userEvent.setup({ delay: null })
    const onChange = vi.fn()
    render(<DocumentSearch value="" onChange={onChange} />)

    const input = screen.getByLabelText('Search documents')
    await user.type(input, 'test')

    // Should not call onChange immediately
    expect(onChange).not.toHaveBeenCalled()

    // Fast-forward 299ms - still not called
    vi.advanceTimersByTime(299)
    expect(onChange).not.toHaveBeenCalled()

    // Fast-forward to 300ms - now called
    vi.advanceTimersByTime(1)
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test')
      expect(onChange).toHaveBeenCalledTimes(1)
    })
  })

  it('should support custom debounce time', async () => {
    const user = userEvent.setup({ delay: null })
    const onChange = vi.fn()
    render(<DocumentSearch value="" onChange={onChange} debounceMs={500} />)

    const input = screen.getByLabelText('Search documents')
    await user.type(input, 'test')

    // Fast-forward 400ms - not called yet
    vi.advanceTimersByTime(400)
    expect(onChange).not.toHaveBeenCalled()

    // Fast-forward to 500ms - now called
    vi.advanceTimersByTime(100)
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test')
    })
  })

  it('should show clear button when input has value', async () => {
    const user = userEvent.setup({ delay: null })
    const onChange = vi.fn()
    render(<DocumentSearch value="" onChange={onChange} />)

    const input = screen.getByLabelText('Search documents')
    
    // Initially no clear button
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()

    // Type something
    await user.type(input, 'test')
    
    // Clear button should appear
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
  })

  it('should not show clear button when input is empty', () => {
    const onChange = vi.fn()
    render(<DocumentSearch value="" onChange={onChange} />)

    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
  })

  it('should clear input when clear button is clicked', async () => {
    const user = userEvent.setup({ delay: null })
    const onChange = vi.fn()
    render(<DocumentSearch value="test query" onChange={onChange} />)

    const clearButton = screen.getByLabelText('Clear search')
    await user.click(clearButton)

    const input = screen.getByLabelText('Search documents') as HTMLInputElement
    expect(input.value).toBe('')
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('should immediately call onChange when clear button is clicked', async () => {
    const user = userEvent.setup({ delay: null })
    const onChange = vi.fn()
    render(<DocumentSearch value="test query" onChange={onChange} />)

    const clearButton = screen.getByLabelText('Clear search')
    await user.click(clearButton)

    // Should be called immediately without debounce
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('should sync local value when parent value changes', () => {
    const onChange = vi.fn()
    const { rerender } = render(<DocumentSearch value="initial" onChange={onChange} />)

    const input = screen.getByLabelText('Search documents') as HTMLInputElement
    expect(input.value).toBe('initial')

    // Update parent value
    rerender(<DocumentSearch value="updated" onChange={onChange} />)
    
    expect(input.value).toBe('updated')
  })

  it('should cancel previous debounce timer on new input', async () => {
    const user = userEvent.setup({ delay: null })
    const onChange = vi.fn()
    render(<DocumentSearch value="" onChange={onChange} debounceMs={300} />)

    const input = screen.getByLabelText('Search documents')
    
    // Type "test"
    await user.type(input, 'test')
    vi.advanceTimersByTime(200)
    
    // Type more before debounce completes
    await user.type(input, ' query')
    vi.advanceTimersByTime(200)
    
    // Should not have called onChange yet (timer was reset)
    expect(onChange).not.toHaveBeenCalled()
    
    // Complete the new timer
    vi.advanceTimersByTime(100)
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test query')
      expect(onChange).toHaveBeenCalledTimes(1)
    })
  })

  it('should render search icon', () => {
    const onChange = vi.fn()
    const { container } = render(<DocumentSearch value="" onChange={onChange} />)

    // Search icon should be rendered
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })
})
