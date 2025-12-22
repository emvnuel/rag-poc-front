/**
 * ProjectsPage - Dashboard page showing all projects.
 *
 * Main landing page with project list and create button.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProjectInfoResponse } from '@/services/api/generated/types.gen';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { ProjectList } from '@/features/projects/components/ProjectList';
import { CreateProjectDialog } from '@/features/projects/components/CreateProjectDialog';
import { EditProjectDialog } from '@/features/projects/components/EditProjectDialog';
import { DeleteProjectDialog } from '@/features/projects/components/DeleteProjectDialog';
import { Button } from '@/components/ui/button';

/**
 * Dashboard page displaying all projects.
 *
 * Features:
 * - Grid of project cards
 * - Create new project button
 * - Edit/delete project actions
 * - Loading and empty states
 */
export const ProjectsPage = () => {
  const { t } = useTranslation();
  const { data: projects, isLoading } = useProjects();
  const showLoading = useDelayedLoading(isLoading);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectInfoResponse | null>(null);

  const handleEdit = (project: ProjectInfoResponse) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  const handleDelete = (project: ProjectInfoResponse) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    // Stay on projects page after deletion
    setSelectedProject(null);
  };

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{t('projects.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t('projects.subtitle')}
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
          {t('projects.createProject')}
        </Button>
      </div>

      <ProjectList
        projects={projects || []}
        isLoading={showLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditProjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={selectedProject}
      />

      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        project={selectedProject}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};
