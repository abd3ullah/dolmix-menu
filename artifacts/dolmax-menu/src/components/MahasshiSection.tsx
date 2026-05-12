import { useEffect, useMemo, useState } from 'react';
import { MenuItem } from '../data/menuData';
import { formatPrice } from '../lib/format';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CartItem, cartLineId } from '../hooks/useCart';
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

/**
 * Spread `total` pieces across `types` as evenly as possible. Any remainder is
 * given to the first types (so 14 / 3 → [5, 5, 4]).
 */
function autoDistribute(total: number, types: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  const n = types.length;
  if (n === 0 || total <= 0) return out;
  const base = Math.floor(total / n);
  const remainder = total - base * n;
  types.forEach((t, i) => {
    out[t] = base + (i < remainder ? 1 : 0);
  });
  return out;
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
  const requiresSize = !!item.requiresSize;
  const [selectedSizeId, setSelectedSizeId] = useState<string>(requiresSize ? '' : (item.sizes?.[0]?.id || ''));
  const [selectedPieces, setSelectedPieces] = useState<string[]>([]);
  const [showPieceWarning, setShowPieceWarning] = useState(false);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [showDistWarning, setShowDistWarning] = useState(false);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const selectedSize = item.sizes?.find(s => s.id === selectedSizeId);
  const hasPieceOptions = !!(item.pieceOptions && item.pieceOptions.length > 0);
  const requiresPiece = hasPieceOptions && item.pieceOptionsRequired !== false;

  // Distribution is only meaningful when the customer picked more than one
  // type AND the size has a known piece count to split across them.
  const totalPieces = selectedSize?.pieces ?? 0;
  const needsDistribution = hasPieceOptions && selectedPieces.length > 1 && totalPieces > 0;

  // Stable dep key so the auto-distribute effect re-runs only when the *set*
  // of selected types or the total piece count actually changes — not on
  // every parent re-render that hands us a new array reference.
  const piecesKey = useMemo(
    () => [...selectedPieces].sort().join('|'),
    [selectedPieces],
  );

  useEffect(() => {
    if (!needsDistribution) {
      // collapse the distribution UI / state when not applicable
      if (Object.keys(distribution).length > 0) setDistribution({});
      setShowDistWarning(false);
      return;
    }
    // Reset to an even split whenever the selected set or the total changes.
    // The user can then adjust manually with the steppers.
    setDistribution(autoDistribute(totalPieces, selectedPieces));
    setShowDistWarning(false);
    // intentionally only depend on the stable keys, not on `distribution` itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piecesKey, totalPieces, needsDistribution]);

  const distributionSum = useMemo(
    () => Object.values(distribution).reduce((a, b) => a + b, 0),
    [distribution],
  );
  const distributionValid = !needsDistribution || distributionSum === totalPieces;

  const togglePiece = (piece: string) => {
    setSelectedPieces(prev =>
      prev.includes(piece) ? prev.filter(p => p !== piece) : [...prev, piece]
    );
    setShowPieceWarning(false);
    setShowDistWarning(false);
  };

  const adjustDistribution = (piece: string, delta: number) => {
    setDistribution(prev => {
      const current = prev[piece] ?? 0;
      const next = Math.max(0, Math.min(totalPieces, current + delta));
      if (next === current) return prev;
      setShowDistWarning(false);
      return { ...prev, [piece]: next };
    });
  };

  // The piece-distribution map we'd actually attach to the cart item *right
  // now*, given the current selection. Recomputed each render so the cart-id
  // we use to look up the existing quantity matches what addToCart will write.
  const currentDistribution: Record<string, number> | undefined = useMemo(() => {
    if (needsDistribution) return { ...distribution };
    if (selectedPieces.length === 1 && totalPieces > 0) {
      // Single-type case: implicitly all pieces go to that one type. We still
      // record it so (a) the kitchen sees a breakdown, and (b) two single-type
      // selections with different types are kept as separate cart lines.
      return { [selectedPieces[0]!]: totalPieces };
    }
    return undefined;
  }, [needsDistribution, distribution, selectedPieces, totalPieces]);

  // Canonical id for the line this card would touch — shared with useCart so
  // the +/- controls and the addToCart merge agree on which line is "this one".
  const cartItemId = selectedSizeId
    ? cartLineId(item.id, selectedSizeId, currentDistribution)
    : '';
  const qty = cartItemId ? getItemQuantity(cartItemId) : 0;

  const buildCartPayload = (): Omit<CartItem, 'quantity' | 'id'> | null => {
    if (!selectedSize) return null;
    return {
      itemId: item.id,
      name: `${item.name} - ${selectedSize.label}`,
      category: item.category,
      selectedSize: selectedSize.id,
      pieces: selectedSize.pieces,
      unitPrice: selectedSize.price,
      selectedPieces: selectedPieces.length > 0 ? selectedPieces.join('، ') : undefined,
      pieceDistribution: currentDistribution,
    };
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
        <div
          className={cn(
            "mb-4 rounded-xl transition-all duration-300",
            showSizeWarning && "ring-2 ring-red-400/70 ring-offset-2 ring-offset-card p-2 -m-2 animate-pulse"
          )}
        >
          <p className="text-xs font-semibold text-primary mb-2">اختر الحجم:</p>
          <div className="flex flex-col gap-1.5">
            {item.sizes?.map(size => (
              <button
                key={size.id}
                onClick={() => { setSelectedSizeId(size.id); setShowSizeWarning(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95",
                  selectedSizeId === size.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-foreground border-border/50 hover:border-primary/50"
                )}
              >
                <span className="font-bold">{size.label}</span>
                <span className={cn(
                  "flex items-center gap-2",
                  selectedSizeId === size.id ? "opacity-95" : "opacity-70"
                )}>
                  {size.pieces > 0 && (
                    <span>{size.pieces} حبة</span>
                  )}
                  <span className={cn(
                    "font-bold",
                    selectedSizeId === size.id ? "text-primary-foreground" : "text-primary"
                  )}>{formatPrice(size.price)}</span>
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

        {/* Piece type selector — only for items that have pieceOptions */}
        {hasPieceOptions && (
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

        {/* Per-type piece distribution — only when 2+ types selected */}
        {needsDistribution && (
          <div
            className={cn(
              "mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3 transition-all duration-300",
              showDistWarning && !distributionValid && "ring-2 ring-red-400/70 ring-offset-2 ring-offset-card animate-pulse",
            )}
          >
            <div className="flex items-center justify-between mb-2 gap-2">
              <p className="text-xs font-semibold text-primary">حدد عدد الحبات لكل نوع:</p>
              <span
                className={cn(
                  "text-xs font-bold tabular-nums",
                  distributionValid ? "text-primary" : "text-red-400",
                )}
              >
                {distributionSum} / {totalPieces}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              يجب أن يساوي مجموع الحبات العدد المختار
            </p>
            <div className="flex flex-col gap-1.5">
              {selectedPieces.map(piece => {
                const value = distribution[piece] ?? 0;
                return (
                  <div
                    key={piece}
                    className="flex items-center justify-between gap-2 bg-background border border-border/50 rounded-xl px-3 py-1.5"
                  >
                    <span className="text-sm font-bold text-foreground truncate">{piece}</span>
                    <div className="flex items-center gap-2 bg-card rounded-full p-1 border border-border/40 shrink-0">
                      <button
                        type="button"
                        aria-label={`إنقاص ${piece}`}
                        onClick={() => adjustDistribution(piece, -1)}
                        disabled={value <= 0}
                        className="w-7 h-7 rounded-full bg-background flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold w-6 text-center text-sm tabular-nums">{value}</span>
                      <button
                        type="button"
                        aria-label={`زيادة ${piece}`}
                        onClick={() => adjustDistribution(piece, +1)}
                        disabled={value >= totalPieces}
                        className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {showDistWarning && !distributionValid && (
              <p className="mt-2 text-xs font-bold text-red-400 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                يجب أن يساوي مجموع الحبات العدد المختار
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
                  if (needsDistribution && !distributionValid) {
                    setShowDistWarning(true);
                    toast.error('يجب أن يساوي مجموع الحبات العدد المختار');
                    return;
                  }
                  const payload = buildCartPayload();
                  if (!payload) return;
                  onAdd(payload);
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
                if (requiresSize && !selectedSize) {
                  setShowSizeWarning(true);
                  toast.error('اختر الحجم أولاً');
                  return;
                }
                if (!selectedSize) return;
                if (requiresPiece && selectedPieces.length === 0) {
                  setShowPieceWarning(true);
                  toast.error('اختر نوع الحبات أولاً');
                  return;
                }
                if (needsDistribution && !distributionValid) {
                  setShowDistWarning(true);
                  toast.error('يجب أن يساوي مجموع الحبات العدد المختار');
                  return;
                }
                const payload = buildCartPayload();
                if (!payload) return;
                onAdd(payload);
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
