"""
认证依赖
提供 JWT 认证、权限检查等依赖注入
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, MembershipLevel
from app.services.auth import AuthService


# HTTP Bearer Token 认证
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    获取当前认证用户

    Args:
        credentials: HTTP Bearer Token
        db: 数据库会话

    Returns:
        User: 当前用户对象

    Raises:
        HTTPException: Token 无效或用户不存在
    """
    token = credentials.credentials

    # 验证 token
    auth_service = AuthService(db)
    user = auth_service.verify_token(token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    获取当前活跃用户（状态为 active）

    Args:
        current_user: 当前用户

    Returns:
        User: 当前活跃用户

    Raises:
        HTTPException: 用户状态不是 active
    """
    if current_user.status.value != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户账号已被禁用或删除"
        )

    return current_user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    获取可选的当前用户（用于某些既支持登录也支持匿名访问的接口）

    Args:
        credentials: HTTP Bearer Token（可选）
        db: 数据库会话

    Returns:
        Optional[User]: 当前用户对象，未登录返回 None
    """
    if not credentials:
        return None

    token = credentials.credentials

    # 验证 token
    auth_service = AuthService(db)
    user = auth_service.verify_token(token)

    return user


# ==========================================
# 会员等级检查依赖
# ==========================================

class RequireMembership:
    """会员等级检查依赖类"""

    def __init__(self, required_levels: list[MembershipLevel]):
        """
        初始化

        Args:
            required_levels: 需要的会员等级列表
        """
        self.required_levels = required_levels

    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        """
        检查用户会员等级

        Args:
            current_user: 当前用户

        Returns:
            User: 当前用户

        Raises:
            HTTPException: 会员等级不足
        """
        if current_user.membership_level not in self.required_levels:
            required_names = [level.value for level in self.required_levels]
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"该功能需要 {', '.join(required_names)} 会员"
            )

        return current_user


# 快捷方式：创建常用的会员等级检查依赖
require_basic = RequireMembership([
    MembershipLevel.BASIC,
    MembershipLevel.PRO,
    MembershipLevel.ENTERPRISE
])

require_pro = RequireMembership([
    MembershipLevel.PRO,
    MembershipLevel.ENTERPRISE
])

require_enterprise = RequireMembership([
    MembershipLevel.ENTERPRISE
])


# ==========================================
# 管理员权限检查
# ==========================================

def require_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    要求管理员权限

    Args:
        current_user: 当前用户

    Returns:
        User: 当前用户（管理员）

    Raises:
        HTTPException: 不是管理员
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )

    return current_user


# ==========================================
# 导出
# ==========================================

__all__ = [
    'get_current_user',
    'get_current_active_user',
    'get_optional_user',
    'RequireMembership',
    'require_basic',
    'require_pro',
    'require_enterprise',
    'require_admin',
]
