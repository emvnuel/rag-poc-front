# Research: Replacing ROPC with PKCE

## Problem

The current authentication implementation uses **Resource Owner Password Credentials (ROPC)** grant. This flow is deprecated for OIDC and insecure for SPAs because it requires the frontend to handle user credentials directly. We need to migrate to **Authorization Code Flow with PKCE**, which is the current security standard.

## Solutions Evaluated

### 1. Manual Implementation (Browser Crypto)

- **Description**: Manually generating `code_verifier` and `code_challenge` using `crypto.subtle`, managing `sessionStorage` for state, and handling redirects/callbacks.
- **Pros**: Zero dependencies, full understanding of the flow.
- **Cons**: High complexity, high risk of security bugs (e.g., weak randomness, state injection), requires maintaining refresh logic manually.

### 2. Generic OIDC Library (`oidc-client-ts` / `react-oidc-context`)

- **Description**: Standard OIDC client libraries.
- **Pros**: Provider-agnostic, battle-tested, handles state/crypto.
- **Cons**: Generic configuration can be verbose with Keycloak quirks.

### 3. Official Keycloak Adapter (`keycloak-js`)

- **Description**: The official JavaScript adapter provided by the Keycloak project.
- **Pros**:
  - Zero-config defaults for Keycloak.
  - Built-in support for "Silent Check SSO" (iframe).
  - Handles PKCE automatically.
  - Seamless token refresh handling.
  - TypeScript support.
- **Cons**: Tied to Keycloak (though protocol is standard OIDC).

## Decision

**Use `keycloak-js`**.

### Rationale

- It is the official recommended library for Keycloak integrations.
- It abstracts away the complexity of PKCE (`code_verifier`, `code_challenge`, redirects).
- It provides robust session management out of the box.
- It simplifies the `AuthService` significantly (delegating logic to the adapter).

## Migration Impact

1.  **Dependencies**: Add `keycloak-js`.
2.  **AuthService**: Refactor to wrap `Keycloak` instance instead of manual fetch.
3.  **UI**:
    - Remove `LoginForm` (login happens on Keycloak-hosted page).
    - `LoginPage` becomes a redirector or "Sign In" landing.
4.  **Config**: Keycloak Client must be configured for "Standard Flow" and disabling "Direct Access Grants" is recommended for security.
