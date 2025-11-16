import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Layout } from '@/components/layout/Layout'
import { LoadingFallback } from '@/components/common/LoadingFallback'
import { queryClient } from '@/lib/query-client'
import { ROUTES } from '@/lib/routes'

// Lazy load page components for code splitting
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })))
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage').then(m => ({ default: m.DocumentsPage })))
const ChatPage = lazy(() => import('@/pages/ChatPage').then(m => ({ default: m.ChatPage })))

// Placeholder pages - will be implemented in later phases
function KnowledgeGraphPage() {
  return <div className="p-8"><h1 className="text-2xl font-bold">Knowledge Graph Page</h1></div>
}

/**
 * Main application component with routing and providers
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <WorkspaceProvider>
            <BrowserRouter>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path={ROUTES.HOME} element={<ProjectsPage />} />
                    <Route path="/projects/:projectId/documents" element={<DocumentsPage />} />
                    <Route path="/projects/:projectId/chat" element={<ChatPage />} />
                    <Route path="/projects/:projectId/knowledge-graph" element={<KnowledgeGraphPage />} />
                  </Routes>
                </Suspense>
              </Layout>
            </BrowserRouter>
            <Toaster />
          </WorkspaceProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
