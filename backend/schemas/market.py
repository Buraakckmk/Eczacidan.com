"""Listing, Cart, Order, Notification, Transaction, Ad şemaları."""

from __future__ import annotations

from pydantic import BaseModel, Field


# ── Listing ──────────────────────────────────────────────────────────────────

class ListingBase(BaseModel):
    product_id: int
    status: str = "approved"
    delivery_type: str = "24h"
    is_new_listing: bool = True
    is_discounted: bool = False
    is_sponsored: bool = False
    sponsored_days: int = 0
    unit_price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    mf_ratio: str = "Yok"
    skt: str | None = None
    discount_percentage: float = 0.0
    min_order_qty: int = 1


class ListingCreate(ListingBase):
    pass


class ListingUpdate(BaseModel):
    status: str | None = None
    delivery_type: str | None = None
    is_new_listing: bool | None = None
    is_discounted: bool | None = None
    is_sponsored: bool | None = None
    sponsored_days: int | None = None
    unit_price: float | None = None
    stock: int | None = None
    mf_ratio: str | None = None
    skt: str | None = None
    discount_percentage: float | None = None
    min_order_qty: int | None = None


class ListingResponse(ListingBase):
    id: int
    seller_id: int
    seller_name: str | None = None
    seller_city: str | None = None
    seller_rating: float | None = None
    seller_listing_count: int | None = None
    is_verified_seller: bool = False
    is_premium_seller: bool = False
    product_name: str | None = None
    category_name: str | None = None
    product_barcode: str | None = None
    product_psf: float | None = None
    created_at: str | None = None

    class Config:
        from_attributes = True


# ── Cart ─────────────────────────────────────────────────────────────────────

class CartItemCreate(BaseModel):
    listing_id: int
    quantity: int = Field(..., ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    id: int
    listing_id: int
    quantity: int
    product_name: str | None = None
    seller_name: str | None = None
    unit_price: float | None = None
    min_order_qty: int | None = None
    skt: str | None = None
    delivery_type: str | None = None

    class Config:
        from_attributes = True


# ── Order ────────────────────────────────────────────────────────────────────

class OrderCreate(BaseModel):
    cart_items: list[CartItemCreate] | None = None
    listing_id: int | None = None
    quantity: int | None = None


class OrderResponse(BaseModel):
    id: int
    order_number: str
    product_name: str | None = None
    quantity: int
    unit_price: float
    total_price: float
    status: str
    tracking_number: str | None = None
    date: str | None = None
    seller_id: int | None = None
    created_at: str | None = None

    class Config:
        from_attributes = True


# ── Notification ─────────────────────────────────────────────────────────────

class NotificationCreate(BaseModel):
    title: str
    message: str
    time: str | None = None
    type: str = "system"


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    time: str | None = None
    unread: bool
    type: str

    class Config:
        from_attributes = True


# ── Transaction ──────────────────────────────────────────────────────────────

class TransactionResponse(BaseModel):
    id: int
    date: str | None = None
    type: str
    title: str
    description: str
    amount: float
    balance_after: float

    class Config:
        from_attributes = True


# ── Ad Package ───────────────────────────────────────────────────────────────

class AdPackageResponse(BaseModel):
    id: int
    name: str
    days: int
    price: float
    badge_text: str | None = None
    features: list[str] = []

    class Config:
        from_attributes = True


class AdPurchaseRequest(BaseModel):
    package_id: int
    listing_id: int
    payment_method: str = "balance"
