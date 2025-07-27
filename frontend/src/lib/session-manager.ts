import { supabase } from './supabase'
import { metaAuthService } from './meta-auth'

export interface SessionData {
  userId: string
  metaUserId?: string
  metaAccessToken?: string
  metaTokenExpiresAt?: number
  lastActivity: number
  isActive: boolean
}

export interface TokenInfo {
  accessToken: string
  expiresAt: number
  isValid: boolean
  needsRefresh: boolean
}

class SessionManager {
  private sessionTimeout: number = 30 * 60 * 1000 // 30 minutes
  private refreshThreshold: number = 5 * 60 * 1000 // 5 minutes before expiry

  // Initialize session manager
  async initialize(): Promise<SessionData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return null
      }

      const sessionData: SessionData = {
        userId: user.id,
        metaUserId: user.user_metadata?.meta_user_id,
        metaAccessToken: user.user_metadata?.meta_access_token,
        metaTokenExpiresAt: user.user_metadata?.meta_token_expires_at,
        lastActivity: Date.now(),
        isActive: true
      }

      // Check if Meta token is valid
      if (sessionData.metaAccessToken) {
        const tokenInfo = await this.validateMetaToken(sessionData.metaAccessToken)
        if (!tokenInfo.isValid) {
          // Clear invalid token
          await this.clearMetaToken()
          sessionData.metaAccessToken = undefined
          sessionData.metaTokenExpiresAt = undefined
        }
      }

      // Start session monitoring
      this.startSessionMonitoring(sessionData)

      return sessionData
    } catch (error) {
      console.error('Failed to initialize session:', error)
      return null
    }
  }

  // Validate Meta token
  async validateMetaToken(accessToken: string): Promise<TokenInfo> {
    try {
      const isValid = await metaAuthService.validateToken(accessToken)
      const expiresAt = Date.now() + (60 * 60 * 1000) // Assume 1 hour if not provided
      
      return {
        accessToken,
        expiresAt,
        isValid,
        needsRefresh: isValid && (expiresAt - Date.now()) < this.refreshThreshold
      }
    } catch (error) {
      return {
        accessToken,
        expiresAt: 0,
        isValid: false,
        needsRefresh: false
      }
    }
  }

  // Refresh Meta token
  async refreshMetaToken(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.user_metadata?.meta_access_token) {
        return null
      }

      // For Meta tokens, we need to re-authenticate
      // This is a simplified approach - in production you might want to use refresh tokens
      const metaUser = await metaAuthService.loginWithMeta()
      await metaAuthService.saveMetaUserToSupabase(metaUser)
      
      return metaUser.access_token
    } catch (error) {
      console.error('Failed to refresh Meta token:', error)
      return null
    }
  }

  // Update session activity
  async updateActivity(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase.auth.updateUser({
          data: {
            last_activity: Date.now()
          }
        })
      }
    } catch (error) {
      console.error('Failed to update activity:', error)
    }
  }

  // Check if session is active
  async isSessionActive(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return false
      }

      const lastActivity = user.user_metadata?.last_activity || 0
      const timeSinceLastActivity = Date.now() - lastActivity

      return timeSinceLastActivity < this.sessionTimeout
    } catch (error) {
      return false
    }
  }

  // Extend session
  async extendSession(): Promise<void> {
    await this.updateActivity()
  }

  // Clear Meta token
  async clearMetaToken(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase.auth.updateUser({
          data: {
            meta_user_id: null,
            meta_access_token: null,
            meta_token_expires_at: null
          }
        })
      }
    } catch (error) {
      console.error('Failed to clear Meta token:', error)
    }
  }

  // Logout and clear session
  async logout(): Promise<void> {
    try {
      // Stop any active monitoring
      // This would be handled by the real-time service
      
      // Clear Meta token
      await this.clearMetaToken()
      
      // Sign out from Supabase
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  // Start session monitoring
  private startSessionMonitoring(sessionData: SessionData): void {
    // Check session every minute
    setInterval(async () => {
      const isActive = await this.isSessionActive()
      
      if (!isActive) {
        console.log('Session expired, logging out...')
        await this.logout()
        window.location.href = '/login'
      }
    }, 60000) // Check every minute

    // Update activity on user interaction
    const updateActivityOnInteraction = () => {
      this.updateActivity()
    }

    // Add event listeners for user activity
    window.addEventListener('mousedown', updateActivityOnInteraction)
    window.addEventListener('keydown', updateActivityOnInteraction)
    window.addEventListener('scroll', updateActivityOnInteraction)
    window.addEventListener('click', updateActivityOnInteraction)

    // Clean up event listeners on page unload
    window.addEventListener('beforeunload', () => {
      window.removeEventListener('mousedown', updateActivityOnInteraction)
      window.removeEventListener('keydown', updateActivityOnInteraction)
      window.removeEventListener('scroll', updateActivityOnInteraction)
      window.removeEventListener('click', updateActivityOnInteraction)
    })
  }

  // Get current session data
  async getCurrentSession(): Promise<SessionData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return null
      }

      return {
        userId: user.id,
        metaUserId: user.user_metadata?.meta_user_id,
        metaAccessToken: user.user_metadata?.meta_access_token,
        metaTokenExpiresAt: user.user_metadata?.meta_token_expires_at,
        lastActivity: user.user_metadata?.last_activity || Date.now(),
        isActive: await this.isSessionActive()
      }
    } catch (error) {
      console.error('Failed to get current session:', error)
      return null
    }
  }

  // Set session timeout
  setSessionTimeout(timeout: number): void {
    this.sessionTimeout = timeout
  }

  // Get session timeout
  getSessionTimeout(): number {
    return this.sessionTimeout
  }
}

// Global session manager instance
export const sessionManager = new SessionManager()

// Hook for using session manager in React components
export const useSessionManager = () => {
  return {
    initialize: sessionManager.initialize.bind(sessionManager),
    validateMetaToken: sessionManager.validateMetaToken.bind(sessionManager),
    refreshMetaToken: sessionManager.refreshMetaToken.bind(sessionManager),
    updateActivity: sessionManager.updateActivity.bind(sessionManager),
    isSessionActive: sessionManager.isSessionActive.bind(sessionManager),
    extendSession: sessionManager.extendSession.bind(sessionManager),
    clearMetaToken: sessionManager.clearMetaToken.bind(sessionManager),
    logout: sessionManager.logout.bind(sessionManager),
    getCurrentSession: sessionManager.getCurrentSession.bind(sessionManager),
    setSessionTimeout: sessionManager.setSessionTimeout.bind(sessionManager),
    getSessionTimeout: sessionManager.getSessionTimeout.bind(sessionManager)
  }
}