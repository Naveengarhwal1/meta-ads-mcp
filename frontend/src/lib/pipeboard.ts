import { config } from './config'

// Pipeboard API client for local development
export class PipeboardClient {
  private token: string
  private baseUrl: string

  constructor() {
    this.token = config.pipeboard.token
    this.baseUrl = config.pipeboard.baseUrl
  }

  // Check if Pipeboard is configured
  isConfigured(): boolean {
    return this.token !== 'your_pipeboard_token_here' && this.token !== ''
  }

  // Make authenticated request to Pipeboard API
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('Pipeboard token not configured. Please set NEXT_PUBLIC_PIPEBOARD_TOKEN in your .env.local file')
    }

    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      if (!response.ok) {
        throw new Error(`Pipeboard API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Pipeboard API request failed:', error)
      throw error
    }
  }

  // Get user profile
  async getUserProfile() {
    return this.request<{ id: string; email: string; name: string }>('/user/profile')
  }

  // Get user's Meta Ads accounts
  async getMetaAdsAccounts() {
    return this.request<{ accounts: Array<{ id: string; name: string; status: string }> }>('/meta-ads/accounts')
  }

  // Get campaigns for an account
  async getCampaigns(accountId: string) {
    return this.request<{ campaigns: Array<{ id: string; name: string; status: string; spend: number }> }>(`/meta-ads/accounts/${accountId}/campaigns`)
  }

  // Get insights for a campaign
  async getInsights(campaignId: string, dateRange?: { start: string; end: string }) {
    const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : ''
    return this.request<{ insights: Array<{ date: string; spend: number; impressions: number; clicks: number }> }>(`/meta-ads/campaigns/${campaignId}/insights${params}`)
  }

  // Create a new campaign
  async createCampaign(accountId: string, campaignData: {
    name: string
    objective: string
    dailyBudget: number
  }) {
    return this.request<{ id: string; name: string; status: string }>(`/meta-ads/accounts/${accountId}/campaigns`, {
      method: 'POST',
      body: JSON.stringify(campaignData)
    })
  }

  // Update campaign status
  async updateCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED') {
    return this.request<{ id: string; status: string }>(`/meta-ads/campaigns/${campaignId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  }
}

// Global Pipeboard client instance
export const pipeboardClient = new PipeboardClient()

// Hook for using Pipeboard in React components
export const usePipeboard = () => {
  return {
    client: pipeboardClient,
    isConfigured: pipeboardClient.isConfigured(),
    getUserProfile: pipeboardClient.getUserProfile.bind(pipeboardClient),
    getMetaAdsAccounts: pipeboardClient.getMetaAdsAccounts.bind(pipeboardClient),
    getCampaigns: pipeboardClient.getCampaigns.bind(pipeboardClient),
    getInsights: pipeboardClient.getInsights.bind(pipeboardClient),
    createCampaign: pipeboardClient.createCampaign.bind(pipeboardClient),
    updateCampaignStatus: pipeboardClient.updateCampaignStatus.bind(pipeboardClient)
  }
}