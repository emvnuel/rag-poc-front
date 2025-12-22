# Data Model

## Entities

### User

Represents the authenticated user.

- **id** (string): Unique subject ID (from `sub` claim).
- **username** (string): Preferred username.
- **email** (string): Email address.
- **firstName** (string): Given name.
- **lastName** (string): Family name.
- **roles** (string[]): List of assigned realm roles.

### Session

Represents the active browser session.
_Managed internally by `keycloak-js` adapter._

- **token** (string): JWT Access Token.
- **refreshToken** (string): JWT Refresh Token.
- **idToken** (string): JWT ID Token (contains user info).
- **authenticated** (boolean): Connection status.

## State Management

- **Token Storage**: `keycloak-js` manages tokens (memory or sessionStorage/localStorage based on config). We will use default (memory) or `localStorage` adapter to persist across reloads.
- **User State**: Exposed via `AuthProvider` React Context.
