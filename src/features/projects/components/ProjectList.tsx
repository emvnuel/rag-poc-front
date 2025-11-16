/**
 * ProjectList component renders a grid of project cards.
 *
 * Displays all projects with loading and empty states.
 */

import { memo } from 'react';
import type { ProjectInfoResponse } from '@/services/api/generated/types.gen';
import { ProjectCard } from './ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';

export interface ProjectListProps {
  projects: ProjectInfoResponse[];
  isLoading?: boolean;
  onEdit?: (project: ProjectInfoResponse) => void;
  onDelete?: (project: ProjectInfoResponse) => void;
}

/**
 * Displays a grid of project cards with loading and empty states.
 *
 * Features:
 * - Responsive grid layout (1-3 columns based on screen size)
 * - Loading skeletons during data fetch
 * - Empty state message
 * - Edit/delete actions passed to cards
 *
 * @param props - Component props
 * @param props.projects - Array of projects to display
 * @param props.isLoading - Whether projects are being loaded
 * @param props.onEdit - Optional callback for edit action
 * @param props.onDelete - Optional callback for delete action
 */
export const ProjectList = memo(function ProjectList({ projects, isLoading, onEdit, onDelete }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground space-y-2">
          <p className="text-lg font-semibold">No projects yet</p>
          <p className="text-sm">Create your first project to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});
