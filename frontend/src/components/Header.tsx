/**
 * Header component with navigation
 */
import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()

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
            <span className="text-gray-900/65">match</span>
          </h1>
        </Link>

        {/* Navigation */}
        <div className="flex gap-3">
          <Link
            to="/register"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              location.pathname === '/register'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
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
        </div>
      </div>
    </header>
  )
}
