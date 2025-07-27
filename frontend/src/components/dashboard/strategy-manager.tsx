"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Brain,
  Play,
  Settings,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Lightbulb
} from "lucide-react"
import { AdAccount } from "@/lib/meta-auth"
import { AccountStrategy } from "@/lib/meta-realtime"

interface StrategyManagerProps {
  strategies: AccountStrategy[]
  onGenerateStrategies: () => void
  onExecuteStrategy: (strategy: AccountStrategy) => void
  selectedAccount: AdAccount | null
}

export function StrategyManager({
  strategies,
  onGenerateStrategies,
  onExecuteStrategy,
  selectedAccount
}: StrategyManagerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [executingStrategy, setExecutingStrategy] = useState<string | null>(null)

  const handleGenerateStrategies = async () => {
    setIsGenerating(true)
    try {
      await onGenerateStrategies()
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExecuteStrategy = async (strategy: AccountStrategy) => {
    setExecutingStrategy(strategy.id)
    try {
      await onExecuteStrategy(strategy)
    } finally {
      setExecutingStrategy(null)
    }
  }

  const getStrategyTypeIcon = (type: string) => {
    switch (type) {
      case "BUDGET_OPTIMIZATION":
        return <DollarSign className="w-4 h-4" />
      case "AUDIENCE_EXPANSION":
        return <Users className="w-4 h-4" />
      case "BIDDING_OPTIMIZATION":
        return <TrendingUp className="w-4 h-4" />
      case "PERFORMANCE_IMPROVEMENT":
        return <Target className="w-4 h-4" />
      default:
        return <Settings className="w-4 h-4" />
    }
  }

  const getStrategyTypeColor = (type: string) => {
    switch (type) {
      case "BUDGET_OPTIMIZATION":
        return "bg-green-100 text-green-800"
      case "AUDIENCE_EXPANSION":
        return "bg-blue-100 text-blue-800"
      case "BIDDING_OPTIMIZATION":
        return "bg-purple-100 text-purple-800"
      case "PERFORMANCE_IMPROVEMENT":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActionDescription = (action: string) => {
    switch (action) {
      case "pauseLowPerforming":
        return "Pause low performing campaigns"
      case "increaseBudget":
        return "Increase budget for high performers"
      case "adjustBidding":
        return "Adjust bidding strategy"
      case "expandAudience":
        return "Expand audience targeting"
      case "optimizeCreative":
        return "Optimize ad creative"
      case "refineTargeting":
        return "Refine audience targeting"
      default:
        return action
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Strategy Manager</h2>
          <p className="text-gray-600 mt-1">
            AI-generated optimization strategies for your campaigns
          </p>
        </div>
        
        <Button
          onClick={handleGenerateStrategies}
          disabled={isGenerating || !selectedAccount}
          className="flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              <span>Generate Strategies</span>
            </>
          )}
        </Button>
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
                  Please select an ad account from the Overview tab to generate strategies
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategy Stats */}
      {selectedAccount && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Strategies</p>
                  <p className="text-2xl font-bold">{strategies.length}</p>
                </div>
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Budget Optimization</p>
                  <p className="text-2xl font-bold text-green-600">
                    {strategies.filter(s => s.type === "BUDGET_OPTIMIZATION").length}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Audience Expansion</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {strategies.filter(s => s.type === "AUDIENCE_EXPANSION").length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Performance</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {strategies.filter(s => s.type === "PERFORMANCE_IMPROVEMENT").length}
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Strategy List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5" />
            <span>Generated Strategies ({strategies.length})</span>
          </CardTitle>
          <CardDescription>
            {selectedAccount ? `AI strategies for ${selectedAccount.name}` : "Select an account to view strategies"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {strategies.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No strategies generated yet</p>
              <p className="text-sm text-gray-400 mt-1">
                {selectedAccount 
                  ? "Click 'Generate Strategies' to create AI-powered optimization recommendations"
                  : "Select an account and generate strategies to get started"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {strategies.map((strategy) => (
                <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-semibold text-lg">{strategy.name}</h3>
                          <Badge className={getStrategyTypeColor(strategy.type)}>
                            <div className="flex items-center space-x-1">
                              {getStrategyTypeIcon(strategy.type)}
                              <span>{strategy.type.replace('_', ' ')}</span>
                            </div>
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(strategy.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{strategy.description}</p>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Recommended Actions:</h4>
                          <ul className="space-y-1">
                            {strategy.actions.pauseLowPerforming && (
                              <li className="flex items-center space-x-2 text-sm">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>Pause low performing campaigns</span>
                              </li>
                            )}
                            {strategy.actions.increaseBudget && (
                              <li className="flex items-center space-x-2 text-sm">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>Increase budget for high performers</span>
                              </li>
                            )}
                            {strategy.actions.adjustBidding && (
                              <li className="flex items-center space-x-2 text-sm">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>Adjust bidding strategy</span>
                              </li>
                            )}
                            {strategy.actions.expandAudience && (
                              <li className="flex items-center space-x-2 text-sm">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>Expand audience targeting</span>
                              </li>
                            )}
                            {strategy.actions.optimizeCreative && (
                              <li className="flex items-center space-x-2 text-sm">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>Optimize ad creative</span>
                              </li>
                            )}
                            {strategy.actions.refineTargeting && (
                              <li className="flex items-center space-x-2 text-sm">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>Refine audience targeting</span>
                              </li>
                            )}
                          </ul>
                        </div>

                        {strategy.expected_impact && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-sm text-blue-800 mb-1">Expected Impact:</h4>
                            <p className="text-sm text-blue-700">{strategy.expected_impact}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          onClick={() => handleExecuteStrategy(strategy)}
                          disabled={executingStrategy === strategy.id}
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          {executingStrategy === strategy.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              <span>Executing...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3" />
                              <span>Execute</span>
                            </>
                          )}
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

      {/* Strategy Tips */}
      {selectedAccount && strategies.length === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Brain className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-800">Ready to Generate Strategies</h3>
                <p className="text-sm text-blue-700">
                  Our AI will analyze your campaign performance and generate personalized optimization strategies for {selectedAccount.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategy Information */}
      {strategies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>How AI Strategies Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Analysis</h4>
                <p className="text-gray-600">
                  AI analyzes your campaign performance, audience behavior, and market trends
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Recommendations</h4>
                <p className="text-gray-600">
                  Generates personalized strategies based on your specific performance data
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Execution</h4>
                <p className="text-gray-600">
                  Apply strategies with one click to optimize your campaigns automatically
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}