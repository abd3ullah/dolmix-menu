import { useState, useEffect, useCallback } from 'react';
import type { MenuItem } from '../data/menuData';

export type CartItem = {
  id: string;
  itemId: string;
  name: string;
  category: string;
  selectedSize?: string;
  pieces?: number;
  selectedPieces?: string;
  unitPrice: number;
  quantity: number;
};

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('dolmax_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('dolmax_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity' | 'id'>) => {
    setItems(prev => {
      const id = item.selectedSize ? `${item.itemId}-${item.selectedSize}` : item.itemId;
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1, selectedPieces: item.selectedPieces ?? i.selectedPieces } : i);
      }
      return [...prev, { ...item, id, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(0, newQty) };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback((id: string) => {
    return items.find(i => i.id === id)?.quantity || 0;
  }, [items]);

  /**
   * Reconcile the cart against the live menu:
   * - drops items whose menu entry no longer exists or is hidden
   * - drops sized items whose selected size is no longer offered
   * - refreshes unit prices when the live menu price has changed
   * Returns a summary of the changes for the caller to surface to the user.
   */
  const reconcile = useCallback(
    (menu: MenuItem[]): { removed: string[]; repriced: string[] } => {
      const removed: string[] = [];
      const repriced: string[] = [];
      setItems((prev) => {
        const next: CartItem[] = [];
        for (const ci of prev) {
          const item = menu.find((m) => m.id === ci.itemId);
          if (!item) {
            removed.push(ci.name);
            continue;
          }
          let unitPrice = ci.unitPrice;
          if (ci.selectedSize) {
            const sz = item.sizes?.find((s) => s.id === ci.selectedSize);
            if (!sz) {
              removed.push(ci.name);
              continue;
            }
            if (sz.price !== ci.unitPrice) {
              repriced.push(ci.name);
              unitPrice = sz.price;
            }
          } else if (typeof item.price === "number" && item.price !== ci.unitPrice) {
            repriced.push(ci.name);
            unitPrice = item.price;
          }
          next.push({ ...ci, unitPrice });
        }
        return next;
      });
      return { removed, repriced };
    },
    [],
  );

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  return {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    reconcile,
    totalItems,
    totalPrice
  };
}
