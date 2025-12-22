/**
 * Protected route wrapper component.
 *
 * Ensures only authenticated users can access wrapped routes.
 * Redirects unauthenticated users to the login page.
 * Optionally enforces role-based access control.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingFallback } from '@/components/common/LoadingFallback'
import { AccessDenied } from './AccessDenied'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Optional roles required to access this route */
  requiredRoles?: string[]
}

/**
 * Wrap routes that require authentication.
 *
 * @example
 * ```tsx
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <DashboardPage />
 *   </ProtectedRoute>
 * } />
 *
 * // With role requirement
 * <Route path="/admin" element={
 *   <ProtectedRoute requiredRoles={['admin']}>
 *     <AdminPage />
 *   </ProtectedRoute>
 * } />
 * ```
 */
export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth()
  const location = useLocation()

  // Show loading while checking auth state
  if (isLoading) {
    return <LoadingFallback />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Check role requirements if specified
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => hasRole(role))
    if (!hasRequiredRole) {
      return <AccessDenied />
    }
  }

  return <>{children}</>
}
