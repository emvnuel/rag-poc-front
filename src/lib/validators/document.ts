import { z } from 'zod'

/**
 * Validation schema for file upload
 */
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 25 * 1024 * 1024, 'File size must be less than 25MB')
    .refine(
      (file) =>
        [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'text/markdown',
        ].includes(file.type),
      'File type must be PDF, DOCX, TXT, or MD'
    ),
  projectId: z.string().uuid('Invalid project ID'),
})

/**
 * Validation schema for text processing
 */
export const textRequestSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
  projectId: z.string().uuid('Invalid project ID'),
})

/**
 * Validation schema for website processing
 */
export const websiteRequestSchema = z.object({
  url: z.string().url('Invalid URL').min(1, 'URL cannot be empty'),
  projectId: z.string().uuid('Invalid project ID'),
})

/**
 * Type inference from schemas
 */
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type TextRequestInput = z.infer<typeof textRequestSchema>
export type WebsiteRequestInput = z.infer<typeof websiteRequestSchema>
