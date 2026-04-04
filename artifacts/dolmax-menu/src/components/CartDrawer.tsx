import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: ReturnType<typeof useCart>;
}

export function CartDrawer({ open, onOpenChange, cart }: CartDrawerProps) {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = cart;
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleCheckout = () => {
    if (!name || !phone) {
      toast.error('يرجى إدخال الاسم ورقم الهاتف');
      return;
    }

    let orderText = `🌿 طلب جديد من دولمكس\n\n`;
    orderText += `الاسم: ${name}\n`;
    orderText += `رقم الهاتف: ${phone}\n\n`;
    orderText += `الطلبات:\n`;
    
    items.forEach((item, index) => {
      orderText += `${index + 1}. ${item.name} × ${item.quantity} = ${formatPrice(item.unitPrice * item.quantity)}\n`;
    });

    orderText += `\nالمجموع الكلي: ${formatPrice(totalPrice)}\n`;
    
    if (notes) {
      orderText += `\nملاحظات:\n${notes}\n`;
    }

    const encodedText = encodeURIComponent(orderText);
    window.open(`https://wa.me/9647719461693?text=${encodedText}`, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl bg-background border-border p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border/50 text-right">
          <SheetTitle className="text-2xl font-bold text-primary flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" />
              سلة الطلبات
            </div>
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                تفريغ السلة
              </Button>
            )}
          </SheetTitle>
          <SheetDescription className="hidden">سلة طلبات دولمكس</SheetDescription>
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
                    <h4 className="font-bold text-foreground mb-1">{item.name}</h4>
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

              <div className="mt-8 bg-card border border-primary/20 rounded-2xl p-4 shadow-md">
                <h3 className="font-bold text-lg mb-4 text-primary border-b border-border/50 pb-2">معلومات الطلب</h3>
                <div className="space-y-3">
                  <div>
                    <Input 
                      placeholder="الاسم الكريم" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Input 
                      placeholder="رقم الهاتف (مثال: 0770...)" 
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="bg-background border-border text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Textarea 
                      placeholder="ملاحظات إضافية (اختياري)" 
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="bg-background border-border resize-none min-h-[80px]"
                    />
                  </div>
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
