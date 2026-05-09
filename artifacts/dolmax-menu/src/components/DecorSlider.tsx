import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface DecorSliderProps {
  images: string[];
  variant?: 'opening' | 'closing';
  intervalMs?: number;
  className?: string;
}

export function DecorSlider({
  images,
  variant = 'opening',
  intervalMs = 4500,
  className,
}: DecorSliderProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const count = images.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (isPaused || count <= 1) return;
    const id = window.setInterval(() => {
      setIndex(i => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [isPaused, count, intervalMs]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setIsPaused(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const onTouchEnd = () => {
    const dx = touchDeltaX.current;
    const threshold = 40;
    if (Math.abs(dx) > threshold) {
      // In RTL, a leftward swipe (dx < 0) should advance forward
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
    // Resume auto-advance shortly after the user stops interacting
    window.setTimeout(() => setIsPaused(false), 800);
  };

  const aspect = variant === 'opening' ? '62%' : '58%';

  return (
    <div
      className={cn(
        'max-w-md mx-auto px-4',
        variant === 'opening' ? 'mt-3 mb-2' : 'my-6',
        className
      )}
      aria-hidden="true"
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-primary/15 shadow-lg shadow-black/30 ring-1 ring-primary/10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative w-full" style={{ paddingBottom: aspect }}>
          {/* Sliding track — kept LTR so translateX behaves predictably */}
          <div
            dir="ltr"
            className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
            style={{ transform: `translateX(-${index * 100}%)` }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {images.map((src, i) => (
              <div key={i} className="relative shrink-0 w-full h-full">
                <img
                  src={src}
                  alt=""
                  loading={i === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.onerror = null;
                    t.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>

          {/* Soft top/bottom gradient for premium depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

          {/* Subtle inner gold ring */}
          <div className="absolute inset-0 ring-1 ring-inset ring-primary/10 rounded-2xl pointer-events-none" />

          {/* Dots */}
          {count > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    goTo(i);
                    setIsPaused(true);
                    window.setTimeout(() => setIsPaused(false), 1200);
                  }}
                  aria-label={`صورة ${i + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === index
                      ? 'w-5 bg-primary shadow-sm shadow-primary/40'
                      : 'w-1.5 bg-white/60 hover:bg-white/80'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
