/**
 * Unit tests for HTTP client service.
 *
 * Tests the configured Axios instance including:
 * - Base configuration (URL, timeout, headers)
 * - Request interceptor (FormData timeout adjustment, chat timeout)
 * - Response interceptor (error handling and transformation)
 * - Specific error code handling (401, 429)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { httpClient, type ApiError } from './client'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

describe('httpClient', () => {
  describe('base configuration', () => {
    it('should have correct baseURL', () => {
      expect(httpClient.defaults.baseURL).toBe('http://localhost:42069')
    })

    it('should have default timeout of 10 seconds', () => {
      expect(httpClient.defaults.timeout).toBe(10000)
    })

    it('should have Content-Type header set to application/json', () => {
      expect(httpClient.defaults.headers['Content-Type']).toBe('application/json')
    })
  })

  describe('request interceptor', () => {
    it('should set timeout to 30s for FormData uploads', async () => {
      const formData = new FormData()
      formData.append('file', new Blob(['test']), 'test.txt')

      // Mock the adapter to intercept the config
      const mockAdapter = vi.fn((config) => {
        expect(config.timeout).toBe(30000)
        return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config })
      })
      httpClient.defaults.adapter = mockAdapter as any

      await httpClient.post('/upload', formData)

      expect(mockAdapter).toHaveBeenCalled()
    })

    it('should set timeout to 120s for chat requests', async () => {
      // Mock the adapter to intercept the config
      const mockAdapter = vi.fn((config) => {
        expect(config.timeout).toBe(120000)
        return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config })
      })
      httpClient.defaults.adapter = mockAdapter as any

      await httpClient.post('/chat', { message: 'Hello' })

      expect(mockAdapter).toHaveBeenCalled()
    })

    it('should use default timeout for regular requests', async () => {
      // Mock the adapter to intercept the config
      const mockAdapter = vi.fn((config) => {
        expect(config.timeout).toBe(10000)
        return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config })
      })
      httpClient.defaults.adapter = mockAdapter as any

      await httpClient.get('/users')

      expect(mockAdapter).toHaveBeenCalled()
    })

    it('should handle request interceptor errors', async () => {
      const originalAdapter = httpClient.defaults.adapter

      // Create a mock adapter that will cause the interceptor to fail
      const errorAdapter = vi.fn(() => {
        const error = new Error('Request interceptor error')
        return Promise.reject(error)
      })
      httpClient.defaults.adapter = errorAdapter as any

      await expect(httpClient.get('/test')).rejects.toThrow()

      // Restore original adapter
      httpClient.defaults.adapter = originalAdapter
    })
  })

  describe('response interceptor', () => {
    let originalAdapter: any
    let consoleErrorSpy: any

    beforeEach(() => {
      originalAdapter = httpClient.defaults.adapter
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      httpClient.defaults.adapter = originalAdapter
      consoleErrorSpy.mockRestore()
    })

    it('should pass through successful responses unchanged', async () => {
      const mockData = { id: 1, name: 'Test' }
      const mockAdapter = vi.fn(() =>
        Promise.resolve({
          data: mockData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        })
      )
      httpClient.defaults.adapter = mockAdapter as any

      const response = await httpClient.get('/users/1')

      expect(response.data).toEqual(mockData)
      expect(response.status).toBe(200)
    })

    it('should transform 401 errors and log unauthorized message', async () => {
      const mockAdapter = vi.fn(() => {
        const error: Partial<AxiosError> = {
          response: {
            status: 401,
            statusText: 'Unauthorized',
            data: { message: 'Invalid credentials' },
            headers: {},
            config: {} as InternalAxiosRequestConfig,
          },
          message: 'Request failed with status code 401',
          config: {} as InternalAxiosRequestConfig,
        }
        return Promise.reject(error)
      })
      httpClient.defaults.adapter = mockAdapter as any

      await expect(httpClient.get('/protected')).rejects.toMatchObject({
        status: 401,
        message: 'Invalid credentials',
      } as ApiError)

      expect(consoleErrorSpy).toHaveBeenCalledWith('Unauthorized access')
    })

    it('should transform 429 errors and log rate limit message', async () => {
      const mockAdapter = vi.fn(() => {
        const error: Partial<AxiosError> = {
          response: {
            status: 429,
            statusText: 'Too Many Requests',
            data: { message: 'Rate limit exceeded' },
            headers: {},
            config: {} as InternalAxiosRequestConfig,
          },
          message: 'Request failed with status code 429',
          config: {} as InternalAxiosRequestConfig,
        }
        return Promise.reject(error)
      })
      httpClient.defaults.adapter = mockAdapter as any

      await expect(httpClient.get('/api/data')).rejects.toMatchObject({
        status: 429,
        message: 'Rate limit exceeded',
      } as ApiError)

      expect(consoleErrorSpy).toHaveBeenCalledWith('Too many requests. Please try again later.')
    })

    it('should transform 404 errors correctly', async () => {
      const mockAdapter = vi.fn(() => {
        const error: Partial<AxiosError> = {
          response: {
            status: 404,
            statusText: 'Not Found',
            data: { message: 'Resource not found' },
            headers: {},
            config: {} as InternalAxiosRequestConfig,
          },
          message: 'Request failed with status code 404',
          config: {} as InternalAxiosRequestConfig,
        }
        return Promise.reject(error)
      })
      httpClient.defaults.adapter = mockAdapter as any

      await expect(httpClient.get('/users/999')).rejects.toMatchObject({
        status: 404,
        message: 'Resource not found',
      } as ApiError)
    })

    it('should transform 500 errors correctly', async () => {
      const mockAdapter = vi.fn(() => {
        const error: Partial<AxiosError> = {
          response: {
            status: 500,
            statusText: 'Internal Server Error',
            data: { message: 'Database connection failed' },
            headers: {},
            config: {} as InternalAxiosRequestConfig,
          },
          message: 'Request failed with status code 500',
          config: {} as InternalAxiosRequestConfig,
        }
        return Promise.reject(error)
      })
      httpClient.defaults.adapter = mockAdapter as any

      await expect(httpClient.post('/users', {})).rejects.toMatchObject({
        status: 500,
        message: 'Database connection failed',
      } as ApiError)
    })

    it('should use error message as fallback when no response message', async () => {
      const mockAdapter = vi.fn(() => {
        const error: Partial<AxiosError> = {
          response: {
            status: 500,
            statusText: 'Internal Server Error',
            data: {},
            headers: {},
            config: {} as InternalAxiosRequestConfig,
          },
          message: 'Network timeout',
          config: {} as InternalAxiosRequestConfig,
        }
        return Promise.reject(error)
      })
      httpClient.defaults.adapter = mockAdapter as any

      await expect(httpClient.get('/api/data')).rejects.toMatchObject({
        status: 500,
        message: 'Network timeout',
      } as ApiError)
    })

    it('should use default message when no error message available', async () => {
      const mockAdapter = vi.fn(() => {
        const error: Partial<AxiosError> = {
          response: {
            status: 503,
            statusText: 'Service Unavailable',
            data: {},
            headers: {},
            config: {} as InternalAxiosRequestConfig,
          },
          message: '',
          config: {} as InternalAxiosRequestConfig,
        }
        return Promise.reject(error)
      })
      httpClient.defaults.adapter = mockAdapter as any

      await expect(httpClient.get('/api/data')).rejects.toMatchObject({
        status: 503,
        message: 'An unexpected error occurred',
      } as ApiError)
    })

    it('should default to 500 status when no response status', async () => {
      const mockAdapter = vi.fn(() => {
        const error: Partial<AxiosError> = {
          message: 'Network Error',
          config: {} as InternalAxiosRequestConfig,
        }
        return Promise.reject(error)
      })
      httpClient.defaults.adapter = mockAdapter as any

      await expect(httpClient.get('/api/data')).rejects.toMatchObject({
        status: 500,
        message: 'Network Error',
      } as ApiError)
    })

    it('should include error code when available', async () => {
      const mockAdapter = vi.fn(() => {
        const error: Partial<AxiosError> = {
          response: {
            status: 408,
            statusText: 'Request Timeout',
            data: { message: 'Request timed out' },
            headers: {},
            config: {} as InternalAxiosRequestConfig,
          },
          message: 'timeout of 10000ms exceeded',
          code: 'ECONNABORTED',
          config: {} as InternalAxiosRequestConfig,
        }
        return Promise.reject(error)
      })
      httpClient.defaults.adapter = mockAdapter as any

      await expect(httpClient.get('/slow-endpoint')).rejects.toMatchObject({
        status: 408,
        message: 'Request timed out',
        code: 'ECONNABORTED',
      } as ApiError)
    })

    it('should include response details in error', async () => {
      const responseData = { message: 'Validation failed', errors: { email: 'Invalid format' } }
      const mockAdapter = vi.fn(() => {
        const error: Partial<AxiosError> = {
          response: {
            status: 400,
            statusText: 'Bad Request',
            data: responseData,
            headers: {},
            config: {} as InternalAxiosRequestConfig,
          },
          message: 'Request failed',
          config: {} as InternalAxiosRequestConfig,
        }
        return Promise.reject(error)
      })
      httpClient.defaults.adapter = mockAdapter as any

      await expect(httpClient.post('/users', {})).rejects.toMatchObject({
        status: 400,
        message: 'Validation failed',
        details: responseData,
      } as ApiError)
    })
  })

  describe('ApiError interface', () => {
    it('should have required status and message fields', async () => {
      const mockAdapter = vi.fn(() => {
        const error: Partial<AxiosError> = {
          response: {
            status: 404,
            statusText: 'Not Found',
            data: { message: 'Not found' },
            headers: {},
            config: {} as InternalAxiosRequestConfig,
          },
          message: 'Not found',
          config: {} as InternalAxiosRequestConfig,
        }
        return Promise.reject(error)
      })
      httpClient.defaults.adapter = mockAdapter as any

      try {
        await httpClient.get('/missing')
      } catch (error) {
        const apiError = error as ApiError
        expect(apiError).toHaveProperty('status')
        expect(apiError).toHaveProperty('message')
        expect(typeof apiError.status).toBe('number')
        expect(typeof apiError.message).toBe('string')
      }
    })
  })
})
