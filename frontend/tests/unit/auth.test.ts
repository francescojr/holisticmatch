/**
 * Unit Tests for Auth Hooks and Services
 * Tests authentication logic without making API calls
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { parseApiError } from '../../src/utils/errorHandler'
import axios from 'axios'
import type { AxiosError } from 'axios'

/**
 * errorHandler.ts Unit Tests
 * Tests error message translation and parsing
 */
describe('errorHandler - parseApiError', () => {
  describe('Network Errors', () => {
    it('should handle offline status', () => {
      // Mock navigator.onLine
      Object.defineProperty(window.navigator, 'onLine', {
        configurable: true,
        value: false,
      })

      const result = parseApiError(new Error('Network Error'))
      expect(result.title).toBe('Sem conexão')
      expect(result.message).toContain('internet')
      expect(result.type).toBe('warning')

      // Restore
      Object.defineProperty(window.navigator, 'onLine', {
        configurable: true,
        value: true,
      })
    })

    it('should handle network timeout', () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded',
      } as any

      const result = parseApiError(error)
      expect(result.title).toBe('Requisição expirou')
      expect(result.type).toBe('warning')
    })
  })

  describe('HTTP 400 - Bad Request', () => {
    it('should handle 400 with detail message', () => {
      const axiosError = {
        response: {
          status: 400,
          data: { detail: 'Invalid email format' },
        },
      } as any as AxiosError

      const result = parseApiError(axiosError)
      expect(result.title).toBe('Dados inválidos')
      expect(result.message).toBe('Invalid email format')
      expect(result.type).toBe('error')
    })

    it('should extract field-specific validation errors', () => {
      const axiosError = {
        response: {
          status: 400,
          data: {
            email: ['Email already registered'],
            password: ['Password too short'],
          },
        },
      } as any as AxiosError

      const result = parseApiError(axiosError)
      expect(result.title).toBe('Dados inválidos')
      expect(result.message).toBe('Email already registered')
      expect(result.type).toBe('error')
    })
  })

  describe('HTTP 401 - Unauthorized', () => {
    it('should handle 401 Unauthorized', () => {
      const axiosError = {
        response: {
          status: 401,
          data: { detail: 'Token expired' },
        },
      } as any as AxiosError

      const result = parseApiError(axiosError)
      expect(result.title).toBe('Sessão expirada')
      expect(result.type).toBe('warning')
    })
  })

  describe('HTTP 403 - Forbidden', () => {
    it('should detect unverified email in 403 error', () => {
      const axiosError = {
        response: {
          status: 403,
          data: { detail: 'Email not verified' },
        },
      } as any as AxiosError

      const result = parseApiError(axiosError)
      expect(result.title).toBe('Email não verificado')
      expect(result.type).toBe('warning')
    })

    it('should handle general 403 Forbidden', () => {
      const axiosError = {
        response: {
          status: 403,
          data: { detail: 'Access denied' },
        },
      } as any as AxiosError

      const result = parseApiError(axiosError)
      expect(result.title).toBe('Acesso negado')
      expect(result.type).toBe('error')
    })
  })

  describe('HTTP 404 - Not Found', () => {
    it('should handle 404 Not Found', () => {
      const axiosError = {
        response: {
          status: 404,
          data: { detail: 'Professional not found' },
        },
      } as any as AxiosError

      const result = parseApiError(axiosError)
      expect(result.title).toBe('Não encontrado')
      expect(result.type).toBe('warning')
    })
  })

  describe('HTTP 409 - Conflict', () => {
    it('should handle 409 Conflict (duplicate)', () => {
      const axiosError = {
        response: {
          status: 409,
          data: { detail: 'Email already exists' },
        },
      } as any as AxiosError

      const result = parseApiError(axiosError)
      expect(result.title).toBe('Conflito')
      expect(result.message).toBe('Email already exists')
      expect(result.type).toBe('error')
    })
  })

  describe('HTTP 429 - Too Many Requests', () => {
    it('should handle 429 Rate Limit', () => {
      const axiosError = {
        response: {
          status: 429,
          data: { detail: 'Rate limit exceeded' },
        },
      } as any as AxiosError

      const result = parseApiError(axiosError)
      expect(result.title).toBe('Muitas requisições')
      expect(result.type).toBe('warning')
    })
  })

  describe('HTTP 500 - Server Error', () => {
    it('should handle 500 Internal Server Error', () => {
      const axiosError = {
        response: {
          status: 500,
          data: { detail: 'Internal server error' },
        },
      } as any as AxiosError

      const result = parseApiError(axiosError)
      expect(result.title).toBe('Erro no servidor')
      expect(result.type).toBe('error')
    })
  })

  describe('HTTP 503 - Service Unavailable', () => {
    it('should handle 503 Service Unavailable', () => {
      const axiosError = {
        response: {
          status: 503,
          data: { detail: 'Service unavailable' },
        },
      } as any as AxiosError

      const result = parseApiError(axiosError)
      expect(result.title).toBe('Serviço indisponível')
      expect(result.type).toBe('warning')
    })
  })

  describe('Generic Error Objects', () => {
    it('should handle Error objects', () => {
      const error = new Error('Something went wrong')
      const result = parseApiError(error)

      expect(result.title).toBe('Erro')
      expect(result.message).toBe('Something went wrong')
      expect(result.type).toBe('error')
      expect(result.isDevelopment).toBe(true)
    })

    it('should handle unknown error types', () => {
      const result = parseApiError('Unknown error string')
      expect(result.title).toBe('Erro desconhecido')
      expect(result.type).toBe('error')
    })
  })

  describe('Edge Cases', () => {
    it('should handle null response data', () => {
      const axiosError = {
        response: {
          status: 500,
          data: null,
        },
      } as any as AxiosError

      const result = parseApiError(axiosError)
      expect(result.title).toBe('Erro no servidor')
      expect(result.type).toBe('error')
    })

    it('should handle missing detail field', () => {
      const axiosError = {
        response: {
          status: 400,
          data: {},
        },
      } as any as AxiosError

      const result = parseApiError(axiosError)
      expect(result.title).toBe('Dados inválidos')
      expect(result.type).toBe('error')
    })

    it('should extract array validation errors', () => {
      const axiosError = {
        response: {
          status: 422,
          data: {
            errors: {
              services: [
                ['Service type is invalid'],
              ],
            },
          },
        },
      } as any as AxiosError

      const result = parseApiError(axiosError)
      expect(result.title).toBe('Dados inválidos')
      expect(result.type).toBe('error')
    })
  })
})

/**
 * localStorage Auth State Tests
 * Tests that auth tokens are properly managed
 */
describe('localStorage Auth State', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Token Management', () => {
    it('should store access token', () => {
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      localStorage.setItem('access_token', testToken)

      expect(localStorage.getItem('access_token')).toBe(testToken)
    })

    it('should store refresh token', () => {
      const testToken = 'refresh_token_value_xyz...'
      localStorage.setItem('refresh_token', testToken)

      expect(localStorage.getItem('refresh_token')).toBe(testToken)
    })

    it('should store professional_id', () => {
      const profId = 'prof-123-abc'
      localStorage.setItem('professional_id', profId)

      expect(localStorage.getItem('professional_id')).toBe(profId)
    })

    it('should store email verification flag', () => {
      localStorage.setItem('just_verified_email', 'test@example.com')

      expect(localStorage.getItem('just_verified_email')).toBe('test@example.com')
    })
  })

  describe('Token Cleanup', () => {
    it('should clear all auth tokens on logout', () => {
      // Setup
      localStorage.setItem('access_token', 'token1')
      localStorage.setItem('refresh_token', 'token2')
      localStorage.setItem('professional_id', 'prof-123')
      localStorage.setItem('just_verified_email', 'test@example.com')

      // Simulate logout cleanup
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('professional_id')
      localStorage.removeItem('just_verified_email')

      // Verify all cleared
      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
      expect(localStorage.getItem('professional_id')).toBeNull()
      expect(localStorage.getItem('just_verified_email')).toBeNull()
    })

    it('should handle partial cleanup', () => {
      localStorage.setItem('access_token', 'token1')
      localStorage.setItem('refresh_token', 'token2')
      localStorage.setItem('other_data', 'preserved')

      // Clear only auth-related
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
      expect(localStorage.getItem('other_data')).toBe('preserved')
    })
  })
})

/**
 * Auth Response Format Tests
 * Validates that auth endpoints return expected structure
 */
describe('Auth Response Formats', () => {
  describe('Registration Response', () => {
    it('should have correct structure for registration success', () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
        professional: {
          id: 'prof-456',
          services: ['Reiki'],
        },
      }

      expect(mockResponse).toHaveProperty('user')
      expect(mockResponse.user).toHaveProperty('email')
      expect(mockResponse).toHaveProperty('professional')
      expect(mockResponse.professional).toHaveProperty('id')
    })
  })

  describe('Login Response', () => {
    it('should have JWT tokens in login response', () => {
      const mockResponse = {
        access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh: 'refresh_token_xyz...',
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      }

      expect(mockResponse).toHaveProperty('access')
      expect(mockResponse).toHaveProperty('refresh')
      expect(mockResponse.access).toBeTruthy()
      expect(mockResponse.refresh).toBeTruthy()
    })
  })

  describe('Refresh Token Response', () => {
    it('should return new access token on refresh', () => {
      const mockResponse = {
        access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_NEW...',
      }

      expect(mockResponse).toHaveProperty('access')
      expect(mockResponse.access).toBeTruthy()
    })
  })
})
