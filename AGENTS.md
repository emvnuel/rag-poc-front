# Agent Guidelines: RAG POC Front

## Commands
- **Dev**: `npm run dev` (Vite dev server with HMR)
- **Build**: `npm run build` (TypeScript check + Vite build)
- **Lint**: `npm run lint` (ESLint all files)
- **Type Check**: `npx tsc -b` (TypeScript validation)
- **Tests**: Not configured yet - follow constitution test-first requirements when adding (use Vitest + React Testing Library)

## Code Style
- **TypeScript**: Strict mode enabled, no implicit `any`, all exports require JSDoc
- **Imports**: React hooks first, then assets, then styles (see src/App.tsx)
- **Components**: Max 300 lines, single responsibility, PascalCase naming
- **Files**: Feature-based structure under `src/` (components/, features/, hooks/, services/, utils/, types/, styles/)
- **Formatting**: ESLint + typescript-eslint rules enforced, no warnings allowed in production
- **Error Handling**: User-friendly messages, loading states for >200ms async ops
- **Accessibility**: WCAG 2.1 AA required (semantic HTML, ARIA labels, 4.5:1 contrast)
- **Performance**: Code splitting required, <500KB bundle, <3s page load

## Constitution
Refer to `.specify/memory/constitution.md` for test-first development (NON-NEGOTIABLE), coverage requirements (90%+ business logic, 80%+ UI), UX consistency, and performance budgets. All PRs must comply.

## Active Technologies
- TypeScript 5.9.3 with React 19.2.0 + Shadcn UI, React Query, Axios, React Router, Zod (validation), React Hook Form (001-rag-knowledge-platform)
- Backend API (localhost:42069) - no frontend persistence beyond session/cache (001-rag-knowledge-platform)
- TypeScript 5.9.3 + React 19.2.0, Tailwind CSS 3.x, Shadcn UI (Radix UI primitives), React Router (002-responsive-design)
- N/A (responsive design is presentation-layer only) (002-responsive-design)

## Recent Changes
- 001-rag-knowledge-platform: Added TypeScript 5.9.3 with React 19.2.0 + Shadcn UI, React Query, Axios, React Router, Zod (validation), React Hook Form
