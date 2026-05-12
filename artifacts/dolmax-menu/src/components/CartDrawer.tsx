import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, Trash2, ShoppingBag, MapPin, Loader2, CheckCircle2, AlertCircle, Navigation, X } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../lib/format';
import { toast } from 'sonner';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: ReturnType<typeof useCart>;
}

type LocationState = 'idle' | 'loading' | 'success' | 'error';

interface LocationData {
  lat: number;
  lng: number;
  mapsUrl: string;
}

export function CartDrawer({ open, onOpenChange, cart }: CartDrawerProps) {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = cart;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState('');
  const [manualLocation, setManualLocation] = useState('');

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationState('error');
      setLocationError('المتصفح لا يدعم تحديد الموقع. يرجى إدخال موقعك يدوياً.');
      return;
    }
    setLocationState('loading');
    setLocationError('');
    setLocationData(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        setLocationData({ lat, lng, mapsUrl });
        setLocationState('success');
        toast.success('تم تحديد موقعك بنجاح');
      },
      (err) => {
        setLocationState('error');
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('تم رفض إذن الموقع. يرجى إدخال موقعك يدوياً أدناه.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError('تعذّر تحديد الموقع. تأكد من تفعيل GPS.');
        } else {
          setLocationError('انتهت مهلة الطلب. يرجى المحاولة مجدداً أو الإدخال يدوياً.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCheckout = () => {
    if (!name || !phone) {
      toast.error('يرجى إدخال الاسم ورقم الهاتف');
      return;
    }

    const hasAutoLocation = locationState === 'success' && locationData;
    const hasManualLocation = manualLocation.trim().length > 0;

    if (!hasAutoLocation && !hasManualLocation) {
      toast.error('يرجى تحديد موقعك أو إدخاله يدوياً قبل إرسال الطلب');
      return;
    }

    let orderText = `🌿 طلب جديد من DOLMIX\n\n`;
    orderText += `الاسم: ${name}\n`;
    orderText += `رقم الهاتف: ${phone}\n\n`;
    orderText += `الطلبات:\n`;

    items.forEach((item, index) => {
      orderText += `${index + 1}. ${item.name} × ${item.quantity} = ${formatPrice(item.unitPrice * item.quantity)}\n`;
      if (item.selectedPieces) {
        orderText += `   - الحبات المختارة: ${item.selectedPieces}\n`;
      }
    });

    orderText += `\nالمجموع الكلي: ${formatPrice(totalPrice)}\n`;

    if (notes) {
      orderText += `\nملاحظات:\n${notes}\n`;
    }

    if (hasAutoLocation && locationData) {
      orderText += `\n📍 الموقع:\n${locationData.mapsUrl}\n`;
    } else if (hasManualLocation) {
      orderText += `\n📍 الموقع:\n${manualLocation.trim()}\n`;
    }

    const encodedText = encodeURIComponent(orderText);
    window.open(`https://wa.me/9647719461693?text=${encodedText}`, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85dvh] sm:h-auto sm:max-h-[90dvh] rounded-t-3xl bg-background border-border p-0 flex flex-col [&>button.absolute]:hidden">
        <SheetHeader className="px-4 py-3 border-b border-border/50">
          <div className="flex items-center justify-between gap-4 sm:gap-6 min-h-[44px]">
            {/* Close button (start side in RTL = visually right) */}
            <SheetClose
              aria-label="إغلاق"
              className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full bg-card text-foreground border border-border/60 shadow-sm hover:bg-muted active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <X className="w-5 h-5" />
            </SheetClose>

            {/* Centered title */}
            <SheetTitle className="flex-1 m-0 text-xl sm:text-2xl font-bold text-primary flex items-center justify-center gap-2 whitespace-nowrap">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              سلة الطلبات
            </SheetTitle>

            {/* Clear cart button (end side in RTL = visually left) */}
            {items.length > 0 ? (
              <button
                onClick={clearCart}
                aria-label="تفريغ السلة"
                className="shrink-0 inline-flex items-center gap-1.5 h-11 px-3 rounded-full bg-destructive/15 text-destructive border border-destructive/40 font-bold text-xs sm:text-sm shadow-sm hover:bg-destructive/25 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-destructive/40"
              >
                <Trash2 className="w-4 h-4" />
                <span>تفريغ السلة</span>
              </button>
            ) : (
              <span className="shrink-0 w-11 h-11" aria-hidden="true" />
            )}
          </div>
          <SheetDescription className="hidden">سلة طلبات DOLMIX</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-12">
              <ShoppingBag className="w-16 h-16 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">سلتك فارغة</h3>
              <p>أضف بعض الأطباق الشهية للبدء</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-card p-3 rounded-xl border border-border/50 flex gap-3 shadow-sm">
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-0.5">{item.name}</h4>
                    {item.selectedPieces && (
                      <p className="text-xs text-muted-foreground mb-1">الحبات: {item.selectedPieces}</p>
                    )}
                    <p className="text-primary font-semibold">{formatPrice(item.unitPrice)}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 bg-background rounded-lg border border-border/50 p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded bg-card flex items-center justify-center text-foreground hover:bg-muted"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* ── Order Info Form ── */}
              <div className="mt-8 bg-card border border-primary/20 rounded-2xl p-4 shadow-md">
                <h3 className="font-bold text-lg mb-4 text-primary border-b border-border/50 pb-2">معلومات الطلب</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="الاسم الكريم"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-background border-border"
                  />
                  <Input
                    placeholder="رقم الهاتف (مثال: 0770...)"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="bg-background border-border text-right"
                    dir="rtl"
                  />

                  {/* ── Location Section ── */}
                  <div className="rounded-xl border border-border/60 bg-background overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-card/50">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-bold text-foreground">الموقع</span>
                      <span className="text-xs text-muted-foreground mr-auto">مطلوب</span>
                    </div>

                    <div className="p-3 space-y-3">
                      <button
                        onClick={handleFetchLocation}
                        disabled={locationState === 'loading'}
                        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                          background: locationState === 'success'
                            ? 'hsl(142 72% 29% / 0.15)'
                            : 'hsl(var(--primary) / 0.12)',
                          border: locationState === 'success'
                            ? '1px solid hsl(142 72% 29% / 0.4)'
                            : '1px solid hsl(var(--primary) / 0.3)',
                          color: locationState === 'success'
                            ? 'hsl(142 72% 40%)'
                            : 'hsl(var(--primary))',
                        }}
                      >
                        {locationState === 'loading' ? (
                          <><Loader2 className="w-4 h-4 animate-spin" />جاري تحديد الموقع...</>
                        ) : locationState === 'success' ? (
                          <><CheckCircle2 className="w-4 h-4" />تم تحديد الموقع — اضغط لتحديثه</>
                        ) : (
                          <><Navigation className="w-4 h-4" />جلب موقعي تلقائياً</>
                        )}
                      </button>

                      {locationState === 'success' && locationData && (
                        <div className="rounded-lg bg-green-950/30 border border-green-800/30 p-3 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-green-400 mb-1">تم تحديد موقعك بنجاح</p>
                            <a href={locationData.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline break-all">
                              عرض على خرائط جوجل ↗
                            </a>
                          </div>
                        </div>
                      )}

                      {locationState === 'error' && (
                        <div className="rounded-lg bg-red-950/30 border border-red-800/30 p-3 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-300">{locationError}</p>
                        </div>
                      )}

                      {(locationState === 'error' || locationState === 'idle') && (
                        <Input
                          placeholder="أو أدخل موقعك يدوياً (مثال: بغداد، الكرادة)"
                          value={manualLocation}
                          onChange={e => setManualLocation(e.target.value)}
                          className="bg-card border-border text-sm h-10"
                          dir="rtl"
                        />
                      )}
                    </div>
                  </div>

                  <Textarea
                    placeholder="ملاحظات إضافية (اختياري)"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="bg-background border-border resize-none min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border/50 bg-background pb-safe">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">المجموع الكلي:</span>
              <span className="font-bold text-2xl text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full h-14 text-lg font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow-lg shadow-[#25D366]/20"
            >
              إرسال الطلب عبر واتساب
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
