import { z } from 'zod'

/**
 * Validation schema for creating a project
 */
export const projectCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .regex(/\S/, 'Project name cannot be empty'),
})

/**
 * Validation schema for updating a project
 */
export const projectUpdateSchema = projectCreateSchema

/**
 * Type inference from schema
 */
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>
