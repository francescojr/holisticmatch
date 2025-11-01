/**
 * ProfessionalModal component
 * Displays detailed professional profile in a modal
 */
import { motion, AnimatePresence } from 'framer-motion'
import { modalVariants } from '../lib/animations'
import type { Professional } from '../types/Professional'

interface ProfessionalModalProps {
  professional: Professional | null
  isOpen: boolean
  onClose: () => void
}

const ATTENDANCE_LABELS: Record<string, string> = {
  'presencial': 'Presencial',
  'online': 'Online',
  'ambos': 'Ambos',
}

export default function ProfessionalModal({ professional, isOpen, onClose }: ProfessionalModalProps) {
  if (!professional) return null

  const attendanceLabel = ATTENDANCE_LABELS[professional.attendance_type] || professional.attendance_type

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Olá ${professional.name}, encontrei seu perfil no HolisticMatch e gostaria de agendar uma sessão.`
    )
    window.open(`https://wa.me/${professional.whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank')
  }

  const handleEmailClick = () => {
    window.location.href = `mailto:${professional.email}?subject=Agendamento de Sessão`
  }

  const handlePhoneClick = () => {
    window.location.href = `tel:${professional.phone}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md transition-colors hover:bg-white hover:text-gray-900"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              {/* Header with Photo */}
              <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-purple-100 to-green-100">
                {professional.photo_url ? (
                  <img
                    src={professional.photo_url}
                    alt={professional.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-9xl text-gray-400">👤</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                {/* Professional Name & Title */}
                <div className="mb-6">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    {professional.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined !text-lg">location_on</span>
                      <span>{professional.city}, {professional.state}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined !text-lg">
                        {professional.attendance_type === 'presencial' ? 'home' : 
                         professional.attendance_type === 'online' ? 'videocam' : 'swap_horiz'}
                      </span>
                      <span>{attendanceLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Serviços Oferecidos</h3>
                  <div className="flex flex-wrap gap-2">
                    {professional.services.map((service) => (
                      <span
                        key={service}
                        className="inline-flex items-center rounded-full bg-primary/20 px-4 py-2 text-sm font-semibold text-primary"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Sobre Mim</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {professional.bio}
                  </p>
                </div>

                {/* Pricing */}
                <div className="mb-8 rounded-xl bg-green-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Investimento por sessão</p>
                      <p className="text-4xl font-black text-green-600">
                        R$ {professional.price_per_session.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div className="text-center">
                      <span className="material-symbols-outlined text-5xl text-green-500">payments</span>
                    </div>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Entre em Contato</h3>
                  
                  {/* WhatsApp */}
                  {professional.whatsapp && (
                    <button
                      onClick={handleWhatsAppClick}
                      className="flex w-full items-center justify-center gap-3 rounded-xl bg-green-500 px-6 py-4 text-white font-bold transition-colors hover:bg-green-600"
                    >
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span>Conversar no WhatsApp</span>
                    </button>
                  )}

                  {/* Email */}
                  <button
                    onClick={handleEmailClick}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-primary bg-white px-6 py-4 text-purple-600 font-bold transition-colors hover:bg-primary/20"
                  >
                    <span className="material-symbols-outlined">email</span>
                    <span>Enviar Email</span>
                  </button>

                  {/* Phone */}
                  {professional.phone && (
                    <button
                      onClick={handlePhoneClick}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-300 bg-white px-6 py-4 text-gray-700 font-bold transition-colors hover:bg-gray-50"
                    >
                      <span className="material-symbols-outlined">phone</span>
                      <span>Ligar: {professional.phone}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
