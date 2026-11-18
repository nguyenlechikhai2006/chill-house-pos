import React, { useState, useEffect } from 'react';
import { purchaseService, supplierService } from '../../services/purchaseService';
import { inventoryService } from '../../services/inventoryService';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import type { Ingredient, PurchaseOrder, Supplier } from '../../types/database.types';
import { Truck, Plus, Trash2, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDateTime } from '../../lib/utils';

export const PurchasesPage: React.FC = () => {
  const { profile } = useAuthStore();
  const toast = useToastStore();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // New PO state
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ ingredient_id: string; quantity: number; unit_price: number; total_price: number }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    const [pos, sups, ings] = await Promise.all([
      purchaseService.getAll(),
      supplierService.getAll(),
      inventoryService.getIngredients(),
    ]);
    setOrders(pos);
    setSuppliers(sups);
    setIngredients(ings);
    if (sups.length > 0) setSupplierId(sups[0].id);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setNotes('');
    setItems([
      {
        ingredient_id: ingredients[0]?.id || '',
        quantity: 1000,
        unit_price: ingredients[0]?.cost_price || 100,
        total_price: (ingredients[0]?.cost_price || 100) * 1000,
      },
    ]);
    setModalOpen(true);
  };

  const handleAddItemRow = () => {
    if (ingredients.length === 0) return;
    setItems((prev) => [
      ...prev,
      {
        ingredient_id: ingredients[0].id,
        quantity: 1000,
        unit_price: ingredients[0].cost_price,
        total_price: ingredients[0].cost_price * 1000,
      },
    ]);
  };

  const handleCreatePO = async () => {
    if (!supplierId || items.length === 0) {
      toast.error('Vui lòng chọn nhà cung cấp và nguyên liệu');
      return;
    }

    setIsSaving(true);
    try {
      const totalAmt = items.reduce((sum, it) => sum + it.total_price, 0);
      const poNum = `PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;

      await purchaseService.create(
        {
          po_number: poNum,
          supplier_id: supplierId,
          created_by: profile?.id || 'demo-user-id',
          total_amount: totalAmt,
          notes,
        },
        items,
        true // Auto receive and update inventory stock
      );

      toast.success('Tạo phiếu nhập kho thành công! Tồn kho nguyên liệu đã được tự động cộng dồn.');
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Lỗi khi tạo phiếu nhập');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản lý Nhập Hàng & Mua Hàng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tạo phiếu nhập nguyên liệu từ nhà cung cấp và tự động tăng tồn kho
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Tạo phiếu nhập kho mới
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3.5 px-4">Mã phiếu nhập</th>
              <th className="py-3.5 px-4">Thời gian</th>
              <th className="py-3.5 px-4">Nhà cung cấp</th>
              <th className="py-3.5 px-4 text-right">Tổng giá trị</th>
              <th className="py-3.5 px-4 text-center">Trạng thái kho</th>
              <th className="py-3.5 px-4">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((po) => (
              <tr key={po.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-4 font-mono font-bold text-brand-900">{po.po_number}</td>
                <td className="py-3 px-4 text-slate-500">{formatDateTime(po.created_at)}</td>
                <td className="py-3 px-4 font-bold text-slate-800">{po.suppliers?.name || 'Nhà cung cấp'}</td>
                <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                  {formatCurrency(po.total_amount)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Đã nhập kho
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500">{po.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: TẠO PHIẾU NHẬP MỚI */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tạo phiếu nhập kho nguyên liệu" maxWidth="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chọn nhà cung cấp</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase">Danh sách nguyên liệu nhập:</label>
              <button onClick={handleAddItemRow} className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Thêm dòng
              </button>
            </div>

            {items.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <select
                  value={row.ingredient_id}
                  onChange={(e) => {
                    const ing = ingredients.find((i) => i.id === e.target.value);
                    const updated = [...items];
                    updated[idx].ingredient_id = e.target.value;
                    if (ing) {
                      updated[idx].unit_price = ing.cost_price;
                      updated[idx].total_price = ing.cost_price * updated[idx].quantity;
                    }
                    setItems(updated);
                  }}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                  ))}
                </select>

                <input
                  type="number"
                  value={row.quantity}
                  onChange={(e) => {
                    const qty = Number(e.target.value);
                    const updated = [...items];
                    updated[idx].quantity = qty;
                    updated[idx].total_price = qty * updated[idx].unit_price;
                    setItems(updated);
                  }}
                  className="w-24 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-center font-bold"
                  placeholder="Số lượng"
                />

                <input
                  type="number"
                  value={row.unit_price}
                  onChange={(e) => {
                    const price = Number(e.target.value);
                    const updated = [...items];
                    updated[idx].unit_price = price;
                    updated[idx].total_price = price * updated[idx].quantity;
                    setItems(updated);
                  }}
                  className="w-24 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-right font-medium"
                  placeholder="Đơn giá"
                />

                <span className="w-24 text-right font-bold text-xs text-brand-800">
                  {formatCurrency(row.total_price)}
                </span>

                <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm font-black p-3 bg-slate-100 rounded-xl">
            <span>Tổng giá trị phiếu nhập:</span>
            <span className="text-brand-800 text-base">
              {formatCurrency(items.reduce((sum, it) => sum + it.total_price, 0))}
            </span>
          </div>

          <Input label="Ghi chú phiếu nhập" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button variant="primary" loading={isSaving} onClick={handleCreatePO}>Xác nhận nhập kho & Tăng tồn</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
