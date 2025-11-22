/**
 * Professionals data fetching hooks
 * Uses React Query for caching and state management
 */
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { professionalService } from '../services/professionalService'
import type {
  Professional,
  ProfessionalListResponse,
  ProfessionalFilters,
} from '../types/Professional'

/**
 * Fetch paginated list of professionals with optional filters
 */
export function useProfessionals(
  filters?: ProfessionalFilters
): UseQueryResult<ProfessionalListResponse, Error> {
  return useQuery({
    queryKey: ['professionals', filters],
    queryFn: async () => {
      console.log('[useProfessionals] 🔄 Fetching professionals with filters:', filters)
      const data = await professionalService.getProfessionals(filters)
      console.log('[useProfessionals] ✅ API returned:', data.count, 'professionals')
      console.log('[useProfessionals] 📋 Results:', data.results.map(p => `${p.name} (ID: ${p.id}) - is_active: ${p.is_active}, na_contencao: ${p.na_contencao}`))
      return data
    },
    staleTime: 1000, // v1.2.0: 1 second cache - allows batching, fresh data on next interaction
    gcTime: 5 * 60 * 1000, // v1.2.0: 5 minutes - keep cache for tab switches
    retry: 1, // Retry once on failure
  })
}

/**
 * Fetch single professional by ID
 */
export function useProfessional(
  id: number
): UseQueryResult<Professional, Error> {
  return useQuery({
    queryKey: ['professional', id],
    queryFn: () => professionalService.getProfessionalById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: id > 0, // Only fetch if valid ID
  })
}

/**
 * Fetch available service types
 */
export function useServiceTypes(): UseQueryResult<string[], Error> {
  return useQuery({
    queryKey: ['serviceTypes'],
    queryFn: () => professionalService.getServiceTypes(),
    staleTime: 60 * 60 * 1000, // 1 hour (rarely changes)
  })
}
