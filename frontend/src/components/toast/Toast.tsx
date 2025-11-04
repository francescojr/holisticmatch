/**
 * Toast component for notifications
 * Individual toast notification with animations and auto-dismiss
 */

import { motion } from 'framer-motion'
import { Toast as ToastType } from '../../hooks/useToast'

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

const getToastStyles = (type: ToastType['type']) => {
  const baseStyles = 'flex items-start gap-3 p-4 rounded-lg shadow-lg border max-w-sm w-full'

  switch (type) {
    case 'success':
      return `${baseStyles} bg-green-50 border-green-200 text-green-800`
    case 'error':
      return `${baseStyles} bg-red-50 border-red-200 text-red-800`
    case 'warning':
      return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`
    case 'info':
    default:
      return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`
  }
}

const getIconName = (type: ToastType['type']): string => {
  switch (type) {
    case 'success':
      return 'check_circle'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
    default:
      return 'info'
  }
}

const getIconColor = (type: ToastType['type']): string => {
  switch (type) {
    case 'success':
      return 'text-green-600'
    case 'error':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    case 'info':
    default:
      return 'text-blue-600'
  }
}

export const Toast = ({ toast, onDismiss }: ToastProps) => {
  const handleDismiss = () => {
    onDismiss(toast.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 40,
        opacity: { duration: 0.2 }
      }}
      className={getToastStyles(toast.type)}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <span className={`material-symbols-outlined text-xl mt-0.5 flex-shrink-0 ${getIconColor(toast.type)}`}>
        {getIconName(toast.type)}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold leading-tight">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-sm leading-relaxed mt-1 opacity-90">
            {toast.message}
          </p>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black/20"
        aria-label="Fechar notificação"
      >
        <span className="material-symbols-outlined text-lg opacity-60 hover:opacity-100">
          close
        </span>
      </button>
    </motion.div>
  )
}