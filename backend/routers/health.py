"""Sağlık kontrolü router'ı.

Bu router, servis ve altyapı durumu için kullanılabilecek örnek bir endpoint
sunar. Swagger dokümantasyonunun çalıştığını doğrulamak için idealdir.
"""

from fastapi import APIRouter

from backend.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
async def get_health() -> HealthResponse:
    """Servisin durumunu döndüren örnek endpoint."""
    return HealthResponse(status="ok", service="backend", version="0.1.0")
