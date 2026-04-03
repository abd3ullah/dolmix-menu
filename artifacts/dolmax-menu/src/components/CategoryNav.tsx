import { cn } from '@/lib/utils';

interface CategoryNavProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const categories = [
  { id: 'all', label: 'الكل' },
  { id: 'fatta', label: 'قسم الفتة' },
  { id: 'mahashi', label: 'قسم المحاشي' },
  { id: 'grape_leaves', label: 'ورق العنب' }
];

export function CategoryNav({ activeCategory, onSelectCategory }: CategoryNavProps) {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 py-3 px-4">
      <div className="max-w-md mx-auto flex gap-3 overflow-x-auto no-scrollbar pb-1" style={{ scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              "whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all duration-300",
              activeCategory === cat.id 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105" 
                : "bg-card text-muted-foreground border border-border/50 hover:bg-card/80"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
