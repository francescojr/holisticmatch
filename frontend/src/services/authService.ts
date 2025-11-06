/**
 * Authentication service - API calls for auth operations
 */
import api from './api'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
} from '../types/Auth'

export const authService = {
  /**
   * Register a new professional
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const formData = new FormData()

    // User fields
    formData.append('email', data.email)
    formData.append('password', data.password)

    // Professional fields
    formData.append('full_name', data.full_name)
    formData.append('photo', data.photo)
    formData.append('services', JSON.stringify(data.services))
    formData.append('price_per_session', data.price_per_session.toString())
    formData.append('attendance_type', data.attendance_type)
    formData.append('city', data.city)
    formData.append('neighborhood', data.neighborhood)
    formData.append('bio', data.bio)
    formData.append('whatsapp', data.whatsapp)
    if (data.instagram) formData.append('instagram', data.instagram)

    // Backend may return "access" and "refresh" or "access_token" and "refresh_token"
    const response = await api.post<any>('/auth/register/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Normalize response format (handle both conventions)
    const normalizedData: RegisterResponse = {
      user_id: response.data.user_id,
      professional_id: response.data.professional_id,
      access_token: response.data.access_token || response.data.access,
      refresh_token: response.data.refresh_token || response.data.refresh,
    }

    // Store tokens
    localStorage.setItem('access_token', normalizedData.access_token)
    localStorage.setItem('refresh_token', normalizedData.refresh_token)

    return normalizedData
  },

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Backend returns "access" and "refresh", normalize to "access_token" and "refresh_token"
    const response = await api.post<any>('/auth/login/', credentials)

    // Normalize response format
    const normalizedData: LoginResponse = {
      access_token: response.data.access,
      refresh_token: response.data.refresh,
      user: response.data.user,
    }

    // Store tokens
    localStorage.setItem('access_token', normalizedData.access_token)
    localStorage.setItem('refresh_token', normalizedData.refresh_token)

    return normalizedData
  },

  /**
   * Logout - clear tokens and blacklist refresh token
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token')

    try {
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh_token: refreshToken })
      }
    } finally {
      // Always clear local storage even if API call fails
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('professional_id')
      localStorage.removeItem('just_verified_email')
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    // Backend endpoint expects "refresh" field (simplejwt convention)
    const response = await api.post<any>('/auth/refresh/', {
      refresh: refreshToken,
    })

    // Normalize response - backend returns "access"
    const normalizedData: RefreshResponse = {
      access: response.data.access,
    }

    // Update access token
    localStorage.setItem('access_token', normalizedData.access)

    return normalizedData
  },

  /**
   * Get current authenticated user info
   * Attempts to fetch from GET /auth/me/ or falls back to stored user data
   */
  async getCurrentUser(): Promise<any> {
    try {
      // Try to fetch from API endpoint
      const response = await api.get('/auth/me/')
      return response.data
    } catch (error) {
      // Fallback: return null if not authenticated
      return null
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  },
}

export default authService
