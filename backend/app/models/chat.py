"""Chat models and schemas."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MessageType(str, Enum):
    """Message types."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessage(BaseModel):
    """Chat message model."""
    id: Optional[str] = None
    chat_id: str
    content: str
    message_type: MessageType
    user_id: str
    created_at: Optional[datetime] = None
    metadata: Optional[dict] = None

    class Config:
        from_attributes = True


class ChatSession(BaseModel):
    """Chat session model."""
    id: Optional[str] = None
    user_id: str
    title: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: bool = True
    metadata: Optional[dict] = None

    class Config:
        from_attributes = True


class ChatCreate(BaseModel):
    """Chat creation model."""
    title: Optional[str] = None


class MessageCreate(BaseModel):
    """Message creation model."""
    content: str
    chat_id: str
    metadata: Optional[dict] = None


class ChatResponse(BaseModel):
    """Chat response model."""
    chat: ChatSession
    messages: List[ChatMessage]


class ChatListResponse(BaseModel):
    """Chat list response model."""
    chats: List[ChatSession]
    total: int