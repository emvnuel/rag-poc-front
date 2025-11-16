/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Production optimizations
    sourcemap: false, // Disable source maps for smaller bundle
    minify: 'esbuild', // Fast and efficient minification
    target: 'esnext', // Modern browsers only
    cssMinify: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Data fetching and state management
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          // UI component libraries
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-checkbox', '@radix-ui/react-label', '@radix-ui/react-progress', '@radix-ui/react-slot'],
          // Utility libraries
          'utils-vendor': ['axios', 'clsx', 'tailwind-merge', 'class-variance-authority', 'zod'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  // @ts-ignore - Vitest config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      statements: 90,
      branches: 80,
      functions: 90,
      lines: 90,
      exclude: [
        'node_modules/**',
        'src/test/setup.ts',
        'src/services/api/generated/**',
        '**/*.config.{js,ts}',
        '**/types/**',
        '**/*.d.ts',
        'tests/e2e/**',
      ],
    },
  },
})
