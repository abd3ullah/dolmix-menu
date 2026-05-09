import { cn } from '@/lib/utils';

interface DecorBannerProps {
  src: string;
  alt?: string;
  variant?: 'hero' | 'divider' | 'closing';
  className?: string;
}

export function DecorBanner({
  src,
  alt = '',
  variant = 'divider',
  className,
}: DecorBannerProps) {
  const aspect =
    variant === 'hero'
      ? 'paddingBottom: 62%'
      : variant === 'closing'
      ? 'paddingBottom: 58%'
      : 'paddingBottom: 50%';

  return (
    <div
      className={cn(
        'max-w-md mx-auto px-4',
        variant === 'hero' ? 'mt-3 mb-2' : 'my-6',
        className
      )}
      aria-hidden="true"
    >
      <div className="relative w-full overflow-hidden rounded-2xl border border-primary/15 shadow-lg shadow-black/30 ring-1 ring-primary/10">
        <div className="relative w-full" style={{ paddingBottom: aspect.split(': ')[1] }}>
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const t = e.currentTarget;
              t.onerror = null;
              t.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
          <div className="absolute inset-0 ring-1 ring-inset ring-primary/10 rounded-2xl pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
