---
description: "Tasks for migrating Keycloak authentication from ROPC to PKCE"
---

# Tasks: Authorization and Authentication using Keycloak server

**Input**: Design documents from `/specs/003-keycloak-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the spec, manual verification will be used.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install `keycloak-js` dependency in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Refactor `AuthService` to wrap `Keycloak` instance in src/features/auth/services/auth-service.ts
- [x] T003 Refactor `AuthProvider` to initialize Keycloak asynchronously in src/features/auth/AuthProvider.tsx
- [x] T004 Update HTTP client interceptors to use `keycloak.updateToken()` in src/services/http/client.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Login with Keycloak (Priority: P1) 🎯 MVP

**Goal**: Users authenticate via Keycloak-hosted login page (Standard Flow) instead of custom form.

**Independent Test**: Click "Sign In", redirect to Keycloak, login, redirect back, verified session.

### Implementation for User Story 1

- [x] T005 [P] [US1] Update `LoginPage` to trigger Keycloak login redirect in src/features/auth/components/LoginPage.tsx
- [x] T006 [P] [US1] Remove unnecessary `LoginForm` component in src/features/auth/components/LoginForm.tsx
- [x] T007 [US1] Update `ProtectedRoute` to handle Keycloak loading state in src/features/auth/components/ProtectedRoute.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - User Logout (Priority: P1)

**Goal**: Logout terminates Keycloak session via redirect.

**Independent Test**: Click Logout, redirect to Keycloak, session killed, redirect back.

### Implementation for User Story 2

- [x] T008 [US2] Update `UserMenu` to use new `logout` method from AuthService in src/features/auth/components/UserMenu.tsx
- [x] T009 [US2] Verify logout redirect behavior in src/features/auth/services/auth-service.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Role-Based Access Control (Priority: P2)

**Goal**: Ensure roles are correctly extracted from ID Token/Access Token.

**Independent Test**: Verify Admin-only access works with new token structure.

### Implementation for User Story 3

- [x] T010 [US3] Update role extraction logic in `getUserInfo` to use Keycloak adapter in src/features/auth/services/auth-service.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Token Refresh (Priority: P2)

**Goal**: Silent token refresh handled automatically by adapter.

**Independent Test**: Wait for token expiry, verify seamless refresh.

### Implementation for User Story 4

- [x] T011 [US4] Verify `minValidity` setting in HTTP interceptor in src/services/http/client.ts

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T012 Update `README.md` with new `keycloak-js` configuration details
- [x] T013 Remove any unused ROPC-related types in src/features/auth/types/auth.types.ts
- [x] T014 Run `quickstart.md` validation (Keycloak Config Check)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2)

### Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
