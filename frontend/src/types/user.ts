// User types for the application

export interface UserMetadata {
  full_name?: string
  role?: string
  meta_access_token?: string
  meta_user_id?: string
}

export interface User {
  id: string
  email?: string
  user_metadata?: UserMetadata
  created_at?: string
  updated_at?: string
  email_confirmed_at?: string
}

export interface AuthUser {
  user: User | null
  session: Record<string, unknown> | null
}