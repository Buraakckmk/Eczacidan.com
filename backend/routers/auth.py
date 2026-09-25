"""Authentication endpointleri (login + register + me)."""

from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.core.config import JWT_ACCESS_TOKEN_EXPIRE_MINUTES
from backend.core.deps import get_current_user
from backend.core.gln import is_valid_gln, is_valid_tc
from backend.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from backend.database import get_db
from backend.models import User
from backend.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    Token,
    UserResponse,
    UserUpdate,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _make_token(user: User) -> Token:
    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=user.id,
        expires_delta=access_token_expires,
        extra={"username": user.username, "gln": user.gln},
    )
    return Token(access_token=token)


@router.post("/register", response_model=RegisterResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> RegisterResponse:
    if not is_valid_gln(payload.gln):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz GLN numarası. Lütfen doğru formatta 13 haneli bir GLN girin.",
        )
    if not is_valid_tc(payload.tc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçersiz T.C. Kimlik Numarası.",
        )
    if not payload.consent or not payload.privacy:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Açık rıza ve aydınlatma metni onayları zorunludur.",
        )

    hashed = get_password_hash(payload.password)
    user = User(
        username=payload.username.strip(),
        email=payload.email.strip().lower() if payload.email else None,
        hashed_password=hashed,
        gln=payload.gln.strip(),
        tc=payload.tc.strip(),
        pharmacy_name=payload.pharmacy_name,
        pharmacy_city=payload.pharmacy_city,
        consent=payload.consent,
        privacy=payload.privacy,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError as exc:
        db.rollback()
        detail = "Kayıt başarısız: Bu bilgilerle daha önce kayıt oluşturulmuş."
        msg = str(exc).lower()
        if "username" in msg:
            detail = "Bu kullanıcı adı zaten alınmış."
        elif "gln" in msg:
            detail = "Bu GLN numarası ile zaten kayıt var."
        elif "tc" in msg:
            detail = "Bu T.C. Kimlik No ile zaten kayıt var."
        elif "email" in msg:
            detail = "Bu e-posta adresi zaten kullanılıyor."
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)

    return RegisterResponse(success=True, message="Kayıt başarılı!", user_id=user.id)


@router.post("/login", response_model=Token)
def login_json(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = (
        db.query(User)
        .filter(
            (User.username == payload.username.strip())
            | (User.gln == payload.username.strip())
        )
        .first()
    )
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı/GLN veya şifre hatalı.",
        )
    return _make_token(user)


@router.post("/login/oauth", response_model=Token)
def login_oauth(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """Swagger UI /docs içinde OAuth2 Authorization akışı için form-based login."""
    user = (
        db.query(User)
        .filter(
            (User.username == form_data.username.strip())
            | (User.gln == form_data.username.strip())
        )
        .first()
    )
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı/GLN veya şifre hatalı.",
        )
    return _make_token(user)


@router.get("/me", response_model=UserResponse)
def read_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    data = payload.model_dump(exclude_unset=True)
    if "password" in data and data["password"]:
        data["hashed_password"] = get_password_hash(data.pop("password"))
    if "email" in data and data["email"]:
        data["email"] = data["email"].lower().strip()

    for field, value in data.items():
        setattr(current_user, field, value)

    try:
        db.commit()
        db.refresh(current_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu e-posta veya bilgi zaten kullanılıyor.",
        )
    return current_user
