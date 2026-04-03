import { useState } from 'react';
import { MenuItem } from '../data/menuData';
import { formatPrice } from '../lib/format';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GrapeLeafSectionProps {
  items: MenuItem[];
  getItemQuantity: (id: string) => number;
  onAdd: (item: Omit<import('../hooks/useCart').CartItem, 'quantity' | 'id'>) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

export function GrapeLeafSection({ items, getItemQuantity, onAdd, onUpdateQty }: GrapeLeafSectionProps) {
  if (items.length === 0) return null;

  return (
    <section id="grape_leaves" className="py-6 px-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-primary/50"></span>
          ورق العنب
          <span className="w-8 h-px bg-primary/50"></span>
        </h2>
        
        <div className="grid gap-6">
          {items.map(item => (
            <GrapeLeafCard 
              key={item.id} 
              item={item} 
              getItemQuantity={getItemQuantity} 
              onAdd={onAdd} 
              onUpdateQty={onUpdateQty} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function GrapeLeafCard({ 
  item, 
  getItemQuantity, 
  onAdd, 
  onUpdateQty 
}: { 
  item: MenuItem, 
  getItemQuantity: (id: string) => number,
  onAdd: any,
  onUpdateQty: any
}) {
  const [selectedSizeId, setSelectedSizeId] = useState<string>(item.sizes?.[0]?.id || '');
  const selectedSize = item.sizes?.find(s => s.id === selectedSizeId);
  
  const cartItemId = `${item.id}-${selectedSizeId}`;
  const qty = getItemQuantity(cartItemId);

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
      {/* Decorative leaf accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-8 -mt-8" />
      
      <h3 className="font-bold text-xl text-foreground mb-4 relative z-10">{item.name}</h3>

      <div className="mb-5 relative z-10">
        <div className="grid grid-cols-2 gap-2">
          {item.sizes?.map(size => (
            <button
              key={size.id}
              onClick={() => setSelectedSizeId(size.id)}
              className={cn(
                "px-3 py-2.5 rounded-xl text-sm font-bold border transition-all flex flex-col items-center justify-center gap-1",
                selectedSizeId === size.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-foreground border-border hover:border-primary/50"
              )}
            >
              <span>{size.label}</span>
              <span className={cn("text-xs", selectedSizeId === size.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {size.pieces} حبة
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
        <div>
          <div className="text-xs text-muted-foreground mb-1">السعر</div>
          <p className="text-xl text-primary font-bold">{formatPrice(selectedSize?.price || 0)}</p>
        </div>
        
        <div>
          {qty > 0 ? (
            <div className="flex items-center gap-3 bg-background rounded-full p-1 border border-primary/20">
              <button 
                onClick={() => {
                  onUpdateQty(cartItemId, -1);
                  if (qty === 1) toast.success('تم حذف الصنف من السلة');
                }}
                className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-muted"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="font-bold w-6 text-center text-lg">{qty}</span>
              <button 
                onClick={() => {
                  onUpdateQty(cartItemId, 1);
                }}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Button 
              onClick={() => {
                if (!selectedSize) return;
                onAdd({
                  itemId: item.id,
                  name: `${item.name} - ${selectedSize.label}`,
                  category: item.category,
                  selectedSize: selectedSize.id,
                  pieces: selectedSize.pieces,
                  unitPrice: selectedSize.price
                });
                toast.success('تمت إضافة الصنف إلى السلة');
              }}
              className="rounded-full px-8 h-12 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 text-lg"
            >
              إضافة
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
