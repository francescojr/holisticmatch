import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { containerVariants, fadeInVariants, scrollItemVariants } from '../lib/animations'
import { useProfessionals } from '../hooks/useProfessionals'
import { useSequentialAnimation } from '../hooks/useSequentialAnimation'
import SearchFilters from '../components/SearchFilters'
import ProfessionalCard from '../components/ProfessionalCard'
import type { ProfessionalFilters } from '../types/Professional'

// Import hero images
import hero01 from '../assets/images/hero01.jpg'
import hero02 from '../assets/images/hero02.jpg'

function HomePage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ProfessionalFilters>({})
  const [heroImage, setHeroImage] = useState<string>(hero01) // Default to first image
  
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, -150]) // Parallax effect
  
  const { data: professionalsData, isLoading, error } = useProfessionals(filters)
  const { containerRef, isContainerVisible } = useSequentialAnimation<HTMLDivElement>()

  // Select random hero image on component mount
  useEffect(() => {
    const images = [hero01, hero02]
    const randomImage = images[Math.floor(Math.random() * images.length)] || hero01
    setHeroImage(randomImage)
  }, [])

  const handleFilterChange = (newFilters: ProfessionalFilters) => {
    setFilters(newFilters)
  }

  const handleCardClick = (id: number) => {
    navigate(`/professionals/${id}`)
  }

  return (
    <div className="bg-background-light">
      {/* Hero Section with Parallax */}
      <section className="relative h-[400px] overflow-hidden">
        {/* Parallax Background Image */}
        {heroImage && (
          <motion.div 
            className="absolute inset-0"
            style={{ y }}
          >
            <img
              src={heroImage}
              alt="HolisticMatch Hero"
              className="w-full h-full object-cover object-center"
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        )}

        {/* Hero Content */}
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex items-center justify-center h-full text-white"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl mb-4">
              Encontre Seu Caminho para o Bem-Estar
            </h2>
            <p className="mx-auto max-w-2xl text-gray-200 text-lg sm:text-xl">
              Descubra profissionais de terapias holísticas confiáveis perto de você. 
              Comece sua jornada para uma vida equilibrada hoje.
            </p>
          </div>
        </motion.div>
      </section>

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
          <div
            ref={containerRef}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {professionalsData.results.map((professional, index) => (
              <motion.div
                key={professional.id}
                variants={scrollItemVariants(index)}
                initial="hidden"
                animate={isContainerVisible ? "visible" : "hidden"}
                onClick={() => handleCardClick(professional.id)}
                style={{
                  transition: 'transform 0.3s ease-out !important',
                  transform: 'scale(1)'
                }}
                className="cursor-pointer hover:!scale-105"
              >
                <ProfessionalCard professional={professional} />
              </motion.div>
            ))}
          </div>
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
