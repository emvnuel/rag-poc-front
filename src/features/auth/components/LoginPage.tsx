/**
 * Login page component.
 *
 * Redirects to Keycloak login page or shows validation errors.
 */

import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '@/lib/routes'
import { LogIn } from 'lucide-react'

/**
 * Login page with centered card layout.
 */
export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading, error } = useAuth()

  // Get the page user was trying to access, or default to home
  const from = (location.state as { from?: string })?.from || ROUTES.HOME

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleLogin = async () => {
    await login({ username: '', password: '' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">RAG SaaS Platform</CardTitle>
          <CardDescription>
            Secure Enterprise Knowledge Base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive opacity-90" role="alert">
              {error}
            </div>
          )}

          {isLoading ? (
             <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
          ) : (
            <Button onClick={handleLogin} className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In with SSO
            </Button>
          )}

          <p className="text-center text-xs text-muted-foreground mt-4">
            You will be redirected to our secure identity provider.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
