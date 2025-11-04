/**
 * FormTextarea component with validation
 * Reusable textarea component with inline validation, character counter, and auto-resize
 */
import { forwardRef, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export interface FormTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string | null
  maxLength?: number
  minLength?: number
  showCounter?: boolean
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({
    label,
    value,
    onChange,
    error,
    maxLength,
    minLength,
    showCounter = true,
    required = false,
    disabled = false,
    className = '',
    id,
    ...props
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const combinedRef = ref || textareaRef

    const textareaId = id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`

    // Determine validation state
    const hasError = !!error
    const hasValue = value !== '' && value !== null && value !== undefined
    const isNearLimit = maxLength && value.length > maxLength * 0.8
    const isOverLimit = maxLength && value.length > maxLength
    const isUnderMin = minLength && hasValue && value.length < minLength

    // Auto-resize functionality
    useEffect(() => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [value])

    // Character counter color logic
    const getCounterColor = () => {
      if (isOverLimit) return 'text-accent-red'
      if (isNearLimit) return 'text-accent-yellow'
      return 'text-subtext-light'
    }

    return (
      <div className={`space-y-2 ${className}`}>
        {/* Label */}
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-text-light"
        >
          {label}
          {required && <span className="text-accent-red ml-1">*</span>}
        </label>

        {/* Textarea Container */}
        <div className="relative">
          <textarea
            ref={combinedRef}
            id={textareaId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={maxLength}
            minLength={minLength}
            disabled={disabled}
            required={required}
            style={{ height: 'auto' }}
            className={`
              w-full px-4 py-3 border rounded-lg transition-all duration-200 resize-none
              bg-card-light text-text-light placeholder-subtext-light
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              min-h-[100px] max-h-[300px] overflow-y-auto
              ${hasError || isOverLimit || isUnderMin
                ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20'
                : hasValue && !isUnderMin
                  ? 'border-primary'
                  : 'border-border-light'
              }
            `}
            {...props}
          />

          {/* Character Counter */}
          {showCounter && maxLength && (
            <div className={`absolute bottom-2 right-3 text-xs ${getCounterColor()}`}>
              {value.length}/{maxLength}
            </div>
          )}
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

        {/* Length Validation Messages */}
        {isOverLimit && !hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 text-sm text-accent-red"
          >
            <span className="material-symbols-outlined text-base mt-0.5 flex-shrink-0">
              error
            </span>
            <span className="leading-relaxed">
              Texto muito longo. Máximo {maxLength} caracteres.
            </span>
          </motion.div>
        )}

        {isUnderMin && !hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 text-sm text-accent-yellow"
          >
            <span className="material-symbols-outlined text-base mt-0.5 flex-shrink-0">
              warning
            </span>
            <span className="leading-relaxed">
              Mínimo {minLength} caracteres necessários.
            </span>
          </motion.div>
        )}
      </div>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'

export default FormTextarea