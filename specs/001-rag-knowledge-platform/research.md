# Research: RAG Knowledge Platform

**Feature**: RAG Knowledge Platform  
**Branch**: 001-rag-knowledge-platform  
**Date**: 2025-11-15

## Overview

Research decisions for implementing a RAG knowledge management platform using React, Shadcn UI, and TypeScript, connecting to an existing backend API.

## Technology Decisions

### 1. UI Component Library

**Decision**: Shadcn UI + Radix UI primitives

**Rationale**:
- Specified in requirements as mandatory
- Unstyled, accessible components (WCAG 2.1 AA compliant by default)
- Customizable with TweakCN (future requirement)
- Built on Radix UI primitives (battle-tested accessibility)
- Copy-paste approach (own the code, no package bloat)
- Excellent TypeScript support
- Built-in dark mode support with next-themes or similar

**Alternatives Considered**:
- Material UI: Rejected - not specified, heavier bundle size
- Chakra UI: Rejected - different styling approach, not compatible with TweakCN
- Ant Design: Rejected - opinionated design system, less customizable

**Implementation Notes**:
- Install Shadcn CLI: `npx shadcn@latest init`
- Components copied to `src/components/ui/`
- Configure Tailwind CSS with design tokens
- Use `next-themes` for light/dark mode management

### 2. State Management

**Decision**: React Query + Context API

**Rationale**:
- **React Query**: Perfect for server state (API data, caching, refetching)
  - Automatic cache invalidation
  - Built-in loading/error states
  - Optimistic updates support
  - Request deduplication
  - Ideal for RAG platform's heavy API interaction
- **Context API**: Sufficient for UI state (theme, workspace selection)
  - No complex global state needed
  - Avoids Redux boilerplate
  - Better performance with proper memoization

**Alternatives Considered**:
- Redux Toolkit: Rejected - overkill for this use case, most state is server-driven
- Zustand: Rejected - React Query + Context is sufficient, no need for additional store
- Jotai/Recoil: Rejected - atomic state not needed, Context API sufficient

**Implementation Notes**:
- Install: `npm install @tanstack/react-query`
- QueryClient configuration with sensible defaults (5min stale time)
- Context for theme, workspace, and user preferences

### 3. API Client and Type Safety

**Decision**: OpenAPI TypeScript Code Generator + Axios

**Rationale**:
- OpenAPI spec provided (localhost:42069)
- Generate TypeScript types automatically from spec
- End-to-end type safety from API to UI
- Reduces manual typing errors
- Axios for interceptors (auth, error handling, retry logic)

**Alternatives Considered**:
- Fetch API: Rejected - need interceptors for auth/error handling
- tRPC: Rejected - backend is Java (not TypeScript), OpenAPI already exists
- Manual typing: Rejected - error-prone, OpenAPI spec available

**Implementation Notes**:
- Use `openapi-typescript-codegen` or `@hey-api/openapi-ts`
- Generate client to `src/services/api/generated/`
- Axios instance configuration:
  - Base URL: `http://localhost:42069`
  - Request interceptors: auth headers
  - Response interceptors: error handling, retry logic
  - Timeout: 10s default, 30s for document uploads

### 4. Form Management

**Decision**: React Hook Form + Zod

**Rationale**:
- React Hook Form: Excellent performance (uncontrolled inputs)
- Zod: TypeScript-first validation, integrates with React Hook Form
- Constitution requires real-time validation feedback
- Small bundle size (~9KB gzipped)
- Works seamlessly with Shadcn form components

**Alternatives Considered**:
- Formik: Rejected - larger bundle, slower re-renders
- Plain React state: Rejected - too much boilerplate, no validation integration
- Yup: Rejected - Zod has better TypeScript inference

**Implementation Notes**:
- Install: `npm install react-hook-form zod @hookform/resolvers`
- Create Zod schemas matching API contracts
- Reusable form components with Shadcn Form primitives

### 5. Routing

**Decision**: React Router v6

**Rationale**:
- Industry standard for React SPAs
- Lazy loading support for code splitting
- Nested routes for workspace-based navigation
- Data loading patterns (loaders/actions)
- TypeScript support

**Alternatives Considered**:
- TanStack Router: Rejected - newer, less community support
- Wouter: Rejected - too minimal, need nested routes and loaders

**Implementation Notes**:
- Install: `npm install react-router-dom`
- Route structure:
  - `/` - Project selection
  - `/projects/:projectId` - Project workspace
  - `/projects/:projectId/documents` - Document management
  - `/projects/:projectId/chat` - Chat interface
  - `/projects/:projectId/knowledge-graph` - Graph visualization
- Lazy load routes for code splitting

### 6. Testing Stack

**Decision**: Vitest + React Testing Library + Playwright

**Rationale**:
- **Vitest**: Fast, Vite-native, compatible with Jest API
- **React Testing Library**: User-centric testing, aligns with constitution
- **Playwright**: Modern E2E testing, cross-browser support
- Constitution requires 90%+ business logic coverage
- All tools have excellent TypeScript support

**Alternatives Considered**:
- Jest: Rejected - slower, Vitest is Vite-native and faster
- Cypress: Rejected - Playwright has better DX and performance
- Testing Library alternatives: Rejected - RTL is industry standard

**Implementation Notes**:
- Install: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event`
- Install: `npm install -D @playwright/test`
- Vitest config: coverage thresholds (90% statements, 80% branches)
- Playwright config: headed mode for debugging, CI mode for automation

### 7. Dark Mode Implementation

**Decision**: next-themes with Tailwind CSS dark mode

**Rationale**:
- Lightweight (~1KB)
- Works with Tailwind's dark: variant
- Persistent theme storage
- No flash of unstyled content (FOUC)
- System preference detection
- Required by specification

**Alternatives Considered**:
- Custom implementation: Rejected - reinventing the wheel
- CSS variables only: Rejected - next-themes provides better UX

**Implementation Notes**:
- Install: `npm install next-themes`
- ThemeProvider at app root
- localStorage persistence: `theme` key
- Shadcn components already support dark mode

### 8. Knowledge Graph Visualization

**Decision**: React Flow or D3.js (research both in implementation)

**Rationale**:
- **React Flow**: React-native, easier integration, interactive by default
- **D3.js**: More powerful, custom visualizations, steeper learning curve
- Decision deferred to implementation phase based on complexity needs

**Alternatives Considered**:
- vis.js: Rejected - older library, React integration less smooth
- Cytoscape.js: Rejected - more suited for biological networks

**Implementation Notes**:
- Start with React Flow for P3 user story
- If customization needed, evaluate D3.js
- Lazy load graph component (heavy dependency)

### 9. File Upload Handling

**Decision**: react-dropzone for drag-and-drop

**Rationale**:
- Excellent UX for file uploads
- Drag-and-drop support required for modern web apps
- File validation before upload
- Multiple file selection
- Progress tracking integration

**Alternatives Considered**:
- Native input[type=file]: Rejected - poor UX, no drag-and-drop
- Custom implementation: Rejected - complex browser APIs

**Implementation Notes**:
- Install: `npm install react-dropzone`
- Validate file types client-side (PDF, DOCX, TXT, MD)
- 25MB file size limit (client-side check)
- Progress tracking with Axios upload events

### 10. Code Splitting Strategy

**Decision**: Route-based + heavy component lazy loading

**Rationale**:
- Constitution requires <500KB initial bundle, <200KB per route
- Knowledge graph visualization likely heavy
- Document viewer components can be lazy loaded
- React.lazy() + Suspense built-in

**Implementation Notes**:
- Lazy load all routes
- Lazy load: Knowledge graph component, document preview component
- Dynamic imports for document type-specific parsers (if any)
- Bundle analysis: `npm install -D rollup-plugin-visualizer`

## API Integration Patterns

### Authentication (Future)

**Current State**: No auth in OpenAPI spec  
**Future Decision**: JWT tokens in httpOnly cookies  
**Implementation**: Axios interceptor for Authorization header

### Error Handling

**Pattern**: Centralized error boundary + toast notifications

**Implementation**:
- React Error Boundary for component crashes
- React Query error callbacks for API errors
- Toast notifications (Shadcn Sonner or react-hot-toast)
- User-friendly error messages mapped from API errors

### Loading States

**Pattern**: React Query built-in + Suspense fallbacks

**Implementation**:
- Use `isLoading`, `isFetching` from React Query hooks
- Skeleton components during initial loads
- Spinners for refetching
- Show loading after 200ms threshold (constitution requirement)

### Caching Strategy

**Pattern**: Aggressive caching with smart invalidation

**Implementation**:
- Projects list: 5min stale time
- Document list: 2min stale time
- Chat history: 1min stale time
- Document content: 10min stale time
- Invalidate on mutations (upload, delete, chat)
- Optimistic updates for better UX

## Performance Optimizations

### 1. Initial Load Optimization
- Code split by route
- Preload critical routes on hover/focus
- Lazy load Shadcn components selectively
- Use React.memo for expensive list items

### 2. Chat Interface Optimization
- Virtual scrolling for long chat histories
- Debounce user input (300ms)
- Streaming responses (if API supports Server-Sent Events)
- Optimistic UI updates for sending messages

### 3. Document List Optimization
- Virtual scrolling for >100 documents
- Infinite scroll/pagination
- Thumbnail generation client-side if needed
- Request only metadata initially, content on demand

### 4. Bundle Size Monitoring
- Use `rollup-plugin-visualizer` in CI
- Lighthouse CI for performance budgets
- Bundle size alerts on 10%+ growth (constitution)

## Accessibility Considerations

### WCAG 2.1 AA Compliance Checklist
- ✅ Shadcn components (Radix UI) WCAG compliant by default
- ✅ Keyboard navigation: all interactive elements accessible
- ✅ ARIA labels: buttons, links, form inputs
- ✅ Color contrast: 4.5:1 for normal text (Tailwind defaults)
- ✅ Focus indicators: visible focus rings
- ✅ Screen reader support: semantic HTML
- ✅ Form validation: announce errors to screen readers

### Implementation Notes
- Use Radix UI's built-in accessibility features
- Test with keyboard only (no mouse)
- Test with VoiceOver (macOS) or NVDA (Windows)
- Run axe DevTools in development

## Security Considerations

### Client-Side Security
- Input sanitization: Use DOMPurify for markdown/HTML rendering
- XSS prevention: React's built-in escaping
- CSRF: Backend responsibility (API)
- Content Security Policy: Configure in index.html
- No sensitive data in localStorage: use sessionStorage or memory

### API Communication
- HTTPS only in production
- CORS: Backend configured
- Rate limiting: Backend responsibility
- File upload validation: client-side + backend

## Development Tools

### Recommended VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (for JSX)
- Error Lens

### Development Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run test` - Run tests
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Coverage report
- `npm run test:e2e` - Playwright E2E tests
- `npm run lint` - ESLint
- `npm run type-check` - TypeScript check

## Open Questions / Future Research

1. **Knowledge Graph Library**: Final decision between React Flow vs D3.js deferred to implementation
2. **Streaming Chat Responses**: Check if backend supports SSE/WebSockets for streaming
3. **Document Preview**: Research if backend provides preview endpoints or need client-side rendering
4. **Offline Support**: Not required for MVP, but service worker research for future
5. **Real-time Updates**: WebSocket support for multi-user collaboration (out of scope for v1)

## Next Steps (Phase 1)

1. Generate TypeScript types from OpenAPI spec
2. Create data model documentation
3. Design API service layer contracts
4. Create quickstart guide for local development
5. Update AGENTS.md with new dependencies and patterns
