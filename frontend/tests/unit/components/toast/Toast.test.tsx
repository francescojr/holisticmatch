/**
 * Toast component tests
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Toast } from '../../../../src/components/toast/Toast'
import { Toast as ToastType } from '../../../../src/hooks/useToast'

describe('Toast', () => {
  const mockOnDismiss = vi.fn()

  const createMockToast = (overrides: Partial<ToastType> = {}): ToastType => ({
    id: 'test-toast',
    type: 'success',
    title: 'Test Title',
    message: 'Test message',
    duration: 3000,
    createdAt: new Date(),
    ...overrides
  })

  describe('Basic rendering', () => {
    it('should render toast with title', () => {
      const toast = createMockToast({ title: 'Success message' })

      render(<Toast toast={toast} onDismiss={mockOnDismiss} />)

      expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    it('should render toast with message', () => {
      const toast = createMockToast({
        title: 'Title',
        message: 'Detailed message'
      })

      render(<Toast toast={toast} onDismiss={mockOnDismiss} />)

      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Detailed message')).toBeInTheDocument()
    })

    it('should render dismiss button', () => {
      const toast = createMockToast()

      render(<Toast toast={toast} onDismiss={mockOnDismiss} />)

      const dismissButton = screen.getByRole('button', { name: /fechar notificação/i })
      expect(dismissButton).toBeInTheDocument()
    })

    it('should have correct ARIA attributes', () => {
      const toast = createMockToast()

      render(<Toast toast={toast} onDismiss={mockOnDismiss} />)

      const toastElement = screen.getByRole('alert')
      expect(toastElement).toBeInTheDocument()
      expect(toastElement).toHaveAttribute('aria-live', 'assertive')
    })
  })

  describe('Toast types', () => {
    const types: ToastType['type'][] = ['success', 'error', 'warning', 'info']

    types.forEach(type => {
      it(`should render ${type} toast with correct styling`, () => {
        const toast = createMockToast({ type, title: `${type} message` })

        render(<Toast toast={toast} onDismiss={mockOnDismiss} />)

        const toastElement = screen.getByRole('alert')
        expect(toastElement).toBeInTheDocument()
        expect(toastElement).toHaveClass(type === 'success' ? 'bg-green-50' :
                                        type === 'error' ? 'bg-red-50' :
                                        type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50')
      })

      it(`should render correct icon for ${type} toast`, () => {
        const toast = createMockToast({ type })

        render(<Toast toast={toast} onDismiss={mockOnDismiss} />)

        const iconElement = screen.getByText(type === 'success' ? 'check_circle' :
                                           type === 'error' ? 'error' :
                                           type === 'warning' ? 'warning' : 'info')
        expect(iconElement).toBeInTheDocument()
      })
    })
  })

  describe('Dismiss functionality', () => {
    it('should call onDismiss when dismiss button is clicked', () => {
      const toast = createMockToast()

      render(<Toast toast={toast} onDismiss={mockOnDismiss} />)

      const dismissButton = screen.getByRole('button', { name: /fechar notificação/i })
      fireEvent.click(dismissButton)

      expect(mockOnDismiss).toHaveBeenCalledWith(toast.id)
      expect(mockOnDismiss).toHaveBeenCalledTimes(1)
    })

    it('should call onDismiss with correct toast id', () => {
      const customId = 'custom-toast-id'
      const toast = createMockToast({ id: customId })

      render(<Toast toast={toast} onDismiss={mockOnDismiss} />)

      const dismissButton = screen.getByRole('button', { name: /fechar notificação/i })
      fireEvent.click(dismissButton)

      expect(mockOnDismiss).toHaveBeenCalledWith(customId)
    })
  })

  describe('Accessibility', () => {
    it('should have proper focus management on dismiss button', () => {
      const toast = createMockToast()

      render(<Toast toast={toast} onDismiss={mockOnDismiss} />)

      const dismissButton = screen.getByRole('button', { name: /fechar notificação/i })

      // Button should be focusable
      dismissButton.focus()
      expect(document.activeElement).toBe(dismissButton)
    })

    it('should have descriptive button label', () => {
      const toast = createMockToast()

      render(<Toast toast={toast} onDismiss={mockOnDismiss} />)

      const dismissButton = screen.getByRole('button', { name: /fechar notificação/i })
      expect(dismissButton).toHaveAttribute('aria-label', 'Fechar notificação')
    })
  })

  describe('Content display', () => {
    it('should display title prominently', () => {
      const toast = createMockToast({ title: 'Important Title' })

      render(<Toast toast={toast} onDismiss={mockOnDismiss} />)

      const titleElement = screen.getByText('Important Title')
      expect(titleElement).toHaveClass('font-semibold')
    })

    it('should display message with lower emphasis', () => {
      const toast = createMockToast({
        title: 'Title',
        message: 'This is a detailed message'
      })

      render(<Toast toast={toast} onDismiss={mockOnDismiss} />)

      const messageElement = screen.getByText('This is a detailed message')
      expect(messageElement).toHaveClass('opacity-90')
    })

    it('should handle toast without message', () => {
      const toast = createMockToast({
        title: 'Title Only',
        message: undefined
      })

      render(<Toast toast={toast} onDismiss={mockOnDismiss} />)

      expect(screen.getByText('Title Only')).toBeInTheDocument()
      expect(screen.queryByText('opacity-90')).not.toBeInTheDocument()
    })
  })
})