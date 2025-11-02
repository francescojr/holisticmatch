/**
 * Professional detail page - Show full profile of a professional
 */
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { pageVariants, itemVariants } from '../lib/animations'
import { useProfessional } from '../hooks/useProfessionals'

function ProfessionalDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: professional, isLoading, error } = useProfessional(Number(id) || 0)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (error || !professional) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">Erro ao carregar profissional</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background-light py-8"
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 mt-8 text-primary hover:text-primary font-semibold flex items-center gap-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Voltar
        </button>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-green-500 h-32" />

          {/* Content */}
          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="flex items-end gap-6 mb-6 -mt-16">
              <img
                src={professional.photo_url || 'https://via.placeholder.com/224'}
                alt={professional.name}
                className="w-56 h-56 rounded-lg border-4 border-white shadow-lg object-cover"
              />
              <div className="pb-2">
                <h1 className="text-3xl font-black text-gray-900">{professional.name}</h1>
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <span className="material-symbols-outlined">location_on</span>
                  <span>
                    {professional.city}, {professional.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {professional.bio && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Sobre</h2>
                <p className="text-gray-600">{professional.bio}</p>
              </div>
            )}

            {/* Services */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Serviços</h2>
              <div className="flex flex-wrap gap-2">
                {professional.services.map((service: string) => (
                  <span
                    key={service}
                    className="px-4 py-2 bg-primary/20 text-gray-900/80 rounded-full text-sm font-medium"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Tipo de Atendimento
                </h3>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {professional.attendance_type === 'presencial'
                    ? 'Presencial'
                    : professional.attendance_type === 'online'
                      ? 'Online'
                      : 'Presencial e Online'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Preço por Sessão
                </h3>
                <p className="text-lg font-semibold text-green-600">
                  R$ {Number(professional.price_per_session).toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex gap-4">
              <button className="flex-1 bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">phone</span>
                WhatsApp
              </button>
              <button className="flex-1 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">mail</span>
                Email
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ProfessionalDetailPage
