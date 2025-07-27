"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  Eye,
  MousePointer,
  DollarSign,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3
} from "lucide-react"
import { AdAccount } from "@/lib/meta-auth"
import { RealtimeData } from "@/lib/meta-realtime"

interface RealtimeMonitorProps {
  isMonitoring: boolean
  realtimeData: RealtimeData[]
  onStartMonitoring: () => void
  onStopMonitoring: () => void
  selectedAccount: AdAccount | null
}

export function RealtimeMonitor({
  isMonitoring,
  realtimeData,
  onStartMonitoring,
  onStopMonitoring,
  selectedAccount
}: RealtimeMonitorProps) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    if (isMonitoring) {
      setLastUpdate(new Date())
    }
  }, [realtimeData, isMonitoring])

  const getLatestData = () => {
    return realtimeData[realtimeData.length - 1]
  }

  const getDataChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (change < 0) return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
    return <TrendingUp className="w-4 h-4 text-gray-400" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-time Monitor</h2>
          <p className="text-gray-600 mt-1">
            Live performance monitoring for your campaigns
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {isMonitoring && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Activity className="w-3 h-3 mr-1 animate-pulse" />
              Live
            </Badge>
          )}
          
          <Button
            onClick={isMonitoring ? onStopMonitoring : onStartMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
            disabled={!selectedAccount}
          >
            {isMonitoring ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Monitoring
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Account Selection Warning */}
      {!selectedAccount && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-800">No Account Selected</h3>
                <p className="text-sm text-orange-700">
                  Please select an ad account from the Overview tab to start monitoring
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monitoring Status */}
      {selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Monitoring Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-gray-600">
                    {isMonitoring ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Last Update</p>
                  <p className="text-sm text-gray-600">
                    {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Data Points</p>
                  <p className="text-sm text-gray-600">
                    {realtimeData.length} collected
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Metrics */}
      {selectedAccount && isMonitoring && getLatestData() && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getLatestData().spend)}
              </div>
              {realtimeData.length > 1 && (
                <div className="flex items-center space-x-1 mt-1">
                  {getChangeIcon(getDataChange(getLatestData().spend, realtimeData[realtimeData.length - 2].spend))}
                  <span className={`text-xs ${getChangeColor(getDataChange(getLatestData().spend, realtimeData[realtimeData.length - 2].spend))}`}>
                    {getDataChange(getLatestData().spend, realtimeData[realtimeData.length - 2].spend).toFixed(1)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Impressions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(getLatestData().impressions)}
              </div>
              {realtimeData.length > 1 && (
                <div className="flex items-center space-x-1 mt-1">
                  {getChangeIcon(getDataChange(getLatestData().impressions, realtimeData[realtimeData.length - 2].impressions))}
                  <span className={`text-xs ${getChangeColor(getDataChange(getLatestData().impressions, realtimeData[realtimeData.length - 2].impressions))}`}>
                    {getDataChange(getLatestData().impressions, realtimeData[realtimeData.length - 2].impressions).toFixed(1)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(getLatestData().clicks)}
              </div>
              {realtimeData.length > 1 && (
                <div className="flex items-center space-x-1 mt-1">
                  {getChangeIcon(getDataChange(getLatestData().clicks, realtimeData[realtimeData.length - 2].clicks))}
                  <span className={`text-xs ${getChangeColor(getDataChange(getLatestData().clicks, realtimeData[realtimeData.length - 2].clicks))}`}>
                    {getDataChange(getLatestData().clicks, realtimeData[realtimeData.length - 2].clicks).toFixed(1)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live CTR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getLatestData().ctr.toFixed(2)}%
              </div>
              {realtimeData.length > 1 && (
                <div className="flex items-center space-x-1 mt-1">
                  {getChangeIcon(getDataChange(getLatestData().ctr, realtimeData[realtimeData.length - 2].ctr))}
                  <span className={`text-xs ${getChangeColor(getDataChange(getLatestData().ctr, realtimeData[realtimeData.length - 2].ctr))}`}>
                    {getDataChange(getLatestData().ctr, realtimeData[realtimeData.length - 2].ctr).toFixed(1)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data History */}
      {selectedAccount && realtimeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data History</CardTitle>
            <CardDescription>
              Recent performance data points
            </CardDescription>
          </CardHeader>
          <CardContent>
            {realtimeData.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No data collected yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start monitoring to see live performance data
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {realtimeData.slice(-10).reverse().map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        {new Date().toLocaleTimeString()}
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-sm">
                          <span className="text-gray-600">Spend:</span>
                          <span className="font-medium ml-1">{formatCurrency(data.spend)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Impressions:</span>
                          <span className="font-medium ml-1">{formatNumber(data.impressions)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Clicks:</span>
                          <span className="font-medium ml-1">{formatNumber(data.clicks)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">CTR:</span>
                          <span className="font-medium ml-1">{data.ctr.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Monitoring Tips */}
      {selectedAccount && !isMonitoring && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-800">Ready to Monitor</h3>
                <p className="text-sm text-blue-700">
                  Click "Start Monitoring" to begin collecting real-time performance data for {selectedAccount.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}