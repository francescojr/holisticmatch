/**
 * FormInput component with validation
 * Reusable input component with inline validation and status indicators
 */
import { forwardRef } from 'react'
import { motion } from 'framer-motion'

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string
  value: string | number
  onChange: (value: string) => void
  error?: string | null
  isValidating?: boolean
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({
    label,
    type = 'text',
    value,
    onChange,
    error,
    isValidating = false,
    placeholder,
    required = false,
    disabled = false,
    className = '',
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`

    // Determine validation state
    const hasError = !!error
    const hasValue = value !== '' && value !== null && value !== undefined
    const isSuccess = hasValue && !hasError && !isValidating

    // Status icon based on state
    const getStatusIcon = () => {
      if (isValidating) {
        return (
          <motion.span
            className="material-symbols-outlined text-accent-yellow"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            refresh
          </motion.span>
        )
      }
      if (hasError) {
        return (
          <motion.span
            className="material-symbols-outlined text-accent-red"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            error
          </motion.span>
        )
      }
      if (isSuccess) {
        return (
          <motion.span
            className="material-symbols-outlined text-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            check_circle
          </motion.span>
        )
      }
      return null
    }

    return (
      <div className={`space-y-2 ${className}`}>
        {/* Label */}
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-light"
        >
          {label}
          {required && <span className="text-accent-red ml-1">*</span>}
        </label>

        {/* Input Container */}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`
              w-full px-4 py-3 pr-12 border rounded-lg transition-all duration-200
              bg-card-light text-text-light placeholder-subtext-light
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              ${hasError
                ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20'
                : hasValue && !isValidating
                  ? 'border-primary'
                  : 'border-border-light'
              }
            `}
            {...props}
          />

          {/* Status Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {!isValidating && getStatusIcon()}
          </div>
        </div>

        {/* Error Message */}
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 text-sm text-accent-red"
          >
            <span className="material-symbols-outlined text-base mt-0.5 flex-shrink-0">
              info
            </span>
            <span className="leading-relaxed">{error}</span>
          </motion.div>
        )}

        {/* Loading State Indicator */}
        {isValidating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-accent-yellow"
          >
            <motion.span
              className="material-symbols-outlined text-base"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              refresh
            </motion.span>
            <span>Validando...</span>
          </motion.div>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

export default FormInput