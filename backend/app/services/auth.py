"""
鐢ㄦ埛璁よ瘉鏈嶅姟灞?
澶勭悊鐢ㄦ埛娉ㄥ唽銆佺櫥褰曘€佸瘑鐮佺鐞嗙瓑涓氬姟閫昏緫
"""
from datetime import datetime, timedelta
from typing import Optional, Union
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.user import User, MembershipLevel, UserStatus
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
    PasswordChangeRequest,
)
from app.core.security import PasswordHandler, JWTHandler, PhoneMasker


class AuthService:
    """鐢ㄦ埛璁よ瘉鏈嶅姟"""

    def __init__(self, db: Session):
        """
        鍒濆鍖栬璇佹湇鍔?

        Args:
            db: 鏁版嵁搴撲細璇?
        """
        self.db = db

    def _generate_nickname(self, request: UserRegisterRequest) -> str:
        """生成随机昵称（未填昵称时使用）"""
        import random, string
        tail = (getattr(request, "phone", "") or "")[-4:]
        suffix = "".join(random.choices(string.ascii_uppercase, k=3))
        return f"Scout{tail}{suffix}"

    def register(self, request: UserRegisterRequest) -> TokenResponse:
        """
        鐢ㄦ埛娉ㄥ唽

        Args:
            request: 娉ㄥ唽璇锋眰

        Returns:
            TokenResponse: 鍖呭惈 token 鍜岀敤鎴蜂俊鎭?

        Raises:
            HTTPException: 鐢ㄦ埛鍚嶆垨鎵嬫満鍙峰凡瀛樺湪
        """
        # 妫€鏌ョ敤鎴峰悕鏄惁宸插瓨鍦?
        existing_user = self.db.query(User).filter(
            User.username == request.username
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="鐢ㄦ埛鍚嶅凡瀛樺湪"
            )

        # 妫€鏌ユ墜鏈哄彿鏄惁宸插瓨鍦?
        existing_phone = self.db.query(User).filter(
            User.phone == request.phone
        ).first()

        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="鎵嬫満鍙峰凡琚敞鍐?
            )

        # 鍔犲瘑瀵嗙爜
        password_hash, password_salt = PasswordHandler.hash_password(request.password)

        # 鍒涘缓鏂扮敤鎴?
        new_user = User(
            username=request.username,
            phone=request.phone,
            phone_verified=True,  # 绠€鍖栨祦绋嬶紝娉ㄥ唽鍚庣洿鎺ユ爣璁颁负宸查獙璇?
            email=request.email,
            email_verified=False,
            password_hash=password_hash,
            password_salt=password_salt,
            nickname=(request.nickname or self._generate_nickname(request)),
            membership_level=MembershipLevel.FREE,
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        # 淇濆瓨鍒版暟鎹簱
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)

        # 鏇存柊鏈€鍚庣櫥褰曟椂闂?
        new_user.last_login_at = datetime.utcnow()
        self.db.commit()

        # 鐢熸垚 JWT Token
        token = self._create_token_for_user(new_user)

        return token

    def login(self, request: UserLoginRequest) -> TokenResponse:
        """
        鐢ㄦ埛鐧诲綍

        Args:
            request: 鐧诲綍璇锋眰

        Returns:
            TokenResponse: 鍖呭惈 token 鍜岀敤鎴蜂俊鎭?

        Raises:
            HTTPException: 鐢ㄦ埛涓嶅瓨鍦ㄦ垨瀵嗙爜閿欒
        """
        # 鏌ユ壘鐢ㄦ埛锛堟敮鎸佺敤鎴峰悕鎴栨墜鏈哄彿鐧诲綍锛?
        user = self.db.query(User).filter(
            or_(
                User.username == request.login,
                User.phone == request.login
            )
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="鐢ㄦ埛鍚嶆垨瀵嗙爜閿欒"
            )

        # 妫€鏌ョ敤鎴风姸鎬?
        if user.status != UserStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="璐﹀彿宸茶绂佺敤鎴栧垹闄?
            )

        # 楠岃瘉瀵嗙爜
        if not PasswordHandler.verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="鐢ㄦ埛鍚嶆垨瀵嗙爜閿欒"
            )

        # 鏇存柊鏈€鍚庣櫥褰曟椂闂?
        user.last_login_at = datetime.utcnow()
        self.db.commit()

        # 鐢熸垚 JWT Token
        token = self._create_token_for_user(user)

        return token

    def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """
        閫氳繃ID鑾峰彇鐢ㄦ埛

        Args:
            user_id: 鐢ㄦ埛ID

        Returns:
            Optional[User]: 鐢ㄦ埛瀵硅薄锛屼笉瀛樺湪杩斿洖 None
        """
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_username(self, username: str) -> Optional[User]:
        """
        閫氳繃鐢ㄦ埛鍚嶈幏鍙栫敤鎴?

        Args:
            username: 鐢ㄦ埛鍚?

        Returns:
            Optional[User]: 鐢ㄦ埛瀵硅薄锛屼笉瀛樺湪杩斿洖 None
        """
        return self.db.query(User).filter(User.username == username).first()

    def get_user_by_phone(self, phone: str) -> Optional[User]:
        """
        閫氳繃鎵嬫満鍙疯幏鍙栫敤鎴?

        Args:
            phone: 鎵嬫満鍙?

        Returns:
            Optional[User]: 鐢ㄦ埛瀵硅薄锛屼笉瀛樺湪杩斿洖 None
        """
        return self.db.query(User).filter(User.phone == phone).first()

    def change_password(self, user_id: UUID, request: PasswordChangeRequest) -> bool:
        """
        淇敼瀵嗙爜

        Args:
            user_id: 鐢ㄦ埛ID
            request: 瀵嗙爜淇敼璇锋眰

        Returns:
            bool: 鏄惁鎴愬姛

        Raises:
            HTTPException: 鐢ㄦ埛涓嶅瓨鍦ㄦ垨鏃у瘑鐮侀敊璇?
        """
        user = self.get_user_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="鐢ㄦ埛涓嶅瓨鍦?
            )

        # 楠岃瘉鏃у瘑鐮?
        if not PasswordHandler.verify_password(request.old_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="鏃у瘑鐮侀敊璇?
            )

        # 妫€鏌ユ柊瀵嗙爜鏄惁涓庢棫瀵嗙爜鐩稿悓
        if request.old_password == request.new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="鏂板瘑鐮佷笉鑳戒笌鏃у瘑鐮佺浉鍚?
            )

        # 鍔犲瘑鏂板瘑鐮?
        password_hash, password_salt = PasswordHandler.hash_password(request.new_password)

        # 鏇存柊瀵嗙爜
        user.password_hash = password_hash
        user.password_salt = password_salt
        user.updated_at = datetime.utcnow()

        self.db.commit()

        return True

    def _create_token_for_user(self, user: User) -> TokenResponse:
        """
        涓虹敤鎴峰垱寤?Token

        Args:
            user: 鐢ㄦ埛瀵硅薄

        Returns:
            TokenResponse: Token 鍝嶅簲
        """
        # Token 鏈夋晥鏈?7 澶?
        expires_delta = timedelta(days=7)

        # 鍒涘缓 token payload
        token_data = {
            "user_id": str(user.id),
            "username": user.username,
            "phone": user.phone,
            "membership_level": user.membership_level.value,
        }

        # 鐢熸垚 access token
        access_token = JWTHandler.create_access_token(
            data=token_data,
            expires_delta=expires_delta
        )

        # 鏋勯€犵敤鎴峰搷搴?
        user_response = self._build_user_response(user)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=int(expires_delta.total_seconds()),
            user=user_response
        )

    def _build_user_response(self, user: User, mask_phone: bool = True) -> UserResponse:
        """
        鏋勫缓鐢ㄦ埛鍝嶅簲瀵硅薄

        Args:
            user: 鐢ㄦ埛瀵硅薄
            mask_phone: 鏄惁鑴辨晱鎵嬫満鍙?

        Returns:
            UserResponse: 鐢ㄦ埛鍝嶅簲
        """
        phone = PhoneMasker.mask_phone(user.phone) if mask_phone else user.phone

        return UserResponse(
            id=user.id,
            username=user.username,
            phone=phone,
            phone_verified=user.phone_verified,
            email=user.email,
            email_verified=user.email_verified,
            nickname=user.nickname,
            avatar_url=user.avatar_url,
            bio=user.bio,
            membership_level=user.membership_level,
            membership_expire_at=user.membership_expire_at,
            total_analysis_count=user.total_analysis_count,
            total_script_count=user.total_script_count,
            status=user.status,
            created_at=user.created_at,
            last_login_at=user.last_login_at
        )

    def verify_token(self, token: str) -> Optional[User]:
        """
        楠岃瘉 token 骞惰繑鍥炵敤鎴?

        Args:
            token: JWT token

        Returns:
            Optional[User]: 鐢ㄦ埛瀵硅薄锛宼oken 鏃犳晥杩斿洖 None
        """
        payload = JWTHandler.verify_token(token, token_type="access")

        if not payload:
            return None

        user_id = payload.get("user_id")
        if not user_id:
            return None

        # 鑾峰彇鐢ㄦ埛
        user = self.get_user_by_id(UUID(user_id))

        # 妫€鏌ョ敤鎴风姸鎬?
        if user and user.status != UserStatus.ACTIVE:
            return None

        return user

