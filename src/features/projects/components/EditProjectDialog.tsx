/**
 * EditProjectDialog component for updating project details.
 *
 * Modal dialog with form validation for editing existing projects.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectUpdateSchema } from '@/lib/validators/project';
import type { ProjectInfoResponse, ProjectUpdateRequest } from '@/services/api/generated/types.gen';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateProject } from '../hooks/useUpdateProject';

export interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectInfoResponse | null;
}

/**
 * Dialog for editing an existing project.
 *
 * Features:
 * - Form validation with zod schema
 * - Pre-filled with current project data
 * - Loading state during update
 * - Automatic close on success
 * - Error handling via toast
 *
 * @param props - Component props
 * @param props.open - Whether dialog is open
 * @param props.onOpenChange - Callback to change dialog state
 * @param props.project - Project to edit (null if dialog is closed)
 */
export const EditProjectDialog = ({ open, onOpenChange, project }: EditProjectDialogProps) => {
  const { mutate: updateProject, isPending } = useUpdateProject();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProjectUpdateRequest>({
    resolver: zodResolver(projectUpdateSchema),
  });

  // Reset form when project changes
  useEffect(() => {
    if (project) {
      reset({ name: project.name || '' });
    }
  }, [project, reset]);

  const onSubmit = (data: ProjectUpdateRequest) => {
    if (!project?.id) return;

    updateProject(
      { id: project.id, data },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update your project details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="My Knowledge Base"
              {...register('name')}
              disabled={isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating...' : 'Update Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
