"""
安全工具类
包含密码加密、JWT Token 生成和验证等功能
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets
import bcrypt
import jwt
from app.core.config import settings


class PasswordHandler:
    """密码处理类"""

    @staticmethod
    def hash_password(password: str) -> tuple[str, str]:
        """
        哈希密码

        Args:
            password: 明文密码

        Returns:
            tuple[str, str]: (password_hash, password_salt)
        """
        # 生成盐值
        salt = bcrypt.gensalt().decode('utf-8')

        # 生成密码哈希
        password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            salt.encode('utf-8')
        ).decode('utf-8')

        return password_hash, salt

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """
        验证密码

        Args:
            password: 明文密码
            password_hash: 密码哈希

        Returns:
            bool: 密码是否正确
        """
        try:
            return bcrypt.checkpw(
                password.encode('utf-8'),
                password_hash.encode('utf-8')
            )
        except Exception:
            return False


class JWTHandler:
    """JWT Token 处理类"""

    @staticmethod
    def create_access_token(
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        创建访问令牌

        Args:
            data: 要编码到 token 中的数据
            expires_delta: 过期时间增量

        Returns:
            str: JWT token
        """
        to_encode = data.copy()

        # 设置过期时间
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=7)  # 默认7天

        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })

        # 生成 JWT
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )

        return encoded_jwt

    @staticmethod
    def create_refresh_token(
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        创建刷新令牌

        Args:
            data: 要编码到 token 中的数据
            expires_delta: 过期时间增量

        Returns:
            str: JWT refresh token
        """
        to_encode = data.copy()

        # 设置过期时间（刷新令牌通常有效期更长）
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=30)  # 默认30天

        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })

        # 生成 JWT
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )

        return encoded_jwt

    @staticmethod
    def decode_token(token: str) -> Optional[Dict[str, Any]]:
        """
        解码令牌

        Args:
            token: JWT token

        Returns:
            Optional[Dict[str, Any]]: 解码后的数据，失败返回 None
        """
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            return payload
        except jwt.ExpiredSignatureError:
            # Token 已过期
            return None
        except jwt.InvalidTokenError:
            # Token 无效
            return None

    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
        """
        验证令牌

        Args:
            token: JWT token
            token_type: token 类型（access 或 refresh）

        Returns:
            Optional[Dict[str, Any]]: 验证成功返回 payload，失败返回 None
        """
        payload = JWTHandler.decode_token(token)

        if payload is None:
            return None

        # 检查 token 类型
        if payload.get("type") != token_type:
            return None

        return payload


class VerificationCodeHandler:
    """验证码处理类"""

    @staticmethod
    def generate_code(length: int = 6) -> str:
        """
        生成验证码

        Args:
            length: 验证码长度，默认6位

        Returns:
            str: 验证码
        """
        # 生成随机数字验证码
        code = ''.join([str(secrets.randbelow(10)) for _ in range(length)])
        return code

    @staticmethod
    def generate_state(length: int = 32) -> str:
        """
        生成随机 state 字符串（用于 OAuth CSRF 防护）

        Args:
            length: state 长度

        Returns:
            str: 随机 state
        """
        return secrets.token_urlsafe(length)


class PhoneMasker:
    """手机号脱敏工具"""

    @staticmethod
    def mask_phone(phone: str) -> str:
        """
        手机号脱敏

        Args:
            phone: 原始手机号

        Returns:
            str: 脱敏后的手机号（如：138****8000）
        """
        if len(phone) != 11:
            return phone

        return f"{phone[:3]}****{phone[7:]}"

    @staticmethod
    def mask_email(email: str) -> str:
        """
        邮箱脱敏

        Args:
            email: 原始邮箱

        Returns:
            str: 脱敏后的邮箱（如：zh****@example.com）
        """
        if '@' not in email:
            return email

        local, domain = email.split('@', 1)

        if len(local) <= 2:
            masked_local = local[0] + '*'
        else:
            masked_local = local[:2] + '****'

        return f"{masked_local}@{domain}"


# ==========================================
# 导出
# ==========================================

__all__ = [
    'PasswordHandler',
    'JWTHandler',
    'VerificationCodeHandler',
    'PhoneMasker',
]
