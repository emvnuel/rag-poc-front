import { useParams, useLocation, Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ProjectSelector } from '@/features/projects/components/ProjectSelector';
import { useRoutePreload } from '@/hooks/useRoutePreload';

/**
 * Header component with workspace selector and theme toggle
 */
export function Header() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const preload = useRoutePreload();
  
  // Show project selector only when on project-specific pages
  const isProjectPage = location.pathname.includes('/projects/');

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/"
            onMouseEnter={() => preload('projects')}
            onFocus={() => preload('projects')}
          >
            <h1 className="text-xl font-bold hover:opacity-80 transition-opacity">
              RAG Platform
            </h1>
          </Link>
          {isProjectPage && <ProjectSelector currentProjectId={projectId} />}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
