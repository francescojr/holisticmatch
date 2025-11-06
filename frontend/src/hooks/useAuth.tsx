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
        if (authService.isAuthenticated()) {
          // Try to fetch user profile from API
          const userProfile = await authService.getCurrentUser()
          if (userProfile) {
            setUser(userProfile)
          } else {
            // If API endpoint doesn't exist, user is still authenticated but we'll use minimal data
            setUser({ id: 0, email: '' })
          }
        }
      } catch (error) {
        console.error('Failed to check auth:', error)
        // On error, still mark as loading done
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials)
    setUser(response.user)
  }

  const register = async (data: RegisterRequest) => {
    const response = await authService.register(data)
    setUser({
      id: response.user_id,
      email: data.email,
      professional_id: response.professional_id,
    })
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
