/**
 * Dashboard page for professionals
 * Edit profile, services, pricing
 */
import { useState } from 'react'
import { motion } from 'framer-motion'

function DashboardPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    city: '',
    state: '',
    pricePerSession: '',
    attendanceType: 'ambos',
  })

  const handleSave = async () => {
    try {
      // TODO: Implement save with backend
      console.log('Saving profile:', formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Meu Dashboard</h1>
          <p className="text-gray-600 mt-2">Gerencie seu perfil e informações</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button className="px-4 py-3 border-b-2 border-purple-600 text-purple-600 font-semibold">
            Perfil
          </button>
          <button className="px-4 py-3 text-gray-600 hover:text-gray-900 font-semibold">
            Agendamentos
          </button>
          <button className="px-4 py-3 text-gray-600 hover:text-gray-900 font-semibold">
            Configurações
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Informações do Perfil</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    maxLength={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço por Sessão (R$)
                </label>
                <input
                  type="number"
                  value={formData.pricePerSession}
                  onChange={(e) => setFormData({ ...formData, pricePerSession: e.target.value })}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Salvar Alterações
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Nome</h3>
                <p className="text-lg text-gray-900">{formData.fullName || 'Não preenchido'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Bio</h3>
                <p className="text-lg text-gray-900">{formData.bio || 'Não preenchida'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">Cidade</h3>
                  <p className="text-lg text-gray-900">{formData.city || 'Não preenchida'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">Estado</h3>
                  <p className="text-lg text-gray-900">{formData.state || 'Não preenchido'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Preço</h3>
                <p className="text-lg text-green-600">
                  R$ {formData.pricePerSession || '0.00'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default DashboardPage
