/**
 * Edit Professional Profile Page
 * TASK F4: EditProfessionalPage - Formulário de Edição
 * Allows professionals to edit their profiles, services, and photos
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageVariants, itemVariants } from '../lib/animations'
import { useCities } from '../hooks/useCities'
import { useToast } from '../hooks/useToast'
import { FormInput, FileUpload, FormSelect, ToastContainer } from '../components'
import { professionalService } from '../services/professionalService'

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

interface ServiceData {
  id: string
  service_type: string
  price_per_session: number
}

interface ProfileFormData {
  fullName: string
  phone: string
  bio: string
  photo: File | null
  photoUrl: string | null
  state: string
  city: string
  whatsapp: string
  instagram?: string
}

interface FormServices {
  services: ServiceData[]
  newService: {
    service_type: string
    price_per_session: number
  }
}

function EditProfessionalPage() {
  const { id } = useParams<{ id: string }>()
  const { toast, toasts, dismiss } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availableServices, setAvailableServices] = useState<string[]>([])

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    phone: '',
    bio: '',
    photo: null,
    photoUrl: null,
    state: '',
    city: '',
    whatsapp: '',
    instagram: '',
  })

  const { cities, loading: citiesLoading } = useCities(formData.state)

  const [formServices, setFormServices] = useState<FormServices>({
    services: [],
    newService: {
      service_type: '',
      price_per_session: 0
    }
  })

  // Load professional profile and available services
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Load services
        const services = await professionalService.getServiceTypes()
        setAvailableServices(services)

        // Load professional profile
        if (id) {
          const professional = await professionalService.getProfessionalById(parseInt(id))
          
          // Parse services from JSON
          const services_array = professional.services || []
          const parsedServices = services_array.map((service: string, index: number) => ({
            id: `${index}`,
            service_type: service,
            price_per_session: professional.price_per_session
          }))

          setFormData({
            fullName: professional.name || '',
            phone: professional.phone || '',
            bio: professional.bio || '',
            photo: null,
            photoUrl: professional.photo || null,
            state: professional.state || '',
            city: professional.city || '',
            whatsapp: professional.whatsapp || '',
            instagram: '',
          })

          setFormServices({
            services: parsedServices,
            newService: { service_type: '', price_per_session: 0 }
          })
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        toast.error('Erro ao carregar perfil', {
          message: 'Não foi possível carregar seus dados. Tente novamente.'
        })
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleInputChange = (field: keyof ProfileFormData, value: string | File | null) => {
    if (typeof value === 'string' || value === null) {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSelectChange = (field: string, value: string) => {
    handleInputChange(field as keyof ProfileFormData, value)
  }

  const addService = () => {
    const { service_type, price_per_session } = formServices.newService

    if (!service_type) {
      toast.error('Selecione um tipo de serviço')
      return
    }

    if (!price_per_session || price_per_session <= 0) {
      toast.error('Preço deve ser maior que zero')
      return
    }

    if (formServices.services.some(s => s.service_type === service_type)) {
      toast.error('Este tipo de serviço já foi adicionado')
      return
    }

    if (formServices.services.length >= 5) {
      toast.error('Máximo de 5 serviços permitidos')
      return
    }

    const newService: ServiceData = {
      id: Date.now().toString(),
      service_type,
      price_per_session
    }

    setFormServices(prev => ({
      ...prev,
      services: [...prev.services, newService],
      newService: { service_type: '', price_per_session: 0 }
    }))

    toast.success('Serviço adicionado!')
  }

  const removeService = (serviceId: string) => {
    setFormServices(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId)
    }))
    toast.success('Serviço removido')
  }

  const handleServiceInputChange = (field: keyof typeof formServices.newService, value: string | number) => {
    setFormServices(prev => ({
      ...prev,
      newService: {
        ...prev.newService,
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formServices.services.length === 0) {
      toast.error('Adicione pelo menos um serviço')
      return
    }

    setSaving(true)

    try {
      // Prepare update data
      const updateData = {
        name: formData.fullName,
        phone: formData.phone,
        bio: formData.bio,
        state: formData.state,
        city: formData.city,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        services: formServices.services.map(s => s.service_type),
        price_per_session: Math.min(...formServices.services.map(s => s.price_per_session)),
      }

      if (id) {
        // Update professional profile
        await professionalService.updateProfessional(parseInt(id), updateData)

        // Upload photo if changed
        if (formData.photo) {
          await professionalService.uploadProfessionalPhoto(parseInt(id), formData.photo)
        }

        toast.success('Perfil atualizado com sucesso!', {
          message: 'Suas alterações foram salvas.'
        })

        // Redirect back to dashboard
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      }
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error('Erro ao atualizar perfil', {
        message: error.response?.data?.detail || 'Tente novamente.'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-background-light flex items-center justify-center"
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background-light dark:bg-background-dark px-4 py-8"
    >
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Editar Perfil</h1>
        <p className="text-gray-600 mb-8">Atualize suas informações profissionais</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Personal Info Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Informações Pessoais</h2>

            <FormInput
              label="Nome Completo"
              value={formData.fullName}
              onChange={(value: string) => handleInputChange('fullName', value)}
              disabled={saving}
              required
            />

            <FormInput
              label="Telefone"
              type="tel"
              value={formData.phone}
              onChange={(value: string) => handleInputChange('phone', value)}
              disabled={saving}
              required
            />

            <FormInput
              label="WhatsApp"
              type="tel"
              value={formData.whatsapp}
              onChange={(value: string) => handleInputChange('whatsapp', value)}
              disabled={saving}
            />

            <FormInput
              label="Instagram (opcional)"
              value={formData.instagram || ''}
              onChange={(value: string) => handleInputChange('instagram', value)}
              placeholder="@seu_perfil"
              disabled={saving}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                rows={4}
                disabled={saving}
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4 pt-6 border-t">
            <h2 className="text-xl font-semibold text-gray-900">Localização</h2>

            <FormSelect
              label="Estado"
              value={formData.state}
              onChange={(value: string) => handleSelectChange('state', value)}
              options={BRAZILIAN_STATES}
              disabled={saving}
              required
            />

            <FormSelect
              label="Cidade"
              value={formData.city}
              onChange={(value: string) => handleSelectChange('city', value)}
              options={cities}
              disabled={saving || citiesLoading}
              required
            />
          </div>

          {/* Photo Section */}
          <div className="space-y-4 pt-6 border-t">
            <h2 className="text-xl font-semibold text-gray-900">Foto de Perfil</h2>

            {formData.photoUrl && !formData.photo && (
              <div className="relative">
                <img
                  src={formData.photoUrl}
                  alt="Foto atual"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-2">Foto atual. Selecione uma nova para alterá-la.</p>
              </div>
            )}

            <FileUpload
              label="Nova foto"
              value={formData.photo}
              onChange={(file: File | null) => handleInputChange('photo', file)}
              accept="image/*"
            />
          </div>

          {/* Services Section */}
          <div className="space-y-4 pt-6 border-t">
            <h2 className="text-xl font-semibold text-gray-900">Serviços Oferecidos</h2>

            <div className="space-y-2">
              <FormSelect
                label="Tipo de Serviço"
                value={formServices.newService.service_type}
                onChange={(value: string) => handleServiceInputChange('service_type', value)}
                options={availableServices}
                disabled={saving}
              />

              <FormInput
                label="Preço por Sessão (R$)"
                type="number"
                value={formServices.newService.price_per_session.toString()}
                onChange={(value: string) => handleServiceInputChange('price_per_session', parseFloat(value))}
                min="0"
                step="0.01"
                disabled={saving}
              />

              <button
                type="button"
                onClick={addService}
                disabled={saving}
                className="w-full bg-gray-200 text-gray-900 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Adicionar Serviço
              </button>
            </div>

            {/* Services List */}
            <div className="space-y-2">
              {formServices.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{service.service_type}</p>
                    <p className="text-sm text-gray-600">R$ {(typeof service.price_per_session === 'string' ? parseFloat(service.price_per_session) : service.price_per_session).toFixed(2)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeService(service.id)}
                    disabled={saving}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Section */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              disabled={saving}
              className="flex-1 bg-gray-200 text-gray-900 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default EditProfessionalPage
