# Quickstart: Keycloak Configuration

## Client Configuration

To support **PKCE**, the Client in Keycloak must be configured as follows:

1.  **Open Keycloak Admin Console**.
2.  Go to **Clients** > `rag-saas-api`.
3.  **Capability config**:
    - [x] **Client authentication**: Off (Public Client)
    - [x] **Authorization**: Off
    - [x] **Authentication flow**:
      - [x] **Standard flow** (Required for PKCE)
      - [x] **Direct access grants**: **OFF** (Recommended to disable ROPC)
      - [ ] Implicit flow: Off

4.  **Access settings**:
    - **Valid redirect URIs**: `http://localhost:5173/*` (Must match your app URL perfectly)
    - **Web origins**: `http://localhost:5173` (or `+`)

## Environment Variables

Ensure `.env` contains:

```env
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=rag-saas
VITE_KEYCLOAK_CLIENT_ID=rag-saas-api
```
