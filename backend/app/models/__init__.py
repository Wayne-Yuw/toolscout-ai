"""
Database Models
统一导入所有数据库模型
"""
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, TIMESTAMP, JSON, ARRAY, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base

# 导入用户认证相关模型
from app.models.user import (
    User,
    OAuthBinding,
    Subscription,
    QuotaUsage,
    PhoneChangeLog,
    # 枚举类型
    MembershipLevel,
    UserStatus,
    OAuthProvider,
    SubscriptionStatus,
    BillingCycle,
    QuotaType,
)


# ==========================================
# 工具分析相关模型 (原有模型)
# ==========================================

class Tool(Base):
    """Tool model"""
    __tablename__ = "tools"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    overview = Column(Text, nullable=True)
    core_pain_point = Column(Text, nullable=True)
    analysis_data = Column(JSON, nullable=True)
    screenshot_url = Column(String, nullable=True)
    favicon_url = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    audiences = relationship("Audience", back_populates="tool", cascade="all, delete-orphan")
    scripts = relationship("Script", back_populates="tool", cascade="all, delete-orphan")


class Audience(Base):
    """Audience model"""
    __tablename__ = "audiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tool_id = Column(UUID(as_uuid=True), ForeignKey("tools.id", ondelete="CASCADE"), nullable=False)
    label = Column(String, nullable=False)
    emoji = Column(String, nullable=True)
    pain_points = Column(ARRAY(String), nullable=True)
    solutions = Column(ARRAY(String), nullable=True)
    match_score = Column(Float, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    tool = relationship("Tool", back_populates="audiences")
    scripts = relationship("Script", back_populates="audience", cascade="all, delete-orphan")


class Script(Base):
    """Script model"""
    __tablename__ = "scripts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tool_id = Column(UUID(as_uuid=True), ForeignKey("tools.id", ondelete="CASCADE"), nullable=False)
    audience_id = Column(UUID(as_uuid=True), ForeignKey("audiences.id", ondelete="CASCADE"), nullable=False)
    style = Column(String, nullable=False)  # dry_goods/story/comparison/pain_point/custom
    platform = Column(String, nullable=False)  # douyin/xiaohongshu/bilibili/shipinhao
    content = Column(JSON, nullable=False)
    keywords = Column(ARRAY(String), nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    tool = relationship("Tool", back_populates="scripts")
    audience = relationship("Audience", back_populates="scripts")


class SearchResult(Base):
    """Search result cache model"""
    __tablename__ = "search_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query = Column(String, nullable=False, index=True)
    results = Column(JSON, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)


# ==========================================
# 导出所有模型
# ==========================================

__all__ = [
    # Base
    "Base",
    # 用户认证模型
    "User",
    "OAuthBinding",
    "Subscription",
    "QuotaUsage",
    "PhoneChangeLog",
    # 工具分析模型
    "Tool",
    "Audience",
    "Script",
    "SearchResult",
    # 枚举类型
    "MembershipLevel",
    "UserStatus",
    "OAuthProvider",
    "SubscriptionStatus",
    "BillingCycle",
    "QuotaType",
]
