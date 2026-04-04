import { MenuItem } from '../data/menuData';
import { formatPrice } from '../lib/format';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FeaturedSectionProps {
  items: MenuItem[];
  getItemQuantity: (id: string) => number;
  onAdd: (item: Omit<import('../hooks/useCart').CartItem, 'quantity' | 'id'>) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

export function FeaturedSection({ items, getItemQuantity, onAdd, onUpdateQty }: FeaturedSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="py-6 px-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3 justify-center">
          <span className="flex-1 h-px bg-primary/30"></span>
          الأطباق المميزة
          <span className="flex-1 h-px bg-primary/30"></span>
        </h2>

        <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
          {items.map(item => {
            const selectedSizeId = item.sizes?.[0]?.id;
            const selectedSize = item.sizes?.[0];
            const cartItemId = selectedSizeId ? `${item.id}-${selectedSizeId}` : item.id;
            const qty = getItemQuantity(cartItemId);
            const price = selectedSize ? selectedSize.price : (item.price || 0);

            return (
              <div
                key={item.id}
                className="min-w-[260px] max-w-[280px] bg-card border border-border/40 rounded-2xl overflow-hidden shadow-lg shrink-0 snap-start flex flex-col"
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
                    {selectedSize && (
                      <p className="text-white/65 text-xs">{selectedSize.label} • {selectedSize.pieces} حبة</p>
                    )}
                  </div>
                </div>

                <div className="p-3 flex justify-between items-center">
                  <p className="text-xl font-bold text-primary">{formatPrice(price)}</p>

                  {qty > 0 ? (
                    <div className="flex items-center gap-2 bg-background rounded-full p-1 border border-primary/20">
                      <button
                        onClick={() => {
                          onUpdateQty(cartItemId, -1);
                          if (qty === 1) toast.success('تم حذف الصنف من السلة');
                          else toast.success('تم تحديث الكمية');
                        }}
                        className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold w-5 text-center">{qty}</span>
                      <button
                        onClick={() => {
                          onUpdateQty(cartItemId, 1);
                          toast.success('تم تحديث الكمية');
                        }}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        if (selectedSize) {
                          onAdd({
                            itemId: item.id,
                            name: `${item.name} - ${selectedSize.label}`,
                            category: item.category,
                            selectedSize: selectedSize.id,
                            pieces: selectedSize.pieces,
                            unitPrice: price
                          });
                        } else {
                          onAdd({
                            itemId: item.id,
                            name: item.name,
                            category: item.category,
                            unitPrice: price
                          });
                        }
                        toast.success('تمت إضافة الصنف إلى السلة');
                      }}
                      className="rounded-full px-5 h-9 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 text-sm transition-all active:scale-95"
                    >
                      إضافة
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
