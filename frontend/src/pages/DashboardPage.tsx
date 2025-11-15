/**
 * Dashboard page for professionals
 * Edit profile, services, pricing
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageVariants, itemVariants } from '../lib/animations'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useFormValidation } from '../hooks/useFormValidation'
import { useConfirm } from '../hooks/useConfirm'
import { professionalService } from '../services/professionalService'
import { DashboardSkeleton } from '../components/LoadingSkeleton'
import FormInput from '../components/forms/FormInput'
import FormTextarea from '../components/forms/FormTextarea'
import ConfirmDialog from '../components/ConfirmDialog'
import { useDeleteProfessional } from '../hooks/useDeleteProfessional'
import type { Professional } from '../types/Professional'
import { SERVICE_TYPES } from '../types/Professional'

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { confirmState } = useConfirm()
  const deleteProfessional = useDeleteProfessional()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [hasConflicts, setHasConflicts] = useState(false)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    professionalTitle: '',
    location: '',
    email: '',
    phone: '',
    bio: '',
    attendanceType: 'presencial' as 'presencial' | 'online' | 'ambos',
    services: [] as string[]
  })

  const [originalData, setOriginalData] = useState(formData)
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null)

  // Form validation
  const { errors, validate, validateAll, clearErrors } = useFormValidation()

  // Load professional data on component mount
  useEffect(() => {
    const loadProfessionalData = async () => {
      if (!user?.professional_id) {
        setError('ID do profissional não encontrado. Faça login novamente.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const data = await professionalService.getProfessionalById(user.professional_id)

        // Update form data with loaded professional data
        setProfessional(data)
        setOriginalPhotoUrl(data.photo_url)
        setFormData({
          fullName: data.name,
          professionalTitle: data.services?.[0] || 'Profissional',
          location: `${data.city}, ${data.state}`,
          email: data.email,
          phone: data.phone || data.whatsapp || '',
          bio: data.bio,
          attendanceType: data.attendance_type || 'presencial',
          services: (Array.isArray(data.services) ? data.services : []) as string[]
        })
        setOriginalData({
          fullName: data.name,
          professionalTitle: data.services?.[0] || 'Profissional',
          location: `${data.city}, ${data.state}`,
          email: data.email,
          phone: data.phone || data.whatsapp || '',
          bio: data.bio,
          attendanceType: data.attendance_type || 'presencial',
          services: (Array.isArray(data.services) ? data.services : []) as string[]
        })

      } catch (err: any) {
        console.error('Error loading professional data:', err)

        if (err.response?.status === 401) {
          setError('Sessão expirada. Faça login novamente.')
          toast.error('Sessão expirada', {
            message: 'Sua sessão expirou. Faça login novamente.'
          })
        } else if (err.response?.status === 403) {
          setError('Você não tem permissão para acessar estes dados.')
          toast.error('Acesso negado', {
            message: 'Você só pode acessar seus próprios dados.'
          })
        } else if (err.response?.status === 404) {
          setError('Perfil profissional não encontrado.')
          toast.error('Perfil não encontrado', {
            message: 'Seu perfil profissional não foi encontrado.'
          })
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          setError('Erro de conexão. Verifique sua internet.')
          toast.error('Erro de conexão', {
            message: 'Não foi possível conectar ao servidor. Verifique sua conexão.'
          })
        } else {
          setError('Erro ao carregar dados. Tente novamente.')
          toast.error('Erro ao carregar dados', {
            message: err.message || 'Ocorreu um erro inesperado.'
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProfessionalData()
  }, [user?.professional_id])

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadPhotoNow = async () => {
    if (!selectedPhoto || !professional) return
    
    setIsUploadingPhoto(true)
    try {
      await professionalService.uploadProfessionalPhoto(professional.id, selectedPhoto)
      toast.success('Foto enviada com sucesso!')
      
      // Reload professional data to get updated photo URL
      const updated = await professionalService.getProfessionalById(professional.id)
      setProfessional(updated)
      setOriginalPhotoUrl(updated.photo_url)
      setSelectedPhoto(null)
      setPhotoPreview(null)
    } catch (error: any) {
      toast.error('Erro ao enviar foto', {
        message: error.message || 'Tente novamente'
      })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast.success('Desconectado com sucesso', {
        message: 'Até logo!'
      })
      // Redirect to home after short delay
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
      toast.error('Erro ao desconectar', {
        message: 'Tente novamente'
      })
    }
  }

  // Handle form field changes with validation
  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })

    // Validate field
    let rules = {}
    switch (field) {
      case 'fullName':
        rules = { required: true, minLength: 2, maxLength: 100 }
        break
      case 'email':
        rules = { required: true, email: true }
        break
      case 'phone':
        rules = { required: true, phone: true }
        break
      case 'bio':
        rules = { required: true, minLength: 10, maxLength: 500 }
        break
      case 'location':
        rules = { required: true, minLength: 3, maxLength: 100 }
        break
    }
    validate(field, value, rules)
  }

  // Cancel editing and restore original data
  const cancelEditing = () => {
    setFormData(originalData)
    setPhotoPreview(null)
    setSelectedPhoto(null)
    setIsUploadingPhoto(false)
    setHasConflicts(false)
    setIsEditing(false)
    clearErrors()
  }

  // Detect changes between current form data and original data
  const detectChanges = () => {
    const changes: Partial<typeof formData> = {}

    if (formData.fullName !== originalData.fullName) changes.fullName = formData.fullName
    if (formData.email !== originalData.email) changes.email = formData.email
    if (formData.phone !== originalData.phone) changes.phone = formData.phone
    if (formData.bio !== originalData.bio) changes.bio = formData.bio
    if (formData.location !== originalData.location) changes.location = formData.location
    if (formData.attendanceType !== originalData.attendanceType) changes.attendanceType = formData.attendanceType

    // Check if services changed
    const servicesChanged = JSON.stringify(formData.services) !== JSON.stringify(originalData.services)
    if (servicesChanged) changes.services = formData.services

    return changes
  }

  // Check for concurrent modification conflicts
  const checkForConflicts = async () => {
    if (!user?.professional_id || !professional?.updated_at) return false

    try {
      const currentData = await professionalService.getProfessionalById(user.professional_id)
      const serverUpdatedAt = new Date(currentData.updated_at)
      const localUpdatedAt = new Date(professional.updated_at)

      if (serverUpdatedAt > localUpdatedAt) {
        setHasConflicts(true)
        toast.error('Dados desatualizados', {
          message: 'Este perfil foi modificado por outra pessoa. Recarregue a página para ver as últimas alterações.'
        })
        return true
      }

      return false
    } catch (err) {
      console.error('Error checking for conflicts:', err)
      return false
    }
  }

  // Save changes
  const saveChanges = async () => {
    if (!user?.professional_id) return

    // Check for conflicts first
    const hasConflict = await checkForConflicts()
    if (hasConflict) return

    // Validate all fields
    const fieldsToValidate = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      location: formData.location
    }

    const fieldRules = {
      fullName: { required: true, minLength: 2, maxLength: 100 },
      email: { required: true, email: true },
      phone: { required: true, phone: true },
      bio: { required: true, minLength: 10, maxLength: 500 },
      location: { required: true, minLength: 3, maxLength: 100 }
    }

    const validation = validateAll(fieldsToValidate, fieldRules)

    if (!validation.isValid) {
      toast.error('Dados inválidos', {
        message: 'Por favor, corrija os erros no formulário.'
      })
      return
    }

    // Validate services
    if (formData.services.length === 0) {
      toast.error('Serviços obrigatórios', {
        message: 'Você deve ter pelo menos um serviço cadastrado.'
      })
      return
    }

    try {
      setIsSaving(true)

      // Detect what actually changed to send minimal data
      const changes = detectChanges()

      // If no changes detected, just exit
      if (Object.keys(changes).length === 0) {
        toast.info('Nenhuma alteração', {
          message: 'Não há mudanças para salvar.'
        })
        setIsEditing(false)
        return
      }

      // Parse location if it changed
      const [city, state] = formData.location.split(',').map(s => s.trim())

      // Prepare update data with only changed fields
      const updateData: any = {}

      if (changes.fullName) updateData.name = changes.fullName
      if (changes.email) updateData.email = changes.email
      if (changes.phone) updateData.phone = changes.phone
      if (changes.bio) updateData.bio = changes.bio
      if (changes.location) {
        updateData.city = city || ''
        updateData.state = state || ''
      }
      if (changes.attendanceType) updateData.attendance_type = changes.attendanceType
      if (changes.services) {
        updateData.services = changes.services
      }

      // Always include photo_url if it was updated separately
      if (professional?.photo_url && professional.photo_url !== originalPhotoUrl) {
        updateData.photo_url = professional.photo_url
      }

      // Update professional with minimal data
      const updatedProfessional = await professionalService.updateProfessional(user.professional_id, updateData)

      // Update local state
      setProfessional(updatedProfessional)
      setOriginalData(formData)
      setHasConflicts(false)
      setIsEditing(false)

      toast.success('Perfil atualizado!', {
        message: 'Suas informações foram salvas com sucesso.'
      })

    } catch (err: any) {
      console.error('Error updating professional:', err)

      if (err.response?.status === 400) {
        toast.error('Dados inválidos', {
          message: 'Verifique os dados informados e tente novamente.'
        })
      } else if (err.response?.status === 403) {
        toast.error('Acesso negado', {
          message: 'Você não tem permissão para editar este perfil.'
        })
      } else if (err.response?.status === 409) {
        // Conflict - concurrent modification
        setHasConflicts(true)
        toast.error('Conflito de edição', {
          message: 'Este perfil foi modificado por outra pessoa. Recarregue a página e tente novamente.'
        })
      } else if (err.response?.status === 412) {
        // Precondition failed - version conflict
        setHasConflicts(true)
        toast.error('Versão desatualizada', {
          message: 'Os dados foram modificados. Recarregue a página para ver as últimas alterações.'
        })
      } else {
        toast.error('Erro ao salvar', {
          message: 'Ocorreu um erro inesperado. Tente novamente.'
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display bg-background-light">
      {/* Header is already included in App.tsx */}

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
        {isLoading ? (
          <DashboardSkeleton />
        ) : error ? (
          <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center min-h-[400px] text-center"
          >
            <div className="text-red-500 mb-4">
              <span className="material-symbols-outlined text-6xl">error</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Erro ao carregar dados
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              Tentar Novamente
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Sidebar */}
            <aside className="lg:col-span-3">
              <div className="sticky top-28 flex flex-col gap-6">
                <div className="flex flex-col items-center text-center gap-4 p-4">
                  <div className="relative group">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-28 border-4 border-white dark:border-slate-700 shadow-md"
                      style={{
                        backgroundImage: professional?.photo_url
                          ? `url("${professional.photo_url}")`
                          : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCmmERGYXMdWyDRvCoMoGT8wsCudBrbcqSIyW7aVAFFhZmAjIf7cawAN9cz4qtkbkp5hWVpNEfsDFb0ox5R6LDbAMG9jC04rW3Y1fUJT32nzxtKcorXCNwRBGJWp8JXy8lIPNURFkIcK-FzlxDiUi3xW3VwYLx48oD6NdIbab5otxoTAGRhgy8oGvbM_IZ0hy_gmrHZt7fGoORiSyiMOKfNegkWqEqtE_VJimkFugFQG7AwPgs4Wl7AHWmmy43ZKp0rFaoOMyDq5w")'
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="material-symbols-outlined text-white text-3xl">edit</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-[#111814] dark:text-white text-xl font-bold leading-normal">{formData.fullName}</h1>
                    <p className="text-[#618975] dark:text-gray-400 text-base font-normal leading-normal">{formData.professionalTitle}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg ${
                      activeTab === 'profile'
                        ? 'bg-[#f0f4f2] dark:bg-primary/20'
                        : 'hover:bg-[#f0f4f2] dark:hover:bg-primary/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[#111814] dark:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    <p className="text-[#111814] dark:text-white text-sm font-medium leading-normal">Edit Profile</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg ${
                      activeTab === 'settings'
                        ? 'bg-[#f0f4f2] dark:bg-primary/20'
                        : 'hover:bg-[#f0f4f2] dark:hover:bg-primary/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[#111814] dark:text-white">settings</span>
                    <p className="text-[#111814] dark:text-white text-sm font-medium leading-normal">Account Settings</p>
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-9">
              <div className="flex flex-col gap-8">
                {activeTab === 'profile' && (
                  <>
                    {/* Profile Card */}
                    <motion.div
                      variants={itemVariants}
                      className="bg-white dark:bg-slate-800 rounded-xl border border-[#dbe6e0] dark:border-slate-700 p-8"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h1 className="text-[#111814] dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Edit Profile</h1>
                          <p className="text-[#618975] dark:text-gray-400 text-base font-normal leading-normal">Update your professional information</p>
                          {hasConflicts && (
                            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-lg">warning</span>
                                <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                                  Dados desatualizados - Este perfil foi modificado recentemente. Recarregue a página para ver as últimas alterações.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3">
                          {isEditing ? (
                            <>
                              <button
                                onClick={cancelEditing}
                                disabled={isSaving}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveChanges}
                                disabled={isSaving}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                              >
                                {isSaving && (
                                  <motion.span
                                    className="material-symbols-outlined text-sm"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    refresh
                                  </motion.span>
                                )}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                            >
                              Edit Profile
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Profile Form */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <FormInput
                          label="Full Name"
                          type="text"
                          value={formData.fullName}
                          onChange={(value) => handleFieldChange('fullName', value)}
                          error={errors.fullName}
                          disabled={!isEditing || isSaving}
                          required
                          placeholder="Seu nome completo"
                        />
                        <FormInput
                          label="Professional Title"
                          type="text"
                          value={formData.professionalTitle}
                          onChange={(value) => handleFieldChange('professionalTitle', value)}
                          error={errors.professionalTitle}
                          disabled={!isEditing || isSaving}
                          required
                          placeholder="Ex: Personal Trainer, Nutricionista"
                        />
                        <FormInput
                          label="Email"
                          type="email"
                          value={formData.email}
                          onChange={(value) => handleFieldChange('email', value)}
                          error={errors.email}
                          disabled={!isEditing || isSaving}
                          required
                          placeholder="seu@email.com"
                        />
                        <FormInput
                          label="Phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(value) => handleFieldChange('phone', value)}
                          error={errors.phone}
                          disabled={!isEditing || isSaving}
                          required
                          placeholder="(11) 99999-9999"
                        />
                        <FormInput
                          label="Location"
                          type="text"
                          value={formData.location}
                          onChange={(value) => handleFieldChange('location', value)}
                          error={errors.location}
                          disabled={!isEditing || isSaving}
                          required
                          placeholder="City, State"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Como você atende? *
                          </label>
                          <select
                            value={formData.attendanceType}
                            onChange={(e) => handleFieldChange('attendanceType', e.target.value)}
                            disabled={!isEditing || isSaving}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a2e22] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="presencial">Presencial</option>
                            <option value="online">Online</option>
                            <option value="ambos">Ambos (Presencial + Online)</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-6">
                        <FormTextarea
                          label="Bio"
                          value={formData.bio}
                          onChange={(value) => handleFieldChange('bio', value)}
                          error={errors.bio}
                          maxLength={500}
                          minLength={10}
                          disabled={!isEditing || isSaving}
                          required
                          showCounter={true}
                        />
                      </div>

                      {/* Services Selection */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Serviços que você oferece *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {SERVICE_TYPES.map((service) => (
                            <button
                              key={service}
                              type="button"
                              onClick={() => handleServiceToggle(service)}
                              disabled={!isEditing || isSaving}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                formData.services.includes(service)
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-200 dark:bg-[#1a2e22] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#244032]'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {service}
                            </button>
                          ))}
                        </div>
                        {formData.services.length === 0 && isEditing && (
                          <p className="text-red-500 text-sm mt-2">Selecione pelo menos um serviço</p>
                        )}
                      </div>

                      {/* Photo Upload Section */}
                      <div className="mb-6">
                        <p className="text-[#111814] dark:text-gray-300 text-sm font-medium leading-normal pb-3">Profile Photo</p>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div
                              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-20 border-4 border-white dark:border-[#2a3f34] shadow-md"
                              style={{
                                backgroundImage: photoPreview
                                  ? `url("${photoPreview}")`
                                  : professional?.photo_url
                                    ? `url("${professional.photo_url}")`
                                    : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCmmERGYXMdWyDRvCoMoGT8wsCudBrbcqSIyW7aVAFFhZmAjIf7cawAN9cz4qtkbkp5hWVpNEfsDFb0ox5R6LDbAMG9jC04rW3Y1fUJT32nzxtKcorXCNwRBGJWp8JXy8lIPNURFkIcK-FzlxDiUi3xW3VwYLx48oD6NdIbab5otxoTAGRhgy8oGvbM_IZ0hy_gmrHZt7fGoORiSyiMOKfNegkWqEqtE_VJimkFugFQG7AwPgs4Wl7AHWmmy43ZKp0rFaoOMyDq5w")'
                              }}
                            ></div>
                            {isEditing && !isUploadingPhoto && (
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-1 -right-1 bg-primary hover:bg-primary/90 text-white rounded-full p-2 shadow-md transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                            )}
                            {isUploadingPhoto && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                <motion.span
                                  className="material-symbols-outlined text-white text-lg"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  refresh
                                </motion.span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {isUploadingPhoto
                                ? 'Enviando foto...'
                                : selectedPhoto
                                  ? `Selecionado: ${selectedPhoto.name} (${(selectedPhoto.size / 1024 / 1024).toFixed(1)}MB)`
                                  : 'Clique no botão editar para alterar sua foto de perfil'
                              }
                            </p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoSelect}
                              className="hidden"
                              disabled={!isEditing || isSaving || isUploadingPhoto}
                            />
                            <div className="flex gap-2">
                              {selectedPhoto && !isUploadingPhoto && (
                                <>
                                  <button
                                    onClick={uploadPhotoNow}
                                    className="text-sm bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded transition-colors"
                                  >
                                    Enviar Foto
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedPhoto(null)
                                      setPhotoPreview(null)
                                      if (fileInputRef.current) fileInputRef.current.value = ''
                                    }}
                                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Services Card */}
                    {/* REMOVED - Services integrated into Profile card */}
                  </>
                )}

                {activeTab === 'settings' && (
                  <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-[#1a2e22] rounded-xl border border-[#dbe6e0] dark:border-[#2a3f34] p-8"
                  >
                    <h1 className="text-[#111814] dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em] mb-6">Account Settings</h1>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-background-light dark:bg-[#102219] border border-gray-200 dark:border-[#2a3f34]">
                        <div>
                          <h3 className="text-[#111814] dark:text-white text-lg font-semibold">Edit Profile</h3>
                          <p className="text-[#618975] dark:text-gray-400 text-sm">Access the full profile editing page with additional options</p>
                        </div>
                        <button
                          onClick={() => window.location.href = `/edit/${user?.professional_id}`}
                          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                        >
                          Edit Profile
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                        <div>
                          <h3 className="text-red-800 dark:text-red-200 text-lg font-semibold">Delete Account</h3>
                          <p className="text-red-600 dark:text-red-400 text-sm">Permanently delete your account and all associated data</p>
                        </div>
                        <button
                          onClick={() => deleteProfessional.openDeleteConfirm(user?.professional_id || 0, formData.fullName)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Delete Account
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800">
                        <div>
                          <h3 className="text-orange-800 dark:text-orange-200 text-lg font-semibold">Logout</h3>
                          <p className="text-orange-600 dark:text-orange-400 text-sm">Sign out from your account on this device</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isLoggingOut && (
                            <motion.span
                              className="material-symbols-outlined text-sm"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              refresh
                            </motion.span>
                          )}
                          {isLoggingOut ? 'Saindo...' : 'Logout'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </main>
          </motion.div>
        )}
      </main>

      {/* Modals Removed - Services integrated into Profile card */}

      {/* Confirm Dialog */}
      {confirmState && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          type={confirmState.type}
          onConfirm={confirmState.onConfirm}
          onCancel={confirmState.onCancel}
        />
      )}

      {/* Delete Account Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteProfessional.isOpen}
        title="Delete Account"
        message={`Are you sure you want to delete your account "${deleteProfessional.deletingProfessionalName}"? This action cannot be undone and will permanently remove all your data.`}
        confirmText="Delete Account"
        cancelText="Cancel"
        type="danger"
        onConfirm={deleteProfessional.handleDeleteConfirm}
        onCancel={deleteProfessional.closeDeleteConfirm}
      />
    </div>
  )
}

export default DashboardPage
