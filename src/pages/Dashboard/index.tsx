import React, { useState, useEffect } from 'react';
import { reportService, type DashboardMetrics } from '../../services/reportService';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types/database.types';
import {
  TrendingUp,
  Receipt,
  Coffee,
  AlertTriangle,
  Calendar,
  DollarSign,
  ArrowUpRight,
  PackageCheck,
  Download,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportService.getDashboardMetrics(),
      orderService.getAll()
    ]).then(([m, orders]) => {
      setMetrics(m);
      setRecentOrders(orders.slice(0, 6));
      setLoading(false);
    });
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-700 rounded-full animate-spin" />
      </div>
    );
  }

  const COLORS = ['#8c5846', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Tổng quan kinh doanh Chill House
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Số liệu kinh doanh thời gian thực • Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => reportService.exportToCSV(metrics.revenueByDay, 'bao-cao-doanh-thu-chill-house')}
          >
            Xuất Excel/CSV
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Doanh thu hôm nay</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(metrics.todayRevenue)}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Tăng trưởng tích cực</span>
            </p>
          </div>
        </div>

        {/* Card 2: Month Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Doanh thu tháng này</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(metrics.monthRevenue)}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Ước tính lợi nhuận: <span className="font-bold text-emerald-600">{formatCurrency(metrics.estimatedProfit)}</span>
            </p>
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng đơn hoàn thành</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.totalOrders} đơn
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {metrics.totalCustomers} khách hàng thành viên
            </p>
          </div>
        </div>

        {/* Card 4: Operating Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng chi phí vận hành</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(metrics.totalExpenses)}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Điện nước, mặt bằng, nhân công
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Trend 7 Days (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">Biểu đồ doanh thu 7 ngày gần nhất</h3>
              <p className="text-xs text-slate-400">Xu hướng bán hàng qua các ngày trong tuần</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              VNĐ
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.revenueByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8c5846" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8c5846" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Doanh thu']}
                  labelFormatter={(lbl) => `Ngày ${lbl}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8c5846" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Category (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">Tỷ trọng doanh thu danh mục</h3>
            <p className="text-xs text-slate-400">Phân bố doanh số theo nhóm đồ uống</p>
          </div>

          <div className="h-52 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.revenueByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {metrics.revenueByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, 'Tỷ trọng']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {metrics.revenueByCategory.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 truncate">{cat.name} ({cat.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Selling & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top 5 Best Sellers */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-slate-800">Top 5 đồ uống bán chạy nhất</h3>
            <span className="text-xs font-semibold text-brand-700">Xếp hạng theo số lượng</span>
          </div>

          <div className="space-y-3">
            {metrics.topSellingProducts.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs ${
                    idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">{p.name}</h5>
                    <p className="text-[11px] text-slate-400">Doanh thu: {formatCurrency(p.revenue)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm text-brand-800">{p.quantity}</span>
                  <span className="text-xs text-slate-500 ml-1">ly</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-amber-700">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-extrabold text-sm text-slate-800">Cảnh báo nguyên liệu sắp hết</h3>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto">
            {metrics.lowStockIngredients.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-6">
                <Coffee className="w-10 h-10 text-emerald-400 mb-2 stroke-1" />
                <p className="text-xs font-bold text-slate-700">Kho nguyên liệu an toàn</p>
                <p className="text-[11px] text-slate-400">Tất cả nguyên liệu đều ở mức tồn kho tối thiểu</p>
              </div>
            ) : (
              metrics.lowStockIngredients.map((ing) => (
                <div key={ing.id} className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-rose-950">{ing.name}</p>
                    <p className="text-[10px] text-rose-600 font-mono">Mã: {ing.code}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-700">
                      {ing.current_stock} {ing.unit}
                    </span>
                    <p className="text-[10px] text-slate-500">Tối thiểu: {ing.min_stock_level} {ing.unit}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
