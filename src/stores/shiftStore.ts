import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Shift } from '../types/database.types';

interface ShiftState {
  activeShift: Shift | null;
  loading: boolean;
  fetchActiveShift: (profileId: string) => Promise<void>;
  openShift: (profileId: string, shiftName: string, openingCash: number, notes?: string) => Promise<{ success: boolean; error?: string }>;
  closeShift: (shiftId: string, closingCash: number, notes?: string) => Promise<{ success: boolean; error?: string }>;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  activeShift: null,
  loading: false,

  fetchActiveShift: async (profileId: string) => {
    set({ loading: true });
    try {
      if (!isSupabaseConfigured()) {
        const saved = localStorage.getItem('chill_demo_shift');
        if (saved) {
          set({ activeShift: JSON.parse(saved), loading: false });
        } else {
          set({ activeShift: null, loading: false });
        }
        return;
      }

      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('profile_id', profileId)
        .eq('status', 'open')
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        set({ activeShift: data, loading: false });
      } else {
        set({ activeShift: null, loading: false });
      }
    } catch (err) {
      set({ activeShift: null, loading: false });
    }
  },

  openShift: async (profileId, shiftName, openingCash, notes) => {
    try {
      if (!isSupabaseConfigured()) {
        const demoShift: Shift = {
          id: 'demo-shift-' + Date.now(),
          profile_id: profileId,
          shift_name: shiftName,
          start_time: new Date().toISOString(),
          opening_cash: openingCash,
          total_sales: 0,
          total_orders: 0,
          notes,
          status: 'open',
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('chill_demo_shift', JSON.stringify(demoShift));
        set({ activeShift: demoShift });
        return { success: true };
      }

      const { data, error } = await supabase
        .from('shifts')
        .insert({
          profile_id: profileId,
          shift_name: shiftName,
          opening_cash: openingCash,
          notes,
          status: 'open',
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      set({ activeShift: data });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  closeShift: async (shiftId, closingCash, notes) => {
    try {
      const shift = get().activeShift;
      if (!shift) return { success: false, error: 'Không tìm thấy ca hiện tại' };

      const expectedCash = Number(shift.opening_cash) + Number(shift.total_sales);
      const cashDiff = Number(closingCash) - expectedCash;

      if (!isSupabaseConfigured()) {
        localStorage.removeItem('chill_demo_shift');
        set({ activeShift: null });
        return { success: true };
      }

      const { error } = await supabase
        .from('shifts')
        .update({
          closing_cash: closingCash,
          expected_cash: expectedCash,
          cash_difference: cashDiff,
          end_time: new Date().toISOString(),
          notes: notes ? `${shift.notes || ''}\nĐóng ca: ${notes}` : shift.notes,
          status: 'closed',
        })
        .eq('id', shiftId);

      if (error) {
        return { success: false, error: error.message };
      }

      set({ activeShift: null });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
}));
