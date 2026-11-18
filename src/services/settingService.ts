import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { StoreSetting } from '../types/database.types';

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
