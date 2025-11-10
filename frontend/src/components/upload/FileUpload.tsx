/**
 * FileUpload component for photo uploads with preview and validation
 */

import { useState, useRef, forwardRef } from 'react'
import { motion } from 'framer-motion'

export interface FileUploadProps {
  label: string
  value: File | null
  onChange: (file: File | null) => void
  error?: string | null
  accept?: string
  maxSize?: number // in MB
  required?: boolean
  className?: string
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({
    label,
    value,
    onChange,
    error,
    accept = 'image/*',
    maxSize = 5,
    required = false,
    className = '',
  }, ref) => {
    const [preview, setPreview] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (file: File | null) => {
      if (!file) {
        setPreview(null)
        onChange(null)
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        onChange(null)
        return
      }

      // Validate file size (maxSize in MB)
      if (file.size > maxSize * 1024 * 1024) {
        onChange(null)
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      onChange(file)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null
      handleFileSelect(file)
      // Reset input value so same file can be selected again
      e.target.value = ''
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)

      const file = e.dataTransfer.files?.[0] || null
      handleFileSelect(file)
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
    }

    const handleClick = () => {
      fileInputRef.current?.click()
    }

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation()
      setPreview(null)
      onChange(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    return (
      <div className={`space-y-2 ${className}`}>
        {/* Label */}
        <label className="block text-sm font-medium text-text-light">
          {label}
          {required && <span className="text-accent-red ml-1">*</span>}
        </label>

        {/* Upload Area */}
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-all duration-200 hover:border-primary/50
            ${dragOver ? 'border-primary bg-primary/5' : 'border-border-light'}
            ${error ? 'border-accent-red' : ''}
            ${preview ? 'border-solid' : ''}
          `}
        >
          <input
            ref={ref || fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {preview ? (
            /* Preview Mode */
            <div className="space-y-3">
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-accent-red text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="Remover foto"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div>
                <p className="text-sm text-text-light font-medium">
                  {value?.name}
                </p>
                <p className="text-xs text-subtext-light">
                  {(value?.size ? (value.size / 1024 / 1024).toFixed(2) : 0)} MB
                </p>
              </div>
            </div>
          ) : (
            /* Upload Mode */
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-gray-400">
                  {dragOver ? 'cloud_upload' : 'add_photo_alternate'}
                </span>
              </div>
              <div>
                <p className="text-sm text-text-light font-medium">
                  {dragOver ? 'Solte a imagem aqui' : 'Clique para escolher ou arraste uma imagem'}
                </p>
                <p className="text-xs text-subtext-light mt-1">
                  PNG, JPG até {maxSize}MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
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
            <span className="leading-relaxed">{error}</span>
          </motion.div>
        )}
      </div>
    )
  }
)

FileUpload.displayName = 'FileUpload'

export default FileUpload