/**
 * useConfirm hook
 * Provides confirmation dialog functionality
 */
import { useState } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        ...options,
        isOpen: true,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        type: options.type || 'warning',
        onConfirm: () => {
          setConfirmState(null)
          resolve(true)
        },
        onCancel: () => {
          setConfirmState(null)
          resolve(false)
        }
      })
    })
  }

  return {
    confirm,
    confirmState
  }
}