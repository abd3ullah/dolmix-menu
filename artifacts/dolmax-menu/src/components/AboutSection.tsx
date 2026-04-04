import { MapPin, ExternalLink } from 'lucide-react';

export function AboutSection() {
  return (
    <section className="py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-primary/30 shadow-xl bg-card">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5 pointer-events-none" />

          <div className="relative z-10 p-6 flex flex-col gap-5">
            <h2 className="text-xl font-bold text-primary text-center flex items-center gap-3 justify-center">
              <span className="flex-1 h-px bg-primary/30" />
              نبذة عن DOLMIX
              <span className="flex-1 h-px bg-primary/30" />
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed text-right" dir="rtl">
              في DOLMIX نقدّم تجربة مميزة لعشّاق ورق العنب، المحاشي، الفتة، والنكهات الخاصة، بأسلوب يجمع بين الطعم الأصيل والتقديم العصري.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed text-right" dir="rtl">
              نحرص على الجودة في المكونات، والدقة في التحضير، والاهتمام بالتفاصيل التي تجعل كل زيارة أو طلب تجربة تستحق التكرار.
            </p>

            <div className="flex items-start gap-2 bg-background/60 rounded-xl border border-border/40 px-4 py-3">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div dir="rtl">
                <p className="text-xs text-muted-foreground mb-0.5">العنوان</p>
                <p className="text-sm font-bold text-foreground">كركوك - شارع المحافظة</p>
              </div>
            </div>

            <a
              href="https://maps.app.goo.gl/8k6eM4B6Zijg9HXD7"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
            >
              <MapPin className="w-5 h-5 shrink-0" />
              افتح الموقع على الخريطة
              <ExternalLink className="w-4 h-4 shrink-0 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
