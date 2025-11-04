/**
 * Example usage of FormInput component
 * This demonstrates how to use the FormInput component with validation
 */
import { useState } from 'react'
import FormInput from './FormInput'

export default function FormInputExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({})

  const handleChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateField = (field: string, value: string) => {
    setIsValidating(prev => ({ ...prev, [field]: true }))

    // Simulate async validation
    setTimeout(() => {
      let error = ''

      switch (field) {
        case 'name':
          if (!value.trim()) {
            error = 'Nome é obrigatório'
          } else if (value.length < 2) {
            error = 'Nome deve ter pelo menos 2 caracteres'
          }
          break

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!value) {
            error = 'Email é obrigatório'
          } else if (!emailRegex.test(value)) {
            error = 'Email deve ter formato válido'
          }
          break

        case 'phone':
          const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
          if (!value) {
            error = 'Telefone é obrigatório'
          } else if (!phoneRegex.test(value)) {
            error = 'Telefone deve ter formato brasileiro válido (ex: (11) 99999-9999)'
          }
          break

        case 'password':
          if (!value) {
            error = 'Senha é obrigatória'
          } else if (value.length < 8) {
            error = 'Senha deve ter pelo menos 8 caracteres'
          } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            error = 'Senha deve conter maiúscula, minúscula e número'
          }
          break
      }

      setErrors(prev => ({ ...prev, [field]: error }))
      setIsValidating(prev => ({ ...prev, [field]: false }))
    }, 500) // Simulate network delay
  }

  const handleBlur = (field: string) => () => {
    validateField(field, formData[field as keyof typeof formData])
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Exemplo FormInput</h2>

      <FormInput
        label="Nome Completo"
        type="text"
        value={formData.name}
        onChange={handleChange('name')}
        error={errors.name}
        isValidating={isValidating.name}
        placeholder="Digite seu nome completo"
        required
        onBlur={handleBlur('name')}
      />

      <FormInput
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        error={errors.email}
        isValidating={isValidating.email}
        placeholder="seu@email.com"
        required
        onBlur={handleBlur('email')}
      />

      <FormInput
        label="Telefone"
        type="tel"
        value={formData.phone}
        onChange={handleChange('phone')}
        error={errors.phone}
        isValidating={isValidating.phone}
        placeholder="(11) 99999-9999"
        required
        onBlur={handleBlur('phone')}
      />

      <FormInput
        label="Senha"
        type="password"
        value={formData.password}
        onChange={handleChange('password')}
        error={errors.password}
        isValidating={isValidating.password}
        placeholder="Digite sua senha"
        required
        onBlur={handleBlur('password')}
      />

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={Object.values(isValidating).some(Boolean) || Object.values(errors).some(Boolean)}
        >
          {Object.values(isValidating).some(Boolean) ? 'Validando...' : 'Enviar'}
        </button>
      </div>
    </div>
  )
}