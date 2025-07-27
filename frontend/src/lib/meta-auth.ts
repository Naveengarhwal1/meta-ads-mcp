import { config } from './config'
import { supabase } from './supabase'

export interface MetaUser {
  id: string
  name: string
  email?: string
  access_token: string
  expires_at: number
}

export interface AdAccount {
  id: string
  name: string
  account_status: number
  currency: string
  timezone_name: string
  business_name?: string
  account_type: string
}

export interface Campaign {
  id: string
  name: string
  status: string
  objective: string
  daily_budget: number
  lifetime_budget: number
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  created_time: string
  updated_time: string
}

export interface Insights {
  date_start: string
  date_stop: string
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  reach: number
  frequency: number
}

interface FacebookResponse {
  authResponse?: {
    accessToken: string
    userID: string
    expiresIn: number
  }
  error?: {
    message: string
  }
}

interface FacebookUserResponse {
  id: string
  name: string
  email?: string
  error?: {
    message: string
  }
}

interface FacebookApiResponse<T> {
  data?: T[]
  error?: {
    message: string
  }
}

class MetaAuthService {
  private appId: string
  private appSecret: string

  constructor() {
    this.appId = process.env.NEXT_PUBLIC_META_APP_ID || '665587869862344'
    this.appSecret = process.env.NEXT_PUBLIC_META_APP_SECRET || '2eebb6109153f476f9df8625d673917e'
  }

  // Check if Facebook SDK is available
  private isFacebookSDKAvailable(): boolean {
    const available = typeof window !== 'undefined' && 
           window.FB !== undefined && 
           window.FB.api !== undefined &&
           window.FB.login !== undefined
    
    console.log('Facebook SDK availability check:', {
      window: typeof window !== 'undefined',
      FB: window.FB !== undefined,
      FB_api: window.FB?.api !== undefined,
      FB_login: window.FB?.login !== undefined,
      FB_init: window.FB?.init !== undefined,
      available
    })
    
    return available
  }

  // Get SDK status for debugging
  getSDKStatus(): { available: boolean; error?: string } {
    console.log('Getting SDK status...')
    
    if (typeof window === 'undefined') {
      console.log('Window not available (server-side rendering)')
      return { available: false, error: 'Window not available (server-side rendering)' }
    }
    
    if (!window.FB) {
      console.log('Facebook SDK not loaded')
      return { available: false, error: 'Facebook SDK not loaded' }
    }
    
    if (!window.FB.api) {
      console.log('Facebook SDK API not available')
      return { available: false, error: 'Facebook SDK API not available' }
    }
    
    if (!window.FB.login) {
      console.log('Facebook SDK login not available')
      return { available: false, error: 'Facebook SDK login not available' }
    }
    
    console.log('Facebook SDK is available')
    return { available: true }
  }

  private loadFacebookSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if SDK is already loaded
      if (window.FB) {
        console.log('Facebook SDK already loaded')
        resolve()
        return
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="connect.facebook.net"]')) {
        console.log('Facebook SDK script already loading, waiting...')
        this.waitForSDK(resolve, reject)
        return
      }

      console.log('Loading Facebook SDK...')
      
      // Create script element
      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      script.id = 'facebook-jssdk'

      // Handle script load
      script.onload = () => {
        console.log('Facebook SDK script loaded, waiting for initialization...')
        this.waitForSDK(resolve, reject)
      }

      // Handle script error
      script.onerror = () => {
        console.error('Failed to load Facebook SDK script')
        reject(new Error('Failed to load Facebook SDK from CDN'))
      }

      // Add script to document
      document.head.appendChild(script)
    })
  }

  private waitForSDK(resolve: () => void, reject: (error: Error) => void, attempts = 0): void {
    const maxAttempts = 10
    const interval = 500 // 500ms between attempts

    if (attempts >= maxAttempts) {
      reject(new Error('Facebook SDK failed to initialize after multiple attempts'))
      return
    }

    if (window.FB && window.FB.init) {
      console.log('Facebook SDK ready')
      resolve()
      return
    }

    console.log(`Waiting for Facebook SDK... (attempt ${attempts + 1}/${maxAttempts})`)
    
    setTimeout(() => {
      this.waitForSDK(resolve, reject, attempts + 1)
    }, interval)
  }

  async initMetaSDK(): Promise<void> {
    try {
      console.log('Initializing Facebook SDK...')
      await this.loadFacebookSDK()
      
      // Initialize Facebook SDK
      window.FB.init({
        appId: this.appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      })
      
      console.log('Facebook SDK initialized successfully with app ID:', this.appId)
    } catch (error) {
      console.error('Failed to initialize Facebook SDK:', error)
      throw new Error(`Failed to initialize Facebook SDK: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Login with Meta
  async loginWithMeta(): Promise<MetaUser> {
    try {
      // Ensure SDK is initialized
      await this.initMetaSDK()
      
      return new Promise((resolve, reject) => {
        // Check if Facebook SDK is loaded
        if (!this.isFacebookSDKAvailable()) {
          const status = this.getSDKStatus()
          reject(new Error(`Facebook SDK not available: ${status.error}`))
          return
        }

        window.FB.login((response: FacebookResponse) => {
          if (response.authResponse) {
            const { accessToken, userID, expiresIn } = response.authResponse
            const expiresAt = Date.now() + (expiresIn * 1000)
            
            // Get user info
            this.getUserInfo(accessToken)
              .then(({ name, email }) => {
                const metaUser: MetaUser = {
                  id: userID,
                  name,
                  email,
                  access_token: accessToken,
                  expires_at: expiresAt
                }
                resolve(metaUser)
              })
              .catch(reject)
          } else if (response.error) {
            reject(new Error(response.error.message))
          } else {
            reject(new Error('Login cancelled'))
          }
        }, {
          scope: 'ads_management,ads_read,business_management',
          return_scopes: true
        })
      })
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Get user information
  private async getUserInfo(accessToken: string): Promise<{ name: string; email?: string }> {
    return new Promise((resolve, reject) => {
      // Check if Facebook SDK is loaded
      if (!this.isFacebookSDKAvailable()) {
        const status = this.getSDKStatus()
        reject(new Error(`Facebook SDK not available: ${status.error}`))
        return
      }

      window.FB.api('/me', {
        access_token: accessToken,
        fields: 'name,email'
      }, (response: FacebookUserResponse) => {
        if (response && !response.error) {
          resolve({
            name: response.name,
            email: response.email
          })
        } else {
          reject(new Error('Failed to get user info'))
        }
      })
    })
  }

  // Get ad accounts for the user
  async getAdAccounts(accessToken: string): Promise<AdAccount[]> {
    return new Promise((resolve, reject) => {
      // Check if Facebook SDK is loaded
      if (!this.isFacebookSDKAvailable()) {
        const status = this.getSDKStatus()
        reject(new Error(`Facebook SDK not available: ${status.error}`))
        return
      }

      window.FB.api('/me/adaccounts', {
        access_token: accessToken,
        fields: 'id,name,account_status,currency,timezone_name,business_name,account_type'
      }, (response: FacebookApiResponse<AdAccount>) => {
        if (response && !response.error && response.data) {
          resolve(response.data)
        } else {
          reject(new Error('Failed to get ad accounts'))
        }
      })
    })
  }

  // Get campaigns for an ad account
  async getCampaigns(accountId: string, accessToken: string): Promise<Campaign[]> {
    return new Promise((resolve, reject) => {
      // Check if Facebook SDK is loaded
      if (!this.isFacebookSDKAvailable()) {
        const status = this.getSDKStatus()
        reject(new Error(`Facebook SDK not available: ${status.error}`))
        return
      }

      window.FB.api(`/${accountId}/campaigns`, {
        access_token: accessToken,
        fields: 'id,name,status,objective,daily_budget,lifetime_budget,spend,impressions,clicks,ctr,cpc,created_time,updated_time'
      }, (response: FacebookApiResponse<Campaign>) => {
        if (response && !response.error && response.data) {
          resolve(response.data)
        } else {
          reject(new Error('Failed to get campaigns'))
        }
      })
    })
  }

  // Get insights for a campaign
  async getInsights(campaignId: string, accessToken: string, dateRange?: { start: string; end: string }): Promise<Insights[]> {
    return new Promise((resolve, reject) => {
      // Check if Facebook SDK is loaded
      if (!this.isFacebookSDKAvailable()) {
        const status = this.getSDKStatus()
        reject(new Error(`Facebook SDK not available: ${status.error}`))
        return
      }

      const params: Record<string, string> = {
        access_token: accessToken,
        fields: 'date_start,date_stop,spend,impressions,clicks,ctr,cpc,cpm,reach,frequency'
      }

      if (dateRange) {
        params.date_preset = 'custom'
        params.time_range = JSON.stringify({
          since: dateRange.start,
          until: dateRange.end
        })
      } else {
        params.date_preset = 'last_30d'
      }

      window.FB.api(`/${campaignId}/insights`, params, (response: FacebookApiResponse<Insights>) => {
        if (response && !response.error && response.data) {
          resolve(response.data)
        } else {
          reject(new Error('Failed to get insights'))
        }
      })
    })
  }

  // Save Meta user to Supabase
  async saveMetaUserToSupabase(metaUser: MetaUser): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.auth.updateUser({
        data: {
          meta_user_id: metaUser.id,
          meta_access_token: metaUser.access_token,
          meta_token_expires_at: metaUser.expires_at
        }
      })
    }
  }

  // Check if Meta token is valid
  async validateToken(accessToken: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if Facebook SDK is loaded
      if (!this.isFacebookSDKAvailable()) {
        console.warn('Facebook SDK not loaded, skipping token validation')
        resolve(true) // Assume valid if SDK not available
        return
      }

      try {
        window.FB.api('/me', { access_token: accessToken }, (response: FacebookUserResponse) => {
          resolve(!response.error)
        })
      } catch (error) {
        console.error('Error validating token:', error)
        resolve(false)
      }
    })
  }

  // Refresh token if needed
  async refreshTokenIfNeeded(accessToken: string): Promise<string> {
    // Skip validation if SDK not available
    if (!this.isFacebookSDKAvailable()) {
      console.warn('Facebook SDK not loaded, skipping token validation')
      return accessToken
    }

    const isValid = await this.validateToken(accessToken)
    if (!isValid) {
      throw new Error('Token is invalid, please login again')
    }
    return accessToken
  }
}

// Global Meta auth service instance
export const metaAuthService = new MetaAuthService()

// Hook for using Meta auth in React components
export const useMetaAuth = () => {
  return {
    loginWithMeta: metaAuthService.loginWithMeta.bind(metaAuthService),
    getAdAccounts: metaAuthService.getAdAccounts.bind(metaAuthService),
    getCampaigns: metaAuthService.getCampaigns.bind(metaAuthService),
    getInsights: metaAuthService.getInsights.bind(metaAuthService),
    saveMetaUserToSupabase: metaAuthService.saveMetaUserToSupabase.bind(metaAuthService),
    validateToken: metaAuthService.validateToken.bind(metaAuthService),
    refreshTokenIfNeeded: metaAuthService.refreshTokenIfNeeded.bind(metaAuthService),
    getSDKStatus: metaAuthService.getSDKStatus.bind(metaAuthService)
  }
}

// Extend Window interface for Facebook SDK
declare global {
  interface Window {
    FB: {
      init: (config: Record<string, unknown>) => void
      login: (callback: (response: FacebookResponse) => void, options: Record<string, unknown>) => void
      api: (path: string, params: Record<string, unknown>, callback: (response: FacebookApiResponse<unknown>) => void) => void
    }
  }
}