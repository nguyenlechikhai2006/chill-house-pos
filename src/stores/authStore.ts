import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile, UserRole } from '../types/database.types';

interface AuthState {
  user: any | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setDemoProfile: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  role: 'cashier',
  loading: true,
  initialized: false,

  checkAuth: async () => {
    try {
      if (!isSupabaseConfigured()) {
        // Fallback demo profile for local exploration before Supabase credentials are inserted
        const savedRole = (localStorage.getItem('chill_demo_role') as UserRole) || 'admin';
        set({
          user: { id: 'demo-user-id', email: 'admin@chillhouse.vn' },
          profile: {
            id: 'demo-user-id',
            role_id: 'demo-role-id',
            employee_code: 'CH-ADMIN',
            full_name: 'Quản trị viên Chill House',
            email: 'admin@chillhouse.vn',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          role: savedRole,
          loading: false,
          initialized: true,
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        set({ user: null, profile: null, role: 'staff', loading: false, initialized: true });
        return;
      }

      // Fetch profile & role
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*, roles(*)')
        .eq('id', session.user.id)
        .single();

      if (error || !profileData) {
        set({ user: session.user, profile: null, role: 'staff', loading: false, initialized: true });
        return;
      }

      const roleName = (profileData.roles?.name as UserRole) || 'cashier';
      set({
        user: session.user,
        profile: profileData,
        role: roleName,
        loading: false,
        initialized: true,
      });
    } catch (err) {
      console.error('Check auth error:', err);
      set({ user: null, profile: null, role: 'cashier', loading: false, initialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      if (!isSupabaseConfigured()) {
        get().setDemoProfile('admin');
        set({ loading: false });
        return { success: true };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ loading: false });
        return { success: false, error: error.message };
      }

      await get().checkAuth();
      return { success: true };
    } catch (err: any) {
      set({ loading: false });
      return { success: false, error: err.message || 'Lỗi đăng nhập' };
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('chill_demo_role');
      set({ user: null, profile: null, role: 'cashier', loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  setDemoProfile: (newRole: UserRole) => {
    localStorage.setItem('chill_demo_role', newRole);
    set({
      user: { id: 'demo-user-id', email: `${newRole}@chillhouse.vn` },
      role: newRole,
      profile: {
        id: 'demo-user-id',
        role_id: 'demo-role-id',
        employee_code: newRole === 'admin' ? 'CH-ADMIN' : 'CH-NV01',
        full_name: newRole === 'admin' ? 'Chủ quán (Admin)' : newRole === 'manager' ? 'Quản lý (Manager)' : 'Thu ngân (Cashier)',
        email: `${newRole}@chillhouse.vn`,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    });
  }
}));
