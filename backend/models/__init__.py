"""Varlık modelleri (SQLAlchemy ORM)."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)

    gln = Column(String(13), unique=True, index=True, nullable=False)
    tc = Column(String(11), unique=True, index=True)
    pharmacy_name = Column(String(255))
    pharmacy_city = Column(String(128))
    pharmacy_address = Column(Text)
    phone = Column(String(32))

    is_verified = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    balance = Column(Float, default=0.0)
    rating = Column(Float, default=8.5)
    listing_count = Column(Integer, default=0)

    consent = Column(Boolean, default=False)
    privacy = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    listings = relationship("Listing", back_populates="seller", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )
    transactions = relationship(
        "Transaction", back_populates="user", cascade="all, delete-orphan"
    )


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, nullable=False)
    slug = Column(String(128), unique=True, index=True)
    description = Column(String(512))

    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    barcode = Column(String(64), unique=True, index=True)
    psf = Column(Float, default=0.0)
    manufacturer = Column(String(255))
    description = Column(Text)
    image_url = Column(String(512))

    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="products")

    created_at = Column(DateTime, default=datetime.utcnow)

    listings = relationship("Listing", back_populates="product", cascade="all, delete-orphan")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product = relationship("Product", back_populates="listings")

    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller = relationship("User", back_populates="listings")

    status = Column(String(32), default="approved")  # pending / approved / rejected
    delivery_type = Column(String(16), default="24h")  # today / 24h

    is_new_listing = Column(Boolean, default=True)
    is_discounted = Column(Boolean, default=False)
    is_sponsored = Column(Boolean, default=False)
    sponsored_days = Column(Integer, default=0)

    unit_price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    mf_ratio = Column(String(32), default="Yok")
    skt = Column(String(16))
    discount_percentage = Column(Float, default=0.0)
    min_order_qty = Column(Integer, default=1)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (UniqueConstraint("user_id", "listing_id", name="uq_user_listing_cart"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="cart_items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(64), unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    seller_id = Column(Integer)
    product_name = Column(String(255))
    listing_id = Column(Integer)

    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String(64), default="Hazırlanıyor")  # Hazırlanıyor / Kargoda / Teslim Edildi
    tracking_number = Column(String(64))
    date = Column(String(64))

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(255))
    message = Column(Text)
    time = Column(String(64))
    unread = Column(Boolean, default=True)
    type = Column(String(32), default="system")  # price / order / system

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    date = Column(String(64))
    type = Column(String(16), default="gider")  # gelir / gider
    title = Column(String(255))
    description = Column(Text)
    amount = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")


class AdPackage(Base):
    __tablename__ = "ad_packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    days = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    badge_text = Column(String(128))
    features = Column(Text)  # virgülle ayrılmış liste olarak saklanabilir

    created_at = Column(DateTime, default=datetime.utcnow)
