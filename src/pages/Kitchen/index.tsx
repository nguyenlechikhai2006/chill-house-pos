import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types/database.types';
import { useToastStore } from '../../stores/toastStore';
import { Sparkles, CheckCircle2, Clock, Printer, RefreshCw } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDateTime } from '../../lib/utils';

export const KitchenPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToastStore();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAll();
      // Filter for orders that are completed or preparing
      setOrders(data.filter((o) => o.status !== 'cancelled').slice(0, 12));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Polling/Realtime refresh
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success(`Đã cập nhật trạng thái đơn thành ${newStatus === 'completed' ? 'Hoàn thành' : 'Đang làm'}`);
      fetchOrders();
    } catch (err: any) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-700" />
            Màn hình Bếp & Pha chế (KDS Bar)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hiển thị danh sách ly đồ uống cần pha chế theo thời gian thực
          </p>
        </div>
        <Button variant="outline" size="sm" icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />} onClick={fetchOrders}>
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {orders.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
            <Clock className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
            <p className="font-bold text-sm text-slate-700">Hiện không có đơn nào cần làm</p>
            <p className="text-xs mt-1">Đơn hàng mới từ quầy thu ngân sẽ tự động xuất hiện tại đây</p>
          </div>
        ) : (
          orders.map((ord) => (
            <div
              key={ord.id}
              className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between ${
                ord.status === 'completed' ? 'border-emerald-300 bg-emerald-50/10' : 'border-brand-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div>
                    <span className="font-black text-sm text-brand-900 tracking-tight">{ord.order_code}</span>
                    <p className="text-[10px] text-slate-400">{formatDateTime(ord.created_at)}</p>
                  </div>
                  <Badge variant={ord.status === 'completed' ? 'success' : 'warning'}>
                    {ord.status === 'completed' ? 'Đã pha chế xong' : 'Chờ pha chế'}
                  </Badge>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-3">
                  {ord.order_items?.map((item, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-baseline">
                        <span className="font-extrabold text-xs text-slate-800">
                          {item.product_name} ({item.size})
                        </span>
                        <span className="text-xs font-black text-brand-800 bg-brand-100 px-1.5 py-0.5 rounded">
                          x{item.quantity}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600 mt-1">
                        Đường: <span className="text-brand-800">{item.sugar_level}</span> | Đá: <span className="text-brand-800">{item.ice_level}</span>
                      </div>
                      {item.toppings?.length > 0 && (
                        <div className="text-[10px] font-medium text-emerald-700 mt-0.5">
                          + {item.toppings.map((t) => `${t.topping_name} x${t.quantity}`).join(', ')}
                        </div>
                      )}
                      {item.notes && (
                        <p className="text-[10px] italic text-rose-600 font-semibold mt-0.5">
                          * {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Printer className="w-3.5 h-3.5" />}
                  onClick={() => window.printStickers && window.printStickers(ord)}
                >
                  In tem dán ly
                </Button>

                {ord.status !== 'completed' ? (
                  <Button
                    variant="success"
                    size="sm"
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    onClick={() => handleUpdateStatus(ord.id, 'completed')}
                  >
                    Hoàn thành
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Printer className="w-3.5 h-3.5" />}
                    onClick={() => window.printReceipt && window.printReceipt(ord)}
                  >
                    In lại Bill
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
