import { create } from 'zustand';
import type { Customer, OrderItem, Promotion } from '../types/database.types';

interface CartState {
  items: OrderItem[];
  customer: Customer | null;
  promotion: Promotion | null;
  discountAmount: number;
  orderNotes: string;
  
  // Actions
  addItem: (item: Omit<OrderItem, 'subtotal'>) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  updateSugarIce: (index: number, sugar: OrderItem['sugar_level'], ice: OrderItem['ice_level']) => void;
  setCustomer: (customer: Customer | null) => void;
  applyPromotion: (promotion: Promotion) => { success: boolean; message: string };
  removePromotion: () => void;
  setOrderNotes: (notes: string) => void;
  clearCart: () => void;
  
  // Computed helpers
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer: null,
  promotion: null,
  discountAmount: 0,
  orderNotes: '',

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getTotal: () => {
    const sub = get().getSubtotal();
    const discount = get().discountAmount;
    return Math.max(0, sub - discount);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },

  addItem: (newItem) => {
    // Calculate topping total for 1 item
    const toppingTotal = newItem.toppings.reduce(
      (acc, t) => acc + t.unit_price * t.quantity,
      0
    );
    const itemSubtotal = (newItem.unit_price + toppingTotal) * newItem.quantity;

    const fullItem: OrderItem = {
      ...newItem,
      subtotal: itemSubtotal,
    };

    set((state) => {
      // Check if identical item (same variant, size, sugar, ice, toppings and note) exists
      const existingIdx = state.items.findIndex((it) => {
        const sameVariant = it.product_variant_id === fullItem.product_variant_id;
        const sameSugar = it.sugar_level === fullItem.sugar_level;
        const sameIce = it.ice_level === fullItem.ice_level;
        const sameNotes = (it.notes || '') === (fullItem.notes || '');
        const sameToppings =
          JSON.stringify(it.toppings.map((t) => t.topping_id).sort()) ===
          JSON.stringify(fullItem.toppings.map((t) => t.topping_id).sort());
        return sameVariant && sameSugar && sameIce && sameNotes && sameToppings;
      });

      if (existingIdx > -1) {
        const updated = [...state.items];
        const existing = updated[existingIdx];
        const newQty = existing.quantity + fullItem.quantity;
        const singlePrice = existing.unit_price + existing.toppings.reduce((acc, t) => acc + t.unit_price * t.quantity, 0);
        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          subtotal: singlePrice * newQty,
        };
        return { items: updated };
      }

      return { items: [...state.items, fullItem] };
    });

    // Re-verify promotion if applied
    const promo = get().promotion;
    if (promo) {
      get().applyPromotion(promo);
    }
  },

  removeItem: (index) => {
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    }));
    const promo = get().promotion;
    if (promo) {
      get().applyPromotion(promo);
    }
  },

  updateQuantity: (index, quantity) => {
    if (quantity <= 0) {
      get().removeItem(index);
      return;
    }
    set((state) => {
      const updated = [...state.items];
      const target = updated[index];
      if (!target) return state;
      const toppingTotal = target.toppings.reduce((acc, t) => acc + t.unit_price * t.quantity, 0);
      const singlePrice = target.unit_price + toppingTotal;
      updated[index] = {
        ...target,
        quantity,
        subtotal: singlePrice * quantity,
      };
      return { items: updated };
    });
    const promo = get().promotion;
    if (promo) {
      get().applyPromotion(promo);
    }
  },

  updateSugarIce: (index, sugar, ice) => {
    set((state) => {
      const updated = [...state.items];
      if (!updated[index]) return state;
      updated[index] = {
        ...updated[index],
        sugar_level: sugar,
        ice_level: ice,
      };
      return { items: updated };
    });
  },

  setCustomer: (customer) => set({ customer }),

  applyPromotion: (promotion) => {
    const subtotal = get().getSubtotal();
    if (subtotal < promotion.min_order_value) {
      return {
        success: false,
        message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(promotion.min_order_value)}đ để áp dụng voucher này.`,
      };
    }

    let discount = 0;
    if (promotion.discount_type === 'percent') {
      discount = (subtotal * promotion.discount_value) / 100;
      if (promotion.max_discount_amount && discount > promotion.max_discount_amount) {
        discount = promotion.max_discount_amount;
      }
    } else {
      discount = promotion.discount_value;
    }

    discount = Math.min(discount, subtotal);

    set({ promotion, discountAmount: discount });
    return { success: true, message: `Đã áp dụng mã giảm ${new Intl.NumberFormat('vi-VN').format(discount)}đ` };
  },

  removePromotion: () => set({ promotion: null, discountAmount: 0 }),

  setOrderNotes: (notes) => set({ orderNotes: notes }),

  clearCart: () => set({ items: [], customer: null, promotion: null, discountAmount: 0, orderNotes: '' }),
}));
