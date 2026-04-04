import { MenuItem } from '../data/menuData';
import { formatPrice } from '../lib/format';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FattaSectionProps {
  items: MenuItem[];
  getItemQuantity: (id: string) => number;
  onAdd: (item: Omit<import('../hooks/useCart').CartItem, 'quantity' | 'id'>) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

export function FattaSection({ items, getItemQuantity, onAdd, onUpdateQty }: FattaSectionProps) {
  if (items.length === 0) return null;

  return (
    <section id="fatta" className="py-6 px-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3 justify-center">
          <span className="flex-1 h-px bg-primary/30"></span>
          قسم الفتة
          <span className="flex-1 h-px bg-primary/30"></span>
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {items.map(item => {
            const qty = getItemQuantity(item.id);
            return (
              <div key={item.id} className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                <div className="relative w-full" style={{ paddingBottom: '70%' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.onerror = null;
                      t.src = `https://placehold.co/400x280/1a3a22/c9a84c?text=${encodeURIComponent(item.name)}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>

                <div className="p-3 flex flex-col flex-1 gap-2">
                  <h3 className="font-bold text-sm text-foreground leading-tight">{item.name}</h3>
                  <p className="text-primary font-bold text-base">{formatPrice(item.price || 0)}</p>

                  <div className="mt-auto pt-1">
                    {qty > 0 ? (
                      <div className="flex items-center justify-between bg-background rounded-xl border border-primary/20 p-1">
                        <button
                          onClick={() => {
                            onUpdateQty(item.id, -1);
                            if (qty === 1) toast.success('تم حذف الصنف من السلة');
                            else toast.success('تم تحديث الكمية');
                          }}
                          className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-base w-6 text-center">{qty}</span>
                        <button
                          onClick={() => {
                            onUpdateQty(item.id, 1);
                            toast.success('تم تحديث الكمية');
                          }}
                          className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          onAdd({
                            itemId: item.id,
                            name: item.name,
                            category: item.category,
                            unitPrice: item.price || 0
                          });
                          toast.success('تمت إضافة الصنف إلى السلة');
                        }}
                        className="w-full h-9 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm shadow-primary/20 transition-all active:scale-95"
                      >
                        إضافة
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
