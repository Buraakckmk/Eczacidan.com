export const MARKETPLACE_CATEGORIES = [
  'Anne & Bebek',
  'Besin Takviyesi',
  'Kişisel Bakım',
  'Medikal',
  'Sağlık',
  'Sarf Malzemeleri',
  'Outlet',
  'Özel Kategoriler',
] as const;

interface CategoryNavProps {
  activeCategory?: string;
  onCategoryClick?: (category: string) => void;
}

export function CategoryNav({ activeCategory = '', onCategoryClick }: CategoryNavProps) {
  return (
    <nav className="border-b border-gray-900 bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-3 sm:gap-8 sm:px-6 lg:justify-between lg:gap-0">
        {MARKETPLACE_CATEGORIES.map((category) => {
          const isActive = Boolean(activeCategory) && activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryClick?.(category)}
              className={`shrink-0 whitespace-nowrap text-sm font-medium transition ${
                isActive
                  ? 'text-white underline decoration-orange-500 decoration-2 underline-offset-[6px]'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
