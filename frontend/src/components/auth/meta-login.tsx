"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMetaAuth } from "@/lib/meta-auth"
import { Facebook, Loader2, CheckCircle } from "lucide-react"

export function MetaLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { loginWithMeta, saveMetaUserToSupabase } = useMetaAuth()

  const handleMetaLogin = async () => {
    setIsLoading(true)
    setIsSuccess(false)

    try {
      // Login with Meta
      const metaUser = await loginWithMeta()
      
      // Save to Supabase
      await saveMetaUserToSupabase(metaUser)
      
      setIsSuccess(true)
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
      
    } catch (error) {
      console.error('Meta login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="h-5 w-5 text-blue-600" />
          Connect Meta Account
        </CardTitle>
        <CardDescription>
          Connect your Meta account to access your ad accounts and campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold text-green-900">Successfully Connected!</h3>
            <p className="text-green-700">
              Your Meta account has been connected. Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={handleMetaLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Facebook className="h-4 w-4 mr-2" />
                  Connect with Meta
                </>
              )}
            </Button>
            
            <div className="text-xs text-gray-500 text-center">
              By connecting, you authorize us to access your Meta Ads data for campaign management and analytics.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}