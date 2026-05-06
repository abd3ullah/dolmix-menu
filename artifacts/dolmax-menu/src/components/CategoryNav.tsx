import { cn } from '@/lib/utils';

interface CategoryNavProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const categories = [
  { id: 'all',          label: 'الكل'               },
  { id: 'fatta',        label: 'الفتة'              },
  { id: 'mahashi',      label: 'المحاشي'            },
  { id: 'grape_leaves', label: 'ورق العنب'          },
  { id: 'pilav',        label: 'پيلاو'              },
  { id: 'drinks',       label: 'المشروبات'          },
  { id: 'sauces',       label: 'الصوص'              },
  { id: 'refreshing',   label: 'المشروبات المنعشة'  },
];

export function CategoryNav({ activeCategory, onSelectCategory }: CategoryNavProps) {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/40 py-3">
      <div
        className="flex gap-2.5 overflow-x-auto px-4"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 shrink-0 active:scale-95",
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-card text-muted-foreground border border-border/40 hover:border-primary/30"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
