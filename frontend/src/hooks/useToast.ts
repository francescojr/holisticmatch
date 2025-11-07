/**
 * Custom hook for toast notifications
 * Provides reusable toast functionality with auto-dismiss and stacking
 */

import { useState, useCallback, useRef } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  createdAt: Date
}

export interface ToastOptions {
  duration?: number
  message?: string
}

export interface UseToastReturn {
  toasts: Toast[]
  toast: {
    success: (title: string, options?: ToastOptions) => void
    error: (title: string, options?: ToastOptions) => void
    info: (title: string, options?: ToastOptions) => void
    warning: (title: string, options?: ToastOptions) => void
  }
  dismiss: (id: string) => void
  dismissAll: () => void
}

const DEFAULT_DURATION = 3000 // 3 seconds
const SUCCESS_DURATION = 5000 // 5 seconds for success messages
const ERROR_DURATION = 7000 // 7 seconds for error messages
const MAX_TOASTS = 5 // Maximum number of toasts to show at once

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timeoutsRef = useRef<Map<string, number>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))

    // Clear timeout if exists
    const timeout = timeoutsRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeoutsRef.current.delete(id)
    }
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
    // Clear all timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current.clear()
  }, [])

  const showToast = useCallback((type: ToastType, title: string, options: ToastOptions = {}) => {
    // Determine duration based on toast type if not explicitly provided
    let duration = options.duration
    if (duration === undefined) {
      duration = type === 'success' ? SUCCESS_DURATION : 
                 type === 'error' ? ERROR_DURATION : 
                 DEFAULT_DURATION
    }
    
    const { message } = options

    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newToast: Toast = {
      id,
      type,
      title,
      message,
      duration,
      createdAt: new Date()
    }

    setToasts(prev => {
      // Remove oldest toast if we exceed the limit
      const updatedToasts = [...prev, newToast]
      if (updatedToasts.length > MAX_TOASTS) {
        const oldestToast = updatedToasts.shift()
        if (oldestToast) {
          const timeout = timeoutsRef.current.get(oldestToast.id)
          if (timeout) {
            clearTimeout(timeout)
            timeoutsRef.current.delete(oldestToast.id)
          }
        }
      }
      return updatedToasts
    })

    // Auto-dismiss after duration
    if (duration > 0) {
      const timeout = setTimeout(() => {
        dismiss(id)
      }, duration)

      timeoutsRef.current.set(id, timeout)
    }
  }, [dismiss])

  const toast = {
    success: (title: string, options?: ToastOptions) => showToast('success', title, options),
    error: (title: string, options?: ToastOptions) => showToast('error', title, options),
    info: (title: string, options?: ToastOptions) => showToast('info', title, options),
    warning: (title: string, options?: ToastOptions) => showToast('warning', title, options)
  }

  return {
    toasts,
    toast,
    dismiss,
    dismissAll
  }
}