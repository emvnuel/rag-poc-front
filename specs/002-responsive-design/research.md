# Responsive Design Research: RAG Knowledge Platform

**Date**: 2025-11-16  
**Feature**: 002-responsive-design  
**Purpose**: Document responsive design patterns, best practices, and technology decisions for implementing multi-device support

## Overview

This document captures research findings and technology decisions for implementing responsive design across mobile (320px-480px), tablet (768px-1024px), and desktop (1024px+) viewports in the RAG Knowledge Platform frontend.

---

## R1: Responsive Design Patterns for React + Tailwind + Shadcn UI

### Decision: Mobile-First Tailwind Utility Approach

**Rationale**:
- Tailwind CSS provides built-in responsive utilities with mobile-first breakpoints (sm:, md:, lg:, xl:)
- Mobile-first approach aligns with progressive enhancement philosophy: start with constrained mobile design, enhance for larger screens
- Shadcn UI components are built on Radix UI primitives which accept className prop overrides, allowing full Tailwind responsive control
- Minimal JavaScript needed - most responsive behavior achieved through CSS breakpoints
- Already installed in project (zero new dependencies)

**Alternatives Considered**:
1. **CSS-in-JS with styled-components**: Adds ~16KB bundle overhead, requires new dependency, less performant than Tailwind's compile-time approach
2. **Desktop-first approach**: Harder to maintain, forces mobile as an afterthought, requires overriding more styles
3. **CSS Modules with media queries**: More verbose, lacks Tailwind's utility-first DX, requires writing more custom CSS

**Implementation Notes**:

```tsx
// Mobile-first pattern: base styles for mobile, then enhance
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">Heading</h1>
</div>

// Responsive grid: 1 col mobile → 2 tablet → 3-4 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Conditional layout: stack on mobile, side-by-side on desktop
<div className="flex flex-col lg:flex-row gap-4">
  <main className="flex-1">{children}</main>
  <aside className="lg:w-80">{sidebar}</aside>
</div>
```

**Tailwind Breakpoints** (from `tailwind.config.js`):
- `sm`: 640px (large mobile/small tablet)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)
- `2xl`: 1400px (custom - already configured for container max-width)

---

### Decision: Shadcn UI Component Responsive Variants via className

**Rationale**:
- Shadcn UI components are Radix UI primitives with Tailwind styling
- All Shadcn components accept `className` prop for overrides
- Can apply responsive utilities directly to Shadcn components without modifying source
- Maintains component API stability (no breaking changes)

**Implementation Notes**:

```tsx
// Button with responsive sizing
<Button className="h-11 md:h-10 px-4 md:px-8">
  Click Me
</Button>

// Dialog: full-screen mobile, centered desktop
<Dialog>
  <DialogContent className="w-full h-full md:h-auto md:max-w-lg md:rounded-lg">
    {content}
  </DialogContent>
</Dialog>

// Select: native picker on mobile, custom dropdown on desktop
// (Shadcn Select component automatically handles this via Radix UI)
```

---

### Decision: CSS Grid for Document/Project Lists, Flexbox for Layout Structure

**Rationale**:
- **Grid**: Better for equal-width cards with automatic wrapping (DocumentList, ProjectList)
- **Flexbox**: Better for flexible layouts with variable-width sections (Header, ChatInterface sidebar)
- Tailwind provides excellent utilities for both: `grid grid-cols-*` and `flex flex-col/flex-row`
- Grid's `auto-fill` or `auto-fit` not needed - explicit breakpoint columns preferred for predictability

**Implementation Notes**:

```tsx
// Grid for cards (documents, projects)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {documents.map(doc => <DocumentCard key={doc.id} {...doc} />)}
</div>

// Flexbox for layout structure
<div className="flex flex-col h-screen">
  <Header />
  <main className="flex-1 flex flex-col lg:flex-row">
    <ChatMessages className="flex-1" />
    <ChatSources className="lg:w-80 lg:border-l" />
  </main>
</div>
```

---

### Decision: Full-Screen Mobile Modals, Centered Desktop Dialogs

**Rationale**:
- Mobile: Limited screen space → full-screen overlays maximize content area, easier to interact with
- Desktop: Abundant space → centered modals preserve context, less jarring
- Shadcn Dialog component supports both via className overrides
- Industry standard pattern (iOS, Android, web apps all follow this)

**Implementation Notes**:

```tsx
<Dialog>
  <DialogContent className="
    fixed inset-0 md:relative md:inset-auto
    w-full h-full md:w-auto md:h-auto
    max-w-full md:max-w-lg
    rounded-none md:rounded-lg
    p-6 md:p-8
  ">
    <DialogHeader>
      <DialogTitle>Document Details</DialogTitle>
    </DialogHeader>
    {content}
  </DialogContent>
</Dialog>
```

---

## R2: Touch Target Sizing and Mobile Interaction Patterns

### Decision: 44x44px Minimum Touch Targets (WCAG 2.1 AA)

**Rationale**:
- WCAG 2.1 Level AA requires 44x44px minimum target size for interactive elements
- Average adult finger pad is 40-48px
- Providing adequate spacing prevents mis-taps, improves UX
- Tailwind utilities make enforcement straightforward: `min-h-[44px]`, `min-w-[44px]`, `p-3`

**Alternatives Considered**:
1. **48x48px (iOS guideline)**: More generous but takes more screen space on mobile where it's precious
2. **40x40px (Material Design)**: Below WCAG AA standard, not accessible enough
3. **No minimum**: Poor accessibility, high mis-tap rate, frustrating UX

**Implementation Notes**:

```tsx
// Button with minimum touch target
<Button className="min-h-[44px] min-w-[44px] px-4">
  Save
</Button>

// Icon button (ensure icon parent is 44x44)
<button className="flex items-center justify-center min-h-[44px] min-w-[44px]">
  <Icon className="h-5 w-5" />
</button>

// List item with adequate spacing
<div className="py-3 px-4"> {/* 44px height with text-base */}
  <span>List Item</span>
</div>
```

**Testing**:
- Playwright test: `await expect(button).toHaveCSS('min-height', '44px')`
- Visual inspection: Chrome DevTools → Show rulers, measure elements

---

### Decision: Hamburger Menu + Drawer for Mobile Navigation

**Rationale**:
- Header space constrained on mobile → hamburger icon saves horizontal space
- Drawer overlay preserves context while showing full navigation options
- Industry standard pattern, users are familiar (iOS, Android, Material Design, Bootstrap)
- Shadcn Sheet component provides accessible drawer implementation out of the box

**Alternatives Considered**:
1. **Bottom navigation bar**: Better for 3-5 primary actions, but RAG platform navigation is hierarchical (projects → documents → chat)
2. **Tabs across top**: Not enough space for "Projects", "Documents", "Chat" + workspace selector on 320px width
3. **Always-visible sidebar**: Takes too much screen space on mobile, obscures content

**Implementation Notes**:

```tsx
// MobileNav component (new)
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden min-h-[44px] min-w-[44px]">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px]">
        <nav className="flex flex-col gap-4">
          <Link to="/projects">Projects</Link>
          <Link to="/documents">Documents</Link>
          <Link to="/chat">Chat</Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

// Header component integration
<header className="border-b">
  <div className="flex items-center justify-between px-4 h-16">
    <MobileNav /> {/* Mobile only */}
    <Logo />
    <nav className="hidden lg:flex gap-4"> {/* Desktop only */}
      <Link to="/projects">Projects</Link>
      <Link to="/documents">Documents</Link>
      <Link to="/chat">Chat</Link>
    </nav>
    <ThemeToggle />
  </div>
</header>
```

---

### Decision: 16px Base Font Size on Mobile (Prevent Auto-Zoom)

**Rationale**:
- iOS Safari and Chrome auto-zoom form inputs with font-size < 16px
- Auto-zoom disrupts UX, forces manual zoom out, breaks viewport consistency
- 16px is readable on mobile devices (no usability sacrifice)
- Tailwind's `text-base` class is 16px by default

**Implementation Notes**:

```tsx
// Input with minimum 16px font size
<Input 
  className="text-base" // 16px, prevents auto-zoom
  placeholder="Search documents..."
/>

// Select with minimum 16px (Shadcn Select already uses text-base)
<Select>
  <SelectTrigger className="text-base">
    <SelectValue />
  </SelectTrigger>
</Select>

// Textarea
<Textarea 
  className="text-base"
  placeholder="Enter text..."
/>
```

**Meta viewport** (already in `index.html`):
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
```
Note: Don't use `maximum-scale=1.0` (prevents accessibility zoom)

---

### Decision: Fixed Positioning for Mobile Chat Input, Relative for Desktop

**Rationale**:
- Mobile: On-screen keyboard appears → fixed input stays visible above keyboard
- Desktop: No on-screen keyboard → relative positioning keeps input in flow
- Prevents input from being obscured on mobile (common UX issue)

**Implementation Notes**:

```tsx
// ChatInput component
<div className="
  fixed bottom-0 left-0 right-0 md:relative md:bottom-auto
  border-t bg-background p-4
  z-10 md:z-auto
">
  <Input placeholder="Ask a question..." />
  <Button>Send</Button>
</div>

// Adjust parent to account for fixed input on mobile
<div className="flex flex-col h-full pb-[72px] md:pb-0">
  <ChatMessageList />
  {/* Fixed input overlays this on mobile */}
</div>
```

---

## R3: Responsive Typography and Spacing Scale

### Decision: Tailwind Responsive Text Utilities (Not Fluid Typography)

**Rationale**:
- Tailwind's discrete breakpoint utilities (`text-2xl md:text-3xl lg:text-4xl`) provide predictable, testable sizes
- Fluid typography with `clamp()` is harder to test, debug, and maintain (three values: min, preferred, max)
- Discrete steps are more common in design systems (Material Design, Bootstrap, Tailwind defaults)
- Project already uses Tailwind utilities throughout - consistency

**Alternatives Considered**:
1. **Fluid typography with clamp()**: `font-size: clamp(1.5rem, 2vw + 1rem, 2.5rem)` - more modern but harder to reason about, less predictable across viewports
2. **rem-based with root font-size scaling**: Requires custom CSS, breaks Tailwind utility pattern
3. **Fixed sizes across breakpoints**: Poor UX - too small on mobile or too large on desktop

**Implementation Notes**:

```tsx
// Headings: scale up at breakpoints
<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
  Page Title
</h1>

<h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
  Section Heading
</h2>

<h3 className="text-xl md:text-2xl font-semibold">
  Subsection
</h3>

// Body text: base for mobile (16px), can increase on desktop if needed
<p className="text-base md:text-lg leading-relaxed">
  Paragraph content with comfortable line height
</p>

// Small text: ensure still readable on mobile
<span className="text-sm md:text-base text-muted-foreground">
  Metadata or secondary info
</span>
```

**Typography Scale Decision Matrix**:

| Element | Mobile (base) | Tablet (md:) | Desktop (lg:) | Tailwind Classes |
|---------|---------------|--------------|---------------|------------------|
| H1      | 30px (1.875rem) | 36px (2.25rem) | 48px (3rem) | `text-3xl md:text-4xl lg:text-5xl` |
| H2      | 24px (1.5rem) | 30px (1.875rem) | 36px (2.25rem) | `text-2xl md:text-3xl lg:text-4xl` |
| H3      | 20px (1.25rem) | 24px (1.5rem) | 24px (1.5rem) | `text-xl md:text-2xl` |
| Body    | 16px (1rem) | 16px (1rem) | 18px (1.125rem) | `text-base md:text-lg` |
| Small   | 14px (0.875rem) | 14px (0.875rem) | 16px (1rem) | `text-sm md:text-base` |

---

### Decision: Maintain 45-75 Character Line Lengths via max-width

**Rationale**:
- Optimal readability: 45-75 characters per line (typography research standard)
- Tailwind's `prose` class (from @tailwindcss/typography plugin) enforces this automatically
- For non-prose content: use `max-w-prose` (65ch) or custom max-width classes
- On mobile, viewport width naturally constrains line length (320px-480px = ~40-60 chars at 16px)
- On desktop, need explicit max-width to prevent excessively long lines

**Implementation Notes**:

```tsx
// Long-form content (chat messages, document content)
<div className="prose prose-slate dark:prose-invert max-w-none md:max-w-prose mx-auto">
  {content}
</div>

// Alternative: custom max-width for non-prose content
<div className="max-w-full md:max-w-2xl lg:max-w-3xl mx-auto px-4">
  <p className="text-base leading-relaxed">
    Long paragraph that needs line length constraint...
  </p>
</div>

// Chat message (constrain on desktop, full-width mobile)
<div className="px-4 md:px-8 max-w-full lg:max-w-4xl mx-auto">
  <p>{message.content}</p>
</div>
```

**Line Length Testing**:
- Browser DevTools: Select text, check character count
- Lighthouse: Accessibility audit checks text readability

---

### Decision: Progressive Spacing Scale (Tight Mobile → Generous Desktop)

**Rationale**:
- Mobile: Limited screen space → tighter spacing maximizes content visibility
- Desktop: Abundant space → generous spacing improves scannability, reduces visual density
- Tailwind's spacing scale (0-96, 4px increments) provides fine-grained control
- Pattern: base padding for mobile, increase at md: and lg: breakpoints

**Spacing Scale Decision**:

| Element | Mobile | Tablet (md:) | Desktop (lg:) | Tailwind Classes |
|---------|--------|--------------|---------------|------------------|
| Page container | 16px (p-4) | 24px (p-6) | 32px (p-8) | `p-4 md:p-6 lg:p-8` |
| Card padding | 16px (p-4) | 16px (p-4) | 24px (p-6) | `p-4 lg:p-6` |
| Section spacing | 16px (space-y-4) | 24px (space-y-6) | 32px (space-y-8) | `space-y-4 md:space-y-6 lg:space-y-8` |
| Grid gap | 16px (gap-4) | 16px (gap-4) | 24px (gap-6) | `gap-4 lg:gap-6` |
| Button padding | 12px 16px (px-4 py-3) | 8px 24px (px-6 py-2) | 8px 32px (px-8 py-2) | `px-4 py-3 md:px-6 md:py-2 lg:px-8` |

**Implementation Notes**:

```tsx
// Page container with progressive padding
<div className="container mx-auto p-4 md:p-6 lg:p-8">
  {content}
</div>

// Card with responsive padding
<Card className="p-4 lg:p-6">
  {content}
</Card>

// Section spacing
<div className="space-y-4 md:space-y-6 lg:space-y-8">
  <Section />
  <Section />
</div>

// Grid gap
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
  {items}
</div>
```

---

## R4: Feature-Specific Layout Strategies

### Decision: ChatInterface - Single Column Mobile, Multi-Column Desktop

**Pattern**: 
- **Mobile (< 1024px)**: Stacked layout - messages full-width, sources in collapsible accordion below messages
- **Desktop (≥ 1024px)**: Side-by-side - messages 60-70% width, sources 30-40% width in fixed sidebar

**Rationale**:
- Mobile: Limited width → stacking maximizes message readability, sources accessible via expand/collapse
- Desktop: Abundant width → side-by-side allows viewing sources while reading messages
- Chat input fixed at bottom on mobile (above keyboard), relative in flow on desktop

**Implementation**:

```tsx
// ChatInterface.tsx
<div className="flex flex-col h-full">
  {/* Header with new session button */}
  <div className="border-b p-4 flex justify-between">
    <h1>Chat</h1>
    <Button onClick={handleNewSession}>New Session</Button>
  </div>

  {/* Main chat area */}
  <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
    {/* Messages - full width mobile, 60% desktop */}
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatMessageList messages={messages} sourcesMap={sourcesMap} />
      
      {/* Sources accordion (mobile only) */}
      <div className="lg:hidden border-t">
        <Accordion type="single" collapsible>
          <AccordionItem value="sources">
            <AccordionTrigger className="px-4 py-2">
              Sources ({sourcesData.length})
            </AccordionTrigger>
            <AccordionContent>
              <ChatSources sources={sourcesData} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>

    {/* Sources sidebar (desktop only) */}
    <aside className="hidden lg:block lg:w-80 xl:w-96 border-l bg-muted/30">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Sources</h2>
        <ChatSources sources={sourcesData} />
      </div>
    </aside>
  </div>

  {/* Chat input - fixed mobile, relative desktop */}
  <div className="
    fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto
    border-t bg-background p-4 z-10 lg:z-auto
  ">
    <ChatInput onSend={handleSend} disabled={isPending} />
  </div>
</div>
```

---

### Decision: DocumentList - 1 Column Mobile → 2 Tablet → 3-4 Desktop Grid

**Pattern**:
- **Mobile (< 640px)**: 1 column - maximize card width for readability
- **Tablet (640px-1023px)**: 2 columns - utilize medium screen space
- **Desktop (1024px-1279px)**: 3 columns - balance density and card size
- **Large Desktop (≥ 1280px)**: 4 columns - maximize space efficiency

**Rationale**:
- DocumentCard needs minimum ~280px width to display metadata comfortably
- 1 col mobile: 320px viewport - 32px padding = 288px card width ✓
- 2 col tablet: 768px viewport - 48px padding - 16px gap = ~352px per card ✓
- 3 col desktop: 1024px viewport = ~320px per card ✓
- 4 col large: 1280px+ viewport = ~300px+ per card ✓

**Implementation**:

```tsx
// DocumentList.tsx (existing component - modify grid classes)
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  lg:grid-cols-3 
  xl:grid-cols-4 
  gap-4 
  lg:gap-6
">
  {documents.map(doc => (
    <DocumentCard 
      key={doc.id} 
      document={doc}
      onView={onView}
      onDelete={onDelete}
    />
  ))}
</div>

// DocumentCard.tsx - ensure responsive sizing
<Card className="
  p-4 
  hover:shadow-md 
  transition-shadow
  flex flex-col
  min-w-0 // Prevent card from overflowing grid cell
">
  <CardHeader className="p-0 mb-3">
    <div className="flex items-start justify-between gap-2">
      <CardTitle className="text-base md:text-lg truncate">
        {document.fileName}
      </CardTitle>
      <Badge variant="outline" className="shrink-0">
        {document.type}
      </Badge>
    </div>
  </CardHeader>
  <CardContent className="p-0 flex-1">
    <p className="text-sm text-muted-foreground line-clamp-2">
      {metadata}
    </p>
  </CardContent>
  <CardFooter className="p-0 pt-3 gap-2">
    <Button size="sm" variant="outline" className="min-h-[36px] md:min-h-[40px]">
      View
    </Button>
    <Button size="sm" variant="destructive" className="min-h-[36px] md:min-h-[40px]">
      Delete
    </Button>
  </CardFooter>
</Card>
```

---

### Decision: ProjectSelector - Drawer on Mobile, Dropdown on Desktop

**Pattern**:
- **Mobile (< 768px)**: Sheet (drawer) overlay from bottom - maximizes touch target size, shows full project list
- **Desktop (≥ 768px)**: Select dropdown - compact, familiar desktop pattern

**Rationale**:
- Mobile: Dropdown menus are hard to use on touch (small tap targets, scrolling difficult) → Sheet provides full-screen selection experience
- Desktop: Select dropdown is familiar, efficient with mouse, doesn't disrupt workflow
- Consistent with mobile OS patterns (iOS picker sheets, Android bottom sheets)

**Implementation**:

```tsx
// ProjectSelector.tsx
export function ProjectSelector({ currentProjectId }: ProjectSelectorProps) {
  const { data: projects } = useProjects()
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (isMobile) {
    // Mobile: Sheet (drawer) from bottom
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="min-h-[44px] justify-start">
            <Folder className="mr-2 h-4 w-4" />
            {currentProject?.name || 'Select Project'}
            <ChevronsUpDown className="ml-auto h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Select Project</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {projects?.map(project => (
              <Button
                key={project.id}
                variant={project.id === currentProjectId ? 'default' : 'ghost'}
                className="w-full justify-start min-h-[44px]"
                onClick={() => handleSelectProject(project.id)}
              >
                {project.name}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Select dropdown (existing pattern)
  return (
    <Select value={currentProjectId} onValueChange={handleSelectProject}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        {projects?.map(project => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// useMediaQuery hook (new - lib/hooks/useMediaQuery.ts)
import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
```

---

### Decision: Responsive Tables - Horizontal Scroll Container (Not Reflow)

**Pattern**:
- Wrap table in horizontal scroll container with overflow-x-auto
- Keep table structure intact (don't reflow to cards on mobile)
- Add scroll shadows to indicate scrollable content

**Rationale**:
- Reflowing tables to cards loses tabular context (hard to compare rows)
- Horizontal scroll preserves table structure, users understand pattern
- Scroll shadows provide visual affordance (can scroll)
- Simpler to maintain (one table component, not two layouts)

**Implementation**:

```tsx
// Responsive table wrapper
<div className="relative overflow-x-auto border rounded-lg">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="min-w-[200px]">Name</TableHead>
        <TableHead className="min-w-[100px]">Status</TableHead>
        <TableHead className="min-w-[150px]">Date</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map(row => (
        <TableRow key={row.id}>
          <TableCell className="font-medium">{row.name}</TableCell>
          <TableCell>{row.status}</TableCell>
          <TableCell>{row.date}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>

// Optional: Add scroll shadows with CSS
// Add to global CSS (src/index.css)
.overflow-x-auto {
  background: 
    linear-gradient(to right, white 30%, rgba(255, 255, 255, 0)),
    linear-gradient(to right, rgba(255, 255, 255, 0), white 70%) 0 100%,
    linear-gradient(to right, rgba(0, 0, 0, 0.1), transparent 40px),
    linear-gradient(to left, rgba(0, 0, 0, 0.1), transparent 40px) 100% 0;
  background-repeat: no-repeat;
  background-attachment: local, local, scroll, scroll;
  background-size: 40px 100%, 40px 100%, 14px 100%, 14px 100%;
}
```

---

## R5: Performance Optimization for Responsive CSS

### Decision: Monitor Bundle Size Impact (<50KB Budget)

**Rationale**:
- Tailwind's JIT (Just-In-Time) compiler only includes CSS classes actually used in code
- Responsive utilities (sm:, md:, lg:, xl:) add minimal overhead - only generates classes that exist in JSX
- Current bundle: 190KB gzipped → Budget: <240KB gzipped (< 50KB increase)
- Purge unused CSS via Tailwind config (already enabled)

**Measurement**:
```bash
# Build and check bundle size
npm run build
du -sh dist/assets/*.css

# Compare before/after responsive implementation
# Before: ~40KB CSS gzipped
# After: ~50-60KB CSS gzipped (10-20KB increase expected)
```

**Implementation Notes**:
- Tailwind config already purges unused CSS: `content: ['./src/**/*.{ts,tsx}']`
- Avoid custom CSS beyond Tailwind utilities (keeps bundle minimal)
- Use `@apply` sparingly (inlines utilities, increases bundle)
- Prefer utility classes directly in JSX

---

### Decision: Prevent Cumulative Layout Shift (CLS < 0.1)

**Rationale**:
- CLS measures visual stability - layout shifts during page load cause poor UX
- Responsive design can introduce CLS if not careful (images without dimensions, content reflow)
- WCAG 2.1 and Core Web Vitals both prioritize visual stability
- Target: CLS < 0.1 (Google's "good" threshold)

**CLS Prevention Strategies**:

1. **Images with Explicit Dimensions**:
```tsx
// Always set width/height to prevent reflow
<img 
  src={document.thumbnail} 
  alt={document.name}
  width={320}
  height={180}
  className="w-full h-auto rounded-md"
/>

// Or use aspect-ratio
<div className="aspect-video relative">
  <img 
    src={src} 
    alt={alt}
    className="absolute inset-0 w-full h-full object-cover"
  />
</div>
```

2. **Skeleton Loaders**:
```tsx
// Show placeholder during loading (prevents shift when content appears)
{isLoading ? (
  <Skeleton className="h-[200px] w-full rounded-lg" />
) : (
  <DocumentCard document={document} />
)}
```

3. **Reserve Space for Dynamic Content**:
```tsx
// Chat sources: reserve space even when empty
<div className="hidden lg:block lg:w-80 xl:w-96 border-l">
  {sourcesData.length > 0 ? (
    <ChatSources sources={sourcesData} />
  ) : (
    <div className="p-4 text-sm text-muted-foreground">
      No sources yet
    </div>
  )}
</div>
```

4. **Avoid `height: auto` Transitions**:
```tsx
// Bad: height auto transition causes layout shift
<div className="transition-all duration-300 h-auto">

// Good: use max-height or fixed heights for transitions
<div className="transition-all duration-300 max-h-[500px]">
```

**Measurement**:
- Chrome DevTools → Lighthouse → Performance audit → CLS score
- Chrome DevTools → Performance tab → Experience section → Layout Shifts
- Target: CLS < 0.1 across all breakpoints

---

### Decision: CSS Media Queries (Not Container Queries)

**Rationale**:
- **Browser support**: Media queries have 100% support, container queries are newer (92% support as of 2025, missing older browsers)
- **Project targets modern browsers** (last 2 versions) but no need to exclude 8% of users unnecessarily
- **Tailwind's breakpoints are media queries** - using container queries would require custom setup
- **Container queries** are better for component-level responsiveness independent of viewport - not needed here (viewport-based design)

**Alternatives Considered**:
1. **Container queries**: `@container (min-width: 768px)` - More modern, allows component responsiveness independent of viewport, but requires new Tailwind plugin, less browser support
2. **JavaScript-based detection**: `window.innerWidth` checks - Less performant (requires JS execution), less declarative, harder to maintain

**Implementation Notes**:
- Continue using Tailwind's media query-based breakpoints (sm:, md:, lg:, xl:)
- If future need arises for container queries (e.g., DocumentCard that adapts to parent width), can add `@tailwindcss/container-queries` plugin incrementally

---

### Decision: Responsive Image Optimization with `srcset`

**Rationale**:
- Images are largest performance bottleneck (document thumbnails, chat citations)
- `srcset` allows browser to download appropriate size based on viewport + pixel density
- Reduces bandwidth on mobile (3G constraint: <3s page load)
- Backend already serves images - may need to generate multiple sizes

**Implementation Notes**:

```tsx
// Document thumbnail with srcset
<img 
  src={document.thumbnail} 
  srcSet={`
    ${document.thumbnail_small} 320w,
    ${document.thumbnail_medium} 640w,
    ${document.thumbnail_large} 1024w
  `}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt={document.name}
  className="w-full h-auto rounded-md"
/>

// Lazy loading for images below fold
<img 
  src={src}
  alt={alt}
  loading="lazy" // Native lazy loading
  className="w-full h-auto"
/>
```

**Note**: Requires backend support for multiple image sizes. If not available, can defer to future optimization (not blocking for responsive design MVP).

---

## R6: Testing Strategy for Responsive Layouts

### Decision: Playwright Device Emulation with Viewport Matrix

**Rationale**:
- Playwright supports device emulation with predefined devices (iPhone, iPad, etc.)
- E2E tests at multiple viewports ensure responsive behavior works in real scenarios
- Automated testing > manual testing (catches regressions, faster feedback)
- Project already uses Playwright for E2E tests

**Viewport Matrix**:

| Device | Viewport Size | Breakpoint | Priority |
|--------|---------------|------------|----------|
| iPhone SE | 375x667 | Mobile (base) | P1 - Critical |
| iPhone 12 Pro | 390x844 | Mobile (base) | P2 - Important |
| iPad | 768x1024 | Tablet (md:) | P1 - Critical |
| iPad Pro | 1024x1366 | Desktop (lg:) | P2 - Important |
| Desktop | 1920x1080 | Desktop (lg:) | P1 - Critical |
| Desktop Large | 2560x1440 | Desktop (xl:) | P3 - Nice-to-have |

**Implementation**:

```typescript
// tests/e2e/specs/responsive.spec.ts
import { test, expect, devices } from '@playwright/test'

// Test on multiple devices
const testDevices = [
  { name: 'iPhone SE', device: devices['iPhone SE'] },
  { name: 'iPad', device: devices['iPad'] },
  { name: 'Desktop', device: { viewport: { width: 1920, height: 1080 } } },
]

testDevices.forEach(({ name, device }) => {
  test.describe(`Responsive Design - ${name}`, () => {
    test.use(device)

    test('should display without horizontal scroll', async ({ page }) => {
      await page.goto('/projects')
      
      // Check no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(scrollWidth).toBe(clientWidth)
    })

    test('should have touch-friendly buttons on mobile', async ({ page }) => {
      if (name !== 'Desktop') {
        await page.goto('/documents')
        
        // Check button height ≥ 44px
        const button = page.locator('button').first()
        const box = await button.boundingBox()
        expect(box?.height).toBeGreaterThanOrEqual(44)
      }
    })

    test('should adapt chat layout', async ({ page, viewport }) => {
      await page.goto('/projects/test-project/chat')
      
      if (viewport!.width < 1024) {
        // Mobile/Tablet: Sources should be in accordion (hidden by default)
        await expect(page.locator('aside').first()).not.toBeVisible()
        await expect(page.locator('[role="button"]', { hasText: 'Sources' })).toBeVisible()
      } else {
        // Desktop: Sources should be in sidebar
        await expect(page.locator('aside').first()).toBeVisible()
      }
    })
  })
})
```

```typescript
// tests/e2e/fixtures/viewports.ts
export const VIEWPORTS = {
  mobile: {
    iphoneSE: { width: 375, height: 667 },
    iphone12: { width: 390, height: 844 },
    iphoneSmall: { width: 320, height: 568 }, // Edge case
  },
  tablet: {
    ipad: { width: 768, height: 1024 },
    ipadPro: { width: 1024, height: 1366 },
  },
  desktop: {
    hd: { width: 1920, height: 1080 },
    widescreen: { width: 2560, height: 1440 },
  },
} as const
```

---

### Decision: Layout Assertion Tests (Not Visual Regression)

**Rationale**:
- **Layout assertions**: Test presence, visibility, sizing, positioning of elements → Fast, deterministic, easy to maintain
- **Visual regression**: Screenshot comparison → Brittle (font rendering differences, timing issues), slower, harder to debug failures
- **Visual regression** useful for pixel-perfect design review, but overkill for responsive layout testing
- Can add visual regression later if needed (not blocking)

**Implementation**:

```typescript
// Layout assertion example
test('DocumentList should show correct grid columns', async ({ page, viewport }) => {
  await page.goto('/documents')
  
  const grid = page.locator('[data-testid="document-grid"]')
  const computedStyle = await grid.evaluate(el => window.getComputedStyle(el))
  
  if (viewport!.width < 640) {
    expect(computedStyle.gridTemplateColumns).toContain('1fr') // 1 column
  } else if (viewport!.width < 1024) {
    expect(computedStyle.gridTemplateColumns).toContain('repeat(2') // 2 columns
  } else {
    expect(computedStyle.gridTemplateColumns).toContain('repeat(3') // 3 columns
  }
})

// Touch target size assertion
test('should enforce minimum touch targets on mobile', async ({ page, viewport }) => {
  if (viewport!.width < 768) {
    await page.goto('/projects')
    
    const buttons = page.locator('button')
    const count = await buttons.count()
    
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(44)
      expect(box?.width).toBeGreaterThanOrEqual(44)
    }
  }
})
```

**Alternatives Considered**:
1. **Percy.io or Chromatic**: Visual regression SaaS - Adds cost, third-party dependency, overkill for layout testing
2. **Playwright screenshots with pixelmatch**: Local visual regression - Requires screenshot management, diffs, more maintenance

---

### Decision: Test Orientation Changes with Playwright

**Rationale**:
- Mobile/tablet users frequently rotate devices (portrait ↔ landscape)
- Responsive design should adapt without losing state or causing errors
- Playwright doesn't directly support orientation change, but can simulate by swapping width/height

**Implementation**:

```typescript
// Orientation change test
test('should handle orientation changes', async ({ page, browser }) => {
  // Start in portrait
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 12 portrait
  })
  const newPage = await context.newPage()
  
  await newPage.goto('/chat')
  await newPage.fill('[placeholder="Ask a question..."]', 'Test message')
  
  // Rotate to landscape
  await newPage.setViewportSize({ width: 844, height: 390 })
  
  // Wait for layout to stabilize
  await newPage.waitForTimeout(300)
  
  // Check input value persisted
  const inputValue = await newPage.inputValue('[placeholder="Ask a question..."]')
  expect(inputValue).toBe('Test message')
  
  // Check no horizontal scroll
  const scrollWidth = await newPage.evaluate(() => document.documentElement.scrollWidth)
  const clientWidth = await newPage.evaluate(() => document.documentElement.clientWidth)
  expect(scrollWidth).toBe(clientWidth)
  
  await context.close()
})
```

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Responsive Approach** | Mobile-first Tailwind utilities | Zero new dependencies, performant, maintainable |
| **Touch Targets** | 44x44px minimum (WCAG AA) | Accessibility compliance, prevents mis-taps |
| **Mobile Navigation** | Hamburger menu + drawer | Industry standard, saves space, familiar UX |
| **Typography** | Discrete breakpoint sizes | Predictable, testable, consistent with Tailwind |
| **Line Length** | 45-75 characters via max-width | Optimal readability, standard typography practice |
| **Spacing** | Progressive scale (tight → generous) | Maximizes mobile space, improves desktop scannability |
| **Chat Layout** | Stacked mobile, side-by-side desktop | Optimizes for viewport constraints |
| **Document Grid** | 1 → 2 → 3 → 4 columns | Balances card size and information density |
| **Project Selector** | Drawer mobile, dropdown desktop | Touch-friendly mobile, efficient desktop |
| **Tables** | Horizontal scroll container | Preserves structure, simple to maintain |
| **CSS Approach** | Media queries (not container queries) | Maximum browser support, Tailwind integration |
| **Performance** | <50KB CSS budget, CLS <0.1 | Maintain fast load times, visual stability |
| **Testing** | Playwright device emulation + layout assertions | Automated, fast, deterministic, maintainable |

---

## Implementation Checklist

- [ ] Create `useMediaQuery` and `useBreakpoint` hooks
- [ ] Update Header component with mobile navigation
- [ ] Create MobileNav component (Sheet-based drawer)
- [ ] Update ChatInterface with responsive layout (stacked vs side-by-side)
- [ ] Update ChatInput with fixed mobile positioning
- [ ] Update DocumentList grid columns (1 → 2 → 3 → 4)
- [ ] Update DocumentCard with responsive sizing and touch targets
- [ ] Update ProjectSelector with mobile drawer variant
- [ ] Update all Shadcn UI components for touch targets (Button, Input, Select, Dialog)
- [ ] Add responsive spacing scale to page containers
- [ ] Add responsive typography scaling to headings and text
- [ ] Configure Playwright viewport matrix
- [ ] Write responsive E2E tests (no horizontal scroll, touch targets, layout adaptation)
- [ ] Write orientation change tests
- [ ] Measure bundle size impact (<50KB budget)
- [ ] Measure CLS (<0.1 target)
- [ ] Test on real devices (iPhone, iPad, Android)

---

**Document Status**: ✅ Complete - Ready for Phase 1 (Quickstart Guide)
