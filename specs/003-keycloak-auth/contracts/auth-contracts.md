# API Contracts: Authentication

**Feature**: 003-keycloak-auth  
**Date**: 2025-12-21

## TypeScript Interfaces

```typescript
// ============================================
// CONFIGURATION
// ============================================

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

// ============================================
// AUTHENTICATION TYPES
// ============================================

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: "Bearer";
  scope?: string;
}

export interface TokenClaims {
  sub: string;
  preferred_username: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  exp: number;
  iat: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

// ============================================
// AUTH STATE
// ============================================

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "RESTORE_SESSION"; payload: User }
  | { type: "CLEAR_ERROR" };

// ============================================
// AUTH SERVICE INTERFACE
// ============================================

export interface IAuthService {
  // Authentication
  login(credentials: LoginCredentials): Promise<User>;
  logout(): void;

  // Token management
  getValidToken(): Promise<string>;
  isTokenExpired(): boolean;
  refreshAccessToken(): Promise<TokenResponse>;

  // User info
  getUserInfo(): User | null;
  hasRole(role: string): boolean;
  isAdmin(): boolean;

  // Session
  restoreSession(): User | null;
}

// ============================================
// AUTH CONTEXT
// ============================================

export interface AuthContextValue {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  clearError: () => void;
}
```

## Keycloak Endpoints

### Token Endpoint

**URL**: `{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/token`

#### Password Grant (Login)

```http
POST /realms/{realm}/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

client_id={CLIENT_ID}&
username={USERNAME}&
password={PASSWORD}&
grant_type=password
```

**Response (200 OK)**:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "token_type": "Bearer",
  "scope": "profile email"
}
```

**Error Response (401 Unauthorized)**:

```json
{
  "error": "invalid_grant",
  "error_description": "Invalid user credentials"
}
```

#### Refresh Token

```http
POST /realms/{realm}/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

client_id={CLIENT_ID}&
refresh_token={REFRESH_TOKEN}&
grant_type=refresh_token
```

### Logout Endpoint

**URL**: `{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/logout`

```http
POST /realms/{realm}/protocol/openid-connect/logout
Content-Type: application/x-www-form-urlencoded

client_id={CLIENT_ID}&
refresh_token={REFRESH_TOKEN}
```

## Protected API Authentication

All protected API requests MUST include the Authorization header:

```http
GET /projects
Authorization: Bearer {ACCESS_TOKEN}
```

### Error Responses

| Status | Description              | Action                                              |
| ------ | ------------------------ | --------------------------------------------------- |
| 401    | Token expired or invalid | Attempt token refresh, redirect to login on failure |
| 403    | Insufficient permissions | Show access denied message                          |
