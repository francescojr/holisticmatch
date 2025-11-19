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
    try {

      
      const formData = new FormData()

      // User fields :)
      formData.append('email', data.email)
      formData.append('password', data.password)

      // Professional fields
      formData.append('full_name', data.full_name)
      
      // CRITICAL: Log photo details before appending
      if (data.photo) {



        console.log('[authService.register]    Size:', (data.photo as any).size)
        console.log('[authService.register]    Name:', (data.photo as any).name)
        formData.append('photo', data.photo)
      } else {
      }
      
      formData.append('services', JSON.stringify(data.services))
      formData.append('price_per_session', data.price_per_session.toString())
      formData.append('attendance_type', data.attendance_type)
      formData.append('state', data.state)
      formData.append('city', data.city)
      formData.append('neighborhood', data.neighborhood)
      formData.append('bio', data.bio)
      formData.append('whatsapp', data.whatsapp)
      if (data.instagram) formData.append('instagram', data.instagram)

      console.log('[authService.register] 📦 Form data prepared with keys:', Array.from(formData.keys()).join(', '))

      // Backend endpoint: /professionals/register/ returns access_token, refresh_token, user_id, professional_id
      // Note: Do NOT set Content-Type header - Axios will handle it automatically with correct boundary
      const response = await api.post<any>('/professionals/register/', formData)
      console.log('[authService.register] 📥 Response Keys:', Object.keys(response.data).join(', '))

      // Backend response structure: { message, email, professional_id }
      // NOTE: JWT tokens are NOT returned from register endpoint
      // User must verify email first, then login to get tokens


      const normalizedData: RegisterResponse = {
        email: response.data.email,
        message: response.data.message,
        professional_id: response.data.professional_id,
      }


      return normalizedData
    } catch (error: any) {

      console.error('[authService.register] Error Data:', JSON.stringify(error.response?.data, null, 2))
      if (error.response?.data?.detail) {
      }
      throw error
    }
  },

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {


      // Backend returns "access" and "refresh", normalize to "access_token" and "refresh_token"
      const response = await api.post<any>('/auth/login/', credentials)
      console.log('[authService.login] 📥 Response Keys:', Object.keys(response.data).join(', '))

      const accessToken = response.data.access
      const refreshToken = response.data.refresh



      if (!accessToken || !refreshToken) {

        throw new Error('Backend did not return tokens')
      }

      // Normalize response format
      const normalizedData: LoginResponse = {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: response.data.user,
      }

      // Store tokens and professional_id
      localStorage.setItem('access_token', normalizedData.access_token)
      localStorage.setItem('refresh_token', normalizedData.refresh_token)
      
      // Store professional_id from login response
      if (response.data.user?.professional_id) {
        localStorage.setItem('professional_id', response.data.user.professional_id.toString())
      }

      // Verify storage
      const storedAccess = localStorage.getItem('access_token')
      const storedRefresh = localStorage.getItem('refresh_token')




      return normalizedData
    } catch (error: any) {



      throw error
    }
  },

  /**
   * Logout - clear tokens
   * Note: Backend doesn't have a dedicated logout endpoint,
   * so we just clear local tokens
   */
  async logout(): Promise<void> {
    try {
      
      // Clear local storage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('professional_id')
      localStorage.removeItem('just_verified_email')

    } catch (error: any) {
      throw error
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    try {
      
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

      const storedAccess = localStorage.getItem('access_token')

      return normalizedData
    } catch (error: any) {


      throw error
    }
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
    } catch (error: any) {
      // Fallback: return null if not authenticated
      return null
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const accessToken = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    const isAuth = !!accessToken
    
    // Log persistence state if tokens exist
    if (isAuth) {
      console.log('[authService.isAuthenticated]   - access_token: ' + (accessToken ? '✅ PRESENT (' + accessToken.substring(0, 20) + '...)' : '❌ MISSING'))
      console.log('[authService.isAuthenticated]   - refresh_token: ' + (refreshToken ? '✅ PRESENT (' + refreshToken.substring(0, 20) + '...)' : '❌ MISSING'))
    }
    
    return isAuth
  },
}

export default authService
