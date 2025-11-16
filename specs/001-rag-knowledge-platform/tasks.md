# Tasks: RAG Knowledge Platform

**Input**: Design documents from `/specs/001-rag-knowledge-platform/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are NOT explicitly requested in the feature specification. This task list focuses on implementation tasks only. If TDD approach is later required, test tasks can be added before implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend-only project**: `src/`, `tests/` at repository root
- Connecting to existing backend API at `http://localhost:42069`

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Project initialization, dependencies, and tooling setup

- [x] T001 Initialize Shadcn UI with Tailwind CSS configuration at project root
- [x] T002 [P] Install core dependencies: @tanstack/react-query, axios, react-router-dom, next-themes
- [x] T003 [P] Install form dependencies: react-hook-form, zod, @hookform/resolvers
- [x] T004 [P] Install file upload dependency: react-dropzone
- [x] T005 [P] Install testing dependencies: vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, @vitest/ui, jsdom
- [x] T006 [P] Install E2E testing: @playwright/test and initialize Playwright
- [x] T007 [P] Install React Query devtools: @tanstack/react-query-devtools
- [x] T008 Create environment files: .env and .env.example with VITE_API_BASE_URL=http://localhost:42069
- [x] T009 Configure Vitest in vite.config.ts with coverage thresholds (90% statements, 80% branches)
- [x] T010 [P] Configure Playwright in playwright.config.ts for E2E testing
- [x] T011 [P] Create VS Code workspace settings in .vscode/settings.json with ESLint and Tailwind configuration
- [x] T012 [P] Create VS Code extensions recommendations in .vscode/extensions.json
- [x] T013 Add npm scripts to package.json: test, test:watch, test:coverage, test:ui, test:e2e, generate:api
- [x] T014 Generate TypeScript types from OpenAPI spec at http://localhost:42069/openapi.json to src/services/api/generated/

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### HTTP Client and API Infrastructure

- [x] T015 Create HTTP client configuration in src/services/http/client.ts with Axios instance, base URL, timeout, interceptors
- [x] T016 [P] Create retry logic utility in src/services/http/retry.ts for retryable API requests
- [x] T017 [P] Create API error types and error message mapping in src/lib/errors.ts
- [x] T018 Create React Query configuration in src/lib/query-client.ts with default stale times and retry settings
- [x] T019 Create React Query key factory in src/lib/query-keys.ts for type-safe cache keys

### Shared Components and Utilities

- [x] T020 [P] Install and configure Shadcn Button component in src/components/ui/button.tsx
- [x] T021 [P] Install and configure Shadcn Card component in src/components/ui/card.tsx
- [x] T022 [P] Install and configure Shadcn Input component in src/components/ui/input.tsx
- [x] T023 [P] Install and configure Shadcn Label component in src/components/ui/label.tsx
- [x] T024 [P] Install and configure Shadcn Dialog component in src/components/ui/dialog.tsx
- [x] T025 [P] Install and configure Shadcn Toast/Sonner component in src/components/ui/sonner.tsx
- [x] T026 [P] Install and configure Shadcn Skeleton component in src/components/ui/skeleton.tsx
- [x] T027 [P] Install and configure Shadcn Progress component in src/components/ui/progress.tsx
- [x] T028 [P] Install and configure Shadcn Badge component in src/components/ui/badge.tsx
- [x] T029 [P] Install and configure Shadcn Dropdown Menu component in src/components/ui/dropdown-menu.tsx

### Layout and Theme Infrastructure

- [x] T030 Create theme provider wrapper in src/components/layout/ThemeProvider.tsx using next-themes
- [x] T031 [P] Create main layout component in src/components/layout/Layout.tsx with header and main content area
- [x] T032 [P] Create header component in src/components/layout/Header.tsx with workspace selector and theme toggle
- [x] T033 [P] Create theme toggle component in src/components/common/ThemeToggle.tsx

### Context and State Management

- [x] T034 Create workspace context in src/contexts/WorkspaceContext.tsx for current project selection
- [x] T035 Create workspace context provider hook in src/hooks/useWorkspace.ts

### Routing Infrastructure

- [x] T036 Setup React Router configuration in src/App.tsx with routes for projects, documents, chat, knowledge graph
- [x] T037 Create route paths constants in src/lib/routes.ts
- [x] T038 [P] Create error boundary component in src/components/common/ErrorBoundary.tsx
- [x] T039 [P] Create loading fallback component in src/components/common/LoadingFallback.tsx

### Type Definitions and Validation Schemas

- [x] T040 [P] Create shared TypeScript types in src/types/project.ts (Project, ProjectCreateRequest, ProjectUpdateRequest)
- [x] T041 [P] Create shared TypeScript types in src/types/document.ts (Document, DocumentType, DocumentStatus, FileUploadRequest, TextRequest, WebsiteRequest)
- [x] T042 [P] Create shared TypeScript types in src/types/chat.ts (ChatMessage, ChatRequest, ChatResponse, SearchResult)
- [x] T043 [P] Create shared TypeScript types in src/types/api.ts (ApiError, PaginatedResponse)
- [x] T044 [P] Create Zod validation schema in src/lib/validators/project.ts for project create/update
- [x] T045 [P] Create Zod validation schema in src/lib/validators/document.ts for file upload, text, website
- [x] T046 [P] Create Zod validation schema in src/lib/validators/chat.ts for chat messages

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Document Upload and Knowledge Base Creation (Priority: P1) 🎯 MVP

**Goal**: Allow workspace members to upload documents (PDF, DOCX, TXT, MD) to build their team's knowledge base, with progress tracking and metadata display

**Independent Test**: Upload various document types (PDF, DOCX, TXT) and verify they are stored, processed (status changes from NOT_PROCESSED → PROCESSING → PROCESSED), and ready for querying. Verify batch uploads work with progress indicators.

### Feature Structure for User Story 1

- [x] T047 Create documents feature directory structure: src/features/documents/{components,hooks,services,types}

### API Service Layer for Documents (US1)

- [x] T048 [P] [US1] Create document API service in src/features/documents/services/document-api.ts with uploadFile, processText, processWebsite, getById, getProgress, deleteDocument methods
- [x] T049 [P] [US1] Create project API service in src/features/documents/services/project-api.ts with getDocuments method

### React Query Hooks for Documents (US1)

- [x] T050 [P] [US1] Create useUploadFile hook in src/features/documents/hooks/useUploadFile.ts with progress tracking and mutation
- [x] T051 [P] [US1] Create useProcessText hook in src/features/documents/hooks/useProcessText.ts
- [x] T052 [P] [US1] Create useProcessWebsite hook in src/features/documents/hooks/useProcessWebsite.ts
- [x] T053 [P] [US1] Create useProjectDocuments hook in src/features/documents/hooks/useProjectDocuments.ts to fetch documents for a project
- [x] T054 [P] [US1] Create useDocument hook in src/features/documents/hooks/useDocument.ts to fetch single document details
- [x] T055 [P] [US1] Create useDocumentProgress hook in src/features/documents/hooks/useDocumentProgress.ts with polling for PROCESSING status
- [x] T056 [P] [US1] Create useDeleteDocument hook in src/features/documents/hooks/useDeleteDocument.ts

### UI Components for Document Upload (US1)

- [x] T057 [P] [US1] Create DocumentUploadZone component in src/features/documents/components/DocumentUploadZone.tsx using react-dropzone for drag-and-drop file upload
- [x] T058 [P] [US1] Create TextUploadForm component in src/features/documents/components/TextUploadForm.tsx for direct text input
- [x] T059 [P] [US1] Create WebsiteUploadForm component in src/features/documents/components/WebsiteUploadForm.tsx for URL input
- [x] T060 [US1] Create UploadTabs component in src/features/documents/components/UploadTabs.tsx combining file, text, and website upload options
- [x] T061 [P] [US1] Create UploadProgress component in src/features/documents/components/UploadProgress.tsx displaying upload progress bars
- [x] T062 [P] [US1] Create DocumentStatusBadge component in src/features/documents/components/DocumentStatusBadge.tsx showing NOT_PROCESSED, PROCESSING, PROCESSED states

### UI Components for Document List (US1)

- [x] T063 [P] [US1] Create DocumentCard component in src/features/documents/components/DocumentCard.tsx displaying document metadata (filename, type, status, date, size)
- [x] T064 [US1] Create DocumentList component in src/features/documents/components/DocumentList.tsx rendering list of documents with status badges
- [x] T065 [P] [US1] Create DocumentDetailDialog component in src/features/documents/components/DocumentDetailDialog.tsx showing full document metadata in modal
- [x] T066 [P] [US1] Create DeleteDocumentDialog component in src/features/documents/components/DeleteDocumentDialog.tsx with confirmation prompt

### Page Components (US1)

- [x] T067 [US1] Create DocumentsPage in src/pages/DocumentsPage.tsx integrating upload zone, document list, and routing
- [x] T068 Update App.tsx routing to include /projects/:projectId/documents route pointing to DocumentsPage

### Error Handling and Validation (US1)

- [x] T069 [US1] Add client-side file validation in DocumentUploadZone: file type (PDF, DOCX, TXT, MD), 25MB size limit, clear error messages
- [x] T070 [US1] Add error toast notifications for upload failures using Sonner component
- [x] T071 [US1] Add success toast notifications for successful uploads

**Checkpoint**: At this point, User Story 1 should be fully functional - users can upload documents via file/text/website, see progress, view document list with status, and delete documents

---

## Phase 4: User Story 2 - Question and Answer Chat Interface (Priority: P1) 🎯 MVP

**Goal**: Enable workspace members to ask questions in natural language and receive answers based on uploaded documents, with source citations and conversation context

**Independent Test**: Upload sample documents, ask questions requiring information retrieval from those documents, verify relevant answers with source citations. Test follow-up questions maintain context. Test "no relevant information" message when query has no matches.

### Feature Structure for User Story 2

- [x] T072 Create chat feature directory structure: src/features/chat/{components,hooks,services,types}

### API Service Layer for Chat (US2)

- [x] T073 [US2] Create chat API service in src/features/chat/services/chat-api.ts with sendMessage method
- [x] T074 [US2] Create search API service in src/features/chat/services/search-api.ts with search method for direct document search

### React Query Hooks for Chat (US2)

- [x] T075 [US2] Create useSendChatMessage hook in src/features/chat/hooks/useSendChatMessage.ts with optimistic updates for user messages
- [x] T076 [P] [US2] Create useDocumentSearch hook in src/features/chat/hooks/useDocumentSearch.ts with debouncing for search-as-you-type
- [x] T077 [P] [US2] Create useChatSession hook in src/features/chat/hooks/useChatSession.ts to manage client-side chat history

### UI Components for Chat Interface (US2)

- [x] T078 [P] [US2] Create ChatMessage component in src/features/chat/components/ChatMessage.tsx displaying user and assistant messages with different alignments
- [x] T079 [P] [US2] Create SourceCitation component in src/features/chat/components/SourceCitation.tsx displaying source documents as expandable cards
- [x] T080 [US2] Create ChatMessageList component in src/features/chat/components/ChatMessageList.tsx rendering conversation history
- [x] T081 [P] [US2] Create ChatInput component in src/features/chat/components/ChatInput.tsx with textarea and send button
- [x] T082 [US2] Create ChatInterface component in src/features/chat/components/ChatInterface.tsx combining message list, input, and loading states
- [x] T083 [P] [US2] Create EmptyState component in src/features/chat/components/EmptyState.tsx for new chat sessions with suggested questions

### Advanced Chat Features (US2)

- [x] T084 [P] [US2] Add loading indicator in ChatInterface for API response wait time
- [x] T085 [P] [US2] Add "no relevant information found" message handling in ChatInterface
- [x] T086 [US2] Implement conversation context management: include last 10 messages as history in chat requests
- [x] T087 [P] [US2] Add token usage and model info display in ChatInterface footer
- [x] T088 [P] [US2] Add new chat session button to clear history and start fresh conversation

### Page Components (US2)

- [x] T089 [US2] Create ChatPage in src/pages/ChatPage.tsx integrating ChatInterface with workspace context
- [x] T090 Update App.tsx routing to include /projects/:projectId/chat route pointing to ChatPage

### Optimizations and Polish (US2)

- [x] T091 [US2] Add debouncing (300ms) to ChatInput to prevent excessive API calls
- [x] T092 [P] [US2] Implement auto-scroll to bottom when new messages arrive in ChatMessageList
- [x] T093 [P] [US2] Add loading skeleton for initial chat load in ChatInterface

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can upload documents AND ask questions with source-cited answers

---

## Phase 5: User Story 3 - Workspace Isolation and Multi-Tenancy (Priority: P2)

**Goal**: Ensure complete data isolation between workspaces so multiple teams can safely use the platform without data leakage, with workspace switching capability

**Independent Test**: Create multiple workspaces, upload different documents to each, verify queries in one workspace never return results from another. Test workspace switching shows only relevant documents and chat history.

### Feature Structure for User Story 3

- [x] T094 Create projects feature directory structure: src/features/projects/{components,hooks,services,types}

### API Service Layer for Projects (US3)

- [x] T095 [P] [US3] Create project API service in src/features/projects/services/project-api.ts with getAll, create, getById, update, delete methods

### React Query Hooks for Projects (US3)

- [x] T096 [P] [US3] Create useProjects hook in src/features/projects/hooks/useProjects.ts to fetch all projects
- [x] T097 [P] [US3] Create useProject hook in src/features/projects/hooks/useProject.ts to fetch single project
- [x] T098 [P] [US3] Create useCreateProject hook in src/features/projects/hooks/useCreateProject.ts with cache invalidation
- [x] T099 [P] [US3] Create useUpdateProject hook in src/features/projects/hooks/useUpdateProject.ts with cache invalidation
- [x] T100 [P] [US3] Create useDeleteProject hook in src/features/projects/hooks/useDeleteProject.ts with cache invalidation

### UI Components for Project Management (US3)

- [x] T101 [P] [US3] Create ProjectCard component in src/features/projects/components/ProjectCard.tsx displaying project name, document count, dates
- [x] T102 [US3] Create ProjectList component in src/features/projects/components/ProjectList.tsx rendering grid of project cards
- [x] T103 [P] [US3] Create CreateProjectDialog component in src/features/projects/components/CreateProjectDialog.tsx with form validation
- [x] T104 [P] [US3] Create EditProjectDialog component in src/features/projects/components/EditProjectDialog.tsx with form validation
- [x] T105 [P] [US3] Create DeleteProjectDialog component in src/features/projects/components/DeleteProjectDialog.tsx with confirmation prompt
- [x] T106 [P] [US3] Create ProjectSelector component in src/features/projects/components/ProjectSelector.tsx as dropdown in header for workspace switching

### Page Components (US3)

- [x] T107 [US3] Create ProjectsPage in src/pages/ProjectsPage.tsx (dashboard) showing all projects with create button
- [x] T108 Update App.tsx routing to include / root route pointing to ProjectsPage
- [x] T109 Update App.tsx routing to include /projects/:projectId layout route for workspace-scoped pages

### Workspace Isolation Logic (US3)

- [x] T110 [US3] Update WorkspaceContext to store selected project and provide switching functionality
- [x] T111 [US3] Add workspace isolation validation: ensure all document and chat queries include projectId parameter
- [x] T112 [US3] Update Header component to integrate ProjectSelector for workspace switching
- [x] T113 [US3] Add URL synchronization: update route when workspace changes, restore workspace from URL on page load

### Navigation and UX (US3)

- [x] T114 [P] [US3] Add workspace name display in Header to prevent user confusion
- [x] T115 [P] [US3] Add "no workspace selected" empty state in DocumentsPage and ChatPage
- [x] T116 [US3] Clear chat history when switching workspaces in WorkspaceContext

**Checkpoint**: All P1 and P2 user stories should now be independently functional - complete workspace isolation with document upload and chat

---

## Phase 6: User Story 4 - Knowledge Graph and Document Connections (Priority: P3) ❌ DISCARDED

**Reason for Discard**: No backend API endpoint available for knowledge graph data. Backend would need to implement graph generation and relationship mapping before this feature can be developed.

**Goal**: ~~Show connections between different pieces of information across documents to help discover related concepts and get more comprehensive answers~~

**Tasks T117-T132**: SKIPPED - Requires backend implementation first

---

## Phase 7: User Story 5 - Document Management and Organization (Priority: P3)

**Goal**: Allow workspace members to organize, search, and manage uploaded documents to maintain a well-structured knowledge base over time

**Independent Test**: Upload multiple documents, organize with tags/categories (if backend supports), search by filename, sort by name/date/size, delete documents, verify knowledge base reflects these changes in chat queries.

### UI Components for Document Organization (US5)

- [x] T133 [P] [US5] Create DocumentSearch component in src/features/documents/components/DocumentSearch.tsx with debounced search input
- [x] T134 [P] [US5] Create DocumentFilters component in src/features/documents/components/DocumentFilters.tsx for filtering by type (FILE, TEXT, WEBSITE) and status
- [x] T135 [P] [US5] Create DocumentSort component in src/features/documents/components/DocumentSort.tsx for sorting by name, date, size with asc/desc toggle
- [x] T136 [US5] Update DocumentList component to integrate search, filters, and sorting with client-side filtering and sorting logic
- [x] T137 [P] [US5] Add empty state to DocumentList when no documents match filters/search

### Advanced Document Features (US5)

- [x] T138 [P] [US5] Create DocumentTypeIcon component in src/features/documents/components/DocumentTypeIcon.tsx showing appropriate icon for FILE, TEXT, WEBSITE types
- [x] T139 [P] [US5] Add pagination to DocumentList for projects with >50 documents (virtual scrolling using react-window or tanstack-virtual)
- [x] T140 [US5] Update DocumentCard to show file size in human-readable format (KB, MB)
- [x] T141 [P] [US5] Add "last updated" timestamp to DocumentCard for better organization

### Bulk Operations (US5)

- [x] T142 [P] [US5] Add multi-select checkbox to DocumentCard for bulk operations
- [x] T143 [US5] Create BulkActions component in src/features/documents/components/BulkActions.tsx for batch delete (future: batch tag, batch export)
- [x] T144 [US5] Add "select all" checkbox to DocumentList header

### Search Integration (US5)

- [x] T145 [US5] Integrate useDocumentSearch hook with DocumentSearch component for search-as-you-type with 300ms debounce
- [x] T146 [P] [US5] Add search result highlighting in DocumentCard showing matched terms

### Page Updates (US5)

- [x] T147 [US5] Update DocumentsPage to integrate DocumentSearch, DocumentFilters, DocumentSort components above DocumentList

**Checkpoint**: All user stories complete - full document management with search, filter, sort, and bulk operations

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

### Performance Optimizations

- [x] T148 [P] Add React.memo to expensive list components: DocumentList, ChatMessageList, ProjectList
- [x] T149 [P] Implement virtual scrolling for DocumentList when >100 documents using @tanstack/react-virtual
- [x] T150 [P] Implement virtual scrolling for ChatMessageList when >50 messages using @tanstack/react-virtual
- [x] T151 Run bundle analysis using rollup-plugin-visualizer, verify <500KB initial bundle, <200KB per route
- [x] T152 [P] Add preload hints for critical routes on hover/focus
- [x] T153 Optimize images: convert to WebP where applicable, add loading="lazy" attributes

### Accessibility Audit

- [x] T154 [P] Run axe DevTools accessibility audit on all pages, fix violations to meet WCAG 2.1 AA
- [x] T155 [P] Test keyboard navigation on all interactive elements (tab order, enter/space activation)
- [x] T156 [P] Add ARIA labels to icon-only buttons (theme toggle, delete, etc.)
- [x] T157 [P] Test with screen reader (VoiceOver on macOS or NVDA on Windows), fix announcement issues
- [x] T158 Verify color contrast ratios meet 4.5:1 minimum for all text using contrast checker

### Error Handling and User Feedback

- [x] T159 [P] Add global error boundary in App.tsx to catch component crashes with user-friendly message
- [x] T160 [P] Add offline detection and show offline banner when network unavailable
- [x] T161 [P] Add retry buttons to failed API requests with error toasts
- [x] T162 Verify all loading states show after 200ms threshold per constitution requirement

### Documentation and Code Quality

- [x] T163 [P] Add JSDoc comments to all exported functions in services, hooks, and utility files
- [x] T164 [P] Run ESLint with --max-warnings 0 flag, fix all warnings
- [x] T165 [P] Run TypeScript type check with npx tsc -b, fix all type errors
- [x] T166 [P] Verify all components under 300 lines limit per constitution, refactor if needed
- [x] T167 Update README.md with feature overview, setup instructions, and architecture diagram

### Testing and Validation

- [x] T168 Run quickstart.md validation: follow setup steps on fresh clone, verify all commands work
- [x] T169 [P] Verify coverage thresholds met: 90%+ business logic (services, hooks), 80%+ UI components
- [x] T170 [P] Run E2E tests with Playwright for P1 user stories (document upload and chat workflows)
- [x] T171 Test on all target browsers: Chrome, Firefox, Safari, Edge (last 2 years)

### Security Hardening

- [x] T172 [P] Add Content Security Policy headers in index.html (coordinate with backend for API calls)
- [x] T173 [P] Verify no sensitive data stored in localStorage, use sessionStorage or memory for sensitive state
- [x] T174 [P] Add DOMPurify if rendering any user-generated HTML/markdown content
- [x] T175 Review all file upload validations: verify client-side AND backend validation for type and size

### Production Readiness

- [x] T176 [P] Create .env.production with production API base URL
- [x] T177 [P] Add build command optimization flags in package.json
- [x] T178 [P] Configure error reporting service integration (Sentry, LogRocket, etc.) - optional (CANCELLED - optional feature)
- [x] T179 Run production build: npm run build, verify no build errors or warnings
- [x] T180 Run production preview: npm run preview, smoke test all user flows

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - No dependencies on other stories ✅
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) - Can start in parallel with US1, but benefits from US1 being complete for testing
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) - Can start in parallel, but provides better UX when US1/US2 complete
- **User Story 4 (Phase 6)**: Depends on US1 (documents) and US2 (chat) - Requires documents and chat to be functional
- **User Story 5 (Phase 7)**: Depends on US1 (documents) - Enhances document management functionality
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - **No dependencies on other stories** ✅ INDEPENDENT ✅ COMPLETE
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Requires documents to exist for meaningful testing, but technically independent ✅ COMPLETE
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Provides workspace management, technically independent ✅ COMPLETE
- **User Story 4 (P3)**: ❌ **DISCARDED** - No backend API endpoint available
- **User Story 5 (P3)**: **Depends on US1** - Enhances document management with search, filter, sort

### Within Each User Story

1. Feature structure and directory creation FIRST
2. API service layer (services/) - can be parallel within a story
3. React Query hooks (hooks/) - can be parallel, depend on services
4. UI components (components/) - can be parallel, depend on hooks
5. Page integration - depends on components being ready
6. Routing updates - final step after page ready
7. Error handling and polish - after core functionality works

### Parallel Opportunities

#### Setup Phase (Phase 1)
- All dependency installations (T002-T007) can run in parallel
- Configuration files (T009-T012) can be created in parallel after dependencies installed

#### Foundational Phase (Phase 2)
- HTTP client utilities (T016-T017) can run in parallel after T015
- React Query setup (T018-T019) can run in parallel with HTTP client
- All Shadcn component installations (T020-T029) can run in parallel
- Layout components (T031-T033) can run in parallel
- Type definitions (T040-T043) can run in parallel
- Validation schemas (T044-T046) can run in parallel

#### User Story 1 (Phase 3)
- API services (T048-T049) can run in parallel
- React Query hooks (T050-T056) can run in parallel after services ready
- Upload components (T057-T060) can run in parallel after hooks ready
- List components (T063, T065-T066) can run in parallel

#### User Story 2 (Phase 4)
- API services (T073-T074) can run in parallel
- Chat UI components (T078-T079, T081, T083) can run in parallel after hooks ready

#### User Story 3 (Phase 5)
- React Query hooks (T096-T100) can run in parallel after T095
- UI components (T101, T103-T106) can run in parallel

#### User Story 5 (Phase 7)
- Organization components (T133-T135, T138) can run in parallel
- Bulk operation components (T142-T143) can run in parallel

#### Polish Phase (Phase 8)
- Performance optimizations (T148-T150, T152-T153) can run in parallel
- Accessibility audits (T154-T158) can run in parallel
- Documentation tasks (T163-T167) can run in parallel
- Security tasks (T172-T175) can run in parallel
- Production readiness (T176-T178) can run in parallel

### Parallel Execution by Team

**Single Developer** (recommended order):
1. Setup → Foundational → US1 → US2 → US3 → US5 → Polish (US4 discarded)

**Two Developers** (maximum parallelism):
1. Both: Setup + Foundational together
2. Dev A: US1 (documents), Dev B: US3 (projects/workspaces)
3. Both: US2 (chat) - requires US1 complete for meaningful testing
4. Dev A: US5 (document management), Dev B: Polish tasks
5. Both: Final polish together

**Three+ Developers**:
1. All: Setup + Foundational together
2. Dev A: US1, Dev B: US3, Dev C: foundational polish
3. All: US2 (chat requires documents, so coordinate)
4. Dev A: US5, Dev B+C: Polish tasks
5. All: Final polish and testing

---

## Parallel Example: User Story 1 Implementation

```bash
# After Foundational phase complete, launch parallel tasks for US1:

# Parallel batch 1: API services (different files, no dependencies)
Task T048: Create document-api.ts
Task T049: Create project-api.ts (for getDocuments method)

# Parallel batch 2: React Query hooks (depend on services, different files)
Task T050: Create useUploadFile hook
Task T051: Create useProcessText hook
Task T052: Create useProcessWebsite hook
Task T053: Create useProjectDocuments hook
Task T054: Create useDocument hook
Task T055: Create useDocumentProgress hook
Task T056: Create useDeleteDocument hook

# Parallel batch 3: Upload UI components (depend on hooks, different files)
Task T057: Create DocumentUploadZone component
Task T058: Create TextUploadForm component
Task T059: Create WebsiteUploadForm component
Task T061: Create UploadProgress component
Task T062: Create DocumentStatusBadge component

# Parallel batch 4: List UI components (depend on hooks, different files)
Task T063: Create DocumentCard component
Task T065: Create DocumentDetailDialog component
Task T066: Create DeleteDocumentDialog component

# Sequential: Integration tasks
Task T060: Create UploadTabs (combines T057-T059)
Task T064: Create DocumentList (combines T063, T062)
Task T067: Create DocumentsPage (combines all components)
Task T068: Update routing

# Sequential: Polish
Task T069-T071: Add validation and error handling
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

This delivers the core value proposition: upload documents and ask questions.

1. ✅ Complete **Phase 1: Setup** (T001-T014)
2. ✅ Complete **Phase 2: Foundational** (T015-T046) - CRITICAL, blocks all stories
3. ✅ Complete **Phase 3: User Story 1** (T047-T071) - Document upload with progress tracking
4. ✅ Complete **Phase 4: User Story 2** (T072-T093) - Chat interface with source citations
5. **STOP and VALIDATE**: 
   - Upload various document types
   - Ask questions and verify source-cited answers
   - Test follow-up questions maintain context
   - Test batch uploads with progress indicators
6. **Deploy MVP** - ready for user feedback

**Total MVP Tasks**: 93 tasks (T001-T093)

### Incremental Delivery (Adding Workspace Management)

1. ✅ MVP complete (US1 + US2)
2. ✅ Complete **Phase 5: User Story 3** (T094-T116) - Multi-tenancy and workspace switching
3. **STOP and VALIDATE**:
   - Create multiple workspaces
   - Upload different documents to each
   - Verify complete data isolation in queries
   - Test workspace switching
4. **Deploy** - now supports multiple teams

**Total Tasks for US1+US2+US3**: 116 tasks (T001-T116)

### Full Feature Set (Remaining User Stories)

1. ✅ US1 + US2 + US3 complete (T001-T116)
2. ❌ **Phase 6: User Story 4** (T117-T132) - DISCARDED (no backend support)
3. **Phase 7: User Story 5** (T133-T147) - Advanced document management
4. **Phase 8: Polish** (T148-T180) - Production readiness
5. **Final Validation**: Full E2E testing across all features
6. **Production Deploy**

**Total Remaining Tasks**: 48 tasks (T133-T180)

---

## Notes

- **[P] marker**: Tasks marked [P] can run in parallel with other [P] tasks in the same phase
- **[Story] label**: Maps task to specific user story for traceability (US1, US2, US3, US5)
- **File paths**: All paths are exact and follow the structure defined in plan.md
- **Independent stories**: US1, US2, US3 are independently testable; US5 enhances existing document functionality
- **US4 (Knowledge Graph)**: Discarded due to lack of backend API endpoint support
- **Test-first**: Constitution requires test-first development; tests can be added before implementation tasks if TDD approach is adopted
- **Commit strategy**: Commit after each task or logical group (e.g., all hooks for a feature)
- **Checkpoint validation**: Stop at phase checkpoints to validate story works independently
- **MVP recommendation**: Focus on US1 + US2 first (93 tasks) for fastest time-to-value
- **Constitution compliance**: All tasks follow code quality standards (TypeScript strict, ESLint zero warnings, 300 line component limit, JSDoc for exports)

---

## Summary

- **Total Tasks**: 164 (180 original - 16 discarded from US4)
- **Completed Tasks**: 164/164 (100%) ✅ COMPLETE
- **MVP Tasks** (US1 + US2): 93 tasks ✅ COMPLETE
- **User Stories**: 4 implemented (US1, US2, US3, US5) + 1 discarded (US4)
- **Remaining**: 0 tasks (All complete!)
- **Parallel Opportunities**: ~60% of tasks within phases can be parallelized
- **Independent Test Criteria**: Each user story has clear validation steps
- **US4 Status**: ❌ Discarded - requires backend knowledge graph endpoint
- **T178 Status**: ❌ Cancelled - optional error reporting service
- **Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, optional [P] and [Story] labels, and file paths
