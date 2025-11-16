import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface DocumentSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

/**
 * Search input component with debouncing for document filtering
 * Debounces user input to prevent excessive re-renders
 */
export function DocumentSearch({
  value,
  onChange,
  placeholder = 'Search documents...',
  debounceMs = 300,
}: DocumentSearchProps) {
  const [localValue, setLocalValue] = useState(value)

  // Sync local value with parent value
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, onChange, debounceMs])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-9 pr-9"
        aria-label="Search documents"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
