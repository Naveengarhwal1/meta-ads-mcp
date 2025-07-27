"""Meta Ads API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any, Optional
from datetime import datetime

from ...models.user import User
from ...services.auth import auth_service
from ...services.meta_integration import meta_integration
from ...core.config import settings

router = APIRouter(prefix="/meta", tags=["meta"])
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user."""
    try:
        user = await auth_service.get_user_by_token(credentials.credentials)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

@router.get("/validate-token")
async def validate_meta_token(
    access_token: str,
    current_user: User = Depends(get_current_user)
):
    """Validate Meta access token."""
    try:
        is_valid = await meta_integration.validate_access_token(access_token)
        return {"valid": is_valid}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate token: {str(e)}"
        )

@router.get("/user-info")
async def get_meta_user_info(
    access_token: str,
    current_user: User = Depends(get_current_user)
):
    """Get Meta user information."""
    try:
        user_info = await meta_integration.get_user_info(access_token)
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User information not found"
            )
        return user_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user info: {str(e)}"
        )

@router.get("/ad-accounts")
async def get_ad_accounts(
    access_token: str,
    current_user: User = Depends(get_current_user)
):
    """Get user's ad accounts."""
    try:
        accounts = await meta_integration.get_ad_accounts(access_token)
        return {"accounts": accounts}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get ad accounts: {str(e)}"
        )

@router.get("/campaigns/{account_id}")
async def get_campaigns(
    account_id: str,
    access_token: str,
    current_user: User = Depends(get_current_user)
):
    """Get campaigns for an ad account."""
    try:
        campaigns = await meta_integration.get_campaigns(account_id, access_token)
        return {"campaigns": campaigns}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get campaigns: {str(e)}"
        )

@router.get("/insights/{object_id}")
async def get_insights(
    object_id: str,
    access_token: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get insights for a campaign, ad set, or ad."""
    try:
        date_range = None
        if start_date and end_date:
            date_range = {"start": start_date, "end": end_date}
        
        insights = await meta_integration.get_insights(object_id, access_token, date_range)
        return {"insights": insights}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get insights: {str(e)}"
        )

@router.get("/ad-sets/{campaign_id}")
async def get_ad_sets(
    campaign_id: str,
    access_token: str,
    current_user: User = Depends(get_current_user)
):
    """Get ad sets for a campaign."""
    try:
        ad_sets = await meta_integration.get_ad_sets(campaign_id, access_token)
        return {"ad_sets": ad_sets}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get ad sets: {str(e)}"
        )

@router.get("/ads/{adset_id}")
async def get_ads(
    adset_id: str,
    access_token: str,
    current_user: User = Depends(get_current_user)
):
    """Get ads for an ad set."""
    try:
        ads = await meta_integration.get_ads(adset_id, access_token)
        return {"ads": ads}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get ads: {str(e)}"
        )

@router.post("/campaigns/{campaign_id}/status")
async def update_campaign_status(
    campaign_id: str,
    status_update: Dict[str, str],
    access_token: str,
    current_user: User = Depends(get_current_user)
):
    """Update campaign status."""
    try:
        new_status = status_update.get("status")
        if not new_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status is required"
            )
        
        success = await meta_integration.update_campaign_status(campaign_id, access_token, new_status)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update campaign status"
            )
        
        return {"success": True, "message": f"Campaign status updated to {new_status}"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update campaign status: {str(e)}"
        )

@router.post("/campaigns/{campaign_id}/budget")
async def update_campaign_budget(
    campaign_id: str,
    budget_update: Dict[str, int],
    access_token: str,
    current_user: User = Depends(get_current_user)
):
    """Update campaign budget."""
    try:
        new_budget = budget_update.get("daily_budget")
        if not new_budget:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Daily budget is required"
            )
        
        success = await meta_integration.update_campaign_budget(campaign_id, access_token, new_budget)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update campaign budget"
            )
        
        return {"success": True, "message": f"Campaign budget updated to {new_budget}"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update campaign budget: {str(e)}"
        )

@router.get("/realtime/{account_id}")
async def get_realtime_insights(
    account_id: str,
    access_token: str,
    current_user: User = Depends(get_current_user)
):
    """Get real-time insights for an account."""
    try:
        insights = await meta_integration.get_realtime_insights(account_id, access_token)
        return {"insights": insights, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get real-time insights: {str(e)}"
        )

@router.get("/strategies/{account_id}")
async def generate_strategies(
    account_id: str,
    access_token: str,
    current_user: User = Depends(get_current_user)
):
    """Generate optimization strategies for an account."""
    try:
        strategies = await meta_integration.generate_optimization_strategies(account_id, access_token)
        return {"strategies": strategies}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate strategies: {str(e)}"
        )

@router.post("/strategies/execute")
async def execute_strategy(
    strategy: Dict[str, Any],
    access_token: str,
    current_user: User = Depends(get_current_user)
):
    """Execute an optimization strategy."""
    try:
        success = await meta_integration.execute_strategy(strategy, access_token)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to execute strategy"
            )
        
        return {"success": True, "message": "Strategy executed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute strategy: {str(e)}"
        )

@router.get("/performance/{account_id}")
async def get_account_performance(
    account_id: str,
    access_token: str,
    current_user: User = Depends(get_current_user)
):
    """Get account performance summary."""
    try:
        performance = await meta_integration.get_account_performance_summary(account_id, access_token)
        return performance
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get account performance: {str(e)}"
        )