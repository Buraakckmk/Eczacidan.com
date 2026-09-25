"""Category, Product şemaları."""

from __future__ import annotations

from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str = Field(..., max_length=128)
    slug: str | None = None
    description: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str = Field(..., max_length=255)
    barcode: str | None = Field(None, max_length=64)
    psf: float = 0.0
    manufacturer: str | None = None
    description: str | None = None
    image_url: str | None = None
    category_id: int | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    barcode: str | None = None
    psf: float | None = None
    manufacturer: str | None = None
    description: str | None = None
    image_url: str | None = None
    category_id: int | None = None


class ProductResponse(ProductBase):
    id: int
    category_name: str | None = None

    class Config:
        from_attributes = True
