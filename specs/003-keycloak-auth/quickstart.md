# Quickstart: Keycloak Authentication

**Feature**: 003-keycloak-auth  
**Date**: 2025-12-21

## Prerequisites

1. **Keycloak Server** running at `http://localhost:8180`
2. **Realm**: `rag-saas` configured
3. **Client**: `rag-saas-api` with Direct Access Grants enabled
4. **Test User**: Created in Keycloak with assigned roles

## Environment Setup

Update `.env`:

```env
# Keycloak Configuration
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=rag-saas
VITE_KEYCLOAK_CLIENT_ID=rag-saas-api
```

## Quick Test

### 1. Login via Console

```javascript
// In browser console after feature is implemented
const auth = window.__auth; // Exposed for debugging
await auth.login({ username: "testuser", password: "password" });
console.log("Logged in as:", auth.getUserInfo());
```

### 2. API Request Test

```javascript
// After login, all API requests automatically include token
const response = await fetch("http://localhost:42069/projects", {
  headers: {
    Authorization: `Bearer ${await auth.getValidToken()}`,
  },
});
console.log(await response.json());
```

### 3. Logout Test

```javascript
auth.logout();
console.log("Logged out, token cleared");
```

## File Structure (After Implementation)

```text
src/
├── features/auth/
│   ├── components/
│   │   ├── LoginPage.tsx          # Login form page
│   │   ├── LoginForm.tsx          # Form component
│   │   └── ProtectedRoute.tsx     # Route wrapper
│   ├── hooks/
│   │   └── useAuth.ts             # Auth context hook
│   ├── services/
│   │   └── auth-service.ts        # AuthService class
│   ├── types/
│   │   └── auth.types.ts          # TypeScript interfaces
│   └── AuthProvider.tsx           # React context provider
└── lib/
    └── keycloak-config.ts         # Keycloak configuration
```

## Development Workflow

1. Start Keycloak: `docker-compose up keycloak`
2. Start Backend: (backend startup command)
3. Start Frontend: `npm run dev`
4. Navigate to `http://localhost:5173` → Redirected to login
5. Enter credentials → See projects page

## Testing

### Unit Tests

```bash
npm run test -- --filter auth
```

### E2E Tests

```bash
npm run test:e2e -- --grep "auth"
```

## Troubleshooting

### "Invalid credentials" error

- Verify username/password in Keycloak admin console
- Check Direct Access Grants is enabled for client

### Token refresh failing

- Check refresh token hasn't expired (default 30 minutes)
- Verify client isn't configured as confidential

### CORS errors

- Ensure Keycloak client has `http://localhost:5173` in Web Origins
- Backend API should allow `http://localhost:5173` origin
