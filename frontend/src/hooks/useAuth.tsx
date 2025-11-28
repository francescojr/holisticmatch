/**
 * Authentication hook
 * Provides authentication state and methods
 */
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { authService } from '../services/authService'
import type { User, LoginRequest, RegisterRequest } from '../types/Auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  // v1.3.13: logout now properly clears isLoading state
  logout: () => Promise<void>
  // v1.3.12: Force re-check authentication (called after email verification)
  recheckAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to fetch user profile from API
          const userProfile = await authService.getCurrentUser()
          
          if (userProfile) {
            // Also get professional_id from localStorage
            const professionalId = localStorage.getItem('professional_id')
            const fullUser = {
              ...userProfile,
              professional_id: userProfile.professional_id || (professionalId ? parseInt(professionalId) : undefined),
            }
            setUser(fullUser)
          } else {
            // If API endpoint doesn't exist, user is still authenticated but we'll use minimal data
            const professionalId = localStorage.getItem('professional_id')
            const minimalUser = { 
              id: 0, 
              email: '',
              professional_id: professionalId ? parseInt(professionalId) : undefined,
            }
            setUser(minimalUser)
          }
        }
      } catch (error: any) {
        // v1.3.7: On error (e.g., 401), STILL set user if tokens exist
        // This prevents ProtectedRoute from redirecting authenticated users during token refresh
        if (authService.isAuthenticated()) {
          const professionalId = localStorage.getItem('professional_id')
          const minimalUser = { 
            id: 0, 
            email: '',
            professional_id: professionalId ? parseInt(professionalId) : undefined,
          }
          setUser(minimalUser)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for logout in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      // When logout happens, localStorage.removeItem() is called
      // We detect this when access_token is removed
      if (e.key === 'access_token' && e.newValue === null) {
        // Another tab or window logged out
        setUser(null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials)
    
    // Extract professional_id from localStorage (stored by authService during login)
    const professionalId = localStorage.getItem('professional_id')
    
    const userData = {
      id: response.user.id,
      email: response.user.email,
      professional_id: response.user.professional_id || (professionalId ? parseInt(professionalId) : undefined),
    }
    
    setUser(userData)
  }

  const register = async (data: RegisterRequest) => {
    await authService.register(data)
    
    // NOTE: User is NOT logged in after registration
    // They must verify their email first, then login to get tokens
    // So we don't set user state here
  }

  // v1.4.5: CRITICAL FIX - logout must set isLoading=false AND notify for cache invalidation
  // v1.3.13: logout was async but never called setIsLoading(false)
  // v1.4.5: Now dispatches custom event to allow HomePage to refetch after logout
  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('[useAuth] Error calling authService.logout():', error)
    } finally {
      // v1.3.13: ALWAYS clear state, even if logout API call fails
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      localStorage.removeItem('professional_id')
      setUser(null)
      setIsLoading(false)  // ← CRITICAL: Must be false so loading spinner disappears
      // v1.4.5: Dispatch event to notify HomePage to refetch data
      window.dispatchEvent(new CustomEvent('auth-logout'))
    }
  }

  // v1.3.12: Force re-check authentication
  // Called by EmailVerificationPage after saving tokens
  // This ensures AuthContext is updated immediately after email verification
  // v1.3.13: Enhanced error handling with proper try/catch/finally
  const recheckAuth = async () => {
    setIsLoading(true)
    try {
      if (authService.isAuthenticated()) {
        try {
          const userProfile = await authService.getCurrentUser()
          if (userProfile) {
            const professionalId = localStorage.getItem('professional_id')
            const fullUser = {
              ...userProfile,
              professional_id: userProfile.professional_id || (professionalId ? parseInt(professionalId) : undefined),
            }
            setUser(fullUser)
          }
        } catch (apiError) {
          // v1.3.13: If API fails but tokens exist, still set minimal user
          const professionalId = localStorage.getItem('professional_id')
          setUser({
            id: 0,
            email: '',
            professional_id: professionalId ? parseInt(professionalId) : undefined,
          })
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('[useAuth] Unexpected error in recheckAuth:', error)
      setUser(null)
    } finally {
      // v1.3.13: ALWAYS set isLoading to false
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        recheckAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
