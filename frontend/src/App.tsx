import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterProfessionalPage from './pages/RegisterProfessionalPage'
import ProfessionalDetailPage from './pages/ProfessionalDetailPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterProfessionalPage />} />
          <Route path="/professionals/:id" element={<ProfessionalDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
