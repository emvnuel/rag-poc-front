/**
 * Authentication service for Keycloak integration.
 *
 * Handles login, logout, token management, and session persistence.
 * This is a singleton service that can be used directly or through the AuthProvider.
 */

import { getTokenEndpoint, getLogoutEndpoint, keycloakConfig } from '@/lib/keycloak-config'
import type {
  LoginCredentials,
  TokenResponse,
  TokenClaims,
  User,
} from '../types/auth.types'

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry',
} as const

// Token refresh buffer (30 seconds before expiry)
const TOKEN_REFRESH_BUFFER_MS = 30000

/**
 * Authentication service singleton for managing Keycloak authentication.
 */
class AuthService {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiry: number | null = null

  constructor() {
    // Try to restore session from localStorage on initialization
    this.restoreFromStorage()
  }

  // ============================================
  // TOKEN STORAGE METHODS
  // ============================================

  /**
   * Store tokens from a successful authentication response.
   */
  setTokens(tokenResponse: TokenResponse): void {
    this.accessToken = tokenResponse.access_token
    this.refreshToken = tokenResponse.refresh_token
    this.tokenExpiry = Date.now() + tokenResponse.expires_in * 1000

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, this.accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken)
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, String(this.tokenExpiry))
  }

  /**
   * Clear all stored tokens and session data.
   */
  clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null
    this.tokenExpiry = null

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY)
  }

  /**
   * Restore tokens from localStorage.
   */
  private restoreFromStorage(): void {
    this.accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    this.refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    const expiryStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)
    this.tokenExpiry = expiryStr ? parseInt(expiryStr, 10) : null
  }

  /**
   * Restore session from localStorage and return user if valid.
   * Attempts to refresh token if access token is expired but refresh token exists.
   */
  async restoreSession(): Promise<User | null> {
    this.restoreFromStorage()

    if (!this.accessToken) {
      return null
    }

    // Check if token is expired
    if (this.isTokenExpired()) {
      try {
        // Try to refresh
        if (this.refreshToken) {
          await this.refreshAccessToken()
          // If successful, return user
          return this.getUserInfo()
        }
      } catch (error) {
        // Refresh failed, clear tokens
        console.warn('Session restore failed: Token expired and refresh failed', error)
        this.clearTokens()
        return null
      }
      
      // Expired and no refresh token
      this.clearTokens()
      return null
    }

    return this.getUserInfo()
  }

  // ============================================
  // JWT DECODING
  // ============================================

  /**
   * Decode a JWT token to extract claims.
   */
  private decodeToken(token: string): TokenClaims | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }

      const payload = parts[1]
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decoded) as TokenClaims
    } catch (error) {
      console.error('Failed to decode JWT token:', error)
      return null
    }
  }

  /**
   * Get user information from the current access token.
   */
  getUserInfo(): User | null {
    if (!this.accessToken) {
      return null
    }

    const claims = this.decodeToken(this.accessToken)
    if (!claims) {
      return null
    }

    return {
      id: claims.sub,
      username: claims.preferred_username,
      email: claims.email || '',
      firstName: claims.given_name,
      lastName: claims.family_name,
      roles: claims.realm_access?.roles || [],
    }
  }

  // ============================================
  // TOKEN EXPIRATION
  // ============================================

  /**
   * Check if the access token is expired or about to expire.
   * Uses a 30-second buffer to proactively refresh.
   */
  isTokenExpired(): boolean {
    if (!this.tokenExpiry) {
      return true
    }
    return Date.now() >= this.tokenExpiry - TOKEN_REFRESH_BUFFER_MS
  }

  /**
   * Check if we have a valid session (token exists and not expired).
   */
  hasValidSession(): boolean {
    return !!this.accessToken && !this.isTokenExpired()
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  /**
   * Login with username and password using the password grant flow.
   */
  async login(credentials: LoginCredentials): Promise<User> {
    const tokenUrl = getTokenEndpoint()

    const body = new URLSearchParams({
      client_id: keycloakConfig.clientId,
      username: credentials.username,
      password: credentials.password,
      grant_type: 'password',
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.error_description || errorData.error || 'Authentication failed'
      throw new Error(errorMessage)
    }

    const tokenResponse: TokenResponse = await response.json()
    this.setTokens(tokenResponse)

    const user = this.getUserInfo()
    if (!user) {
      throw new Error('Failed to extract user information from token')
    }

    return user
  }

  /**
   * Logout the user, clearing all tokens.
   */
  logout(): void {
    // Optionally notify Keycloak (fire-and-forget)
    if (this.refreshToken) {
      const logoutUrl = getLogoutEndpoint()
      const body = new URLSearchParams({
        client_id: keycloakConfig.clientId,
        refresh_token: this.refreshToken,
      })

      // Fire and forget - don't wait for response
      fetch(logoutUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
      }).catch(() => {
        // Ignore errors during logout notification
      })
    }

    this.clearTokens()
  }

  // ============================================
  // TOKEN REFRESH
  // ============================================

  /**
   * Refresh the access token using the refresh token.
   */
  async refreshAccessToken(): Promise<TokenResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const tokenUrl = getTokenEndpoint()

    const body = new URLSearchParams({
      client_id: keycloakConfig.clientId,
      refresh_token: this.refreshToken,
      grant_type: 'refresh_token',
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    })

    if (!response.ok) {
      // Refresh failed - clear tokens and re-throw
      this.clearTokens()
      throw new Error('Token refresh failed')
    }

    const tokenResponse: TokenResponse = await response.json()
    this.setTokens(tokenResponse)

    return tokenResponse
  }

  /**
   * Get a valid access token, refreshing if necessary.
   */
  async getValidToken(): Promise<string> {
    if (!this.accessToken) {
      // Try to restore from storage
      this.restoreFromStorage()

      if (!this.accessToken) {
        throw new Error('Not authenticated')
      }
    }

    if (this.isTokenExpired()) {
      await this.refreshAccessToken()
    }

    return this.accessToken!
  }

  // ============================================
  // ROLE CHECKING
  // ============================================

  /**
   * Check if the current user has a specific role.
   */
  hasRole(role: string): boolean {
    const user = this.getUserInfo()
    return user?.roles?.includes(role) || false
  }

  /**
   * Check if the current user has the admin role.
   */
  isAdmin(): boolean {
    return this.hasRole('admin')
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export class for testing
export { AuthService }
