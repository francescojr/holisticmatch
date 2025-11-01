import { useState } from 'react'
import { motion } from 'framer-motion'
import { containerVariants, fadeInVariants } from '../lib/animations'
import { useProfessionals, useProfessional } from '../hooks/useProfessionals'
import SearchFilters from '../components/SearchFilters'
import ProfessionalCard from '../components/ProfessionalCard'
import ProfessionalModal from '../components/ProfessionalModal'
import type { ProfessionalFilters } from '../types/Professional'

function HomePage() {
  const [filters, setFilters] = useState<ProfessionalFilters>({})
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null)
  
  const { data: professionalsData, isLoading, error } = useProfessionals(filters)
  const { data: selectedProfessional } = useProfessional(selectedProfessionalId || 0)

  const handleFilterChange = (newFilters: ProfessionalFilters) => {
    setFilters(newFilters)
  }

  const handleCardClick = (id: number) => {
    setSelectedProfessionalId(id)
  }

  const handleCloseModal = () => {
    setSelectedProfessionalId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
              <span className="material-symbols-outlined text-2xl">spa</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              HolisticMatch
            </h1>
          </div>
          <div className="flex gap-3">
            <button className="rounded-lg bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-100">
              Para Profissionais
            </button>
            <button className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600">
              Entrar
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-green-500 py-20 text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl mb-4">
            Encontre Seu Caminho para o Bem-Estar
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-purple-50">
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

      {/* Professional Detail Modal */}
      <ProfessionalModal
        professional={selectedProfessional || null}
        isOpen={selectedProfessionalId !== null}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default HomePage
