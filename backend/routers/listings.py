"""Listing (ilan) routerı."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.core.deps import get_current_user, get_current_user_optional
from backend.database import get_db
from backend.models import Category, Listing, Product, User
from backend.schemas.market import (
    ListingCreate,
    ListingResponse,
    ListingUpdate,
)

router = APIRouter(tags=["listings"])


def _serialize_listing(l: Listing) -> dict:
    seller: User | None = l.seller
    product: Product | None = l.product
    category_name = product.category.name if (product and product.category) else None
    return {
        "id": l.id,
        "product_id": l.product_id,
        "seller_id": l.seller_id,
        "seller_name": seller.pharmacy_name or seller.username if seller else None,
        "seller_city": seller.pharmacy_city if seller else None,
        "seller_rating": seller.rating if seller else None,
        "seller_listing_count": seller.listing_count if seller else None,
        "is_verified_seller": seller.is_verified if seller else False,
        "is_premium_seller": seller.is_premium if seller else False,
        "product_name": product.name if product else None,
        "product_barcode": product.barcode if product else None,
        "product_psf": product.psf if product else None,
        "category_name": category_name or l.product.category if hasattr(l, "product") else None,
        "status": l.status,
        "delivery_type": l.delivery_type,
        "is_new_listing": l.is_new_listing,
        "is_discounted": l.is_discounted,
        "is_sponsored": l.is_sponsored,
        "sponsored_days": l.sponsored_days or 0,
        "unit_price": l.unit_price,
        "stock": l.stock,
        "mf_ratio": l.mf_ratio,
        "skt": l.skt,
        "discount_percentage": l.discount_percentage,
        "min_order_qty": l.min_order_qty,
        "created_at": l.created_at.isoformat() if l.created_at else None,
    }


@router.get("/listings", response_model=list[ListingResponse])
def list_listings(
    product_id: int | None = Query(None),
    category: str | None = Query(None),
    seller_id: int | None = Query(None),
    q: str | None = Query(None),
    only_approved: bool = Query(True),
    delivery_type: str | None = Query(None),
    sort: str = Query(
        "price_asc",
        pattern="^(price_asc|price_desc|skt_desc|discount_desc|sponsored_first)$",
    ),
    db: Session = Depends(get_db),
    _current_user: User | None = Depends(get_current_user_optional),
) -> list[dict]:
    query = db.query(Listing)

    if product_id:
        query = query.filter(Listing.product_id == product_id)
    if seller_id:
        query = query.filter(Listing.seller_id == seller_id)
    if only_approved:
        query = query.filter(Listing.status == "approved")
    if delivery_type:
        query = query.filter(Listing.delivery_type == delivery_type)
    if category:
        query = query.join(Product).join(Category).filter(Category.name == category)
    if q:
        like = f"%{q.lower()}%"
        query = query.join(Product).filter(
            (Product.name.ilike(like)) | (Product.barcode.ilike(like))
        )

    items = query.all()

    # Sıralama (Python tarafında, sponsored öncelikli)
    def _key_price_asc(l: Listing):
        return (0 if l.is_sponsored else 1, l.unit_price)

    def _key_price_desc(l: Listing):
        return (0 if l.is_sponsored else 1, -l.unit_price)

    def _key_discount_desc(l: Listing):
        return (0 if l.is_sponsored else 1, -(l.discount_percentage or 0))

    def _key_skt_desc(l: Listing):
        return (0 if l.is_sponsored else 1, -(l.skt or ""))

    key_fn = {
        "price_asc": _key_price_asc,
        "price_desc": _key_price_desc,
        "discount_desc": _key_discount_desc,
        "skt_desc": _key_skt_desc,
        "sponsored_first": lambda l: (0 if l.is_sponsored else 1, l.id),
    }[sort]

    items.sort(key=key_fn)
    return [_serialize_listing(l) for l in items]


@router.get("/listings/{listing_id}", response_model=ListingResponse)
def get_listing(listing_id: int, db: Session = Depends(get_db)) -> dict:
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "İlan bulunamadı.")
    return _serialize_listing(listing)


@router.post("/listings", response_model=ListingResponse)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Ürün bulunamadı.")

    listing = Listing(**payload.model_dump(exclude_unset=True), seller_id=current_user.id)
    db.add(listing)
    current_user.listing_count = (current_user.listing_count or 0) + 1
    db.commit()
    db.refresh(listing)
    return _serialize_listing(listing)


@router.put("/listings/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "İlan bulunamadı.")
    if listing.seller_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Bu ilan size ait değil.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(listing, field, value)
    db.commit()
    db.refresh(listing)
    return _serialize_listing(listing)


@router.delete("/listings/{listing_id}")
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "İlan bulunamadı.")
    if listing.seller_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Bu ilan size ait değil.")
    db.delete(listing)
    if current_user.listing_count:
        current_user.listing_count -= 1
    db.commit()
    return {"success": True, "message": "İlan silindi."}


@router.get("/me/listings", response_model=list[ListingResponse])
def my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    items = (
        db.query(Listing)
        .filter(Listing.seller_id == current_user.id)
        .order_by(Listing.id.desc())
        .all()
    )
    return [_serialize_listing(l) for l in items]
