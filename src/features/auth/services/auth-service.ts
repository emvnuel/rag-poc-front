/**
 * Authentication service using official Keycloak adapter (PKCE).
 *
 * Wraps keycloak-js to provide authentication methods and user state.
 * Handles initialization, login, logout, and token access.
 */

import Keycloak from 'keycloak-js'
import { keycloakConfig } from '@/lib/keycloak-config'
import type { User } from '../types/auth.types'

/**
 * Singleton service for managing Keycloak authentication.
 */
class AuthService {
  private _keycloak: Keycloak | null = null

  /**
   * Get the Keycloak instance.
   * Throws if not initialized.
   */
  get keycloak(): Keycloak {
    if (!this._keycloak) {
      this._keycloak = new Keycloak({
        url: keycloakConfig.url,
        realm: keycloakConfig.realm,
        clientId: keycloakConfig.clientId,
      })
    }
    return this._keycloak!
  }

  /**
   * Initialize Keycloak adapter.
   * Checks for existing session (SSO) on load.
   */
  async init(): Promise<boolean> {
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
        enableLogging: true,
      })
      return authenticated
    } catch (error) {
      console.error('Keycloak initialization failed', error)
      return false
    }
  }

  /**
   * Redirect to Keycloak login page.
   */
  async login(): Promise<void> {
    await this.keycloak.login()
  }

  /**
   * Logout from Keycloak and clear local session.
   */
  async logout(): Promise<void> {
    await this.keycloak.logout({
      redirectUri: window.location.origin,
    })
  }

  /**
   * Get the current valid access token.
   * Keycloak adapter handles refresh transparently if expired.
   */
  get token(): string | undefined {
    return this.keycloak.token
  }

  /**
   * Get parsed user information from the token.
   */
  getUserInfo(): User | null {
    if (!this.keycloak.tokenParsed) {
      return null
    }

    const content = this.keycloak.tokenParsed as any

    return {
      id: content.sub,
      username: content.preferred_username,
      email: content.email,
      firstName: content.given_name,
      lastName: content.family_name,
      roles: content.realm_access?.roles || [],
    }
  }

  /**
   * Check if user has specific role.
   */
  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role)
  }

  /**
   * Check if user is admin.
   */
  isAdmin(): boolean {
    return this.hasRole('admin')
  }

  /**
   * Check if user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.keycloak.authenticated
  }
}

// Export singleton instance
export const authService = new AuthService()
