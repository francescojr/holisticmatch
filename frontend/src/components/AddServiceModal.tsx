/**
 * AddServiceModal component
 * Modal for adding new services to professional profile
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { modalVariants } from '../lib/animations'
import FormInput from './forms/FormInput'

interface AddServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (service: { name: string; price: number }) => void
}

export default function AddServiceModal({ isOpen, onClose, onAdd }: AddServiceModalProps) {
  const [serviceName, setServiceName] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({})

  const validateForm = () => {
    const newErrors: { name?: string; price?: string } = {}

    if (!serviceName.trim()) {
      newErrors.name = 'Nome do serviço é obrigatório'
    } else if (serviceName.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    } else if (serviceName.trim().length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres'
    }

    const price = parseFloat(servicePrice)
    if (!servicePrice.trim()) {
      newErrors.price = 'Preço é obrigatório'
    } else if (isNaN(price) || price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero'
    } else if (price > 10000) {
      newErrors.price = 'Preço deve ser menor que R$ 10.000'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const price = parseFloat(servicePrice)
    onAdd({
      name: serviceName.trim(),
      price: price
    })

    // Reset form
    setServiceName('')
    setServicePrice('')
    setErrors({})
    onClose()
  }

  const handleClose = () => {
    setServiceName('')
    setServicePrice('')
    setErrors({})
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white dark:bg-[#1a2e22] rounded-xl border border-[#dbe6e0] dark:border-[#2a3f34] p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#111814] dark:text-white text-xl font-bold leading-tight">
                  Adicionar Serviço
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a3f34] rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-500">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label="Nome do Serviço"
                  type="text"
                  value={serviceName}
                  onChange={setServiceName}
                  error={errors.name}
                  placeholder="Ex: Terapia Individual, Consulta Online"
                  required
                />

                <FormInput
                  label="Preço (R$)"
                  type="number"
                  value={servicePrice}
                  onChange={setServicePrice}
                  error={errors.price}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}