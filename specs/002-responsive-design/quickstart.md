# Responsive Design Quickstart Guide

**Feature**: 002-responsive-design  
**Date**: 2025-11-16  
**Purpose**: Developer guide for implementing responsive features following established patterns

---

## Table of Contents

1. [Setup & Tools](#setup--tools)
2. [Responsive Patterns](#responsive-patterns)
3. [Component Guidelines](#component-guidelines)
4. [Testing Workflow](#testing-workflow)
5. [Troubleshooting](#troubleshooting)
6. [Checklist](#implementation-checklist)

---

## Setup & Tools

### Tailwind Breakpoints

The project uses Tailwind's default breakpoints (mobile-first):

| Breakpoint | Min Width | Use Case |
|------------|-----------|----------|
| `base` | 0px | Mobile phones (default, no prefix) |
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets in portrait |
| `lg:` | 1024px | Tablets in landscape, small desktops |
| `xl:` | 1280px | Large desktops |
| `2xl:` | 1400px | Ultra-wide screens (container max-width) |

### Testing Viewports

Test at these key viewport sizes:

| Device | Width | Height | Target |
|--------|-------|--------|--------|
| iPhone SE | 375px | 667px | Smallest mobile |
| iPhone 12 Pro | 390px | 844px | Modern mobile |
| iPad | 768px | 1024px | Tablet portrait |
| iPad Pro | 1024px | 1366px | Tablet landscape |
| Desktop | 1920px | 1080px | Standard desktop |
| Ultra-wide | 2560px | 1440px | Large desktop |

### Development Tools

```bash
# Start dev server
npm run dev

# Run responsive tests
npm run test:e2e -- responsive

# Build and check bundle size
npm run build
# Check dist/assets/*.css sizes (target: <50KB increase)

# Type check
npx tsc -b
```

### Browser DevTools

**Chrome/Edge DevTools**:
1. Open DevTools (F12 or Cmd+Option+I)
2. Toggle device toolbar (Cmd+Shift+M)
3. Select device from dropdown or set custom dimensions
4. Test orientation changes with rotate button

**Playwright Inspector**:
```bash
npm run test:e2e -- --debug
# Launches headed browser with inspector for interactive testing
```

---

## Responsive Patterns

### Pattern 1: Mobile-First Utilities

**Always start with mobile (base) styles, then enhance for larger screens.**

```tsx
// ✅ Good: Mobile-first (base → sm → md → lg)
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
    Heading scales from mobile to desktop
  </h1>
  <p className="text-base leading-relaxed">
    Body text stays 16px for readability
  </p>
</div>

// ❌ Bad: Desktop-first (requires overriding)
<div className="p-8 md:p-6 sm:p-4">
  {/* Harder to reason about, more overrides */}
</div>
```

### Pattern 2: Responsive Grid Layouts

**Use grid for card layouts with responsive column counts.**

```tsx
// Document grid: 1 column mobile → 2 tablet → 3-4 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {documents.map(doc => (
    <DocumentCard key={doc.id} document={doc} />
  ))}
</div>

// Project list: 1 column mobile → 2 desktop
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {projects.map(project => (
    <ProjectCard key={project.id} project={project} />
  ))}
</div>
```

### Pattern 3: Responsive Flexbox Layouts

**Use flexbox for stacked mobile → side-by-side desktop layouts.**

```tsx
// Chat interface: stacked mobile → split desktop
<div className="flex flex-col lg:flex-row h-full">
  {/* Messages: full width mobile, 2/3 desktop */}
  <main className="flex-1 flex flex-col">
    <ChatMessageList />
    <ChatInput />
  </main>
  
  {/* Sources: hidden mobile, sidebar desktop */}
  <aside className="hidden lg:block lg:w-80 border-l">
    <SourcesList />
  </aside>
</div>
```

### Pattern 4: Responsive Spacing

**Scale spacing from tight (mobile) → generous (desktop).**

```tsx
// Container padding
<div className="container mx-auto px-4 md:px-6 lg:px-8">
  {/* 16px mobile | 24px tablet | 32px desktop */}
</div>

// Stack spacing (vertical gaps)
<div className="space-y-4 md:space-y-6 lg:space-y-8">
  <Section1 />
  <Section2 />
</div>

// Inline spacing (horizontal gaps)
<div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

### Pattern 5: Responsive Typography

**16px minimum on mobile to prevent auto-zoom, can scale down on desktop.**

```tsx
// Headings scale progressively
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Main Heading
</h1>
<h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">
  Section Heading
</h2>
<h3 className="text-lg md:text-xl lg:text-2xl font-medium">
  Subsection
</h3>

// Body text: always 16px (text-base) for readability
<p className="text-base leading-relaxed">
  Main content text maintains comfortable size across devices.
</p>

// UI labels: can be smaller on desktop
<span className="text-sm md:text-xs text-muted-foreground">
  Metadata or helper text
</span>

// Inputs: MUST be text-base on mobile (prevents auto-zoom)
<Input 
  className="text-base md:text-sm" 
  placeholder="Search..."
/>
```

### Pattern 6: Touch-Friendly Targets (WCAG 2.1 AA)

**Minimum 44x44px on mobile/tablet, can be smaller on desktop.**

```tsx
// Standard button: 44px mobile, 36px desktop
<Button className="min-h-[44px] min-w-[44px] px-4 py-2 md:min-h-[36px] md:px-3 md:py-1.5">
  Click Me
</Button>

// Icon button: explicit sizing
<Button 
  size="icon" 
  className="h-[44px] w-[44px] md:h-10 md:w-10"
  aria-label="Settings"
>
  <Settings className="h-5 w-5" />
</Button>

// List item button: padding ensures height
<button className="w-full text-left p-3 min-h-[44px] hover:bg-accent rounded-md">
  <div className="flex items-center justify-between">
    <span>List Item</span>
    <ChevronRight className="h-5 w-5" />
  </div>
</button>

// Link with touch area
<a 
  href="#"
  className="inline-flex items-center min-h-[44px] py-2 px-1 hover:underline"
>
  Learn more →
</a>
```

### Pattern 7: Responsive Modals/Dialogs

**Full-screen on mobile, centered on desktop.**

```tsx
// Dialog component
<Dialog>
  <DialogContent className="w-full h-full sm:h-auto sm:max-w-[425px] sm:rounded-lg">
    {/* Mobile: full-screen */}
    {/* Desktop: centered modal with max-width */}
    <DialogHeader>
      <DialogTitle className="text-xl md:text-2xl">Title</DialogTitle>
    </DialogHeader>
    <div className="p-4 md:p-6">
      {/* Content */}
    </div>
  </DialogContent>
</Dialog>

// Drawer for mobile navigation
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="h-[44px] w-[44px]">
      <Menu className="h-6 w-6" />
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-[280px] sm:w-[350px]">
    <nav className="flex flex-col gap-4 mt-8">
      {/* Navigation items */}
    </nav>
  </SheetContent>
</Sheet>
```

### Pattern 8: Conditional Rendering by Viewport

**Use hooks for behavioral changes (drawer vs dropdown).**

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery'

function ProjectSelector() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  // Mobile: full-width select with drawer
  if (isMobile) {
    return (
      <Select>
        <SelectTrigger className="w-full h-[44px] text-base">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map(p => (
            <SelectItem key={p.id} value={p.id} className="h-[44px]">
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
  
  // Desktop: compact dropdown
  return (
    <Select>
      <SelectTrigger className="w-[200px] text-sm">
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        {projects.map(p => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### Pattern 9: Responsive Tables/Wide Content

**Horizontal scroll on mobile, full-width on desktop.**

```tsx
// Wrap table in scrollable container
<div className="overflow-x-auto">
  <table className="min-w-full">
    <thead>
      <tr>
        <th className="px-4 py-2 text-left">Column 1</th>
        <th className="px-4 py-2 text-left">Column 2</th>
        <th className="px-4 py-2 text-left">Column 3</th>
      </tr>
    </thead>
    <tbody>
      {/* Table rows */}
    </tbody>
  </table>
</div>

// Alternative: Card list on mobile, table on desktop
{isMobile ? (
  <div className="space-y-4">
    {data.map(item => <DataCard key={item.id} {...item} />)}
  </div>
) : (
  <table className="w-full">
    {/* Table */}
  </table>
)}
```

### Pattern 10: Preventing Layout Shift (CLS)

**Reserve space for content that loads or changes size.**

```tsx
// Images: use aspect-ratio to prevent shift
<div className="aspect-video bg-muted rounded-md overflow-hidden">
  <img 
    src={thumbnail} 
    alt="Thumbnail"
    className="w-full h-full object-cover"
    loading="lazy"
  />
</div>

// Expandable content: use max-height transition
<div 
  className={cn(
    "overflow-hidden transition-all duration-300",
    isExpanded ? "max-h-[500px]" : "max-h-0"
  )}
>
  {/* Content doesn't cause layout shift */}
</div>

// Containers with dynamic content: min-height
<div className="min-h-[400px] md:min-h-[500px]">
  {isLoading ? <Skeleton /> : <Content />}
</div>
```

---

## Component Guidelines

### Modifying Shadcn UI Components

Shadcn components live in `src/components/ui/` and can be directly modified.

#### Button Component

```tsx
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center ... min-h-[44px] min-w-[44px] px-4 py-2 md:min-h-[36px] md:min-w-[36px] md:px-3 md:py-1.5",
  {
    variants: {
      size: {
        default: "h-[44px] px-4 py-2 md:h-10 md:px-4 md:py-2",
        sm: "h-[44px] px-3 md:h-9 md:px-3",
        lg: "h-[44px] px-8 md:h-11 md:px-8",
        icon: "h-[44px] w-[44px] md:h-10 md:w-10",
      },
    },
  }
)
```

#### Input Component

```tsx
// src/components/ui/input.tsx
<input
  className={cn(
    "flex h-10 w-full rounded-md border ... text-base md:text-sm",
    // ^ 16px on mobile (prevents auto-zoom), 14px on desktop
    className
  )}
  ref={ref}
  {...props}
/>
```

#### Card Component

```tsx
// src/components/ui/card.tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm p-4 md:p-6",
        // ^ Responsive padding built-in
        className
      )}
      {...props}
    />
  )
)
```

#### Dialog Component

```tsx
// src/components/ui/dialog.tsx
const DialogContent = React.forwardRef<...>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
        "w-full h-full sm:h-auto sm:max-w-lg sm:rounded-lg",
        // ^ Full-screen mobile, centered desktop
        "grid gap-4 border bg-background p-6 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
))
```

### Feature Component Examples

#### Chat Interface

```tsx
// src/features/chat/components/ChatInterface.tsx
export function ChatInterface({ projectId }: Props) {
  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Messages column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <ChatMessageList messages={messages} />
        </div>
        
        {/* Input */}
        <div className="border-t p-4 md:p-6 bg-background">
          <ChatInput onSend={handleSend} disabled={isPending} />
        </div>
      </div>
      
      {/* Sources sidebar - hidden on mobile */}
      {sources.length > 0 && (
        <aside className="hidden lg:flex lg:flex-col lg:w-80 border-l overflow-y-auto p-6">
          <h2 className="text-lg font-semibold mb-4">Sources</h2>
          <SourcesList sources={sources} />
        </aside>
      )}
    </div>
  )
}
```

#### Document List

```tsx
// src/features/documents/components/DocumentList.tsx
export function DocumentList({ documents }: Props) {
  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchInput className="w-full sm:max-w-xs" />
        <DocumentFilters />
      </div>
      
      {/* Document grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {documents.map(doc => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  )
}
```

#### Header with Mobile Navigation

```tsx
// src/components/layout/Header.tsx
export function Header() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  return (
    <header className="border-b">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        <Link to="/">
          <h1 className="text-lg md:text-xl font-bold">RAG Platform</h1>
        </Link>
        
        {isMobile ? (
          <MobileNav />
        ) : (
          <nav className="flex items-center gap-6">
            <ProjectSelector />
            <ThemeToggle />
          </nav>
        )}
      </div>
    </header>
  )
}
```

### Custom Hooks

#### useMediaQuery

```tsx
// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react'

/**
 * Hook to detect if a media query matches
 * @param query - Media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    
    return () => media.removeEventListener('change', listener)
  }, [query])
  
  return matches
}
```

#### useBreakpoint

```tsx
// src/hooks/useBreakpoint.ts
import { useMediaQuery } from './useMediaQuery'

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

/**
 * Hook to get current Tailwind breakpoint category
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
export function useBreakpoint(): Breakpoint {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  
  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  return 'desktop'
}
```

#### Breakpoint Constants

```tsx
// src/lib/breakpoints.ts
/**
 * Tailwind breakpoint values (px)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1400,
} as const

/**
 * Common media query strings
 */
export const MEDIA_QUERIES = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',
} as const
```

---

## Testing Workflow

### 1. Write E2E Tests First (Test-First Approach)

```tsx
// tests/e2e/specs/responsive-documents.spec.ts
import { test, expect } from '@playwright/test'
import { VIEWPORTS } from '../fixtures/viewports'

test.describe('Documents Page Responsive', () => {
  // Test mobile viewport
  test.use(VIEWPORTS.mobile)
  
  test('should display documents in single column on mobile', async ({ page }) => {
    await page.goto('/projects/test-project/documents')
    
    // Check no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth)
    
    // Check grid is single column
    const grid = page.locator('[data-testid="document-grid"]')
    const columns = await grid.evaluate(el => 
      window.getComputedStyle(el).gridTemplateColumns.split(' ').length
    )
    expect(columns).toBe(1)
    
    // Check touch targets
    const uploadButton = page.locator('button:has-text("Upload")')
    const box = await uploadButton.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
    expect(box?.width).toBeGreaterThanOrEqual(44)
  })
})
```

### 2. Run Tests (Should Fail Initially)

```bash
npm run test:e2e -- responsive-documents
# Tests fail because responsive styles not yet implemented
```

### 3. Implement Responsive Styles

```tsx
// src/features/documents/components/DocumentList.tsx
export function DocumentList({ documents }: Props) {
  return (
    <div 
      data-testid="document-grid"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
    >
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  )
}
```

### 4. Re-run Tests (Should Pass)

```bash
npm run test:e2e -- responsive-documents
# Tests pass with responsive implementation
```

### 5. Test Across Viewport Matrix

```tsx
// tests/e2e/specs/responsive.spec.ts
import { VIEWPORTS } from '../fixtures/viewports'

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(`${name} (${viewport.width}px)`, () => {
    test.use({ viewport })
    
    test('core user flows work', async ({ page }) => {
      // Test document upload
      // Test chat interaction
      // Test project selection
    })
  })
}
```

### Test Fixtures

```tsx
// tests/e2e/fixtures/viewports.ts
export const VIEWPORTS = {
  mobile: { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  ultrawide: { width: 2560, height: 1440, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
} as const
```

### Component Testing

```tsx
// src/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button responsive behavior', () => {
  it('should have minimum 44px height', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button')
    
    // Get computed height
    const height = window.getComputedStyle(button).height
    expect(parseInt(height)).toBeGreaterThanOrEqual(44)
  })
})
```

---

## Troubleshooting

### Issue: Horizontal Scroll on Mobile

**Problem**: Content wider than viewport causes horizontal scrolling

**Solution**:
```tsx
// Check for fixed widths
// ❌ Bad
<div style={{ width: '1000px' }}>Content</div>

// ✅ Good
<div className="w-full max-w-full">Content</div>

// Check for negative margins extending beyond container
// ❌ Bad
<div className="-mx-8">Content</div> // Extends beyond mobile viewport

// ✅ Good
<div className="-mx-4 md:-mx-8">Content</div> // Smaller negative margin on mobile
```

### Issue: Input Auto-Zoom on iOS

**Problem**: iOS Safari zooms in when focusing inputs with font-size < 16px

**Solution**:
```tsx
// Ensure text-base (16px) on mobile
<Input className="text-base md:text-sm" />
<Select className="text-base md:text-sm">
  <SelectTrigger className="text-base md:text-sm" />
</Select>
```

### Issue: Touch Targets Too Small

**Problem**: Buttons/links are hard to tap on mobile

**Solution**:
```tsx
// Add minimum size classes
<Button className="min-h-[44px] min-w-[44px]">Click</Button>

// Or use padding to expand touch area
<a href="#" className="inline-flex items-center min-h-[44px] py-2 px-1">
  Link
</a>
```

### Issue: Layout Shift When Loading

**Problem**: Content causes layout jump when it loads

**Solution**:
```tsx
// Reserve space with min-height or aspect-ratio
<div className="min-h-[400px]">
  {isLoading ? <Skeleton /> : <Content />}
</div>

// For images
<div className="aspect-video bg-muted">
  <img src={src} alt={alt} className="w-full h-full object-cover" />
</div>
```

### Issue: Modal Too Large on Desktop

**Problem**: Full-width modals look weird on large screens

**Solution**:
```tsx
// Use max-width on desktop
<DialogContent className="w-full sm:max-w-lg">
  {/* Full-width mobile, 512px max desktop */}
</DialogContent>
```

### Issue: Text Too Small on Mobile

**Problem**: Small text is hard to read on mobile

**Solution**:
```tsx
// Scale up on mobile, down on desktop
<p className="text-base md:text-sm">
  {/* 16px mobile, 14px desktop */}
</p>
```

### Issue: Grid Not Responsive

**Problem**: Grid stays same columns on all devices

**Solution**:
```tsx
// Check for responsive col classes
// ❌ Bad
<div className="grid grid-cols-4 gap-4">

// ✅ Good
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```

---

## Implementation Checklist

Use this checklist when making components responsive:

### Visual Design
- [ ] Test at 375px, 768px, 1024px, 1920px viewports
- [ ] No horizontal scrolling at any breakpoint
- [ ] Text is readable without zooming
- [ ] Images scale appropriately
- [ ] Spacing feels balanced (not cramped or excessive)
- [ ] Dark and light themes work at all breakpoints

### Touch Targets (Mobile/Tablet)
- [ ] All buttons minimum 44x44px on touch devices
- [ ] Links have adequate padding (min-h-[44px])
- [ ] Icon buttons use explicit sizing
- [ ] List items have full-width tap areas
- [ ] Form inputs are touch-friendly

### Typography
- [ ] Inputs are text-base (16px) on mobile
- [ ] Headings scale progressively (smaller mobile → larger desktop)
- [ ] Body text maintains text-base for readability
- [ ] UI labels can be text-sm on desktop
- [ ] Line lengths stay under 75 characters

### Layout
- [ ] Mobile: single-column stacking
- [ ] Tablet: 2-column where appropriate
- [ ] Desktop: multi-column with sidebars
- [ ] Navigation is accessible (hamburger menu on mobile)
- [ ] Modals are full-screen on mobile, centered on desktop

### Performance
- [ ] No layout shift (CLS < 0.1)
- [ ] Images have aspect-ratio or explicit dimensions
- [ ] Lazy load images below fold
- [ ] CSS bundle size increase < 50KB

### Testing
- [ ] E2E tests pass at all viewports
- [ ] Component tests verify responsive behavior
- [ ] Manual testing on real devices (iOS, Android)
- [ ] Orientation changes work smoothly
- [ ] No console errors at any breakpoint

### Accessibility
- [ ] WCAG 2.1 AA touch target compliance
- [ ] Keyboard navigation works at all breakpoints
- [ ] Screen reader testing at different viewports
- [ ] Color contrast maintained across themes/sizes
- [ ] ARIA labels present and correct

---

## Quick Reference

### Most Common Patterns

```tsx
// Container
<div className="container mx-auto px-4 md:px-6 lg:px-8">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

// Stack
<div className="space-y-4 md:space-y-6 lg:space-y-8">

// Heading
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Button
<Button className="min-h-[44px] min-w-[44px] text-base md:text-sm">

// Input
<Input className="text-base md:text-sm" />

// Modal
<DialogContent className="w-full h-full sm:h-auto sm:max-w-lg sm:rounded-lg">

// Hide on mobile
<div className="hidden lg:block">Desktop only</div>

// Show only on mobile
<div className="lg:hidden">Mobile only</div>

// Flex row on desktop, column on mobile
<div className="flex flex-col lg:flex-row gap-4">
```

---

**Need Help?** Refer to `research.md` for detailed rationale behind these patterns, or check the Tailwind CSS documentation for specific utilities.
