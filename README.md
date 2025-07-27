# Meta Ads Full-Stack Application

A modern, AI-powered Meta Ads management platform built with Next.js, FastAPI, and Supabase. This application provides comprehensive tools for managing Facebook and Instagram advertising campaigns with intelligent insights and real-time analytics.

## 🚀 Features

### 🔐 Authentication & User Management
- **Supabase Authentication**: Secure user registration and login
- **Role-based Access Control**: Admin, Manager, Analyst, and User roles
- **JWT Token Management**: Secure session handling
- **Multi-tenant Support**: Multiple ad accounts per user

### 💬 AI Chat Assistant
- **Real-time Chat**: WebSocket-based messaging system
- **AI Integration**: Powered by your existing Meta Ads MCP tools
- **Chat History**: Persistent conversation storage
- **Smart Recommendations**: AI-driven campaign optimization tips

### 📊 Analytics Dashboard
- **Real-time Metrics**: Live data from Meta Ads API
- **Performance Tracking**: Comprehensive campaign analytics
- **Custom Reports**: Build and save custom analytics
- **Visual Insights**: Beautiful charts and data visualization

### 🎯 Campaign Management
- **Campaign Builder**: Visual campaign creation interface
- **Creative Studio**: Ad creative management tools
- **Budget Optimization**: AI-powered budget recommendations
- **Performance Monitoring**: Real-time ad performance tracking

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Supabase      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (Database)    │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Python 3.11   │    │ • PostgreSQL    │
│ • TypeScript    │    │ • FastAPI       │    │ • Auth          │
│ • Tailwind CSS  │    │ • WebSockets    │    │ • Real-time     │
│ • Supabase      │    │ • Redis         │    │ • Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first styling
- **Supabase**: Authentication and real-time database
- **Lucide React**: Beautiful icons
- **Radix UI**: Accessible component primitives

### Backend
- **FastAPI**: Modern, fast Python web framework
- **Supabase**: Database and authentication
- **Redis**: Caching and session storage
- **WebSockets**: Real-time communication
- **Pydantic**: Data validation and serialization

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Local development environment
- **Supabase**: Backend-as-a-Service

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meta-ads-fullstack
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development

1. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

## 📁 Project Structure

```
meta-ads-fullstack/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Authentication components
│   │   │   └── ui/          # UI components
│   │   └── lib/             # Utilities and configurations
│   ├── Dockerfile
│   └── package.json
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # Core configurations
│   │   ├── models/          # Data models
│   │   ├── services/        # Business logic
│   │   └── websocket/       # WebSocket handlers
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml       # Docker orchestration
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SECRET_KEY=your_secret_key
REDIS_URL=redis://localhost:6379
DEBUG=true
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR,
  role VARCHAR DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  meta_access_token TEXT,
  meta_user_id VARCHAR
);
```

### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chat_sessions(id),
  content TEXT NOT NULL,
  message_type VARCHAR NOT NULL,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout

### Chat (Coming Soon)
- `GET /api/v1/chat/sessions` - Get chat sessions
- `POST /api/v1/chat/sessions` - Create chat session
- `GET /api/v1/chat/sessions/{id}/messages` - Get messages
- `POST /api/v1/chat/sessions/{id}/messages` - Send message

### Meta Ads (Coming Soon)
- `GET /api/v1/ads/accounts` - Get ad accounts
- `GET /api/v1/ads/campaigns` - Get campaigns
- `GET /api/v1/ads/insights` - Get performance insights

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
pytest
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   - Set up production environment variables
   - Configure Supabase production project
   - Set up Redis instance

2. **Docker Deployment**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Vercel Deployment (Frontend)**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Railway/Heroku Deployment (Backend)**
   ```bash
   cd backend
   # Follow platform-specific deployment instructions
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Link to docs]
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discord**: [Join our community](https://discord.gg/your-server)
- **Email**: support@meta-ads-manager.com

## 🔮 Roadmap

### Phase 1: Foundation ✅
- [x] Authentication system
- [x] Basic dashboard
- [x] User management
- [x] Project structure

### Phase 2: Chat System 🚧
- [ ] WebSocket chat implementation
- [ ] AI integration with MCP tools
- [ ] Chat history and persistence
- [ ] Real-time messaging

### Phase 3: Analytics Dashboard 🚧
- [ ] Meta Ads API integration
- [ ] Real-time data visualization
- [ ] Custom reporting
- [ ] Performance metrics

### Phase 4: Campaign Management 📋
- [ ] Campaign builder interface
- [ ] Creative studio
- [ ] Budget optimization
- [ ] Automated recommendations

### Phase 5: Advanced Features 📋
- [ ] Multi-account support
- [ ] Advanced analytics
- [ ] Team collaboration
- [ ] Mobile app

---

**Built with ❤️ by the Meta Ads Manager Team** 
