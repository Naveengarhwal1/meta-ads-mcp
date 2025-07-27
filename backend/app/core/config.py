"""Application configuration and settings."""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    app_name: str = "Meta Ads Full-Stack"
    app_version: str = "0.1.0"
    debug: bool = False
    
    # Supabase
    supabase_url: str = "https://phkwcxmjkfjncvsqtshm.supabase.co"
    supabase_anon_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoa3djeG1qa2ZqbmN2c3F0c2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODg2NzMsImV4cCI6MjA2ODY2NDY3M30.FFFmTEUTi69Tp2vW_TVPsoJmuWA-5PfGnKPAx0Bk65k"
    supabase_service_key: Optional[str] = None
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Database
    database_url: Optional[str] = None
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # Meta Ads API
    meta_app_id: Optional[str] = None
    meta_app_secret: Optional[str] = None
    
    # CORS
    allowed_origins: list = ["http://localhost:3000", "http://localhost:3001"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()