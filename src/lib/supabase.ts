import { createClient } from '@supabase/supabase-js';

let rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
// Tự động chuẩn hóa URL (loại bỏ /rest/v1/ hoặc dấu / thừa ở cuối nếu người dùng dán nhầm API URL)
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    !supabaseUrl.includes('placeholder') &&
    !!supabaseAnonKey &&
    !supabaseAnonKey.includes('placeholder')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
