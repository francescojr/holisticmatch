import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * Hook to enforce email verification after registration
 * Redirects user back to /verify-email if they try to navigate away
 */
export function usePendingEmailVerification() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check if there's a pending email verification
    const pendingEmail = sessionStorage.getItem('pendingEmailVerification')
    
    // List of routes that DON'T require email verification
    const allowedRoutes = [
      '/verify-email',
      '/login',
      '/forgot-password',
      '/reset-password',
      '/terms',
    ]

    // If user is not on an allowed route and has pending verification, redirect
    if (pendingEmail && !allowedRoutes.includes(location.pathname)) {
      console.warn('🔒 Pending email verification detected - redirecting to verify-email')
      navigate(`/verify-email?email=${encodeURIComponent(pendingEmail)}`, { replace: true })
    }
  }, [location.pathname, navigate])
}
