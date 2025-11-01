/**
 * Professional profile type definitions
 */

export interface User {
  id: number
  email: string
  username: string
}

export interface Professional {
  id: number
  user: User
  name: string
  bio: string
  services: string[]
  city: string
  state: string
  price_per_session: number
  attendance_type: 'presencial' | 'online' | 'ambos'
  whatsapp: string
  email: string
  phone: string
  photo: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export interface ProfessionalSummary {
  id: number
  name: string
  services: string[]
  city: string
  state: string
  price_per_session: number
  attendance_type: 'presencial' | 'online' | 'ambos'
  photo_url: string | null
  neighborhood: string
}

export interface ProfessionalListResponse {
  count: number
  next: string | null
  previous: string | null
  results: ProfessionalSummary[]
}

export interface ProfessionalFilters {
  service?: string
  city?: string
  price_min?: number
  price_max?: number
  attendance_type?: 'home' | 'office' | 'both'
  limit?: number
  offset?: number
}

export const SERVICE_TYPES = [
  'Reiki',
  'Acupuntura',
  'Aromaterapia',
  'Massagem',
  'Meditação Guiada',
  'Tai Chi',
  'Reflexologia',
  'Cristaloterapia',
  'Florais',
  'Yoga',
  'Pilates Holístico',
] as const

export type ServiceType = (typeof SERVICE_TYPES)[number]
