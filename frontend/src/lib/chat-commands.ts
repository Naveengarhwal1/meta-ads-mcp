/**
 * Chat Command Parser for Meta Ads MCP Integration
 * Converts natural language messages into MCP tool calls
 */

import { MCPToolCall, mcpClient } from './mcp-client'

export interface ChatCommand {
  type: string
  params: Record<string, any>
  description?: string
}

export interface ParsedCommand {
  success: boolean
  command?: ChatCommand
  error?: string
  suggestions?: string[]
}

/**
 * Extract campaign ID from text
 */
function extractCampaignId(text: string): string | null {
  const campaignMatch = text.match(/campaign[_\s]?(\d+)/i)
  return campaignMatch ? campaignMatch[1] : null
}

/**
 * Extract account ID from text
 */
function extractAccountId(text: string): string | null {
  const accountMatch = text.match(/act[_\s]?(\d+)/i)
  return accountMatch ? `act_${accountMatch[1]}` : null
}

/**
 * Extract ad ID from text
 */
function extractAdId(text: string): string | null {
  const adMatch = text.match(/ad[_\s]?(\d+)/i)
  return adMatch ? adMatch[1] : null
}

/**
 * Extract time range from text
 */
function extractTimeRange(text: string): string {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('today')) return 'today'
  if (lowerText.includes('yesterday')) return 'yesterday'
  if (lowerText.includes('this week')) return 'this_week_mon_today'
  if (lowerText.includes('last week')) return 'last_week_mon_sun'
  if (lowerText.includes('this month')) return 'this_month'
  if (lowerText.includes('last month')) return 'last_month'
  if (lowerText.includes('last 7 days') || lowerText.includes('past week')) return 'last_7d'
  if (lowerText.includes('last 30 days') || lowerText.includes('past month')) return 'last_30d'
  if (lowerText.includes('last 90 days') || lowerText.includes('past quarter')) return 'last_90d'
  
  return 'last_30d' // default
}

/**
 * Extract budget amount from text
 */
function extractBudget(text: string): number | null {
  const budgetMatch = text.match(/\$?(\d+(?:\.\d+)?)/)
  return budgetMatch ? parseFloat(budgetMatch[1]) : null
}

/**
 * Extract status from text
 */
function extractStatus(text: string): string {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('active') || lowerText.includes('start') || lowerText.includes('run')) {
    return 'ACTIVE'
  }
  if (lowerText.includes('pause') || lowerText.includes('stop')) {
    return 'PAUSED'
  }
  if (lowerText.includes('archive') || lowerText.includes('delete')) {
    return 'ARCHIVED'
  }
  
  return 'PAUSED' // default
}

/**
 * Parse natural language chat commands into MCP tool calls
 */
export function parseChatCommand(message: string): ParsedCommand {
  const lowerMessage = message.toLowerCase().trim()
  
  // ===== Account Management =====
  
  if (lowerMessage.includes('show') && (lowerMessage.includes('account') || lowerMessage.includes('accounts'))) {
    return {
      success: true,
      command: {
        type: 'get_ad_accounts',
        params: { limit: 10 },
        description: 'Fetching your ad accounts...'
      }
    }
  }
  
  if (lowerMessage.includes('account') && lowerMessage.includes('details')) {
    const accountId = extractAccountId(message)
    if (!accountId) {
      return {
        success: false,
        error: 'Please specify an account ID (e.g., "Show account details for act_123456789")',
        suggestions: ['Show account details for act_123456789', 'Get account info for act_123456789']
      }
    }
    
    return {
      success: true,
      command: {
        type: 'get_account_info',
        params: { account_id: accountId },
        description: `Fetching details for account ${accountId}...`
      }
    }
  }
  
  // ===== Campaign Management =====
  
  if (lowerMessage.includes('campaign') && (lowerMessage.includes('list') || lowerMessage.includes('show'))) {
    const accountId = extractAccountId(message)
    const statusFilter = lowerMessage.includes('active') ? 'ACTIVE' : 
                        lowerMessage.includes('pause') ? 'PAUSED' : ''
    
    return {
      success: true,
      command: {
        type: 'get_campaigns',
        params: { 
          account_id: accountId,
          limit: 10,
          status_filter: statusFilter
        },
        description: 'Fetching campaigns...'
      }
    }
  }
  
  if (lowerMessage.includes('campaign') && lowerMessage.includes('details')) {
    const campaignId = extractCampaignId(message)
    if (!campaignId) {
      return {
        success: false,
        error: 'Please specify a campaign ID (e.g., "Show campaign details for campaign_123")',
        suggestions: ['Show campaign details for campaign_123', 'Get campaign info for campaign_123']
      }
    }
    
    return {
      success: true,
      command: {
        type: 'get_campaign_details',
        params: { campaign_id: campaignId },
        description: `Fetching details for campaign ${campaignId}...`
      }
    }
  }
  
  if (lowerMessage.includes('create') && lowerMessage.includes('campaign')) {
    // Extract campaign name
    const nameMatch = message.match(/['"]([^'"]+)['"]/)
    const campaignName = nameMatch ? nameMatch[1] : 'New Campaign'
    
    const accountId = extractAccountId(message)
    const budget = extractBudget(message)
    const status = extractStatus(message)
    
    return {
      success: true,
      command: {
        type: 'create_campaign',
        params: {
          account_id: accountId,
          name: campaignName,
          objective: 'OUTCOME_TRAFFIC', // default
          status: status,
          daily_budget: budget,
          buying_type: 'AUCTION'
        },
        description: `Creating campaign "${campaignName}"...`
      }
    }
  }
  
  if (lowerMessage.includes('update') && lowerMessage.includes('campaign')) {
    const campaignId = extractCampaignId(message)
    if (!campaignId) {
      return {
        success: false,
        error: 'Please specify a campaign ID to update',
        suggestions: ['Update campaign campaign_123 status to active', 'Update campaign campaign_123 budget to $100']
      }
    }
    
    const updates: Record<string, any> = {}
    const budget = extractBudget(message)
    const status = extractStatus(message)
    
    if (budget) updates.daily_budget = budget
    if (status) updates.status = status
    
    return {
      success: true,
      command: {
        type: 'update_campaign',
        params: {
          campaign_id: campaignId,
          ...updates
        },
        description: `Updating campaign ${campaignId}...`
      }
    }
  }
  
  // ===== Ad Set Management =====
  
  if (lowerMessage.includes('ad set') && (lowerMessage.includes('list') || lowerMessage.includes('show'))) {
    const campaignId = extractCampaignId(message)
    if (!campaignId) {
      return {
        success: false,
        error: 'Please specify a campaign ID to show ad sets',
        suggestions: ['Show ad sets for campaign_123', 'List ad sets in campaign_123']
      }
    }
    
    return {
      success: true,
      command: {
        type: 'get_adsets',
        params: {
          campaign_id: campaignId,
          limit: 10
        },
        description: `Fetching ad sets for campaign ${campaignId}...`
      }
    }
  }
  
  // ===== Ad Management =====
  
  if (lowerMessage.includes('ad') && (lowerMessage.includes('list') || lowerMessage.includes('show'))) {
    const campaignId = extractCampaignId(message)
    const accountId = extractAccountId(message)
    
    return {
      success: true,
      command: {
        type: 'get_ads',
        params: {
          account_id: accountId,
          campaign_id: campaignId,
          limit: 10
        },
        description: 'Fetching ads...'
      }
    }
  }
  
  if (lowerMessage.includes('ad') && lowerMessage.includes('details')) {
    const adId = extractAdId(message)
    if (!adId) {
      return {
        success: false,
        error: 'Please specify an ad ID',
        suggestions: ['Show ad details for ad_123', 'Get ad info for ad_123']
      }
    }
    
    return {
      success: true,
      command: {
        type: 'get_ad_details',
        params: { ad_id: adId },
        description: `Fetching details for ad ${adId}...`
      }
    }
  }
  
  // ===== Performance & Insights =====
  
  if (lowerMessage.includes('performance') || lowerMessage.includes('insights') || lowerMessage.includes('analytics')) {
    const campaignId = extractCampaignId(message)
    const accountId = extractAccountId(message)
    const adId = extractAdId(message)
    const timeRange = extractTimeRange(message)
    
    let objectId = campaignId || accountId || adId
    if (!objectId) {
      return {
        success: false,
        error: 'Please specify a campaign, account, or ad ID for performance data',
        suggestions: ['Show performance for campaign_123', 'Get insights for act_123456789', 'Show analytics for ad_123']
      }
    }
    
    return {
      success: true,
      command: {
        type: 'get_insights',
        params: {
          object_id: objectId,
          time_range: timeRange,
          level: campaignId ? 'campaign' : accountId ? 'account' : 'ad'
        },
        description: `Fetching performance data for ${objectId}...`
      }
    }
  }
  
  if (lowerMessage.includes('spend') || lowerMessage.includes('cost') || lowerMessage.includes('budget')) {
    const accountId = extractAccountId(message)
    const timeRange = extractTimeRange(message)
    
    return {
      success: true,
      command: {
        type: 'get_insights',
        params: {
          object_id: accountId,
          time_range: timeRange,
          level: 'account'
        },
        description: `Fetching spending data for account ${accountId}...`
      }
    }
  }
  
  // ===== Authentication =====
  
  if (lowerMessage.includes('login') || lowerMessage.includes('auth') || lowerMessage.includes('connect')) {
    return {
      success: true,
      command: {
        type: 'get_login_link',
        params: {},
        description: 'Generating Meta authentication link...'
      }
    }
  }
  
  // ===== Budget & Scheduling =====
  
  if (lowerMessage.includes('budget') && lowerMessage.includes('schedule')) {
    const accountId = extractAccountId(message)
    
    return {
      success: true,
      command: {
        type: 'get_budget_schedules',
        params: { account_id: accountId },
        description: `Fetching budget schedules for account ${accountId}...`
      }
    }
  }
  
  // ===== Ad Library =====
  
  if (lowerMessage.includes('ad library') || lowerMessage.includes('creative')) {
    const accountId = extractAccountId(message)
    
    return {
      success: true,
      command: {
        type: 'get_ad_library',
        params: { account_id: accountId },
        description: `Fetching ad library for account ${accountId}...`
      }
    }
  }
  
  // ===== Help & Suggestions =====
  
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return {
      success: false,
      error: 'Here are some things you can ask me:',
      suggestions: [
        'Show my ad accounts',
        'List campaigns for act_123456789',
        'Show campaign details for campaign_123',
        'Create a new campaign called "Summer Sale"',
        'Show performance for campaign_123',
        'Get insights for the last 30 days',
        'Update campaign campaign_123 budget to $100',
        'Show ad sets for campaign_123',
        'List ads in campaign_123',
        'Show ad details for ad_123',
        'Get budget schedules for act_123456789',
        'Show ad library for act_123456789'
      ]
    }
  }
  
  // ===== No match found =====
  
  return {
    success: false,
    error: 'I didn\'t understand that command. Try asking for help to see what I can do.',
    suggestions: [
      'Show my ad accounts',
      'List campaigns',
      'Show performance data',
      'Create a new campaign',
      'Type "help" for more options'
    ]
  }
}

/**
 * Execute a chat command using the MCP client
 */
export async function executeChatCommand(command: ChatCommand): Promise<any> {
  try {
    const response = await mcpClient.callTool(command.type, command.params)
    
    if (!response.success) {
      throw new Error(response.error || 'Unknown error')
    }
    
    return response.data
  } catch (error) {
    console.error('Error executing chat command:', error)
    throw error
  }
}

/**
 * Format command response for display
 */
export function formatCommandResponse(command: ChatCommand, data: any): string {
  switch (command.type) {
    case 'get_ad_accounts':
      return formatAdAccounts(data)
    case 'get_campaigns':
      return formatCampaigns(data)
    case 'get_insights':
      return formatInsights(data)
    case 'get_ads':
      return formatAds(data)
    case 'get_login_link':
      return formatLoginLink(data)
    default:
      return JSON.stringify(data, null, 2)
  }
}

function formatAdAccounts(data: any): string {
  if (!data?.data || !Array.isArray(data.data)) {
    return 'No ad accounts found.'
  }
  
  const accounts = data.data
  let result = `📊 **Found ${accounts.length} Ad Account(s)**\n\n`
  
  accounts.forEach((account: any, index: number) => {
    result += `**${index + 1}. ${account.name}**\n`
    result += `   ID: ${account.id}\n`
    result += `   Status: ${account.account_status === 1 ? '✅ Active' : '❌ Inactive'}\n`
    result += `   Balance: $${account.balance} ${account.currency}\n`
    result += `   Spent: $${account.amount_spent} ${account.currency}\n`
    if (account.business_city) {
      result += `   Location: ${account.business_city}, ${account.business_country_code}\n`
    }
    result += '\n'
  })
  
  return result
}

function formatCampaigns(data: any): string {
  if (!data?.data || !Array.isArray(data.data)) {
    return 'No campaigns found.'
  }
  
  const campaigns = data.data
  let result = `📈 **Found ${campaigns.length} Campaign(s)**\n\n`
  
  campaigns.forEach((campaign: any, index: number) => {
    result += `**${index + 1}. ${campaign.name}**\n`
    result += `   ID: ${campaign.id}\n`
    result += `   Objective: ${campaign.objective}\n`
    result += `   Status: ${campaign.status === 'ACTIVE' ? '🟢 Active' : campaign.status === 'PAUSED' ? '🟡 Paused' : '🔴 Archived'}\n`
    if (campaign.daily_budget) {
      result += `   Daily Budget: $${campaign.daily_budget}\n`
    }
    if (campaign.lifetime_budget) {
      result += `   Lifetime Budget: $${campaign.lifetime_budget}\n`
    }
    result += `   Created: ${new Date(campaign.created_time).toLocaleDateString()}\n`
    result += '\n'
  })
  
  return result
}

function formatInsights(data: any): string {
  if (!data?.data || !Array.isArray(data.data)) {
    return 'No insights data available.'
  }
  
  return mcpClient.formatInsights(data.data)
}

function formatAds(data: any): string {
  if (!data?.data || !Array.isArray(data.data)) {
    return 'No ads found.'
  }
  
  const ads = data.data
  let result = `📢 **Found ${ads.length} Ad(s)**\n\n`
  
  ads.forEach((ad: any, index: number) => {
    result += `**${index + 1}. ${ad.name}**\n`
    result += `   ID: ${ad.id}\n`
    result += `   Status: ${ad.status === 'ACTIVE' ? '🟢 Active' : ad.status === 'PAUSED' ? '🟡 Paused' : '🔴 Archived'}\n`
    result += `   Campaign: ${ad.campaign_id}\n`
    result += `   Ad Set: ${ad.adset_id}\n`
    result += `   Created: ${new Date(ad.created_time).toLocaleDateString()}\n`
    result += '\n'
  })
  
  return result
}

function formatLoginLink(data: any): string {
  if (data?.login_url) {
    return `🔗 **Meta Authentication Required**\n\nClick the link below to authenticate with Meta Ads:\n\n[Authenticate with Meta Ads](${data.login_url})\n\nAfter authentication, you'll be able to access your ad accounts and campaigns.`
  }
  
  return 'Authentication link generation failed. Please try again.'
}