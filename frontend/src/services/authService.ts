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

    const response = await api.post<RegisterResponse>('/auth/register/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Store tokens
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('refresh_token', response.data.refresh_token)

    return response.data
  },

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login/', credentials)

    // Store tokens
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('refresh_token', response.data.refresh_token)

    return response.data
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
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    const response = await api.post<RefreshResponse>('/auth/refresh/', {
      refresh: refreshToken,
    })

    // Update access token
    localStorage.setItem('access_token', response.data.access)

    return response.data
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  },
}

export default authService
