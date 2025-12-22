import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProcessText } from '../hooks/useProcessText'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

const textSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
})

type TextFormData = z.infer<typeof textSchema>

interface TextUploadFormProps {
  projectId: string
}

/**
 * Form for uploading text snippets
 */
export function TextUploadForm({ projectId }: TextUploadFormProps) {
  const { t } = useTranslation()
  const { mutate: processText, isPending } = useProcessText()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<TextFormData>({
    resolver: zodResolver(textSchema),
    mode: 'onChange',
    defaultValues: {
      text: '',
    },
  })

  const onSubmit = (data: TextFormData) => {
    processText(
      { text: data.text, projectId },
      {
        onSuccess: () => {
          reset()
        },
      }
    )
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="text">{t('upload.textContent')}</Label>
          <textarea
            id="text"
            {...register('text')}
            className="w-full min-h-[200px] mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t('upload.textPlaceholder')}
          />
          {errors.text && (
            <p className="text-sm text-destructive mt-1">{errors.text.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isPending || !isValid}>
          {isPending ? t('common.processing') : t('upload.uploadText')}
        </Button>
      </form>
    </Card>
  )
}
