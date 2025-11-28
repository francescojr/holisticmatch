/**
 * Forgot password page - requests password reset email
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useToast } from '../hooks/useToast'
import { pageVariants, itemVariants } from '../lib/animations'
import { ToastContainer } from '../components/toast'
import professionalService from '../services/professionalService'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { toast, toasts } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('[ForgotPasswordPage] 📧 Requesting password reset for:', email)

    try {
      console.log('[ForgotPasswordPage] 🔄 Calling professionalService.requestPasswordReset...')
      const response = await professionalService.requestPasswordReset(email)
      console.log('[ForgotPasswordPage] ✅ Success:', response)
      setSubmitted(true)
      toast.success('Email enviado com sucesso!', {
        message: 'Verifique sua caixa de email para o link de redefinição de senha'
      })
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      console.error('[ForgotPasswordPage] ❌ Error:', err)
      console.error('[ForgotPasswordPage] ❌ Response:', err.response?.data)
      console.error('[ForgotPasswordPage] ❌ Status:', err.response?.status)
      const errorMessage = err.response?.data?.detail || err.message || 'Erro ao solicitar redefinição de senha'
      setError(errorMessage)
      toast.error('Erro', { message: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background-light dark:bg-background-dark flex items-start justify-center px-4 pt-32"
    >
      <ToastContainer toasts={toasts} onDismiss={() => {}} />
      
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <span className="material-symbols-outlined text-2xl">lock_reset</span>
            </div>
            <h1 className="text-3xl font-black">
              <span className="text-gray-900">Redefinir</span>
              <span className="text-gray-900/80"> Senha</span>
            </h1>
          </div>
          <p className="text-gray-600 mt-2">Digite seu email para receber um link de redefinição</p>
        </div>

        {submitted ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <div className="flex justify-center mb-2">
              <span className="material-symbols-outlined text-green-600 text-4xl">mark_email_read</span>
            </div>
            <p className="text-green-700 font-medium mb-2">Email enviado com sucesso!</p>
            <p className="text-sm text-green-600">
              Verifique sua caixa de email <strong>{email}</strong> para o link de redefinição de senha.
            </p>
            <p className="text-xs text-green-600 mt-3">Este link expira em 24 horas.</p>
            <p className="text-gray-500 mt-4 text-sm">Redirecionando para login em alguns segundos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

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
              <p className="text-xs text-gray-500 mt-1">
                Enviaremos um link de redefinição de senha para este email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                  Enviando...
                </span>
              ) : (
                'Enviar Link de Redefinição'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Lembrou sua senha?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              Voltar para login
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ForgotPasswordPage
