"""Category & Product routerları."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.core.deps import get_current_user_optional
from backend.database import get_db
from backend.models import Category, Product, User
from backend.schemas.product import (
    CategoryCreate,
    CategoryResponse,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)

router = APIRouter(tags=["catalog"])


# ── Categories ───────────────────────────────────────────────────────────────

@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)) -> list[Category]:
    return db.query(Category).order_by(Category.name.asc()).all()


@router.post("/categories", response_model=CategoryResponse)
def create_category(
    payload: CategoryCreate, db: Session = Depends(get_db)
) -> Category:
    existing = db.query(Category).filter(Category.name == payload.name).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Bu kategori zaten var.")
    slug = payload.slug or payload.name.lower().replace(" ", "-")
    category = Category(
        name=payload.name, slug=slug, description=payload.description
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


# ── Products ─────────────────────────────────────────────────────────────────

def _serialize_product(p: Product) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "barcode": p.barcode,
        "psf": p.psf or 0.0,
        "manufacturer": p.manufacturer,
        "description": p.description,
        "image_url": p.image_url,
        "category_id": p.category_id,
        "category_name": p.category.name if p.category else None,
    }


@router.get("/products", response_model=list[ProductResponse])
def list_products(
    category: str | None = Query(None),
    q: str | None = Query(None, description="Ürün adı / barkod / üretici ara"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _current_user: User | None = Depends(get_current_user_optional),
) -> list[dict]:
    query = db.query(Product)
    if category:
        query = query.join(Category).filter(Category.name == category)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(
            (Product.name.ilike(like))
            | (Product.barcode.ilike(like))
            | (Product.manufacturer.ilike(like))
        )
    items = query.order_by(Product.id.asc()).offset(offset).limit(limit).all()
    return [_serialize_product(p) for p in items]


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)) -> dict:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ürün bulunamadı.")
    return _serialize_product(product)


@router.post("/products", response_model=ProductResponse)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> dict:
    if payload.barcode:
        dup = db.query(Product).filter(Product.barcode == payload.barcode).first()
        if dup:
            raise HTTPException(status.HTTP_409_CONFLICT, "Bu barkod zaten kayıtlı.")
    product = Product(**payload.model_dump(exclude_unset=True))
    db.add(product)
    db.commit()
    db.refresh(product)
    return _serialize_product(product)


@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)
) -> dict:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ürün bulunamadı.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return _serialize_product(product)
