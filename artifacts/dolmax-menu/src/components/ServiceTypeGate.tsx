import { useState } from 'react';
import { Truck, ShoppingBag, Utensils, ArrowRight } from 'lucide-react';

export type ServiceType = 'توصيل' | 'سفري' | 'صالة';

export interface ServiceInfo {
  serviceType: ServiceType;
  tableNumber?: number;
}

interface ServiceTypeGateProps {
  onComplete: (info: ServiceInfo) => void;
}

const SERVICE_OPTIONS: { type: ServiceType; subtitle: string; Icon: typeof Truck }[] = [
  { type: 'توصيل', subtitle: 'طلب يصلك إلى موقعك', Icon: Truck },
  { type: 'سفري',  subtitle: 'استلام الطلب من المطعم', Icon: ShoppingBag },
  { type: 'صالة',  subtitle: 'تناول الطعام داخل المطعم', Icon: Utensils },
];

const TABLE_COUNT = 10;

export function ServiceTypeGate({ onComplete }: ServiceTypeGateProps) {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const handleServiceClick = (type: ServiceType) => {
    if (type === 'صالة') {
      setSelectedService('صالة');
    } else {
      onComplete({ serviceType: type });
    }
  };

  const handleTableConfirm = () => {
    if (selectedService === 'صالة' && selectedTable !== null) {
      onComplete({ serviceType: 'صالة', tableNumber: selectedTable });
    }
  };

  const showTableStep = selectedService === 'صالة';

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] min-h-[100dvh] bg-background flex items-center justify-center px-4 py-8 overflow-y-auto"
    >
      <div className="w-full max-w-md mx-auto">
        {/* Brand header */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.4em] text-primary/60 uppercase mb-2">Welcome to</p>
          <h1 className="text-4xl font-extrabold text-primary mb-1">DOLMIX</h1>
          <p className="text-sm text-muted-foreground italic">دولمكس</p>
          <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </div>

        {!showTableStep ? (
          <>
            <h2 className="text-xl font-bold text-center text-foreground mb-1">اختر نوع الخدمة</h2>
            <p className="text-sm text-center text-muted-foreground mb-6">
              يرجى اختيار نوع الخدمة قبل تصفح القائمة
            </p>

            <div className="space-y-3">
              {SERVICE_OPTIONS.map(({ type, subtitle, Icon }) => (
                <button
                  key={type}
                  onClick={() => handleServiceClick(type)}
                  className="w-full group flex items-center gap-4 bg-card border border-border/60 hover:border-primary/60 active:scale-[0.98] transition-all rounded-2xl p-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <span className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6" />
                  </span>
                  <span className="flex-1 text-right">
                    <span className="block text-lg font-bold text-foreground">{type}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{subtitle}</span>
                  </span>
                  <ArrowRight className="w-5 h-5 text-primary/60 rotate-180 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-center text-foreground mb-1">اختر رقم الطاولة</h2>
            <p className="text-sm text-center text-muted-foreground mb-6">
              من فضلك اختر الطاولة التي تجلس عليها
            </p>

            <div className="grid grid-cols-5 gap-3 mb-6">
              {Array.from({ length: TABLE_COUNT }, (_, i) => i + 1).map((num) => {
                const isSelected = selectedTable === num;
                return (
                  <button
                    key={num}
                    onClick={() => setSelectedTable(num)}
                    className={`aspect-square rounded-xl border-2 font-extrabold text-xl flex items-center justify-center transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30'
                        : 'bg-card text-foreground border-border/60 hover:border-primary/60'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleTableConfirm}
                disabled={selectedTable === null}
                className="w-full h-14 rounded-xl font-bold text-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {selectedTable !== null ? `تأكيد - طاولة رقم ${selectedTable}` : 'اختر طاولة للمتابعة'}
              </button>
              <button
                onClick={() => {
                  setSelectedService(null);
                  setSelectedTable(null);
                }}
                className="w-full h-11 rounded-xl font-medium text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← الرجوع لاختيار نوع الخدمة
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
