# Meta Ads Chat Implementation

## 🎯 Overview

This document describes the implementation of an AI-powered chat system that integrates with your existing Meta Ads MCP tools and can generate interactive charts to visualize campaign data and decisions.

## 🏗️ Architecture

### Frontend (Next.js)
- **Chat Interface**: Real-time chat with AI assistant
- **Chart Rendering**: Interactive charts using Chart.js
- **Streaming Responses**: Real-time AI responses using Vercel AI SDK
- **Authentication**: Supabase integration for user management

### Backend (FastAPI)
- **Meta Ads Integration**: Connects to your existing MCP tools
- **AI Response Generation**: Processes user queries and generates insights
- **Chart Data Generation**: Creates chart configurations for visualization
- **Authentication**: JWT-based user authentication

## 🚀 Features

### 💬 AI Chat Assistant
- **Real-time Messaging**: Stream responses from AI
- **Context Awareness**: Understands Meta Ads terminology
- **Smart Suggestions**: Pre-built questions for common queries
- **Conversation History**: Maintains chat context

### 📊 Chart Generation
- **Line Charts**: For time-series data (spend trends, performance over time)
- **Bar Charts**: For campaign comparisons (CTR, spend by campaign)
- **Doughnut Charts**: For distribution data (impressions by campaign)
- **Interactive**: Hover effects, tooltips, and responsive design

### 🔗 Meta Ads Integration
- **Account Management**: View and manage ad accounts
- **Campaign Analytics**: Performance metrics and insights
- **Ad Set Analysis**: Targeting and budget information
- **Creative Review**: Ad performance and optimization

## 🛠️ Implementation Details

### Frontend Components

#### 1. Chat Interface (`/src/components/chat/chat-interface.tsx`)
```typescript
interface ChatInterfaceProps {
  accessToken?: string
  className?: string
}
```

**Features:**
- Real-time message streaming
- Chart rendering integration
- Suggested questions
- Loading states and error handling

#### 2. Chart Renderer (`/src/components/chat/chart-renderer.tsx`)
```typescript
interface ChartData {
  type: 'line' | 'bar' | 'doughnut'
  data: {
    labels: string[]
    datasets: Array<{
      label?: string
      data: number[]
      borderColor?: string
      backgroundColor?: string | string[]
    }>
  }
  options: ChartOptions
}
```

**Supported Chart Types:**
- **Line**: Spend trends, performance over time
- **Bar**: Campaign comparisons, CTR analysis
- **Doughnut**: Distribution of impressions, clicks

#### 3. Chat API Route (`/src/app/api/chat/route.ts`)
```typescript
export async function POST(req: NextRequest) {
  // Process user message
  // Call Meta Ads MCP tools
  // Generate chart data
  // Stream AI response
}
```

### Backend Services

#### 1. Meta Ads Integration (`/backend/app/services/meta_ads_integration.py`)
```python
class MetaAdsMCPIntegration:
    async def call_mcp_tool(self, tool_name: str, params: Dict[str, Any])
    async def get_ai_recommendations(self, campaign_data: Dict[str, Any])
    async def generate_chart_data(self, data_type: str, data: Dict[str, Any])
```

**Available MCP Tools:**
- `mcp_meta_ads_get_ad_accounts`
- `mcp_meta_ads_get_campaigns`
- `mcp_meta_ads_get_insights`
- `mcp_meta_ads_get_adsets`
- `mcp_meta_ads_get_ads`

#### 2. Chat API Routes (`/backend/app/api/chat/routes.py`)
```python
@router.post("/message")
@router.get("/suggestions")
@router.post("/analyze")
```

## 📊 Chart Types and Use Cases

### 1. Spend Trend Analysis
**Chart Type**: Line Chart
**Data Source**: Campaign insights over time
**Use Case**: Track daily/weekly ad spend patterns

```json
{
  "type": "line",
  "data": {
    "labels": ["2024-01-01", "2024-01-02", "2024-01-03"],
    "datasets": [{
      "label": "Daily Spend ($)",
      "data": [100, 120, 110],
      "borderColor": "rgb(59, 130, 246)"
    }]
  }
}
```

### 2. Campaign Performance Comparison
**Chart Type**: Bar Chart
**Data Source**: Campaign metrics
**Use Case**: Compare CTR, spend, and performance across campaigns

```json
{
  "type": "bar",
  "data": {
    "labels": ["Campaign A", "Campaign B", "Campaign C"],
    "datasets": [
      {
        "label": "CTR (%)",
        "data": [2.5, 1.8, 3.2],
        "backgroundColor": "rgba(34, 197, 94, 0.8)"
      }
    ]
  }
}
```

### 3. Impression Distribution
**Chart Type**: Doughnut Chart
**Data Source**: Campaign impression data
**Use Case**: Visualize how impressions are distributed across campaigns

```json
{
  "type": "doughnut",
  "data": {
    "labels": ["Campaign A", "Campaign B", "Campaign C"],
    "datasets": [{
      "data": [125000, 89000, 156000],
      "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"]
    }]
  }
}
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

#### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
MCP_SERVER_URL=http://localhost:8000
```

### MCP Tool Integration

To connect with your actual Meta Ads MCP tools, update the `call_mcp_tool` method in `meta_ads_integration.py`:

```python
async def call_mcp_tool(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Call a Meta Ads MCP tool."""
    try:
        # Replace mock implementation with actual MCP calls
        response = await self.client.post(
            f"{self.base_url}/tools/{tool_name}",
            json=params,
            headers={"Authorization": f"Bearer {params.get('access_token')}"}
        )
        return response.json()
    except Exception as e:
        return {"error": str(e)}
```

## 🎨 User Experience

### Chat Flow
1. **User asks question** about Meta Ads campaigns
2. **AI analyzes query** and determines required data
3. **MCP tools fetch data** from Meta Ads API
4. **AI generates response** with insights and recommendations
5. **Charts are generated** if visualization is requested
6. **Response is streamed** to user in real-time

### Example Conversations

#### Query: "Show me my campaign performance"
**AI Response:**
```
I found 3 campaign(s):
• Summer Sale Campaign - ACTIVE - CTR: 2.56% - Spend: $24.50
• Brand Awareness - PAUSED - CTR: 1.35% - Spend: $18.90
• Lead Generation - ACTIVE - CTR: 2.63% - Spend: $32.00

💡 Recommendations:
• Campaign 'Brand Awareness' has a low CTR of 1.35%. Consider improving ad creative or targeting.
• Campaign 'Lead Generation' has spent $32.00. Consider reviewing performance and adjusting budget if needed.

📊 I've generated a chart to visualize this data.
```

#### Query: "Generate a chart of my daily spend"
**AI Response:**
```
Performance insights: Total spend $6.00, Average CTR 3.00%

📊 I've generated a chart to visualize this data.
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Frontend
cp .env.local.example .env.local
# Add your OpenAI API key

# Backend
cp .env.example .env
# Add your API keys
```

### 3. Start Development Servers
```bash
# Frontend
npm run dev

# Backend
uvicorn app.main:app --reload
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Chat Page**: http://localhost:3000/chat
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔮 Future Enhancements

### Planned Features
1. **Advanced Chart Types**: Scatter plots, heatmaps, funnel charts
2. **Real-time Data**: WebSocket updates for live campaign data
3. **Custom Dashboards**: User-defined chart combinations
4. **Export Functionality**: Download charts as images or PDFs
5. **Multi-language Support**: Internationalization for global users

### Technical Improvements
1. **Caching**: Redis caching for frequently accessed data
2. **Rate Limiting**: API rate limiting for Meta Ads calls
3. **Error Handling**: Comprehensive error handling and recovery
4. **Performance**: Optimized chart rendering and data processing
5. **Testing**: Unit and integration tests for all components

## 🐛 Troubleshooting

### Common Issues

#### 1. Charts Not Rendering
- Check Chart.js dependencies are installed
- Verify chart data format is correct
- Check browser console for JavaScript errors

#### 2. MCP Tool Errors
- Verify MCP server is running
- Check access token is valid
- Review API response format

#### 3. AI Response Issues
- Verify OpenAI API key is set
- Check API rate limits
- Review error logs

### Debug Mode
Enable debug logging by setting `DEBUG=true` in your environment variables.

## 📚 API Reference

### Chat Endpoints

#### POST `/api/v1/chat/message`
Send a message to the AI assistant.

**Request:**
```json
{
  "content": "Show me my campaign performance",
  "history": []
}
```

**Response:**
```json
{
  "response": "AI response text...",
  "data": { "campaigns": [...] },
  "chart_data": { "type": "bar", ... },
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}
```

#### GET `/api/v1/chat/suggestions`
Get suggested questions for the chat.

**Response:**
```json
{
  "suggestions": [
    "Show me my ad accounts",
    "What are my campaign performance metrics?",
    "Generate a chart of my daily spend"
  ]
}
```

---

**Built with ❤️ by the Meta Ads Manager Team**