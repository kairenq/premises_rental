from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from ..db.database import get_db
from ..models.models import User
from ..core.security import decode_access_token

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user."""
    try:
        token = credentials.credentials
        print(f"🔑 Received token: {token[:20]}...")

        payload = decode_access_token(token)
        print(f"📦 Decoded payload: {payload}")

        if payload is None:
            print("❌ Payload is None - invalid token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = payload.get("sub")
        print(f"👤 User ID from token: {user_id} (type: {type(user_id)})")

        if user_id is None:
            print("❌ User ID is None in payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )

        # Convert to int if it's a string
        try:
            user_id = int(user_id)
            print(f"✅ Converted user_id to int: {user_id}")
        except (ValueError, TypeError) as e:
            print(f"❌ Failed to convert user_id to int: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token",
            )

        user = db.query(User).filter(User.user_id == user_id).first()
        if user is None:
            print(f"❌ User not found in database with ID: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        print(f"✅ User found: {user.email}")
        return user

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error in get_current_user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
        )


def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user and verify admin role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user


def get_current_landlord_or_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user and verify landlord or admin role."""
    if current_user.role not in ["admin", "landlord"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Landlord or admin role required.",
        )
    return current_user


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None."""
    if credentials is None:
        return None

    try:
        return get_current_user(credentials, db)
    except HTTPException:
        return None
