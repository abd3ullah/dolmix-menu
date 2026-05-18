import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Minus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { MenuItem } from '../data/menuData';
import type { CartItem } from '../hooks/useCart';

interface ProductDetailsModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: Omit<CartItem, 'quantity' | 'id'>) => void;
}

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

export function ProductDetailsModal({ item, onClose, onAdd }: ProductDetailsModalProps) {
  const open = !!item;
  const requiresSize = !!item?.requiresSize;
  const hasSizes = !!(item?.sizes && item.sizes.length > 0);
  const hasPieceOptions = !!(item?.pieceOptions && item.pieceOptions.length > 0);
  const requiresPiece = hasPieceOptions && item?.pieceOptionsRequired !== false;

  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [selectedPieces, setSelectedPieces] = useState<string[]>([]);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [qty, setQty] = useState(1);

  // reset state whenever a new item opens
  useEffect(() => {
    if (!item) return;
    const initial = item.requiresSize ? '' : (item.sizes?.[0]?.id || '');
    setSelectedSizeId(initial);
    setSelectedPieces([]);
    setDistribution({});
    setQty(1);
  }, [item]);

  const selectedSize = item?.sizes?.find(s => s.id === selectedSizeId);
  const totalPieces = selectedSize?.pieces ?? 0;
  const needsDistribution = hasPieceOptions && selectedPieces.length > 1 && totalPieces > 0;

  // Auto-distribute pieces evenly when the selection set or piece total changes
  const piecesKey = useMemo(() => [...selectedPieces].sort().join('|'), [selectedPieces]);
  useEffect(() => {
    if (!needsDistribution) {
      setDistribution({});
      return;
    }
    setDistribution(autoDistribute(totalPieces, selectedPieces));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piecesKey, totalPieces, needsDistribution]);

  if (!item) return null;

  const unitPrice = hasSizes ? (selectedSize?.price ?? 0) : (item.price ?? 0);

  const distributionSum = Object.values(distribution).reduce((a, b) => a + b, 0);
  const distributionValid = !needsDistribution || distributionSum === totalPieces;

  const togglePiece = (p: string) => {
    setSelectedPieces(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const bumpDist = (p: string, delta: number) => {
    setDistribution(prev => {
      const cur = prev[p] ?? 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [p]: next };
    });
  };

  const handleAdd = () => {
    if (hasSizes && requiresSize && !selectedSize) {
      toast.error('يرجى اختيار الحجم');
      return;
    }
    if (requiresPiece && selectedPieces.length === 0) {
      toast.error('يرجى اختيار نوع الحبات');
      return;
    }
    if (!distributionValid) {
      toast.error(`يجب أن يكون مجموع التوزيع ${totalPieces}`);
      return;
    }

    const currentDistribution: Record<string, number> | undefined =
      needsDistribution
        ? distribution
        : (selectedPieces.length === 1 && totalPieces > 0
            ? { [selectedPieces[0]!]: totalPieces }
            : undefined);

    const payload: Omit<CartItem, 'quantity' | 'id'> = {
      itemId: item.id,
      name: selectedSize ? `${item.name} - ${selectedSize.label}` : item.name,
      category: item.category,
      unitPrice,
      ...(selectedSize ? { selectedSize: selectedSize.id, pieces: selectedSize.pieces } : {}),
      ...(selectedPieces.length > 0 ? { selectedPieces: selectedPieces.join('، ') } : {}),
      ...(currentDistribution ? { pieceDistribution: currentDistribution } : {}),
    };

    for (let i = 0; i < qty; i++) onAdd(payload);
    toast.success(qty > 1 ? `تمت إضافة ${qty} للسلة` : 'تمت إضافة الصنف إلى السلة');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        dir="rtl"
        className="max-w-md w-[calc(100%-1.5rem)] sm:w-full p-0 overflow-hidden rounded-3xl border-primary/30 bg-card text-foreground shadow-2xl shadow-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 [&>button.absolute]:hidden max-h-[92dvh] flex flex-col"
      >
        <DialogTitle className="sr-only">{item.name}</DialogTitle>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-3 left-3 z-20 inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 active:scale-95 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image — tap to close (matches reference video UX) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="relative w-full bg-muted shrink-0 block cursor-zoom-out focus:outline-none"
          style={{ aspectRatio: '4 / 3' }}
        >
          <img
            src={item.image}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const t = e.currentTarget;
              t.onerror = null;
              t.src = `https://placehold.co/600x450/1a3a22/c9a84c?text=${encodeURIComponent(item.name)}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 right-4 left-4 flex items-end justify-between gap-3 text-right">
            <h2 className="text-xl font-extrabold text-white drop-shadow-lg leading-tight">{item.name}</h2>
            {!hasSizes && (
              <span className="text-lg font-bold text-primary bg-black/40 px-3 py-1 rounded-full backdrop-blur-md shrink-0">
                {new Intl.NumberFormat('ar').format(unitPrice)} د.ع
              </span>
            )}
          </div>
        </button>

        {/* Body */}
        <div className="overflow-y-auto px-4 py-4 space-y-4 flex-1">
          {item.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          )}

          {/* Sizes */}
          {hasSizes && (
            <div>
              <p className="text-xs font-bold text-primary mb-2">
                الحجم {requiresSize && <span className="text-red-400">*</span>}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {item.sizes!.map(sz => (
                  <button
                    key={sz.id}
                    onClick={() => setSelectedSizeId(sz.id)}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-right transition active:scale-95',
                      selectedSizeId === sz.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border/60 hover:border-primary/40'
                    )}
                  >
                    <p className="text-sm font-bold">{sz.label}</p>
                    <p className={cn(
                      'text-xs',
                      selectedSizeId === sz.id ? 'text-primary-foreground/85' : 'text-muted-foreground'
                    )}>
                      {sz.pieces > 0 ? `${sz.pieces} حبة · ` : ''}
                      {new Intl.NumberFormat('ar').format(sz.price)} د.ع
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Piece options */}
          {hasPieceOptions && (
            <div>
              <p className="text-xs font-bold text-primary mb-2">
                نوع الحبات {requiresPiece && <span className="text-red-400">*</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {item.pieceOptions!.map(p => (
                  <button
                    key={p}
                    onClick={() => togglePiece(p)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-bold transition active:scale-95',
                      selectedPieces.includes(p)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border/60 hover:border-primary/40'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Distribution */}
          {needsDistribution && (
            <div className="rounded-xl border border-border/60 bg-background p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-primary">توزيع الحبات</p>
                <p className={cn(
                  'text-xs font-bold',
                  distributionValid ? 'text-primary' : 'text-red-400'
                )}>
                  {distributionSum} / {totalPieces}
                </p>
              </div>
              <div className="space-y-2">
                {selectedPieces.map(p => (
                  <div key={p} className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold flex-1 truncate">{p}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => bumpDist(p, -1)}
                        className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center active:scale-95"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold">{distribution[p] ?? 0}</span>
                      <button
                        onClick={() => bumpDist(p, 1)}
                        className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected size price */}
          {hasSizes && selectedSize && (
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
              <span className="text-xs text-muted-foreground">السعر</span>
              <span className="text-lg font-bold text-primary">
                {new Intl.NumberFormat('ar').format(unitPrice)} د.ع
              </span>
            </div>
          )}
        </div>

        {/* Footer: qty + add */}
        <div className="border-t border-border/40 p-3 flex items-center gap-3 bg-card">
          <div className="flex items-center gap-1 bg-background rounded-xl border border-border/60 p-1">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg bg-card flex items-center justify-center active:scale-95"
              aria-label="إنقاص"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold">{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center active:scale-95"
              aria-label="زيادة"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <Button
            onClick={handleAdd}
            disabled={hasSizes && requiresSize && !selectedSize}
            className="flex-1 h-12 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
          >
            إضافة للسلة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
