"""FastAPI ana uygulama giriş noktası.

Tüm routerları dahil eder, CORS ayarlarını yapar ve uygulamayı başlatırken
gerekli tabloları + demo veriyi (seed) ekler.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import ALLOWED_ORIGINS, PROJECT_NAME
from backend.database import init_db, SessionLocal
from backend.routers import (
    auth as auth_router_mod,
    catalog as catalog_router_mod,
    health as health_router_mod,
    listings as listings_router_mod,
    market as market_router_mod,
    register as register_router_mod,
)

app = FastAPI(
    title=PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    description="Eczaneler arası B2B e-ticaret ve pazaryeri platformu.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routerları dahil et
app.include_router(health_router_mod.router)
app.include_router(register_router_mod.router)          # Geriye dönük /register
app.include_router(auth_router_mod.router, prefix="/api")
app.include_router(catalog_router_mod.router, prefix="/api")
app.include_router(listings_router_mod.router, prefix="/api")
app.include_router(market_router_mod.router, prefix="/api")


@app.on_event("startup")
def on_startup() -> None:
    """Sunucu başlarken tabloları oluştur ve demo veriyi ekle."""
    init_db()
    from backend.seed import seed_demo

    db = SessionLocal()
    try:
        seed_demo(db)
    finally:
        db.close()


@app.get("/")
async def root() -> dict[str, str]:
    """Temel servis kontrol endpoint'i."""
    return {
        "message": f"{PROJECT_NAME} API çalışıyor.",
        "docs": "/docs",
        "redoc": "/redoc",
    }
