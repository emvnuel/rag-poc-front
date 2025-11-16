/**
 * ProjectSelector component for workspace switching in the header.
 *
 * Dropdown menu for selecting and switching between projects.
 */

import { useNavigate } from 'react-router-dom';
import type { ProjectInfoResponse } from '@/services/api/generated/types.gen';
import { useProjects } from '../hooks/useProjects';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export interface ProjectSelectorProps {
  currentProjectId?: string;
}

/**
 * Dropdown selector for switching between projects.
 *
 * Features:
 * - Shows current project name
 * - Lists all available projects
 * - Loading state while fetching projects
 * - Navigates to project documents on selection
 *
 * @param props - Component props
 * @param props.currentProjectId - ID of the currently selected project
 */
export const ProjectSelector = ({ currentProjectId }: ProjectSelectorProps) => {
  const { data: projects, isLoading } = useProjects();
  const navigate = useNavigate();

  const currentProject = projects?.find((p) => p.id === currentProjectId);

  const handleSelect = (project: ProjectInfoResponse) => {
    navigate(`/projects/${project.id}/documents`);
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-48" />;
  }

  if (!projects || projects.length === 0) {
    return (
      <Button variant="outline" disabled>
        No Projects
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {currentProject?.name || 'Select Project'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => handleSelect(project)}
            className={currentProjectId === project.id ? 'bg-accent' : ''}
          >
            {project.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
