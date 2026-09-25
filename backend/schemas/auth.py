"""Auth ve User şemaları."""

from __future__ import annotations

from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: int | None = None


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)


class RegisterRequest(BaseModel):
    gln: str = Field(..., min_length=13, max_length=13)
    tc: str = Field(..., min_length=11, max_length=11)
    username: str = Field(..., min_length=3, max_length=64)
    password: str = Field(..., min_length=6, max_length=128)
    email: str | None = None
    pharmacy_name: str | None = None
    pharmacy_city: str | None = None
    consent: bool = False
    privacy: bool = False


class RegisterResponse(BaseModel):
    success: bool
    message: str
    user_id: int | None = None


class UserResponse(BaseModel):
    id: int
    username: str
    gln: str
    email: str | None = None
    pharmacy_name: str | None = None
    pharmacy_city: str | None = None
    pharmacy_address: str | None = None
    phone: str | None = None
    is_verified: bool
    is_premium: bool
    balance: float
    rating: float
    listing_count: int

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    pharmacy_name: str | None = None
    pharmacy_city: str | None = None
    pharmacy_address: str | None = None
    phone: str | None = None
    email: str | None = None
    password: str | None = None
