import { RegisterForm } from "@/components/auth/register-form"
import { BarChart3 } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Meta Ads Manager</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="text-gray-600 mt-2">Get started with AI-powered Meta Ads management</p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  )
}