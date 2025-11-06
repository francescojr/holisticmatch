/**
 * Error Handler Utility
 * Centralized error message translation and handling
 * Maps HTTP status codes and error types to user-friendly messages
 */

import { AxiosError } from 'axios'

export interface AppError {
  title: string
  message: string
  type: 'error' | 'warning' | 'info'
  isDevelopment?: boolean
}

/**
 * Translate API error responses to user-friendly messages
 * Handles different error types: network, validation, auth, server
 */
export const parseApiError = (error: unknown): AppError => {
  // Network error
  if (!navigator.onLine) {
    return {
      title: 'Sem conexão',
      message: 'Verifique sua conexão com a internet',
      type: 'warning',
    }
  }

  // Axios error
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const data = error.response?.data as Record<string, unknown> | undefined

    // 400 - Validation error
    if (status === 400) {
      const errorMsg = getValidationError(data)
      return {
        title: 'Dados inválidos',
        message: errorMsg || 'Verifique os dados fornecidos',
        type: 'error',
      }
    }

    // 401 - Unauthorized (handled by interceptor, but include as fallback)
    if (status === 401) {
      return {
        title: 'Sessão expirada',
        message: 'Faça login novamente para continuar',
        type: 'warning',
      }
    }

    // 403 - Forbidden
    if (status === 403) {
      // Check for email verification requirement
      const detail = String(data?.detail || '')
      if (detail.includes('email') || detail.includes('verified')) {
        return {
          title: 'Email não verificado',
          message: 'Verifique seu email para ativar sua conta',
          type: 'warning',
        }
      }
      return {
        title: 'Acesso negado',
        message: 'Você não tem permissão para acessar este recurso',
        type: 'error',
      }
    }

    // 404 - Not Found
    if (status === 404) {
      return {
        title: 'Não encontrado',
        message: 'O recurso solicitado não existe',
        type: 'warning',
      }
    }

    // 409 - Conflict (duplicate email, etc)
    if (status === 409) {
      const conflictMsg = getConflictError(data)
      return {
        title: 'Conflito',
        message: conflictMsg || 'Este recurso já existe',
        type: 'error',
      }
    }

    // 422 - Unprocessable Entity (validation)
    if (status === 422) {
      const errorMsg = getValidationError(data)
      return {
        title: 'Dados inválidos',
        message: errorMsg || 'Verifique os dados fornecidos',
        type: 'error',
      }
    }

    // 429 - Too Many Requests (rate limit)
    if (status === 429) {
      return {
        title: 'Muitas requisições',
        message: 'Você está fazendo muitas requisições. Aguarde um momento',
        type: 'warning',
      }
    }

    // 500 - Server error
    if (status === 500) {
      return {
        title: 'Erro no servidor',
        message: 'Ocorreu um problema. Tente novamente mais tarde',
        type: 'error',
      }
    }

    // 503 - Service Unavailable
    if (status === 503) {
      return {
        title: 'Serviço indisponível',
        message: 'O servidor está em manutenção. Tente novamente em alguns minutos',
        type: 'warning',
      }
    }

    // Network timeout
    if (error.code === 'ECONNABORTED') {
      return {
        title: 'Requisição expirou',
        message: 'A requisição levou muito tempo. Tente novamente',
        type: 'warning',
      }
    }

    // Network error
    if (error.message === 'Network Error') {
      return {
        title: 'Erro de rede',
        message: 'Não foi possível conectar ao servidor',
        type: 'error',
      }
    }

    // Generic Axios error
    return {
      title: 'Erro na requisição',
      message: error.message || 'Algo deu errado. Tente novamente',
      type: 'error',
      isDevelopment: true,
    }
  }

  // Error object
  if (error instanceof Error) {
    return {
      title: 'Erro',
      message: error.message || 'Algo deu errado',
      type: 'error',
      isDevelopment: true,
    }
  }

  // Unknown error
  return {
    title: 'Erro desconhecido',
    message: 'Algo deu errado. Tente novamente',
    type: 'error',
  }
}

/**
 * Extract validation error message from API response
 * Handles different error response formats
 */
function getValidationError(data: Record<string, unknown> | undefined): string {
  if (!data) return ''

  // Direct error message
  if (typeof data.detail === 'string') {
    return data.detail
  }

  // Field-specific errors (common in DRF)
  if (typeof data.errors === 'object' && data.errors !== null) {
    const errors = data.errors as Record<string, unknown>
    const firstError = Object.values(errors)[0]
    if (typeof firstError === 'string') {
      return firstError
    }
    if (Array.isArray(firstError) && firstError.length > 0) {
      return String(firstError[0])
    }
  }

  // Multiple field errors
  const firstKey = Object.keys(data)[0]
  if (firstKey) {
    const firstValue = data[firstKey]
    if (typeof firstValue === 'string') {
      return firstValue
    }
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return String(firstValue[0])
    }
  }

  return ''
}

/**
 * Extract conflict error message from API response
 * For 409 Conflict responses
 */
function getConflictError(data: Record<string, unknown> | undefined): string {
  if (!data) return ''

  if (typeof data.detail === 'string') {
    return data.detail
  }

  if (typeof data.message === 'string') {
    return data.message
  }

  return ''
}

/**
 * Safe error logging (no sensitive data)
 * Use in development for debugging
 */
export const logError = (error: unknown, context?: string): void => {
  if (import.meta.env.DEV) {
    console.error(`[Error${context ? ` - ${context}` : ''}]`, error)
  }
}
