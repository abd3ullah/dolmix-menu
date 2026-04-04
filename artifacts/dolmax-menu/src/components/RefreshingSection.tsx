import { MenuItem } from '../data/menuData';
import { formatPrice } from '../lib/format';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RefreshingSectionProps {
  items: MenuItem[];
  getItemQuantity: (id: string) => number;
  onAdd: (item: Omit<import('../hooks/useCart').CartItem, 'quantity' | 'id'>) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

export function RefreshingSection({ items, getItemQuantity, onAdd, onUpdateQty }: RefreshingSectionProps) {
  if (items.length === 0) return null;

  return (
    <section id="refreshing" className="py-6 px-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3 justify-center">
          <span className="flex-1 h-px bg-primary/30"></span>
          المشروبات المنعشة
          <span className="flex-1 h-px bg-primary/30"></span>
        </h2>

        <div className="grid gap-4">
          {items.map(item => {
            const qty = getItemQuantity(item.id);
            return (
              <div key={item.id} className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-lg flex">
                <div className="relative w-32 shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.onerror = null;
                      t.src = `https://placehold.co/128x128/1a3a22/c9a84c?text=${encodeURIComponent(item.name)}`;
                    }}
                  />
                </div>

                <div className="flex-1 p-4 flex flex-col justify-between min-h-[120px]">
                  <div>
                    <h3 className="font-bold text-base text-foreground leading-tight mb-1">{item.name}</h3>
                    <p className="text-primary font-bold text-lg">{formatPrice(item.price || 0)}</p>
                  </div>

                  <div className="mt-2">
                    {qty > 0 ? (
                      <div className="flex items-center gap-3 bg-background rounded-full p-1 border border-primary/20 w-fit">
                        <button
                          onClick={() => {
                            onUpdateQty(item.id, -1);
                            if (qty === 1) toast.success('تم حذف الصنف من السلة');
                            else toast.success('تم تحديث الكمية');
                          }}
                          className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold w-5 text-center">{qty}</span>
                        <button
                          onClick={() => {
                            onUpdateQty(item.id, 1);
                            toast.success('تم تحديث الكمية');
                          }}
                          className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
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
                        className="h-10 px-6 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-sm shadow-primary/20 transition-all active:scale-95"
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
