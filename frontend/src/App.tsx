import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './components'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useToast } from './hooks/useToast'
import { registerErrorHandler } from './services/api'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterProfessionalPage from './pages/RegisterProfessionalPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfessionalDetailPage from './pages/ProfessionalDetailPage'
import DashboardPage from './pages/DashboardPage'
import TermsAndConditionsPage from './pages/TermsAndConditionsPage'
import { ToastContainer } from './components/toast'

function AppContent() {
  const { toasts, toast, dismiss } = useToast()

  // Register global error handler 
  useEffect(() => {
    registerErrorHandler((error) => {
      toast[error.type](error.title, { message: error.message })
    })
  }, [])

  return (
    <>
      <div className="min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterProfessionalPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsAndConditionsPage />} />
          <Route path="/professionals/:id" element={<ProfessionalDetailPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
