import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useShiftStore } from '../../stores/shiftStore';
import { useToastStore } from '../../stores/toastStore';
import {
  LogOut,
  Clock,
  Shield,
  Store,
  ChevronDown,
  Bell
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import type { UserRole } from '../../types/database.types';

export const Header: React.FC = () => {
  const { role, profile, logout, setDemoProfile } = useAuthStore();
  const { activeShift, openShift, closeShift } = useShiftStore();
  const toast = useToastStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [openShiftModal, setOpenShiftModal] = useState(false);
  const [closeShiftModal, setCloseShiftModal] = useState(false);
  const [openingCash, setOpeningCash] = useState('1000000');
  const [closingCash, setClosingCash] = useState('');
  const [shiftName, setShiftName] = useState('Ca Sáng');
  const [shiftNotes, setShiftNotes] = useState('');
  const [loadingShift, setLoadingShift] = useState(false);

  const handleOpenShift = async () => {
    setLoadingShift(true);
    const res = await openShift(
      profile?.id || 'demo-user-id',
      shiftName,
      Number(openingCash) || 0,
      shiftNotes
    );
    setLoadingShift(false);
    if (res.success) {
      toast.success('Mở ca làm việc thành công!');
      setOpenShiftModal(false);
    } else {
      toast.error(res.error || 'Lỗi khi mở ca');
    }
  };

  const handleCloseShift = async () => {
    if (!activeShift) return;
    setLoadingShift(true);
    const res = await closeShift(
      activeShift.id,
      Number(closingCash) || 0,
      shiftNotes
    );
    setLoadingShift(false);
    if (res.success) {
      toast.success('Đã kết ca và kiểm két thành công!');
      setCloseShiftModal(false);
    } else {
      toast.error(res.error || 'Lỗi khi đóng ca');
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 select-none print:hidden">
        {/* Left: Store identity & Shift Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-800">
            <Store className="w-5 h-5 text-brand-700" />
            <span className="font-bold text-sm tracking-tight hidden sm:inline">
              Chill House - Quầy Bar 01
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* Shift Status Button */}
          {activeShift ? (
            <button
              onClick={() => setCloseShiftModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeShift.shift_name} (Đang mở)</span>
              <span className="font-bold">| Bán: {formatCurrency(activeShift.total_sales)}</span>
            </button>
          ) : (
            <button
              onClick={() => setOpenShiftModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Chưa mở ca - Bấm để mở</span>
            </button>
          )}
        </div>

        {/* Right: Quick Role Switcher + User + Logout */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher for preview & testing */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
            <Shield className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            {(['admin', 'manager', 'cashier', 'staff'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setDemoProfile(r)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  role === r
                    ? 'bg-white text-brand-800 font-bold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {r === 'admin' ? 'Admin' : r === 'manager' ? 'Quản lý' : r === 'cashier' ? 'Thu ngân' : 'Barista'}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Profile Name */}
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">{profile?.full_name || 'Chill House Staff'}</p>
            <p className="text-[11px] text-slate-500">{profile?.email || 'nhanvien@chillhouse.vn'}</p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MODAL: MỞ CA LÀM VIỆC */}
      <Modal isOpen={openShiftModal} onClose={() => setOpenShiftModal(false)} title="Mở ca làm việc mới" maxWidth="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Tên ca</label>
            <select
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500"
            >
              <option value="Ca Sáng (06:30 - 14:30)">Ca Sáng (06:30 - 14:30)</option>
              <option value="Ca Chiều (14:30 - 22:30)">Ca Chiều (14:30 - 22:30)</option>
              <option value="Ca Gãy / Tăng cường">Ca Gãy / Tăng cường</option>
            </select>
          </div>
          <div>
            <Input
              label="Tiền lẻ mở két ban đầu (VNĐ)"
              type="number"
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              placeholder="1000000"
            />
            <p className="text-xs text-slate-500 mt-1">Số tiền mặt có sẵn trong ngăn kéo để thối tiền cho khách.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Ghi chú</label>
            <textarea
              value={shiftNotes}
              onChange={(e) => setShiftNotes(e.target.value)}
              rows={2}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500"
              placeholder="Ghi chú bàn giao ca..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpenShiftModal(false)}>Hủy</Button>
            <Button variant="primary" loading={loadingShift} onClick={handleOpenShift}>Xác nhận mở ca</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: ĐÓNG CA & KIỂM KÉT */}
      <Modal isOpen={closeShiftModal} onClose={() => setCloseShiftModal(false)} title="Kết ca làm việc & Kiểm két" maxWidth="md">
        {activeShift && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Ca hiện tại:</span>
                <span className="font-bold text-slate-800">{activeShift.shift_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giờ bắt đầu:</span>
                <span className="font-semibold text-slate-800">{formatDateTime(activeShift.start_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tiền lẻ ban đầu:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(activeShift.opening_cash)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Doanh thu trong ca:</span>
                <span className="font-bold text-emerald-600">+{formatCurrency(activeShift.total_sales)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                <span className="text-slate-700">Tổng tiền lý thuyết trong két:</span>
                <span className="text-brand-800">{formatCurrency(Number(activeShift.opening_cash) + Number(activeShift.total_sales))}</span>
              </div>
            </div>

            <div>
              <Input
                label="Tiền mặt thực tế đếm được khi kết ca (VNĐ)"
                type="number"
                value={closingCash}
                onChange={(e) => setClosingCash(e.target.value)}
                placeholder="Nhập số tiền thực đếm..."
                required
              />
              {closingCash && (
                <div className="mt-2 text-xs font-semibold flex justify-between p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  <span>Chênh lệch (Thực tế - Lý thuyết):</span>
                  <span className={Number(closingCash) - (Number(activeShift.opening_cash) + Number(activeShift.total_sales)) >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {formatCurrency(Number(closingCash) - (Number(activeShift.opening_cash) + Number(activeShift.total_sales)))}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Ghi chú kết ca</label>
              <textarea
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                rows={2}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500"
                placeholder="Lý do chênh lệch hoặc ghi chú bàn giao..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setCloseShiftModal(false)}>Quay lại</Button>
              <Button variant="danger" loading={loadingShift} onClick={handleCloseShift}>Xác nhận kết ca</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
