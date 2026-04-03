import { useState, useMemo, useEffect } from 'react';
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Header } from "./components/Header";
import { CategoryNav } from "./components/CategoryNav";
import { FeaturedSection } from "./components/FeaturedSection";
import { FattaSection } from "./components/FattaSection";
import { MahasshiSection } from "./components/MahasshiSection";
import { GrapeLeafSection } from "./components/GrapeLeafSection";
import { CartDrawer } from "./components/CartDrawer";
import { FloatingCartButton } from "./components/FloatingCartButton";
import { FixedActionButtons } from "./components/FixedActionButtons";

import { menuData } from "./data/menuData";
import { useCart } from "./hooks/useCart";

const queryClient = new QueryClient();

function MenuApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cart = useCart();

  // Scroll to section handling
  const handleSelectCategory = (category: string) => {
    setActiveCategory(category);
    if (category === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(category);
      if (el) {
        // Offset for the sticky header
        const y = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  // Intersection observer to highlight active tab
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    const sections = ['fatta', 'mahashi', 'grape_leaves'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery) return menuData;
    return menuData.filter(item => 
      item.name.includes(searchQuery) || 
      (item.description && item.description.includes(searchQuery))
    );
  }, [searchQuery]);

  const fattaItems = filteredData.filter(item => item.category === 'fatta');
  const mahashiItems = filteredData.filter(item => item.category === 'mahashi');
  const grapeLeavesItems = filteredData.filter(item => item.category === 'grape_leaves');

  // Select a few featured items
  const featuredItems = [
    menuData.find(i => i.id === 'm2')!, // مشكل دبس الرمان مع لحم
    menuData.find(i => i.id === 'g2')!, // ورق عنب دبس رمان
  ].filter(Boolean);

  return (
    <div className="min-h-[100dvh] pb-32" dir="rtl">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {!searchQuery && (
        <CategoryNav 
          activeCategory={activeCategory} 
          onSelectCategory={handleSelectCategory} 
        />
      )}

      <main className="max-w-md mx-auto mt-6 space-y-8">
        {searchQuery && filteredData.length === 0 ? (
          <div className="text-center py-16 px-4">
            <h3 className="text-xl font-bold text-primary mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground">لم نتمكن من العثور على أطباق مطابقة لبحثك.</p>
          </div>
        ) : (
          <>
            {!searchQuery && (
              <FeaturedSection 
                items={featuredItems} 
                getItemQuantity={cart.getItemQuantity} 
                onAdd={cart.addToCart} 
                onUpdateQty={cart.updateQuantity} 
              />
            )}

            <FattaSection 
              items={fattaItems} 
              getItemQuantity={cart.getItemQuantity} 
              onAdd={cart.addToCart} 
              onUpdateQty={cart.updateQuantity} 
            />
            
            <MahasshiSection 
              items={mahashiItems} 
              getItemQuantity={cart.getItemQuantity} 
              onAdd={cart.addToCart} 
              onUpdateQty={cart.updateQuantity} 
            />

            <GrapeLeafSection 
              items={grapeLeavesItems} 
              getItemQuantity={cart.getItemQuantity} 
              onAdd={cart.addToCart} 
              onUpdateQty={cart.updateQuantity} 
            />
          </>
        )}
      </main>

      <footer className="mt-16 py-8 text-center text-muted-foreground border-t border-border/20">
        <p className="font-serif text-xl text-primary font-bold mb-2">دولمكس</p>
        <p className="text-sm">جميع الأسعار بالدينار العراقي</p>
      </footer>

      <FloatingCartButton 
        totalItems={cart.totalItems} 
        totalPrice={cart.totalPrice} 
        onClick={() => setIsCartOpen(true)} 
      />
      
      <FixedActionButtons />
      
      <CartDrawer 
        open={isCartOpen} 
        onOpenChange={setIsCartOpen} 
        cart={cart} 
      />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={MenuApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster position="top-center" dir="rtl" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
