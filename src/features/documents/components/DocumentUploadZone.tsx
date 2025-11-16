import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText } from 'lucide-react'
import { useUploadFile } from '../hooks/useUploadFile'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface DocumentUploadZoneProps {
  projectId: string
}

/**
 * Drag-and-drop file upload zone component
 */
export function DocumentUploadZone({ projectId }: DocumentUploadZoneProps) {
  const { mutate: uploadFile, isPending, progress } = useUploadFile()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        // Validate file size
        if (file.size > 25 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 25MB limit`)
          return
        }

        // Validate file type
        const validTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'text/markdown',
        ]
        if (!validTypes.includes(file.type)) {
          toast.error(`${file.name} is not a supported file type`)
          return
        }

        uploadFile({ file, projectId })
      })
    },
    [uploadFile, projectId]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    multiple: true,
    maxFiles: 10,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} aria-label="Upload document files" />
        <div className="flex flex-col items-center gap-2">
          {isDragActive ? (
            <>
              <Upload className="h-12 w-12 text-primary" />
              <p className="text-lg font-medium">Drop files here...</p>
            </>
          ) : (
            <>
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX, TXT, MD • Max 25MB per file • Up to 10 files at once
              </p>
            </>
          )}
        </div>
      </div>

      {isPending && progress > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Uploading...</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}
    </div>
  )
}
