/**
 * FormSelect Component Tests
 * Tests for the FormSelect reusable component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FormSelect } from './FormSelect'

describe('FormSelect Component', () => {
  const mockOptions = ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto']
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('should render select with label', () => {
    render(
      <FormSelect
        label="Cidade"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        required
      />
    )

    expect(screen.getByLabelText(/Cidade/i)).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument() // Required indicator
  })

  it('should render all options', () => {
    render(
      <FormSelect
        label="Cidade"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    )

    mockOptions.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument()
    })
  })

  it('should call onChange when option is selected', () => {
    render(
      <FormSelect
        label="Cidade"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    )

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'São Paulo' } })

    expect(mockOnChange).toHaveBeenCalledWith('São Paulo')
  })

  it('should display placeholder text', () => {
    render(
      <FormSelect
        label="Cidade"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        placeholder="Escolha uma cidade"
      />
    )

    expect(screen.getByText('Escolha uma cidade')).toBeInTheDocument()
  })

  it('should display error message when provided', () => {
    render(
      <FormSelect
        label="Cidade"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        error="Cidade é obrigatória"
      />
    )

    expect(screen.getByText('Cidade é obrigatória')).toBeInTheDocument()
  })

  it('should display helper text when provided and no error', () => {
    render(
      <FormSelect
        label="Cidade"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        helperText="Selecione sua cidade"
      />
    )

    expect(screen.getByText('Selecione sua cidade')).toBeInTheDocument()
  })

  it('should disable select when disabled prop is true', () => {
    render(
      <FormSelect
        label="Cidade"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        disabled
      />
    )

    const select = screen.getByRole('combobox')
    expect(select).toBeDisabled()
  })

  it('should select value when provided', () => {
    render(
      <FormSelect
        label="Cidade"
        value="Campinas"
        onChange={mockOnChange}
        options={mockOptions}
      />
    )

    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('Campinas')
  })

  it('should apply error styles when error is present', () => {
    render(
      <FormSelect
        label="Cidade"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        error="Erro"
      />
    )

    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('border-red-500')
    expect(select).toHaveClass('focus:ring-red-500')
  })

  it('should hide label when showLabel is false', () => {
    render(
      <FormSelect
        label="Cidade"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        showLabel={false}
      />
    )

    const label = screen.queryByText('Cidade')
    expect(label).not.toBeInTheDocument()
  })
})
