# Research: Keycloak Authentication Integration

**Feature**: 003-keycloak-auth  
**Date**: 2025-12-21

## Technical Decisions

### 1. Authentication Flow Pattern

**Decision**: Resource Owner Password Credentials (ROPC) Grant with Frontend Token Management

**Rationale**:

- The user-provided pseudo-code specifies direct password grant flow
- This approach keeps authentication logic frontend-controlled
- Tokens are stored in localStorage for persistence across page refreshes
- Suitable for SPAs where the client is trusted (internal application)

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|--------------|
| Authorization Code Flow + PKCE | More complex, requires redirect handling, but is the recommended OAuth2 flow for SPAs. User specified ROPC pattern. |
| Backend-for-Frontend (BFF) | Would require backend changes, adds complexity. User pseudo-code indicates frontend-only approach. |
| Keycloak JS Adapter | Official library but heavier dependency. Custom implementation provides more control. |

### 2. Token Storage Strategy

**Decision**: localStorage with in-memory caching

**Rationale**:

- User pseudo-code explicitly uses localStorage
- In-memory cache provides faster access for frequent operations
- Tokens automatically persist across browser sessions
- Works well with browser tab synchronization

**Security Considerations**:

- localStorage is vulnerable to XSS attacks
- Mitigation: Use short-lived access tokens (5-15 minutes)
- Mitigation: Implement proper CSP headers
- For higher security requirements, consider HttpOnly cookies with CSRF protection

### 3. Token Refresh Strategy

**Decision**: Proactive refresh with 30-second buffer before expiration

**Rationale**:

- Prevents user interruption during active sessions
- 30-second buffer accounts for network latency
- On 401 response, attempt one refresh before redirecting to login

### 4. State Management for Auth

**Decision**: React Context + AuthService singleton

**Rationale**:

- Keeps auth state globally accessible via `useAuth()` hook
- AuthService class encapsulates token management logic
- React Context provides reactive UI updates on auth state changes
- Consistent with existing project patterns (WorkspaceContext)

### 5. Protected Route Implementation

**Decision**: React Router wrapper components

**Rationale**:

- Integrates with existing react-router-dom setup
- Provides declarative route protection
- Supports role-based access via additional wrapper

### 6. Keycloak Configuration

**Decision**: Environment-based configuration

| Variable                  | Description         | Default                 |
| ------------------------- | ------------------- | ----------------------- |
| `VITE_KEYCLOAK_URL`       | Keycloak server URL | `http://localhost:8180` |
| `VITE_KEYCLOAK_REALM`     | Keycloak realm name | `rag-saas`              |
| `VITE_KEYCLOAK_CLIENT_ID` | OAuth2 client ID    | `rag-saas-api`          |

**Rationale**:

- Follows existing VITE\_\* environment variable pattern
- No client secret needed for public frontend (SPA) clients

## Existing Code Analysis

### HTTP Client (`src/services/http/client.ts`)

Current implementation already has:

- ✅ Axios instance with interceptors
- ✅ TODO comment for JWT token injection (line 50-54)
- ✅ 401 error handling placeholder (line 78-80)
- ✅ Error transformation for consistent error handling

**Modifications needed**:

1. Add `Authorization: Bearer ${token}` in request interceptor
2. Implement automatic token refresh on 401 response
3. Redirect to login when refresh fails

### App Structure (`src/App.tsx`)

Current implementation:

- ✅ Provider pattern already established (ThemeProvider, QueryClientProvider, WorkspaceProvider)
- ✅ React Router for client-side routing
- ⚠️ No authentication provider or protected routes

**Modifications needed**:

1. Add `AuthProvider` to component tree
2. Wrap protected routes with authentication check
3. Add login page route

### Testing Infrastructure

Existing:

- ✅ Vitest for unit tests
- ✅ Playwright for E2E tests
- ✅ Test utilities in `tests/e2e/fixtures`

**Testing approach**:

- Unit tests for AuthService class methods
- Integration tests for HTTP client with auth headers
- E2E tests for login/logout flows

## Dependencies Assessment

### New Dependencies Required

| Package | Purpose                                    | Version |
| ------- | ------------------------------------------ | ------- |
| None    | Custom implementation per user pseudo-code | N/A     |

**Rationale**: The user's pseudo-code provides a lightweight, dependency-free implementation using standard Fetch/Axios APIs. No new packages required.

## Assumptions

1. **Keycloak is already configured** with a `rag-saas` realm and `rag-saas-api` client
2. **Client is public** (no client secret required for SPA)
3. **Direct Access Grants are enabled** in Keycloak client settings (for ROPC flow)
4. **Backend API validates Bearer tokens** against the same Keycloak realm
5. **Role claims are in `realm_access.roles`** JWT claim structure
