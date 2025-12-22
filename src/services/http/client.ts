/**
 * HTTP client service for making API requests.
 *
 * Provides a configured Axios instance with automatic error handling,
 * timeout management, and request/response interceptors.
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { authService } from '../../features/auth/services/auth-service'

// Extend Axios config to support retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

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

// Request interceptor: Add auth headers and adjust timeout
httpClient.interceptors.request.use(
  async (config) => {
    // Add JWT token if we have a valid session
    // Skip for auth endpoints to avoid circular loops if using client for auth (though AuthService uses fetch)
    const isAuthRequest = config.url?.includes('/protocol/openid-connect/')
    
    if (!isAuthRequest) {
      try {
        // Only attempt to get token if we have one or think we do
        if (authService.hasValidSession()) {
          const token = await authService.getValidToken()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        } else {
          // If we don't have a valid session, check if we have a refresh token to try
          // Or just let the request go through (might be a public endpoint)
          // But if we have a stored token that might be expired, getValidToken will refresh it
          const user = authService.getUserInfo()
          if (user) {
             const token = await authService.getValidToken()
             if (token) {
               config.headers.Authorization = `Bearer ${token}`
             }
          }
        }
      } catch (error) {
        // Silent fail for token retrieval - request might not need auth
        // or auth service will handle logout if critical
        console.warn('Failed to attach auth token', error)
      }
    }

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
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig

    // Handle 401 Unauthorized - Attempt Token Refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Attempt to refresh the token
        const tokenResponse = await authService.refreshAccessToken()
        
        // Update the header with the new token
        originalRequest.headers.Authorization = `Bearer ${tokenResponse.access_token}`
        
        // Retry the original request
        return httpClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed - user session is invalid
        console.error('Token refresh failed, logging out', refreshError)
        authService.logout()
        
        // Redirect to login
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
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
