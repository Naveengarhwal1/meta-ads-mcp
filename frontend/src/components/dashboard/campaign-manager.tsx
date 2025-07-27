"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search,
  Filter,
  Eye,
  MousePointer,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  RefreshCw,
  Play,
  Pause,
  Settings
} from "lucide-react"
import { AdAccount, Campaign } from "@/lib/meta-auth"

interface CampaignManagerProps {
  campaigns: Campaign[]
  selectedAccount: AdAccount | null
  onRefresh: () => void
}

export function CampaignManager({
  campaigns,
  selectedAccount,
  onRefresh
}: CampaignManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [objectiveFilter, setObjectiveFilter] = useState("all")
  const [sortBy, setSortBy] = useState("spend")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
      const matchesObjective = objectiveFilter === "all" || campaign.objective === objectiveFilter
      
      return matchesSearch && matchesStatus && matchesObjective
    })

    // Sort campaigns
    filtered.sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sortBy) {
        case "spend":
          aValue = a.spend
          bValue = b.spend
          break
        case "impressions":
          aValue = a.impressions
          bValue = b.impressions
          break
        case "clicks":
          aValue = a.clicks
          bValue = b.clicks
          break
        case "ctr":
          aValue = a.ctr
          bValue = b.ctr
          break
        case "cpc":
          aValue = a.cpc
          bValue = b.cpc
          break
        default:
          aValue = a.spend
          bValue = b.spend
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [campaigns, searchTerm, statusFilter, objectiveFilter, sortBy, sortOrder])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800"
      case "DELETED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getObjectiveIcon = (objective: string) => {
    switch (objective) {
      case "CONVERSIONS":
        return <Target className="w-4 h-4" />
      case "LINK_CLICKS":
        return <MousePointer className="w-4 h-4" />
      case "REACH":
        return <Eye className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Manager</h2>
          <p className="text-gray-600 mt-1">
            Manage and monitor your Meta Ads campaigns
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="DELETED">Deleted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Objective" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Objectives</SelectItem>
                <SelectItem value="CONVERSIONS">Conversions</SelectItem>
                <SelectItem value="LINK_CLICKS">Link Clicks</SelectItem>
                <SelectItem value="REACH">Reach</SelectItem>
                <SelectItem value="BRAND_AWARENESS">Brand Awareness</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spend">Spend</SelectItem>
                <SelectItem value="impressions">Impressions</SelectItem>
                <SelectItem value="clicks">Clicks</SelectItem>
                <SelectItem value="ctr">CTR</SelectItem>
                <SelectItem value="cpc">CPC</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={toggleSortOrder} variant="outline" className="flex items-center space-x-2">
              {sortOrder === "asc" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{sortOrder === "asc" ? "Ascending" : "Descending"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Stats */}
      {selectedAccount && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-bold">{campaigns.length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {campaigns.filter(c => c.status === "ACTIVE").length}
                  </p>
                </div>
                <Play className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paused</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {campaigns.filter(c => c.status === "PAUSED").length}
                  </p>
                </div>
                <Pause className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spend</p>
                  <p className="text-2xl font-bold">
                    ${(campaigns.reduce((sum, c) => sum + c.spend, 0) / 100).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns ({filteredCampaigns.length})</CardTitle>
          <CardDescription>
            {selectedAccount ? `Campaigns in ${selectedAccount.name}` : "Select an account to view campaigns"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No campaigns found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || statusFilter !== "all" || objectiveFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "Create your first campaign to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{campaign.name}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <div className="flex items-center space-x-1 text-gray-500">
                            {getObjectiveIcon(campaign.objective)}
                            <span className="text-sm">{campaign.objective.replace('_', ' ')}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Daily Budget:</span>
                            <p className="font-medium">${(campaign.daily_budget / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Spend:</span>
                            <p className="font-medium">${(campaign.spend / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">CTR:</span>
                            <p className="font-medium">{campaign.ctr.toFixed(2)}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">CPC:</span>
                            <p className="font-medium">${campaign.cpc.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                          <div>
                            <span className="text-gray-600">Impressions:</span>
                            <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Clicks:</span>
                            <p className="font-medium">{campaign.clicks.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <p className="font-medium">
                              {new Date(campaign.created_time).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Updated:</span>
                            <p className="font-medium">
                              {new Date(campaign.updated_time).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}