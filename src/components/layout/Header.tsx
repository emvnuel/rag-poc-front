import { useParams, useLocation, Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProjectSelector } from '@/features/projects/components/ProjectSelector';
import { useRoutePreload } from '@/hooks/useRoutePreload';

/**
 * Header component with workspace selector, mobile navigation, and theme toggle
 * 
 * Responsive behavior:
 * - Mobile (< 1024px): Shows hamburger menu for navigation
 * - Desktop (>= 1024px): Shows inline navigation and project selector
 */
export function Header() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const preload = useRoutePreload();
  
  // Show project selector only when on project-specific pages
  const isProjectPage = location.pathname.includes('/projects/');

  return (
    <header className="border-b">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <MobileNav />
          <Link 
            to="/"
            onMouseEnter={() => preload('projects')}
            onFocus={() => preload('projects')}
            className="min-h-[44px] flex items-center"
          >
            <span className="text-lg md:text-xl lg:text-2xl font-bold hover:opacity-80 transition-opacity">
              RAG Platform
            </span>
          </Link>
          {isProjectPage && (
            <div className="hidden lg:block">
              <ProjectSelector currentProjectId={projectId} />
            </div>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
