import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { containerVariants, fadeInVariants } from '../lib/animations'
import { useProfessionals } from '../hooks/useProfessionals'
import SearchFilters from '../components/SearchFilters'
import ProfessionalCard from '../components/ProfessionalCard'
import type { ProfessionalFilters } from '../types/Professional'

function HomePage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ProfessionalFilters>({})
  
  const { data: professionalsData, isLoading, error } = useProfessionals(filters)

  const handleFilterChange = (newFilters: ProfessionalFilters) => {
    setFilters(newFilters)
  }

  const handleCardClick = (id: number) => {
    navigate(`/professionals/${id}`)
  }

  return (
    <div className="bg-background-light dark:bg-background-dark">
      {/* Hero Section */}
      <motion.section
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden bg-background-light dark:bg-background-dark py-20 text-gray-900 dark:text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl mb-4">
            Encontre Seu Caminho para o Bem-Estar
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
            Descubra profissionais de terapias holísticas confiáveis perto de você. 
            Comece sua jornada para uma vida equilibrada hoje.
          </p>
        </div>
      </motion.section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Filters */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <SearchFilters onFilterChange={handleFilterChange} />
        </motion.div>

        {/* Results */}
        <div className="mb-6">
          {professionalsData && (
            <p className="text-lg font-semibold text-gray-700">
              {professionalsData.count} {professionalsData.count === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
              <p className="text-gray-600">Carregando profissionais...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <span className="material-symbols-outlined text-5xl text-red-500 mb-2">error</span>
            <p className="text-red-700 font-semibold">Erro ao carregar profissionais</p>
            <p className="text-red-600 text-sm mt-2">{error.message}</p>
          </div>
        )}

        {/* Professionals Grid */}
        {professionalsData && professionalsData.results && professionalsData.results.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {professionalsData.results.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                onClick={() => handleCardClick(professional.id)}
              />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {professionalsData && professionalsData.results && professionalsData.results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-9xl text-gray-300 mb-4">search_off</span>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Nenhum profissional encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Tente ajustar seus filtros de busca
            </p>
            <button
              onClick={() => setFilters({})}
              className="rounded-lg bg-purple-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-600"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default HomePage
