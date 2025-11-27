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
import { useCities } from '../hooks/useCities'
import { useToast } from '../hooks/useToast'
import { FormInput, FileUpload, FormSelect, SearchableSelect, ToastContainer } from '../components'
import { authService } from '../services/authService'
import { professionalService } from '../services/professionalService'

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

interface Step1FormData {
  fullName: string
  email: string
  phone: string
  cpf: string
  password: string
  passwordConfirm: string
  photo: File | null
  state: string
  city: string
}

interface Step2FormData {
  services: string[]  // Just service names, no individual prices
  pricePerSession: number  // Single base price for all services
  attendanceType: 'presencial' | 'online' | 'ambos'  // How they offer services
  acceptTerms: boolean  // Terms and conditions acceptance (required)
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
    password: '',
    passwordConfirm: '',
    photo: null,
    state: '',
    city: '',
  })

  // Use hook to manage cities based on selected state
  const { cities, loading: citiesLoading, error: citiesError } = useCities(step1Data.state)

  const [step2Data, setStep2Data] = useState<Step2FormData>({
    services: [],
    pricePerSession: 0,
    attendanceType: 'presencial',
    acceptTerms: false
  })

  const [photoValidating, setPhotoValidating] = useState(false)
  const [photoValidationError, setPhotoValidationError] = useState<string | null>(null)

  const { errors, validate, setFieldError } = useFormValidation()

  // Load available services on component mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        const services = await professionalService.getServiceTypes()
        setAvailableServices(services)
      } catch (error) {
        toast.error('Erro ao carregar serviços', {
          message: 'Não foi possível carregar os tipos de serviço disponíveis'
        })
      }
    }

    loadServices()
  }, [])

  const handleStep1InputChange = (field: keyof Step1FormData, value: string | File | null) => {
    console.log(`[RegisterPage.Step1.Input] ${field} changed to:`, value)
    setStep1Data(prev => ({ ...prev, [field]: value }))

    // Validate field on change
    if (typeof value === 'string') {
      const isValid = validate(field, value, getValidationRules(field))
      console.log(`[RegisterPage.Step1.Input] ${field} validation result:`, isValid)
      
      // Special validation for password confirmation
      if (field === 'passwordConfirm') {
        setStep1Data(prev => ({ ...prev, passwordConfirm: value }))
        if (value !== step1Data.password) {
          console.log('[RegisterPage.Step1.Input] Password mismatch detected')
          setFieldError('passwordConfirm', 'As senhas não conferem')
        } else {
          console.log('[RegisterPage.Step1.Input] Passwords match')
          setFieldError('passwordConfirm', '') // Clear error when passwords match
        }
      }
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
      case 'password':
        return { required: true, password: true }
      case 'passwordConfirm':
        return { required: true, minLength: 8 }
      case 'cpf':
        return { required: false } // CPF is optional
      case 'state':
        return { required: true }
      case 'city':
        return { required: true }
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
    console.log('[RegisterPage.handlePhotoChange] Photo selected:', file?.name)
    
    // Clear previous validation error
    setPhotoValidationError(null)
    
    // Basic validation (size, type)
    const photoError = validatePhoto(file)
    setStep1Data(prev => ({ ...prev, photo: file }))

    if (photoError) {
      console.log('[RegisterPage.handlePhotoChange] Basic validation failed:', photoError)
      setPhotoValidationError(photoError)
      toast.error('Erro na foto', { message: photoError })
      return
    }

    // v1.4.6: Validate photo with AWS Rekognition via backend
    if (file) {
      validatePhotoWithBackend(file)
    }
  }

  const validatePhotoWithBackend = async (file: File) => {
    try {
      setPhotoValidating(true)
      console.log('[RegisterPage.validatePhotoWithBackend] Validating with AWS Rekognition...')
      
      const result = await authService.validatePhoto(file)
      
      if (!result.is_valid) {
        console.log('[RegisterPage.validatePhotoWithBackend] ❌ Photo rejected:', result.message)
        setPhotoValidationError(result.message || 'Foto contém conteúdo impróprio')
        // Clear the photo if validation fails
        setStep1Data(prev => ({ ...prev, photo: null }))
        toast.error('Foto rejeitada', {
          message: result.message || 'A foto contém conteúdo impróprio ou não é apropriada para perfil profissional. Por favor, selecione outra foto.'
        })
      } else {
        console.log('[RegisterPage.validatePhotoWithBackend] ✅ Photo approved')
        setPhotoValidationError(null)
        toast.success('Foto validada', {
          message: 'Sua foto foi validada com sucesso!'
        })
      }
    } catch (error: any) {
      console.error('[RegisterPage.validatePhotoWithBackend] Error:', error)
      setPhotoValidationError('Erro ao validar foto. Tente novamente.')
      toast.error('Erro na validação', {
        message: 'Não foi possível validar a foto. Tente novamente.'
      })
    } finally {
      setPhotoValidating(false)
    }
  }

  const validateStep1Form = (): boolean => {
    let isFormValid = true
    const failedFields: string[] = []

    console.log('[RegisterPage.validateStep1Form] Starting validation')

    // Validate all text fields (except optional CPF field)
    Object.keys(step1Data).forEach(key => {
      if (key !== 'photo' && key !== 'cpf') {
        const fieldKey = key as keyof Step1FormData
        const value = step1Data[fieldKey]
        if (typeof value === 'string') {
          const fieldValid = validate(fieldKey, value, getValidationRules(fieldKey))
          console.log(`[RegisterPage.validateStep1Form] ${fieldKey}: "${value}" => ${fieldValid}`)
          if (!fieldValid) {
            isFormValid = false
            failedFields.push(fieldKey)
          }
        }
      }
    })

    if (failedFields.length > 0) {
      console.log(`[RegisterPage.validateStep1Form] Failed fields: ${failedFields.join(', ')}`)
    }

    // Validate password confirmation
    console.log('[RegisterPage.validateStep1Form] Password comparison:', {
      password: step1Data.password,
      passwordConfirm: step1Data.passwordConfirm,
      match: step1Data.password === step1Data.passwordConfirm
    })
    
    if (step1Data.password !== step1Data.passwordConfirm) {
      console.log('[RegisterPage.validateStep1Form] ❌ Passwords do NOT match!', {
        pass: step1Data.password,
        confirm: step1Data.passwordConfirm
      })
      toast.error('Erro de validação', { message: 'As senhas não conferem' })
      isFormValid = false
    } else {
      console.log('[RegisterPage.validateStep1Form] ✅ Passwords match!')
    }

    // v1.4.6: Check if photo was already validated with backend
    // If there's a validation error from previous check, reject form
    if (photoValidationError) {
      console.log('[RegisterPage.validateStep1Form] ❌ Photo failed validation:', photoValidationError)
      toast.error('Erro na foto', { message: photoValidationError })
      isFormValid = false
    } else {
      // Basic validation only if no backend validation error
      const photoError = validatePhoto(step1Data.photo)
      if (photoError) {
        console.log('[RegisterPage.validateStep1Form] Photo error:', photoError)
        toast.error('Erro na foto', { message: photoError })
        isFormValid = false
      } else if (step1Data.photo) {
        console.log('[RegisterPage.validateStep1Form] ✅ Photo validation passed')
      }
    }

    if (!isFormValid) {
      console.log('[RegisterPage.validateStep1Form] Validation FAILED')
    } else {
      console.log('[RegisterPage.validateStep1Form] Validation PASSED')
    }

    return isFormValid
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    console.log('[RegisterPage.Step1.Submit] ============ FORM SUBMISSION STARTED ============')
    e.preventDefault()
    console.log('[RegisterPage.Step1.Submit] preventDefault called')

    console.log('[RegisterPage.Step1.Submit] Form submission started')
    console.log('[RegisterPage.Step1.Submit] Current step1Data:', step1Data)
    console.log('[RegisterPage.Step1.Submit] Current errors:', errors)

    if (!validateStep1Form()) {
      console.log('[RegisterPage.Step1] Validation failed')
      console.log('[RegisterPage.Step1] Errors object:', errors)
      
      // Build list of missing required fields
      const missingFields: string[] = []
      if (!step1Data.fullName) missingFields.push('Nome completo')
      if (!step1Data.email) missingFields.push('Email')
      if (!step1Data.phone) missingFields.push('Telefone')
      if (!step1Data.state) missingFields.push('Estado')
      if (!step1Data.city) missingFields.push('Cidade')
      if (!step1Data.password) missingFields.push('Senha')
      if (!step1Data.passwordConfirm) missingFields.push('Confirmação de senha')
      
      console.log('[RegisterPage.Step1] Missing fields:', missingFields)
      console.log('[RegisterPage.Step1] Validation errors:', errors)
      
      // Prepare detailed error message
      let errorMsg: string
      if (missingFields.length > 0) {
        errorMsg = `Campos obrigatórios faltando: ${missingFields.join(', ')}`
        console.log('[RegisterPage.Step1] Missing required fields:', missingFields)
      } else if (Object.keys(errors).length > 0) {
        const errorFields = Object.entries(errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(' | ')
        errorMsg = `Erros de validação: ${errorFields}`
        console.log('[RegisterPage.Step1] Validation errors:', errorFields)
      } else {
        errorMsg = 'Por favor, corrija os erros no formulário'
        console.log('[RegisterPage.Step1] Unknown validation error')
      }
      
      console.log('[RegisterPage.Step1] Final error message:', errorMsg)
      toast.error('Validação incompleta', { message: errorMsg })
      return
    }
    
    console.log('[RegisterPage.Step1] Validation passed!')
    setLoading(true)

    try {






      // For now, just show success and navigate to next step
      // In a real implementation, this would validate email uniqueness
      toast.success('Dados validados com sucesso!', {
        message: 'Prosseguindo para o próximo passo...'
      })

      // Store form data for next step (in a real app, this would be in a context or state management)
      // NOTE: We store step1Data directly in state, NOT in sessionStorage, because File objects cannot be serialized
      // The step1Data state is maintained across component lifecycle
      
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
  const addService = (serviceType: string) => {
    // Validation
    if (!serviceType) {
      toast.error('Selecione um tipo de serviço')
      return
    }

    // Check for duplicates
    if (step2Data.services.includes(serviceType)) {
      toast.error('Este tipo de serviço já foi adicionado')
      return
    }

    // Check max services
    if (step2Data.services.length >= 5) {
      toast.error('Máximo de 5 serviços permitidos')
      return
    }

    // Add service to list
    setStep2Data(prev => ({
      ...prev,
      services: [...prev.services, serviceType]
    }))

    toast.success('Serviço adicionado com sucesso!')
  }

  const removeService = (serviceType: string) => {
    setStep2Data(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== serviceType)
    }))
    toast.success('Serviço removido')
  }

  const handleStep2PriceChange = (value: string) => {
    setStep2Data(prev => ({
      ...prev,
      pricePerSession: parseFloat(value) || 0
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

    if (!step2Data.acceptTerms) {
      toast.error('Aceite os Termos e Condições para continuar')
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
      // Prepare data for API - matching backend schema exactly
      
      const registrationData = {
        name: step1Data.fullName,
        email: step1Data.email,
        phone: step1Data.phone,
        password: step1Data.password,
        services: step2Data.services,  // Just the service names array
        price_per_session: step2Data.pricePerSession,  // Single base price
        city: step1Data.city,
        state: step1Data.state,
        attendance_type: step2Data.attendanceType,
        whatsapp: step1Data.phone,
        bio: `Profissional de terapias holísticas especializado em ${step2Data.services.join(', ')}.`,
        ...(step1Data.photo && { photo: step1Data.photo })
      }


      console.log('[RegisterPage.Step2]    Services:', registrationData.services.join(', '))
      console.log('[RegisterPage.Step2]    Price (a partir de):', `R$ ${registrationData.price_per_session}`)


      // Show loading message

      toast.info('Criando seu perfil profissional...', {
        message: 'Por favor, aguarde enquanto processamos seu cadastro.'
      })

      // Use authService.register() which calls /professionals/register/ and returns JWT tokens
      const registerResult = await authService.register({
        email: step1Data.email,
        password: step1Data.password,
        full_name: step1Data.fullName,
        photo: step1Data.photo || undefined,
        services: step2Data.services,  // Just the service names array
        price_per_session: step2Data.pricePerSession,  // Single base price
        attendance_type: step2Data.attendanceType,
        state: step1Data.state,
        city: step1Data.city,
        neighborhood: 'default',
        bio: `Profissional de terapias holísticas especializado em ${step2Data.services.join(', ')}.`,
        whatsapp: step1Data.phone,
      })

      
      // IMPORTANT: Backend no longer returns JWT from register endpoint
      // User must verify email first, then login to get tokens
      console.log('[RegisterPage.Step2] ℹ️ JWT tokens NOT returned from register (user must verify email + login)')

      // Clear session storage (Step 1 data)
      sessionStorage.removeItem('registerStep1')

      // Show success message
      toast.success('Verifique seu e-mail!', {
        message: 'Um link de verificação foi enviado para ' + step1Data.email
      })

      // Store flag indicating user MUST verify email before proceeding
      sessionStorage.setItem('pendingEmailVerification', step1Data.email)

      // Redirect to email verification page with email as query parameter
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(step1Data.email)}`)
      }, 1500)

    } catch (error: any) {




      if (error.response?.status === 400) {
        const errors = error.response.data
        if (errors.email) {
          toast.error('E-mail já cadastrado', {
            message: 'Este e-mail já está sendo usado. Tente fazer login.'
          })
        } else if (errors.password) {
          toast.error('Senha inválida', {
            message: 'Verifique os requisitos de senha.'
          })
        } else {
          toast.error('Dados inválidos', {
            message: 'Verifique os dados informados e tente novamente.'
          })
        }
      } else if (error.response?.status === 409) {
        toast.error('E-mail já cadastrado', {
          message: 'Este e-mail já está sendo usado. Tente fazer login.'
        })
      } else if (error.response?.status === 500) {
        toast.error('Erro no servidor', {
          message: 'Ocorreu um erro interno. Tente novamente em alguns minutos.'
        })
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('Erro de conexão', {
          message: 'Verifique sua conexão com a internet e tente novamente.'
        })
      } else {
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
      className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-4"
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

              {/* CPF (Opcional) - v1.3.14: Only numbers allowed */}
              <FormInput
                label="CPF (Opcional)"
                type="text"
                value={step1Data.cpf}
                onChange={(value) => {
                  // v1.3.14: Remove non-numeric characters
                  const numericOnly = value.replace(/[^0-9]/g, '')
                  handleStep1InputChange('cpf', numericOnly)
                }}
                error={errors.cpf}
                placeholder="00000000000"
              />

              {/* Estado */}
              <FormSelect
                label="Estado"
                value={step1Data.state}
                onChange={(value) => {
                  handleStep1InputChange('state', value)
                  // Reset city when state changes
                  handleStep1InputChange('city', '')
                }}
                options={BRAZILIAN_STATES}
                placeholder="Selecione seu estado"
                error={errors.state}
                required
                helperText="Escolha o estado onde você atua"
              />

              {/* Cidade */}
              <SearchableSelect
                label="Cidade"
                value={step1Data.city}
                onChange={(value) => handleStep1InputChange('city', value)}
                options={cities}
                placeholder={
                  step1Data.state
                    ? citiesLoading
                      ? 'Carregando cidades...'
                      : 'Selecione sua cidade'
                    : 'Selecione um estado primeiro'
                }
                errorText={errors.city || citiesError || undefined}
                disabled={!step1Data.state || citiesLoading}
                isLoading={citiesLoading}
                maxHeight="300px"
              />

              {/* Senha */}
              <div>
                <FormInput
                  label="Senha"
                  type="password"
                  value={step1Data.password}
                  onChange={(value) => handleStep1InputChange('password', value)}
                  error={errors.password}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                {!errors.password && (
                  <p className="text-xs text-subtext-light mt-2">
                    ℹ️ Mínimo 8 caracteres, com letra maiúscula, minúscula e número
                  </p>
                )}
              </div>

              {/* Confirmação de Senha */}
              <FormInput
                label="Confirmar Senha"
                type="password"
                value={step1Data.passwordConfirm}
                onChange={(value) => handleStep1InputChange('passwordConfirm', value)}
                error={errors.passwordConfirm}
                placeholder="Repita sua senha"
                required
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
            /* Step 2: Services & Price */
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Serviços & Preço Base
              </h3>

              {/* v1.3.14: Validation alert removed - only show errors on submit */}
              {/* Removed pre-fill validation warning to reduce user anxiety */}

              {/* Added Services List */}
              {step2Data.services.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Serviços Selecionados:</h4>
                  {step2Data.services.map((service) => (
                    <motion.div
                      key={service}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium text-gray-900">{service}</h5>
                        <button
                          type="button"
                          onClick={() => removeService(service)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Services Selection */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-700 mb-4">Selecionar Serviço:</h4>

                <div className="space-y-4">
                  {/* Service Type Dropdown - v1.3.1: Added feedback for empty services */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Serviço <span className="text-red-500">*</span>
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addService(e.target.value)
                          e.target.value = ''
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        step2Data.services.length === 0 ? 'border-yellow-400' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione um serviço para adicionar</option>
                      {availableServices
                        .filter(service => !step2Data.services.includes(service))
                        .map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                    </select>
                    {step2Data.services.length === 0 && (
                      <p className="text-xs text-yellow-700 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Selecione pelo menos um serviço
                      </p>
                    )}
                  </div>

                  {/* Price Base Input - v1.3.1: Added feedback for empty price */}
                  <div>
                    <FormInput
                      label="Preço Base (a partir de)"
                      type="number"
                      value={step2Data.pricePerSession || ''}
                      onChange={(value) => handleStep2PriceChange(value)}
                      placeholder="Ex: 150.00"
                      min="0"
                      step="0.01"
                      required
                    />
                    {step2Data.pricePerSession === 0 && (
                      <p className="text-xs text-yellow-700 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Insira um preço válido (maior que 0)
                      </p>
                    )}
                  </div>

                  {/* Attendance Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Como você atende? <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={step2Data.attendanceType}
                      onChange={(e) => setStep2Data(prev => ({
                        ...prev,
                        attendanceType: e.target.value as 'presencial' | 'online' | 'ambos'
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="presencial">Presencial</option>
                      <option value="online">Online</option>
                      <option value="ambos">Ambos (Presencial + Online)</option>
                    </select>
                  </div>

                  {/* Terms and Conditions Checkbox */}
                  <div className={`flex items-start gap-3 mt-6 p-4 rounded-lg border-2 transition-all ${
                    step2Data.acceptTerms
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-300'
                  }`}>
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={step2Data.acceptTerms}
                      onChange={(e) => setStep2Data(prev => ({
                        ...prev,
                        acceptTerms: e.target.checked
                      }))}
                      className="w-5 h-5 text-primary rounded cursor-pointer mt-0.5"
                      required
                    />
                    <div className="flex-1">
                      <label htmlFor="acceptTerms" className="text-sm text-gray-700 block cursor-pointer leading-relaxed font-medium">
                        Aceito os{' '}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Termos e Condições
                        </a>
                        {' '}do HolisticMatch <span className="text-red-500">*</span>
                      </label>
                      {!step2Data.acceptTerms && (
                        <p className="text-xs text-yellow-700 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">info</span>
                          Obrigatório para completar o cadastro
                        </p>
                      )}
                    </div>
                  </div>
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
                  onClick={() => {
                    // v1.3.1: Detailed validation with feedback
                    if (step2Data.services.length === 0) {
                      toast.error('Selecione um serviço', {
                        message: 'Você precisa selecionar pelo menos um serviço'
                      })
                      return
                    }
                    if (step2Data.pricePerSession === 0) {
                      toast.error('Insira um preço', {
                        message: 'O preço deve ser maior que 0'
                      })
                      return
                    }
                    if (!step2Data.acceptTerms) {
                      toast.error('Aceite os Termos e Condições', {
                        message: 'Você precisa aceitar os termos para continuar'
                      })
                      return
                    }
                    handleStep2Submit(new Event('submit') as any)
                  }}
                  disabled={loading || step2Data.services.length === 0 || step2Data.pricePerSession === 0 || !step2Data.acceptTerms}
                  whileHover={loading || step2Data.services.length === 0 || step2Data.pricePerSession === 0 || !step2Data.acceptTerms ? {} : { scale: 1.02 }}
                  whileTap={loading || step2Data.services.length === 0 || step2Data.pricePerSession === 0 || !step2Data.acceptTerms ? {} : { scale: 0.98 }}
                  className={`
                    flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200
                    ${loading || step2Data.services.length === 0 || step2Data.pricePerSession === 0 || !step2Data.acceptTerms
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
                    <div className="flex items-center justify-center gap-2">
                      {step2Data.services.length === 0 || step2Data.pricePerSession === 0 || !step2Data.acceptTerms ? (
                        <>
                          <span className="material-symbols-outlined text-sm">info</span>
                          {step2Data.services.length === 0 ? 'Selecione um serviço' : step2Data.pricePerSession === 0 ? 'Insira um preço' : 'Aceite os termos'}
                        </>
                      ) : (
                        'Finalizar Cadastro'
                      )}
                    </div>
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
