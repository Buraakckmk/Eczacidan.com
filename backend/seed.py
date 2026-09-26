"""İlk çalıştırmada demo veri (seed) ekler.

Kullanıcı: demo / (SEED_DEMO_PASSWORD env değişkeni veya geliştirme ortamı için demo123)
GLN: 3245676600002 (doğru checksum'lu)
"""

from __future__ import annotations

import os
from datetime import datetime

from sqlalchemy.orm import Session

from backend.core.security import get_password_hash
from backend.models import (
    AdPackage,
    CartItem,
    Category,
    Listing,
    Notification,
    Order,
    Product,
    Transaction,
    User,
)

CATEGORY_NAMES = [
    "Anne & Bebek",
    "Besin Takviyesi",
    "Kişisel Bakım",
    "Medikal",
    "Sağlık",
    "Sarf Malzemeleri",
    "Outlet",
    "Özel Kategoriler",
]

SEED_PRODUCTS = [
    dict(
        name="Agavit Şurup 150 ml",
        barcode="8699543011029",
        psf=45.56,
        manufacturer="Agavit İlaç A.Ş.",
        description="Multivitamin ve mineral takviyesi içeren çocuk şurubu.",
        category_index=1,  # Besin Takviyesi
    ),
    dict(
        name="Parol 500 mg 20 Tablet",
        barcode="8699525010019",
        psf=68.20,
        manufacturer="Atabay İlaç",
        description="Ağrı kesici ve ateş düşürücü tablet.",
        category_index=3,  # Medikal
    ),
    dict(
        name="Ocean Vitamin D3 1000 IU Damla 20 ml",
        barcode="8697415840331",
        psf=185.00,
        manufacturer="Orzax İlaç",
        description="Zeytinyağlı D3 Vitamini içeren takviye edici gıda.",
        category_index=1,
    ),
    dict(
        name="Solgar Omega 3 1000 mg Softgel 60 Kapsül",
        barcode="033984020504",
        psf=620.00,
        manufacturer="Solgar",
        description="Yüksek saflıkta konsantre balık yağı kapsülleri.",
        category_index=1,
    ),
    dict(
        name="Mustela Bebe Dermo-Cleansing Şampuan 500 ml",
        barcode="3504105028428",
        psf=410.00,
        manufacturer="Mustela",
        description="Yenidoğandan itibaren saç ve vücut temizleme jeli.",
        category_index=0,
    ),
    dict(
        name="Systane Ultra Nemlendirici Göz Damlası 10 ml",
        barcode="8470001550212",
        psf=295.50,
        manufacturer="Alcon",
        description="Kuru göz semptomlarını hafifleten kayganlaştırıcı göz damlası.",
        category_index=4,
    ),
    dict(
        name="La Roche-Posay Lipikar Baume AP+M 400 ml",
        barcode="3337875696548",
        psf=740.00,
        manufacturer="La Roche-Posay",
        description="Kuru ve atopiye eğilimli ciltler için yatıştırıcı merhem.",
        category_index=2,
    ),
]


def seed_categories(db: Session) -> dict[str, int]:
    existing = {c.name: c.id for c in db.query(Category).all()}
    result: dict[str, int] = {}
    for idx, name in enumerate(CATEGORY_NAMES):
        if name in existing:
            result[name] = existing[name]
            continue
        category = Category(
            name=name,
            slug=name.lower().replace(" & ", "-").replace(" ", "-"),
            description=f"{name} kategorisi ürünleri.",
        )
        db.add(category)
        db.flush()
        result[name] = category.id
    db.commit()
    return result


def seed_user(
    db: Session,
    *,
    username: str,
    password: str,
    gln: str,
    tc: str,
    pharmacy_name: str,
    pharmacy_city: str,
    balance: float = 0.0,
    is_premium: bool = False,
    rating: float = 9.0,
) -> User:
    user = (
        db.query(User)
        .filter(
            (User.username == username)
            | (User.gln == gln)
            | (User.tc == tc)
        )
        .first()
    )
    if user:
        return user
    user = User(
        username=username,
        hashed_password=get_password_hash(password),
        gln=gln,
        tc=tc,
        pharmacy_name=pharmacy_name,
        pharmacy_city=pharmacy_city,
        is_verified=True,
        is_premium=is_premium,
        balance=balance,
        rating=rating,
        listing_count=0,
        consent=True,
        privacy=True,
    )
    db.add(user)
    db.flush()
    return user


def seed_products(db: Session, category_ids: dict[str, int]) -> dict[str, int]:
    product_ids: dict[str, int] = {}
    for data in SEED_PRODUCTS:
        category_name = CATEGORY_NAMES[data.pop("category_index")]
        category_id = category_ids[category_name]
        barcode = data["barcode"]
        existing = db.query(Product).filter(Product.barcode == barcode).first()
        if existing:
            product_ids[existing.name] = existing.id
            continue
        product = Product(category_id=category_id, **data)
        db.add(product)
        db.flush()
        product_ids[product.name] = product.id
    db.commit()
    return product_ids


def _seed_listing(
    db: Session,
    *,
    seller: User,
    product: Product,
    unit_price: float,
    stock: int,
    discount_pct: float,
    mf: str,
    skt: str,
    delivery: str = "24h",
    min_qty: int = 1,
    is_new: bool = True,
    sponsored: bool = False,
    sponsored_days: int = 0,
    status: str = "approved",
) -> Listing:
    listing = Listing(
        product_id=product.id,
        seller_id=seller.id,
        status=status,
        delivery_type=delivery,
        is_new_listing=is_new,
        is_discounted=discount_pct > 0,
        is_sponsored=sponsored,
        sponsored_days=sponsored_days,
        unit_price=unit_price,
        stock=stock,
        mf_ratio=mf,
        skt=skt,
        discount_percentage=discount_pct,
        min_order_qty=min_qty,
    )
    db.add(listing)
    seller.listing_count = (seller.listing_count or 0) + 1
    return listing


def seed_listings(
    db: Session, sellers: dict[str, User], products: dict[str, Product]
) -> None:
    if db.query(Listing).count() > 0:
        return
    p_parol = products.get("Parol 500 mg 20 Tablet") or list(products.values())[0]
    demo_seller = list(sellers.values())[0]

    _seed_listing(
        db, seller=demo_seller, product=p_parol,
        unit_price=42.00, stock=100, discount_pct=38.4, mf="10+2",
        skt="01/2028", delivery="today", min_qty=1, is_new=True,
        sponsored=True, sponsored_days=30,
    )
    db.commit()


def seed_ad_packages(db: Session) -> None:
    if db.query(AdPackage).count() > 0:
        return
    db.add_all([
        AdPackage(
            name="1 Günlük Hızlı Reklam",
            days=1,
            price=19.90,
            badge_text="Fırsat Paket",
            features="1 Gün Boyunca Listenin En Üstünde Gösterim|Sponsorlu Premium Rozeti|Arama Sonuçlarında Öne Çıkarma",
        ),
        AdPackage(
            name="7 Günlük Standart Reklam",
            days=7,
            price=49.90,
            badge_text="En Popüler",
            features="7 Gün Boyunca Kesintisiz Üst Sıra Garantisi|Altın Işıltılı Premium Rozeti|%300 Daha Fazla Görüntülenme",
        ),
        AdPackage(
            name="30 Günlük Pro Sponsor",
            days=30,
            price=149.90,
            badge_text="En Avantajlı (%50 İndirim)",
            features="30 Gün Boyunca Tüm İlanlarda Öne Çıkma|Özel Eczane Logo & Premium Rozeti|Haftalık İlan Analitik Raporu",
        ),
    ])
    db.commit()


def seed_initial_notifications(db: Session, user: User) -> None:
    pass


def seed_my_transactions(db: Session, user: User) -> None:
    pass


def seed_demo_orders(db: Session, user: User, sellers: dict[str, User], products: dict[str, Product]) -> None:
    pass


def seed_demo(db: Session) -> None:
    """Tüm demo veriyi varsa ekler."""
    category_ids = seed_categories(db)

    def _name_to_cat(name: str) -> int:
        return category_ids[name]

    # Valid GLN: 3 2 4 5 6 7 6 6 0 0 0 0 -> check digit 2
    # 3245676600002 -> valid
    # Demo şifresi env'den alınır; yoksa yalnızca development'ta default kullanılır
    _demo_pwd = os.getenv("SEED_DEMO_PASSWORD", "demo123")
    sellers_def = [
        ("demo", _demo_pwd, "3245676600058", "10000002676", "Kadıköy Şifa Eczanesi (Demo Hesabı)", "Kadıköy / İstanbul", 1450.0, True, 9.5),
    ]
    sellers: dict[str, User] = {}
    for (uname, pwd, gln, tc, pname, pcity, bal, prem, rating) in sellers_def:
        user = seed_user(
            db,
            username=uname,
            password=pwd,
            gln=gln,
            tc=tc,
            pharmacy_name=pname,
            pharmacy_city=pcity,
            balance=bal,
            is_premium=prem,
            rating=rating,
        )
        sellers[pname] = user
        if uname == "demo":
            sellers["me"] = user
    db.commit()

    # Reload User dicts — use pharmacy_name as key.
    product_name_to_id = seed_products(db, category_ids)
    products: dict[str, Product] = {}
    for name in product_name_to_id:
        prod = db.query(Product).filter(Product.id == product_name_to_id[name]).first()
        if prod:
            products[name] = prod
    sellers_map: dict[str, User] = {}
    for key, user in sellers.items():
        if key == "me":
            continue
        sellers_map[key] = user
    seed_listings(db, sellers_map, products)
    seed_ad_packages(db)
    me = sellers["me"]
    seed_initial_notifications(db, me)
    seed_my_transactions(db, me)
    seed_demo_orders(db, me, sellers_map, products)

    # Demo kartı temizle (CartItem) - tekrar ederse ekleme
    db.query(CartItem).filter(CartItem.user_id == me.id).delete()
    db.commit()
