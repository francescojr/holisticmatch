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
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      console.log('[useAuth] 🔄 checkAuth() starting...')
      try {
        
        if (authService.isAuthenticated()) {
          console.log('[useAuth] v1.3.7 🔍 Tokens present in localStorage - checking user profile')
          
          // Try to fetch user profile from API
          const userProfile = await authService.getCurrentUser()
          
          if (userProfile) {
            console.log('[useAuth] v1.3.7 ✅ User profile fetched from API')
            
            // Also get professional_id from localStorage
            const professionalId = localStorage.getItem('professional_id')
            const fullUser = {
              ...userProfile,
              professional_id: userProfile.professional_id || (professionalId ? parseInt(professionalId) : undefined),
            }
            
            console.log('[useAuth] ✅ Setting user with API data:', fullUser)
            setUser(fullUser)
          } else {
            // If API endpoint doesn't exist, user is still authenticated but we'll use minimal data
            console.log('[useAuth] v1.3.7 ⚠️ API returned null, using minimal user data (tokens are valid)')
            const professionalId = localStorage.getItem('professional_id')
            const minimalUser = { 
              id: 0, 
              email: '',
              professional_id: professionalId ? parseInt(professionalId) : undefined,
            }
            console.log('[useAuth] ✅ Setting user with minimal data:', minimalUser)
            setUser(minimalUser)
          }
        } else {
          console.log('[useAuth] v1.3.7 ℹ️ No tokens in localStorage - user not authenticated')
        }
      } catch (error: any) {
        // v1.3.7: On error (e.g., 401), STILL set user if tokens exist
        // This prevents ProtectedRoute from redirecting authenticated users during token refresh
        console.log('[useAuth] ❌ Error during auth check:', error.message)
        if (authService.isAuthenticated()) {
          console.log('[useAuth] v1.3.7 ⚠️ API error but tokens present - using minimal user data (will refresh on next request)')
          const professionalId = localStorage.getItem('professional_id')
          const minimalUser = { 
            id: 0, 
            email: '',
            professional_id: professionalId ? parseInt(professionalId) : undefined,
          }
          console.log('[useAuth] ✅ Setting user despite error:', minimalUser)
          setUser(minimalUser)
        } else {
          console.log('[useAuth] v1.3.7 ❌ API error AND no tokens - user not authenticated')
        }
      } finally {
        console.log('[useAuth] 🏁 checkAuth() finished, setting isLoading=false')
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

  const logout = async () => {
    await authService.logout()
    setUser(null)
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
