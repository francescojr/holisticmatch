/**
 * Email Verification Page
 * TASK 6.2: Email verification with token
 * Supports both URL token auto-detection and manual token input
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageVariants, itemVariants } from '../lib/animations'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/toast'
import { professionalService } from '../services/professionalService'

type VerificationState = 'input' | 'loading' | 'success' | 'error' | 'expired'

function EmailVerificationPage() {
  const { toast, toasts } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [state, setState] = useState<VerificationState>('input')
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [countdown, setCountdown] = useState(300) // 5 minutes
  const [resendLoading, setResendLoading] = useState(false)

  // Try to get token from URL params
  useEffect(() => {
    const urlToken = searchParams.get('token')
    const urlEmail = searchParams.get('email')
    
    if (urlEmail) {
      setEmail(decodeURIComponent(urlEmail))
    }
    
    if (urlToken) {
      setToken(urlToken)
      verifyTokenDirectly(urlToken)
    }
  }, [searchParams])

  // Countdown timer for token expiry
  useEffect(() => {
    if (state === 'input' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
    
    if (countdown === 0 && state === 'input') {
      setState('expired')
    }
    
    return undefined
  }, [countdown, state])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const verifyTokenDirectly = async (tokenToVerify: string) => {
    setState('loading')
    try {
      const result = await professionalService.verifyEmailToken(tokenToVerify)
      setEmail(result.email)
      setState('success')
      
      // Store email in localStorage for login redirect
      const verifiedEmail = result.email || email
      localStorage.setItem('verification_email', verifiedEmail)
      localStorage.setItem('just_verified_email', verifiedEmail)
      
      toast.success('Email verificado com sucesso!', {
        message: 'Você pode fazer login agora'
      })
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error: any) {
      console.error('Email verification error:', error)
      const errorMsg = 
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Token inválido ou expirado'
      setErrorMessage(errorMsg)
      setState('error')
      toast.error('Falha na verificação', {
        message: errorMsg
      })
    }
  }

  const handleTokenInput = (value: string) => {
    // Keep only digits, max 6
    const cleanedToken = value.replace(/[^0-9]/g, '').slice(0, 6)
    setToken(cleanedToken)
  }

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token.trim()) {
      setErrorMessage('Por favor, insira o código de verificação')
      return
    }

    verifyTokenDirectly(token)
  }

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setErrorMessage('Por favor, insira seu e-mail')
      return
    }

    setResendLoading(true)
    try {
      await professionalService.resendVerificationEmail(email)
      toast.success('E-mail reenviado!', {
        message: 'Verifique sua caixa de entrada'
      })
      
      // Reset countdown and clear old token to prevent verification with expired token
      setCountdown(300)
      setToken('')
      setState('input')
      setErrorMessage('')
    } catch (error: any) {
      console.error('Resend email error:', error)
      const message = 
        error.response?.data?.message ||
        error.response?.data?.email?.join(', ') ||
        'Erro ao reenviar e-mail'
      setErrorMessage(message)
      toast.error('Erro ao reenviar', { message })
    } finally {
      setResendLoading(false)
    }
  }

  const handleResendClick = async () => {
    if (!email.trim()) {
      toast.error('E-mail necessário', {
        message: 'Por favor, verifique seu e-mail abaixo para reenviar o código'
      })
      return
    }
    await handleResendEmail(new Event('submit') as any)
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f6f8f7] to-white px-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="w-full max-w-md">
        <ToastContainer toasts={toasts} onDismiss={() => {}} />

        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          variants={itemVariants}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center"
              variants={itemVariants}
            >
              {state === 'success' ? (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : state === 'error' || state === 'expired' ? (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : state === 'loading' ? (
                <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              )}
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {state === 'success' && 'E-mail Verificado!'}
              {state === 'error' && 'Erro na Verificação'}
              {state === 'expired' && 'Token Expirado'}
              {state === 'loading' && 'Verificando...'}
              {state === 'input' && 'Verificar E-mail'}
            </h1>

            <p className="text-gray-600">
              {state === 'success' && 'Seu e-mail foi confirmado com sucesso. Bem-vindo ao HolisticMatch!'}
              {state === 'error' && errorMessage}
              {state === 'expired' && 'Seu código de verificação expirou. Solicite um novo.'}
              {state === 'loading' && 'Por favor, aguarde enquanto verificamos seu e-mail...'}
              {state === 'input' && 'Insira o código que você recebeu por e-mail'}
            </p>
          </div>

          {/* Input States */}
          {(state === 'input' || state === 'expired') && (
            <motion.form onSubmit={handleVerifyToken} className="space-y-4" variants={itemVariants}>
              {/* Token Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Verificação
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => handleTokenInput(e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                  disabled={state === 'expired'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-center text-lg tracking-widest disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Email Input for Resend */}
              {state === 'expired' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail para Reenvio
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Error Message */}
              {errorMessage && state === 'input' && (
                <motion.div
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
                  variants={itemVariants}
                >
                  {errorMessage}
                </motion.div>
              )}

              {/* Countdown Timer */}
              {state === 'input' && (
                <div className="text-center text-sm text-gray-500">
                  Token expira em: <span className="font-mono font-bold text-gray-900">{formatTime(countdown)}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={state === 'expired' && (!email.trim() || !token.trim())}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state === 'expired' ? 'Reenviar e-mail' : 'Verificar E-mail'}
              </button>

              {/* Resend Link */}
              {state === 'input' && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Não recebeu o código?{' '}
                    <button
                      type="button"
                      onClick={handleResendClick}
                      disabled={resendLoading}
                      className="text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendLoading ? 'Reenviando...' : 'Solicitar novo código'}
                    </button>
                  </p>
                </div>
              )}
            </motion.form>
          )}

          {/* Success State */}
          {state === 'success' && (
            <motion.div variants={itemVariants} className="space-y-4">
              <p className="text-green-700 font-medium">
                ✓ E-mail: {email}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                Ir para Login
              </button>
              <p className="text-sm text-gray-500 text-center">
                Redirecionando automaticamente em alguns segundos...
              </p>
            </motion.div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 mb-3">{errorMessage}</p>
                {email && (
                  <p className="text-sm text-red-600 mb-4">E-mail: {email}</p>
                )}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setToken('')
                    setErrorMessage('')
                    setState('input')
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-gray-400 transition"
                >
                  Tentar Outro Código
                </button>
                <button
                  onClick={handleResendClick}
                  disabled={resendLoading || !email.trim()}
                  className="w-full px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {resendLoading ? 'Reenviando...' : 'Reenviar E-mail'}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition"
                >
                  Voltar ao Início
                </button>
              </div>
            </motion.div>
          )}

          {/* Expired State */}
          {state === 'expired' && (
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 font-medium mb-2">
                  ⚠️ Seu código de verificação expirou após 5 minutos
                </p>
                <p className="text-sm text-yellow-600">
                  Você pode solicitar um novo código abaixo usando seu e-mail.
                </p>
              </div>
            </motion.div>
          )}

          {/* Footer Links */}
          <motion.div
            className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600"
            variants={itemVariants}
          >
            <p>
              Já tem uma conta?{' '}
              <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Fazer login
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default EmailVerificationPage
