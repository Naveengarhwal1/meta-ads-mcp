"""User models and schemas."""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User roles."""
    ADMIN = "admin"
    MANAGER = "manager"
    ANALYST = "analyst"
    USER = "user"


class UserBase(BaseModel):
    """Base user model."""
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.USER


class UserCreate(UserBase):
    """User creation model."""
    password: str


class UserUpdate(BaseModel):
    """User update model."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None


class UserInDB(UserBase):
    """User in database model."""
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    meta_access_token: Optional[str] = None
    meta_user_id: Optional[str] = None

    class Config:
        from_attributes = True


class User(UserInDB):
    """User response model."""
    pass


class UserLogin(BaseModel):
    """User login model."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Token response model."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: User


class TokenData(BaseModel):
    """Token data model."""
    user_id: Optional[str] = None