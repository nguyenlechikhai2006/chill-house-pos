import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useShiftStore } from '../../stores/shiftStore';
import type { Shift } from '../../types/database.types';
import { Clock, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { Badge } from '../../components/common/Badge';

export const ShiftsPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeShift } = useShiftStore();

  const loadShifts = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        const demoShifts: Shift[] = [
          {
            id: 's1',
            profile_id: 'p1',
            shift_name: 'Ca Sáng (06:30 - 14:30)',
            start_time: new Date(Date.now() - 3600000 * 8).toISOString(),
            end_time: new Date().toISOString(),
            opening_cash: 1000000,
            closing_cash: 4250000,
            expected_cash: 4250000,
            cash_difference: 0,
            total_sales: 3250000,
            total_orders: 28,
            status: 'closed',
            created_at: new Date().toISOString(),
            profiles: { full_name: 'Lê Thảo My' } as any,
          },
        ];
        if (activeShift) demoShifts.unshift(activeShift);
        setShifts(demoShifts);
        return;
      }

      const { data, error } = await supabase
        .from('shifts')
        .select('*, profiles(*)')
        .order('start_time', { ascending: false });

      if (!error && data) setShifts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, [activeShift]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Quản lý Ca Làm Việc & Két Tiền Mặt
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi lịch sử đóng/mở ca, tiền lẻ ban đầu và đối soát chênh lệch két tiền
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3.5 px-4">Tên ca & Nhân viên</th>
              <th className="py-3.5 px-4">Giờ mở ca</th>
              <th className="py-3.5 px-4">Giờ kết ca</th>
              <th className="py-3.5 px-4 text-right">Tiền mở két</th>
              <th className="py-3.5 px-4 text-right">Doanh thu ca</th>
              <th className="py-3.5 px-4 text-right">Tiền thực đếm</th>
              <th className="py-3.5 px-4 text-right">Chênh lệch</th>
              <th className="py-3.5 px-4 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shifts.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-800 text-sm">{s.shift_name}</p>
                  <p className="text-[11px] text-slate-400">{s.profiles?.full_name || 'Thu ngân'}</p>
                </td>
                <td className="py-3 px-4 font-mono text-slate-600">{formatDateTime(s.start_time)}</td>
                <td className="py-3 px-4 font-mono text-slate-600">
                  {s.end_time ? formatDateTime(s.end_time) : <span className="text-emerald-600 font-bold">Đang mở</span>}
                </td>
                <td className="py-3 px-4 text-right font-medium text-slate-700">
                  {formatCurrency(s.opening_cash)}
                </td>
                <td className="py-3 px-4 text-right font-black text-brand-800">
                  +{formatCurrency(s.total_sales)}
                </td>
                <td className="py-3 px-4 text-right font-black text-slate-900">
                  {s.closing_cash !== undefined && s.closing_cash !== null ? formatCurrency(s.closing_cash) : '—'}
                </td>
                <td className="py-3 px-4 text-right font-bold">
                  {s.cash_difference !== undefined && s.cash_difference !== null ? (
                    <span className={s.cash_difference === 0 ? 'text-emerald-600' : s.cash_difference > 0 ? 'text-sky-600' : 'text-rose-600'}>
                      {s.cash_difference > 0 ? `+${formatCurrency(s.cash_difference)}` : formatCurrency(s.cash_difference)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={s.status === 'open' ? 'success' : 'neutral'}>
                    {s.status === 'open' ? 'Đang hoạt động' : 'Đã kết ca'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
