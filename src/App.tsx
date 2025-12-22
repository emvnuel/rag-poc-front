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
import { AuthProvider } from '@/features/auth/AuthProvider'

// Lazy load page components for code splitting
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })))
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage').then(m => ({ default: m.DocumentsPage })))
const ChatPage = lazy(() => import('@/pages/ChatPage').then(m => ({ default: m.ChatPage })))
const LoginPage = lazy(() => import('@/features/auth/components/LoginPage'))

// Import ProtectedRoute for authentication
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

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
          <AuthProvider>
            <WorkspaceProvider>
            <BrowserRouter>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* Public route - Login */}
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Protected routes */}
                    <Route path={ROUTES.HOME} element={
                      <ProtectedRoute>
                        <ProjectsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/projects/:projectId/documents" element={
                      <ProtectedRoute>
                        <DocumentsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/projects/:projectId/chat" element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/projects/:projectId/knowledge-graph" element={
                      <ProtectedRoute>
                        <KnowledgeGraphPage />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </Suspense>
              </Layout>
            </BrowserRouter>

            </WorkspaceProvider>
            <Toaster />
          </AuthProvider>
          {import.meta.env.VITE_ENABLE_DEVTOOLS !== 'false' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
