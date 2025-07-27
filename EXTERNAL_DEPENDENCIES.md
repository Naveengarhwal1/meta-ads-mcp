# External Dependencies & Configuration

## 🔑 Required External Dependencies

### 1. **OpenAI API Key**
**Purpose**: Powers the AI chat assistant and generates intelligent responses
**Required**: Yes
**Cost**: Pay-per-use (typically $0.002 per 1K tokens)

**Setup Instructions**:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to "API Keys" section
4. Create a new API key
5. Add to your `.env.local` file:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

**Usage in App**:
- AI chat responses
- Campaign optimization suggestions
- Natural language processing of user queries

---

### 2. **Pipeboard Token** (Local Development Only)
**Purpose**: Provides Meta Ads data integration for local development
**Required**: No (only for local development)
**Cost**: Free for development

**Setup Instructions**:
1. Go to [Pipeboard](https://pipeboard.com/)
2. Create an account
3. Generate an API token
4. Add to your `.env.local` file:
   ```env
   NEXT_PUBLIC_PIPEBOARD_TOKEN=your_pipeboard_token_here
   NEXT_PUBLIC_PIPEBOARD_URL=https://api.pipeboard.com
   ```

**Usage in App**:
- Mock Meta Ads data for development
- Testing campaign management features
- Local development without real Meta Ads API

---

### 3. **Supabase** (Already Configured)
**Purpose**: Authentication and database
**Required**: Yes (already configured)
**Cost**: Free tier available

**Current Configuration**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://phkwcxmjkfjncvsqtshm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 4. **Meta Ads API** (Production)
**Purpose**: Real Meta Ads data integration
**Required**: For production use
**Cost**: Free (Meta Ads API is free to use)

**Setup Instructions**:
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a Meta App
3. Add Meta Ads API permissions
4. Generate access tokens
5. Configure in production environment

---

## 🛠️ Environment Configuration

### Development Environment (`.env.local`)
```env
# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://phkwcxmjkfjncvsqtshm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (Required)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Pipeboard (Optional - for local development)
NEXT_PUBLIC_PIPEBOARD_TOKEN=your_pipeboard_token_here
NEXT_PUBLIC_PIPEBOARD_URL=https://api.pipeboard.com

# Meta Ads MCP (Optional - for local development)
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:8000
```

### Production Environment
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key

# OpenAI
OPENAI_API_KEY=sk-your-production-openai-api-key

# Meta Ads API (Production)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_ACCESS_TOKEN=your_meta_access_token
```

---

## 🔧 Configuration Files

### 1. **Frontend Configuration** (`/src/lib/config.ts`)
```typescript
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },
  pipeboard: {
    token: process.env.NEXT_PUBLIC_PIPEBOARD_TOKEN,
    baseUrl: process.env.NEXT_PUBLIC_PIPEBOARD_URL
  },
  metaAdsMCP: {
    baseUrl: process.env.NEXT_PUBLIC_MCP_SERVER_URL,
    timeout: 30000
  }
}
```

### 2. **Backend Configuration** (`/backend/app/core/config.py`)
```python
class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    openai_api_key: Optional[str] = None
    meta_app_id: Optional[str] = None
    meta_app_secret: Optional[str] = None
```

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit with your API keys
nano .env.local
```

### Step 3: Get Required API Keys

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up/Login
3. Go to API Keys
4. Create new key
5. Copy and paste into `.env.local`

#### Pipeboard Token (Optional)
1. Visit [Pipeboard](https://pipeboard.com/)
2. Create account
3. Generate API token
4. Add to `.env.local`

### Step 4: Verify Configuration
```bash
# Check if all required variables are set
npm run build

# Start development server
npm run dev
```

---

## 🔍 Environment Validation

The app includes automatic environment validation:

```typescript
// Check environment on app startup
import { checkEnvironment } from '@/lib/config'

if (!checkEnvironment()) {
  console.warn('⚠️ Some environment variables are missing')
  console.warn('The app may not function properly')
}
```

### Validation Checks:
- ✅ OpenAI API key is set
- ✅ Supabase credentials are configured
- ⚠️ Pipeboard token (optional for development)
- ⚠️ Meta Ads API credentials (optional for development)

---

## 💰 Cost Estimation

### Development Phase
- **OpenAI API**: ~$5-20/month (depending on usage)
- **Supabase**: Free tier (up to 50,000 monthly active users)
- **Pipeboard**: Free for development
- **Total**: ~$5-20/month

### Production Phase
- **OpenAI API**: ~$50-200/month (depending on user base)
- **Supabase**: Free tier or $25/month for Pro plan
- **Meta Ads API**: Free
- **Total**: ~$75-225/month

---

## 🔒 Security Considerations

### API Key Security
1. **Never commit API keys to version control**
2. **Use environment variables for all secrets**
3. **Rotate API keys regularly**
4. **Use least privilege principle**

### Environment Variables
```bash
# ✅ Good - Use .env.local (gitignored)
OPENAI_API_KEY=sk-your-key-here

# ❌ Bad - Never hardcode in source
const apiKey = "sk-your-key-here"
```

### Production Security
1. **Use production API keys only in production**
2. **Enable API key restrictions in OpenAI dashboard**
3. **Monitor API usage and costs**
4. **Implement rate limiting**

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "OpenAI API key not configured"
**Solution**: Add `OPENAI_API_KEY` to your `.env.local` file

#### 2. "Pipeboard token not configured"
**Solution**: This is optional for development. Add `NEXT_PUBLIC_PIPEBOARD_TOKEN` if needed

#### 3. "Supabase connection failed"
**Solution**: Verify Supabase URL and anon key in `.env.local`

#### 4. "Build errors due to missing environment variables"
**Solution**: Run `npm run build` to see which variables are missing

### Debug Mode
```bash
# Enable debug logging
DEBUG=true npm run dev
```

---

## 📚 Additional Resources

### Documentation
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Meta Ads API Documentation](https://developers.facebook.com/docs/marketing-apis/)
- [Pipeboard Documentation](https://pipeboard.com/docs)

### Support
- **OpenAI**: [OpenAI Help Center](https://help.openai.com/)
- **Supabase**: [Supabase Support](https://supabase.com/support)
- **Meta**: [Meta for Developers Support](https://developers.facebook.com/support/)

---

## ✅ Checklist

Before running the app, ensure you have:

- [ ] OpenAI API key configured
- [ ] Supabase credentials set up
- [ ] Environment variables in `.env.local`
- [ ] All dependencies installed
- [ ] Build passes without errors
- [ ] Development server starts successfully

---

**Note**: The Pipeboard token is only needed for local development. In production, you'll use the real Meta Ads API directly.