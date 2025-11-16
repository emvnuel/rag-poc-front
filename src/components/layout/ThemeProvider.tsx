import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: 'light' | 'dark' | 'system'
  storageKey?: string
}

/**
 * Theme provider wrapper using next-themes
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'rag-platform-theme',
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      storageKey={storageKey}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
