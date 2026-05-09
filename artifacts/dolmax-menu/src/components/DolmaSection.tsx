import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MenuItem } from '../data/menuData';
import { CartItem } from '../hooks/useCart';
import { formatPrice } from '../lib/format';

interface DolmaSectionProps {
  items: MenuItem[];
  getItemQuantity: (id: string) => number;
  onAdd: (item: Omit<CartItem, 'quantity' | 'id'>) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

function DolmaSizedCard({
  item,
  getItemQuantity,
  onAdd,
  onUpdateQty,
}: {
  item: MenuItem;
  getItemQuantity: (id: string) => number;
  onAdd: (item: Omit<CartItem, 'quantity' | 'id'>) => void;
  onUpdateQty: (id: string, delta: number) => void;
}) {
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const selectedSize = item.sizes?.find(s => s.id === selectedSizeId);
  const cartItemId = `${item.id}-${selectedSizeId}`;
  const qty = selectedSizeId ? getItemQuantity(cartItemId) : 0;

  return (
    <div data-item-id={item.id} className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-lg transition-shadow">
      <div className="relative w-full" style={{ paddingBottom: '55%' }}>
        <img
          src={item.image}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            const t = e.currentTarget;
            t.onerror = null;
            t.src = `https://placehold.co/600x330/1a3a22/c9a84c?text=${encodeURIComponent(item.name)}`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 right-0 left-0 p-4">
          <h3 className="font-bold text-xl text-white leading-tight drop-shadow">{item.name}</h3>
        </div>
      </div>

      <div className="p-4">
        <div
          className={cn(
            "mb-4 rounded-xl transition-all duration-300",
            showSizeWarning && "ring-2 ring-red-400/70 ring-offset-2 ring-offset-card p-2 -m-2 animate-pulse"
          )}
        >
          <p className="text-xs font-semibold text-primary mb-2">اختر الحجم:</p>
          <div className="flex flex-wrap gap-2">
            {item.sizes?.map(size => (
              <button
                key={size.id}
                onClick={() => { setSelectedSizeId(size.id); setShowSizeWarning(false); }}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95 text-right",
                  selectedSizeId === size.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-foreground border-border/50 hover:border-primary/50"
                )}
              >
                {size.label}
                <span className={cn("mr-1", selectedSizeId === size.id ? "opacity-90" : "opacity-60")}>
                  — {formatPrice(size.price)}
                </span>
              </button>
            ))}
          </div>
          {showSizeWarning && (
            <p className="mt-2 text-xs font-bold text-red-400 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
              اختر الحجم أولاً
            </p>
          )}
        </div>

        <div className="flex justify-end items-center pt-3 border-t border-border/30">
          {qty > 0 ? (
            <div className="flex items-center gap-3 bg-background rounded-full p-1 border border-primary/20">
              <button
                onClick={() => {
                  onUpdateQty(cartItemId, -1);
                  if (qty === 1) toast.success('تم حذف الصنف من السلة');
                  else toast.success('تم تحديث الكمية');
                }}
                className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-muted transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="font-bold w-6 text-center text-lg">{qty}</span>
              <button
                onClick={() => { onUpdateQty(cartItemId, 1); toast.success('تم تحديث الكمية'); }}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Button
              onClick={() => {
                if (!selectedSize) {
                  setShowSizeWarning(true);
                  toast.error('اختر الحجم أولاً');
                  return;
                }
                onAdd({
                  itemId: item.id,
                  name: `${item.name} - ${selectedSize.label}`,
                  category: item.category,
                  selectedSize: selectedSize.id,
                  pieces: selectedSize.pieces,
                  unitPrice: selectedSize.price,
                });
                toast.success('تمت إضافة الصنف إلى السلة');
              }}
              className="rounded-full px-8 h-12 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 text-base transition-all active:scale-95"
            >
              إضافة
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DolmaSection({ items, getItemQuantity, onAdd, onUpdateQty }: DolmaSectionProps) {
  if (!items.length) return null;

  return (
    <section id="dolma" className="py-6 px-4">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-foreground">دولمة</h2>
        <div className="mt-1 h-0.5 w-12 bg-primary rounded-full" />
      </div>
      <div className="space-y-4">
        {items.map(item => (
          <DolmaSizedCard
            key={item.id}
            item={item}
            getItemQuantity={getItemQuantity}
            onAdd={onAdd}
            onUpdateQty={onUpdateQty}
          />
        ))}
      </div>
    </section>
  );
}
