import { Phone, MessageCircle } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';

export function FixedActionButtons() {
  const { data } = useMenu();
  const settings = (data?.settings ?? {}) as { whatsapp_number?: string; phone_number?: string };
  const whatsapp = settings.whatsapp_number || '9647719461693';
  const phone = settings.phone_number || '07719461693';

  return (
    <div className="fixed safe-bottom-offset-lg left-4 right-4 z-40 flex justify-between pointer-events-none mx-auto max-w-md">
      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      <a
        href={`tel:${phone}`}
        className="pointer-events-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform"
      >
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
}
