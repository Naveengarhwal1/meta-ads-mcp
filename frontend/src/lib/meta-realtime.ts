import { AdAccount, Campaign, Insights } from './meta-auth'

export interface RealtimeData {
  accountId: string
  campaignId?: string
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  reach: number
  frequency: number
  timestamp: string
}

export interface RealtimeConfig {
  accountId: string
  updateInterval: number // milliseconds
  onDataUpdate: (data: RealtimeData[]) => void
  onError: (error: string) => void
}

export interface AccountStrategy {
  id: string
  accountId: string
  name: string
  type: 'budget_optimization' | 'performance_optimization' | 'audience_expansion'
  status: 'active' | 'paused' | 'completed'
  rules: {
    minCtr: number
    maxCpc: number
    targetCpm: number
    budgetThreshold: number
  }
  actions: {
    pauseLowPerforming: boolean
    increaseBudget: boolean
    adjustBidding: boolean
    expandAudience: boolean
  }
  createdAt: string
  updatedAt: string
}

interface FacebookApiResponse<T> {
  data?: T[]
  error?: {
    message: string
  }
}

class MetaRealtimeService {
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private isConnected: boolean = false
  private accessToken: string | null = null

  // Set access token for API calls
  setAccessToken(token: string): void {
    this.accessToken = token
  }

  // Start real-time monitoring for an account
  async startRealtimeMonitoring(config: RealtimeConfig): Promise<void> {
    const { accountId, updateInterval, onDataUpdate, onError } = config

    // Stop existing monitoring for this account
    this.stopRealtimeMonitoring(accountId)

    // Start new monitoring
    const interval = setInterval(async () => {
      try {
        const data = await this.fetchRealtimeData(accountId)
        onDataUpdate(data)
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Failed to fetch real-time data')
      }
    }, updateInterval)

    this.intervals.set(accountId, interval)
    this.isConnected = true
  }

  // Stop real-time monitoring for an account
  stopRealtimeMonitoring(accountId: string): void {
    const interval = this.intervals.get(accountId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(accountId)
    }
  }

  // Stop all real-time monitoring
  stopAllMonitoring(): void {
    this.intervals.forEach((interval) => {
      clearInterval(interval)
    })
    this.intervals.clear()
    this.isConnected = false
  }

  // Fetch real-time data for an account
  private async fetchRealtimeData(accountId: string): Promise<RealtimeData[]> {
    if (!this.accessToken) {
      throw new Error('Access token not set')
    }

    try {
      // Get campaigns for the account
      const campaigns = await this.getCampaigns(accountId)
      
      // Get insights for each campaign
      const realtimeData: RealtimeData[] = []
      
      for (const campaign of campaigns) {
        const insights = await this.getCampaignInsights(campaign.id)
        
        if (insights.length > 0) {
          const latestInsight = insights[0]
          realtimeData.push({
            accountId,
            campaignId: campaign.id,
            spend: latestInsight.spend,
            impressions: latestInsight.impressions,
            clicks: latestInsight.clicks,
            ctr: latestInsight.ctr,
            cpc: latestInsight.cpc,
            cpm: latestInsight.cpm,
            reach: latestInsight.reach,
            frequency: latestInsight.frequency,
            timestamp: new Date().toISOString()
          })
        }
      }

      return realtimeData
    } catch (error) {
      throw new Error('Failed to fetch real-time data')
    }
  }

  // Get campaigns for an account
  private async getCampaigns(accountId: string): Promise<Campaign[]> {
    return new Promise((resolve, reject) => {
      if (!this.accessToken) {
        reject(new Error('Access token not set'))
        return
      }

      window.FB.api(`/${accountId}/campaigns`, {
        access_token: this.accessToken,
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
  private async getCampaignInsights(campaignId: string): Promise<Insights[]> {
    return new Promise((resolve, reject) => {
      if (!this.accessToken) {
        reject(new Error('Access token not set'))
        return
      }

      window.FB.api(`/${campaignId}/insights`, {
        access_token: this.accessToken,
        fields: 'date_start,date_stop,spend,impressions,clicks,ctr,cpc,cpm,reach,frequency',
        date_preset: 'today'
      }, (response: FacebookApiResponse<Insights>) => {
        if (response && !response.error && response.data) {
          resolve(response.data)
        } else {
          reject(new Error('Failed to get insights'))
        }
      })
    })
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  // Get active monitoring accounts
  getActiveAccounts(): string[] {
    return Array.from(this.intervals.keys())
  }

  // Generate account strategies
  async generateAccountStrategies(accountId: string): Promise<AccountStrategy[]> {
    if (!this.accessToken) {
      throw new Error('Access token not set')
    }

    try {
      const campaigns = await this.getCampaigns(accountId)
      const strategies: AccountStrategy[] = []

      // Analyze campaign performance and generate strategies
      for (const campaign of campaigns) {
        if (campaign.status === 'ACTIVE') {
          const insights = await this.getCampaignInsights(campaign.id)
          
          if (insights.length > 0) {
            const latestInsight = insights[0]
            
            // Generate strategy based on performance
            const strategy = this.analyzePerformanceAndGenerateStrategy(
              campaign,
              latestInsight
            )
            
            strategies.push(strategy)
          }
        }
      }

      return strategies
    } catch (error) {
      throw new Error('Failed to generate account strategies')
    }
  }

  // Analyze performance and generate strategy
  private analyzePerformanceAndGenerateStrategy(
    campaign: Campaign,
    insight: Insights
  ): AccountStrategy {
    const strategy: AccountStrategy = {
      id: `strategy_${campaign.id}`,
      accountId: campaign.id.split('_')[0], // Extract account ID from campaign ID
      name: `${campaign.name} Optimization Strategy`,
      type: 'performance_optimization',
      status: 'active',
      rules: {
        minCtr: 1.0,
        maxCpc: 2.0,
        targetCpm: 15.0,
        budgetThreshold: campaign.daily_budget * 0.8
      },
      actions: {
        pauseLowPerforming: insight.ctr < 1.0,
        increaseBudget: insight.cpc < 1.5 && insight.ctr > 2.0,
        adjustBidding: insight.cpc > 2.0,
        expandAudience: insight.reach < 10000
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return strategy
  }

  // Execute strategy actions
  async executeStrategy(strategy: AccountStrategy): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Access token not set')
    }

    try {
      // Execute actions based on strategy
      if (strategy.actions.pauseLowPerforming) {
        // Pause low performing campaigns
        await this.pauseCampaign(strategy.accountId)
      }

      if (strategy.actions.increaseBudget) {
        // Increase budget for high performing campaigns
        await this.updateCampaignBudget(strategy.accountId, 'increase')
      }

      if (strategy.actions.adjustBidding) {
        // Adjust bidding strategy
        await this.updateBiddingStrategy(strategy.accountId, 'lower')
      }

      if (strategy.actions.expandAudience) {
        // Expand audience targeting
        await this.expandAudienceTargeting(strategy.accountId)
      }
    } catch (error) {
      throw new Error('Failed to execute strategy')
    }
  }

  // Pause campaign
  private async pauseCampaign(campaignId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      window.FB.api(`/${campaignId}`, 'POST', {
        access_token: this.accessToken,
        status: 'PAUSED'
      }, (response: FacebookApiResponse<unknown>) => {
        if (response && !response.error) {
          resolve()
        } else {
          reject(new Error('Failed to pause campaign'))
        }
      })
    })
  }

  // Update campaign budget
  private async updateCampaignBudget(campaignId: string, action: 'increase' | 'decrease'): Promise<void> {
    // Implementation for budget updates
    console.log(`Updating budget for campaign ${campaignId}: ${action}`)
  }

  // Update bidding strategy
  private async updateBiddingStrategy(campaignId: string, action: 'lower' | 'raise'): Promise<void> {
    // Implementation for bidding updates
    console.log(`Updating bidding for campaign ${campaignId}: ${action}`)
  }

  // Expand audience targeting
  private async expandAudienceTargeting(campaignId: string): Promise<void> {
    // Implementation for audience expansion
    console.log(`Expanding audience for campaign ${campaignId}`)
  }
}

// Global real-time service instance
export const metaRealtimeService = new MetaRealtimeService()

// Hook for using real-time service in React components
export const useMetaRealtime = () => {
  return {
    setAccessToken: metaRealtimeService.setAccessToken.bind(metaRealtimeService),
    startRealtimeMonitoring: metaRealtimeService.startRealtimeMonitoring.bind(metaRealtimeService),
    stopRealtimeMonitoring: metaRealtimeService.stopRealtimeMonitoring.bind(metaRealtimeService),
    stopAllMonitoring: metaRealtimeService.stopAllMonitoring.bind(metaRealtimeService),
    getConnectionStatus: metaRealtimeService.getConnectionStatus.bind(metaRealtimeService),
    getActiveAccounts: metaRealtimeService.getActiveAccounts.bind(metaRealtimeService),
    generateAccountStrategies: metaRealtimeService.generateAccountStrategies.bind(metaRealtimeService),
    executeStrategy: metaRealtimeService.executeStrategy.bind(metaRealtimeService)
  }
}