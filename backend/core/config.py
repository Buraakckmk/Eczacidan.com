"""Uygulama genel ayarları.

.env dosyasından veya ortam değişkenlerinden yapılandırma okur.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = Path(__file__).resolve().parent / ".env"
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)
else:
    env_root = BASE_DIR / ".env"
    if env_root.exists():
        load_dotenv(env_root)


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


PROJECT_NAME = os.getenv("PROJECT_NAME", "Eczacıdan.com B2B Platform")
API_V1_PREFIX = os.getenv("API_V1_PREFIX", "/api/v1")
ALLOWED_ORIGINS = _split_csv(
    os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:19006,http://localhost:3000")
)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./eczacidan.db")
# SQLite bağlantısı için özel argümanlar gerekiyorsa kullanılır
IS_SQLITE = DATABASE_URL.startswith("sqlite")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-only-secret-change-me-please-123456")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
