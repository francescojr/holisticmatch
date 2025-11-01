/**
 * ProfessionalCard component
 * Displays a professional's summary in a card format
 */
import { motion } from 'framer-motion'
import { itemVariants, contentVariants } from '../lib/animations'
import type { ProfessionalSummary } from '../types/Professional'

interface ProfessionalCardProps {
  professional: ProfessionalSummary
  onClick: () => void
}

const ATTENDANCE_LABELS: Record<string, string> = {
  'presencial': 'Presencial',
  'online': 'Online',
  'ambos': 'Ambos',
}

export default function ProfessionalCard({ professional, onClick }: ProfessionalCardProps) {
  const attendanceLabel = ATTENDANCE_LABELS[professional.attendance_type] || professional.attendance_type

  return (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all cursor-pointer"
    >
      {/* Profile Image */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-200">
        {professional.photo_url ? (
          <img
            src={professional.photo_url}
            alt={professional.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-green-100">
            <span className="text-6xl text-gray-400">👤</span>
          </div>
        )}
        
        {/* Online Sessions Badge */}
        {(professional.attendance_type === 'online' || professional.attendance_type === 'ambos') && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md">
            <span className="material-symbols-outlined !text-sm">videocam</span>
            Online Sessions
          </div>
        )}
      </div>

      {/* Card Content */}
      <motion.div
        variants={contentVariants}
        className="flex flex-1 flex-col p-5"
      >
        {/* Professional Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
          {professional.name}
        </h3>

        {/* Services */}
        <div className="mb-3 flex flex-wrap gap-2">
          {professional.services.slice(0, 2).map((service) => (
            <span
              key={service}
              className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700"
            >
              {service}
            </span>
          ))}
          {professional.services.length > 2 && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
              +{professional.services.length - 2} mais
            </span>
          )}
        </div>

        {/* Location */}
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          <span className="material-symbols-outlined !text-base">location_on</span>
          <span>{professional.city}, {professional.state}</span>
        </div>

        {/* Attendance Type */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="material-symbols-outlined !text-base">
            {professional.attendance_type === 'presencial' ? 'home' : 
             professional.attendance_type === 'online' ? 'videocam' : 'swap_horiz'}
          </span>
          <span>{attendanceLabel}</span>
        </div>

        {/* Price and CTA */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">A partir de</span>
            <span className="text-2xl font-bold text-green-600">
              R$ {Number(professional.price_per_session).toFixed(2).replace('.', ',')}
            </span>
            <span className="text-xs text-gray-500">/sessão</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
          >
            Ver Perfil
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
