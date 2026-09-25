"""Geriye dönük uyumlu Register şemaları.

Yeni projede backend.schemas.auth altındaki RegisterRequest kullanılmalıdır.
Bu modül sadece eski /register endpoint'inin çalışması için tutulur.
"""

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    gln: str = Field(..., min_length=13, max_length=13)
    gnl: str | None = Field(None, min_length=13, max_length=13)  # backward compat alias
    tc: str = Field(..., min_length=11, max_length=11)
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    consent: bool = False
    privacy: bool = False


class RegisterResponse(BaseModel):
    success: bool
    message: str
    user_id: int | None = None
