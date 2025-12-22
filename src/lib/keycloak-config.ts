/**
 * Keycloak configuration for authentication.
 *
 * Reads configuration from environment variables, with sensible defaults
 * for local development.
 */

export interface KeycloakConfig {
  /** Keycloak server URL (e.g., http://localhost:8180) */
  url: string
  /** Keycloak realm name */
  realm: string
  /** OAuth2 client ID */
  clientId: string
}

/**
 * Get the configured Keycloak settings.
 * Uses environment variables with fallback to localhost defaults.
 */
export const keycloakConfig: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'rag-saas',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'rag-saas-api',
}

/**
 * Get the token endpoint URL for the configured Keycloak realm.
 */
export function getTokenEndpoint(): string {
  return `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`
}

/**
 * Get the logout endpoint URL for the configured Keycloak realm.
 */
export function getLogoutEndpoint(): string {
  return `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout`
}

/**
 * Get the account endpoint URL for the configured Keycloak realm.
 * Used for session management features.
 */
export function getAccountEndpoint(): string {
  return `${keycloakConfig.url}/realms/${keycloakConfig.realm}/account`
}
