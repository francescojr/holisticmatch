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
      console.log('[authService.register] 🚀 Starting registration...')
      console.log('[authService.register] 📧 Email:', data.email)
      
      const formData = new FormData()

      // User fields :)
      formData.append('email', data.email)
      formData.append('password', data.password)

      // Professional fields
      formData.append('full_name', data.full_name)
      
      // CRITICAL: Log photo details before appending
      if (data.photo) {
        console.log('[authService.register] 📸 Photo detected:')
        console.log('[authService.register]    Type:', typeof data.photo)
        console.log('[authService.register]    Constructor:', data.photo.constructor.name)
        console.log('[authService.register]    Is File?', data.photo instanceof File)
        console.log('[authService.register]    Size:', (data.photo as any).size)
        console.log('[authService.register]    Name:', (data.photo as any).name)
        formData.append('photo', data.photo)
      } else {
        console.log('[authService.register] ⚠️  No photo provided!')
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

      console.log('[authService.register] ✅ API Response Status:', response.status)
      console.log('[authService.register] 📥 Response Keys:', Object.keys(response.data).join(', '))

      // Backend response structure: { message, email, professional_id }
      // NOTE: JWT tokens are NOT returned from register endpoint
      // User must verify email first, then login to get tokens
      console.log('[authService.register] ℹ️  JWT tokens NOT returned from register endpoint')
      console.log('[authService.register] ℹ️  User must verify email first, then login to get tokens')

      const normalizedData: RegisterResponse = {
        email: response.data.email,
        message: response.data.message,
        professional_id: response.data.professional_id,
      }

      console.log('[authService.register] 🎉 Registration complete!')
      console.log('[authService.register] 📧 Email:', normalizedData.email)
      console.log('[authService.register] 🆔 Professional ID:', normalizedData.professional_id)
      return normalizedData
    } catch (error: any) {
      console.error('[authService.register] ❌ REGISTRATION FAILED!')
      console.error('[authService.register] Error Status:', error.response?.status)
      console.error('[authService.register] Error Data:', JSON.stringify(error.response?.data, null, 2))
      console.error('[authService.register] Error Details:', error.response?.data)
      if (error.response?.data?.detail) {
        console.error('[authService.register] Detail Message:', error.response.data.detail)
      }
      console.error('[authService.register] Error Message:', error.message)
      throw error
    }
  },

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('[authService.login] 🚀 Starting login...')
      console.log('[authService.login] 📧 Email:', credentials.email)

      // Backend returns "access" and "refresh", normalize to "access_token" and "refresh_token"
      const response = await api.post<any>('/auth/login/', credentials)

      console.log('[authService.login] ✅ API Response Status:', response.status)
      console.log('[authService.login] 📥 Response Keys:', Object.keys(response.data).join(', '))

      const accessToken = response.data.access
      const refreshToken = response.data.refresh

      console.log('[authService.login] 🔑 Token Extraction:')
      console.log('[authService.login]    - Access Token:', accessToken ? '✅ Found' : '❌ NOT FOUND')
      console.log('[authService.login]    - Refresh Token:', refreshToken ? '✅ Found' : '❌ NOT FOUND')

      if (!accessToken || !refreshToken) {
        console.error('[authService.login] ❌ CRITICAL: Missing tokens in response!')
        console.error('[authService.login] Response data:', response.data)
        throw new Error('Backend did not return tokens')
      }

      // Normalize response format
      const normalizedData: LoginResponse = {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: response.data.user,
      }

      // Store tokens and professional_id
      console.log('[authService.login] 💾 Storing tokens to localStorage...')
      localStorage.setItem('access_token', normalizedData.access_token)
      localStorage.setItem('refresh_token', normalizedData.refresh_token)
      
      // Store professional_id from login response
      if (response.data.user?.professional_id) {
        console.log('[authService.login] 💾 Storing professional_id:', response.data.user.professional_id)
        localStorage.setItem('professional_id', response.data.user.professional_id.toString())
      }

      // Verify storage
      const storedAccess = localStorage.getItem('access_token')
      const storedRefresh = localStorage.getItem('refresh_token')
      console.log('[authService.login] ✅ Verification after storage:')
      console.log('[authService.login]    - access_token stored:', storedAccess ? '✅ yes' : '❌ NO')
      console.log('[authService.login]    - refresh_token stored:', storedRefresh ? '✅ yes' : '❌ NO')
      console.log('[authService.login] 👤 User Email:', response.data.user?.email)

      console.log('[authService.login] 🎉 Login complete!')
      return normalizedData
    } catch (error: any) {
      console.error('[authService.login] ❌ LOGIN FAILED!')
      console.error('[authService.login] Status:', error.response?.status)
      console.error('[authService.login] Data:', error.response?.data)
      console.error('[authService.login] Message:', error.message)
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
      console.log('[authService.logout] 🚀 Starting logout...')
      
      // Clear local storage
      console.log('[authService.logout] 🧹 Clearing localStorage...')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('professional_id')
      localStorage.removeItem('just_verified_email')
      
      console.log('[authService.logout] ✅ localStorage cleared')
      console.log('[authService.logout] 🎉 Logout complete!')
    } catch (error: any) {
      console.error('[authService.logout] ❌ Logout failed:', error.message)
      throw error
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    try {
      console.log('[authService.refreshToken] 🚀 Starting token refresh...')
      
      // Backend endpoint expects "refresh" field (simplejwt convention)
      const response = await api.post<any>('/auth/refresh/', {
        refresh: refreshToken,
      })

      console.log('[authService.refreshToken] ✅ API Response Status:', response.status)

      // Normalize response - backend returns "access"
      const normalizedData: RefreshResponse = {
        access: response.data.access,
      }

      // Update access token
      console.log('[authService.refreshToken] 💾 Storing new access token...')
      localStorage.setItem('access_token', normalizedData.access)

      const storedAccess = localStorage.getItem('access_token')
      console.log('[authService.refreshToken] ✅ Access token updated:', storedAccess ? '✅ stored' : '❌ NOT stored')

      return normalizedData
    } catch (error: any) {
      console.error('[authService.refreshToken] ❌ TOKEN REFRESH FAILED!')
      console.error('[authService.refreshToken] Status:', error.response?.status)
      console.error('[authService.refreshToken] Message:', error.message)
      throw error
    }
  },

  /**
   * Get current authenticated user info
   * Attempts to fetch from GET /auth/me/ or falls back to stored user data
   */
  async getCurrentUser(): Promise<any> {
    try {
      console.log('[authService.getCurrentUser] 🚀 Fetching current user...')
      // Try to fetch from API endpoint
      const response = await api.get('/auth/me/')
      console.log('[authService.getCurrentUser] ✅ User fetched:', response.data?.email)
      return response.data
    } catch (error: any) {
      console.warn('[authService.getCurrentUser] ⚠️ Failed to fetch user:', error.message)
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
    
    console.log('[authService.isAuthenticated] 🔍 Check:', isAuth ? '✅ authenticated' : '❌ not authenticated')
    
    // Log persistence state if tokens exist
    if (isAuth) {
      console.log('[authService.isAuthenticated] 💾 Token persistence:')
      console.log('[authService.isAuthenticated]   - access_token: ' + (accessToken ? '✅ PRESENT (' + accessToken.substring(0, 20) + '...)' : '❌ MISSING'))
      console.log('[authService.isAuthenticated]   - refresh_token: ' + (refreshToken ? '✅ PRESENT (' + refreshToken.substring(0, 20) + '...)' : '❌ MISSING'))
    }
    
    return isAuth
  },
}

export default authService
