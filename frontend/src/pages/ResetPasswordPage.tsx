/**
 * Reset password page - validates token and sets new password
 */
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useToast } from '../hooks/useToast'
import { pageVariants, itemVariants } from '../lib/animations'
import { ToastContainer } from '../components/toast'
import professionalService from '../services/professionalService'

interface PasswordValidation {
  minLength: boolean
  hasUppercase: boolean
  hasNumber: boolean
}

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast, toasts } = useToast()
  
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tokenValid, setTokenValid] = useState(true)

  // Validate password requirements
  const passwordValidation: PasswordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }

  const isPasswordValid = Object.values(passwordValidation).every(v => v)
  const passwordsMatch = password === passwordConfirm && password.length > 0

  // Check token format on mount
  useEffect(() => {
    if (!token || token.length === 0) {
      setTokenValid(false)
      setError('Token inválido ou não fornecido. Solicite um novo link de redefinição de senha.')
      toast.error('Token inválido', {
        message: 'Por favor, solicite um novo link de redefinição'
      })
    }
    // Token format is valid if it's a non-empty string (the server will validate on submission)
  }, [token, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setError('Token não encontrado')
      return
    }

    if (!isPasswordValid) {
      setError('A senha não atende aos requisitos de segurança')
      return
    }

    if (!passwordsMatch) {
      setError('As senhas não conferem')
      return
    }

    setError('')
    setLoading(true)

    try {
      await professionalService.confirmPasswordReset({
        token,
        password,
        password_confirm: passwordConfirm,
      })

      toast.success('Senha redefinida com sucesso!', {
        message: 'Você será redirecionado para fazer login com sua nova senha'
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.token?.[0] ||
                          err.response?.data?.password?.[0] ||
                          err.message || 
                          'Erro ao redefinir senha'
      setError(errorMessage)
      toast.error('Erro ao redefinir senha', { message: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  if (!tokenValid && !token) {
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
          className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center"
        >
          <div className="flex justify-center mb-4">
            <span className="material-symbols-outlined text-red-600 text-5xl">error</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link Inválido</h2>
          <p className="text-gray-600 mb-6">
            O link de redefinição de senha é inválido ou expirou. Solicite um novo link.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary transition-colors"
          >
            Solicitar Novo Link
          </button>
        </motion.div>
      </motion.div>
    )
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
              <span className="material-symbols-outlined text-2xl">lock</span>
            </div>
            <h1 className="text-3xl font-black">
              <span className="text-gray-900">Nova</span>
              <span className="text-gray-900/80"> Senha</span>
            </h1>
          </div>
          <p className="text-gray-600 mt-2">Escolha uma nova senha segura</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
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

          {/* Password Requirements */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">Requisitos de senha:</p>
            <div className="space-y-1">
              <div className={`flex items-center gap-2 text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="material-symbols-outlined text-sm">
                  {passwordValidation.minLength ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                Mínimo 8 caracteres
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="material-symbols-outlined text-sm">
                  {passwordValidation.hasUppercase ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                Letra maiúscula (A-Z)
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="material-symbols-outlined text-sm">
                  {passwordValidation.hasNumber ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                Número (0-9)
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                passwordConfirm && !passwordsMatch ? 'border-red-300' : 'border-gray-300'
              }`}
              required
              disabled={loading}
            />
            {passwordConfirm && !passwordsMatch && (
              <p className="text-red-600 text-xs mt-1">Senhas não conferem</p>
            )}
            {passwordConfirm && passwordsMatch && (
              <p className="text-green-600 text-xs mt-1">✓ Senhas conferem</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid || !passwordsMatch}
            className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                Redefinindo...
              </span>
            ) : (
              'Redefinir Senha'
            )}
          </button>
        </form>

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

export default ResetPasswordPage
