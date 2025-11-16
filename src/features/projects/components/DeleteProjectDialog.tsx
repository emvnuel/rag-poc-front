/**
 * DeleteProjectDialog component for confirming project deletion.
 *
 * Modal dialog with confirmation prompt before deleting a project.
 */

import type { ProjectInfoResponse } from '@/services/api/generated/types.gen';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteProject } from '../hooks/useDeleteProject';

export interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectInfoResponse | null;
  onSuccess?: () => void;
}

/**
 * Dialog for confirming project deletion.
 *
 * Features:
 * - Confirmation prompt with project name
 * - Loading state during deletion
 * - Automatic close on success
 * - Error handling via toast
 * - Warning about data loss
 *
 * @param props - Component props
 * @param props.open - Whether dialog is open
 * @param props.onOpenChange - Callback to change dialog state
 * @param props.project - Project to delete (null if dialog is closed)
 * @param props.onSuccess - Optional callback after successful deletion
 */
export const DeleteProjectDialog = ({ open, onOpenChange, project, onSuccess }: DeleteProjectDialogProps) => {
  const { mutate: deleteProject, isPending } = useDeleteProject();

  const handleDelete = () => {
    if (!project?.id) return;

    deleteProject(project.id, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{project?.name}&quot;?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. All documents and data associated with this project will be permanently deleted.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? 'Deleting...' : 'Delete Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
