"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { EnhancedChatInterface } from "@/components/chat/enhanced-chat-interface"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  MessageSquare, 
  Brain, 
  Target, 
  TrendingUp, 
  Users,
  Zap,
  Lightbulb
} from "lucide-react"

export default function ChatPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat assistant...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Meta Ads Chat Assistant</h1>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Welcome, {user.email?.split('@')[0]}!</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="h-[calc(100vh-200px)]">
              <EnhancedChatInterface />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard')}
                >
                  <Target className="w-4 h-4 mr-2" />
                  View Campaigns
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard?tab=monitor')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Start Monitoring
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard?tab=strategies')}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Strategies
                </Button>
              </CardContent>
            </Card>

            {/* Chat Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>What I Can Help With</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Campaign Management</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• View campaign performance</li>
                    <li>• Pause/resume campaigns</li>
                    <li>• Adjust budgets</li>
                    <li>• Analyze metrics</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Account Insights</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Account overview</li>
                    <li>• Performance trends</li>
                    <li>• Optimization tips</li>
                    <li>• Best practices</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">AI Assistance</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Generate strategies</li>
                    <li>• Performance analysis</li>
                    <li>• Optimization recommendations</li>
                    <li>• Troubleshooting help</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Example Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Try Asking:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-left h-auto p-2"
                >
                  "Show me my campaign performance"
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-left h-auto p-2"
                >
                  "Which campaigns are performing best?"
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-left h-auto p-2"
                >
                  "Generate optimization strategies"
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-left h-auto p-2"
                >
                  "How can I improve my CTR?"
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">Pro Tip</h3>
                    <p className="text-sm text-blue-700">
                      Be specific in your questions for better AI responses. Include metrics, timeframes, or campaign names when possible.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}