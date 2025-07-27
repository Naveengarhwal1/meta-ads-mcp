import { Configuration, OpenAIApi } from 'openai-edge'
import { NextRequest } from 'next/server'

// Mock MCP tools - replace with actual MCP integration
const MCP_TOOLS = {
  getAdAccounts: async (accessToken?: string) => {
    // Mock data - replace with actual MCP call
    return {
      accounts: [
        { id: 'act_123456789', name: 'Main Ad Account', status: 'ACTIVE' },
        { id: 'act_987654321', name: 'Secondary Account', status: 'ACTIVE' }
      ]
    }
  },
  
  getCampaigns: async (accountId: string, accessToken?: string) => {
    // Mock data - replace with actual MCP call
    return {
      campaigns: [
        {
          id: '123456789',
          name: 'Summer Sale Campaign',
          status: 'ACTIVE',
          spend: 2450,
          impressions: 125000,
          clicks: 3200,
          ctr: 2.56
        },
        {
          id: '987654321',
          name: 'Brand Awareness',
          status: 'PAUSED',
          spend: 1890,
          impressions: 89000,
          clicks: 1200,
          ctr: 1.35
        }
      ]
    }
  },
  
  getInsights: async (objectId: string, accessToken?: string) => {
    // Mock data - replace with actual MCP call
    return {
      insights: [
        { date: '2024-01-01', spend: 100, impressions: 5000, clicks: 150, ctr: 3.0 },
        { date: '2024-01-02', spend: 120, impressions: 6000, clicks: 180, ctr: 3.0 },
        { date: '2024-01-03', spend: 110, impressions: 5500, clicks: 165, ctr: 3.0 },
        { date: '2024-01-04', spend: 130, impressions: 6500, clicks: 195, ctr: 3.0 },
        { date: '2024-01-05', spend: 140, impressions: 7000, clicks: 210, ctr: 3.0 }
      ]
    }
  }
}

// Function to detect if user wants to see data/charts
function shouldGenerateChart(message: string): boolean {
  const chartKeywords = [
    'chart', 'graph', 'visualize', 'show me', 'display', 'plot', 'trend',
    'performance', 'analytics', 'metrics', 'data', 'insights', 'report'
  ]
  return chartKeywords.some(keyword => message.toLowerCase().includes(keyword))
}

// Function to generate chart data based on the request
function generateChartData(message: string, data: any) {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('spend') || lowerMessage.includes('budget')) {
    return {
      type: 'line',
      data: {
        labels: data.insights?.map((d: any) => d.date) || [],
        datasets: [{
          label: 'Daily Spend',
          data: data.insights?.map((d: any) => d.spend) || [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Daily Ad Spend Trend'
          }
        }
      }
    }
  }
  
  if (lowerMessage.includes('ctr') || lowerMessage.includes('click')) {
    return {
      type: 'bar',
      data: {
        labels: data.campaigns?.map((c: any) => c.name) || [],
        datasets: [{
          label: 'Click-Through Rate (%)',
          data: data.campaigns?.map((c: any) => c.ctr) || [],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Campaign CTR Performance'
          }
        }
      }
    }
  }
  
  if (lowerMessage.includes('impression') || lowerMessage.includes('reach')) {
    return {
      type: 'doughnut',
      data: {
        labels: data.campaigns?.map((c: any) => c.name) || [],
        datasets: [{
          data: data.campaigns?.map((c: any) => c.impressions) || [],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Impressions by Campaign'
          }
        }
      }
    }
  }
  
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { messages, accessToken } = await req.json()
    const lastMessage = messages[messages.length - 1]
    
    // Check if user wants to see data/charts
    const needsChart = shouldGenerateChart(lastMessage.content)
    
    // Extract data based on the request
    let data = {}
    let chartData = null
    
    if (lastMessage.content.toLowerCase().includes('account')) {
      data = await MCP_TOOLS.getAdAccounts(accessToken)
    } else if (lastMessage.content.toLowerCase().includes('campaign')) {
      data = await MCP_TOOLS.getCampaigns('act_123456789', accessToken)
      if (needsChart) {
        chartData = generateChartData(lastMessage.content, data)
      }
    } else if (lastMessage.content.toLowerCase().includes('insight') || lastMessage.content.toLowerCase().includes('performance')) {
      data = await MCP_TOOLS.getInsights('123456789', accessToken)
      if (needsChart) {
        chartData = generateChartData(lastMessage.content, data)
      }
    }
    
    // Create system prompt with context
    const systemPrompt = `You are an AI assistant specialized in Meta Ads management. You have access to Meta Ads data and can generate charts to visualize performance.

Available data: ${JSON.stringify(data, null, 2)}

${chartData ? `Chart data available: ${JSON.stringify(chartData, null, 2)}` : ''}

When the user asks for data visualization, include a special marker: [CHART:${JSON.stringify(chartData)}] in your response.

Provide helpful, actionable insights about Meta Ads campaigns, performance, and optimization strategies. Be conversational but professional.`

    // Create the OpenAI configuration
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key'
    })
    const openai = new OpenAIApi(configuration)

    // Create the chat completion
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    // For now, return a simple response
    // In production, you would implement proper streaming
    const completion = await response.json()
    
    return new Response(JSON.stringify({
      content: completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.",
      chartData: chartData
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Error processing chat request', { status: 500 })
  }
}