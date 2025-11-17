# Implementation Plan: Multi-Device Responsive Design

**Branch**: `002-responsive-design` | **Date**: 2025-11-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-responsive-design/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enhance the RAG Knowledge Platform frontend to be fully responsive across all device types (mobile 320px-480px, tablet 768px-1024px, desktop 1024px+) ensuring optimal user experience on any screen size. This involves adapting existing React components with Tailwind CSS responsive utilities, ensuring touch-friendly interactions on mobile/tablet, and implementing progressive enhancement from mobile-first base styles to desktop-optimized layouts.

**Technical Approach**: Leverage existing Tailwind CSS breakpoints and Shadcn UI component flexibility to progressively enhance layouts from mobile-first base styles (single-column, stacked elements) to tablet (two-column grids) to desktop (multi-column, sidebar layouts). Focus on CSS-only responsive changes where possible, with minimal JavaScript for viewport-specific logic (e.g., mobile drawer vs desktop dropdown for project selector).

## Technical Context

**Language/Version**: TypeScript 5.9.3  
**Primary Dependencies**: React 19.2.0, Tailwind CSS 3.x, Shadcn UI (Radix UI primitives), React Router  
**Storage**: N/A (responsive design is presentation-layer only)  
**Testing**: Vitest + React Testing Library (unit/integration), Playwright (E2E with device emulation)  
**Target Platform**: Web browsers - Chrome, Firefox, Safari, Edge (last 2 versions), viewports 320px-2560px+  
**Project Type**: Web application (single-page React app with frontend focus)  
**Performance Goals**: 
- No performance degradation: <50KB additional CSS bundle size
- Page load remains <3s on mobile 3G
- Layout shift (CLS) <0.1 during responsive transitions
- Orientation changes complete <300ms  

**Constraints**: 
- Must not break existing functionality on any device
- Touch targets minimum 44x44px on touch devices (WCAG 2.1 AA)
- Base font size minimum 16px on mobile (prevent browser auto-zoom)
- Existing component API signatures must remain unchanged
- Dark/light theme support must work across all breakpoints  

**Scale/Scope**: 
- 3 main pages (Projects, Documents, Chat)
- ~30 components requiring responsive adaptations
- 4 primary breakpoints: 640px, 768px, 1024px, 1280px
- Target devices: iPhone SE (320px), iPhone 12 Pro (390px), iPad (768px), iPad Pro (1024px), Desktop (1920px+)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on AGENTS.md and README.md, the project follows these principles:

### Test-First Development (NON-NEGOTIABLE)
- ✅ **Status**: PASS
- **Implementation**: All responsive changes will follow test-first approach:
  1. Write Playwright tests for responsive layouts at each breakpoint (320px, 768px, 1024px, 1920px)
  2. Tests verify: no horizontal scroll, touch target sizes, text readability, layout structure
  3. Tests fail initially
  4. Implement responsive Tailwind classes
  5. Tests pass
- **Coverage Requirements**:
  - E2E tests: 100% of user flows (document upload, chat, project selection) at mobile/tablet/desktop breakpoints
  - Component tests: 80%+ coverage for responsive layout variations
  - Visual regression: snapshot tests for each breakpoint

### Code Quality Standards
- ✅ **Status**: PASS
- **Compliance**:
  - Components remain under 300 lines (responsive styles are CSS-only, minimal JS changes)
  - TypeScript strict mode (no new types needed, primarily CSS changes)
  - ESLint rules enforced (no warnings)
  - JSDoc for any new utility functions (e.g., viewport detection hooks if needed)

### Accessibility (WCAG 2.1 AA)
- ✅ **Status**: PASS with ENHANCEMENT
- **Compliance**:
  - Touch targets: Minimum 44x44px enforced via Tailwind utilities (p-3, min-h-[44px], min-w-[44px])
  - Semantic HTML: Already in place, responsive changes don't affect structure
  - ARIA labels: Existing labels work across breakpoints
  - Color contrast: 4.5:1 ratio maintained in dark/light themes at all sizes
  - Keyboard navigation: Unaffected by responsive CSS changes
- **Enhancement**: Responsive design improves accessibility by optimizing for touch devices

### Performance Standards
- ✅ **Status**: PASS with MONITORING
- **Compliance**:
  - Page load: <3s on 3G (budget: <50KB additional CSS, Tailwind responsive utilities are minimal)
  - Time to Interactive: <5s (no JS changes for most responsive features)
  - First Contentful Paint: <1.5s (unaffected by responsive CSS)
  - Largest Contentful Paint: <2.5s (images already use responsive sizing)
  - Bundle size: <500KB (currently 190KB gzipped, responsive CSS adds ~10-20KB)
- **Monitoring**: Track CLS (Cumulative Layout Shift) to ensure <0.1 during breakpoint transitions

### Feature-Based Organization
- ✅ **Status**: PASS
- **Compliance**:
  - Responsive changes made within existing feature modules
  - No new directories needed
  - Co-location maintained: styles live with components via Tailwind classes

### Existing Dependencies
- ✅ **Status**: PASS - No new dependencies needed
- **Rationale**:
  - Tailwind CSS already installed with responsive utilities (@sm:, @md:, @lg:, @xl:)
  - Shadcn UI components already support responsive props (className overrides)
  - @tanstack/react-virtual already in use for DocumentList (supports responsive column counts)
  - React Router already handles responsive routing (no changes needed)

**GATE RESULT**: ✅ ALL CHECKS PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-responsive-design/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - responsive design patterns research
├── quickstart.md        # Phase 1 output - developer guide for responsive implementation
├── checklists/
│   └── requirements.md  # Spec quality checklist (already created)
└── contracts/           # N/A - no API changes for responsive design
```

### Source Code (repository root)

This is a frontend-only enhancement to existing React application structure:

```text
src/
├── components/
│   ├── ui/                    # Shadcn UI components - ADD responsive variants
│   │   ├── button.tsx         # MODIFY: touch-friendly sizing (min-h-[44px] on mobile)
│   │   ├── input.tsx          # MODIFY: larger input on mobile (text-base vs text-sm)
│   │   ├── card.tsx           # MODIFY: responsive padding (p-4 sm:p-6)
│   │   ├── dialog.tsx         # MODIFY: full-screen on mobile, centered on desktop
│   │   ├── select.tsx         # MODIFY: drawer on mobile, dropdown on desktop
│   │   └── ...                # Other UI primitives requiring touch target adjustments
│   ├── layout/
│   │   ├── Header.tsx         # MODIFY: mobile hamburger menu, desktop horizontal nav
│   │   ├── ThemeProvider.tsx  # NO CHANGE - theme works across breakpoints
│   │   └── MobileNav.tsx      # NEW: mobile navigation drawer component
│   └── common/
│       ├── Loading.tsx        # MODIFY: responsive sizing for loading indicators
│       └── ErrorBoundary.tsx  # NO CHANGE - error display adapts via parent styles
├── features/
│   ├── chat/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx   # MODIFY: single-column mobile, multi-column desktop
│   │   │   ├── ChatMessageList.tsx # MODIFY: responsive padding and font sizes
│   │   │   ├── ChatInput.tsx       # MODIFY: fixed bottom on mobile, relative on desktop
│   │   │   ├── Citation.tsx        # MODIFY: responsive tooltip positioning
│   │   │   └── EmptyState.tsx      # MODIFY: responsive card grid (1 col mobile, 2 col desktop)
│   │   ├── hooks/              # NO CHANGES - data hooks unaffected
│   │   └── services/           # NO CHANGES - API services unaffected
│   ├── documents/
│   │   ├── components/
│   │   │   ├── DocumentList.tsx    # MODIFY: grid columns (1 mobile, 2 tablet, 3-4 desktop)
│   │   │   ├── DocumentCard.tsx    # MODIFY: responsive layout and touch targets
│   │   │   ├── UploadTabs.tsx      # MODIFY: stacked tabs on mobile, horizontal on desktop
│   │   │   ├── DocumentFilters.tsx # MODIFY: drawer on mobile, sidebar on desktop
│   │   │   └── DocumentDetails.tsx # MODIFY: full-screen modal on mobile
│   │   ├── hooks/              # NO CHANGES
│   │   └── services/           # NO CHANGES
│   └── projects/
│       ├── components/
│       │   ├── ProjectList.tsx     # MODIFY: single column mobile, grid on desktop
│       │   ├── ProjectSelector.tsx # MODIFY: drawer on mobile, dropdown on desktop
│       │   └── CreateProjectDialog.tsx # MODIFY: full-screen on mobile
│       ├── hooks/              # NO CHANGES
│       └── services/           # NO CHANGES
├── hooks/
│   ├── useMediaQuery.ts       # NEW: custom hook for viewport detection
│   └── useBreakpoint.ts       # NEW: hook returning current breakpoint (mobile/tablet/desktop)
├── lib/
│   ├── utils.ts               # MODIFY: add responsive utility functions (cn helper already exists)
│   └── breakpoints.ts         # NEW: breakpoint constants matching Tailwind config
├── pages/
│   ├── ProjectsPage.tsx       # MODIFY: responsive page container
│   ├── DocumentsPage.tsx      # MODIFY: responsive page container
│   └── ChatPage.tsx           # MODIFY: responsive page container
└── styles/                    # (if exists) or App.css/index.css
    └── responsive.css         # NEW: custom responsive utilities beyond Tailwind (if needed)

tests/
├── e2e/
│   ├── specs/
│   │   ├── responsive.spec.ts # NEW: E2E tests for responsive layouts
│   │   ├── mobile.spec.ts     # NEW: mobile-specific user flows
│   │   └── tablet.spec.ts     # NEW: tablet-specific user flows
│   └── fixtures/
│       └── viewports.ts       # NEW: viewport size constants for tests
└── unit/                      # Existing component tests - ADD responsive test cases

tailwind.config.js             # NO CHANGE - breakpoints already defined (sm:640px, md:768px, lg:1024px, xl:1280px)
vite.config.ts                 # NO CHANGE - no build config changes needed
```

**Structure Decision**: Single web application structure (no backend/mobile split). All changes are frontend CSS/component-level modifications. Feature-based organization maintained with responsive changes co-located within existing feature modules. New hooks (`useMediaQuery`, `useBreakpoint`) added to shared hooks directory for viewport detection logic. Testing structure expanded with dedicated responsive test specs organized by viewport category.

## Complexity Tracking

> **No violations detected** - this feature aligns with all constitution principles and does not introduce complexity that requires justification.

The responsive design implementation:
- Uses existing Tailwind CSS utilities (no new dependencies)
- Maintains feature-based organization
- Follows test-first approach
- Enhances accessibility (doesn't compromise it)
- Stays within performance budgets
- Leverages existing component architecture

## Phase 0: Research & Technology Decisions

**Objective**: Resolve all "NEEDS CLARIFICATION" items from Technical Context and research best practices for responsive design in React + Tailwind ecosystem.

### Research Tasks

All items in Technical Context have been resolved through existing project context. Research phase will document best practices and patterns rather than resolve unknowns.

#### R1: Responsive Design Patterns for React + Tailwind + Shadcn UI
**Focus**: Best practices for responsive Tailwind utilities, Shadcn component responsive variants, mobile-first CSS patterns

**Key Questions**:
- What are Tailwind's recommended patterns for mobile-first responsive design?
- How do Shadcn UI components handle responsive prop overrides?
- What are best practices for responsive grid layouts with Tailwind (grid vs flexbox)?
- How to handle responsive modals/dialogs (full-screen mobile vs centered desktop)?

**Expected Output**: Document responsive utility patterns, component adaptation strategies, layout techniques

#### R2: Touch Target Sizing and Mobile Interaction Patterns
**Focus**: WCAG 2.1 AA compliance for touch targets, mobile gesture patterns, viewport meta tag configuration

**Key Questions**:
- How to enforce 44x44px minimum touch targets with Tailwind utilities?
- What are best practices for mobile navigation patterns (hamburger menu, bottom nav, drawer)?
- How to prevent browser auto-zoom on form inputs (16px base font size)?
- How to handle on-screen keyboard interactions (fixed vs relative positioning)?

**Expected Output**: Touch target sizing guide, mobile navigation patterns, form input best practices

#### R3: Responsive Typography and Spacing Scale
**Focus**: Fluid typography, responsive spacing, optimal line lengths for readability

**Key Questions**:
- Should we use Tailwind's default responsive text utilities or custom fluid scales?
- How to maintain 45-75 character line lengths across breakpoints?
- What spacing scale works for mobile (tight) to desktop (generous) progression?
- How to handle heading size scaling (h1 3xl mobile → 5xl desktop)?

**Expected Output**: Typography scale decision, spacing conventions, line length strategy

#### R4: Responsive Layout Strategies for Chat, Documents, Projects
**Focus**: Feature-specific responsive patterns (single-column → multi-column transitions)

**Key Questions**:
- Chat: How to transition from stacked mobile (messages + input) to multi-column desktop (messages + sources sidebar)?
- Documents: What grid column breakpoints for DocumentList (1 mobile → 2 tablet → 3-4 desktop)?
- Projects: Should project selector be drawer (mobile) or dropdown (desktop), or always drawer?
- How to handle responsive tables and wide content (horizontal scroll vs reflow)?

**Expected Output**: Feature-specific layout blueprints, component breakpoint decisions

#### R5: Performance Optimization for Responsive CSS
**Focus**: CSS bundle size impact, avoiding layout shifts, responsive image loading

**Key Questions**:
- What's the expected CSS bundle size impact of responsive utilities?
- How to measure and prevent Cumulative Layout Shift (CLS) during breakpoint transitions?
- Should we use CSS container queries (modern) or media queries (compatible)?
- How to optimize images for responsive layouts (srcset, sizes attribute)?

**Expected Output**: Performance monitoring strategy, CLS prevention techniques, image optimization guide

#### R6: Testing Strategy for Responsive Layouts
**Focus**: Playwright device emulation, responsive component tests, visual regression testing

**Key Questions**:
- What Playwright viewports should be tested (iPhone SE, iPad, Desktop - specific sizes)?
- How to structure responsive E2E tests (separate specs per viewport or single spec with multiple viewports)?
- Should we use visual regression testing (screenshots) or layout assertion tests?
- How to test orientation changes and dynamic viewport resizing?

**Expected Output**: Test plan with viewport matrix, testing approach (visual vs assertion), orientation test strategy

### Research Artifacts

**Deliverable**: `research.md` documenting:
1. Responsive design patterns (mobile-first Tailwind approach)
2. Touch target sizing guidelines (44x44px enforcement)
3. Typography and spacing scale decisions
4. Feature-specific layout strategies
5. Performance optimization techniques
6. Testing strategy and viewport matrix

**Format** (per template):
```markdown
## Decision: [Technology/Pattern Choice]
**Rationale**: [Why this choice]
**Alternatives Considered**: [What else was evaluated]
**Implementation Notes**: [Specific guidance]
```

**Dependencies**: None - research can proceed immediately

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete

### Phase 1 Artifacts

#### 1. Data Model (`data-model.md`)

**N/A for this feature** - Responsive design is a presentation-layer enhancement with no data model changes. No new entities, no database schema changes, no state management changes beyond viewport detection.

**Rationale**: This feature modifies CSS and component rendering logic based on viewport size. All existing data structures (Document, Project, ChatMessage) remain unchanged. Viewport detection is ephemeral client-side state (window.innerWidth) not persisted.

#### 2. API Contracts (`/contracts/`)

**N/A for this feature** - Responsive design has no backend API interaction. All existing API contracts remain unchanged.

**Rationale**: This is a frontend-only feature. No new API endpoints, no request/response changes, no GraphQL schema modifications. Existing endpoints (projects, documents, chat) work identically across all device types.

#### 3. Quickstart Guide (`quickstart.md`)

**Purpose**: Developer guide for implementing responsive features following established patterns

**Contents**:
- **Setup**: Tailwind breakpoint reference, viewport testing tools
- **Responsive Patterns**: Code examples for common patterns (mobile-first utilities, responsive grids, conditional rendering)
- **Component Guidelines**: How to make existing components responsive (touch targets, spacing, layout)
- **Testing Workflow**: How to write and run responsive tests (Playwright device emulation, viewport matrix)
- **Troubleshooting**: Common responsive design issues (horizontal scroll, layout shifts, touch target sizing)

**Format**:
```markdown
# Responsive Design Quickstart

## Setup
- Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Testing viewports: iPhone SE (375px), iPad (768px), Desktop (1920px)

## Patterns

### Mobile-First Utilities
```tsx
// Base styles for mobile, then enhance for larger screens
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">Heading</h1>
</div>
```

### Responsive Grid
```tsx
// 1 column mobile, 2 tablet, 3-4 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

[... additional patterns ...]

## Component Guidelines
[... implementation guidance ...]

## Testing
[... test writing examples ...]
```

#### 4. Agent Context Update

Run agent context script to update AGENTS.md with new responsive design technologies/patterns:

```bash
.specify/scripts/bash/update-agent-context.sh opencode
```

**Expected Additions**:
```markdown
## Active Technologies
- TypeScript 5.9.3 with React 19.2.0 + Shadcn UI, React Query, Axios, React Router, Zod (validation), React Hook Form (001-rag-knowledge-platform)
- Responsive Design: Tailwind CSS mobile-first utilities, useMediaQuery/useBreakpoint hooks, Playwright device emulation testing (002-responsive-design)
- Backend API (localhost:42069) - no frontend persistence beyond session/cache (001-rag-knowledge-platform)

## Recent Changes
- 001-rag-knowledge-platform: Added TypeScript 5.9.3 with React 19.2.0 + Shadcn UI, React Query, Axios, React Router, Zod (validation), React Hook Form
- 002-responsive-design: Implemented mobile-first responsive design with Tailwind utilities, touch-friendly interactions, viewport-specific layouts (mobile 320px+, tablet 768px+, desktop 1024px+)
```

### Phase 1 Validation

After completing Phase 1 artifacts, re-run Constitution Check:

- ✅ Test-first approach documented in quickstart.md
- ✅ No new dependencies (Tailwind already installed)
- ✅ Performance budgets defined (<50KB CSS impact)
- ✅ Accessibility standards reinforced (44x44px touch targets)
- ✅ Feature-based organization maintained

**GATE RESULT**: ✅ Constitution compliance confirmed post-design

## Phase 2: Task Breakdown

**NOT PART OF THIS COMMAND** - Phase 2 task breakdown is generated by `/speckit.tasks` command after planning is complete.

Phase 2 will decompose implementation into concrete tasks based on:
- User stories from spec.md (P1: Mobile, P2: Tablet/Desktop, P3: Touch/Typography)
- Component inventory from Phase 1 (Header, ChatInterface, DocumentList, etc.)
- Research findings from research.md (responsive patterns, testing strategy)
- Test-first workflow (write tests → fail → implement → pass)

Expected task categories:
1. **Setup & Infrastructure**: Breakpoint hooks, test fixtures, viewport utilities
2. **Layout Components**: Header, navigation, page containers
3. **Feature Components**: Chat, Documents, Projects
4. **UI Primitives**: Buttons, inputs, modals, cards (Shadcn overrides)
5. **Testing**: E2E responsive tests, component responsive variants, visual regression
6. **Documentation**: Update component JSDoc, add responsive examples to Storybook (if exists)

## Dependencies

### External Dependencies (Already Installed)
- **Tailwind CSS** - Responsive utilities (@sm:, @md:, @lg:, @xl:)
- **Shadcn UI** - Component primitives with className override support
- **React Router** - Client-side routing (unaffected by responsive changes)
- **Playwright** - E2E testing with device emulation (already in package.json)

### Internal Dependencies (Existing Code)
- All existing pages, features, and components must remain functional
- Existing theme system (dark/light mode) must work across breakpoints
- Existing API integration must work identically on all devices
- Existing tests must continue passing while adding responsive test coverage

### New Dependencies (To Be Created)
- `hooks/useMediaQuery.ts` - Custom hook for viewport detection
- `hooks/useBreakpoint.ts` - Hook returning current breakpoint
- `lib/breakpoints.ts` - Breakpoint constants
- `components/layout/MobileNav.tsx` - Mobile navigation drawer (if hamburger menu chosen)
- `tests/e2e/specs/responsive.spec.ts` - Responsive E2E tests
- `tests/e2e/fixtures/viewports.ts` - Viewport constants for tests

## Success Criteria (from spec.md)

Implementation complete when all success criteria met:

- **SC-001**: 100% of core user flows completable on mobile (375px) without horizontal scrolling
- **SC-002**: All interactive elements meet 44x44px minimum on touch devices
- **SC-003**: Page load <3s on mobile 3G (monitor bundle size impact)
- **SC-004**: CLS <0.1 during responsive transitions (monitor with Lighthouse)
- **SC-005**: Base font size ≥16px on mobile (prevent auto-zoom)
- **SC-006**: 95% task completion rate across devices (measure via E2E test pass rate)
- **SC-007**: Consistent functionality 320px-2560px+ (test matrix coverage)
- **SC-008**: Orientation changes <300ms without state loss (test with Playwright)
- **SC-009**: Pass DevTools device emulation for iPhone SE, iPhone 12 Pro, iPad, iPad Pro, Desktop
- **SC-010**: Full touch/mouse navigation coverage (test with Playwright touch events)

## Next Steps

1. **Execute Phase 0**: Generate `research.md` by researching responsive patterns, touch interactions, typography scales, layout strategies, performance optimization, and testing approaches
2. **Execute Phase 1**: Generate `quickstart.md` with developer implementation guide and responsive patterns
3. **Update Agent Context**: Run `.specify/scripts/bash/update-agent-context.sh opencode` to add responsive design technologies
4. **Proceed to `/speckit.tasks`**: Generate Phase 2 task breakdown for implementation

## Notes

**Feature Type**: Enhancement (non-breaking change to existing functionality)

**Implementation Strategy**: Progressive enhancement - start with mobile-first base styles, then enhance for larger breakpoints. Leverage existing Tailwind utilities where possible, add custom CSS only when necessary (expected to be minimal).

**Risk Mitigation**:
- **Breaking existing layouts**: Test-first approach with comprehensive E2E coverage at multiple breakpoints
- **Performance degradation**: Monitor bundle size and CLS metrics, stay within <50KB budget
- **Touch target violations**: Enforce 44x44px minimum via Tailwind utilities and automated tests
- **Cross-browser inconsistencies**: Test on multiple browsers via Playwright (Chromium, Firefox, WebKit)

**Rollout Strategy**: Feature flag not needed (CSS changes are non-breaking). Can deploy incrementally (e.g., mobile support first, then tablet/desktop) using git branches, but full rollout recommended to maintain consistency.
