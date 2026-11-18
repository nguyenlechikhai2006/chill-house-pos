import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  Store,
  Receipt,
  Coffee,
  Boxes,
  Scroll,
  Warehouse,
  Truck,
  Users,
  UserCheck,
  CreditCard,
  TicketPercent,
  BarChart3,
  Settings,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useAuthStore();

  const navItems: NavItem[] = [
    { name: 'Tổng quan', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['admin', 'manager'] },
    { name: 'Bán hàng (POS)', path: '/pos', icon: <Store className="w-5 h-5" />, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Màn hình Bếp (KDS)', path: '/kitchen', icon: <Sparkles className="w-5 h-5" />, roles: ['admin', 'manager', 'cashier', 'staff'] },
    { name: 'Đơn hàng', path: '/orders', icon: <Receipt className="w-5 h-5" />, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Sản phẩm & Menu', path: '/products', icon: <Coffee className="w-5 h-5" />, roles: ['admin', 'manager'] },
    { name: 'Danh mục', path: '/categories', icon: <Boxes className="w-5 h-5" />, roles: ['admin', 'manager'] },
    { name: 'Công thức pha chế', path: '/recipes', icon: <Scroll className="w-5 h-5" />, roles: ['admin', 'manager'] },
    { name: 'Kho nguyên liệu', path: '/inventory', icon: <Warehouse className="w-5 h-5" />, roles: ['admin', 'manager'] },
    { name: 'Nhập hàng', path: '/purchases', icon: <Truck className="w-5 h-5" />, roles: ['admin', 'manager'] },
    { name: 'Nhà cung cấp', path: '/suppliers', icon: <Warehouse className="w-5 h-5" />, roles: ['admin', 'manager'] },
    { name: 'Khách hàng', path: '/customers', icon: <Users className="w-5 h-5" />, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Nhân viên & Quyền', path: '/employees', icon: <UserCheck className="w-5 h-5" />, roles: ['admin'] },
    { name: 'Ca làm việc & Két', path: '/shifts', icon: <Clock className="w-5 h-5" />, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Chi phí vận hành', path: '/expenses', icon: <CreditCard className="w-5 h-5" />, roles: ['admin', 'manager'] },
    { name: 'Khuyến mãi & Voucher', path: '/promotions', icon: <TicketPercent className="w-5 h-5" />, roles: ['admin', 'manager'] },
    { name: 'Báo cáo doanh thu', path: '/reports', icon: <BarChart3 className="w-5 h-5" />, roles: ['admin', 'manager'] },
    { name: 'Cài đặt hệ thống', path: '/settings', icon: <Settings className="w-5 h-5" />, roles: ['admin'] },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        'relative bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-30 select-none shadow-sm print:hidden',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-brand-700 text-white flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
            CH
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-brand-900 text-base tracking-tight leading-tight">
                Chill House
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Coffee & Tea POS</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition hidden md:block"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
            title={collapsed ? item.name : undefined}
          >
            <span className="flex-shrink-0 transition-transform group-hover:scale-110">
              {item.icon}
            </span>
            {!collapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer User Info */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
            {role.slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {role === 'admin' ? 'Chủ cửa hàng' : role === 'manager' ? 'Quản lý' : 'Thu ngân'}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Đang trực tuyến
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
