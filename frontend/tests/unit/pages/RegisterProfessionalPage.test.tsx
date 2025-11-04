/**
 * Tests for RegisterProfessionalPage - TASK 3.1
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RegisterProfessionalPage from '../../../src/pages/RegisterProfessionalPage'

// Mock the toast hook
vi.mock('../../../src/hooks/useToast', () => ({
  useToast: () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
  }),
}))

// Mock the form validation hook
vi.mock('../../../src/hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    errors: {},
    validate: vi.fn(() => true),
  }),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('RegisterProfessionalPage - TASK 3.1', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the registration form with all required fields', () => {
    renderWithProviders(<RegisterProfessionalPage />)

    // Check header
    expect(screen.getByText('Cadastre-se como Profissional')).toBeInTheDocument()
    expect(screen.getByText('Passo 1 de 2 - Informações Pessoais')).toBeInTheDocument()

    // Check form fields exist (using getByText for labels since they have complex structure)
    expect(screen.getByText('Nome Completo')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Telefone')).toBeInTheDocument()
    expect(screen.getByText('CPF (Opcional)')).toBeInTheDocument()
    expect(screen.getByText('Foto de Perfil')).toBeInTheDocument()

    // Check submit button
    expect(screen.getByRole('button', { name: 'Próximo Passo' })).toBeInTheDocument()
  })

  it('should show progress indicator for step 1', () => {
    renderWithProviders(<RegisterProfessionalPage />)

    // Should have 2 progress bars, with step 1 active
    const progressContainer = screen.getByText('Passo 1 de 2 - Informações Pessoais').parentElement?.nextElementSibling
    expect(progressContainer).toBeInTheDocument()
    expect(progressContainer?.children).toHaveLength(2)
  })

  it('should have login link', () => {
    renderWithProviders(<RegisterProfessionalPage />)

    const loginLink = screen.getByRole('link', { name: 'Faça login' })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('should integrate FileUpload component for photo upload', () => {
    renderWithProviders(<RegisterProfessionalPage />)

    // FileUpload component should be rendered
    const fileUploadLabel = screen.getByText('Foto de Perfil')
    expect(fileUploadLabel).toBeInTheDocument()

    // Should have file input (though it might be hidden)
    const fileInputs = screen.getAllByDisplayValue('')
    expect(fileInputs.length).toBeGreaterThan(0)
  })

  it('should have proper form section title', () => {
    renderWithProviders(<RegisterProfessionalPage />)

    expect(screen.getByText('Informações Pessoais')).toBeInTheDocument()
  })

  it('should maintain consistent styling with design system', () => {
    renderWithProviders(<RegisterProfessionalPage />)

    // Check form container has proper styling
    const formContainer = screen.getByText('Informações Pessoais').closest('.bg-white')
    expect(formContainer).toBeInTheDocument()
    expect(formContainer).toHaveClass('rounded-lg', 'shadow')
  })
})