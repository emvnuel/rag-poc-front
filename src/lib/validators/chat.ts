import { z } from 'zod'

/**
 * Validation schema for chat message
 */
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
})

/**
 * Validation schema for chat request
 */
export const chatRequestSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .regex(/\S/, 'Message cannot be only whitespace'),
  history: z.array(chatMessageSchema).optional(),
})

/**
 * Validation schema for search request
 */
export const searchRequestSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query cannot be empty')
    .regex(/\S/, 'Search query cannot be only whitespace'),
  projectId: z.string().uuid('Invalid project ID'),
})

/**
 * Type inference from schemas
 */
export type ChatMessageInput = z.infer<typeof chatMessageSchema>
export type ChatRequestInput = z.infer<typeof chatRequestSchema>
export type SearchRequestInput = z.infer<typeof searchRequestSchema>
