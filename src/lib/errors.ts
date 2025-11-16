/**
 * User-friendly error messages mapped from HTTP status codes
 */
export const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'You need to log in to access this resource.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  413: 'File size exceeds the maximum allowed (25MB).',
  429: 'Too many requests. Please try again in a moment.',
  500: 'An unexpected error occurred. Please try again.',
  503: 'Service is temporarily unavailable. Please try again later.',
}

/**
 * Gets a user-friendly error message for a given HTTP status code
 * @param status - HTTP status code
 * @param defaultMessage - Optional default message if status not found
 * @returns User-friendly error message
 */
export const getErrorMessage = (
  status: number,
  defaultMessage?: string
): string => {
  return ERROR_MESSAGES[status] || defaultMessage || ERROR_MESSAGES[500]
}
