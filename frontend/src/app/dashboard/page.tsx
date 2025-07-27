"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useMetaAuth } from "@/lib/meta-auth"
import { useMetaRealtime } from "@/lib/meta-realtime"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetaLogin } from "@/components/auth/meta-login"
import { FacebookSDKDebug } from "@/components/debug/facebook-sdk-debug"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { CampaignManager } from "@/components/dashboard/campaign-manager"
import { RealtimeMonitor } from "@/components/dashboard/realtime-monitor"
import { StrategyManager } from "@/components/dashboard/strategy-manager"
import { 
  BarChart3, 
  LogOut, 
  User, 
  MessageSquare, 
  Facebook, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  MousePointer,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Home,
  Target,
  Activity,
  Brain
} from "lucide-react"
import { User as UserType } from "@/types/user"
import { AdAccount, Campaign } from "@/lib/meta-auth"
import { RealtimeData, AccountStrategy } from "@/lib/meta-realtime"

export default function DashboardPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [metaConnected, setMetaConnected] = useState(false)
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [realtimeData, setRealtimeData] = useState<RealtimeData[]>([])
  const [strategies, setStrategies] = useState<AccountStrategy[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  const router = useRouter()
  const { getAdAccounts, getCampaigns, validateToken } = useMetaAuth()
  const { 
    setAccessToken, 
    startRealtimeMonitoring, 
    stopRealtimeMonitoring, 
    generateAccountStrategies,
    executeStrategy 
  } = useMetaRealtime()

  const loadCampaigns = useCallback(async (accountId: string, accessToken: string) => {
    try {
      const campaignsData = await getCampaigns(accountId, accessToken)
      setCampaigns(campaignsData)
    } catch (error) {
      console.error('Failed to load campaigns:', error)
    }
  }, [getCampaigns])

  const loadAdAccounts = useCallback(async (accessToken: string) => {
    try {
      const accounts = await getAdAccounts(accessToken)
      setAdAccounts(accounts)
      if (accounts.length > 0) {
        setSelectedAccount(accounts[0])
        await loadCampaigns(accounts[0].id, accessToken)
      }
    } catch (error) {
      console.error('Failed to load ad accounts:', error)
    }
  }, [getAdAccounts, loadCampaigns])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Check if Meta is connected
      const metaToken = user.user_metadata?.meta_access_token
      if (metaToken) {
        const isValid = await validateToken(metaToken)
        if (isValid) {
          setMetaConnected(true)
          setAccessToken(metaToken)
          await loadAdAccounts(metaToken)
        }
      }
      
      setLoading(false)
    }
    getUser()
  }, [router, validateToken, setAccessToken, loadAdAccounts])

  const startMonitoring = async () => {
    if (!selectedAccount) return
    
    try {
      setIsMonitoring(true)
      await startRealtimeMonitoring(selectedAccount.id)
      console.log('Started realtime monitoring')
    } catch (error) {
      console.error('Failed to start monitoring:', error)
      setIsMonitoring(false)
    }
  }

  const stopMonitoring = () => {
    stopRealtimeMonitoring()
    setIsMonitoring(false)
    console.log('Stopped realtime monitoring')
  }

  const generateStrategies = async () => {
    if (!selectedAccount) return
    
    try {
      const newStrategies = await generateAccountStrategies(selectedAccount.id)
      setStrategies(newStrategies)
    } catch (error) {
      console.error('Failed to generate strategies:', error)
    }
  }

  const handleExecuteStrategy = async (strategy: AccountStrategy) => {
    try {
      await executeStrategy(strategy)
      console.log('Strategy executed successfully')
    } catch (error) {
      console.error('Failed to execute strategy:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleMetaLoginSuccess = async (accessToken: string) => {
    try {
      setMetaConnected(true)
      setAccessToken(accessToken)
      await loadAdAccounts(accessToken)
      
      // Update user metadata
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.auth.updateUser({
          data: { meta_access_token: accessToken }
        })
      }
    } catch (error) {
      console.error('Failed to handle Meta login success:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Meta Ads Manager</h1>
              </div>
              {metaConnected && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Meta Connected
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/chat')}
                className="flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat Assistant</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user.email}</span>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Meta Connection Status */}
        {!metaConnected && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="font-medium text-orange-800">Connect Meta Account</h3>
                    <p className="text-sm text-orange-700">
                      Connect your Meta account to start managing your ads
                    </p>
                  </div>
                </div>
                <MetaLogin onLoginSuccess={handleMetaLoginSuccess} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Panel (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">Debug Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <FacebookSDKDebug />
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Monitor</span>
            </TabsTrigger>
            <TabsTrigger value="strategies" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Strategies</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview 
              user={user}
              metaConnected={metaConnected}
              adAccounts={adAccounts}
              selectedAccount={selectedAccount}
              campaigns={campaigns}
              realtimeData={realtimeData}
              onAccountSelect={setSelectedAccount}
            />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <CampaignManager 
              campaigns={campaigns}
              selectedAccount={selectedAccount}
              onRefresh={() => selectedAccount && loadCampaigns(selectedAccount.id, user.user_metadata?.meta_access_token)}
            />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            <RealtimeMonitor 
              isMonitoring={isMonitoring}
              realtimeData={realtimeData}
              onStartMonitoring={startMonitoring}
              onStopMonitoring={stopMonitoring}
              selectedAccount={selectedAccount}
            />
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <StrategyManager 
              strategies={strategies}
              onGenerateStrategies={generateStrategies}
              onExecuteStrategy={handleExecuteStrategy}
              selectedAccount={selectedAccount}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}