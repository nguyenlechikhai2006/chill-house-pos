import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Promotion } from '../types/database.types';

export const promotionService = {
  async getActivePromotions(): Promise<Promotion[]> {
    if (!isSupabaseConfigured()) {
      return [
        {
          id: 'pr-1',
          code: 'CHILLWELCOME',
          title: 'Chào bạn mới Chill House',
          description: 'Giảm 10% cho đơn hàng đầu tiên từ 50k',
          discount_type: 'percent',
          discount_value: 10,
          min_order_value: 50000,
          max_discount_amount: 30000,
          start_date: new Date(Date.now() - 86400000).toISOString(),
          end_date: new Date(Date.now() + 86400000 * 30).toISOString(),
          usage_limit: 500,
          used_count: 14,
          is_active: true,
        },
        {
          id: 'pr-2',
          code: 'GIAM20K',
          title: 'Giờ vàng Chill House',
          description: 'Giảm trực tiếp 20.000đ cho đơn từ 100k',
          discount_type: 'fixed_amount',
          discount_value: 20000,
          min_order_value: 100000,
          start_date: new Date(Date.now() - 86400000).toISOString(),
          end_date: new Date(Date.now() + 86400000 * 30).toISOString(),
          usage_limit: 200,
          used_count: 32,
          is_active: true,
        }
      ];
    }

    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAll(): Promise<Promotion[]> {
    if (!isSupabaseConfigured()) {
      return this.getActivePromotions();
    }
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(promo: Partial<Promotion>): Promise<Promotion> {
    const { data, error } = await supabase.from('promotions').insert(promo).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, promo: Partial<Promotion>): Promise<Promotion> {
    const { data, error } = await supabase.from('promotions').update(promo).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) throw error;
  }
};
