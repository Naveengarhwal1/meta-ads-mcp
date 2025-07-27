// Configuration for external dependencies and API keys

export const config = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://phkwcxmjkfjncvsqtshm.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoa3djeG1qa2ZqbmN2c3F0c2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODg2NzMsImV4cCI6MjA2ODY2NDY3M30.FFFmTEUTi69Tp2vW_TVPsoJmuWA-5PfGnKPAx0Bk65k'
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'your_openai_api_key_here'
  },

  // Meta App Configuration
  meta: {
    appId: process.env.NEXT_PUBLIC_META_APP_ID || '665587869862344',
    appSecret: process.env.META_APP_SECRET || '2eebb6109153f476f9df8625d673917e',
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/auth/meta/callback` : 'http://localhost:3000/auth/meta/callback'
  },

  // Pipeboard Configuration (for local development only)
  pipeboard: {
    token: process.env.NEXT_PUBLIC_PIPEBOARD_TOKEN || 'your_pipeboard_token_here',
    baseUrl: process.env.NEXT_PUBLIC_PIPEBOARD_URL || 'https://api.pipeboard.com'
  },

  // Meta Ads MCP Configuration
  metaAdsMCP: {
    baseUrl: process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:8000',
    timeout: 30000 // 30 seconds
  },

  // App Configuration
  app: {
    name: 'Meta Ads Manager',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }
}

// Environment check for required dependencies
export const checkEnvironment = () => {
  const missing: string[] = []

  if (!config.openai.apiKey || config.openai.apiKey === 'your_openai_api_key_here') {
    missing.push('OPENAI_API_KEY')
  }

  if (!config.meta.appId || config.meta.appId === 'your_meta_app_id_here') {
    missing.push('NEXT_PUBLIC_META_APP_ID')
  }

  if (!config.meta.appSecret || config.meta.appSecret === 'your_meta_app_secret_here') {
    missing.push('META_APP_SECRET')
  }

  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`)
    console.warn('Please set these variables in your .env.local file')
  }

  return missing.length === 0
}

// Check if we're in development mode
export const isDevelopment = config.app.environment === 'development'

// Check if we're in production mode
export const isProduction = config.app.environment === 'production'