"""
用户认证相关的 Pydantic Schemas
用于请求验证和响应序列化
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr, field_validator
import re

from app.models.user import MembershipLevel, UserStatus


# ==========================================
# 用户注册
# ==========================================

class UserRegisterRequest(BaseModel):
    """用户注册请求"""
    username: str = Field(
        ...,
        min_length=3,
        max_length=20,
        description="用户名，3-20个字符，只能包含字母、数字、下划线"
    )
    phone: str = Field(
        ...,
        min_length=11,
        max_length=11,
        description="手机号，11位数字"
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=32,
        description="密码，8-32个字符，必须包含大小写字母和数字"
    )
    email: Optional[EmailStr] = Field(
        None,
        description="邮箱（可选）"
    )
    nickname: Optional[str] = Field(
        None,
        max_length=50,
        description="昵称（可选）"
    )

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        """验证用户名格式"""
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('用户名只能包含字母、数字和下划线')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """验证手机号格式"""
        if not re.match(r'^1[3-9]\d{9}$', v):
            raise ValueError('手机号格式不正确')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """验证密码强度"""
        if not re.search(r'[a-z]', v):
            raise ValueError('密码必须包含小写字母')
        if not re.search(r'[A-Z]', v):
            raise ValueError('密码必须包含大写字母')
        if not re.search(r'\d', v):
            raise ValueError('密码必须包含数字')
        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "username": "zhangsan123",
                    "phone": "13800138000",
                    "password": "Pass123456",
                    "email": "zhangsan@example.com",
                    "nickname": "张三"
                }
            ]
        }
    }


# ==========================================
# 用户登录
# ==========================================

class UserLoginRequest(BaseModel):
    """用户登录请求"""
    login: str = Field(
        ...,
        description="登录凭证，可以是用户名或手机号"
    )
    password: str = Field(
        ...,
        description="密码"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "login": "zhangsan123",
                    "password": "Pass123456"
                },
                {
                    "login": "13800138000",
                    "password": "Pass123456"
                }
            ]
        }
    }


# ==========================================
# 用户信息
# ==========================================

class UserResponse(BaseModel):
    """用户信息响应"""
    id: UUID = Field(..., description="用户ID")
    username: str = Field(..., description="用户名")
    phone: str = Field(..., description="手机号（脱敏）")
    phone_verified: bool = Field(..., description="手机号是否已验证")
    email: Optional[str] = Field(None, description="邮箱")
    email_verified: bool = Field(default=False, description="邮箱是否已验证")
    nickname: Optional[str] = Field(None, description="昵称")
    avatar_url: Optional[str] = Field(None, description="头像URL")
    bio: Optional[str] = Field(None, description="个人简介")
    membership_level: MembershipLevel = Field(..., description="会员等级")
    membership_expire_at: Optional[datetime] = Field(None, description="会员到期时间")
    total_analysis_count: int = Field(default=0, description="累计分析次数")
    total_script_count: int = Field(default=0, description="累计生成文案数")
    status: UserStatus = Field(..., description="用户状态")
    created_at: datetime = Field(..., description="创建时间")
    last_login_at: Optional[datetime] = Field(None, description="最后登录时间")

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "username": "zhangsan123",
                    "phone": "138****8000",
                    "phone_verified": True,
                    "email": "zhangsan@example.com",
                    "email_verified": False,
                    "nickname": "张三",
                    "avatar_url": "https://example.com/avatar.jpg",
                    "bio": "这是我的个人简介",
                    "membership_level": "pro",
                    "membership_expire_at": "2025-12-31T23:59:59",
                    "total_analysis_count": 1234,
                    "total_script_count": 5678,
                    "status": "active",
                    "created_at": "2024-01-01T00:00:00",
                    "last_login_at": "2024-11-07T10:30:00"
                }
            ]
        }
    }


class UserDetailResponse(UserResponse):
    """用户详细信息响应（包含完整手机号，仅用户本人可见）"""
    phone_full: str = Field(..., description="完整手机号")

    model_config = {
        "from_attributes": True
    }


# ==========================================
# Token 响应
# ==========================================

class TokenResponse(BaseModel):
    """Token 响应"""
    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
    expires_in: int = Field(..., description="过期时间（秒）")
    user: UserResponse = Field(..., description="用户信息")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "token_type": "bearer",
                    "expires_in": 604800,
                    "user": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "username": "zhangsan123",
                        "phone": "138****8000",
                        "email": "zhangsan@example.com",
                        "nickname": "张三",
                        "membership_level": "free"
                    }
                }
            ]
        }
    }


# ==========================================
# 密码修改
# ==========================================

class PasswordChangeRequest(BaseModel):
    """密码修改请求"""
    old_password: str = Field(..., description="旧密码")
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=32,
        description="新密码"
    )

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """验证密码强度"""
        if not re.search(r'[a-z]', v):
            raise ValueError('密码必须包含小写字母')
        if not re.search(r'[A-Z]', v):
            raise ValueError('密码必须包含大写字母')
        if not re.search(r'\d', v):
            raise ValueError('密码必须包含数字')
        return v


class PasswordResetRequest(BaseModel):
    """密码重置请求"""
    phone: str = Field(..., description="手机号")
    verification_code: str = Field(..., description="验证码")
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=32,
        description="新密码"
    )

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """验证密码强度"""
        if not re.search(r'[a-z]', v):
            raise ValueError('密码必须包含小写字母')
        if not re.search(r'[A-Z]', v):
            raise ValueError('密码必须包含大写字母')
        if not re.search(r'\d', v):
            raise ValueError('密码必须包含数字')
        return v


# ==========================================
# 手机号绑定/更换
# ==========================================

class PhoneBindRequest(BaseModel):
    """手机号绑定请求（OAuth用户首次绑定）"""
    phone: str = Field(..., description="手机号")
    verification_code: str = Field(..., description="验证码")


class PhoneChangeRequest(BaseModel):
    """手机号更换请求"""
    old_phone_code: str = Field(..., description="旧手机号验证码")
    new_phone: str = Field(..., description="新手机号")
    new_phone_code: str = Field(..., description="新手机号验证码")


# ==========================================
# 验证码相关
# ==========================================

class SendVerificationCodeRequest(BaseModel):
    """发送验证码请求"""
    phone: str = Field(..., description="手机号")
    purpose: str = Field(
        ...,
        description="用途：register(注册), login(登录), reset_password(重置密码), bind_phone(绑定手机), change_phone(更换手机)"
    )

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """验证手机号格式"""
        if not re.match(r'^1[3-9]\d{9}$', v):
            raise ValueError('手机号格式不正确')
        return v

    @field_validator('purpose')
    @classmethod
    def validate_purpose(cls, v: str) -> str:
        """验证用途"""
        allowed = ['register', 'login', 'reset_password', 'bind_phone', 'change_phone']
        if v not in allowed:
            raise ValueError(f'用途必须是以下之一: {", ".join(allowed)}')
        return v


# ==========================================
# OAuth 相关
# ==========================================

class OAuthCallbackRequest(BaseModel):
    """OAuth 回调请求"""
    code: str = Field(..., description="授权码")
    state: Optional[str] = Field(None, description="状态参数（CSRF防护）")


class OAuthBindPhoneRequest(BaseModel):
    """OAuth 绑定手机号请求"""
    oauth_temp_token: str = Field(..., description="临时OAuth令牌")
    phone: str = Field(..., description="手机号")
    verification_code: str = Field(..., description="验证码")


# ==========================================
# 通用响应
# ==========================================

class MessageResponse(BaseModel):
    """通用消息响应"""
    message: str = Field(..., description="消息内容")
    code: int = Field(default=0, description="业务状态码")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "message": "操作成功",
                    "code": 0
                }
            ]
        }
    }
