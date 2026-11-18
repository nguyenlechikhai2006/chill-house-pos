import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile, Role } from '../types/database.types';

export const employeeService = {
  async getRoles(): Promise<Role[]> {
    if (!isSupabaseConfigured()) {
      return [
        { id: 'r1', name: 'admin', display_name: 'Chủ cửa hàng (Admin)', created_at: '' },
        { id: 'r2', name: 'manager', display_name: 'Quản lý (Manager)', created_at: '' },
        { id: 'r3', name: 'cashier', display_name: 'Thu ngân (Cashier)', created_at: '' },
        { id: 'r4', name: 'staff', display_name: 'Nhân viên pha chế / Phục vụ (Staff)', created_at: '' },
      ];
    }
    const { data, error } = await supabase.from('roles').select('*').order('name');
    if (error) throw error;
    return data || [];
  },

  async getAll(): Promise<Profile[]> {
    if (!isSupabaseConfigured()) {
      return [
        { id: 'p1', role_id: 'r1', employee_code: 'CH-ADMIN', full_name: 'Trần Văn Quản Trị', phone: '0988123456', email: 'admin@chillhouse.vn', status: 'active', roles: { name: 'admin', display_name: 'Chủ cửa hàng (Admin)' } as any, created_at: '', updated_at: '' },
        { id: 'p2', role_id: 'r3', employee_code: 'CH-TN01', full_name: 'Lê Thảo My', phone: '0912349876', email: 'thaomy@chillhouse.vn', status: 'active', roles: { name: 'cashier', display_name: 'Thu ngân (Cashier)' } as any, created_at: '', updated_at: '' },
        { id: 'p3', role_id: 'r4', employee_code: 'CH-PC01', full_name: 'Nguyễn Tuấn Kiệt', phone: '0933445566', email: 'tuankiet@chillhouse.vn', status: 'active', roles: { name: 'staff', display_name: 'Nhân viên pha chế' } as any, created_at: '', updated_at: '' },
      ];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*, roles(*)')
      .order('employee_code');

    if (error) throw error;
    return data || [];
  },

  async update(id: string, profile: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase.from('profiles').update(profile).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
