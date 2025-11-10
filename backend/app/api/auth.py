"""
用户认证 API 路由
提供注册、登录、密码管理等接口
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user, get_current_user
from app.models.user import User
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    UserDetailResponse,
    PasswordChangeRequest,
    MessageResponse,
)
from app.services.auth import AuthService
from app.core.security import PhoneMasker


router = APIRouter(prefix="/auth", tags=["认证 Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="用户注册",
    description="用户注册接口，无需验证码，只要用户名和手机号不重复即可注册成功"
)
def register(
    request: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    用户注册

    - **username**: 用户名，3-20个字符，只能包含字母、数字、下划线
    - **phone**: 手机号，11位数字
    - **password**: 密码，8-32个字符，必须包含大小写字母和数字
    - **email**: 邮箱（可选）
    - **nickname**: 昵称（可选）

    返回：
    - **access_token**: JWT 访问令牌
    - **token_type**: 令牌类型（bearer）
    - **expires_in**: 过期时间（秒）
    - **user**: 用户信息
    """
    auth_service = AuthService(db)
    return auth_service.register(request)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="用户登录",
    description="用户登录接口，支持用户名或手机号登录"
)
def login(
    request: UserLoginRequest,
    db: Session = Depends(get_db)
):
    """
    用户登录

    - **login**: 登录凭证，可以是用户名或手机号
    - **password**: 密码

    返回：
    - **access_token**: JWT 访问令牌
    - **token_type**: 令牌类型（bearer）
    - **expires_in**: 过期时间（秒）
    - **user**: 用户信息
    """
    auth_service = AuthService(db)
    return auth_service.login(request)


@router.get(
    "/me",
    response_model=UserDetailResponse,
    summary="获取当前用户信息",
    description="获取当前登录用户的详细信息（包含完整手机号）"
)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    获取当前用户信息

    需要：
    - **Authorization**: Bearer Token

    返回：
    - 用户详细信息（包含完整手机号）
    """
    auth_service = AuthService(db)

    # 构建用户响应（不脱敏手机号）
    user_response = auth_service._build_user_response(current_user, mask_phone=False)

    # 转换为 UserDetailResponse
    return UserDetailResponse(
        **user_response.model_dump(),
        phone_full=current_user.phone
    )


@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="修改密码",
    description="修改当前用户的密码"
)
def change_password(
    request: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    修改密码

    需要：
    - **Authorization**: Bearer Token

    参数：
    - **old_password**: 旧密码
    - **new_password**: 新密码（8-32个字符，必须包含大小写字母和数字）

    返回：
    - 操作结果消息
    """
    auth_service = AuthService(db)
    auth_service.change_password(current_user.id, request)

    return MessageResponse(
        message="密码修改成功",
        code=0
    )


@router.get(
    "/check-username/{username}",
    response_model=MessageResponse,
    summary="检查用户名是否可用",
    description="检查用户名是否已被注册"
)
def check_username(
    username: str,
    db: Session = Depends(get_db)
):
    """
    检查用户名是否可用

    参数：
    - **username**: 要检查的用户名

    返回：
    - 用户名可用性信息
    """
    auth_service = AuthService(db)
    user = auth_service.get_user_by_username(username)

    if user:
        return MessageResponse(
            message="用户名已被使用",
            code=1
        )
    else:
        return MessageResponse(
            message="用户名可用",
            code=0
        )


@router.get(
    "/check-phone/{phone}",
    response_model=MessageResponse,
    summary="检查手机号是否可用",
    description="检查手机号是否已被注册"
)
def check_phone(
    phone: str,
    db: Session = Depends(get_db)
):
    """
    检查手机号是否可用

    参数：
    - **phone**: 要检查的手机号

    返回：
    - 手机号可用性信息
    """
    auth_service = AuthService(db)
    user = auth_service.get_user_by_phone(phone)

    if user:
        return MessageResponse(
            message="手机号已被注册",
            code=1
        )
    else:
        return MessageResponse(
            message="手机号可用",
            code=0
        )


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="用户登出",
    description="用户登出接口（客户端需要删除本地 Token）"
)
def logout(
    current_user: User = Depends(get_current_user)
):
    """
    用户登出

    需要：
    - **Authorization**: Bearer Token

    注意：由于使用的是 JWT，服务端无法主动让 Token 失效。
    客户端需要删除本地存储的 Token 来实现登出功能。

    返回：
    - 操作结果消息
    """
    return MessageResponse(
        message="登出成功，请删除本地 Token",
        code=0
    )


@router.get(
    "/verify",
    response_model=UserResponse,
    summary="验证 Token",
    description="验证 Token 是否有效，并返回用户信息"
)
def verify_token(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    验证 Token

    需要：
    - **Authorization**: Bearer Token

    返回：
    - 用户信息（Token 有效）
    """
    auth_service = AuthService(db)
    return auth_service._build_user_response(current_user, mask_phone=True)
