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
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-primary/50"></span>
          الأطباق المميزة
          <span className="w-8 h-px bg-primary/50"></span>
        </h2>
        
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {items.map(item => {
            // For featured items with sizes, default to first size
            const selectedSizeId = item.sizes?.[0]?.id;
            const selectedSize = item.sizes?.[0];
            const cartItemId = selectedSizeId ? `${item.id}-${selectedSizeId}` : item.id;
            const qty = getItemQuantity(cartItemId);
            
            const price = selectedSize ? selectedSize.price : (item.price || 0);
            
            return (
              <div key={item.id} className="min-w-[280px] bg-card border border-primary/30 rounded-2xl p-5 shadow-lg relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -mr-12 -mt-12" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-secondary/10 rounded-tr-full -ml-8 -mb-8" />
                
                <div className="relative z-10">
                  <h3 className="font-bold text-xl text-foreground mb-2">{item.name}</h3>
                  {selectedSize && (
                    <p className="text-sm text-muted-foreground mb-4">
                      الحجم: {selectedSize.label} ({selectedSize.pieces} حبة)
                    </p>
                  )}
                  
                  <div className="flex justify-between items-end mt-6">
                    <div>
                      <p className="text-2xl text-primary font-bold">{formatPrice(price)}</p>
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
                          className="rounded-full px-6 h-12 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                        >
                          إضافة
                        </Button>
                      )}
                    </div>
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
