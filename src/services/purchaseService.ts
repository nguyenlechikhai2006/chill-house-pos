import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { PurchaseOrder, Supplier } from '../types/database.types';

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    if (!isSupabaseConfigured()) {
      return [
        { id: 's1', code: 'NCC-NGUYEN-LIEU-SG', name: 'Công ty TNHH Nguyên Liệu Pha Chế Sài Gòn', contact_name: 'Anh Hoàng Long', phone: '0909 111 222', email: 'sales@nguyenlieusg.vn', address: 'Số 45 Bình Thới, Quận 11, TP. HCM', is_active: true, created_at: '' },
        { id: 's2', code: 'NCC-BAO-BI-XANH', name: 'Xưởng Bao Bì & Ly Nhựa Xanh', contact_name: 'Chị Mai Lan', phone: '0918 333 444', email: 'baobixanh@gmail.com', address: 'Khu công nghiệp Tân Bình, TP. HCM', is_active: true, created_at: '' },
      ];
    }
    const { data, error } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(supplier: Partial<Supplier>): Promise<Supplier> {
    const { data, error } = await supabase.from('suppliers').insert(supplier).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const { data, error } = await supabase.from('suppliers').update(supplier).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
  }
};

export const purchaseService = {
  async getAll(): Promise<PurchaseOrder[]> {
    if (!isSupabaseConfigured()) {
      return [
        {
          id: 'po-1',
          po_number: 'PO-202611-001',
          supplier_id: 's1',
          created_by: 'demo-user-id',
          status: 'received',
          total_amount: 3250000,
          received_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          suppliers: { name: 'Công ty TNHH Nguyên Liệu Pha Chế Sài Gòn' } as any,
          purchase_order_items: []
        }
      ];
    }

    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, suppliers(*), profiles(*), purchase_order_items(*, ingredients(*))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(
    po: Partial<PurchaseOrder>,
    items: { ingredient_id: string; quantity: number; unit_price: number; total_price: number; expiry_date?: string }[],
    autoReceive: boolean = true
  ): Promise<PurchaseOrder> {
    const { data: newPo, error: poErr } = await supabase
      .from('purchase_orders')
      .insert({ ...po, status: autoReceive ? 'received' : 'pending' })
      .select()
      .single();

    if (poErr) throw poErr;

    const itemPayload = items.map((it) => ({
      purchase_order_id: newPo.id,
      ...it,
    }));

    const { error: itemErr } = await supabase.from('purchase_order_items').insert(itemPayload);
    if (itemErr) throw itemErr;

    if (autoReceive) {
      // Call RPC function to update stock
      await supabase.rpc('receive_purchase_order', {
        p_po_id: newPo.id,
        p_received_by: po.created_by,
      });
    }

    return newPo;
  }
};
