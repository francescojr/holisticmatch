/**
 * Professional service - API calls for professional profiles
 */
import api from './api'
import type {
  Professional,
  ProfessionalListResponse,
  ProfessionalFilters,
} from '../types/Professional'

export const professionalService = {
  /**
   * Get list of professionals with filters and pagination
   */
  async getProfessionals(filters: ProfessionalFilters = {}): Promise<ProfessionalListResponse> {
    const params = new URLSearchParams()

    if (filters.service) params.append('service', filters.service)
    if (filters.city) params.append('city', filters.city)
    if (filters.price_min) params.append('price_min', filters.price_min.toString())
    if (filters.price_max) params.append('price_max', filters.price_max.toString())
    if (filters.attendance_type) params.append('attendance_type', filters.attendance_type)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())

    const response = await api.get<ProfessionalListResponse>(`/professionals/?${params}`)
    return response.data
  },

  /**
   * Get single professional by ID
   */
  async getProfessionalById(id: number): Promise<Professional> {
    const response = await api.get<Professional>(`/professionals/${id}/`)
    return response.data
  },

  /**
   * Get available service types
   */
  async getServiceTypes(): Promise<string[]> {
    const response = await api.get<{ service_types: string[] }>('/service-types/')
    return response.data.service_types
  },

  /**
   * Update professional profile (authenticated)
   */
  async updateProfessional(id: number, data: Partial<Professional>): Promise<Professional> {
    const response = await api.patch<Professional>(`/professionals/${id}/`, data)
    return response.data
  },
}

export default professionalService
