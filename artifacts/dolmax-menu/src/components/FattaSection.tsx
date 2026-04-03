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
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-primary/50"></span>
          قسم الفتة
          <span className="w-8 h-px bg-primary/50"></span>
        </h2>
        
        <div className="grid gap-4">
          {items.map(item => {
            const qty = getItemQuantity(item.id);
            
            return (
              <div key={item.id} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-1">{item.name}</h3>
                  <p className="text-primary font-semibold">{formatPrice(item.price || 0)}</p>
                </div>
                
                <div>
                  {qty > 0 ? (
                    <div className="flex items-center gap-3 bg-background rounded-full p-1 border border-primary/20">
                      <button 
                        onClick={() => {
                          onUpdateQty(item.id, -1);
                          if (qty === 1) toast.success('تم حذف الصنف من السلة');
                        }}
                        className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-muted"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold w-4 text-center">{qty}</span>
                      <button 
                        onClick={() => {
                          onUpdateQty(item.id, 1);
                        }}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
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
                      className="rounded-full px-6 h-10 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
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
