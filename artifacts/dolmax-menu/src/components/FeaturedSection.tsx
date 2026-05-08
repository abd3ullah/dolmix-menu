import { MenuItem } from '../data/menuData';
import { formatPrice } from '../lib/format';
import { ArrowLeft } from 'lucide-react';

interface FeaturedSectionProps {
  items: MenuItem[];
  // these are kept in the props signature for backward compatibility with App.tsx
  // but the featured section no longer adds to cart — it only navigates.
  getItemQuantity?: (id: string) => number;
  onAdd?: (item: Omit<import('../hooks/useCart').CartItem, 'quantity' | 'id'>) => void;
  onUpdateQty?: (id: string, delta: number) => void;
}

export function FeaturedSection({ items }: FeaturedSectionProps) {
  if (items.length === 0) return null;

  const goToItem = (itemId: string) => {
    const target = document.querySelector<HTMLElement>(`[data-item-id="${itemId}"]`);
    if (!target) return;

    const y = target.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: y, behavior: 'smooth' });

    // brief highlight
    target.classList.add('featured-target-highlight');
    window.setTimeout(() => {
      target.classList.remove('featured-target-highlight');
    }, 1800);
  };

  return (
    <section className="py-6 px-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3 justify-center">
          <span className="flex-1 h-px bg-primary/30"></span>
          الأطباق المميزة
          <span className="flex-1 h-px bg-primary/30"></span>
        </h2>

        <div
          className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
          {items.map(item => {
            const firstSize = item.sizes?.[0];
            const price = firstSize ? firstSize.price : (item.price || 0);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goToItem(item.id)}
                className="min-w-[260px] max-w-[280px] bg-card border border-border/40 rounded-2xl overflow-hidden shadow-lg shrink-0 snap-start flex flex-col text-right active:scale-[0.98] transition-transform"
              >
                <div className="relative w-full" style={{ paddingBottom: '65%' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.onerror = null;
                      t.src = `https://placehold.co/280x182/1a3a22/c9a84c?text=${encodeURIComponent(item.name)}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 right-0 left-0 p-3">
                    <h3 className="font-bold text-base text-white leading-snug drop-shadow">{item.name}</h3>
                    {firstSize && (
                      <p className="text-white/65 text-xs">يبدأ من {firstSize.label}</p>
                    )}
                  </div>
                </div>

                <div className="p-3 flex justify-between items-center">
                  <p className="text-xl font-bold text-primary">
                    {firstSize ? `يبدأ من ${formatPrice(price)}` : formatPrice(price)}
                  </p>

                  <span className="flex items-center gap-1.5 text-xs font-bold text-primary/85 bg-primary/10 border border-primary/25 rounded-full px-3 h-8">
                    اختر خياراتك
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
