import { useState, useMemo, useEffect, useRef } from 'react';
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Header } from "./components/Header";
import { CategoryNav } from "./components/CategoryNav";
import { FeaturedSection } from "./components/FeaturedSection";
import { FattaSection } from "./components/FattaSection";
import { MahasshiSection } from "./components/MahasshiSection";
import { GrapeLeafSection } from "./components/GrapeLeafSection";
import { DolmaSection } from "./components/DolmaSection";
import { PilavSection } from "./components/PilavSection";
import { FettuccineSection } from "./components/FettuccineSection";
import { SimpleGridSection } from "./components/SimpleGridSection";
import { RefreshingSection } from "./components/RefreshingSection";
import { AboutSection } from "./components/AboutSection";
import { InstagramSection } from "./components/InstagramSection";
import { CartDrawer } from "./components/CartDrawer";
import { FloatingCartButton } from "./components/FloatingCartButton";
import { FixedActionButtons } from "./components/FixedActionButtons";
import { DecorSlider } from "./components/DecorSlider";
import { ServiceTypeGate, type ServiceInfo } from "./components/ServiceTypeGate";
import { ProductDetailsModal } from "./components/ProductDetailsModal";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const DECOR_IMAGES = [1, 2, 3, 4].map(n => `${BASE}/images/decor-${n}.jpg`);

import type { MenuItem } from "./data/menuData";
import { useCart } from "./hooks/useCart";
import { useMenu } from "./hooks/useMenu";
import { AdminApp } from "./admin/AdminApp";

const queryClient = new QueryClient();

// Categories rendered as on-page sections, plus the static "about" anchor at
// the bottom. The active scroll-spy list is computed dynamically from the live
// menu payload so newly added/removed categories work without a code change.
const STATIC_TRAILING_SECTIONS = ["about"] as const;

function MenuApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const cart = useCart();
  const { data: menuPayload, isLoading: menuLoading } = useMenu();
  const menuData: MenuItem[] = menuPayload?.items ?? [];
  const sectionIds = useMemo(
    () => [
      ...(menuPayload?.categories ?? []).map((c) => c.id),
      ...STATIC_TRAILING_SECTIONS,
    ],
    [menuPayload?.categories],
  );

  // Reconcile the persisted cart against the live menu the first time it loads.
  // This handles items deleted/hidden by the admin or repriced since the cart
  // was last saved in localStorage.
  const reconcileRef = useRef(false);
  useEffect(() => {
    if (reconcileRef.current) return;
    if (!menuPayload || menuData.length === 0) return;
    reconcileRef.current = true;
    const { removed, repriced } = cart.reconcile(menuData);
    if (removed.length > 0) {
      toast.info(`تم تحديث السلة: حُذف ${removed.length} صنف لم يعد متاحاً`);
    }
    if (repriced.length > 0) {
      toast.info(`تم تحديث الأسعار في السلة (${repriced.length} صنف)`);
    }
  }, [menuPayload, menuData, cart]);

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
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sectionIds]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return menuData;
    const q = searchQuery.trim();
    return menuData.filter(item =>
      item.name.includes(q) || (item.description && item.description.includes(q))
    );
  }, [searchQuery, menuData]);

  const byCategory = (cat: string) => filteredData.filter(i => i.category === cat);

  // Featured items are flagged in the database (items.is_featured) and surfaced
  // by the API as `featured: true`. This replaces the previous hard-coded
  // legacy-id lookup so the admin can change which items are featured without
  // a redeploy.
  const featuredItems = menuData.filter((i) => i.featured);

  const noResults = searchQuery.trim() && filteredData.length === 0;

  if (!serviceInfo) {
    return <ServiceTypeGate onComplete={setServiceInfo} />;
  }

  if (menuLoading && menuData.length === 0) {
    return (
      <div dir="rtl" className="min-h-[100dvh] flex items-center justify-center bg-background text-foreground">
        <p className="text-primary font-bold">جاري تحميل القائمة…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pb-36 safe-bottom" dir="rtl">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {!searchQuery && (
        <CategoryNav
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      <main
        className="max-w-md mx-auto mt-2"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          // Skip if click came from an interactive control (qty +/-, add btn, links)
          if (target.closest('button, a')) return;

          // Walk up a few levels to find an <img> — either as ancestor OR as a
          // sibling under a shared wrapper (cards put a gradient overlay above
          // the image that would otherwise swallow the click).
          let el: HTMLElement | null = target;
          let img: HTMLImageElement | null = null;
          for (let i = 0; i < 5 && el; i++) {
            if (el.tagName === 'IMG') { img = el as HTMLImageElement; break; }
            const inner = el.querySelector?.('img') as HTMLImageElement | null;
            if (inner) { img = inner; break; }
            el = el.parentElement;
          }
          if (!img) return;

          const src = img.getAttribute('src') || '';
          const alt = img.getAttribute('alt') || '';
          // Resolve by alt (=item.name, unique) preferring an exact image match
          // for cases where two items share a name.
          const found =
            menuData.find(m => m.name === alt && (m.image === src || m.image === img!.src)) ||
            menuData.find(m => m.name === alt);
          if (found) {
            // eslint-disable-next-line no-console
            console.log('[product-modal] open:', found.name);
            setModalItem(found);
          }
        }}
      >
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
              <DecorSlider images={DECOR_IMAGES} variant="opening" />
            )}

            {!searchQuery && (
              <FeaturedSection
                items={featuredItems}
                getItemQuantity={cart.getItemQuantity}
                onAdd={cart.addToCart}
                onUpdateQty={cart.updateQuantity}
              />
            )}

            <GrapeLeafSection
              items={byCategory('grape_leaves')}
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

            <DolmaSection
              items={byCategory('dolma')}
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

            <FattaSection
              items={byCategory('fatta')}
              getItemQuantity={cart.getItemQuantity}
              onAdd={cart.addToCart}
              onUpdateQty={cart.updateQuantity}
            />

            <PilavSection
              items={byCategory('pilav')}
              getItemQuantity={cart.getItemQuantity}
              onAdd={cart.addToCart}
              onUpdateQty={cart.updateQuantity}
            />

            <FettuccineSection
              items={byCategory('fettuccine')}
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

            <RefreshingSection
              items={byCategory('refreshing')}
              getItemQuantity={cart.getItemQuantity}
              onAdd={cart.addToCart}
              onUpdateQty={cart.updateQuantity}
            />

            {!searchQuery && (
              <DecorSlider images={DECOR_IMAGES} variant="closing" />
            )}
            {!searchQuery && <AboutSection />}
            {!searchQuery && <InstagramSection />}
          </>
        )}
      </main>

      <footer className="mt-12 py-8 text-center border-t border-border/20 px-4">
        <p className="font-bold text-xl text-primary mb-1">DOLMIX</p>
        <p className="text-sm text-muted-foreground italic">تجربة سوف تحكي عنها لاحفادك.</p>

        <div className="mt-8 pt-6 border-t border-border/10 flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground/50 tracking-widest uppercase">Menu Edition 2026</p>
          <a
            href="https://murly.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary/50 hover:text-primary/80 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            موقعنا الإلكتروني — Designed by أميرالاي ©
          </a>
        </div>
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
        serviceInfo={serviceInfo}
      />

      <ProductDetailsModal
        item={modalItem}
        onClose={() => setModalItem(null)}
        onAdd={cart.addToCart}
      />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={MenuApp} />
      <Route path="/admin" nest>
        <AdminApp />
      </Route>
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
