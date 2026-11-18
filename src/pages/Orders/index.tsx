import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { reportService } from '../../services/reportService';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import type { Order } from '../../types/database.types';
import {
  Search,
  Filter,
  Eye,
  Printer,
  RotateCcw,
  Receipt,
  Download,
  Calendar,
  CreditCard,
  Ban
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDateTime } from '../../lib/utils';

export const OrdersPage: React.FC = () => {
  const { profile, role } = useAuthStore();
  const toast = useToastStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected order details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Cancel order modal
  const [cancelModal, setCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.order_code.toLowerCase().includes(search.toLowerCase()) ||
      (o.customers?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customers?.phone || '').includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn bắt buộc!');
      return;
    }

    setIsCancelling(true);
    try {
      const res = await orderService.cancelOrder(
        orderToCancel.id,
        profile?.id || 'demo-user-id',
        cancelReason.trim()
      );
      if (res.success) {
        toast.success('Đã hủy đơn hàng và hoàn trả nguyên liệu vào kho thành công!');
        setCancelModal(false);
        setOrderToCancel(null);
        setCancelReason('');
        fetchOrders();
      } else {
        toast.error(res.message || 'Lỗi khi hủy đơn');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi xử lý');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản lý đơn hàng Chill House
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tất cả giao dịch bán hàng, trạng thái thanh toán và in hóa đơn
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Download className="w-4 h-4" />}
          onClick={() => {
            const exportData = orders.map((o) => ({
              'Mã đơn': o.order_code,
              'Thời gian': formatDateTime(o.created_at),
              'Khách hàng': o.customers?.full_name || 'Khách vãng lai',
              'Tổng tiền': o.total_amount,
              'Giảm giá': o.discount_amount,
              'Trạng thái': o.status,
              'Thanh toán': o.payment_status,
            }));
            reportService.exportToCSV(exportData, 'danh-sach-don-hang-chill-house');
          }}
        >
          Xuất dữ liệu
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Tìm theo mã đơn (CH...), tên hoặc SĐT khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'completed', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === st
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'Tất cả đơn' : st === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Mã đơn hàng</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Món & Số lượng</th>
                <th className="py-3.5 px-4 text-right">Tổng thanh toán</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy đơn hàng nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-brand-900">
                      {ord.order_code}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDateTime(ord.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      {ord.customers ? (
                        <div>
                          <p className="font-bold text-slate-800">{ord.customers.full_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{ord.customers.phone}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Khách vãng lai</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                      {ord.order_items?.map((it) => `${it.product_name} (${it.size}) x${it.quantity}`).join(', ') || 'Chi tiết đơn'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                      {formatCurrency(ord.total_amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={ord.status === 'completed' ? 'success' : ord.status === 'cancelled' ? 'danger' : 'warning'}>
                        {ord.status === 'completed' ? 'Hoàn thành' : ord.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 text-slate-500 hover:text-brand-700 hover:bg-slate-100 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.printReceipt && window.printReceipt(ord)}
                          className="p-1.5 text-slate-500 hover:text-brand-700 hover:bg-slate-100 rounded-lg transition"
                          title="In hóa đơn"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {ord.status !== 'cancelled' && ['admin', 'manager'].includes(role) && (
                          <button
                            onClick={() => {
                              setOrderToCancel(ord);
                              setCancelModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hủy đơn & hoàn kho"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: XEM CHI TIẾT ĐƠN HÀNG */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Chi tiết đơn hàng: ${selectedOrder?.order_code}`}
        maxWidth="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-500">Thời gian tạo:</p>
                <p className="font-bold text-slate-800">{formatDateTime(selectedOrder.created_at)}</p>
              </div>
              <div>
                <p className="text-slate-500">Khách hàng:</p>
                <p className="font-bold text-slate-800">
                  {selectedOrder.customers?.full_name || 'Khách vãng lai'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Trạng thái kho:</p>
                <p className="font-bold text-emerald-600">
                  {selectedOrder.inventory_deducted ? '✓ Đã trừ nguyên liệu pha chế' : 'Chưa trừ kho'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Hình thức thanh toán:</p>
                <p className="font-bold text-brand-800 uppercase">
                  {selectedOrder.payments?.[0]?.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản (VietQR)'}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase">Danh sách món:</h4>
              <div className="space-y-1.5">
                {selectedOrder.order_items?.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-start text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{item.product_name} ({item.size}) x{item.quantity}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.sugar_level} đường • {item.ice_level} đá</p>
                      {item.toppings?.length > 0 && (
                        <p className="text-[10px] text-brand-700 mt-0.5">+ {item.toppings.map((t) => `${t.topping_name} x${t.quantity}`).join(', ')}</p>
                      )}
                    </div>
                    <span className="font-bold text-slate-800">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-slate-200 pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {Number(selectedOrder.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Giảm giá:</span>
                  <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                <span>Tổng cộng:</span>
                <span className="text-brand-800">{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => window.printStickers && window.printStickers(selectedOrder)}
              >
                In tem dán ly
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => window.printReceipt && window.printReceipt(selectedOrder)}
              >
                In hóa đơn
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: HỦY ĐƠN HÀNG & HOÀN KHO */}
      <Modal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        title={`Hủy đơn hàng ${orderToCancel?.order_code}`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium leading-relaxed">
            ⚠️ Thao tác này sẽ cập nhật trạng thái đơn thành "Đã hủy", chuyển trạng thái thanh toán sang "Hoàn tiền" và tự động cộng hoàn trả lại nguyên liệu vào kho!
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Lý do hủy đơn (Bắt buộc)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
              placeholder="VD: Khách đổi ý, pha nhầm món..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCancelModal(false)}>
              Quay lại
            </Button>
            <Button variant="danger" loading={isCancelling} onClick={handleCancelOrder}>
              Xác nhận hủy & Hoàn kho
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
