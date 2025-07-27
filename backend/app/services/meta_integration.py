"""Meta Ads API Integration Service."""

import httpx
import json
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from ..core.config import settings


class MetaIntegrationService:
    """Service for integrating with Meta Ads API."""

    def __init__(self):
        self.app_id = settings.meta_app_id
        self.app_secret = settings.meta_app_secret
        self.base_url = "https://graph.facebook.com/v18.0"
        self.client = httpx.AsyncClient(timeout=30.0)

    async def validate_access_token(self, access_token: str) -> bool:
        """Validate Meta access token."""
        try:
            response = await self.client.get(
                f"{self.base_url}/me",
                params={"access_token": access_token}
            )
            return response.status_code == 200 and not response.json().get("error")
        except Exception:
            return False

    async def get_user_info(self, access_token: str) -> Optional[Dict[str, Any]]:
        """Get user information from Meta."""
        try:
            response = await self.client.get(
                f"{self.base_url}/me",
                params={
                    "access_token": access_token,
                    "fields": "id,name,email"
                }
            )
            if response.status_code == 200:
                return response.json()
            return None
        except Exception:
            return None

    async def get_ad_accounts(self, access_token: str) -> List[Dict[str, Any]]:
        """Get user's ad accounts."""
        try:
            response = await self.client.get(
                f"{self.base_url}/me/adaccounts",
                params={
                    "access_token": access_token,
                    "fields": "id,name,account_status,currency,timezone_name,business_name,account_type"
                }
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
            return []
        except Exception:
            return []

    async def get_campaigns(self, account_id: str, access_token: str) -> List[Dict[str, Any]]:
        """Get campaigns for an ad account."""
        try:
            response = await self.client.get(
                f"{self.base_url}/{account_id}/campaigns",
                params={
                    "access_token": access_token,
                    "fields": "id,name,status,objective,daily_budget,lifetime_budget,spend,impressions,clicks,ctr,cpc,created_time,updated_time"
                }
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
            return []
        except Exception:
            return []

    async def get_insights(self, object_id: str, access_token: str, date_range: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        """Get insights for a campaign, ad set, or ad."""
        try:
            params = {
                "access_token": access_token,
                "fields": "date_start,date_stop,spend,impressions,clicks,ctr,cpc,cpm,reach,frequency"
            }

            if date_range:
                params["date_preset"] = "custom"
                params["time_range"] = json.dumps({
                    "since": date_range["start"],
                    "until": date_range["end"]
                })
            else:
                params["date_preset"] = "last_30d"

            response = await self.client.get(
                f"{self.base_url}/{object_id}/insights",
                params=params
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
            return []
        except Exception:
            return []

    async def get_ad_sets(self, campaign_id: str, access_token: str) -> List[Dict[str, Any]]:
        """Get ad sets for a campaign."""
        try:
            response = await self.client.get(
                f"{self.base_url}/{campaign_id}/adsets",
                params={
                    "access_token": access_token,
                    "fields": "id,name,status,campaign_id,daily_budget,lifetime_budget,targeting,created_time,updated_time"
                }
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
            return []
        except Exception:
            return []

    async def get_ads(self, adset_id: str, access_token: str) -> List[Dict[str, Any]]:
        """Get ads for an ad set."""
        try:
            response = await self.client.get(
                f"{self.base_url}/{adset_id}/ads",
                params={
                    "access_token": access_token,
                    "fields": "id,name,status,adset_id,creative,created_time,updated_time"
                }
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
            return []
        except Exception:
            return []

    async def update_campaign_status(self, campaign_id: str, access_token: str, status: str) -> bool:
        """Update campaign status."""
        try:
            response = await self.client.post(
                f"{self.base_url}/{campaign_id}",
                params={"access_token": access_token},
                data={"status": status}
            )
            return response.status_code == 200
        except Exception:
            return False

    async def update_campaign_budget(self, campaign_id: str, access_token: str, daily_budget: int) -> bool:
        """Update campaign daily budget."""
        try:
            response = await self.client.post(
                f"{self.base_url}/{campaign_id}",
                params={"access_token": access_token},
                data={"daily_budget": daily_budget}
            )
            return response.status_code == 200
        except Exception:
            return False

    async def get_realtime_insights(self, account_id: str, access_token: str) -> List[Dict[str, Any]]:
        """Get real-time insights for an account."""
        try:
            # Get today's insights
            today = datetime.now().strftime("%Y-%m-%d")
            response = await self.client.get(
                f"{self.base_url}/{account_id}/insights",
                params={
                    "access_token": access_token,
                    "fields": "date_start,date_stop,spend,impressions,clicks,ctr,cpc,cpm,reach,frequency",
                    "date_preset": "today"
                }
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
            return []
        except Exception:
            return []

    async def generate_optimization_strategies(self, account_id: str, access_token: str) -> List[Dict[str, Any]]:
        """Generate optimization strategies based on account performance."""
        try:
            # Get campaigns and their insights
            campaigns = await self.get_campaigns(account_id, access_token)
            strategies = []

            for campaign in campaigns:
                if campaign.get("status") == "ACTIVE":
                    insights = await self.get_insights(campaign["id"], access_token, {
                        "start": (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d"),
                        "end": datetime.now().strftime("%Y-%m-%d")
                    })

                    if insights:
                        latest_insight = insights[0]
                        strategy = self._analyze_campaign_performance(campaign, latest_insight)
                        strategies.append(strategy)

            return strategies
        except Exception:
            return []

    def _analyze_campaign_performance(self, campaign: Dict[str, Any], insight: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze campaign performance and generate optimization strategy."""
        spend = float(insight.get("spend", 0))
        impressions = int(insight.get("impressions", 0))
        clicks = int(insight.get("clicks", 0))
        ctr = float(insight.get("ctr", 0))
        cpc = float(insight.get("cpc", 0))
        cpm = float(insight.get("cpm", 0))

        # Define thresholds
        low_ctr_threshold = 1.0
        high_cpc_threshold = 2.0
        low_reach_threshold = 10000

        # Generate strategy
        strategy = {
            "campaign_id": campaign["id"],
            "campaign_name": campaign["name"],
            "type": "performance_optimization",
            "status": "active",
            "rules": {
                "min_ctr": low_ctr_threshold,
                "max_cpc": high_cpc_threshold,
                "target_cpm": 15.0,
                "budget_threshold": float(campaign.get("daily_budget", 0)) * 0.8
            },
            "actions": {
                "pause_low_performing": ctr < low_ctr_threshold,
                "increase_budget": cpc < 1.5 and ctr > 2.0,
                "adjust_bidding": cpc > high_cpc_threshold,
                "expand_audience": int(insight.get("reach", 0)) < low_reach_threshold
            },
            "performance_metrics": {
                "spend": spend,
                "impressions": impressions,
                "clicks": clicks,
                "ctr": ctr,
                "cpc": cpc,
                "cpm": cpm
            },
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        return strategy

    async def execute_strategy(self, strategy: Dict[str, Any], access_token: str) -> bool:
        """Execute an optimization strategy."""
        try:
            campaign_id = strategy["campaign_id"]
            actions = strategy["actions"]

            if actions.get("pause_low_performing"):
                await self.update_campaign_status(campaign_id, access_token, "PAUSED")

            if actions.get("increase_budget"):
                current_budget = float(strategy.get("performance_metrics", {}).get("spend", 0))
                new_budget = int(current_budget * 1.2 * 100)  # Increase by 20%
                await self.update_campaign_budget(campaign_id, access_token, new_budget)

            return True
        except Exception:
            return False

    async def get_account_performance_summary(self, account_id: str, access_token: str) -> Dict[str, Any]:
        """Get a summary of account performance."""
        try:
            campaigns = await self.get_campaigns(account_id, access_token)
            total_spend = 0
            total_impressions = 0
            total_clicks = 0
            active_campaigns = 0

            for campaign in campaigns:
                if campaign.get("status") == "ACTIVE":
                    active_campaigns += 1
                    total_spend += float(campaign.get("spend", 0))
                    total_impressions += int(campaign.get("impressions", 0))
                    total_clicks += int(campaign.get("clicks", 0))

            avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
            avg_cpc = (total_spend / total_clicks) if total_clicks > 0 else 0

            return {
                "account_id": account_id,
                "total_campaigns": len(campaigns),
                "active_campaigns": active_campaigns,
                "total_spend": total_spend,
                "total_impressions": total_impressions,
                "total_clicks": total_clicks,
                "average_ctr": avg_ctr,
                "average_cpc": avg_cpc,
                "last_updated": datetime.now().isoformat()
            }
        except Exception:
            return {}

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


# Global Meta integration service instance
meta_integration = MetaIntegrationService()