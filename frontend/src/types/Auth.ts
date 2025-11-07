/**
 * Authentication type definitions
 */

export interface User {
  id: number
  email: string
  professional_id?: number
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse extends AuthTokens {
  user: User
}

export interface RegisterRequest {
  // User fields
  email: string
  password: string

  // Professional fields
  full_name: string
  photo?: File
  services: string[]
  price_per_session: number
  attendance_type: 'presencial' | 'online' | 'ambos'  // ← FIXED: Match backend choices
  city: string
  neighborhood: string
  bio: string
  whatsapp: string
  instagram?: string
}

export interface RegisterResponse {
  user_id: number
  professional_id: number
  access_token: string
  refresh_token: string
}

export interface RefreshRequest {
  refresh: string
}

export interface RefreshResponse {
  access: string
}
