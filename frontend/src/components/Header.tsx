/**
 * Header component with navigation
 */
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Desconectado com sucesso', {
        message: 'Até logo!'
      })
      // Redirect to home
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Erro ao desconectar', {
        message: 'Tente novamente'
      })
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
            <span className="material-symbols-outlined text-2xl">spa</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-gray-900">holistic</span>
            <span className="text-gray-900/80">match</span>
          </h1>
        </Link>

        {/* Navigation */}
        <div className="flex gap-3 items-center">
          {isAuthenticated ? (
            <>
              {/* User Info */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10">
                <span className="material-symbols-outlined text-primary text-lg">account_circle</span>
                <span className="text-sm font-medium text-gray-900 max-w-[150px] truncate">
                  {user?.email || 'Usuário'}
                </span>
              </div>

              {/* Dashboard Link */}
              <Link
                to="/dashboard"
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'bg-primary text-white'
                    : 'bg-primary/20 text-primary hover:bg-primary/30'
                }`}
              >
                Dashboard
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  location.pathname === '/register'
                    ? 'bg-primary text-text-light'
                    : 'bg-primary/20 text-primary hover:bg-primary/30'
                }`}
              >
                Para Profissionais
              </Link>
              <Link
                to="/login"
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  location.pathname === '/login'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                Entrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
