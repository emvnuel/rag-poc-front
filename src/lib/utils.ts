import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines and merges Tailwind CSS classes using clsx and tailwind-merge.
 * Resolves conflicts by giving precedence to later classes.
 * 
 * @param inputs - Class names, objects, or arrays of class values
 * @returns Merged and deduplicated class string
 * 
 * @example
 * ```tsx
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4' (px-4 overrides px-2)
 * cn('text-red-500', condition && 'text-blue-500') // Conditional classes
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
