# Quickstart Guide: RAG Knowledge Platform

**Feature**: RAG Knowledge Platform  
**Branch**: 001-rag-knowledge-platform  
**Date**: 2025-11-15

## Prerequisites

Before starting development, ensure you have:

- **Node.js**: v18+ (v20 LTS recommended)
- **npm**: v9+ (comes with Node.js)
- **Git**: For version control
- **VS Code**: Recommended IDE (or your preferred editor)
- **Backend API**: Running on `localhost:42069`

### Verify Prerequisites

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
git --version   # Any recent version
```

---

## Initial Setup

### 1. Clone Repository (if not already cloned)

```bash
git clone <repository-url>
cd rag-poc-front
```

### 2. Checkout Feature Branch

```bash
git checkout 001-rag-knowledge-platform
```

### 3. Install Dependencies

```bash
npm install
```

This installs:
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.2
- ESLint and related plugins
- (Additional dependencies will be added during implementation)

---

## Project Configuration

### 1. Initialize Shadcn UI

```bash
npx shadcn@latest init
```

When prompted, select:
- **Style**: Default
- **Base color**: Slate (or your preference)
- **CSS variables**: Yes (for theming)
- **TypeScript**: Yes
- **Tailwind config**: Yes
- **Components location**: `src/components`
- **Utils location**: `src/lib/utils`

This creates:
- `components.json` - Shadcn configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `src/components/ui/` - UI components directory
- `src/lib/utils.ts` - Utility functions

### 2. Install Additional Dependencies

```bash
# State management and data fetching
npm install @tanstack/react-query axios

# Routing
npm install react-router-dom

# Form handling and validation
npm install react-hook-form zod @hookform/resolvers

# Theme management
npm install next-themes

# File upload
npm install react-dropzone

# Utilities
npm install clsx tailwind-merge

# Development dependencies
npm install -D @tanstack/react-query-devtools
```

### 3. Install Testing Dependencies

```bash
# Unit and integration testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui jsdom

# E2E testing
npm install -D @playwright/test

# Initialize Playwright
npx playwright install
```

### 4. Environment Variables

Create `.env` file in project root:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:42069

# Feature Flags (optional)
VITE_ENABLE_KNOWLEDGE_GRAPH=false
VITE_ENABLE_DEVTOOLS=true
```

Create `.env.example` for reference:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:42069

# Feature Flags
VITE_ENABLE_KNOWLEDGE_GRAPH=false
VITE_ENABLE_DEVTOOLS=true
```

---

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

This starts Vite dev server at `http://localhost:5173` (or next available port).

**Features**:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- TypeScript type checking
- ESLint warnings in terminal

### 2. Open in Browser

Navigate to `http://localhost:5173`

You should see the default Vite + React page (will be replaced with RAG platform UI).

### 3. Verify Backend Connection

Ensure backend API is running:

```bash
curl http://localhost:42069/projects
```

Should return JSON array (empty `[]` or list of projects).

---

## Project Structure Overview

```
rag-poc-front/
├── .specify/               # Feature specifications and planning
│   ├── memory/
│   │   └── constitution.md # Development principles (READ THIS!)
│   ├── scripts/
│   └── templates/
├── specs/                  # Feature-specific documentation
│   └── 001-rag-knowledge-platform/
│       ├── spec.md         # Feature specification
│       ├── plan.md         # Implementation plan (this phase)
│       ├── research.md     # Technology decisions
│       ├── data-model.md   # Data structures
│       └── contracts/      # API contracts
├── src/
│   ├── components/         # Shared UI components
│   │   ├── ui/            # Shadcn components
│   │   ├── layout/        # Layout components
│   │   └── common/        # Reusable atoms/molecules
│   ├── features/          # Feature modules (to be created)
│   ├── services/          # API client (to be created)
│   ├── hooks/             # Custom hooks (to be created)
│   ├── lib/               # Utilities (to be created)
│   ├── types/             # TypeScript types (to be created)
│   ├── styles/            # Global styles (to be created)
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── tests/                 # Test files (to be created)
├── .env                   # Environment variables (create this)
├── .env.example           # Environment variables template (create this)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js     # After Shadcn init
├── components.json        # After Shadcn init
└── README.md
```

---

## Development Commands

### Build Commands

```bash
# Development server (with HMR)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type check (no emit)
npx tsc -b
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix

# Type check
npx tsc -b

# Format with Prettier (if configured)
npm run format
```

### Testing Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

---

## Generating TypeScript Types from OpenAPI

### Option 1: Using @hey-api/openapi-ts (Recommended)

```bash
# Install globally or use npx
npm install -D @hey-api/openapi-ts

# Generate types
npx @hey-api/openapi-ts \
  --input http://localhost:42069/openapi.json \
  --output src/services/api/generated \
  --client axios
```

### Option 2: Using openapi-typescript-codegen

```bash
# Install
npm install -D openapi-typescript-codegen

# Generate
npx openapi-typescript-codegen \
  --input http://localhost:42069/openapi.json \
  --output src/services/api/generated \
  --client axios
```

**Add to package.json**:

```json
{
  "scripts": {
    "generate:api": "openapi-ts --input http://localhost:42069/openapi.json --output src/services/api/generated --client axios"
  }
}
```

Then run:

```bash
npm run generate:api
```

---

## VS Code Configuration

### Recommended Extensions

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "vitest.explorer"
  ]
}
```

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## First Feature: Project Listing

### Test-First Approach (TDD)

1. **Write failing test** (`src/features/projects/components/ProjectList.test.tsx`):

```typescript
import { render, screen } from '@testing-library/react';
import { ProjectList } from './ProjectList';

describe('ProjectList', () => {
  it('should display a list of projects', () => {
    const projects = [
      { id: '1', name: 'Project 1', createdAt: '2025-01-01', updatedAt: '2025-01-01', documentCount: 5 },
      { id: '2', name: 'Project 2', createdAt: '2025-01-02', updatedAt: '2025-01-02', documentCount: 3 }
    ];
    
    render(<ProjectList projects={projects} />);
    
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
  });
});
```

2. **Run test** (should fail):

```bash
npm run test
```

3. **Implement component** to make test pass

4. **Refactor** while keeping tests green

---

## Key Development Principles

### From Constitution (see `.specify/memory/constitution.md`)

1. **Test-First Development (NON-NEGOTIABLE)**
   - Write tests before implementation
   - RED → GREEN → REFACTOR cycle
   - 90%+ coverage for business logic
   - 80%+ coverage for UI components

2. **Code Quality Standards**
   - TypeScript strict mode enabled
   - Zero ESLint warnings
   - Max 300 lines per component
   - JSDoc for all exported functions

3. **User Experience Consistency**
   - Use Shadcn components only
   - WCAG 2.1 AA compliance
   - Loading states for >200ms operations
   - User-friendly error messages

4. **Performance Requirements**
   - <500KB initial bundle
   - <200KB per lazy-loaded route
   - Code splitting for routes
   - React.memo for expensive components

---

## Troubleshooting

### Common Issues

#### 1. Backend API Not Running

**Error**: "Network Error" or "Failed to fetch"

**Solution**:
```bash
# Verify backend is running
curl http://localhost:42069/projects

# Check backend logs
# Start backend if not running
```

#### 2. Port 5173 Already in Use

**Error**: "Port 5173 is already in use"

**Solution**:
- Vite will automatically use next available port (5174, 5175, etc.)
- Or kill process using port 5173

#### 3. TypeScript Errors After Installing Packages

**Solution**:
```bash
# Restart TS server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or restart development server
npm run dev
```

#### 4. ESLint Warnings

**Solution**:
```bash
# Auto-fix issues
npm run lint -- --fix

# Check constitution.md for code quality standards
```

---

## Next Steps

1. **Read Constitution**: Review `.specify/memory/constitution.md`
2. **Review Spec**: Read `specs/001-rag-knowledge-platform/spec.md`
3. **Study Contracts**: Review API contracts in `contracts/api-contracts.md`
4. **Generate API Types**: Run `npm run generate:api`
5. **Start with Tests**: Begin with `/speckit.tasks` to get task breakdown
6. **Implement P1 User Stories**: Focus on document upload and chat interface

---

## Useful Resources

### Documentation
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Shadcn UI](https://ui.shadcn.com)
- [React Query](https://tanstack.com/query/latest/docs/react)
- [React Testing Library](https://testing-library.com/react)
- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)

### Internal Documentation
- Constitution: `.specify/memory/constitution.md`
- Agent Guidelines: `AGENTS.md`
- Feature Spec: `specs/001-rag-knowledge-platform/spec.md`
- Implementation Plan: `specs/001-rag-knowledge-platform/plan.md`

---

## Support

For questions or issues:
1. Check constitution for principles and standards
2. Review feature specification for requirements
3. Consult research.md for technology decisions
4. Check API contracts for endpoint details

---

**Ready to start coding!** 🚀

Next command: `/speckit.tasks` to generate the implementation task list.
