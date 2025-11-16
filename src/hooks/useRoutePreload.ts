/**
 * Hook for preloading route components on hover/focus
 * Improves perceived performance by loading routes before navigation
 */

import { useCallback } from 'react';

// Preload functions for lazy-loaded pages
const preloadFunctions: Record<string, () => Promise<unknown>> = {
  projects: () => import('@/pages/ProjectsPage'),
  documents: () => import('@/pages/DocumentsPage'),
  chat: () => import('@/pages/ChatPage'),
};

/**
 * Returns a preload function that can be attached to hover/focus events
 * 
 * @example
 * const preload = useRoutePreload();
 * <Link onMouseEnter={() => preload('documents')} to="/documents">Documents</Link>
 */
export function useRoutePreload() {
  const preload = useCallback((route: keyof typeof preloadFunctions) => {
    const preloadFn = preloadFunctions[route];
    if (preloadFn) {
      preloadFn().catch(() => {
        // Silently fail - user will load it on navigation anyway
      });
    }
  }, []);

  return preload;
}
