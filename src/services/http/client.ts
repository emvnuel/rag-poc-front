/**
 * HTTP client service for making API requests.
 *
 * Provides a configured Axios instance with automatic error handling,
 * timeout management, and request/response interceptors.
 */

import axios, { AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:42069'
const API_TIMEOUT = 10000 // 10 seconds default
const UPLOAD_TIMEOUT = 30000 // 30 seconds for file uploads
const CHAT_TIMEOUT = 120000 // 120 seconds for LLM responses (RAG + generation)

/**
 * Configured Axios HTTP client instance for API requests.
 *
 * Features:
 * - Base URL: localhost:42069 (configurable via VITE_API_BASE_URL)
 * - Default timeout: 10s (30s for file uploads, 120s for chat)
 * - Automatic error transformation
 * - Rate limiting and auth error handling
 * - Content-Type: application/json by default
 *
 * @example
 * ```ts
 * // GET request
 * const response = await httpClient.get<User[]>('/users');
 *
 * // POST request
 * await httpClient.post('/users', { name: 'John' });
 *
 * // File upload (automatically uses 30s timeout)
 * const formData = new FormData();
 * formData.append('file', file);
 * await httpClient.post('/upload', formData);
 * ```
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Add auth headers (future) and adjust timeout for uploads and chat
httpClient.interceptors.request.use(
  (config) => {
    // TODO: Add JWT token when auth is implemented
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    // Increase timeout for file uploads
    if (config.data instanceof FormData) {
      config.timeout = UPLOAD_TIMEOUT
    }
    
    // Increase timeout for chat requests (LLM responses can be slow)
    if (config.url?.includes('/chat')) {
      config.timeout = CHAT_TIMEOUT
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor: Handle errors globally
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle specific error codes
    if (error.response?.status === 401) {
      // TODO: Redirect to login when auth is implemented
      console.error('Unauthorized access')
    }

    if (error.response?.status === 429) {
      // Rate limiting
      console.error('Too many requests. Please try again later.')
    }

    // Transform error for consistent handling
    const errorData = error.response?.data as { message?: string } | undefined
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message:
        errorData?.message ||
        error.message ||
        'An unexpected error occurred',
      code: error.code,
      details: error.response?.data,
    }

    return Promise.reject(apiError)
  }
)

/**
 * Standardized API error structure.
 *
 * All HTTP errors are transformed into this consistent format by the
 * response interceptor for easier error handling throughout the application.
 */
export interface ApiError {
  /** HTTP status code (e.g., 404, 500) */
  status: number
  /** Human-readable error message */
  message: string
  /** Optional error code for specific error types */
  code?: string
  /** Additional error details from the backend */
  details?: unknown
}
