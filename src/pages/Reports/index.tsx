import React, { useState, useEffect } from 'react';
import { reportService, type DashboardMetrics } from '../../services/reportService';
import { BarChart3, Download, TrendingUp, DollarSign, Package } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('month');

  useEffect(() => {
    reportService.getDashboardMetrics().then((m) => setMetrics(m));
  }, []);

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Báo Cáo & Phân Tích Tài Chính
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Báo cáo doanh thu, giá vốn nguyên liệu (COGS), chi phí hoạt động và lợi nhuận thuần
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<Download className="w-4 h-4" />}
          onClick={() => reportService.exportToCSV(metrics.topSellingProducts, 'bao-cao-loi-nhuan-chill-house')}
        >
          Xuất báo cáo (CSV)
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng doanh thu bán hàng</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(metrics.monthRevenue)}</h3>
          <p className="text-xs text-slate-500 mt-1">Ghi nhận từ toàn bộ hóa đơn thành công</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giá vốn & Chi phí vận hành</span>
          <h3 className="text-2xl font-black text-rose-600 mt-2">
            -{formatCurrency(metrics.totalExpenses + (metrics.monthRevenue - metrics.estimatedProfit - metrics.totalExpenses))}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Chi phí nguyên vật liệu + Mặt bằng, điện, nước</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs bg-emerald-50/20">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Lợi nhuận ước tính (EBITDA)</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-2">{formatCurrency(metrics.estimatedProfit)}</h3>
          <p className="text-xs text-emerald-700 font-semibold mt-1">
            Tỷ suất lợi nhuận ròng: ~{Math.round((metrics.estimatedProfit / metrics.monthRevenue) * 100)}%
          </p>
        </div>
      </div>

      {/* Chart: Top selling product revenues */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="mb-4">
          <h3 className="font-extrabold text-sm text-slate-800">Doanh thu theo các dòng sản phẩm chủ lực</h3>
          <p className="text-xs text-slate-400">Doanh số đóng góp của từng món đồ uống</p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.topSellingProducts} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), 'Doanh số']} />
              <Bar dataKey="revenue" fill="#8c5846" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
