"""SQLAlchemy veritabanı bağlantı katmanı."""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.core.config import DATABASE_URL, IS_SQLITE

connect_args = {}
if IS_SQLITE:
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Her istek için yeni bir veritabanı oturumu üretir."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Tabloları oluşturur (ilk çalıştırmada kullanılır)."""
    import backend.models  # noqa: F401  — modelleri Base'e kaydetmek için import et

    Base.metadata.create_all(bind=engine)
