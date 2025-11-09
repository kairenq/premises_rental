from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Convert datetime to timestamp for JWT
    to_encode.update({"exp": int(expire.timestamp())})
    print(f"🔐 Creating token with SECRET_KEY: {settings.SECRET_KEY[:10]}... (algorithm: {settings.ALGORITHM})")
    print(f"📝 Token data: {to_encode}")
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    print(f"✅ Token created: {encoded_jwt[:30]}...")
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode a JWT access token."""
    try:
        print(f"🔓 Decoding token with SECRET_KEY: {settings.SECRET_KEY[:10]}... (algorithm: {settings.ALGORITHM})")
        print(f"📝 Token to decode: {token[:30]}...")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        print(f"✅ Decoded successfully: {payload}")
        return payload
    except JWTError as e:
        print(f"❌ JWT Decode Error: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected decode error: {e}")
        return None
