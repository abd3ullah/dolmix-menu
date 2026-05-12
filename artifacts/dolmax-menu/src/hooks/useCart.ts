import { useState, useEffect, useCallback } from 'react';
import type { MenuItem } from '../data/menuData';

export type CartItem = {
  id: string;
  itemId: string;
  name: string;
  category: string;
  selectedSize?: string;
  pieces?: number;
  /** Comma-joined display string of selected piece-type names (legacy / single-type case). */
  selectedPieces?: string;
  /**
   * Per-type piece distribution for items that allow multiple piece types.
   * Only populated when the customer chose more than one type AND the size
   * has a known piece count. Sum of values equals the size's piece count and
   * is enforced before adding to the cart.
   */
  pieceDistribution?: Record<string, number>;
  unitPrice: number;
  quantity: number;
};

/**
 * Build a deterministic suffix for the cart-line id from a piece distribution
 * so two carts of the same item+size with different per-type breakdowns are
 * tracked as separate lines (kitchen needs both). Any non-empty distribution
 * — including a single-type pick — affects the id, so flipping the chosen
 * piece type creates a new line instead of silently overwriting the previous
 * one's intent on the next "+" press.
 */
export function distributionKey(dist?: Record<string, number>): string {
  if (!dist) return "";
  const entries = Object.entries(dist).filter(([, v]) => v > 0);
  if (entries.length === 0) return "";
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  return "|" + entries.map(([k, v]) => `${k}:${v}`).join(",");
}

/** Canonical cart-line id for an item+size+distribution. Shared by the cart and the card. */
export function cartLineId(itemId: string, selectedSize?: string, dist?: Record<string, number>): string {
  const base = selectedSize ? `${itemId}-${selectedSize}` : itemId;
  return base + distributionKey(dist);
}

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
      const id = cartLineId(item.itemId, item.selectedSize, item.pieceDistribution);
      const existing = prev.find(i => i.id === id);
      if (existing) {
        // ids match → identical item+size+distribution, so this is genuinely
        // the same line. We only bump quantity; the stored `selectedPieces` /
        // `pieceDistribution` are already the same intent and must not be
        // overwritten with anything that could drift the kitchen instructions.
        return prev.map(i => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
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
