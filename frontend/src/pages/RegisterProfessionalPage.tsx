/**
 * Professional registration page with multi-step form
 * TASK 3.1: RegisterPage - Formulário Profissional (Passo 1)
 * TASK 3.2: RegisterPage - Formulário Serviços (Passo 2)
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageVariants, itemVariants } from '../lib/animations'
import { useFormValidation } from '../hooks/useFormValidation'
import { useToast } from '../hooks/useToast'
import { FormInput, FormTextarea, FileUpload, ToastContainer } from '../components'
import { professionalService } from '../services/professionalService'

interface Step1FormData {
  fullName: string
  email: string
  phone: string
  cpf: string
  photo: File | null
}

interface ServiceData {
  id: string
  serviceType: string
  price: number
  description: string
}

interface Step2FormData {
  services: ServiceData[]
  newService: {
    serviceType: string
    price: number
    description: string
  }
}

function RegisterProfessionalPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [availableServices, setAvailableServices] = useState<string[]>([])

  const [step1Data, setStep1Data] = useState<Step1FormData>({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    photo: null,
  })

  const [step2Data, setStep2Data] = useState<Step2FormData>({
    services: [],
    newService: {
      serviceType: '',
      price: 0,
      description: ''
    }
  })

  const { errors, validate } = useFormValidation()

  // Load available services on component mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        const services = await professionalService.getServiceTypes()
        setAvailableServices(services)
      } catch (error) {
        console.error('Erro ao carregar tipos de serviço:', error)
        toast.error('Erro ao carregar serviços', {
          message: 'Não foi possível carregar os tipos de serviço disponíveis'
        })
      }
    }

    loadServices()
  }, [])

  const handleStep1InputChange = (field: keyof Step1FormData, value: string | File | null) => {
    setStep1Data(prev => ({ ...prev, [field]: value }))

    // Validate field on change
    if (typeof value === 'string') {
      validate(field, value, getValidationRules(field))
    }
  }

  const getValidationRules = (field: keyof Step1FormData) => {
    switch (field) {
      case 'fullName':
        return { required: true, minLength: 3 }
      case 'email':
        return { required: true, email: true }
      case 'phone':
        return { required: true, phone: true }
      case 'cpf':
        return { required: false } // CPF is optional
      default:
        return { required: true }
    }
  }

  const validatePhoto = (file: File | null): string | null => {
    if (!file) return null

    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Por favor, selecione uma imagem válida (PNG, JPG)'
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return 'A imagem deve ter no máximo 5MB'
    }

    return null
  }

  const handlePhotoChange = (file: File | null) => {
    const photoError = validatePhoto(file)
    setStep1Data(prev => ({ ...prev, photo: file }))

    // Update validation errors
    if (photoError) {
      // We need to handle photo validation differently since it's not in the form validation hook
      // For now, we'll show it via toast
      if (file) {
        toast.error('Erro na foto', { message: photoError })
      }
    }
  }

  const validateStep1Form = (): boolean => {
    let isFormValid = true

    // Validate all text fields
    Object.keys(step1Data).forEach(key => {
      if (key !== 'photo') {
        const fieldKey = key as keyof Step1FormData
        const value = step1Data[fieldKey]
        if (typeof value === 'string') {
          const fieldValid = validate(fieldKey, value, getValidationRules(fieldKey))
          if (!fieldValid) isFormValid = false
        }
      }
    })

    // Validate photo
    const photoError = validatePhoto(step1Data.photo)
    if (photoError) {
      toast.error('Erro na foto', { message: photoError })
      isFormValid = false
    }

    return isFormValid
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep1Form()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    setLoading(true)

    try {
      // For now, just show success and navigate to next step
      // In a real implementation, this would validate email uniqueness
      toast.success('Dados validados com sucesso!', {
        message: 'Prosseguindo para o próximo passo...'
      })

      // Store form data for next step (in a real app, this would be in a context or state management)
      sessionStorage.setItem('registerStep1', JSON.stringify({
        ...step1Data,
        photo: step1Data.photo ? { name: step1Data.photo.name, size: step1Data.photo.size } : null
      }))

      // Navigate to next step
      setCurrentStep(2)

    } catch (error: any) {
      toast.error('Erro na validação', {
        message: error.message || 'Ocorreu um erro inesperado'
      })
    } finally {
      setLoading(false)
    }
  }

  // Service management functions
  const addService = () => {
    const { serviceType, price, description } = step2Data.newService

    // Validation
    if (!serviceType) {
      toast.error('Selecione um tipo de serviço')
      return
    }

    if (!price || price <= 0) {
      toast.error('Preço deve ser maior que zero')
      return
    }

    if (!description || description.trim().length < 10) {
      toast.error('Descrição deve ter pelo menos 10 caracteres')
      return
    }

    // Check for duplicates
    if (step2Data.services.some(s => s.serviceType === serviceType)) {
      toast.error('Este tipo de serviço já foi adicionado')
      return
    }

    // Check max services
    if (step2Data.services.length >= 5) {
      toast.error('Máximo de 5 serviços permitidos')
      return
    }

    // Add service
    const newService: ServiceData = {
      id: Date.now().toString(),
      serviceType,
      price,
      description: description.trim()
    }

    setStep2Data(prev => ({
      ...prev,
      services: [...prev.services, newService],
      newService: { serviceType: '', price: 0, description: '' }
    }))

    toast.success('Serviço adicionado com sucesso!')
  }

  const removeService = (serviceId: string) => {
    setStep2Data(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId)
    }))
    toast.success('Serviço removido')
  }

  const handleStep2InputChange = (field: keyof typeof step2Data.newService, value: string | number) => {
    setStep2Data(prev => ({
      ...prev,
      newService: {
        ...prev.newService,
        [field]: value
      }
    }))
  }

  const validateStep2Form = (): boolean => {
    if (step2Data.services.length === 0) {
      toast.error('Adicione pelo menos um serviço')
      return false
    }

    if (step2Data.services.length > 5) {
      toast.error('Máximo de 5 serviços permitidos')
      return false
    }

    return true
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep2Form()) {
      return
    }

    setLoading(true)

    try {
      // Prepare data for API
      const registrationData = {
        fullName: step1Data.fullName,
        email: step1Data.email,
        phone: step1Data.phone,
        cpf: step1Data.cpf,
        ...(step1Data.photo && { photo: step1Data.photo }),
        services: step2Data.services.map(service => ({
          serviceType: service.serviceType,
          price: service.price,
          description: service.description
        }))
      }

      // Show loading message
      toast.info('Criando seu perfil profissional...', {
        message: 'Por favor, aguarde enquanto processamos seu cadastro.'
      })

      // Create professional profile
      const result = await professionalService.createProfessional(registrationData)

      // If photo exists, upload it separately
      if (step1Data.photo && result.professional.id) {
        try {
          toast.info('Fazendo upload da foto...', {
            message: 'Quase lá!'
          })

          await professionalService.uploadProfessionalPhoto(result.professional.id, step1Data.photo)
        } catch (photoError: any) {
          console.warn('Photo upload failed, but professional was created:', photoError)
          // Don't fail the entire registration if photo upload fails
          toast.warning('Perfil criado, mas houve um problema com a foto', {
            message: 'Você pode fazer upload da foto depois no seu perfil.'
          })
        }
      }

      // Store auth token if provided
      if (result.token) {
        localStorage.setItem('access_token', result.token)
        // Also store refresh token if available in response
        if ('refresh_token' in result) {
          localStorage.setItem('refresh_token', (result as any).refresh_token)
        }
      }

      // Clear session storage
      sessionStorage.removeItem('registerStep1')

      // Show success message
      toast.success('Cadastro realizado com sucesso!', {
        message: 'Bem-vindo ao HolisticMatch! Redirecionando para o dashboard...'
      })

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Registration error:', error)

      // Handle different error types
      if (error.response?.status === 400) {
        // Validation errors
        const errors = error.response.data
        if (errors.email) {
          toast.error('E-mail já cadastrado', {
            message: 'Este e-mail já está sendo usado. Tente fazer login ou use outro e-mail.'
          })
        } else if (errors.phone) {
          toast.error('Telefone inválido', {
            message: 'Verifique o formato do telefone.'
          })
        } else if (errors.services) {
          toast.error('Erro nos serviços', {
            message: 'Verifique os dados dos serviços informados.'
          })
        } else {
          toast.error('Dados inválidos', {
            message: 'Verifique os dados informados e tente novamente.'
          })
        }
      } else if (error.response?.status === 409) {
        // Conflict - email already exists
        toast.error('E-mail já cadastrado', {
          message: 'Este e-mail já está sendo usado. Tente fazer login ou use outro e-mail.'
        })
      } else if (error.response?.status === 500) {
        // Server error
        toast.error('Erro no servidor', {
          message: 'Ocorreu um erro interno. Tente novamente em alguns minutos.'
        })
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        // Network error
        toast.error('Erro de conexão', {
          message: 'Verifique sua conexão com a internet e tente novamente.'
        })
      } else {
        // Generic error
        toast.error('Erro no cadastro', {
          message: error.message || 'Ocorreu um erro inesperado. Tente novamente.'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep(1)
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background-light py-12 px-4"
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <span className="material-symbols-outlined text-2xl">spa</span>
            </div>
            <h1 className="text-3xl font-black">
              <span className="text-gray-900">holistic</span>
              <span className="text-gray-900/80">match</span>
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Cadastre-se como Profissional</h2>
          <p className="text-gray-600 mt-2">
            Passo {currentStep} de 2 - {currentStep === 1 ? 'Informações Pessoais' : 'Serviços Oferecidos'}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex gap-4">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s <= currentStep ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Form */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow p-6"
        >
          {currentStep === 1 ? (
            /* Step 1: Personal Information */
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informações Pessoais
              </h3>

              {/* Nome Completo */}
              <FormInput
                label="Nome Completo"
                type="text"
                value={step1Data.fullName}
                onChange={(value) => handleStep1InputChange('fullName', value)}
                error={errors.fullName}
                placeholder="Seu nome completo"
                required
              />

              {/* Email */}
              <FormInput
                label="Email"
                type="email"
                value={step1Data.email}
                onChange={(value) => handleStep1InputChange('email', value)}
                error={errors.email}
                placeholder="seu@email.com"
                required
              />

              {/* Telefone */}
              <FormInput
                label="Telefone"
                type="tel"
                value={step1Data.phone}
                onChange={(value) => handleStep1InputChange('phone', value)}
                error={errors.phone}
                placeholder="(11) 99999-9999"
                required
              />

              {/* CPF (Opcional) */}
              <FormInput
                label="CPF (Opcional)"
                type="text"
                value={step1Data.cpf}
                onChange={(value) => handleStep1InputChange('cpf', value)}
                error={errors.cpf}
                placeholder="000.000.000-00"
              />

              {/* Foto de Perfil */}
              <FileUpload
                label="Foto de Perfil"
                value={step1Data.photo}
                onChange={handlePhotoChange}
                maxSize={5}
                accept="image/*"
              />

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
                  ${loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Validando...
                  </div>
                ) : (
                  'Próximo Passo'
                )}
              </motion.button>
            </form>
          ) : (
            /* Step 2: Services */
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Serviços Oferecidos
              </h3>

              {/* Added Services List */}
              {step2Data.services.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Serviços Adicionados:</h4>
                  {step2Data.services.map((service) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-gray-50 rounded-lg p-4 border"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{service.serviceType}</h5>
                          <p className="text-sm text-gray-600 mt-1">R$ {service.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-500 mt-2">{service.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeService(service.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Add New Service Form */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-700 mb-4">Adicionar Novo Serviço:</h4>

                <div className="space-y-4">
                  {/* Service Type Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Serviço
                    </label>
                    <select
                      value={step2Data.newService.serviceType}
                      onChange={(e) => handleStep2InputChange('serviceType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Selecione um serviço</option>
                      {availableServices.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Input */}
                  <FormInput
                    label="Preço (R$)"
                    type="number"
                    value={step2Data.newService.price || ''}
                    onChange={(value) => handleStep2InputChange('price', parseFloat(value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />

                  {/* Description Textarea */}
                  <FormTextarea
                    label="Descrição do Serviço"
                    value={step2Data.newService.description}
                    onChange={(value) => handleStep2InputChange('description', value)}
                    placeholder="Descreva o serviço oferecido..."
                    rows={3}
                  />

                  {/* Add Service Button */}
                  <motion.button
                    type="button"
                    onClick={addService}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Adicionar Serviço
                  </motion.button>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <motion.button
                  type="button"
                  onClick={handlePreviousStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Voltar
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleStep2Submit}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200
                    ${loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Cadastrando...
                    </div>
                  ) : (
                    'Finalizar Cadastro'
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>        {/* Link to Login */}
        <p className="text-center mt-6 text-gray-600">
          Já tem conta?{' '}
          <Link
            to="/login"
            className="text-primary font-semibold hover:underline transition-colors"
          >
            Faça login
          </Link>
        </p>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={[]} onDismiss={() => {}} />
    </motion.div>
  )
}

export default RegisterProfessionalPage
