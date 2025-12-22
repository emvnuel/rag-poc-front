/**
 * Access Denied component.
 *
 * Shown when a user attempts to access a protected route
 * without the required roles.
 */

import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/routes'

/**
 * Access Denied Page/Component
 */
export function AccessDenied() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to={ROUTES.HOME}>Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
