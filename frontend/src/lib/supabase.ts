import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://phkwcxmjkfjncvsqtshm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoa3djeG1qa2ZqbmN2c3F0c2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODg2NzMsImV4cCI6MjA2ODY2NDY3M30.FFFmTEUTi69Tp2vW_TVPsoJmuWA-5PfGnKPAx0Bk65k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          created_at: string
          updated_at: string
          is_active: boolean
          meta_access_token: string | null
          meta_user_id: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          meta_access_token?: string | null
          meta_user_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          meta_access_token?: string | null
          meta_user_id?: string | null
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
          updated_at: string
          is_active: boolean
          metadata: any | null
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          metadata?: any | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          metadata?: any | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          chat_id: string
          content: string
          message_type: string
          user_id: string
          created_at: string
          metadata: any | null
        }
        Insert: {
          id?: string
          chat_id: string
          content: string
          message_type: string
          user_id: string
          created_at?: string
          metadata?: any | null
        }
        Update: {
          id?: string
          chat_id?: string
          content?: string
          message_type?: string
          user_id?: string
          created_at?: string
          metadata?: any | null
        }
      }
    }
  }
}