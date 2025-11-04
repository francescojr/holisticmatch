/**
 * Unit tests for useFormValidation hook
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useFormValidation } from '../../../src/hooks/useFormValidation'

describe('useFormValidation', () => {
  let hook: ReturnType<typeof useFormValidation>

  beforeEach(() => {
    const { result } = renderHook(() => useFormValidation())
    hook = result.current
  })

  describe('Email validation', () => {
    it('should validate valid email', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('email', 'test@example.com', { email: true })
      })
      expect(isValid).toBe(true)
    })

    it('should invalidate invalid email', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('email', 'invalid-email', { email: true })
      })
      expect(isValid).toBe(false)
    })

    it('should invalidate empty email', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('email', '', { email: true })
      })
      expect(isValid).toBe(false)
    })

    it('should invalidate null email', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('email', null, { email: true })
      })
      expect(isValid).toBe(false)
    })
  })

  describe('Password validation', () => {
    it('should validate strong password', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('password', 'StrongPass123', { password: true })
      })
      expect(isValid).toBe(true)
    })

    it('should invalidate password without uppercase', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('password', 'strongpass123', { password: true })
      })
      expect(isValid).toBe(false)
    })

    it('should invalidate password without lowercase', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('password', 'STRONGPASS123', { password: true })
      })
      expect(isValid).toBe(false)
    })

    it('should invalidate password without numbers', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('password', 'StrongPass', { password: true })
      })
      expect(isValid).toBe(false)
    })

    it('should invalidate short password', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('password', 'Short1', { password: true })
      })
      expect(isValid).toBe(false)
    })
  })

  describe('Brazilian phone validation', () => {
    it('should validate mobile phone with formatting', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('phone', '(11) 99999-9999', { phone: true })
      })
      expect(isValid).toBe(true)
    })

    it('should validate mobile phone without formatting', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('phone', '11999999999', { phone: true })
      })
      expect(isValid).toBe(true)
    })

    it('should validate landline phone', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('phone', '1133334444', { phone: true })
      })
      expect(isValid).toBe(true)
    })

    it('should validate international format', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('phone', '+5511999999999', { phone: true })
      })
      expect(isValid).toBe(true)
    })

    it('should invalidate phone without 9 prefix for mobile', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('phone', '11888888888', { phone: true })
      })
      expect(isValid).toBe(false)
    })

    it('should invalidate short phone', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('phone', '119999', { phone: true })
      })
      expect(isValid).toBe(false)
    })

    it('should invalidate empty phone', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('phone', '', { phone: true })
      })
      expect(isValid).toBe(false)
    })
  })

  describe('URL validation', () => {
    it('should validate valid HTTP URL', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('url', 'https://example.com', { url: true })
      })
      expect(isValid).toBe(true)
    })

    it('should validate valid HTTPS URL', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('url', 'https://example.com/path', { url: true })
      })
      expect(isValid).toBe(true)
    })

    it('should invalidate invalid URL', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('url', 'not-a-url', { url: true })
      })
      expect(isValid).toBe(false)
    })

    it('should invalidate empty URL', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('url', '', { url: true })
      })
      expect(isValid).toBe(false)
    })
  })

  describe('Required field validation', () => {
    it('should validate non-empty string', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('name', 'John Doe', { required: true })
      })
      expect(isValid).toBe(true)
    })

    it('should validate non-empty array', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('services', ['service1'], { required: true })
      })
      expect(isValid).toBe(true)
    })

    it('should validate number', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('age', 25, { required: true })
      })
      expect(isValid).toBe(true)
    })

    it('should invalidate empty string', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('name', '', { required: true })
      })
      expect(isValid).toBe(false)
    })

    it('should invalidate whitespace string', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('name', '   ', { required: true })
      })
      expect(isValid).toBe(false)
    })

    it('should invalidate empty array', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('services', [], { required: true })
      })
      expect(isValid).toBe(false)
    })

    it('should invalidate null value', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('name', null, { required: true })
      })
      expect(isValid).toBe(false)
    })

    it('should invalidate undefined value', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('name', undefined, { required: true })
      })
      expect(isValid).toBe(false)
    })
  })

  describe('Length validation', () => {
    it('should validate minimum length', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('name', 'John', { minLength: 3 })
      })
      expect(isValid).toBe(true)
    })

    it('should invalidate below minimum length', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('name', 'Jo', { minLength: 3 })
      })
      expect(isValid).toBe(false)
    })

    it('should validate maximum length', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('name', 'John', { maxLength: 10 })
      })
      expect(isValid).toBe(true)
    })

    it('should invalidate above maximum length', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('name', 'ThisNameIsTooLong', { maxLength: 10 })
      })
      expect(isValid).toBe(false)
    })
  })

  describe('Numeric validation', () => {
    it('should validate minimum value', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('age', 25, { min: 18 })
      })
      expect(isValid).toBe(true)
    })

    it('should invalidate below minimum value', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('age', 16, { min: 18 })
      })
      expect(isValid).toBe(false)
    })

    it('should validate maximum value', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('age', 25, { max: 100 })
      })
      expect(isValid).toBe(true)
    })

    it('should invalidate above maximum value', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('age', 150, { max: 100 })
      })
      expect(isValid).toBe(false)
    })
  })

  describe('Pattern validation', () => {
    it('should validate matching pattern', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('code', 'ABC123', { pattern: /^[A-Z]{3}\d{3}$/ })
      })
      expect(isValid).toBe(true)
    })

    it('should invalidate non-matching pattern', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('code', 'abc123', { pattern: /^[A-Z]{3}\d{3}$/ })
      })
      expect(isValid).toBe(false)
    })

    it('should use custom error message', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('code', 'abc123', {
          pattern: /^[A-Z]{3}\d{3}$/,
          customMessage: 'Código deve ter 3 letras maiúsculas e 3 números'
        })
      })
      expect(isValid).toBe(false)
    })
  })

  describe('Multiple rules validation', () => {
    it('should validate when all rules pass', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('email', 'test@example.com', { required: true, email: true })
      })
      expect(isValid).toBe(true)
    })

    it('should invalidate when required rule fails', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('email', '', { required: true, email: true })
      })
      expect(isValid).toBe(false)
    })

    it('should invalidate when email rule fails', () => {
      let isValid = false
      act(() => {
        isValid = hook.validate('email', 'invalid-email', { required: true, email: true })
      })
      expect(isValid).toBe(false)
    })
  })

  describe('validateAll method', () => {
    it('should validate all fields and return result', () => {
      const result = hook.validateAll({
        name: 'John Doe',
        email: 'john@example.com'
      }, {
        name: { required: true },
        email: { required: true, email: true }
      })
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should return valid result when all fields pass', () => {
      const result = hook.validateAll({
        name: 'John Doe',
        email: 'john@example.com'
      })
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })
  })

  describe('Error management', () => {
    it('should clear all errors', () => {
      act(() => {
        hook.validate('email', 'invalid', { email: true })
        hook.validate('name', '', { required: true })
        hook.clearErrors()
      })
      expect(Object.keys(hook.errors)).toHaveLength(0)
    })

    it('should clear specific field error', () => {
      act(() => {
        hook.validate('email', 'invalid', { email: true })
        hook.validate('name', '', { required: true })
        hook.clearFieldError('email')
      })
      expect(hook.errors.email).toBeUndefined()
    })
  })

  describe('isValid property', () => {
    it('should be true when no errors', () => {
      expect(hook.isValid).toBe(true)
    })

    it('should be true after clearing errors', () => {
      act(() => {
        hook.validate('email', 'invalid', { email: true })
        hook.clearErrors()
      })
      expect(hook.isValid).toBe(true)
    })
  })
})
