/**
 * useToast hook tests
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useToast } from '../../../src/hooks/useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('Initial state', () => {
    it('should start with empty toasts array', () => {
      const { result } = renderHook(() => useToast())

      expect(result.current.toasts).toEqual([])
    })

    it('should provide toast methods', () => {
      const { result } = renderHook(() => useToast())

      expect(result.current.toast).toHaveProperty('success')
      expect(result.current.toast).toHaveProperty('error')
      expect(result.current.toast).toHaveProperty('info')
      expect(result.current.toast).toHaveProperty('warning')
    })

    it('should provide dismiss methods', () => {
      const { result } = renderHook(() => useToast())

      expect(typeof result.current.dismiss).toBe('function')
      expect(typeof result.current.dismissAll).toBe('function')
    })
  })

  describe('Toast creation', () => {
    it('should create success toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.success('Success message')
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0]).toMatchObject({
        type: 'success',
        title: 'Success message'
      })
      expect(result.current.toasts[0].id).toBeDefined()
      expect(result.current.toasts[0].createdAt).toBeInstanceOf(Date)
    })

    it('should create error toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.error('Error message')
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0]).toMatchObject({
        type: 'error',
        title: 'Error message'
      })
    })

    it('should create info toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.info('Info message')
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0]).toMatchObject({
        type: 'info',
        title: 'Info message'
      })
    })

    it('should create warning toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.warning('Warning message')
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0]).toMatchObject({
        type: 'warning',
        title: 'Warning message'
      })
    })

    it('should create toast with message', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.success('Title', { message: 'Detailed message' })
      })

      expect(result.current.toasts[0]).toMatchObject({
        title: 'Title',
        message: 'Detailed message'
      })
    })

    it('should create toast with custom duration', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.success('Title', { duration: 5000 })
      })

      expect(result.current.toasts[0].duration).toBe(5000)
    })

    it('should generate unique IDs for multiple toasts', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.success('First')
        result.current.toast.success('Second')
      })

      expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id)
    })
  })

  describe('Auto-dismiss', () => {
    it('should auto-dismiss toast after default duration', async () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.success('Auto-dismiss test')
      })

      expect(result.current.toasts).toHaveLength(1)

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('should auto-dismiss toast after custom duration', async () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.success('Custom duration', { duration: 1000 })
      })

      expect(result.current.toasts).toHaveLength(1)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('should not auto-dismiss toast with duration 0', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.success('Persistent', { duration: 0 })
      })

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      expect(result.current.toasts).toHaveLength(1)
    })
  })

  describe('Manual dismiss', () => {
    it('should dismiss specific toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.success('First')
        result.current.toast.success('Second')
      })

      const firstToastId = result.current.toasts[0].id

      act(() => {
        result.current.dismiss(firstToastId)
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].title).toBe('Second')
    })

    it('should dismiss all toasts', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.success('First')
        result.current.toast.success('Second')
        result.current.toast.success('Third')
      })

      expect(result.current.toasts).toHaveLength(3)

      act(() => {
        result.current.dismissAll()
      })

      expect(result.current.toasts).toHaveLength(0)
    })
  })

  describe('Toast stacking', () => {
    it('should limit to maximum 5 toasts', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        for (let i = 0; i < 7; i++) {
          result.current.toast.success(`Toast ${i + 1}`)
        }
      })

      expect(result.current.toasts).toHaveLength(5)
      expect(result.current.toasts[0].title).toBe('Toast 3') // Oldest remaining
      expect(result.current.toasts[4].title).toBe('Toast 7') // Newest
    })

    it('should maintain order of toasts', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.success('First')
        result.current.toast.error('Second')
        result.current.toast.info('Third')
      })

      expect(result.current.toasts).toHaveLength(3)
      expect(result.current.toasts[0].title).toBe('First')
      expect(result.current.toasts[1].title).toBe('Second')
      expect(result.current.toasts[2].title).toBe('Third')
    })
  })

  describe('Timeout cleanup', () => {
    it('should clear timeout when toast is manually dismissed', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.success('Test')
      })

      const toastId = result.current.toasts[0].id

      act(() => {
        result.current.dismiss(toastId)
      })

      expect(result.current.toasts).toHaveLength(0)

      // Advance time - should not cause any issues since timeout was cleared
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('should clear all timeouts when dismissAll is called', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast.success('First', { duration: 1000 })
        result.current.toast.success('Second', { duration: 2000 })
      })

      act(() => {
        result.current.dismissAll()
      })

      expect(result.current.toasts).toHaveLength(0)

      // Advance time - should not cause any issues
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(result.current.toasts).toHaveLength(0)
    })
  })
})