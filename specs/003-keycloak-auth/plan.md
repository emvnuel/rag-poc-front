# Implementation Plan: Keycloak Authentication

**Branch**: `003-keycloak-auth` | **Date**: 2025-12-21 | **Spec**: [spec.md](file:///Users/emanuelcerqueira/Documents/rag-poc-front/specs/003-keycloak-auth/spec.md)  
**Input**: Feature specification from `/specs/003-keycloak-auth/spec.md`

## Summary

Implement Keycloak-based authentication for the RAG Knowledge Platform frontend. This includes user login/logout, JWT token management with automatic refresh, role-based access control, and protected routes. The implementation follows the user-provided pseudo-code pattern using a singleton AuthService class with React Context for state management.

## Technical Context

**Language/Version**: TypeScript 5.9.3  
**Primary Dependencies**: React 19.2, Vite 7.2, axios, react-router-dom  
**Storage**: localStorage for token persistence  
**Testing**: Vitest (unit), Playwright (E2E)  
**Target Platform**: Browser (Chrome, Firefox, Safari, Mobile)  
**Project Type**: Web SPA  
**Performance Goals**: Login <5s, token validation <50ms overhead  
**Constraints**: Frontend-only implementation, no backend changes required

## Constitution Check

_GATE: Passed - No violations identified_

The constitution template does not have specific constraints that conflict with this implementation.

## Project Structure

### Documentation (this feature)

```text
specs/003-keycloak-auth/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technical decisions
├── data-model.md        # Entity definitions
├── quickstart.md        # Developer guide
├── contracts/
│   └── auth-contracts.md # TypeScript interfaces
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
src/
├── features/
│   └── auth/                     # [NEW] Authentication feature module
│       ├── components/
│       │   ├── LoginPage.tsx     # Login page with form
│       │   ├── LoginForm.tsx     # Login form component
│       │   └── ProtectedRoute.tsx # Route protection wrapper
│       ├── hooks/
│       │   └── useAuth.ts        # Auth context hook
│       ├── services/
│       │   └── auth-service.ts   # AuthService class
│       ├── types/
│       │   └── auth.types.ts     # TypeScript interfaces
│       └── AuthProvider.tsx      # React context provider
├── lib/
│   └── keycloak-config.ts        # [NEW] Keycloak configuration
├── services/
│   └── http/
│       └── client.ts             # [MODIFY] Add auth interceptor
├── pages/
│   └── LoginPage.tsx             # [NEW] Login page export
└── App.tsx                       # [MODIFY] Add AuthProvider, routes
```

**Structure Decision**: Feature-based architecture following existing patterns (features/projects/, features/documents/, features/chat/).

## Proposed Changes

### Auth Feature Module

#### [NEW] [auth.types.ts](file:///Users/emanuelcerqueira/Documents/rag-poc-front/src/features/auth/types/auth.types.ts)

TypeScript interfaces for authentication as defined in [auth-contracts.md](file:///Users/emanuelcerqueira/Documents/rag-poc-front/specs/003-keycloak-auth/contracts/auth-contracts.md).

#### [NEW] [keycloak-config.ts](file:///Users/emanuelcerqueira/Documents/rag-poc-front/src/lib/keycloak-config.ts)

Configuration object reading from environment variables:

- `VITE_KEYCLOAK_URL`
- `VITE_KEYCLOAK_REALM`
- `VITE_KEYCLOAK_CLIENT_ID`

#### [NEW] [auth-service.ts](file:///Users/emanuelcerqueira/Documents/rag-poc-front/src/features/auth/services/auth-service.ts)

Singleton AuthService class implementing:

- `login(username, password)` - Password grant authentication
- `logout()` - Clear tokens and redirect
- `getValidToken()` - Return token, auto-refresh if needed
- `refreshAccessToken()` - Refresh using refresh token
- `getUserInfo()` - Decode JWT to get user details
- `hasRole(role)` / `isAdmin()` - Role checking utilities

#### [NEW] [AuthProvider.tsx](file:///Users/emanuelcerqueira/Documents/rag-poc-front/src/features/auth/AuthProvider.tsx)

React Context provider that:

- Wraps AuthService in reactive state
- Provides `useAuth()` hook
- Restores session from localStorage on mount
- Exposes login/logout/hasRole methods

#### [NEW] [ProtectedRoute.tsx](file:///Users/emanuelcerqueira/Documents/rag-poc-front/src/features/auth/components/ProtectedRoute.tsx)

Route wrapper component that:

- Redirects to login if not authenticated
- Optionally checks for required roles
- Shows loading state during session restore

#### [NEW] [LoginPage.tsx](file:///Users/emanuelcerqueira/Documents/rag-poc-front/src/features/auth/components/LoginPage.tsx)

Login page with:

- Username/password form using react-hook-form + zod
- Error message display
- Redirect to original destination after login
- Link to Keycloak self-service (password reset)

#### [NEW] [LoginForm.tsx](file:///Users/emanuelcerqueira/Documents/rag-poc-front/src/features/auth/components/LoginForm.tsx)

Reusable form component with:

- Input validation (required fields)
- Loading state during submission
- Error handling display

---

### HTTP Client Integration

#### [MODIFY] [client.ts](file:///Users/emanuelcerqueira/Documents/rag-poc-front/src/services/http/client.ts)

Update request interceptor to:

1. Get token from AuthService
2. Add `Authorization: Bearer ${token}` header
3. On 401 response: attempt refresh, retry request
4. On refresh failure: trigger logout + redirect

---

### App Integration

#### [MODIFY] [App.tsx](file:///Users/emanuelcerqueira/Documents/rag-poc-front/src/App.tsx)

1. Import and wrap with `AuthProvider`
2. Add `/login` route for `LoginPage`
3. Wrap protected routes with `ProtectedRoute`

---

### Environment Configuration

#### [MODIFY] [.env.example](file:///Users/emanuelcerqueira/Documents/rag-poc-front/.env.example)

Add Keycloak configuration variables:

```env
# Keycloak Configuration
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=rag-saas
VITE_KEYCLOAK_CLIENT_ID=rag-saas-api
```

## Verification Plan

### Automated Tests

#### Unit Tests (Vitest)

**File**: `src/features/auth/services/auth-service.test.ts`

| Test Case          | Description                               |
| ------------------ | ----------------------------------------- |
| `login() success`  | Mock token response, verify tokens stored |
| `login() failure`  | Mock 401 response, verify error thrown    |
| `logout()`         | Verify tokens cleared from localStorage   |
| `isTokenExpired()` | Test with future/past expiry times        |
| `getValidToken()`  | Test auto-refresh when expired            |
| `getUserInfo()`    | Verify JWT decoding                       |
| `hasRole()`        | Test role checking with various claims    |

**Command**: `npm run test -- src/features/auth`

#### Integration Tests

**File**: `src/services/http/client.test.ts` (extend existing)

| Test Case                      | Description                           |
| ------------------------------ | ------------------------------------- |
| `includes auth header`         | Verify Bearer token added to requests |
| `handles 401 with refresh`     | Verify refresh attempted on 401       |
| `redirects on refresh failure` | Verify logout triggered               |

**Command**: `npm run test -- src/services/http`

### E2E Tests (Playwright)

**File**: `tests/e2e/specs/auth.spec.ts`

| Test Case                | Description                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------- |
| Login flow               | Navigate to protected page → redirect to login → submit credentials → see projects |
| Logout flow              | Login → click logout → verify cannot access protected pages                        |
| Invalid credentials      | Submit wrong password → see error message                                          |
| Protected route redirect | Access /projects without auth → redirect to /login                                 |
| Session restore          | Login → refresh page → still authenticated                                         |

**Command**: `npm run test:e2e -- --grep auth`

### Manual Verification

1. **Login Flow**
   - Start Keycloak with test user
   - Navigate to `http://localhost:5173/projects`
   - Should redirect to `/login`
   - Enter valid credentials
   - Should redirect back to `/projects` with user data

2. **Token Refresh**
   - Login successfully
   - Wait for access token expiration (or manually expire)
   - Make API request
   - Should refresh automatically without redirect

3. **Logout**
   - Click logout button in header
   - Should redirect to login page
   - Direct navigation to `/projects` should redirect to login

4. **Role-Based Access**
   - Login as regular user
   - Verify admin-only features are hidden/disabled
   - Login as admin
   - Verify admin features are accessible

## Complexity Tracking

No constitution violations to justify.
