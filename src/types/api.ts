/**
 * API error response
 */
export interface ApiError {
  status: number
  message: string
  code?: string
  details?: Record<string, unknown>
}

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}
