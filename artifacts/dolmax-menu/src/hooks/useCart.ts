import { useState, useEffect, useCallback } from 'react';

export type CartItem = {
  id: string; // unique cart item id (e.g. m1-s_m)
  itemId: string; // id from menuData
  name: string;
  category: string;
  selectedSize?: string;
  pieces?: number;
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
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, id, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(0, newQty) };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
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

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  return {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    totalItems,
    totalPrice
  };
}
