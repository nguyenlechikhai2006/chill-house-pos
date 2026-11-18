import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Customer } from '../types/database.types';

export const customerService = {
  async getAll(search?: string): Promise<Customer[]> {
    if (!isSupabaseConfigured()) {
      const demoCustomers: Customer[] = [
        { id: 'c1', full_name: 'Nguyễn Văn An', phone: '0901234567', email: 'an.nguyen@gmail.com', points: 45, total_spent: 450000, customer_rank: 'Standard', created_at: new Date().toISOString() },
        { id: 'c2', full_name: 'Trần Thị Bích Ngọc', phone: '0912345678', email: 'bichngoc@gmail.com', points: 250, total_spent: 2500000, customer_rank: 'Silver', created_at: new Date().toISOString() },
        { id: 'c3', full_name: 'Lê Hoàng Nam', phone: '0988776655', email: 'nam.le@gmail.com', points: 620, total_spent: 6200000, customer_rank: 'Gold', created_at: new Date().toISOString() },
      ];
      if (search) {
        return demoCustomers.filter((c) => c.full_name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
      }
      return demoCustomers;
    }

    let query = supabase.from('customers').select('*').order('created_at', { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async create(customer: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase.from('customers').insert(customer).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase.from('customers').update(customer).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  }
};
