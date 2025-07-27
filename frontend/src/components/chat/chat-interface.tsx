"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChartRenderer, removeChartMarkers } from './chart-renderer'
import { Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  chartData?: Record<string, unknown> // Fixed type
}

interface ChatInterfaceProps {
  accessToken?: string
  className?: string
}

export function ChatInterface({ accessToken, className = "" }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const input = inputRef.current
    if (!input || !input.value.trim() || isLoading) return

    const userMessage = input.value.trim()
    const messageId = Date.now().toString()

    // Add user message
    setMessages(prev => [...prev, {
      id: messageId,
      role: 'user',
      content: userMessage
    }])

    input.value = ''
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
          accessToken
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      // Add AI response
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        chartData: data.chartData
      }])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    "Show me my ad account performance",
    "What are my best performing campaigns?",
    "Generate a chart of my spending trends",
    "How can I optimize my ad budget?",
    "What's my current CTR and CPC?"
  ]

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Meta Ads AI Assistant
        </CardTitle>
      </CardHeader>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Welcome to Meta Ads AI!</h3>
            <p className="mb-4">Ask me anything about your ad accounts, campaigns, or performance.</p>
            
            {/* Suggested Questions */}
            <div className="space-y-2 max-w-md mx-auto">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (inputRef.current) {
                      inputRef.current.value = question
                      const form = inputRef.current.closest('form')
                      if (form) {
                        const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                        form.dispatchEvent(submitEvent)
                      }
                    }
                  }}
                  className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors w-full"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                
                <div className={`rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">
                    {message.chartData ? removeChartMarkers(message.content) : message.content}
                  </p>
                  
                  {message.chartData && (
                    <div className="mt-3">
                      <ChartRenderer 
                        chartData={message.chartData as any} 
                        className="w-full h-64"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <CardContent className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Ask about your Meta Ads performance..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </div>
  )
}