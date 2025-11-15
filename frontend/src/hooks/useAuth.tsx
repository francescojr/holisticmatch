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
      try {
        console.log('[useAuth.checkAuth] 🔍 Checking authentication status on mount...')
        
        if (authService.isAuthenticated()) {
          console.log('[useAuth.checkAuth] ✅ Token found, fetching user profile...')
          
          // Try to fetch user profile from API
          const userProfile = await authService.getCurrentUser()
          
          if (userProfile) {
            console.log('[useAuth.checkAuth] ✅ User profile loaded:', userProfile.email)
            
            // Also get professional_id from localStorage
            const professionalId = localStorage.getItem('professional_id')
            const fullUser = {
              ...userProfile,
              professional_id: userProfile.professional_id || (professionalId ? parseInt(professionalId) : undefined),
            }
            
            setUser(fullUser)
          } else {
            console.warn('[useAuth.checkAuth] ⚠️ API endpoint returned no user, using minimal data')
            // If API endpoint doesn't exist, user is still authenticated but we'll use minimal data
            const professionalId = localStorage.getItem('professional_id')
            setUser({ 
              id: 0, 
              email: '',
              professional_id: professionalId ? parseInt(professionalId) : undefined,
            })
          }
        } else {
          console.log('[useAuth.checkAuth] ℹ️ No authentication token found')
        }
      } catch (error: any) {
        console.error('[useAuth.checkAuth] ❌ Failed to check auth:', error.message)
        // On error, still mark as loading done
      } finally {
        console.log('[useAuth.checkAuth] ✅ Auth check complete, loading = false')
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    console.log('[useAuth.login] 🚀 Calling authService.login...')
    const response = await authService.login(credentials)
    console.log('[useAuth.login] ✅ Login response received, setting user:', response.user?.email)
    
    // Extract professional_id from localStorage (stored by authService during login)
    const professionalId = localStorage.getItem('professional_id')
    
    const userData = {
      id: response.user.id,
      email: response.user.email,
      professional_id: response.user.professional_id || (professionalId ? parseInt(professionalId) : undefined),
    }
    
    setUser(userData)
    console.log('[useAuth.login] 👤 User state updated with professional_id:', userData.professional_id)
  }

  const register = async (data: RegisterRequest) => {
    console.log('[useAuth.register] 🚀 Calling authService.register...')
    const response = await authService.register(data)
    console.log('[useAuth.register] ✅ Register response received')
    console.log('[useAuth.register] 📧 Email:', response.email)
    console.log('[useAuth.register] 📊 Professional ID:', response.professional_id)
    
    // NOTE: User is NOT logged in after registration
    // They must verify their email first, then login to get tokens
    // So we don't set user state here
    console.log('[useAuth.register] ℹ️  User NOT logged in yet (must verify email first, then login)')
  }

  const logout = async () => {
    console.log('[useAuth.logout] 🚀 Calling authService.logout...')
    await authService.logout()
    console.log('[useAuth.logout] ✅ Logout complete, clearing user state')
    setUser(null)
    console.log('[useAuth.logout] 👤 User state cleared')
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
