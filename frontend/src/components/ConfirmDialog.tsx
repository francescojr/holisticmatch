/**
 * ConfirmDialog component
 * Confirmation dialog for destructive actions
 */
import { motion, AnimatePresence } from 'framer-motion'
import { modalVariants } from '../lib/animations'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'delete',
          iconColor: 'text-red-500',
          buttonColor: 'bg-red-500 hover:bg-red-600'
        }
      case 'warning':
        return {
          icon: 'warning',
          iconColor: 'text-yellow-500',
          buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
        }
      case 'info':
      default:
        return {
          icon: 'info',
          iconColor: 'text-blue-500',
          buttonColor: 'bg-blue-500 hover:bg-blue-600'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white dark:bg-[#1a2e22] rounded-xl border border-[#dbe6e0] dark:border-[#2a3f34] p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full bg-gray-100 dark:bg-[#2a3f34]`}>
                  <span className={`material-symbols-outlined ${styles.iconColor}`}>{styles.icon}</span>
                </div>
                <div>
                  <h2 className="text-[#111814] dark:text-white text-lg font-bold leading-tight">
                    {title}
                  </h2>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${styles.buttonColor}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}