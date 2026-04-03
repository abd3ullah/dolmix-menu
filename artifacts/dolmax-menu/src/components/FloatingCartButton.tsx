import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '../lib/format';

interface FloatingCartButtonProps {
  totalItems: number;
  totalPrice: number;
  onClick: () => void;
}

export function FloatingCartButton({ totalItems, totalPrice, onClick }: FloatingCartButtonProps) {
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <button
        onClick={onClick}
        className={cn(
          "pointer-events-auto w-full max-w-md bg-primary text-primary-foreground rounded-2xl p-4 shadow-xl shadow-primary/20",
          "flex items-center justify-between transition-transform hover:scale-[1.02] active:scale-[0.98]",
          "animate-in slide-in-from-bottom-10 fade-in duration-300"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-background text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 border-primary">
              {totalItems}
            </span>
          </div>
          <span className="font-bold text-lg">عرض السلة</span>
        </div>
        
        <div className="font-bold text-lg bg-primary-foreground/10 px-4 py-1.5 rounded-xl">
          {formatPrice(totalPrice)}
        </div>
      </button>
    </div>
  );
}
