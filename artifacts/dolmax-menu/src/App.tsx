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
import { SimpleGridSection } from "./components/SimpleGridSection";
import { RefreshingSection } from "./components/RefreshingSection";
import { InstagramSection } from "./components/InstagramSection";
import { CartDrawer } from "./components/CartDrawer";
import { FloatingCartButton } from "./components/FloatingCartButton";
import { FixedActionButtons } from "./components/FixedActionButtons";

import { menuData } from "./data/menuData";
import { useCart } from "./hooks/useCart";

const queryClient = new QueryClient();

const SECTION_IDS = ['fatta', 'mahashi', 'grape_leaves', 'drinks', 'sauces', 'refreshing'];

function MenuApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cart = useCart();

  const handleSelectCategory = (category: string) => {
    setActiveCategory(category);
    if (category === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(category);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -55% 0px' }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return menuData;
    const q = searchQuery.trim();
    return menuData.filter(item =>
      item.name.includes(q) || (item.description && item.description.includes(q))
    );
  }, [searchQuery]);

  const byCategory = (cat: string) => filteredData.filter(i => i.category === cat);

  const featuredItems = [
    menuData.find(i => i.id === 'm2')!,
    menuData.find(i => i.id === 'g2')!,
  ].filter(Boolean);

  const noResults = searchQuery.trim() && filteredData.length === 0;

  return (
    <div className="min-h-[100dvh] pb-36" dir="rtl">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {!searchQuery && (
        <CategoryNav
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      <main className="max-w-md mx-auto mt-2">
        {noResults ? (
          <div className="text-center py-20 px-4">
            <div className="w-20 h-20 rounded-full bg-card border border-border/40 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground">لم نعثر على أطباق مطابقة. جرب كلمة أخرى.</p>
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
              items={byCategory('fatta')}
              getItemQuantity={cart.getItemQuantity}
              onAdd={cart.addToCart}
              onUpdateQty={cart.updateQuantity}
            />

            <MahasshiSection
              items={byCategory('mahashi')}
              getItemQuantity={cart.getItemQuantity}
              onAdd={cart.addToCart}
              onUpdateQty={cart.updateQuantity}
            />

            <GrapeLeafSection
              items={byCategory('grape_leaves')}
              getItemQuantity={cart.getItemQuantity}
              onAdd={cart.addToCart}
              onUpdateQty={cart.updateQuantity}
            />

            <SimpleGridSection
              id="drinks"
              title="المشروبات"
              items={byCategory('drinks')}
              getItemQuantity={cart.getItemQuantity}
              onAdd={cart.addToCart}
              onUpdateQty={cart.updateQuantity}
            />

            <SimpleGridSection
              id="sauces"
              title="الصوص"
              items={byCategory('sauces')}
              getItemQuantity={cart.getItemQuantity}
              onAdd={cart.addToCart}
              onUpdateQty={cart.updateQuantity}
            />

            <RefreshingSection
              items={byCategory('refreshing')}
              getItemQuantity={cart.getItemQuantity}
              onAdd={cart.addToCart}
              onUpdateQty={cart.updateQuantity}
            />

            {!searchQuery && <InstagramSection />}
          </>
        )}
      </main>

      <footer className="mt-12 py-8 text-center border-t border-border/20 px-4">
        <p className="font-bold text-xl text-primary mb-1">DOLMIX</p>
        <p className="text-sm text-muted-foreground italic">تجربة سوف تحكي عنها لاحفادك.</p>
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
        <Toaster position="top-center" dir="rtl" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
