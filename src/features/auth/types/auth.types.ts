/**
 * Authentication types for Keycloak integration.
 *
 * These types define the structure of user information, tokens,
 * and authentication state used throughout the application.
 */

// ============================================
// CONFIGURATION
// ============================================

export interface KeycloakConfig {
  url: string
  realm: string
  clientId: string
}

// ============================================
// AUTHENTICATION TYPES
// ============================================

// Deprecated: kept for interface compatibility with context, but not used for PKCE
export interface LoginCredentials {
  username?: string
  password?: string
}

export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  roles: string[]
}

// ============================================
// AUTH STATE
// ============================================

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  error: string | null
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }

// ============================================
// AUTH CONTEXT
// ============================================

export interface AuthContextValue {
  // State
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  hasRole: (role: string) => boolean
  isAdmin: () => boolean
  clearError: () => void
}
