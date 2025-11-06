/**
 * Hook for handling professional deletion with confirmation
 * TASK F5: Delete Flow & Modal
 */
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from './useToast'
import { professionalService } from '../services/professionalService'

interface UseDeleteProfessionalReturn {
  isOpen: boolean
  isDeleting: boolean
  openDeleteConfirm: (id: number, name: string) => void
  closeDeleteConfirm: () => void
  handleDeleteConfirm: () => Promise<void>
  deletingProfessionalId?: number
  deletingProfessionalName?: string
}

export function useDeleteProfessional(): UseDeleteProfessionalReturn {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingProfessionalId, setDeletingProfessionalId] = useState<number>()
  const [deletingProfessionalName, setDeletingProfessionalName] = useState<string>()

  const openDeleteConfirm = useCallback((id: number, name: string) => {
    setDeletingProfessionalId(id)
    setDeletingProfessionalName(name)
    setIsOpen(true)
  }, [])

  const closeDeleteConfirm = useCallback(() => {
    setIsOpen(false)
    setDeletingProfessionalId(undefined)
    setDeletingProfessionalName(undefined)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingProfessionalId) return

    setIsDeleting(true)

    try {
      // Delete professional profile
      await professionalService.deleteProfessional(deletingProfessionalId)

      toast.success('Perfil deletado com sucesso', {
        message: 'Sua conta foi removida do sistema.'
      })

      // Close dialog
      closeDeleteConfirm()

      // Clear local storage (logout user)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('professional_id')

      // Redirect to home after short delay
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('Erro ao deletar perfil', {
        message: error.response?.data?.detail || 'Tente novamente.'
      })
    } finally {
      setIsDeleting(false)
    }
  }, [deletingProfessionalId, navigate, toast, closeDeleteConfirm])

  return {
    isOpen,
    isDeleting,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteConfirm,
    deletingProfessionalId,
    deletingProfessionalName,
  }
}

export default useDeleteProfessional
