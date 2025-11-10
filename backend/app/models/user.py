"""
用户认证相关数据模型
User Authentication Models
"""
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Boolean, TIMESTAMP,
    JSON, Enum as SQLEnum, ForeignKey, DECIMAL, Date, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base


# ==========================================
# 枚举类型定义
# ==========================================

class MembershipLevel(str, enum.Enum):
    """会员等级"""
    FREE = "free"
    BASIC = "basic"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class UserStatus(str, enum.Enum):
    """用户状态"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class OAuthProvider(str, enum.Enum):
    """OAuth提供商"""
    GOOGLE = "google"
    GITHUB = "github"


class SubscriptionStatus(str, enum.Enum):
    """订阅状态"""
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class BillingCycle(str, enum.Enum):
    """计费周期"""
    MONTHLY = "monthly"
    YEARLY = "yearly"


class QuotaType(str, enum.Enum):
    """配额类型"""
    ANALYSIS = "analysis"
    SCRIPT_GENERATION = "script_generation"
    API_CALL = "api_call"
    EXPORT = "export"


# ==========================================
# 用户表 (核心)
# ==========================================

class User(Base):
    """
    用户表 - 核心用户信息
    手机号为唯一身份凭证
    """
    __tablename__ = "users"

    # 主键
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 基本信息
    username = Column(String(50), unique=True, nullable=False, index=True, comment="用户名(唯一)")
    phone = Column(String(20), unique=True, nullable=False, index=True, comment="手机号(唯一身份凭证)")
    phone_verified = Column(Boolean, default=False, comment="手机号是否已验证")
    email = Column(String(100), nullable=True, index=True, comment="邮箱(可选)")
    email_verified = Column(Boolean, default=False, comment="邮箱是否已验证")

    # 密码相关
    password_hash = Column(String(255), nullable=True, comment="密码哈希(bcrypt)")
    password_salt = Column(String(100), nullable=True, comment="密码盐值")

    # 用户资料
    nickname = Column(String(50), nullable=True, comment="昵称")
    avatar_url = Column(String(500), nullable=True, comment="头像URL")
    bio = Column(Text, nullable=True, comment="个人简介")

    # 会员信息
    membership_level = Column(
        SQLEnum(MembershipLevel),
        default=MembershipLevel.FREE,
        nullable=False,
        comment="会员等级"
    )
    membership_expire_at = Column(TIMESTAMP, nullable=True, comment="会员到期时间")
    auto_renew = Column(Boolean, default=False, comment="是否自动续费")

    # 统计信息
    total_analysis_count = Column(Integer, default=0, comment="累计分析次数")
    total_script_count = Column(Integer, default=0, comment="累计生成文案数")

    # 状态
    status = Column(
        SQLEnum(UserStatus),
        default=UserStatus.ACTIVE,
        nullable=False,
        comment="用户状态"
    )
    is_admin = Column(Boolean, default=False, comment="是否是管理员")

    # 时间戳
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login_at = Column(TIMESTAMP, nullable=True, comment="最后登录时间")

    # 关系
    oauth_bindings = relationship("OAuthBinding", back_populates="user", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    quota_usages = relationship("QuotaUsage", back_populates="user", cascade="all, delete-orphan")
    phone_change_logs = relationship("PhoneChangeLog", back_populates="user", cascade="all, delete-orphan")

    # 索引
    __table_args__ = (
        Index('idx_user_phone', 'phone'),
        Index('idx_user_username', 'username'),
        Index('idx_user_membership', 'membership_level', 'membership_expire_at'),
        Index('idx_user_status', 'status'),
    )

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, phone={self.phone})>"


# ==========================================
# OAuth绑定表
# ==========================================

class OAuthBinding(Base):
    """
    OAuth绑定表 - 第三方账号绑定
    """
    __tablename__ = "oauth_bindings"

    # 主键
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 关联用户
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="关联用户ID"
    )

    # OAuth信息
    provider = Column(
        SQLEnum(OAuthProvider),
        nullable=False,
        comment="OAuth提供商"
    )
    provider_user_id = Column(String(255), nullable=False, comment="第三方平台用户ID")
    provider_username = Column(String(100), nullable=True, comment="第三方平台用户名")
    provider_email = Column(String(100), nullable=True, comment="第三方平台邮箱")
    provider_avatar = Column(String(500), nullable=True, comment="第三方平台头像")

    # Token信息(用于刷新)
    access_token = Column(Text, nullable=True, comment="访问令牌")
    refresh_token = Column(Text, nullable=True, comment="刷新令牌")
    token_expires_at = Column(TIMESTAMP, nullable=True, comment="令牌过期时间")

    # 元数据
    raw_data = Column(JSON, nullable=True, comment="原始OAuth返回数据")

    # 时间戳
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_used_at = Column(TIMESTAMP, nullable=True, comment="最后使用时间")

    # 关系
    user = relationship("User", back_populates="oauth_bindings")

    # 索引和约束
    __table_args__ = (
        Index('uk_provider_user', 'provider', 'provider_user_id', unique=True),
        Index('idx_oauth_user_id', 'user_id'),
    )

    def __repr__(self):
        return f"<OAuthBinding(id={self.id}, provider={self.provider}, user_id={self.user_id})>"


# ==========================================
# 会员订阅表
# ==========================================

class Subscription(Base):
    """
    会员订阅表 - 用户订阅记录
    """
    __tablename__ = "subscriptions"

    # 主键
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 关联用户
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="用户ID"
    )

    # 订阅信息
    plan_type = Column(
        SQLEnum(MembershipLevel),
        nullable=False,
        comment="套餐类型"
    )
    billing_cycle = Column(
        SQLEnum(BillingCycle),
        nullable=False,
        comment="计费周期"
    )

    # 价格信息
    original_price = Column(DECIMAL(10, 2), nullable=False, comment="原价")
    paid_price = Column(DECIMAL(10, 2), nullable=False, comment="实付价格")
    discount_code = Column(String(50), nullable=True, comment="优惠码")

    # 订阅周期
    started_at = Column(TIMESTAMP, nullable=False, comment="订阅开始时间")
    expires_at = Column(TIMESTAMP, nullable=False, comment="订阅到期时间")

    # 状态
    status = Column(
        SQLEnum(SubscriptionStatus),
        default=SubscriptionStatus.ACTIVE,
        nullable=False,
        comment="订阅状态"
    )
    auto_renew = Column(Boolean, default=True, comment="是否自动续费")

    # 支付信息
    payment_method = Column(String(50), nullable=True, comment="支付方式")
    transaction_id = Column(String(100), nullable=True, comment="交易ID")

    # 时间戳
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    cancelled_at = Column(TIMESTAMP, nullable=True, comment="取消时间")

    # 关系
    user = relationship("User", back_populates="subscriptions")

    # 索引
    __table_args__ = (
        Index('idx_subscription_user_id', 'user_id'),
        Index('idx_subscription_status', 'status'),
        Index('idx_subscription_expires_at', 'expires_at'),
    )

    def __repr__(self):
        return f"<Subscription(id={self.id}, user_id={self.user_id}, plan={self.plan_type})>"


# ==========================================
# 配额使用记录表
# ==========================================

class QuotaUsage(Base):
    """
    配额使用记录表 - 跟踪用户配额使用情况
    """
    __tablename__ = "quota_usage"

    # 主键
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 关联用户
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="用户ID"
    )

    # 配额类型
    quota_type = Column(
        SQLEnum(QuotaType),
        nullable=False,
        comment="配额类型"
    )

    # 使用信息
    used_count = Column(Integer, default=1, comment="使用次数")
    usage_date = Column(Date, nullable=False, comment="使用日期")

    # 元数据 (使用 extra_data 而不是 metadata，因为 metadata 是保留字)
    extra_data = Column(JSON, nullable=True, comment="额外信息(如工具名称、文案风格等)")

    # 时间戳
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)

    # 关系
    user = relationship("User", back_populates="quota_usages")

    # 索引
    __table_args__ = (
        Index('idx_quota_user_date', 'user_id', 'usage_date'),
        Index('idx_quota_user_type_date', 'user_id', 'quota_type', 'usage_date'),
    )

    def __repr__(self):
        return f"<QuotaUsage(id={self.id}, user_id={self.user_id}, type={self.quota_type})>"


# ==========================================
# 手机号变更记录表
# ==========================================

class PhoneChangeLog(Base):
    """
    手机号变更记录表 - 记录手机号更换历史
    """
    __tablename__ = "phone_change_logs"

    # 主键
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 关联用户
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="用户ID"
    )

    # 手机号信息
    old_phone = Column(String(20), nullable=False, comment="旧手机号")
    new_phone = Column(String(20), nullable=False, comment="新手机号")

    # 验证信息
    old_phone_verified = Column(Boolean, default=False, comment="旧手机号验证状态")
    new_phone_verified = Column(Boolean, default=False, comment="新手机号验证状态")

    # 操作信息
    ip_address = Column(String(45), nullable=True, comment="操作IP")
    user_agent = Column(Text, nullable=True, comment="用户代理")

    # 时间戳
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)

    # 关系
    user = relationship("User", back_populates="phone_change_logs")

    # 索引
    __table_args__ = (
        Index('idx_phone_change_user_id', 'user_id'),
        Index('idx_phone_change_old_phone', 'old_phone'),
        Index('idx_phone_change_new_phone', 'new_phone'),
    )

    def __repr__(self):
        return f"<PhoneChangeLog(id={self.id}, user_id={self.user_id}, old={self.old_phone}, new={self.new_phone})>"
