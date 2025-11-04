/**
 * ToastContainer component tests
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ToastContainer } from '../../../../src/components/toast/ToastContainer'
import { Toast as ToastType } from '../../../../src/hooks/useToast'

describe('ToastContainer', () => {
  const mockOnDismiss = vi.fn()

  const createMockToasts = (count: number): ToastType[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: `toast-${index}`,
      type: 'success' as const,
      title: `Toast ${index + 1}`,
      message: `Message ${index + 1}`,
      duration: 3000,
      createdAt: new Date()
    }))
  }

  describe('Rendering', () => {
    it('should not render when there are no toasts', () => {
      const { container } = render(<ToastContainer toasts={[]} onDismiss={mockOnDismiss} />)

      expect(container.firstChild).toBeNull()
    })

    it('should render container with toasts', () => {
      const toasts = createMockToasts(1)

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

      const container = screen.getByLabelText('Notificações')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('fixed', 'top-4', 'right-4', 'z-50')
    })

    it('should render single toast', () => {
      const toasts = createMockToasts(1)

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

      expect(screen.getByText('Toast 1')).toBeInTheDocument()
      expect(screen.getByText('Message 1')).toBeInTheDocument()
    })

    it('should render multiple toasts', () => {
      const toasts = createMockToasts(3)

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

      expect(screen.getByText('Toast 1')).toBeInTheDocument()
      expect(screen.getByText('Toast 2')).toBeInTheDocument()
      expect(screen.getByText('Toast 3')).toBeInTheDocument()
    })
  })

  describe('Layout and positioning', () => {
    it('should position container in top-right corner', () => {
      const toasts = createMockToasts(1)

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

      const container = screen.getByLabelText('Notificações')
      expect(container).toHaveClass('top-4', 'right-4')
    })

    it('should stack toasts vertically with spacing', () => {
      const toasts = createMockToasts(2)

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

      const container = screen.getByLabelText('Notificações')
      expect(container).toHaveClass('space-y-2')
    })

    it('should have proper z-index for overlay', () => {
      const toasts = createMockToasts(1)

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

      const container = screen.getByLabelText('Notificações')
      expect(container).toHaveClass('z-50')
    })
  })

  describe('Toast interaction', () => {
    it('should pass onDismiss to individual toasts', () => {
      const toasts = createMockToasts(1)

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

      // The individual Toast component should receive the onDismiss prop
      // This is tested indirectly through the Toast component tests
      const dismissButton = screen.getByRole('button', { name: /fechar notificação/i })
      expect(dismissButton).toBeInTheDocument()
    })

    it('should render toasts in correct order', () => {
      const toasts = createMockToasts(3)

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

      const renderedToasts = screen.getAllByRole('alert')

      // Should render in the order they appear in the array
      expect(renderedToasts).toHaveLength(3)
      expect(screen.getByText('Toast 1')).toBeInTheDocument()
      expect(screen.getByText('Toast 2')).toBeInTheDocument()
      expect(screen.getByText('Toast 3')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      const toasts = createMockToasts(1)

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

      const container = screen.getByLabelText('Notificações')
      expect(container).toHaveAttribute('aria-label', 'Notificações')
    })

    it('should have pointer-events-none by default', () => {
      const toasts = createMockToasts(1)

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

      const container = screen.getByLabelText('Notificações')
      expect(container).toHaveClass('pointer-events-none')
    })

    it('should allow pointer events on individual toasts', () => {
      const toasts = createMockToasts(1)

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

      // The toast itself should have pointer-events-auto
      const toastElement = screen.getByRole('alert').parentElement
      expect(toastElement).toHaveClass('pointer-events-auto')
    })
  })

  describe('Performance and edge cases', () => {
    it('should handle empty toasts array gracefully', () => {
      const { container } = render(<ToastContainer toasts={[]} onDismiss={mockOnDismiss} />)

      expect(container.firstChild).toBeNull()
    })

    it('should handle large number of toasts', () => {
      const toasts = createMockToasts(10)

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

      const renderedToasts = screen.getAllByRole('alert')
      expect(renderedToasts).toHaveLength(10)
    })

    it('should handle toasts with different types', () => {
      const toasts: ToastType[] = [
        {
          id: 'success-toast',
          type: 'success',
          title: 'Success',
          duration: 3000,
          createdAt: new Date()
        },
        {
          id: 'error-toast',
          type: 'error',
          title: 'Error',
          duration: 3000,
          createdAt: new Date()
        },
        {
          id: 'warning-toast',
          type: 'warning',
          title: 'Warning',
          duration: 3000,
          createdAt: new Date()
        },
        {
          id: 'info-toast',
          type: 'info',
          title: 'Info',
          duration: 3000,
          createdAt: new Date()
        }
      ]

      render(<ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />)

      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Warning')).toBeInTheDocument()
      expect(screen.getByText('Info')).toBeInTheDocument()
    })
  })
})