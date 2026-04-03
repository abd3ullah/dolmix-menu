import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  return (
    <header className="relative pt-12 pb-8 px-4 text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10 max-w-md mx-auto">
        <h1 className="text-5xl font-bold text-primary mb-2 tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          دولمكس
        </h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px bg-primary/30 w-12" />
          <p className="text-primary/80 text-sm font-medium">أصالة المذاق العراقي</p>
          <div className="h-px bg-primary/30 w-12" />
        </div>

        <div className="relative mt-8">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input 
            type="search" 
            placeholder="ابحث عن طبقك المفضل..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 h-12 bg-card/50 border-primary/20 focus-visible:ring-primary rounded-full text-base placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </header>
  );
}
