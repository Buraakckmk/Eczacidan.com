"""Kimlik doğrulama ve şifreleme yardımcıları (JWT + bcrypt password hash)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from backend.core.config import (
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        plain_bytes = plain_password.encode("utf-8")
        if isinstance(hashed_password, str):
            hashed_bytes = hashed_password.encode("utf-8")
        else:
            hashed_bytes = hashed_password
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def create_access_token(
    subject: str | Any,
    expires_delta: timedelta | None = None,
    extra: dict[str, Any] | None = None,
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode: dict[str, Any] = {"exp": expire, "sub": str(subject)}
    if extra:
        to_encode.update(extra)
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
