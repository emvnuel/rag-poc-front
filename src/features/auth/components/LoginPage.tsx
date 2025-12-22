/**
 * Login page component.
 *
 * Full-page login form with branding and redirect handling.
 * Redirects authenticated users to the original destination.
 */

import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from './LoginForm'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '@/lib/routes'

/**
 * Login page with centered card layout.
 */
export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth()

  // Get the page user was trying to access, or default to home
  const from = (location.state as { from?: string })?.from || ROUTES.HOME

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, from])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  const handleLogin = async (credentials: { username: string; password: string }) => {
    try {
      await login(credentials)
      // Navigation handled by useEffect above
    } catch {
      // Error is handled by the auth context
    }
  }

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Default export for lazy loading
export default LoginPage
