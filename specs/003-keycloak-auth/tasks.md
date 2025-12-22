# Tasks: Keycloak Authentication

**Input**: Design documents from `/specs/003-keycloak-auth/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and auth feature structure

- [x] T001 Add Keycloak environment variables to `.env.example`
- [x] T002 Create Keycloak configuration module in `src/lib/keycloak-config.ts`
- [x] T003 [P] Create auth types file in `src/features/auth/types/auth.types.ts`
- [x] T004 [P] Create feature directory structure for `src/features/auth/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core auth infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Implement AuthService class core in `src/features/auth/services/auth-service.ts` with token storage methods (`setTokens`, `clearTokens`, `restoreSession`)
- [x] T006 Add JWT decoding function to AuthService (`decodeToken`, `getUserInfo`)
- [x] T007 Add token expiration checking to AuthService (`isTokenExpired`, 30s buffer)
- [x] T008 Create AuthContext and AuthProvider in `src/features/auth/AuthProvider.tsx`
- [x] T009 Create useAuth hook in `src/features/auth/hooks/useAuth.ts`
- [x] T010 Integrate AuthProvider into `src/App.tsx` (wrap existing providers)

**Checkpoint**: Auth foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - User Login with Keycloak (Priority: P1) 🎯 MVP

**Goal**: Users can authenticate using username/password via Keycloak

**Independent Test**: Navigate to protected page → redirect to login → enter credentials → access projects page

### Implementation for User Story 1

- [x] T011 [US1] Implement `login(username, password)` method in AuthService using password grant flow
- [x] T012 [US1] Add login action to AuthProvider with error handling and loading state
- [x] T013 [P] [US1] Create LoginForm component in `src/features/auth/components/LoginForm.tsx` with react-hook-form + zod validation
- [x] T014 [P] [US1] Create LoginPage component in `src/features/auth/components/LoginPage.tsx`
- [x] T015 [US1] Create ProtectedRoute wrapper component in `src/features/auth/components/ProtectedRoute.tsx`
- [x] T016 [US1] Add `/login` route to `src/App.tsx`
- [x] T017 [US1] Wrap existing routes (/, /projects/\*) with ProtectedRoute in `src/App.tsx`
- [x] T018 [US1] Update HTTP client `src/services/http/client.ts` to add Authorization header from AuthService

**Checkpoint**: User Story 1 complete - users can log in and access protected resources

---

## Phase 4: User Story 2 - User Logout (Priority: P1)

**Goal**: Authenticated users can log out, terminating their session

**Independent Test**: Login → click logout → verify redirect to login → verify protected pages inaccessible

### Implementation for User Story 2

- [x] T019 [US2] Implement `logout()` method in AuthService (clear tokens, localStorage)
- [x] T020 [US2] Add logout action to AuthProvider
- [x] T021 [US2] Add logout button to application header in `src/components/layout/Layout.tsx` or Header component
- [x] T022 [US2] Redirect to /login after logout

**Checkpoint**: User Story 2 complete - users can log out securely

---

## Phase 5: User Story 3 - Role-Based Access Control (Priority: P2)

**Goal**: Restrict features based on user roles (admin, user) from Keycloak

**Independent Test**: Login as regular user → verify admin features hidden; Login as admin → verify admin features accessible

### Implementation for User Story 3

- [x] T023 [US3] Implement `hasRole(role)` method in AuthService using `realm_access.roles` claim
- [x] T024 [US3] Implement `isAdmin()` convenience method in AuthService
- [x] T025 [US3] Expose hasRole and isAdmin through AuthProvider and useAuth hook
- [x] T026 [US3] Add optional `requiredRoles` prop to ProtectedRoute component
- [x] T027 [US3] Create AccessDenied component in `src/features/auth/components/AccessDenied.tsx`
- [x] T028 [US3] Update ProtectedRoute to show AccessDenied when role requirements not met

**Checkpoint**: User Story 3 complete - role-based access control functional

---

## Phase 6: User Story 4 - Token Refresh (Priority: P2)

**Goal**: Automatically refresh expired tokens without user interruption

**Independent Test**: Login → wait for token expiration → make API request → verify seamless refresh without redirect

### Implementation for User Story 4

- [x] T029 [US4] Implement `refreshAccessToken()` method in AuthService
- [x] T030 [US4] Update `getValidToken()` to call refresh when token expired
- [x] T031 [US4] Update HTTP client `src/services/http/client.ts` response interceptor to handle 401 with token refresh
- [x] T032 [US4] Implement retry logic in HTTP client: on 401 → refresh → retry request once
- [x] T033 [US4] Handle refresh failure: logout user and redirect to /login

**Checkpoint**: User Story 4 complete - seamless token refresh implemented

---

## Phase 7: User Story 5 - Session Management (Priority: P3)

**Goal**: Users can view and remotely terminate their sessions

**Independent Test**: Login from multiple browsers → view sessions list → terminate remote session → verify that session becomes inactive

> **NOTE**: This story requires Keycloak Account API integration and may be deferred.

### Implementation for User Story 5

- [ ] T034 [US5] Research Keycloak Account REST API for session listing
- [ ] T035 [P] [US5] Create SessionList component in `src/features/auth/components/SessionList.tsx`
- [ ] T036 [P] [US5] Create SessionManagementPage in `src/features/auth/components/SessionManagementPage.tsx`
- [ ] T037 [US5] Implement `getSessions()` method in AuthService using Keycloak API
- [ ] T038 [US5] Implement `terminateSession(sessionId)` method in AuthService
- [ ] T039 [US5] Add session management route `/settings/sessions` to App.tsx

**Checkpoint**: User Story 5 complete - full session management available

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T040 [P] Add error boundary for auth errors in AuthProvider
- [ ] T041 [P] Add loading skeleton to ProtectedRoute during session restore
- [ ] T042 Handle Keycloak unavailability with friendly error message
- [x] T043 [P] Add user display (username/avatar) to application header
- [x] T044 [P] Update README.md with Keycloak setup instructions
- [ ] T045 Run quickstart.md validation scenarios
- [ ] T046 Code cleanup and ensure consistent error handling

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 + US2 are both P1 priority and can be done sequentially
  - US3 + US4 are P2 and can proceed after US1/US2
  - US5 is P3 and can be deferred
- **Polish (Phase 8)**: Depends on desired user stories being complete

### User Story Dependencies

| Story               | Priority | Depends On                       | Independent Test             |
| ------------------- | -------- | -------------------------------- | ---------------------------- |
| US1 - Login         | P1       | Foundational                     | Login flow end-to-end        |
| US2 - Logout        | P1       | US1 (needs login to test logout) | Logout + verify redirect     |
| US3 - RBAC          | P2       | US1                              | Role-based feature access    |
| US4 - Token Refresh | P2       | US1                              | API call with expired token  |
| US5 - Sessions      | P3       | US1                              | Session list and termination |

### Within Each User Story

- Core AuthService methods first
- Context/Provider updates second
- UI components third
- App.tsx integration last

### Parallel Opportunities

**Setup Phase**:

```
T003 (auth.types.ts) || T004 (directory structure)
```

**User Story 1**:

```
T013 (LoginForm) || T014 (LoginPage)
```

**User Story 5**:

```
T035 (SessionList) || T036 (SessionManagementPage)
```

**Polish Phase**:

```
T040 (error boundary) || T041 (loading skeleton) || T043 (user display) || T044 (README)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Login)
4. Complete Phase 4: User Story 2 (Logout)
5. **STOP and VALIDATE**: Full login/logout flow works
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Login) → Test independently → **MVP Deployable!**
3. Add US2 (Logout) → Test independently → **Basic Auth Complete**
4. Add US3 (RBAC) → Test independently → Role restrictions active
5. Add US4 (Token Refresh) → Test independently → Seamless UX
6. Add US5 (Sessions) → Test independently → Full security features

---

## Summary

| Phase               | Task Count | Description                      |
| ------------------- | ---------- | -------------------------------- |
| Setup               | 4          | Environment, config, types       |
| Foundational        | 6          | AuthService core, Provider, hook |
| US1 - Login         | 8          | Password grant, form, routes     |
| US2 - Logout        | 4          | Clear tokens, UI button          |
| US3 - RBAC          | 6          | Role checking, protected routes  |
| US4 - Token Refresh | 5          | Auto-refresh, HTTP interceptor   |
| US5 - Sessions      | 6          | Session list, remote terminate   |
| Polish              | 7          | Error handling, UX improvements  |
| **Total**           | **46**     |                                  |

**MVP Scope**: Phases 1-4 (22 tasks) - Complete login/logout functionality

**Parallel Opportunities**: 12 tasks can run in parallel across phases

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after Foundational
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US5 (Session Management) can be deferred if Keycloak Account API is not available
