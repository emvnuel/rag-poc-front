import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
  const { mutate: processText, isPending } = useProcessText()
  const [text, setText] = useState('')

  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TextFormData>({
    resolver: zodResolver(textSchema),
  })

  const onSubmit = () => {
    if (text.trim()) {
      processText(
        { text, projectId },
        {
          onSuccess: () => {
            setText('')
            reset()
          },
        }
      )
    }
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="text">Text Content</Label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[200px] mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste your text here..."
          />
          {errors.text && (
            <p className="text-sm text-destructive mt-1">{errors.text.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isPending || !text.trim()}>
          {isPending ? 'Processing...' : 'Upload Text'}
        </Button>
      </form>
    </Card>
  )
}
