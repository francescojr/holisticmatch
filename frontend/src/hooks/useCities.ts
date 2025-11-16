/**
 * useCities Hook
 * Manages loading and caching cities for a given Brazilian state
 * Handles API communication with backend cities endpoint
 */
import { useState, useEffect, useCallback, useMemo } from 'react'
import api from '../services/api'

interface CityOption {
  value: string
  label: string
}

interface UseCitiesReturn {
  cities: CityOption[]
  citiesRaw: string[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Cache for cities to avoid redundant API calls
const cityCache = new Map<string, string[]>()

export const useCities = (state: string | null | undefined): UseCitiesReturn => {
  const [citiesRaw, setCitiesRaw] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Transform raw cities to CityOption format
  const cities = useMemo<CityOption[]>(() => {
    return citiesRaw.map((city) => ({
      value: city,
      label: city,
    }))
  }, [citiesRaw])

  const fetchCities = useCallback(async () => {
    // Don't fetch if state is empty
    if (!state || state.trim() === '') {
      setCitiesRaw([])
      setError(null)
      return
    }

    const stateUpper = state.toUpperCase()

    // Check cache first
    if (cityCache.has(stateUpper)) {
      setCitiesRaw(cityCache.get(stateUpper) || [])
      setError(null)
      setLoading(false)
      return
    }

    // Fetch from API
    setLoading(true)
    setError(null)

    try {
      const response = await api.get(`/professionals/cities/${stateUpper}/`)
      const fetchedCities = response.data.cities || []
      
      // Cache the results
      cityCache.set(stateUpper, fetchedCities)
      
      setCitiesRaw(fetchedCities)
      setError(null)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao carregar cidades'
      setError(errorMessage)
      setCitiesRaw([])
      console.error('Error fetching cities:', err)
    } finally {
      setLoading(false)
    }
  }, [state])

  // Fetch cities when state changes
  useEffect(() => {
    fetchCities()
  }, [fetchCities])

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    // Clear cache for this state to force fresh fetch
    if (state) {
      cityCache.delete(state.toUpperCase())
    }
    await fetchCities()
  }, [state, fetchCities])

  return {
    cities,
    citiesRaw,
    loading,
    error,
    refetch,
  }
}

export default useCities
