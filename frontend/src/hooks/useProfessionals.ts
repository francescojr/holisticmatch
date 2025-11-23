/**
 * Professionals data fetching hooks
 * Uses React Query for caching and state management
 * v1.3.1: Fixed abort signal handling - don't throw on mounted check
 */
import { useEffect, useRef } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { professionalService } from '../services/professionalService'
import type {
  Professional,
  ProfessionalListResponse,
  ProfessionalFilters,
} from '../types/Professional'

/**
 * Fetch paginated list of professionals with optional filters
 * v1.3.1: Fixed - AbortSignal now properly handles cancellation
 */
export function useProfessionals(
  filters?: ProfessionalFilters
): UseQueryResult<ProfessionalListResponse, Error> {
  // v1.3.0: Track mount status to prevent logs/state updates after unmount
  const isMountedRef = useRef(true)
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return useQuery({
    queryKey: ['professionals', filters],
    queryFn: async ({ signal }) => {
      console.log('[useProfessionals] 🔄 Fetching professionals with filters:', filters)
      
      try {
        // v1.3.1: Pass signal to fetch and let axios handle cancellation properly
        const data = await professionalService.getProfessionals(filters, signal)
        
        // v1.3.0: Only log if component still mounted
        if (isMountedRef.current) {
          console.log('[useProfessionals] ✅ API returned:', data.count, 'professionals')
          console.log('[useProfessionals] 📋 Results:', data.results.map(p => `${p.name} (ID: ${p.id}) - is_active: ${p.is_active}, na_contencao: ${p.na_contencao}`))
        }
        
        return data
      } catch (error: any) {
        // v1.3.3: Handle axios cancel + abort errors properly - return empty data instead of throwing
        if (error.name === 'CanceledError' || error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
          console.log('[useProfessionals] 🚫 Request cancelled by axios/abort (normal cleanup, not an error)')
          // Return gracefully for cancelled requests - don't show error toast
          return { count: 0, results: [], next: null, previous: null }
        }
        throw error
      }
    },
    staleTime: 1000, // v1.2.0: 1 second cache - allows batching, fresh data on next interaction
    gcTime: 5 * 60 * 1000, // v1.2.0: 5 minutes - keep cache for tab switches
    retry: 1, // Retry once on failure
    networkMode: 'always',  // v1.3.1: Don't skip request based on network status
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
