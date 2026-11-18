import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Order } from '../types/database.types';

export interface CheckoutPayload {
  order_code: string;
  shift_id?: string | null;
  cashier_id: string;
  customer_id?: string | null;
  subtotal: number;
  discount_amount: number;
  promotion_id?: string | null;
  total_amount: number;
  notes?: string;
  payment_method: 'cash' | 'bank_transfer' | 'momo' | 'vnpay';
  customer_given: number;
  change_returned: number;
  transaction_ref?: string;
  items: any[];
}

export const orderService = {
  async checkout(payload: CheckoutPayload): Promise<{ success: boolean; order_id?: string; message?: string }> {
    if (!isSupabaseConfigured()) {
      // Demo local storage mode
      const savedOrders = JSON.parse(localStorage.getItem('chill_demo_orders') || '[]');
      const newOrder: Order = {
        id: 'ord-' + Date.now(),
        order_code: payload.order_code,
        shift_id: payload.shift_id || undefined,
        cashier_id: payload.cashier_id,
        customer_id: payload.customer_id || undefined,
        subtotal: payload.subtotal,
        discount_amount: payload.discount_amount,
        promotion_id: payload.promotion_id || undefined,
        total_amount: payload.total_amount,
        status: 'completed',
        payment_status: 'paid',
        inventory_deducted: true,
        notes: payload.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        order_items: payload.items,
        payments: [{
          id: 'pay-' + Date.now(),
          order_id: 'ord-' + Date.now(),
          payment_method: payload.payment_method,
          amount_paid: payload.total_amount,
          customer_given: payload.customer_given,
          change_returned: payload.change_returned,
          transaction_ref: payload.transaction_ref,
          status: 'success',
          created_at: new Date().toISOString(),
        }]
      };
      savedOrders.unshift(newOrder);
      localStorage.setItem('chill_demo_orders', JSON.stringify(savedOrders));
      return { success: true, order_id: newOrder.id };
    }

    // Call PostgreSQL RPC function for atomic transaction & inventory deduction
    const { data, error } = await supabase.rpc('process_order_checkout', {
      p_order_code: payload.order_code,
      p_shift_id: payload.shift_id || null,
      p_cashier_id: payload.cashier_id,
      p_customer_id: payload.customer_id || null,
      p_subtotal: payload.subtotal,
      p_discount_amount: payload.discount_amount,
      p_promotion_id: payload.promotion_id || null,
      p_total_amount: payload.total_amount,
      p_notes: payload.notes || null,
      p_payment_method: payload.payment_method,
      p_customer_given: payload.customer_given,
      p_change_returned: payload.change_returned,
      p_transaction_ref: payload.transaction_ref || null,
      p_items: payload.items,
    });

    if (error) {
      console.error('Order checkout RPC error:', error);
      throw error;
    }

    return data;
  },

  async getAll(filters?: { status?: string; startDate?: string; endDate?: string }): Promise<Order[]> {
    if (!isSupabaseConfigured()) {
      const savedOrders = JSON.parse(localStorage.getItem('chill_demo_orders') || '[]');
      return savedOrders;
    }

    let query = supabase
      .from('orders')
      .select('*, customers(*), profiles(*), order_items(*, order_item_toppings(*)), payments(*)')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async cancelOrder(orderId: string, cancelledBy: string, reason: string): Promise<any> {
    if (!isSupabaseConfigured()) {
      const savedOrders: Order[] = JSON.parse(localStorage.getItem('chill_demo_orders') || '[]');
      const target = savedOrders.find((o) => o.id === orderId);
      if (target) {
        target.status = 'cancelled';
        target.payment_status = 'refunded';
        target.cancel_reason = reason;
        target.cancelled_by = cancelledBy;
        localStorage.setItem('chill_demo_orders', JSON.stringify(savedOrders));
      }
      return { success: true, message: 'Đã hủy đơn hàng thành công.' };
    }

    const { data, error } = await supabase.rpc('cancel_order_and_restore_inventory', {
      p_order_id: orderId,
      p_cancelled_by: cancelledBy,
      p_reason: reason,
    });

    if (error) throw error;
    return data;
  },

  async updateStatus(orderId: string, status: Order['status']): Promise<void> {
    if (!isSupabaseConfigured()) {
      const savedOrders: Order[] = JSON.parse(localStorage.getItem('chill_demo_orders') || '[]');
      const target = savedOrders.find((o) => o.id === orderId);
      if (target) {
        target.status = status;
        localStorage.setItem('chill_demo_orders', JSON.stringify(savedOrders));
      }
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  }
};
