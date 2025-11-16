/**
 * Unit tests for utility functions
 * 
 * Tests cn() utility for merging Tailwind CSS classes
 */

import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('should merge single class name', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
  });

  it('should merge multiple class names', () => {
    const result = cn('px-2', 'py-1', 'text-sm');
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
    expect(result).toContain('text-sm');
  });

  it('should override conflicting Tailwind classes', () => {
    // Later class should override earlier class
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
    expect(result).not.toContain('px-2');
  });

  it('should handle conditional classes with false', () => {
    const result = cn('text-red-500', false && 'text-blue-500');
    expect(result).toBe('text-red-500');
    expect(result).not.toContain('text-blue-500');
  });

  it('should handle conditional classes with true', () => {
    const result = cn('text-red-500', true && 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should handle undefined values', () => {
    const result = cn('text-red-500', undefined, 'text-sm');
    expect(result).toContain('text-red-500');
    expect(result).toContain('text-sm');
  });

  it('should handle null values', () => {
    const result = cn('text-red-500', null, 'text-sm');
    expect(result).toContain('text-red-500');
    expect(result).toContain('text-sm');
  });

  it('should handle empty string', () => {
    const result = cn('text-red-500', '', 'text-sm');
    expect(result).toContain('text-red-500');
    expect(result).toContain('text-sm');
  });

  it('should handle array of classes', () => {
    const result = cn(['text-red-500', 'text-sm']);
    expect(result).toContain('text-red-500');
    expect(result).toContain('text-sm');
  });

  it('should handle object with conditional classes', () => {
    const result = cn({
      'text-red-500': true,
      'text-blue-500': false,
      'text-sm': true,
    });
    expect(result).toContain('text-red-500');
    expect(result).toContain('text-sm');
    expect(result).not.toContain('text-blue-500');
  });

  it('should merge complex Tailwind classes', () => {
    const result = cn(
      'bg-blue-500 text-white',
      'hover:bg-blue-600',
      'focus:ring-2 focus:ring-blue-300'
    );
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('text-white');
    expect(result).toContain('hover:bg-blue-600');
    expect(result).toContain('focus:ring-2');
    expect(result).toContain('focus:ring-blue-300');
  });

  it('should override padding conflicts', () => {
    const result = cn('p-2', 'p-4');
    expect(result).toBe('p-4');
  });

  it('should override margin conflicts', () => {
    const result = cn('m-2', 'm-4');
    expect(result).toBe('m-4');
  });

  it('should override text color conflicts', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should override background color conflicts', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('should handle responsive classes', () => {
    const result = cn('text-sm', 'md:text-base', 'lg:text-lg');
    expect(result).toContain('text-sm');
    expect(result).toContain('md:text-base');
    expect(result).toContain('lg:text-lg');
  });

  it('should handle pseudo-class variants', () => {
    const result = cn('bg-blue-500', 'hover:bg-blue-600', 'active:bg-blue-700');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('hover:bg-blue-600');
    expect(result).toContain('active:bg-blue-700');
  });

  it('should handle arbitrary values', () => {
    const result = cn('w-[100px]', 'h-[50px]');
    expect(result).toContain('w-[100px]');
    expect(result).toContain('h-[50px]');
  });

  it('should override conflicting arbitrary values', () => {
    const result = cn('w-[100px]', 'w-[200px]');
    expect(result).toBe('w-[200px]');
  });

  it('should handle mixed arguments types', () => {
    const result = cn(
      'text-red-500',
      ['bg-white', 'p-4'],
      {
        'rounded-lg': true,
        'shadow-md': false,
      },
      'hover:bg-gray-100'
    );
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-white');
    expect(result).toContain('p-4');
    expect(result).toContain('rounded-lg');
    expect(result).toContain('hover:bg-gray-100');
    expect(result).not.toContain('shadow-md');
  });

  it('should deduplicate identical classes', () => {
    const result = cn('text-sm', 'text-sm', 'text-sm');
    expect(result).toBe('text-sm');
  });

  it('should handle no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle only falsy values', () => {
    const result = cn(false, null, undefined, '');
    expect(result).toBe('');
  });

  it('should preserve dark mode classes', () => {
    const result = cn('bg-white', 'dark:bg-gray-900');
    expect(result).toContain('bg-white');
    expect(result).toContain('dark:bg-gray-900');
  });

  it('should handle complex button styles', () => {
    const result = cn(
      'px-4 py-2',
      'bg-blue-500 text-white',
      'rounded-lg',
      'hover:bg-blue-600',
      'focus:outline-none focus:ring-2 focus:ring-blue-300',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    );
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('text-white');
    expect(result).toContain('rounded-lg');
    expect(result).toContain('hover:bg-blue-600');
  });

  it('should maintain specificity ordering', () => {
    // More specific classes should override less specific ones
    const result = cn('p-2', 'px-4');
    expect(result).toContain('p-2');
    expect(result).toContain('px-4');
  });

  it('should handle transition classes', () => {
    const result = cn('transition-all', 'duration-200', 'ease-in-out');
    expect(result).toContain('transition-all');
    expect(result).toContain('duration-200');
    expect(result).toContain('ease-in-out');
  });

  it('should return string type', () => {
    const result = cn('text-sm');
    expect(typeof result).toBe('string');
  });

  it('should handle grid classes', () => {
    const result = cn('grid', 'grid-cols-3', 'gap-4');
    expect(result).toContain('grid');
    expect(result).toContain('grid-cols-3');
    expect(result).toContain('gap-4');
  });

  it('should handle flex classes', () => {
    const result = cn('flex', 'items-center', 'justify-between');
    expect(result).toContain('flex');
    expect(result).toContain('items-center');
    expect(result).toContain('justify-between');
  });

  it('should override display conflicts', () => {
    const result = cn('flex', 'grid');
    expect(result).toBe('grid');
  });

  it('should handle border classes', () => {
    const result = cn('border', 'border-gray-300', 'rounded-md');
    expect(result).toContain('border');
    expect(result).toContain('border-gray-300');
    expect(result).toContain('rounded-md');
  });
});
