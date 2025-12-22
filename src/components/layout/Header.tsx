import { useParams, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProjectSelector } from '@/features/projects/components/ProjectSelector';
import { useRoutePreload } from '@/hooks/useRoutePreload';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * Header component with workspace selector, mobile navigation, and theme toggle
 * 
 * Responsive behavior:
 * - Mobile (< 1024px): Shows hamburger menu for navigation
 * - Desktop (>= 1024px): Shows inline navigation and project selector
 */
export function Header() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const preload = useRoutePreload();
  const { isAuthenticated } = useAuth();
  
  // Show project selector only when on project-specific pages
  const isProjectPage = location.pathname.includes('/projects/');

  return (
    <header className="border-b w-full">
      <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <MobileNav />
          <Link 
            to="/"
            onMouseEnter={() => preload('projects')}
            onFocus={() => preload('projects')}
            className="min-h-[44px] flex items-center"
          >
            <span className="text-lg md:text-xl lg:text-2xl font-bold hover:opacity-80 transition-opacity">
              {t('header.title')}
            </span>
          </Link>
          {isProjectPage && isAuthenticated && (
            <div className="hidden lg:block">
              <ProjectSelector currentProjectId={projectId} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isAuthenticated && <UserMenu />}
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
