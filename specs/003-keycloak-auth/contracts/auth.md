# API Contracts

## Keycloak OIDC Endpoints (Reference)

The application interacts with these endpoints via `keycloak-js`.

### Authorization Endpoint

Initiates the PKCE flow.

- **URL**: `GET /realms/{realm}/protocol/openid-connect/auth`
- **Params**:
  - `client_id`: `rag-saas-api`
  - `response_type`: `code`
  - `redirect_uri`: Application URL (`http://localhost:5173`)
  - `code_challenge`: SHA-256 hash of verifier
  - `code_challenge_method`: `S256`

### Token Endpoint

Exchanges code for tokens.

- **URL**: `POST /realms/{realm}/protocol/openid-connect/token`
- **Body**:
  - `grant_type`: `authorization_code`
  - `code`: The authorization code
  - `code_verifier`: The original verifier
  - `redirect_uri`: Application URL

### UserInfo Endpoint

Retrieves profile data (optional, claims usually in ID Token).

- **URL**: `GET /realms/{realm}/protocol/openid-connect/userinfo`
