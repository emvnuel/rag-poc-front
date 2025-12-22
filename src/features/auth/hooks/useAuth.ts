/**
 * Custom hook for accessing authentication context.
 *
 * Provides access to auth state and actions from any component
 * within the AuthProvider tree.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <LoginForm onSubmit={login} />;
 *   }
 *
 *   return <div>Welcome, {user.username}!</div>;
 * }
 * ```
 */

import { useContext } from 'react'
import { AuthContext } from '../AuthProvider'
import type { AuthContextValue } from '../types/auth.types'

/**
 * Access the authentication context.
 *
 * @throws Error if used outside of AuthProvider
 * @returns Authentication context with state and actions
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
