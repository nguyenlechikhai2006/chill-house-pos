import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { Coffee, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import type { UserRole } from '../../types/database.types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@chillhouse.vn');
  const [password, setPassword] = useState('chillhouse123');
  const [loading, setLoading] = useState(false);

  const { login, setDemoProfile } = useAuthStore();
  const toast = useToastStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      toast.success('Đăng nhập thành công! Chào mừng đến với Chill House POS.');
      navigate('/pos');
    } else {
      toast.error(res.error || 'Sai email hoặc mật khẩu');
    }
  };

  const handleQuickRole = (targetRole: UserRole) => {
    setDemoProfile(targetRole);
    toast.success(`Đã vào hệ thống với vai trò: ${targetRole.toUpperCase()}`);
    navigate('/pos');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-700 text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Chill House POS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống Quản lý Bán hàng & Pha chế F&B Chuyên nghiệp
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email đăng nhập"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            variant="primary"
            size="lg"
            type="submit"
            loading={loading}
            className="w-full mt-2"
          >
            Đăng nhập hệ thống <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-700" />
            Đăng nhập nhanh theo phân quyền
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickRole('admin')}
              className="py-2 px-2 text-xs font-bold rounded-xl bg-brand-50 text-brand-800 hover:bg-brand-100 transition border border-brand-200"
            >
              Chủ quán (Admin)
            </button>
            <button
              onClick={() => handleQuickRole('manager')}
              className="py-2 px-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              Quản lý (Manager)
            </button>
            <button
              onClick={() => handleQuickRole('cashier')}
              className="py-2 px-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition border border-emerald-200"
            >
              Thu ngân (POS)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
