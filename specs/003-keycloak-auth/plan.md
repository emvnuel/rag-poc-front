# Implementation Plan: Keycloak Authentication (PKCE Migration)

**Branch**: `003-keycloak-auth` | **Spec**: [specs/003-keycloak-auth/spec.md](./spec.md)
**Input**: Replace ROPC with PKCE flow.

## Summary

Migrate the current Resource Owner Password Credentials (ROPC) implementation to **Authorization Code Flow with PKCE** using the official `keycloak-js` adapter. This improves security by removing direct credential handling from the frontend and leveraging standard OIDC redirects.

## Technical Context

**Language/Version**: TypeScript 5.x / React 18
**Primary Dependencies**: `keycloak-js` (New), `axios`, `react-router-dom`
**Storage**: `keycloak-js` internal memory/localStorage adapter
**Constraints**: Must maintain existing `AuthProvider` interface for consuming components (minimal refactor impact on rest of app).

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Security**: PKCE is the NIST-recommended OAuth 2.0 flow for browser-based apps. ROPC is discouraged.
- **Maintainability**: Offloading auth complexity to `keycloak-js` reduces custom code maintenance.

## Project Structure

### Documentation (this feature)

```text
specs/003-keycloak-auth/
├── plan.md              # This file
├── research.md          # Decision log (Manual vs Library)
├── data-model.md        # Session entities
├── quickstart.md        # Keycloak Config guide
├── contracts/           # API references
└── tasks.md             # To be generated
```

### Proposed Changes

#### 1. Dependencies

- Install `keycloak-js`.

#### 2. Authentication Layer

- **Refactor** `src/features/auth/services/auth-service.ts`:
  - Replace manual fetch logic with `Keycloak` instance initialization.
  - Implement `init()`, `login()`, `logout()`.
  - Expose `token`, `parsedToken` (user info).
- **Refactor** `src/features/auth/AuthProvider.tsx`:
  - Initialize Keycloak on mount.
  - Handle loading state while checking SSO session (iframe).
  - Update context value providers.

#### 3. UI Components

- **Modify** `src/features/auth/components/LoginPage.tsx`:
  - Remove username/password form.
  - Add "Sign In with Keycloak" button (redirects to Keycloak).
- **Delete** `src/features/auth/components/LoginForm.tsx`:
  - No longer needed.

#### 4. HTTP Client

- **Update** `src/services/http/client.ts`:
  - Update interceptor to use `keycloak.updateToken()` (which handles refresh automatically) before attaching the header.

## Verification Plan

### Automated Tests

- N/A (Integration requires running Keycloak).

### Manual Verification

1.  **Login**: Click "Sign In" -> Redirect to Keycloak -> Login -> Redirect back -> Authenticated.
2.  **Token Refresh**: Wait for Access Token expiry (5min). Verify app silently refreshes without error.
3.  **Logout**: Click Logout -> Redirect to Keycloak -> Session killed -> Redirect back -> Public page.
4.  **SSO**: Open new tab -> App should auto-login (if session valid).
