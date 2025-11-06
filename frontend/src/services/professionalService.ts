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
    const response = await api.get<string[]>(`/professionals/service_types/`)
    return response.data
  },

  /**
   * Update professional profile (authenticated)
   */
  async updateProfessional(id: number, data: Partial<Professional>): Promise<Professional> {
    const response = await api.patch<Professional>(`/professionals/${id}/`, data)
    return response.data
  },

  /**
   * Create new professional profile with registration and password
   */
  async createProfessionalWithPassword(data: {
    name: string
    email: string
    phone: string
    password: string
    services: string[]
    price_per_session: number
    city: string
    state: string
    attendance_type: string
    whatsapp: string
    bio: string
    photo?: File
  }): Promise<{ professional: Professional; token?: string; refresh_token?: string }> {
    const professionalData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password, // Password will be handled by backend to create User
      services: data.services,
      bio: data.bio,
      city: data.city,
      state: data.state,
      price_per_session: data.price_per_session,
      attendance_type: data.attendance_type,
      whatsapp: data.whatsapp,
    }

    const response = await api.post<{ professional: Professional; token?: string; refresh_token?: string }>('/professionals/', professionalData)
    return response.data
  },

  /**
   * Create new professional profile with registration
   */
  async createProfessional(data: {
    fullName: string
    email: string
    phone: string
    cpf?: string
    photo?: File
    services: Array<{
      serviceType: string
      price: number
      description: string
    }>
  }): Promise<{ professional: Professional; token?: string }> {
    // For now, we'll create the professional directly
    // In a real implementation, this would involve:
    // 1. User registration (not implemented yet in backend)
    // 2. Professional creation
    // 3. Photo upload

    const professionalData = {
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      services: data.services.map(service => ({
        type: service.serviceType,
        price: service.price,
        description: service.description
      })),
      // Default values for required fields (will be updated in real implementation)
      bio: `Profissional de terapias holísticas especializado em ${data.services.map(s => s.serviceType).join(', ')}.`,
      city: 'São Paulo', // Will be added to form later
      state: 'SP', // Will be added to form later
      price_per_session: Math.min(...data.services.map(s => s.price)), // Use lowest price as session price
      attendance_type: 'ambos' as const,
      whatsapp: data.phone,
    }

    const response = await api.post<{ professional: Professional; token?: string }>('/professionals/', professionalData)
    return response.data
  },

  /**
   * Upload professional photo
   */
  async uploadProfessionalPhoto(professionalId: number, photo: File): Promise<{ photo_url: string }> {
    const formData = new FormData()
    formData.append('photo', photo)

    const response = await api.post<{ photo_url: string }>(`/professionals/${professionalId}/upload-photo/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Verify email with token (TASK 6.2)
   */
  async verifyEmailToken(token: string): Promise<{ message: string; email: string }> {
    const response = await api.post<{ message: string; email: string }>('/professionals/verify-email/', {
      token,
    })
    return response.data
  },

  /**
   * Resend verification email (TASK 6.2)
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/professionals/resend-verification/', {
      email,
    })
    return response.data
  },

  /**
   * Delete professional profile (authenticated)
   * TASK F5: Delete Flow
   */
  async deleteProfessional(id: number): Promise<void> {
    await api.delete(`/professionals/${id}/`)
  },
}

export default professionalService
