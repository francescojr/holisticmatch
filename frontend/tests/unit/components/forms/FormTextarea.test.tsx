/**
 * Unit tests for FormTextarea component
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FormTextarea from '../../../../src/components/forms/FormTextarea'

describe('FormTextarea', () => {
  const defaultProps = {
    label: 'Test Textarea',
    value: '',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('should render label and textarea', () => {
      render(<FormTextarea {...defaultProps} />)

      expect(screen.getByLabelText('Test Textarea')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should render with custom id', () => {
      render(<FormTextarea {...defaultProps} id="custom-id" />)

      const textarea = screen.getByLabelText('Test Textarea')
      expect(textarea).toHaveAttribute('id', 'custom-id')
    })

    it('should generate id from label when not provided', () => {
      render(<FormTextarea {...defaultProps} />)

      const textarea = screen.getByLabelText('Test Textarea')
      expect(textarea).toHaveAttribute('id', 'textarea-test-textarea')
    })

    it('should render required asterisk when required', () => {
      render(<FormTextarea {...defaultProps} required />)

      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })

  describe('Value handling', () => {
    it('should display initial value', () => {
      render(<FormTextarea {...defaultProps} value="test content" />)

      const textarea = screen.getByDisplayValue('test content')
      expect(textarea).toBeInTheDocument()
    })

    it('should call onChange when textarea changes', () => {
      const onChange = vi.fn()
      render(<FormTextarea {...defaultProps} onChange={onChange} />)

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'new content' } })

      expect(onChange).toHaveBeenCalledWith('new content')
    })
  })

  describe('Character counter', () => {
    it('should show character counter when maxLength is provided', () => {
      render(<FormTextarea {...defaultProps} maxLength={100} />)

      expect(screen.getByText('0/100')).toBeInTheDocument()
    })

    it('should update counter as user types', () => {
      const { rerender } = render(<FormTextarea {...defaultProps} maxLength={100} />)

      expect(screen.getByText('0/100')).toBeInTheDocument()

      rerender(<FormTextarea {...defaultProps} value="hello" maxLength={100} />)

      expect(screen.getByText('5/100')).toBeInTheDocument()
    })

    it('should not show counter when showCounter is false', () => {
      render(<FormTextarea {...defaultProps} maxLength={100} showCounter={false} />)

      expect(screen.queryByText('0/100')).not.toBeInTheDocument()
    })

    it('should change counter color when near limit', () => {
      const nearLimitText = 'a'.repeat(85)
      render(<FormTextarea {...defaultProps} value={nearLimitText} maxLength={100} />)

      const counter = screen.getByText('85/100')
      expect(counter).toHaveClass('text-accent-yellow')
    })

    it('should change counter color when over limit', () => {
      const overLimitText = 'a'.repeat(105)
      render(<FormTextarea {...defaultProps} value={overLimitText} maxLength={100} />)

      const counter = screen.getByText('105/100')
      expect(counter).toHaveClass('text-accent-red')
    })
  })

  describe('Length validation', () => {
    it('should show error when over maxLength', () => {
      const overLimitText = 'a'.repeat(105)
      render(<FormTextarea {...defaultProps} value={overLimitText} maxLength={100} />)

      expect(screen.getByText('Texto muito longo. Máximo 100 caracteres.')).toBeInTheDocument()
    })

    it('should show warning when under minLength', () => {
      render(<FormTextarea {...defaultProps} value="hi" minLength={10} />)

      expect(screen.getByText('Mínimo 10 caracteres necessários.')).toBeInTheDocument()
    })

    it('should not show minLength warning when empty', () => {
      render(<FormTextarea {...defaultProps} value="" minLength={10} />)

      expect(screen.queryByText('Mínimo 10 caracteres necessários.')).not.toBeInTheDocument()
    })

    it('should prioritize custom error over length validation', () => {
      const overLimitText = 'a'.repeat(105)
      render(<FormTextarea {...defaultProps} value={overLimitText} maxLength={100} error="Custom error" />)

      expect(screen.getByText('Custom error')).toBeInTheDocument()
      expect(screen.queryByText('Texto muito longo. Máximo 100 caracteres.')).not.toBeInTheDocument()
    })
  })

  describe('Error display', () => {
    it('should show error message when error prop is provided', () => {
      render(<FormTextarea {...defaultProps} error="This field is required" />)

      expect(screen.getByText('This field is required')).toBeInTheDocument()
      expect(screen.getByText('info')).toBeInTheDocument() // Error icon
    })

    it('should not show error message when error is null or undefined', () => {
      render(<FormTextarea {...defaultProps} error={null} />)

      expect(screen.queryByText('info')).not.toBeInTheDocument()
    })
  })

  describe('Auto-resize functionality', () => {
    it('should auto-resize textarea based on content', async () => {
      const { rerender } = render(<FormTextarea {...defaultProps} />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement

      // Add content and check if height changes
      rerender(<FormTextarea {...defaultProps} value="line 1\nline 2\nline 3\nline 4\nline 5" />)

      // Wait for effect to run and height to be set based on content
      await waitFor(() => {
        expect(textarea.style.height).not.toBe('')
      })

      // Height should be a pixel value (not empty or auto)
      expect(textarea.style.height).toMatch(/^\d+px$/)
    })
  })

  describe('Accessibility', () => {
    it('should be accessible with proper labels', () => {
      render(<FormTextarea {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAccessibleName('Test Textarea')
    })

    it('should mark as required when required prop is true', () => {
      render(<FormTextarea {...defaultProps} required />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('required')
    })

    it('should be disabled when disabled prop is true', () => {
      render(<FormTextarea {...defaultProps} disabled />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDisabled()
    })

    it('should set maxLength and minLength attributes', () => {
      render(<FormTextarea {...defaultProps} maxLength={500} minLength={10} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('maxLength', '500')
      expect(textarea).toHaveAttribute('minLength', '10')
    })
  })

  describe('Styling', () => {
    it('should apply custom className', () => {
      render(<FormTextarea {...defaultProps} className="custom-class" />)

      const container = screen.getByRole('textbox').closest('.space-y-2')
      expect(container).toHaveClass('custom-class')
    })

    it('should apply error styling when has error', () => {
      render(<FormTextarea {...defaultProps} error="Error" />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('border-accent-red')
    })

    it('should apply error styling when over maxLength', () => {
      const overLimitText = 'a'.repeat(105)
      render(<FormTextarea {...defaultProps} value={overLimitText} maxLength={100} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('border-accent-red')
    })

    it('should apply error styling when under minLength', () => {
      render(<FormTextarea {...defaultProps} value="hi" minLength={10} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('border-accent-red')
    })

    it('should apply success styling when has value and no errors', () => {
      render(<FormTextarea {...defaultProps} value="valid content" />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('border-primary')
    })

    it('should apply disabled styling when disabled', () => {
      render(<FormTextarea {...defaultProps} disabled />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('disabled:bg-gray-50', 'disabled:text-gray-400')
    })

    it('should have proper textarea-specific styling', () => {
      render(<FormTextarea {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('min-h-[100px]', 'max-h-[300px]', 'resize-none')
    })
  })

  describe('Animation and transitions', () => {
    it('should render error message with animation', async () => {
      const { rerender } = render(<FormTextarea {...defaultProps} />)

      // Initially no error
      expect(screen.queryByText('Error message')).not.toBeInTheDocument()

      // Add error
      rerender(<FormTextarea {...defaultProps} error="Error message" />)

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument()
      })
    })

    it('should render length validation messages with animation', async () => {
      const { rerender } = render(<FormTextarea {...defaultProps} maxLength={10} />)

      // Initially no message
      expect(screen.queryByText('Texto muito longo. Máximo 10 caracteres.')).not.toBeInTheDocument()

      // Add content over limit
      rerender(<FormTextarea {...defaultProps} value="this is way too long" maxLength={10} />)

      await waitFor(() => {
        expect(screen.getByText('Texto muito longo. Máximo 10 caracteres.')).toBeInTheDocument()
      })
    })
  })

  describe('Props forwarding', () => {
    it('should forward additional props to textarea', () => {
      render(<FormTextarea {...defaultProps} placeholder="Enter text" rows={5} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('placeholder', 'Enter text')
      expect(textarea).toHaveAttribute('rows', '5')
    })

    it('should forward ref correctly', () => {
      const ref = vi.fn()
      render(<FormTextarea {...defaultProps} ref={ref} />)

      expect(ref).toHaveBeenCalled()
    })
  })
})