import { useState } from 'react';
import { MenuItem } from '../data/menuData';
import { formatPrice } from '../lib/format';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CartItem } from '../hooks/useCart';
import { toast } from 'sonner';

interface MahasshiSectionProps {
  items: MenuItem[];
  getItemQuantity: (id: string) => number;
  onAdd: (item: Omit<CartItem, 'quantity' | 'id'>) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

export function MahasshiSection({ items, getItemQuantity, onAdd, onUpdateQty }: MahasshiSectionProps) {
  if (items.length === 0) return null;

  return (
    <section id="mahashi" className="py-6 px-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3 justify-center">
          <span className="flex-1 h-px bg-primary/30"></span>
          قسم المحاشي
          <span className="flex-1 h-px bg-primary/30"></span>
        </h2>

        <div className="grid gap-6">
          {items.map(item =>
            item.sizes ? (
              <MahasshiSizedCard
                key={item.id}
                item={item}
                getItemQuantity={getItemQuantity}
                onAdd={onAdd}
                onUpdateQty={onUpdateQty}
              />
            ) : (
              <MahasshiFixedCard
                key={item.id}
                item={item}
                getItemQuantity={getItemQuantity}
                onAdd={onAdd}
                onUpdateQty={onUpdateQty}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}

// ── Card for items with size options (m1, m2) + optional piece selector ──────
function MahasshiSizedCard({
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
  const [selectedSizeId, setSelectedSizeId] = useState<string>(item.sizes?.[0]?.id || '');
  const [selectedPieces, setSelectedPieces] = useState<string[]>([]);
  const [showPieceWarning, setShowPieceWarning] = useState(false);
  const selectedSize = item.sizes?.find(s => s.id === selectedSizeId);
  const cartItemId = `${item.id}-${selectedSizeId}`;
  const qty = getItemQuantity(cartItemId);
  const requiresPiece = !!(item.pieceOptions && item.pieceOptions.length > 0);

  const togglePiece = (piece: string) => {
    setSelectedPieces(prev =>
      prev.includes(piece) ? prev.filter(p => p !== piece) : [...prev, piece]
    );
    setShowPieceWarning(false);
  };

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
          {item.description && (
            <p className="text-white/75 text-xs mt-0.5">{item.description}</p>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Size selector */}
        <p className="text-xs font-semibold text-primary mb-2">اختر الحجم:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {item.sizes?.map(size => (
            <button
              key={size.id}
              onClick={() => setSelectedSizeId(size.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95",
                selectedSizeId === size.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-foreground border-border/50 hover:border-primary/50"
              )}
            >
              {size.label}
              {size.pieces > 0 && (
                <span className={cn("mr-1 opacity-70", selectedSizeId === size.id ? "opacity-90" : "")}>
({size.pieces} حبة)
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Piece type selector — only for items that have pieceOptions */}
        {requiresPiece && (
          <div
            className={cn(
              "mb-4 rounded-xl transition-all duration-300",
              showPieceWarning && "ring-2 ring-red-400/70 ring-offset-2 ring-offset-card p-2 -m-2 animate-pulse"
            )}
          >
            <p className="text-xs font-semibold text-primary mb-2">
              نوع الحبات:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.pieceOptions!.map(piece => (
                <button
                  key={piece}
                  onClick={() => togglePiece(piece)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 active:scale-95",
                    selectedPieces.includes(piece)
                      ? "bg-primary/20 text-primary border-primary/50"
                      : "bg-background text-muted-foreground border-border/40 hover:border-primary/30"
                  )}
                >
                  {piece}
                </button>
              ))}
            </div>
            {showPieceWarning && (
              <p className="mt-2 text-xs font-bold text-red-400 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                اختر نوع الحبات أولاً
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-border/30">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">السعر</p>
            <p className="text-xl font-bold text-primary">{formatPrice(selectedSize?.price || 0)}</p>
          </div>

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
                onClick={() => {
                  if (!selectedSize) return;
                  onAdd({
                    itemId: item.id,
                    name: `${item.name} - ${selectedSize.label}`,
                    category: item.category,
                    selectedSize: selectedSize.id,
                    pieces: selectedSize.pieces,
                    unitPrice: selectedSize.price,
                    selectedPieces: selectedPieces.length > 0 ? selectedPieces.join('، ') : undefined,
                  });
                  onUpdateQty(cartItemId, 1);
                  toast.success('تم تحديث الكمية');
                }}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Button
              onClick={() => {
                if (!selectedSize) return;
                if (requiresPiece && selectedPieces.length === 0) {
                  setShowPieceWarning(true);
                  toast.error('اختر نوع الحبات أولاً');
                  return;
                }
                onAdd({
                  itemId: item.id,
                  name: `${item.name} - ${selectedSize.label}`,
                  category: item.category,
                  selectedSize: selectedSize.id,
                  pieces: selectedSize.pieces,
                  unitPrice: selectedSize.price,
                  selectedPieces: selectedPieces.length > 0 ? selectedPieces.join('، ') : undefined,
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

// ── Card for fixed-price items (m3, m4) — no size selector ───────────────────
function MahasshiFixedCard({
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
  const qty = getItemQuantity(item.id);

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
          {item.description && (
            <p className="text-white/75 text-xs mt-0.5">{item.description}</p>
          )}
        </div>
      </div>

      <div className="p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">السعر</p>
          <p className="text-xl font-bold text-primary">{formatPrice(item.price || 0)}</p>
        </div>

        {qty > 0 ? (
          <div className="flex items-center gap-3 bg-background rounded-full p-1 border border-primary/20">
            <button
              onClick={() => {
                onUpdateQty(item.id, -1);
                if (qty === 1) toast.success('تم حذف الصنف من السلة');
                else toast.success('تم تحديث الكمية');
              }}
              className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="font-bold w-6 text-center text-lg">{qty}</span>
            <button
              onClick={() => { onUpdateQty(item.id, 1); toast.success('تم تحديث الكمية'); }}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <Button
            onClick={() => {
              onAdd({ itemId: item.id, name: item.name, category: item.category, unitPrice: item.price || 0 });
              toast.success('تمت إضافة الصنف إلى السلة');
            }}
            className="rounded-full px-8 h-12 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 text-base transition-all active:scale-95"
          >
            إضافة
          </Button>
        )}
      </div>
    </div>
  );
}
