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

export interface LoginCredentials {
  username: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
  token_type: 'Bearer'
  scope?: string
}

export interface TokenClaims {
  sub: string
  preferred_username: string
  email?: string
  given_name?: string
  family_name?: string
  realm_access?: {
    roles: string[]
  }
  exp: number
  iat: number
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
// AUTH SERVICE INTERFACE
// ============================================

export interface IAuthService {
  // Authentication
  login(credentials: LoginCredentials): Promise<User>
  logout(): void

  // Token management
  getValidToken(): Promise<string>
  isTokenExpired(): boolean
  refreshAccessToken(): Promise<TokenResponse>

  // User info
  getUserInfo(): User | null
  hasRole(role: string): boolean
  isAdmin(): boolean

  // Session
  restoreSession(): User | null
}

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

// ============================================
// STORAGE KEYS
// ============================================

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry',
} as const
