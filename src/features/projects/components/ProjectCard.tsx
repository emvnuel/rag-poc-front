/**
 * ProjectCard component displays project information in a card format.
 *
 * Shows project name, document count, and creation/update dates.
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ProjectInfoResponse } from '@/services/api/generated/types.gen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRoutePreload } from '@/hooks/useRoutePreload';

export interface ProjectCardProps {
  project: ProjectInfoResponse;
  onEdit?: (project: ProjectInfoResponse) => void;
  onDelete?: (project: ProjectInfoResponse) => void;
}

/**
 * Displays a project as a clickable card with metadata.
 *
 * Features:
 * - Clickable to navigate to project documents
 * - Shows document count, creation/update dates
 * - Dropdown menu for edit/delete actions
 *
 * @param props - Component props
 * @param props.project - Project data to display
 * @param props.onEdit - Optional callback for edit action
 * @param props.onDelete - Optional callback for delete action
 */
export const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const preload = useRoutePreload();

  const handleClick = () => {
    navigate(`/projects/${project.id}/documents`);
  };

  const handleHover = () => {
    preload('documents');
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-colors" 
      onClick={handleClick}
      onMouseEnter={handleHover}
      onFocus={handleHover}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-lg">{project.name}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" aria-label={`More actions for ${project.name}`}>
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {onEdit && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}>
                {t('common.edit')}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project);
                }}
                className="text-destructive"
              >
                {t('common.delete')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {project.documentCount ?? 0} {t('projects.documents')}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            <div>Created: {formatDate(project.createdAt)}</div>
            <div>Updated: {formatDate(project.updatedAt)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
