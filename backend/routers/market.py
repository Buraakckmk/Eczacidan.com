"""Cart, Order, Notification, Transaction ve Ad routerları."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.deps import get_current_user
from backend.database import get_db
from backend.models import (
    AdPackage,
    CartItem,
    Listing,
    Notification,
    Order,
    Product,
    Transaction,
    User,
)
from backend.schemas.market import (
    AdPackageResponse,
    AdPurchaseRequest,
    CartItemCreate,
    CartItemResponse,
    CartItemUpdate,
    NotificationCreate,
    NotificationResponse,
    OrderCreate,
    OrderResponse,
    TransactionResponse,
)

router = APIRouter(tags=["market"])


def _serialize_cart(ci: CartItem, db: Session) -> dict:
    listing = db.query(Listing).filter(Listing.id == ci.listing_id).first()
    product = db.query(Product).filter(Product.id == listing.product_id).first() if listing else None
    seller = (
        db.query(User).filter(User.id == listing.seller_id).first() if listing else None
    )
    return {
        "id": ci.id,
        "listing_id": ci.listing_id,
        "quantity": ci.quantity,
        "product_name": product.name if product else None,
        "seller_name": seller.pharmacy_name or seller.username if seller else None,
        "unit_price": listing.unit_price if listing else None,
        "min_order_qty": listing.min_order_qty if listing else None,
        "skt": listing.skt if listing else None,
        "delivery_type": listing.delivery_type if listing else None,
    }


# ── Cart ─────────────────────────────────────────────────────────────────────

@router.get("/cart", response_model=list[CartItemResponse])
def list_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    items = (
        db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    )
    return [_serialize_cart(ci, db) for ci in items]


@router.post("/cart", response_model=CartItemResponse)
def add_to_cart(
    payload: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "İlan bulunamadı.")
    existing = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == current_user.id,
            CartItem.listing_id == payload.listing_id,
        )
        .first()
    )
    if existing:
        existing.quantity += payload.quantity
        db.commit()
        db.refresh(existing)
        return _serialize_cart(existing, db)
    ci = CartItem(user_id=current_user.id, listing_id=payload.listing_id, quantity=payload.quantity)
    db.add(ci)
    db.commit()
    db.refresh(ci)
    return _serialize_cart(ci, db)


@router.put("/cart/{item_id}", response_model=CartItemResponse)
def update_cart(
    item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    ci = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.user_id == current_user.id)
        .first()
    )
    if not ci:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sepet öğesi bulunamadı.")
    ci.quantity = payload.quantity
    db.commit()
    db.refresh(ci)
    return _serialize_cart(ci, db)


@router.delete("/cart/{item_id}")
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ci = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.user_id == current_user.id)
        .first()
    )
    if not ci:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sepet öğesi bulunamadı.")
    db.delete(ci)
    db.commit()
    return {"success": True, "message": "Sepetten çıkarıldı."}


@router.delete("/cart")
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return {"success": True, "message": "Sepet temizlendi."}


# ── Orders ───────────────────────────────────────────────────────────────────

def _serialize_order(o: Order) -> dict:
    return {
        "id": o.id,
        "order_number": o.order_number,
        "product_name": o.product_name,
        "quantity": o.quantity,
        "unit_price": o.unit_price,
        "total_price": o.total_price,
        "status": o.status,
        "tracking_number": o.tracking_number,
        "date": o.date,
        "seller_id": o.seller_id,
        "created_at": o.created_at.isoformat() if o.created_at else None,
    }


@router.get("/orders", response_model=list[OrderResponse])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    items = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.id.desc())
        .all()
    )
    return [_serialize_order(o) for o in items]


def _create_order_from_listing(
    db: Session, user: User, listing: Listing, quantity: int
) -> Order:
    if quantity < listing.min_order_qty:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Minimum sipariş adedi: {listing.min_order_qty}",
        )
    if listing.stock < quantity:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Yetersiz stok.")
    total = round(listing.unit_price * quantity, 2)
    order_number = (
        f"ECZ-{datetime.now().strftime('%Y%m%d')}-{user.id}-{listing.id}"
    )
    seller = db.query(User).filter(User.id == listing.seller_id).first()
    product = db.query(Product).filter(Product.id == listing.product_id).first()
    order = Order(
        order_number=order_number,
        user_id=user.id,
        seller_id=listing.seller_id,
        product_name=product.name if product else f"Listing#{listing.id}",
        listing_id=listing.id,
        quantity=quantity,
        unit_price=listing.unit_price,
        total_price=total,
        status="Hazırlanıyor",
        tracking_number=None,
        date=datetime.now().strftime("%d %B %Y"),
    )
    listing.stock -= quantity
    db.add(order)

    # Para hareketi (bakiyeden düş / satıcıya ekle - basit simulasyon)
    if user.balance < total:
        # Bakiye yetersizse sipariş oluştur ama bakiye güncelleme, uyarı verme
        pass
    else:
        user.balance = round(user.balance - total, 2)
        if seller:
            seller.balance = round((seller.balance or 0) + total, 2)
            db.add(
                Transaction(
                    user_id=seller.id,
                    date=datetime.now().strftime("%d %B %Y - %H:%M"),
                    type="gelir",
                    title="İlan Satış Geliri",
                    description=f"{user.pharmacy_name or user.username} tarafından {quantity} adet sipariş",
                    amount=total,
                    balance_after=seller.balance,
                )
            )
        db.add(
            Transaction(
                user_id=user.id,
                date=datetime.now().strftime("%d %B %Y - %H:%M"),
                type="gider",
                title="Ürün Alım Siparişi",
                description=f"{seller.pharmacy_name or seller.username if seller else 'Satıcı'} - {quantity} Adet Ödemesi",
                amount=-total,
                balance_after=user.balance,
            )
        )

    db.add(
        Notification(
            user_id=listing.seller_id,
            title="Yeni Sipariş Bildirimi",
            message=f"{user.pharmacy_name or user.username} {quantity} adet sipariş verdi (Tutar: {total} TL)",
            time="az önce",
            unread=True,
            type="order",
        )
    )
    return order


@router.post("/orders", response_model=list[OrderResponse])
def create_orders(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    created: list[Order] = []
    if payload.cart_items:
        for item in payload.cart_items:
            listing = db.query(Listing).filter(Listing.id == item.listing_id).first()
            if not listing:
                continue
            order = _create_order_from_listing(db, current_user, listing, item.quantity)
            created.append(order)
            # Sepetten kaldır
            db.query(CartItem).filter(
                CartItem.user_id == current_user.id,
                CartItem.listing_id == item.listing_id,
            ).delete()
    elif payload.listing_id and payload.quantity:
        listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
        if not listing:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "İlan bulunamadı.")
        created.append(
            _create_order_from_listing(db, current_user, listing, payload.quantity)
        )
    else:
        # Tüm sepetten sipariş oluştur
        items = (
            db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
        )
        if not items:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, "Sepet boş, sipariş oluşturulamadı."
            )
        for ci in items:
            listing = db.query(Listing).filter(Listing.id == ci.listing_id).first()
            if not listing:
                continue
            created.append(
                _create_order_from_listing(db, current_user, listing, ci.quantity)
            )
        db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()

    db.commit()
    for o in created:
        db.refresh(o)
    return [_serialize_order(o) for o in created]


# ── Notifications ────────────────────────────────────────────────────────────

@router.get("/notifications", response_model=list[NotificationResponse])
def list_notifications(
    only_unread: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Notification]:
    q = db.query(Notification).filter(Notification.user_id == current_user.id)
    if only_unread:
        q = q.filter(Notification.unread.is_(True))
    return q.order_by(Notification.id.desc()).all()


@router.post("/notifications", response_model=NotificationResponse)
def create_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Notification:
    notif = Notification(
        user_id=current_user.id,
        title=payload.title,
        message=payload.message,
        time=payload.time or "az önce",
        type=payload.type,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = (
        db.query(Notification)
        .filter(
            Notification.id == notif_id, Notification.user_id == current_user.id
        )
        .first()
    )
    if not notif:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Bildirim bulunamadı.")
    notif.unread = False
    db.commit()
    return {"success": True}


@router.post("/notifications/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id, Notification.unread.is_(True)
        )
        .update({Notification.unread: False})
    )
    db.commit()
    return {"success": True}


# ── Transactions ─────────────────────────────────────────────────────────────

@router.get("/transactions", response_model=list[TransactionResponse])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Transaction]:
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.id.desc())
        .all()
    )


# ── Ad Packages ──────────────────────────────────────────────────────────────

def _serialize_ad(ap: AdPackage) -> dict:
    features_list: list[str] = []
    if ap.features:
        features_list = [f.strip() for f in ap.features.split("|") if f.strip()]
    return {
        "id": ap.id,
        "name": ap.name,
        "days": ap.days,
        "price": ap.price,
        "badge_text": ap.badge_text,
        "features": features_list,
    }


@router.get("/ad-packages", response_model=list[AdPackageResponse])
def list_ad_packages(db: Session = Depends(get_db)) -> list[dict]:
    packages = db.query(AdPackage).order_by(AdPackage.price.asc()).all()
    return [_serialize_ad(ap) for ap in packages]


@router.post("/ad-purchase")
def purchase_ad_package(
    payload: AdPurchaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pkg = db.query(AdPackage).filter(AdPackage.id == payload.package_id).first()
    if not pkg:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reklam paketi bulunamadı.")
    listing = (
        db.query(Listing)
        .filter(
            Listing.id == payload.listing_id, Listing.seller_id == current_user.id
        )
        .first()
    )
    if not listing:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, "İlan bulunamadı veya size ait değil."
        )

    if current_user.balance < pkg.price:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Bakiye yetersiz. Gerekli: {pkg.price} TL, Mevcut: {current_user.balance:.2f} TL",
        )

    current_user.balance = round(current_user.balance - pkg.price, 2)
    listing.is_sponsored = True
    listing.sponsored_days = pkg.days
    listing.is_premium_seller = True
    current_user.is_premium = True

    db.add(
        Transaction(
            user_id=current_user.id,
            date=datetime.now().strftime("%d %B %Y - %H:%M"),
            type="gider",
            title="⭐ Premium İlan Reklam Ödemesi",
            description=f"{pkg.name} Satın Alma",
            amount=-pkg.price,
            balance_after=current_user.balance,
        )
    )

    db.commit()
    return {
        "success": True,
        "message": f"{pkg.name} ile ilanınız {pkg.days} gün boyunca öne çıkarıldı!",
        "listing_id": listing.id,
    }
