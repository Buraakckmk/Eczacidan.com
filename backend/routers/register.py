"""Geriye dönük uyumlu kayıt endpoint'i.

Yeni projede /auth/register kullanılır. Bu endpoint eski istemciler için
çalışmaya devam eder.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.routers.auth import register as auth_register
from backend.schemas.auth import RegisterRequest as AuthRegisterRequest
from backend.schemas.register import RegisterRequest, RegisterResponse

router = APIRouter(prefix="/register", tags=["register"])


@router.post("", response_model=RegisterResponse)
def register_user(
    payload: RegisterRequest, db: Session = Depends(get_db)
) -> RegisterResponse:
    gln_value = payload.gln or payload.gnl or ""
    adapted = AuthRegisterRequest(
        gln=gln_value,
        tc=payload.tc,
        username=payload.username,
        password=payload.password,
        consent=payload.consent,
        privacy=payload.privacy,
    )
    result = auth_register(adapted, db)
    return RegisterResponse(
        success=result.success,
        message=result.message,
        user_id=result.user_id,
    )
