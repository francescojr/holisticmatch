/**
 * Tests for EmailVerificationPage - TASK 6.2
 * Simplified tests focusing on rendering and basic interactions
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EmailVerificationPage from '../../../src/pages/EmailVerificationPage'

// Mock the toast hook
vi.mock('../../../src/hooks/useToast', () => ({
  useToast: () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
    toasts: [],
  }),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  },
}))

// Mock professional service
vi.mock('../../../src/services/professionalService', () => ({
  professionalService: {
    verifyEmailToken: vi.fn(),
    resendVerificationEmail: vi.fn(),
  },
  default: {
    verifyEmailToken: vi.fn(),
    resendVerificationEmail: vi.fn(),
  },
}))

// Mock ToastContainer
vi.mock('../../../src/components/toast', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  Toast: () => <div />,
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('EmailVerificationPage - TASK 6.2', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('should render email verification form by default', () => {
      renderWithProviders(<EmailVerificationPage />)

      // Check main heading (h1)
      const heading = screen.getByRole('heading', { level: 1, name: /Verificar E-mail/ })
      expect(heading).toBeInTheDocument()
      
      // Form elements
      expect(screen.getByText('Código de Verificação')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Cole seu código aqui ou abra o link do e-mail')).toBeInTheDocument()
    })

    it('should display countdown timer in input state', () => {
      renderWithProviders(<EmailVerificationPage />)

      // Should show countdown timer label
      expect(screen.getByText(/Token expira em:/)).toBeInTheDocument()
    })

    it('should display resend link', () => {
      renderWithProviders(<EmailVerificationPage />)

      expect(screen.getByText('Não recebeu o código?')).toBeInTheDocument()
      expect(screen.getByText('Solicitar novo código')).toBeInTheDocument()
    })

    it('should display login link in footer', () => {
      renderWithProviders(<EmailVerificationPage />)

      const loginLink = screen.getByText('Fazer login')
      expect(loginLink).toBeInTheDocument()
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
    })

    it('should display toast container', () => {
      renderWithProviders(<EmailVerificationPage />)

      expect(screen.getByTestId('toast-container')).toBeInTheDocument()
    })
  })

  describe('Form Fields', () => {
    it('should have token input field', () => {
      renderWithProviders(<EmailVerificationPage />)

      const tokenInput = screen.getByPlaceholderText('Cole seu código aqui ou abra o link do e-mail') as HTMLInputElement
      expect(tokenInput).toBeInTheDocument()
      expect(tokenInput.type).toBe('text')
    })

    it('should have verify button', () => {
      renderWithProviders(<EmailVerificationPage />)

      const buttons = screen.getAllByText('Verificar E-mail')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Layout', () => {
    it('should have proper container structure', () => {
      const { container } = renderWithProviders(<EmailVerificationPage />)

      // Should have main content area
      const mainContent = container.querySelector('.max-w-md')
      expect(mainContent).toBeInTheDocument()

      // Should have card container
      const card = container.querySelector('.rounded-2xl')
      expect(card).toBeInTheDocument()
    })

    it('should have background styling', () => {
      const { container } = renderWithProviders(<EmailVerificationPage />)

      const wrapper = container.querySelector('[class*="bg-gradient"]')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have descriptive labels', () => {
      renderWithProviders(<EmailVerificationPage />)

      expect(screen.getByText('Código de Verificação')).toBeInTheDocument()
    })

    it('should have form structure', () => {
      const { container } = renderWithProviders(<EmailVerificationPage />)

      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should have footer with help text', () => {
      renderWithProviders(<EmailVerificationPage />)

      expect(screen.getByText(/Já tem uma conta/)).toBeInTheDocument()
    })
  })

  describe('Visual States', () => {
    it('should render with proper heading hierarchy', () => {
      const { container } = renderWithProviders(<EmailVerificationPage />)

      const headings = container.querySelectorAll('h1')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have icon elements', () => {
      const { container } = renderWithProviders(<EmailVerificationPage />)

      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('should have rounded corners on card', () => {
      const { container } = renderWithProviders(<EmailVerificationPage />)

      const card = container.querySelector('.rounded-2xl')
      expect(card).toHaveClass('rounded-2xl')
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive padding', () => {
      const { container } = renderWithProviders(<EmailVerificationPage />)

      const mainDiv = container.querySelector('[class*="px-"]')
      expect(mainDiv).toBeInTheDocument()
    })

    it('should have max-width constraint on form', () => {
      const { container } = renderWithProviders(<EmailVerificationPage />)

      const formContainer = container.querySelector('.max-w-md')
      expect(formContainer).toBeInTheDocument()
    })
  })
})
