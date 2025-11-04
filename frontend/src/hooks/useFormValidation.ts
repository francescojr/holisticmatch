/**
 * Custom hook for form validation
 * Provides reusable validation functions for forms
 */

import { useState, useMemo } from 'react'

export interface ValidationErrors {
  [key: string]: string
}

export interface ValidationRules {
  required?: boolean
  email?: boolean
  password?: boolean
  phone?: boolean
  url?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  customMessage?: string
}

export interface UseFormValidationReturn {
  errors: ValidationErrors
  validate: (field: string, value: any, rules?: ValidationRules) => boolean
  validateAll: (fields: Record<string, any>, fieldRules?: Record<string, ValidationRules>) => { isValid: boolean; errors: ValidationErrors }
  isValid: boolean
  clearErrors: () => void
  clearFieldError: (field: string) => void
  setFieldError: (field: string, error: string) => void
}

/**
 * Brazilian phone number validation
 * Accepts formats: (11) 99999-9999, 11999999999, +5511999999999
 */
const validateBrazilianPhone = (value: string): boolean => {
  if (!value) return false
  const cleanNumber = value.replace(/\D/g, '')
  const normalizedNumber = cleanNumber.startsWith('55') && cleanNumber.length === 13
    ? cleanNumber.slice(2)
    : cleanNumber

  if (normalizedNumber.length === 10) {
    return /^\d{10}$/.test(normalizedNumber)
  } else if (normalizedNumber.length === 11) {
    return /^\d{2}9\d{8}$/.test(normalizedNumber)
  }
  return false
}

/**
 * Email validation
 */
const validateEmail = (value: string): boolean => {
  if (!value) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * Password validation
 */
const validatePassword = (value: string): boolean => {
  if (!value || value.length < 8) return false
  const hasUpperCase = /[A-Z]/.test(value)
  const hasLowerCase = /[a-z]/.test(value)
  const hasNumbers = /\d/.test(value)
  return hasUpperCase && hasLowerCase && hasNumbers
}

/**
 * URL validation
 */
const validateUrl = (value: string): boolean => {
  if (!value) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

/**
 * Required validation
 */
const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

/**
 * Get error message
 */
const getErrorMessage = (rules: ValidationRules): string => {
  if (rules.customMessage) return rules.customMessage
  if (rules.required) return 'Campo é obrigatório'
  if (rules.email) return 'Email deve ter formato válido'
  if (rules.password) return 'Senha deve ter pelo menos 8 caracteres, 1 maiúscula, 1 minúscula e 1 número'
  if (rules.phone) return 'Telefone deve ter formato brasileiro válido (ex: (11) 99999-9999)'
  if (rules.url) return 'URL deve ter formato válido'
  if (rules.minLength) return `Campo deve ter pelo menos ${rules.minLength} caracteres`
  if (rules.maxLength) return `Campo deve ter no máximo ${rules.maxLength} caracteres`
  if (rules.min) return `Campo deve ser maior ou igual a ${rules.min}`
  if (rules.max) return `Campo deve ser menor ou igual a ${rules.max}`
  if (rules.pattern) return 'Campo tem formato inválido'
  return 'Campo inválido'
}

/**
 * Validate single field
 */
const validateField = (value: any, rules: ValidationRules): string | null => {
  if (rules.required && !validateRequired(value)) {
    return getErrorMessage({ required: true })
  }

  if (rules.email && !validateEmail(value)) {
    return getErrorMessage({ email: true })
  }

  if (rules.password && !validatePassword(value)) {
    return getErrorMessage({ password: true })
  }

  if (rules.phone && !validateBrazilianPhone(value)) {
    return getErrorMessage({ phone: true })
  }

  if (rules.url && !validateUrl(value)) {
    return getErrorMessage({ url: true })
  }

  if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
    return getErrorMessage({ minLength: rules.minLength })
  }

  if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
    return getErrorMessage({ maxLength: rules.maxLength })
  }

  if (rules.min && typeof value === 'number' && value < rules.min) {
    return getErrorMessage({ min: rules.min })
  }

  if (rules.max && typeof value === 'number' && value > rules.max) {
    return getErrorMessage({ max: rules.max })
  }

  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return getErrorMessage({ pattern: rules.pattern, customMessage: rules.customMessage })
  }

  return null
}

/**
 * Custom hook for form validation
 */
export const useFormValidation = (): UseFormValidationReturn => {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validate = (field: string, value: any, rules: ValidationRules = {}): boolean => {
    const error = validateField(value, rules)

    setErrors((prev) => {
      if (error) {
        return { ...prev, [field]: error }
      } else {
        const { [field]: _, ...rest } = prev
        return rest
      }
    })

    return !error
  }

  const validateAll = (
    fields: Record<string, any>,
    fieldRules: Record<string, ValidationRules> = {}
  ): { isValid: boolean; errors: ValidationErrors } => {
    const newErrors: ValidationErrors = {}
    let allValid = true

    Object.entries(fields).forEach(([field, value]) => {
      const rules = fieldRules[field] || {}
      const error = validateField(value, rules)
      if (error) {
        newErrors[field] = error
        allValid = false
      }
    })

    setErrors(newErrors)

    return { isValid: allValid, errors: newErrors }
  }

  const clearErrors = () => {
    setErrors({})
  }

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev
      return rest
    })
  }

  const setFieldError = (field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  // ✅ useMemo para recalcular isValid quando errors muda
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors])

  return {
    errors,
    validate,
    validateAll,
    isValid,
    clearErrors,
    clearFieldError,
    setFieldError
  }
}