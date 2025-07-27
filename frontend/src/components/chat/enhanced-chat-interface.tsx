"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, BarChart3, TrendingUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { mcpClient } from "@/lib/mcp-client"
import { parseChatCommand, executeChatCommand, formatCommandResponse, ParsedCommand } from "@/lib/chat-commands"
import { supabase } from "@/lib/supabase"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isLoading?: boolean
  chartData?: any
  error?: string
  suggestions?: string[]
}

export function EnhancedChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `👋 **Welcome to Meta Ads Assistant!**

I can help you manage your Meta Ads campaigns using natural language commands. Here are some things you can ask me:

**Account Management:**
• "Show my ad accounts"
• "Get account details for act_123456789"

**Campaign Management:**
• "List campaigns"
• "Show campaign details for campaign_123"
• "Create a new campaign called 'Summer Sale'"
• "Update campaign campaign_123 budget to $100"

**Performance Analytics:**
• "Show performance for campaign_123"
• "Get insights for the last 30 days"
• "Show spending data"

**Ad Management:**
• "List ads in campaign_123"
• "Show ad details for ad_123"

Type "help" for more options or start by asking to see your ad accounts!`,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check for authenticated user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Set MCP client access token if available
      if (user?.user_metadata?.meta_access_token) {
        mcpClient.setAccessToken(user.user_metadata.meta_access_token)
      }
    }
    
    getUser()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue("")
    
    // Add user message
    addMessage({
      type: 'user',
      content: userMessage
    })

    setIsLoading(true)

    try {
      // Parse the command
      const parsedCommand = parseChatCommand(userMessage)
      
      if (!parsedCommand.success) {
        // Handle error or suggestions
        addMessage({
          type: 'assistant',
          content: `❌ **${parsedCommand.error}**`,
          error: parsedCommand.error,
          suggestions: parsedCommand.suggestions
        })
        return
      }

      const command = parsedCommand.command!
      
      // Add loading message
      const loadingId = Date.now().toString()
      addMessage({
        type: 'assistant',
        content: `🔄 ${command.description || 'Processing...'}`,
        isLoading: true
      })

      // Execute the command
      const result = await executeChatCommand(command)
      
      // Generate chart data if applicable
      let chartData = null
      if (command.type === 'get_insights' && result?.data) {
        chartData = mcpClient.generateChartData(result.data)
      }

      // Format the response
      const formattedResponse = formatCommandResponse(command, result)
      
      // Update the loading message with the result
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? {
              ...msg,
              content: formattedResponse,
              isLoading: false,
              chartData: chartData
            }
          : msg
      ))

    } catch (error) {
      console.error('Error processing command:', error)
      addMessage({
        type: 'assistant',
        content: `❌ **Error processing command**

${error instanceof Error ? error.message : 'An unexpected error occurred'}

Please try again or type "help" for available commands.`,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const getMessageIcon = (type: ChatMessage['type']) => {
    switch (type) {
      case 'user':
        return <User className="w-5 h-5" />
      case 'assistant':
        return <Bot className="w-5 h-5" />
      case 'system':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Bot className="w-5 h-5" />
    }
  }

  const getMessageStyle = (type: ChatMessage['type']) => {
    switch (type) {
      case 'user':
        return 'bg-blue-500 text-white ml-auto'
      case 'assistant':
        return 'bg-gray-100 text-gray-900'
      case 'system':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-900'
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Meta Ads Assistant
            {user?.user_metadata?.meta_access_token && (
              <CheckCircle className="w-4 h-4 text-green-500" title="Meta Connected" />
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-3">
            <div className="flex-shrink-0">
              {getMessageIcon(message.type)}
            </div>
            <div className="flex-1">
              <div className={`rounded-lg p-4 ${getMessageStyle(message.type)}`}>
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {message.content}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                
                {/* Chart */}
                {message.chartData && (
                  <div className="mt-4">
                    <Line data={message.chartData.data} options={message.chartData.options} />
                  </div>
                )}
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Try these commands:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me about your Meta Ads campaigns..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Quick Actions */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSuggestionClick("Show my ad accounts")}
          >
            📊 My Accounts
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSuggestionClick("List campaigns")}
          >
            📈 Campaigns
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSuggestionClick("Show performance for the last 30 days")}
          >
            📊 Performance
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSuggestionClick("help")}
          >
            ❓ Help
          </Button>
        </div>
      </div>
    </div>
  )
}