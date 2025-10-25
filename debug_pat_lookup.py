"""Debug script to check PAT lookup and Meta token retrieval."""

import sys
from meta_ads_mcp.core.db import get_db
from meta_ads_mcp.core.models import User, PersonalAccessToken, OAuthToken
from meta_ads_mcp.core.pat import extract_prefix, verify_pat
from sqlalchemy import select

# The token from the user
RAW_TOKEN = "mcp_434f53d63f33a86fc6a57e4d91a72190b5129a3e7144cd5f87ee7e96446feaed"

def debug_pat_lookup():
    """Debug PAT lookup process."""
    print(f"🔍 Debugging PAT lookup for token: {RAW_TOKEN[:20]}...")
    print()
    
    # Extract prefix
    prefix = extract_prefix(RAW_TOKEN)
    print(f"📋 Extracted prefix: {prefix}")
    print(f"   (Length: {len(prefix)} characters)")
    print()
    
    try:
        with get_db() as db:
            # Find PATs with matching prefix
            print(f"🔎 Looking for PATs with prefix: {prefix}")
            candidates = db.execute(
                select(PersonalAccessToken)
                .where(PersonalAccessToken.token_prefix == prefix)
            ).scalars().all()
            
            print(f"✅ Found {len(candidates)} candidate PAT(s)")
            print()
            
            if not candidates:
                print("❌ No PATs found with this prefix!")
                print("   Checking all PATs in database...")
                all_pats = db.execute(select(PersonalAccessToken)).scalars().all()
                print(f"   Total PATs in database: {len(all_pats)}")
                for pat in all_pats[:5]:  # Show first 5
                    print(f"   - ID: {pat.id}, Prefix: {pat.token_prefix}, User: {pat.user_id}")
                return
            
            # Try to verify each candidate
            for i, pat in enumerate(candidates, 1):
                print(f"🔐 Verifying candidate {i}:")
                print(f"   PAT ID: {pat.id}")
                print(f"   User ID: {pat.user_id}")
                print(f"   Name: {pat.name}")
                print(f"   Prefix: {pat.token_prefix}")
                print(f"   Is Active: {pat.is_active}")
                print(f"   Hash type: {'Argon2' if pat.token_hash.startswith('$argon2') else 'SHA256'}")
                print()
                
                # Verify hash
                is_valid = verify_pat(RAW_TOKEN, pat.token_hash)
                print(f"   Hash verification: {'✅ VALID' if is_valid else '❌ INVALID'}")
                print()
                
                if is_valid and pat.is_active:
                    # Get user
                    user = db.get(User, pat.user_id)
                    user_email = user.email if user else f"user_{pat.user_id[:8]}"
                    print(f"   👤 User: {user_email}")
                    print()
                    
                    # Get Meta token
                    print(f"   🔎 Looking for Meta OAuth token...")
                    meta_token = db.execute(
                        select(OAuthToken)
                        .where(
                            OAuthToken.user_id == pat.user_id,
                            OAuthToken.provider == "meta"
                        )
                    ).scalar_one_or_none()
                    
                    if meta_token:
                        print(f"   ✅ Found Meta OAuth token!")
                        print(f"      Token ID: {meta_token.id}")
                        print(f"      Access Token: {meta_token.access_token[:30]}...")
                        print(f"      Expires At: {meta_token.expires_at}")
                        print(f"      Account ID: {meta_token.account_id}")
                        print()
                        print("🎉 PAT verification should work! The issue is elsewhere.")
                    else:
                        print(f"   ❌ No Meta OAuth token found for this user!")
                        print(f"      Checking all OAuth tokens for user {pat.user_id}...")
                        all_tokens = db.execute(
                            select(OAuthToken)
                            .where(OAuthToken.user_id == pat.user_id)
                        ).scalars().all()
                        print(f"      Total OAuth tokens for user: {len(all_tokens)}")
                        for token in all_tokens:
                            print(f"      - Provider: {token.provider}, ID: {token.id}")
                    return
            
            print("❌ No valid PAT found that matches the hash")
    
    except Exception as e:
        print(f"❌ Error during PAT lookup: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_pat_lookup()

