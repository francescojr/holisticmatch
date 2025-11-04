/**
 * FormSelect Component
 * Reusable select/dropdown form component
 * Handles string select inputs with validation support
 */
import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface FormSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  helperText?: string | ReactNode
  showLabel?: boolean
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção',
  error,
  required = false,
  disabled = false,
  className = '',
  helperText,
  showLabel = true,
}) => {
  const hasError = !!error
  const selectId = `select-${label.toLowerCase().replace(/\s+/g, '-')}`

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  return (
    <motion.div
      className={`form-group ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {showLabel && (
        <label
          htmlFor={selectId}
          className={`block text-sm font-medium mb-2 ${
            hasError ? 'text-red-600' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-full
            px-4
            py-2.5
            text-sm
            border
            rounded-lg
            transition-all
            duration-200
            appearance-none
            cursor-pointer
            focus:outline-none
            focus:ring-2
            focus:ring-offset-0
            disabled:bg-gray-100
            disabled:cursor-not-allowed
            ${
              hasError
                ? 'border-red-500 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-blue-500 bg-white hover:border-gray-400'
            }
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${selectId}-error` : undefined}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        {/* Dropdown arrow icon */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className={`w-5 h-5 ${hasError ? 'text-red-600' : 'text-gray-700'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Error message */}
      {hasError && (
        <motion.p
          id={`${selectId}-error`}
          className="text-sm text-red-600 mt-2"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}

      {/* Helper text */}
      {helperText && !hasError && (
        <motion.p
          className="text-sm text-gray-500 mt-2"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {helperText}
        </motion.p>
      )}
    </motion.div>
  )
}

export default FormSelect
