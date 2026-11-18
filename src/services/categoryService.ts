import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Category } from '../types/database.types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    if (!isSupabaseConfigured()) {
      return [
        { id: 'c1', name: 'Cà phê', slug: 'ca-phe', display_order: 1, is_active: true, created_at: '' },
        { id: 'c2', name: 'Trà sữa', slug: 'tra-sua', display_order: 2, is_active: true, created_at: '' },
        { id: 'c3', name: 'Trà trái cây', slug: 'tra-trai-cay', display_order: 3, is_active: true, created_at: '' },
        { id: 'c4', name: 'Nước ép & Sinh tố', slug: 'nuoc-ep-sinh-to', display_order: 4, is_active: true, created_at: '' },
        { id: 'c5', name: 'Đá xay', slug: 'da-xay', display_order: 5, is_active: true, created_at: '' },
        { id: 'c6', name: 'Bánh & Snack', slug: 'banh-snack', display_order: 6, is_active: true, created_at: '' },
      ];
    }
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(category: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, category: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  }
};
