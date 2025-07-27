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
    this.appId = config.meta.appId
    this.appSecret = config.meta.appSecret
  }

  // Initialize Meta SDK
  async initMetaSDK(): Promise<void> {
    if (typeof window !== 'undefined' && !window.FB) {
      await this.loadFacebookSDK()
    }
  }

  // Load Facebook SDK
  private loadFacebookSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('facebook-jssdk')) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'

      script.onload = () => {
        window.FB.init({
          appId: this.appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        })
        resolve()
      }

      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // Login with Meta
  async loginWithMeta(): Promise<MetaUser> {
    await this.initMetaSDK()

    return new Promise((resolve, reject) => {
      window.FB.login((response: FacebookResponse) => {
        if (response.authResponse) {
          const { accessToken, userID, expiresIn } = response.authResponse
          const expiresAt = Date.now() + (expiresIn * 1000)
          
          this.getUserInfo(accessToken).then(userInfo => {
            const metaUser: MetaUser = {
              id: userID,
              name: userInfo.name,
              email: userInfo.email,
              access_token: accessToken,
              expires_at: expiresAt
            }
            resolve(metaUser)
          }).catch(reject)
        } else {
          reject(new Error('Meta login failed'))
        }
      }, {
        scope: 'ads_management,ads_read,business_management,read_insights',
        return_scopes: true
      })
    })
  }

  // Get user information
  private async getUserInfo(accessToken: string): Promise<{ name: string; email?: string }> {
    return new Promise((resolve, reject) => {
      window.FB.api('/me', { access_token: accessToken }, (response: FacebookUserResponse) => {
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

  // Get ad accounts
  async getAdAccounts(accessToken: string): Promise<AdAccount[]> {
    return new Promise((resolve, reject) => {
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

    return new Promise((resolve, reject) => {
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
      window.FB.api('/me', { access_token: accessToken }, (response: FacebookUserResponse) => {
        resolve(!response.error)
      })
    })
  }

  // Refresh token if needed
  async refreshTokenIfNeeded(accessToken: string): Promise<string> {
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
    refreshTokenIfNeeded: metaAuthService.refreshTokenIfNeeded.bind(metaAuthService)
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