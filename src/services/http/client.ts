/**
 * HTTP client service for making API requests.
 *
 * Provides a configured Axios instance with automatic error handling,
 * timeout management, and request/response interceptors.
 */

import axios, { AxiosError } from 'axios'
import { authService } from '../../features/auth/services/auth-service'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:42069'
const API_TIMEOUT = 10000 // 10 seconds default
const UPLOAD_TIMEOUT = 30000 // 30 seconds for file uploads
const CHAT_TIMEOUT = 120000 // 120 seconds for LLM responses

/**
 * Configured Axios HTTP client instance for API requests.
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Add auth headers and adjust timeout
httpClient.interceptors.request.use(
  async (config) => {
    // Add JWT token if we have a valid session
    if (authService.isAuthenticated()) {
      try {
        // Update token if it expires in less than 30 seconds
        await authService.keycloak.updateToken(30)
        
        if (authService.token) {
          config.headers.Authorization = `Bearer ${authService.token}`
        }
      } catch (error) {
        console.warn('Failed to refresh token', error)
        authService.logout()
      }
    }

    // Increase timeout for file uploads
    if (config.data instanceof FormData) {
      config.timeout = UPLOAD_TIMEOUT
    }
    
    // Increase timeout for chat requests
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
    // Handle 401 Unauthorized - Keycloak should catch most expirations before this via updateToken,
    // but if the session is invalidated server-side, we logout.
    if (error.response?.status === 401) {
      // Avoid infinite loops if logout itself fails (though logout is usually a redirect)
       console.error('Unauthorized request, logging out')
       authService.logout()
    }

    if (error.response?.status === 429) {
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
