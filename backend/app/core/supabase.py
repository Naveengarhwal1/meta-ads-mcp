"""Supabase client configuration."""

from supabase import create_client, Client
from .config import settings


def get_supabase_client() -> Client:
    """Get Supabase client instance."""
    return create_client(settings.supabase_url, settings.supabase_anon_key)


# Global Supabase client instance
supabase = get_supabase_client()