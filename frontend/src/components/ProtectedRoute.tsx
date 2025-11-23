/**
 * Protected Route Component
 * v1.3.13: Simplified to prevent re-render spam
 * 
 * Redirects unauthenticated users to login page
 * Shows loading state while checking authentication
 */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DashboardSkeleton } from './LoadingSkeleton'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // v1.3.13: Simplified logging - reduced console spam
  // Show loading skeleton while checking authentication
  if (isLoading) {
    console.log('[ProtectedRoute] ⏳ Auth still loading, showing skeleton...')
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark p-4">
        <DashboardSkeleton />
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] ❌ Not authenticated, redirecting to /login')
    return <Navigate to="/login" replace />
  }

  // If authenticated, render the protected page
  console.log('[ProtectedRoute] ✅ Authenticated! Rendering protected content')
  return <>{children}</>
}

export default ProtectedRoute
