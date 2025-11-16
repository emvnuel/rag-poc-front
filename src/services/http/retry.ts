import { httpClient } from './client'
import type { AxiosRequestConfig } from 'axios'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

/**
 * Executes an HTTP request with automatic retry logic for server errors
 * @param config - Axios request configuration
 * @param retries - Number of remaining retry attempts
 * @returns Promise with response data
 */
export const retryableRequest = async <T>(
  config: AxiosRequestConfig,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    const response = await httpClient.request<T>(config)
    return response.data
  } catch (error: unknown) {
    const errorWithStatus = error as { status?: number }
    const shouldRetry =
      retries > 0 &&
      errorWithStatus.status &&
      errorWithStatus.status >= 500 &&
      config.method?.toUpperCase() === 'GET'

    if (shouldRetry) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return retryableRequest<T>(config, retries - 1)
    }

    throw error
  }
}
