"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useMetaAuth } from "@/lib/meta-auth"
import { useMetaRealtime } from "@/lib/meta-realtime"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MetaLogin } from "@/components/auth/meta-login"
import { FacebookSDKDebug } from "@/components/debug/facebook-sdk-debug"
import { 
  BarChart3, 
  LogOut, 
  User, 
  ArrowLeft, 
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
  AlertCircle
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

  const handleAccountSelect = async (account: AdAccount) => {
    setSelectedAccount(account)
    if (user?.user_metadata?.meta_access_token) {
      await loadCampaigns(account.id, user.user_metadata.meta_access_token)
    }
  }

  const startMonitoring = async () => {
    if (!selectedAccount || !user?.user_metadata?.meta_access_token) return

    try {
      await startRealtimeMonitoring({
        accountId: selectedAccount.id,
        updateInterval: 30000, // 30 seconds
        onDataUpdate: (data) => {
          setRealtimeData(data)
        },
        onError: (error) => {
          console.error('Real-time monitoring error:', error)
        }
      })
      setIsMonitoring(true)
    } catch (error) {
      console.error('Failed to start monitoring:', error)
    }
  }

  const stopMonitoring = () => {
    if (selectedAccount) {
      stopRealtimeMonitoring(selectedAccount.id)
      setIsMonitoring(false)
    }
  }

  const generateStrategies = async () => {
    if (!selectedAccount) return

    try {
      const accountStrategies = await generateAccountStrategies(selectedAccount.id)
      setStrategies(accountStrategies)
    } catch (error) {
      console.error('Failed to generate strategies:', error)
    }
  }

  const handleExecuteStrategy = async (strategy: AccountStrategy) => {
    try {
      await executeStrategy(strategy)
      // Refresh data after strategy execution
      if (selectedAccount && user?.user_metadata?.meta_access_token) {
        await loadCampaigns(selectedAccount.id, user.user_metadata.meta_access_token)
      }
    } catch (error) {
      console.error('Failed to execute strategy:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleMetaLoginSuccess = async (accessToken: string) => {
    setAccessToken(accessToken)
    setMetaConnected(true)
    await loadAdAccounts(accessToken)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Meta Ads Dashboard</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Meta Connection Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="w-5 h-5" />
              Meta Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metaConnected ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Connected to Meta Ads</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Not connected to Meta Ads</span>
                </div>
                <MetaLogin onSuccess={handleMetaLoginSuccess} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Component */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Facebook SDK Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <FacebookSDKDebug />
          </CardContent>
        </Card>

        {/* Account Selection */}
        {adAccounts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ad Accounts</CardTitle>
              <CardDescription>
                Select an ad account to view campaigns and real-time data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adAccounts.map((account) => (
                  <Card
                    key={account.id}
                    className={`cursor-pointer transition-colors ${
                      selectedAccount?.id === account.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleAccountSelect(account)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{account.name}</h3>
                      <p className="text-sm text-gray-600">
                        Status: {account.account_status === 1 ? 'Active' : 'Inactive'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Currency: {account.currency}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-time Monitoring Controls */}
        {selectedAccount && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Real-time Monitoring
              </CardTitle>
              <CardDescription>
                Monitor live performance data for {selectedAccount.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={isMonitoring ? stopMonitoring : startMonitoring}
                  variant={isMonitoring ? "destructive" : "default"}
                >
                  {isMonitoring ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Monitoring
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Monitoring
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={generateStrategies}
                  variant="outline"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Generate Strategies
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaigns */}
        {selectedAccount && campaigns.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>
                Active campaigns in {selectedAccount.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Status:</span> {campaign.status}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Objective:</span> {campaign.objective}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Daily Budget:</span> ${(campaign.daily_budget / 100).toFixed(2)}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Spend:</span> ${(campaign.spend / 100).toFixed(2)}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">CTR:</span> {campaign.ctr.toFixed(2)}%
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">CPC:</span> ${campaign.cpc.toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-time Data */}
        {isMonitoring && realtimeData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                Live Performance Data
              </CardTitle>
              <CardDescription>
                Real-time metrics from your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {realtimeData.map((data, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Spend</p>
                          <p className="text-lg font-bold">${data.spend.toFixed(2)}</p>
                        </div>
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <Eye className="h-3 w-3 inline mr-1" />
                          {data.impressions.toLocaleString()} impressions
                        </p>
                        <p className="text-sm">
                          <MousePointer className="h-3 w-3 inline mr-1" />
                          {data.clicks.toLocaleString()} clicks
                        </p>
                        <p className="text-sm">
                          CTR: {data.ctr.toFixed(2)}%
                        </p>
                        <p className="text-sm">
                          CPC: ${data.cpc.toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Strategies */}
        {strategies.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI-Generated Strategies</CardTitle>
              <CardDescription>
                Optimization strategies based on your campaign performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategies.map((strategy) => (
                  <Card key={strategy.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{strategy.name}</h3>
                          <p className="text-sm text-gray-600">
                            Type: {strategy.type.replace('_', ' ')}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleExecuteStrategy(strategy)}
                          size="sm"
                        >
                          Execute
                        </Button>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="font-medium">Actions:</span>
                        </p>
                        <ul className="text-sm text-gray-600 mt-1">
                          {strategy.actions.pauseLowPerforming && (
                            <li>• Pause low performing campaigns</li>
                          )}
                          {strategy.actions.increaseBudget && (
                            <li>• Increase budget for high performers</li>
                          )}
                          {strategy.actions.adjustBidding && (
                            <li>• Adjust bidding strategy</li>
                          )}
                          {strategy.actions.expandAudience && (
                            <li>• Expand audience targeting</li>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}