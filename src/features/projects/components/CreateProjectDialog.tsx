/**
 * CreateProjectDialog component for creating new projects.
 *
 * Modal dialog with form validation using react-hook-form and zod.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectCreateSchema } from '@/lib/validators/project';
import type { ProjectCreateRequest } from '@/services/api/generated/types.gen';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateProject } from '../hooks/useCreateProject';

export interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog for creating a new project.
 *
 * Features:
 * - Form validation with zod schema
 * - Loading state during creation
 * - Automatic close on success
 * - Error handling via toast
 *
 * @param props - Component props
 * @param props.open - Whether dialog is open
 * @param props.onOpenChange - Callback to change dialog state
 */
export const CreateProjectDialog = ({ open, onOpenChange }: CreateProjectDialogProps) => {
  const { mutate: createProject, isPending } = useCreateProject();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProjectCreateRequest>({
    resolver: zodResolver(projectCreateSchema),
  });

  const onSubmit = (data: ProjectCreateRequest) => {
    createProject(data, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your documents and knowledge base.
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
              {isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
