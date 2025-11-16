import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { websiteRequestSchema } from '@/lib/validators/document'
import type { WebsiteRequestInput } from '@/lib/validators/document'
import { useProcessWebsite } from '../hooks/useProcessWebsite'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

interface WebsiteUploadFormProps {
  projectId: string
}

/**
 * Form for uploading website URLs
 */
export function WebsiteUploadForm({ projectId }: WebsiteUploadFormProps) {
  const { mutate: processWebsite, isPending } = useProcessWebsite()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WebsiteRequestInput>({
    resolver: zodResolver(websiteRequestSchema),
    defaultValues: {
      projectId,
    },
  })

  const onSubmit = (data: WebsiteRequestInput) => {
    processWebsite(data, {
      onSuccess: () => {
        reset()
      },
    })
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="url">Website URL</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com"
            {...register('url')}
            className="mt-2"
          />
          {errors.url && (
            <p className="text-sm text-destructive mt-1">{errors.url.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Processing...' : 'Upload Website'}
        </Button>
      </form>
    </Card>
  )
}
