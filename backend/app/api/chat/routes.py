"""Chat API routes with Meta Ads MCP integration."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any, Optional
import json
import re

from ...models.user import User
from ...services.auth import auth_service
from ...services.meta_ads_integration import meta_ads_integration
from ...core.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user."""
    token = credentials.credentials
    token_data = auth_service.verify_token(token)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await auth_service.get_user_by_id(token_data.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


@router.post("/message")
async def send_message(
    message: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Send a message to the AI assistant with Meta Ads integration."""
    try:
        user_message = message.get("content", "")
        conversation_history = message.get("history", [])
        
        # Analyze the message to determine what data to fetch
        data = {}
        chart_data = None
        recommendations = []
        
        # Check for specific keywords to determine what data to fetch
        lower_message = user_message.lower()
        
        if any(keyword in lower_message for keyword in ["account", "accounts"]):
            # Get ad accounts
            data = await meta_ads_integration.call_mcp_tool(
                "mcp_meta_ads_get_ad_accounts",
                {"access_token": current_user.meta_access_token}
            )
        
        elif any(keyword in lower_message for keyword in ["campaign", "campaigns"]):
            # Get campaigns
            data = await meta_ads_integration.call_mcp_tool(
                "mcp_meta_ads_get_campaigns",
                {"account_id": "act_123456789", "access_token": current_user.meta_access_token}
            )
            
            # Generate recommendations
            recommendations = await meta_ads_integration.get_ai_recommendations(data)
            
            # Check if user wants a chart
            if any(keyword in lower_message for keyword in ["chart", "graph", "visualize", "show"]):
                chart_data = await meta_ads_integration.generate_chart_data("campaign_performance", data)
        
        elif any(keyword in lower_message for keyword in ["insight", "performance", "spend", "trend"]):
            # Get insights
            data = await meta_ads_integration.call_mcp_tool(
                "mcp_meta_ads_get_insights",
                {"object_id": "123456789", "access_token": current_user.meta_access_token}
            )
            
            # Check if user wants a chart
            if any(keyword in lower_message for keyword in ["chart", "graph", "visualize", "show"]):
                chart_data = await meta_ads_integration.generate_chart_data("spend_trend", data)
        
        elif any(keyword in lower_message for keyword in ["adset", "ad set", "targeting"]):
            # Get ad sets
            data = await meta_ads_integration.call_mcp_tool(
                "mcp_meta_ads_get_adsets",
                {"account_id": "act_123456789", "access_token": current_user.meta_access_token}
            )
        
        elif any(keyword in lower_message for keyword in ["ad", "ads", "creative"]):
            # Get ads
            data = await meta_ads_integration.call_mcp_tool(
                "mcp_meta_ads_get_ads",
                {"account_id": "act_123456789", "access_token": current_user.meta_access_token}
            )
        
        # Generate AI response
        ai_response = await generate_ai_response(
            user_message, 
            data, 
            chart_data, 
            recommendations,
            conversation_history
        )
        
        return {
            "response": ai_response,
            "data": data,
            "chart_data": chart_data,
            "recommendations": recommendations
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing message: {str(e)}"
        )


async def generate_ai_response(
    user_message: str,
    data: Dict[str, Any],
    chart_data: Optional[Dict[str, Any]],
    recommendations: List[str],
    conversation_history: List[Dict[str, Any]]
) -> str:
    """Generate AI response based on user message and Meta Ads data."""
    
    # This is a simplified response generator
    # In a real implementation, you would use OpenAI API or another LLM
    
    response_parts = []
    
    # Add data summary
    if data:
        if "accounts" in data:
            accounts = data["accounts"]
            response_parts.append(f"I found {len(accounts)} ad account(s):")
            for account in accounts:
                response_parts.append(f"• {account['name']} ({account['id']}) - {account['status']}")
        
        elif "campaigns" in data:
            campaigns = data["campaigns"]
            response_parts.append(f"I found {len(campaigns)} campaign(s):")
            for campaign in campaigns:
                spend = campaign.get("spend", 0) / 100
                response_parts.append(
                    f"• {campaign['name']} - {campaign['status']} - "
                    f"CTR: {campaign.get('ctr', 0)}% - Spend: ${spend:.2f}"
                )
        
        elif "insights" in data:
            insights = data["insights"]
            total_spend = sum(insight.get("spend", 0) for insight in insights) / 100
            avg_ctr = sum(insight.get("ctr", 0) for insight in insights) / len(insights)
            response_parts.append(
                f"Performance insights: Total spend ${total_spend:.2f}, "
                f"Average CTR {avg_ctr:.2f}%"
            )
    
    # Add recommendations
    if recommendations:
        response_parts.append("\n💡 Recommendations:")
        for rec in recommendations:
            response_parts.append(f"• {rec}")
    
    # Add chart information if available
    if chart_data:
        response_parts.append("\n📊 I've generated a chart to visualize this data.")
    
    # Add general advice based on the query
    if "performance" in user_message.lower() or "how" in user_message.lower():
        response_parts.append(
            "\n💡 To improve performance, consider:\n"
            "• Optimizing ad creative and copy\n"
            "• Refining your target audience\n"
            "• Testing different bidding strategies\n"
            "• Monitoring and adjusting budgets based on performance"
        )
    
    if not response_parts:
        response_parts.append(
            "I'm here to help you with your Meta Ads campaigns! "
            "You can ask me about:\n"
            "• Your ad accounts and campaigns\n"
            "• Performance metrics and insights\n"
            "• Optimization recommendations\n"
            "• Data visualizations and charts"
        )
    
    return "\n".join(response_parts)


@router.get("/suggestions")
async def get_suggestions(current_user: User = Depends(get_current_user)):
    """Get suggested questions for the chat."""
    return {
        "suggestions": [
            "Show me my ad accounts",
            "What are my campaign performance metrics?",
            "Generate a chart of my daily spend",
            "Which campaigns have the best CTR?",
            "Show me impressions by campaign",
            "What are your recommendations for improving performance?",
            "Show me my ad sets and targeting",
            "What's my current ad spend trend?"
        ]
    }


@router.post("/analyze")
async def analyze_campaigns(
    analysis_request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Analyze campaigns and provide insights."""
    try:
        # Get campaign data
        campaign_data = await meta_ads_integration.call_mcp_tool(
            "mcp_meta_ads_get_campaigns",
            {"account_id": "act_123456789", "access_token": current_user.meta_access_token}
        )
        
        # Generate recommendations
        recommendations = await meta_ads_integration.get_ai_recommendations(campaign_data)
        
        # Generate chart data
        chart_data = await meta_ads_integration.generate_chart_data("campaign_performance", campaign_data)
        
        return {
            "analysis": {
                "total_campaigns": len(campaign_data.get("campaigns", [])),
                "active_campaigns": len([c for c in campaign_data.get("campaigns", []) if c.get("status") == "ACTIVE"]),
                "total_spend": sum(c.get("spend", 0) for c in campaign_data.get("campaigns", [])) / 100,
                "avg_ctr": sum(c.get("ctr", 0) for c in campaign_data.get("campaigns", [])) / len(campaign_data.get("campaigns", []))
            },
            "recommendations": recommendations,
            "chart_data": chart_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing campaigns: {str(e)}"
        )