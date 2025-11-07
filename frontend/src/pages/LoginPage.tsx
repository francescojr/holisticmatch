/**
 * Login page for clients and professionals
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { pageVariants, itemVariants } from '../lib/animations'
import { ToastContainer } from '../components/toast'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { toast, toasts } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [justVerifiedEmail, setJustVerifiedEmail] = useState('')

  // Check if user just verified email
  useEffect(() => {
    console.log('[LoginPage] 📍 useEffect mounted - checking for verified email')
    const verifiedEmail = localStorage.getItem('just_verified_email') || localStorage.getItem('verification_email')
    console.log('[LoginPage] 📧 Verified email from localStorage:', verifiedEmail ? `✅ ${verifiedEmail}` : '❌ not found')
    if (verifiedEmail) {
      console.log('[LoginPage] ✅ Auto-filling email field from verification')
      setJustVerifiedEmail(verifiedEmail)
      setEmail(verifiedEmail)
      toast.success('Email verificado!', {
        message: 'Agora você pode fazer login com sua senha'
      })
    }
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[LoginPage] 🚀🚀🚀 LOGIN ATTEMPT STARTING - SAVE THIS LOG! 🚀🚀🚀')
    console.log('[LoginPage] 📧 Email:', email)
    
    setError('')
    setLoading(true)

    try {
      // Check what's in localStorage BEFORE login
      console.log('[LoginPage] � Pre-login localStorage check:')
      const preAccessToken = localStorage.getItem('access_token')
      const preRefreshToken = localStorage.getItem('refresh_token')
      console.log('[LoginPage]   - access_token before: ' + (preAccessToken ? '✅ exists' : '❌ empty'))
      console.log('[LoginPage]   - refresh_token before: ' + (preRefreshToken ? '✅ exists' : '❌ empty'))
      
      console.log('[LoginPage] �🔐 Calling login from auth context...')
      console.log('[LoginPage] 📡 Endpoint: /auth/login/')
      
      // Call login from auth context (which calls authService.login)
      await login({ email, password })
      
      console.log('[LoginPage] ✅ Login successful!')
      
      // Check what's in localStorage AFTER login
      console.log('[LoginPage] 🔍 Post-login localStorage check:')
      const postAccessToken = localStorage.getItem('access_token')
      const postRefreshToken = localStorage.getItem('refresh_token')
      const accessMsg = postAccessToken ? `✅ EXISTS (${postAccessToken.substring(0, 30)}...)` : '❌ MISSING!!!'
      const refreshMsg = postRefreshToken ? `✅ EXISTS (${postRefreshToken.substring(0, 30)}...)` : '❌ MISSING!!!'
      console.log('[LoginPage]   - access_token after:', accessMsg)
      console.log('[LoginPage]   - refresh_token after:', refreshMsg)
      
      // Verify tokens changed
      if (postAccessToken && postAccessToken !== preAccessToken) {
        console.log('[LoginPage] ✅ Access token was updated')
      } else if (!postAccessToken) {
        console.error('[LoginPage] ❌ CRITICAL: access_token NOT saved to localStorage after login!')
      }
      
      console.log('[LoginPage] 🧹 Clearing verification flags...')
      // Clear verified email flags
      localStorage.removeItem('just_verified_email')
      localStorage.removeItem('verification_email')
      
      console.log('[LoginPage] 🎉 Ready to navigate to dashboard...')
      console.log('[LoginPage] 🔄 Navigating to dashboard...')
      // Navigate to dashboard on successful login
      navigate('/dashboard')
    } catch (err: any) {
      console.error('[LoginPage] ❌ Login error!')
      console.error('[LoginPage] Status:', err.response?.status)
      console.error('[LoginPage] Data:', err.response?.data)
      console.error('[LoginPage] Message:', err.message)
      
      // Handle specific error messages from backend
      const errorMessage = err.response?.data?.detail || err.message || 'Erro ao fazer login'
      console.warn('[LoginPage] Error message:', errorMessage)
      
      // Check if error is due to unverified email (403)
      if (err.response?.status === 403 && errorMessage.toLowerCase().includes('email')) {
        console.warn('[LoginPage] Email not verified')
        setError('Por favor, verifique seu email antes de fazer login')
        toast.info('Email não verificado', {
          message: 'Procure pela mensagem de verificação em seu email ou solicite um novo código'
        })
        // Optionally redirect to verify page
        setTimeout(() => {
          console.log('[LoginPage] 🔄 Redirecting to verify-email...')
          navigate('/verify-email', { replace: false })
        }, 3000)
      } else {
        console.warn('[LoginPage] Setting error state:', errorMessage)
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background-light flex items-start justify-center px-4 pt-32"
    >
      <ToastContainer toasts={toasts} onDismiss={() => {}} />
      
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <span className="material-symbols-outlined text-2xl">spa</span>
            </div>
            <h1 className="text-3xl font-black">
              <span className="text-gray-900">holistic</span>
              <span className="text-gray-900/80">match</span>
            </h1>
          </div>
          <p className="text-gray-600 mt-2">Faça login ou crie sua conta</p>
        </div>

        {justVerifiedEmail && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">✓ Email verificado!</p>
            <p className="text-sm text-green-600">Agora complete seu login</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <a href="#" className="text-gray-500 hover:text-primary transition-colors">
            Esqueceu sua senha?
          </a>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Não tem conta?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default LoginPage
