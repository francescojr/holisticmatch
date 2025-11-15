/**
 * Axios API client configuration
 * Base setup for all API calls with authentication
 * Includes request/response interceptors for auth and error handling
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { parseApiError, logError } from '../utils/errorHandler'

// Store reference to error handler callback
// Set by App.tsx after ErrorHandler is initialized
let errorHandlerCallback: ((error: { title: string; message: string; type: 'error' | 'warning' | 'info' }) => void) | null = null

/**
 * Register error handler callback for displaying errors via toast
 * Called during app initialization
 */
export const registerErrorHandler = (callback: (error: { title: string; message: string; type: 'error' | 'warning' | 'info' }) => void) => {
  errorHandlerCallback = callback
}

// Always use /api which Vercel will proxy to backend
// DO NOT use environment variables as they get hardcoded during build
const API_BASE_URL = '/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds (increased for file uploads)
})

// Request interceptor - add JWT token and handle FormData
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Endpoints that don't require authentication (AllowAny)
    const publicEndpoints = [
      '/professionals/register/',
      '/professionals/verify-email/',
      '/professionals/resend-verification/',
      '/auth/login/',
      '/auth/refresh/',
    ]

    // Check if this is a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint))

    // Add JWT token if available AND not a public endpoint
    const token = localStorage.getItem('access_token')
    if (token && config.headers && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // CRITICAL: If sending FormData, remove Content-Type header
    // Let browser/axios automatically set it with correct multipart boundary
    if (config.data instanceof FormData) {
      // Delete the Content-Type header so axios can set it with proper boundary
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle token refresh and API errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Call refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = response.data
        localStorage.setItem('access_token', access)

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('professional_id')
        localStorage.removeItem('just_verified_email')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Parse error and display via toast (if handler is registered)
    const appError = parseApiError(error)
    
    if (errorHandlerCallback) {
      errorHandlerCallback(appError)
    }
    
    logError(error, 'API Response Error')

    return Promise.reject(error)
  }
)

export default api
