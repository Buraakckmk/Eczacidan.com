export const CATEGORY_SLUG_MAP: Record<string, string> = {
  'Besin Takviyesi': 'besin-takviyesi',
  'Anne & Bebek': 'anne-bebek',
  'Medikal & Medikal Sarf': 'medikal-sarf',
  'Cilt Bakımı & Kozmetik': 'cilt-bakimi-kozmetik',
  'Kişisel Bakım & Hijyen': 'kisisel-bakim',
  'Diyabet & Sağlık Cihazları': 'diyabet-saglik-cihazlari',
  'Vitamin & Mineral': 'vitamin-mineral',
  'Ağız & Diş Sağlığı': 'agiz-dis-sagligi',
};

export function categoryToSlug(categoryName: string): string {
  if (CATEGORY_SLUG_MAP[categoryName]) {
    return CATEGORY_SLUG_MAP[categoryName];
  }
  return categoryName
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugToCategory(slug: string): string {
  for (const [name, s] of Object.entries(CATEGORY_SLUG_MAP)) {
    if (s === slug) return name;
  }
  return slug;
}

export function sellerToSlug(sellerName: string): string {
  return sellerName
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
