/**
 * SearchFilters component
 * Provides filtering controls for professional search
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { itemVariants } from '../lib/animations'
import { SERVICE_TYPES, type ProfessionalFilters } from '../types/Professional'

interface SearchFiltersProps {
  onFilterChange: (filters: ProfessionalFilters) => void
}

const ATTENDANCE_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'online', label: 'Online' },
  { value: 'ambos', label: 'Ambos' },
]

export default function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [filters, setFilters] = useState<ProfessionalFilters>({})

  const handleFilterChange = (key: keyof ProfessionalFilters, value: string | number | undefined) => {
    const newFilters = { ...filters }
    
    if (value === '' || value === undefined) {
      delete newFilters[key]
    } else {
      newFilters[key] = value as any
    }
    
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    setFilters({})
    onFilterChange({})
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-lg shadow-md p-6 mb-8"
    >
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Buscar Profissionais
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Service Type Filter */}
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Serviço
          </label>
          <select
            id="service"
            value={filters.service || ''}
            onChange={(e) => handleFilterChange('service', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Todos os serviços</option>
            {SERVICE_TYPES.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            Cidade
          </label>
          <input
            type="text"
            id="city"
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="Ex: São Paulo"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Attendance Type Filter */}
        <div>
          <label htmlFor="attendance_type" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Atendimento
          </label>
          <select
            id="attendance_type"
            value={filters.attendance_type || ''}
            onChange={(e) => handleFilterChange('attendance_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {ATTENDANCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label htmlFor="price_max" className="block text-sm font-medium text-gray-700 mb-2">
            Preço Máximo
          </label>
          <input
            type="number"
            id="price_max"
            value={filters.price_max || ''}
            onChange={(e) => handleFilterChange('price_max', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Ex: 200"
            min="0"
            step="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Reset Button */}
      {Object.keys(filters).length > 0 && (
        <div className="mt-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-primary hover:text-primary hover:bg-primary/20 rounded-lg transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </motion.div>
  )
}
