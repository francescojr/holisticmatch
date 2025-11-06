/**
 * Global Error Boundary
 * Catches React component errors and displays fallback UI
 * Prevents entire app from crashing on component errors
 */

import React, { ReactNode, ReactElement } from 'react'
import { motion } from 'framer-motion'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

/**
 * Error Boundary component for catching React errors
 * Shows user-friendly error UI and logs errors for debugging
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Store error details
    const errorId = `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.setState({
      errorInfo,
      errorId,
    })

    // Log error for debugging (development only)
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught:', error)
      console.error('Error Info:', errorInfo)
    }

    // In production, could send to error tracking service (Sentry, etc)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    })
  }

  render(): ReactElement {
    const { hasError, error, errorId } = this.state

    if (hasError && error) {
      return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 mt-0.5">
                  <span className="material-symbols-rounded text-red-500 text-2xl">
                    error_outline
                  </span>
                </div>
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-gray-900">
                    Algo deu errado
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Desculpe, encontramos um erro inesperado
                  </p>
                </div>
              </div>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && (
                <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs font-mono text-gray-700 break-words">
                    <span className="font-semibold">Erro:</span> {error.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-semibold">ID:</span> {errorId}
                  </p>
                </div>
              )}

              {/* Production Message */}
              {!import.meta.env.DEV && (
                <p className="text-sm text-gray-600 mb-4">
                  Relatório de erro gerado: <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{errorId}</code>
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={this.handleReset}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Tentar novamente
                </motion.button>
                <motion.a
                  href="/"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors text-center"
                >
                  Voltar ao início
                </motion.a>
              </div>

              {/* Support Message */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Se o problema persistir, entre em contato com o suporte
              </p>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children as ReactElement
  }
}

export default ErrorBoundary
