"""Authentication service using Supabase."""

from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from ..core.config import settings
from ..core.supabase import supabase
from ..models.user import User, UserCreate, UserLogin, Token, TokenData

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Authentication service."""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password."""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[TokenData]:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return TokenData(user_id=user_id)
        except JWTError:
            return None
    
    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[User]:
        """Authenticate a user with email and password."""
        try:
            # Use Supabase auth
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if response.user:
                # Get user profile from Supabase
                user_data = response.user
                return User(
                    id=user_data.id,
                    email=user_data.email,
                    full_name=user_data.user_metadata.get("full_name"),
                    role=user_data.user_metadata.get("role", "user"),
                    created_at=user_data.created_at,
                    updated_at=user_data.updated_at,
                    is_active=user_data.email_confirmed_at is not None,
                    meta_access_token=user_data.user_metadata.get("meta_access_token"),
                    meta_user_id=user_data.user_metadata.get("meta_user_id")
                )
        except Exception as e:
            print(f"Authentication error: {e}")
            return None
        
        return None
    
    @staticmethod
    async def create_user(user_data: UserCreate) -> Optional[User]:
        """Create a new user."""
        try:
            # Create user in Supabase
            response = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": {
                        "full_name": user_data.full_name,
                        "role": user_data.role.value
                    }
                }
            })
            
            if response.user:
                user_data = response.user
                return User(
                    id=user_data.id,
                    email=user_data.email,
                    full_name=user_data.user_metadata.get("full_name"),
                    role=user_data.user_metadata.get("role", "user"),
                    created_at=user_data.created_at,
                    updated_at=user_data.updated_at,
                    is_active=False,  # Email confirmation required
                    meta_access_token=None,
                    meta_user_id=None
                )
        except Exception as e:
            print(f"User creation error: {e}")
            return None
        
        return None
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """Get user by ID."""
        try:
            # Get user from Supabase
            response = supabase.auth.admin.get_user_by_id(user_id)
            if response.user:
                user_data = response.user
                return User(
                    id=user_data.id,
                    email=user_data.email,
                    full_name=user_data.user_metadata.get("full_name"),
                    role=user_data.user_metadata.get("role", "user"),
                    created_at=user_data.created_at,
                    updated_at=user_data.updated_at,
                    is_active=user_data.email_confirmed_at is not None,
                    meta_access_token=user_data.user_metadata.get("meta_access_token"),
                    meta_user_id=user_data.user_metadata.get("meta_user_id")
                )
        except Exception as e:
            print(f"Get user error: {e}")
            return None
        
        return None
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """Get user by email."""
        try:
            # Get user from Supabase by email
            response = supabase.auth.admin.list_users()
            for user in response.users:
                if user.email == email:
                    return User(
                        id=user.id,
                        email=user.email,
                        full_name=user.user_metadata.get("full_name"),
                        role=user.user_metadata.get("role", "user"),
                        created_at=user.created_at,
                        updated_at=user.updated_at,
                        is_active=user.email_confirmed_at is not None,
                        meta_access_token=user.user_metadata.get("meta_access_token"),
                        meta_user_id=user.user_metadata.get("meta_user_id")
                    )
        except Exception as e:
            print(f"Get user by email error: {e}")
            return None
        
        return None


# Global auth service instance
auth_service = AuthService()