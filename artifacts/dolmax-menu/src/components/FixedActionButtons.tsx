import { Phone, MessageCircle } from 'lucide-react';

export function FixedActionButtons() {
  return (
    <div className="fixed safe-bottom-offset-lg left-4 right-4 z-40 flex justify-between pointer-events-none mx-auto max-w-md">
      <a 
        href="https://wa.me/9647719461693" 
        target="_blank" 
        rel="noopener noreferrer"
        className="pointer-events-auto w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
      
      <a 
        href="tel:07719461693"
        className="pointer-events-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform"
      >
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
}
