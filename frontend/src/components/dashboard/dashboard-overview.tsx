"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Eye, 
  MousePointer, 
  Target,
  Users,
  Calendar,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Facebook
} from "lucide-react"
import { User } from "@/types/user"
import { AdAccount, Campaign } from "@/lib/meta-auth"
import { RealtimeData } from "@/lib/meta-realtime"

interface DashboardOverviewProps {
  user: User
  metaConnected: boolean
  adAccounts: AdAccount[]
  selectedAccount: AdAccount | null
  campaigns: Campaign[]
  realtimeData: RealtimeData[]
  onAccountSelect: (account: AdAccount) => void
}

export function DashboardOverview({
  user,
  metaConnected,
  adAccounts,
  selectedAccount,
  campaigns,
  realtimeData,
  onAccountSelect
}: DashboardOverviewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Calculate summary metrics
  const totalSpend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0)
  const totalImpressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0)
  const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0)
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const averageCPC = totalClicks > 0 ? totalSpend / totalClicks : 0
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length

  // Get latest realtime data
  const latestData = realtimeData[realtimeData.length - 1]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your Meta Ads campaigns
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Connection Status */}
      {!metaConnected && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-800">Meta Account Not Connected</h3>
                <p className="text-sm text-orange-700">
                  Connect your Meta account to view campaign data and insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Selection */}
      {metaConnected && adAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Facebook className="w-5 h-5" />
              <span>Ad Account</span>
            </CardTitle>
            <CardDescription>
              Select an ad account to view detailed analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedAccount?.id || ''} 
              onValueChange={(value) => {
                const account = adAccounts.find(a => a.id === value)
                if (account) onAccountSelect(account)
              }}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select an ad account" />
              </SelectTrigger>
              <SelectContent>
                {adAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center space-x-2">
                      <span>{account.name}</span>
                      <Badge variant={account.account_status === 1 ? "default" : "secondary"}>
                        {account.account_status === 1 ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {selectedAccount && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalSpend / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Across {campaigns.length} campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total reach
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                CTR: {averageCTR.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                Out of {campaigns.length} total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Insights */}
      {selectedAccount && campaigns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Performance Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average CPC</span>
                <span className="text-sm">${(averageCPC / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average CTR</span>
                <span className="text-sm">{averageCTR.toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Campaigns</span>
                <span className="text-sm">{campaigns.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Status</span>
                <Badge variant={selectedAccount.account_status === 1 ? "default" : "secondary"}>
                  {selectedAccount.account_status === 1 ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestData ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Latest Spend</span>
                    <span className="text-sm font-medium">${(latestData.spend / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Latest Impressions</span>
                    <span className="text-sm font-medium">{latestData.impressions.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Latest Clicks</span>
                    <span className="text-sm font-medium">{latestData.clicks.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No recent activity data</p>
                  <p className="text-xs text-gray-400 mt-1">Start monitoring to see live updates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for managing your campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Target className="w-6 h-6" />
                <span>View Campaigns</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <TrendingUp className="w-6 h-6" />
                <span>Start Monitoring</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Users className="w-6 h-6" />
                <span>Chat Assistant</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}