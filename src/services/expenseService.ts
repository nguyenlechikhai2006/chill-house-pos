import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Expense, ExpenseCategory, StoreSetting } from '../types/database.types';

export const expenseService = {
  async getCategories(): Promise<ExpenseCategory[]> {
    if (!isSupabaseConfigured()) {
      return [
        { id: 'ec1', name: 'Mặt bằng & Cơ sở vật chất', code: 'EXP-MAT-BANG', is_active: true },
        { id: 'ec2', name: 'Điện & Nước sinh hoạt', code: 'EXP-DIEN-NUOC', is_active: true },
        { id: 'ec3', name: 'Lương & Thưởng nhân viên', code: 'EXP-LUONG', is_active: true },
        { id: 'ec4', name: 'Marketing & Khuyến mãi', code: 'EXP-MARKETING', is_active: true },
        { id: 'ec5', name: 'Chi phí vận hành khác', code: 'EXP-KHAC', is_active: true },
      ];
    }
    const { data, error } = await supabase.from('expense_categories').select('*').order('name');
    if (error) throw error;
    return data || [];
  },

  async getAll(): Promise<Expense[]> {
    if (!isSupabaseConfigured()) {
      return [
        {
          id: 'exp-1',
          expense_category_id: 'ec2',
          title: 'Tiền điện tháng 11 quán Chill House',
          amount: 2850000,
          payment_method: 'bank_transfer',
          expense_date: '2026-11-10',
          recorded_by: 'demo-user-id',
          notes: 'Thanh toán tiền điện máy lạnh & quầy pha chế',
          created_at: new Date().toISOString(),
          expense_categories: { name: 'Điện & Nước sinh hoạt' } as any,
          profiles: { full_name: 'Quản trị viên' } as any
        }
      ];
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*, expense_categories(*), profiles(*)')
      .order('expense_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(expense: Partial<Expense>): Promise<Expense> {
    const { data, error } = await supabase.from('expenses').insert(expense).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  }
};

export const settingService = {
  async getStoreSetting(): Promise<StoreSetting> {
    if (!isSupabaseConfigured()) {
      return {
        id: 'default-setting',
        store_name: 'Chill House Coffee & Tea',
        phone: '0988 123 456',
        email: 'hello@chillhouse.vn',
        address: '123 Đường Cà Phê, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        tax_number: '0312345678',
        bank_name: 'MB Bank',
        bank_account_number: '999988889999',
        bank_account_name: 'CHILL HOUSE F&B',
        bank_bin: '970422',
        invoice_footer: 'Cảm ơn quý khách đã ghé Chill House! Hẹn gặp lại quý khách!',
        currency: 'VNĐ',
        timezone: 'Asia/Ho_Chi_Minh',
        vat_percent: 0,
      };
    }

    const { data, error } = await supabase.from('store_settings').select('*').limit(1).maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateStoreSetting(id: string, setting: Partial<StoreSetting>): Promise<StoreSetting> {
    const { data, error } = await supabase.from('store_settings').update(setting).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
