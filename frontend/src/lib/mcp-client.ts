/**
 * MCP Client for Meta Ads API integration
 * Provides a TypeScript interface to the Meta Ads MCP server tools
 */

export interface MCPToolCall {
  toolName: string
  params: Record<string, any>
}

export interface MCPResponse {
  success: boolean
  data?: any
  error?: string
  chartData?: any
}

export interface AdAccount {
  id: string
  name: string
  account_id: string
  account_status: number
  amount_spent: string
  balance: string
  currency: string
  business_city?: string
  business_country_code?: string
}

export interface Campaign {
  id: string
  name: string
  objective: string
  status: string
  daily_budget?: number
  lifetime_budget?: number
  buying_type: string
  start_time?: string
  stop_time?: string
  created_time: string
  updated_time: string
  bid_strategy?: string
}

export interface AdSet {
  id: string
  name: string
  campaign_id: string
  status: string
  daily_budget?: number
  lifetime_budget?: number
  targeting: any
  created_time: string
  updated_time: string
}

export interface Ad {
  id: string
  name: string
  adset_id: string
  campaign_id: string
  status: string
  creative: any
  created_time: string
  updated_time: string
  bid_amount?: number
}

export interface Insights {
  account_id: string
  account_name: string
  campaign_id?: string
  campaign_name?: string
  adset_id?: string
  adset_name?: string
  ad_id?: string
  ad_name?: string
  impressions: number
  clicks: number
  spend: number
  cpc: number
  cpm: number
  ctr: number
  reach: number
  frequency: number
  actions?: any[]
  conversions?: any[]
  unique_clicks: number
  cost_per_action_type?: any[]
}

export class MCPClient {
  private baseUrl: string
  private accessToken: string | null = null

  constructor(baseUrl: string = 'http://localhost:8080') {
    this.baseUrl = baseUrl
  }

  /**
   * Set the access token for authentication
   */
  setAccessToken(token: string) {
    this.accessToken = token
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.accessToken
  }

  /**
   * Make a call to an MCP tool
   */
  async callTool(toolName: string, params: Record<string, any> = {}): Promise<MCPResponse> {
    try {
      // Add access token to params if available
      if (this.accessToken) {
        params.access_token = this.accessToken
      }

      const response = await fetch(`${this.baseUrl}/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken || ''}`
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: data
      }
    } catch (error) {
      console.error(`MCP tool call failed for ${toolName}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ===== Account Management =====

  /**
   * Get ad accounts for the authenticated user
   */
  async getAdAccounts(limit: number = 10): Promise<MCPResponse> {
    return this.callTool('get_ad_accounts', { limit })
  }

  /**
   * Get detailed information about a specific ad account
   */
  async getAccountInfo(accountId: string): Promise<MCPResponse> {
    return this.callTool('get_account_info', { account_id: accountId })
  }

  // ===== Campaign Management =====

  /**
   * Get campaigns for an ad account
   */
  async getCampaigns(accountId: string, limit: number = 10, statusFilter: string = ''): Promise<MCPResponse> {
    const params: Record<string, any> = { account_id: accountId, limit }
    if (statusFilter) {
      params.status_filter = statusFilter
    }
    return this.callTool('get_campaigns', params)
  }

  /**
   * Get detailed information about a specific campaign
   */
  async getCampaignDetails(campaignId: string): Promise<MCPResponse> {
    return this.callTool('get_campaign_details', { campaign_id: campaignId })
  }

  /**
   * Create a new campaign
   */
  async createCampaign(params: {
    accountId: string
    name: string
    objective: string
    status?: string
    dailyBudget?: number
    lifetimeBudget?: number
    buyingType?: string
    bidStrategy?: string
  }): Promise<MCPResponse> {
    return this.callTool('create_campaign', {
      account_id: params.accountId,
      name: params.name,
      objective: params.objective,
      status: params.status || 'PAUSED',
      daily_budget: params.dailyBudget,
      lifetime_budget: params.lifetimeBudget,
      buying_type: params.buyingType || 'AUCTION',
      bid_strategy: params.bidStrategy
    })
  }

  /**
   * Update an existing campaign
   */
  async updateCampaign(campaignId: string, updates: {
    name?: string
    status?: string
    dailyBudget?: number
    lifetimeBudget?: number
    bidStrategy?: string
  }): Promise<MCPResponse> {
    return this.callTool('update_campaign', {
      campaign_id: campaignId,
      ...updates
    })
  }

  // ===== Ad Set Management =====

  /**
   * Get ad sets for a campaign
   */
  async getAdSets(campaignId: string, limit: number = 10): Promise<MCPResponse> {
    return this.callTool('get_adsets', { 
      campaign_id: campaignId, 
      limit 
    })
  }

  /**
   * Get detailed information about a specific ad set
   */
  async getAdSetDetails(adsetId: string): Promise<MCPResponse> {
    return this.callTool('get_adset_details', { adset_id: adsetId })
  }

  /**
   * Create a new ad set
   */
  async createAdSet(params: {
    accountId: string
    campaignId: string
    name: string
    dailyBudget?: number
    lifetimeBudget?: number
    targeting: any
    status?: string
  }): Promise<MCPResponse> {
    return this.callTool('create_adset', {
      account_id: params.accountId,
      campaign_id: params.campaignId,
      name: params.name,
      daily_budget: params.dailyBudget,
      lifetime_budget: params.lifetimeBudget,
      targeting: params.targeting,
      status: params.status || 'PAUSED'
    })
  }

  // ===== Ad Management =====

  /**
   * Get ads for an account or campaign
   */
  async getAds(accountId?: string, campaignId?: string, limit: number = 10): Promise<MCPResponse> {
    const params: Record<string, any> = { limit }
    if (accountId) params.account_id = accountId
    if (campaignId) params.campaign_id = campaignId
    
    return this.callTool('get_ads', params)
  }

  /**
   * Get detailed information about a specific ad
   */
  async getAdDetails(adId: string): Promise<MCPResponse> {
    return this.callTool('get_ad_details', { ad_id: adId })
  }

  /**
   * Create a new ad
   */
  async createAd(params: {
    accountId: string
    name: string
    adsetId: string
    creativeId: string
    status?: string
    bidAmount?: number
  }): Promise<MCPResponse> {
    return this.callTool('create_ad', {
      account_id: params.accountId,
      name: params.name,
      adset_id: params.adsetId,
      creative_id: params.creativeId,
      status: params.status || 'PAUSED',
      bid_amount: params.bidAmount
    })
  }

  /**
   * Update an existing ad
   */
  async updateAd(adId: string, updates: {
    status?: string
    bidAmount?: number
  }): Promise<MCPResponse> {
    return this.callTool('update_ad', {
      ad_id: adId,
      ...updates
    })
  }

  // ===== Creative Management =====

  /**
   * Get ad creatives for an ad
   */
  async getAdCreatives(adId: string): Promise<MCPResponse> {
    return this.callTool('get_ad_creatives', { ad_id: adId })
  }

  /**
   * Create a new ad creative
   */
  async createAdCreative(params: {
    accountId: string
    name: string
    imageHash?: string
    pageId?: string
    linkUrl?: string
    message?: string
    headline?: string
    description?: string
    callToActionType?: string
  }): Promise<MCPResponse> {
    return this.callTool('create_ad_creative', {
      account_id: params.accountId,
      name: params.name,
      image_hash: params.imageHash,
      page_id: params.pageId,
      link_url: params.linkUrl,
      message: params.message,
      headline: params.headline,
      description: params.description,
      call_to_action_type: params.callToActionType
    })
  }

  /**
   * Upload an image for ads
   */
  async uploadAdImage(params: {
    accountId: string
    imagePath: string
    name?: string
  }): Promise<MCPResponse> {
    return this.callTool('upload_ad_image', {
      account_id: params.accountId,
      image_path: params.imagePath,
      name: params.name
    })
  }

  // ===== Insights & Analytics =====

  /**
   * Get performance insights for campaigns, ad sets, ads, or accounts
   */
  async getInsights(params: {
    objectId: string
    timeRange?: string | { since: string; until: string }
    breakdown?: string
    level?: 'ad' | 'adset' | 'campaign' | 'account'
  }): Promise<MCPResponse> {
    return this.callTool('get_insights', {
      object_id: params.objectId,
      time_range: params.timeRange || 'last_30d',
      breakdown: params.breakdown || '',
      level: params.level || 'ad'
    })
  }

  // ===== Authentication =====

  /**
   * Get a login link for Meta authentication
   */
  async getLoginLink(): Promise<MCPResponse> {
    return this.callTool('get_login_link')
  }

  // ===== Budget & Scheduling =====

  /**
   * Get budget schedules for an account
   */
  async getBudgetSchedules(accountId: string): Promise<MCPResponse> {
    return this.callTool('get_budget_schedules', { account_id: accountId })
  }

  // ===== Ad Library =====

  /**
   * Get ad library assets
   */
  async getAdLibrary(accountId: string): Promise<MCPResponse> {
    return this.callTool('get_ad_library', { account_id: accountId })
  }

  // ===== Utility Methods =====

  /**
   * Generate chart data from insights
   */
  generateChartData(insights: any[]): any {
    if (!insights || !Array.isArray(insights)) {
      return null
    }

    // Extract time series data
    const timeSeriesData = insights.map(insight => ({
      date: insight.date_start,
      impressions: insight.impressions || 0,
      clicks: insight.clicks || 0,
      spend: parseFloat(insight.spend || 0),
      ctr: parseFloat(insight.ctr || 0),
      cpc: parseFloat(insight.cpc || 0),
      cpm: parseFloat(insight.cpm || 0)
    }))

    return {
      type: 'line',
      data: {
        labels: timeSeriesData.map(d => d.date),
        datasets: [
          {
            label: 'Impressions',
            data: timeSeriesData.map(d => d.impressions),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)'
          },
          {
            label: 'Clicks',
            data: timeSeriesData.map(d => d.clicks),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)'
          },
          {
            label: 'Spend ($)',
            data: timeSeriesData.map(d => d.spend),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    }
  }

  /**
   * Format insights data for display
   */
  formatInsights(insights: any[]): string {
    if (!insights || !Array.isArray(insights)) {
      return 'No insights data available'
    }

    const total = insights.reduce((acc, insight) => ({
      impressions: acc.impressions + (insight.impressions || 0),
      clicks: acc.clicks + (insight.clicks || 0),
      spend: acc.spend + parseFloat(insight.spend || 0),
      reach: acc.reach + (insight.reach || 0)
    }), { impressions: 0, clicks: 0, spend: 0, reach: 0 })

    const avgCtr = total.impressions > 0 ? (total.clicks / total.impressions * 100).toFixed(2) : '0.00'
    const avgCpc = total.clicks > 0 ? (total.spend / total.clicks).toFixed(2) : '0.00'
    const avgCpm = total.impressions > 0 ? (total.spend / total.impressions * 1000).toFixed(2) : '0.00'

    return `
📊 **Performance Summary**
- **Impressions**: ${total.impressions.toLocaleString()}
- **Clicks**: ${total.clicks.toLocaleString()}
- **Reach**: ${total.reach.toLocaleString()}
- **Spend**: $${total.spend.toFixed(2)}
- **CTR**: ${avgCtr}%
- **CPC**: $${avgCpc}
- **CPM**: $${avgCpm}
    `.trim()
  }
}

// Export a singleton instance
export const mcpClient = new MCPClient()