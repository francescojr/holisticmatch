/**
 * Unit tests for FormInput component
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FormInput from '../../../../src/components/forms/FormInput'

describe('FormInput', () => {
  const defaultProps = {
    label: 'Test Input',
    value: '',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('should render label and input', () => {
      render(<FormInput {...defaultProps} />)

      expect(screen.getByLabelText('Test Input')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should render with custom id', () => {
      render(<FormInput {...defaultProps} id="custom-id" />)

      const input = screen.getByLabelText('Test Input')
      expect(input).toHaveAttribute('id', 'custom-id')
    })

    it('should generate id from label when not provided', () => {
      render(<FormInput {...defaultProps} />)

      const input = screen.getByLabelText('Test Input')
      expect(input).toHaveAttribute('id', 'input-test-input')
    })

    it('should render required asterisk when required', () => {
      render(<FormInput {...defaultProps} required />)

      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })

  describe('Input types', () => {
    it('should render text input by default', () => {
      render(<FormInput {...defaultProps} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render email input', () => {
      render(<FormInput {...defaultProps} type="email" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render password input', () => {
      render(<FormInput {...defaultProps} type="password" />)

      const input = screen.getByDisplayValue('')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should render tel input', () => {
      render(<FormInput {...defaultProps} type="tel" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('should render url input', () => {
      render(<FormInput {...defaultProps} type="url" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'url')
    })

    it('should render number input', () => {
      render(<FormInput {...defaultProps} type="number" />)

      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })
  })

  describe('Value handling', () => {
    it('should display initial value', () => {
      render(<FormInput {...defaultProps} value="test value" />)

      const input = screen.getByDisplayValue('test value')
      expect(input).toBeInTheDocument()
    })

    it('should call onChange when input changes', () => {
      const onChange = vi.fn()
      render(<FormInput {...defaultProps} onChange={onChange} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'new value' } })

      expect(onChange).toHaveBeenCalledWith('new value')
    })

    it('should handle number values', () => {
      render(<FormInput {...defaultProps} value={42} />)

      const input = screen.getByDisplayValue('42')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Validation states', () => {
    it('should show error state with error message', () => {
      render(<FormInput {...defaultProps} error="This field is required" />)

      expect(screen.getByText('This field is required')).toBeInTheDocument()
      expect(screen.getByText('error')).toBeInTheDocument() // Error icon
    })

    it('should show success state when has value and no error', () => {
      render(<FormInput {...defaultProps} value="valid value" />)

      expect(screen.getByText('check_circle')).toBeInTheDocument() // Success icon
    })

    it('should show loading state when validating', () => {
      render(<FormInput {...defaultProps} isValidating={true} />)

      expect(screen.getByText('Validando...')).toBeInTheDocument()
      expect(screen.getByText('refresh')).toBeInTheDocument() // Loading icon
    })

    it('should not show success icon when validating', () => {
      render(<FormInput {...defaultProps} value="test" isValidating={true} />)

      expect(screen.getByText('refresh')).toBeInTheDocument()
      expect(screen.queryByText('check_circle')).not.toBeInTheDocument()
    })

    it('should not show success icon when has error', () => {
      render(<FormInput {...defaultProps} value="test" error="Error message" />)

      expect(screen.getByText('error')).toBeInTheDocument()
      expect(screen.queryByText('check_circle')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should be accessible with proper labels', () => {
      render(<FormInput {...defaultProps} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAccessibleName('Test Input')
    })

    it('should mark as required when required prop is true', () => {
      render(<FormInput {...defaultProps} required />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('required')
    })

    it('should be disabled when disabled prop is true', () => {
      render(<FormInput {...defaultProps} disabled />)

      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })
  })

  describe('Styling', () => {
    it('should apply custom className', () => {
      render(<FormInput {...defaultProps} className="custom-class" />)

      const container = screen.getByRole('textbox').closest('.space-y-2')
      expect(container).toHaveClass('custom-class')
    })

    it('should apply error styling when has error', () => {
      render(<FormInput {...defaultProps} error="Error" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-accent-red')
    })

    it('should apply success styling when has value and no error', () => {
      render(<FormInput {...defaultProps} value="test" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-primary')
    })

    it('should apply disabled styling when disabled', () => {
      render(<FormInput {...defaultProps} disabled />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:bg-gray-50', 'disabled:text-gray-400')
    })
  })

  describe('Animation and transitions', () => {
    it('should render error message with animation', async () => {
      const { rerender } = render(<FormInput {...defaultProps} />)

      // Initially no error
      expect(screen.queryByText('Error message')).not.toBeInTheDocument()

      // Add error
      rerender(<FormInput {...defaultProps} error="Error message" />)

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument()
      })
    })

    it('should render success icon with animation', async () => {
      const { rerender } = render(<FormInput {...defaultProps} />)

      // Initially no success icon
      expect(screen.queryByText('check_circle')).not.toBeInTheDocument()

      // Add value
      rerender(<FormInput {...defaultProps} value="test value" />)

      await waitFor(() => {
        expect(screen.getByText('check_circle')).toBeInTheDocument()
      })
    })
  })

  describe('Props forwarding', () => {
    it('should forward additional props to input', () => {
      render(<FormInput {...defaultProps} placeholder="Enter text" maxLength={10} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', 'Enter text')
      expect(input).toHaveAttribute('maxLength', '10')
    })

    it('should forward ref correctly', () => {
      const ref = vi.fn()
      render(<FormInput {...defaultProps} ref={ref} />)

      expect(ref).toHaveBeenCalled()
    })
  })
})