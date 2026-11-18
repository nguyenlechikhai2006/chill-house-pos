import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventoryService';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import type { Ingredient, InventoryTransaction } from '../../types/database.types';
import {
  Warehouse,
  Plus,
  Search,
  AlertTriangle,
  History,
  Sliders,
  ArrowDownRight,
  ArrowUpRight,
  Edit
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDateTime } from '../../lib/utils';

export const InventoryPage: React.FC = () => {
  const { profile } = useAuthStore();
  const toast = useToastStore();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'stock' | 'history'>('stock');
  const [search, setSearch] = useState('');

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState(false);
  const [selectedIng, setSelectedIng] = useState<Ingredient | null>(null);

  // Form states for create
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [unit, setUnit] = useState('g');
  const [currentStock, setCurrentStock] = useState('1000');
  const [minStock, setMinStock] = useState('200');
  const [costPrice, setCostPrice] = useState('100');

  // Form states for adjust
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'adjustment' | 'waste'>('adjustment');
  const [adjustNote, setAdjustNote] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ings, txs] = await Promise.all([
        inventoryService.getIngredients(),
        inventoryService.getTransactions(),
      ]);
      setIngredients(ings);
      setTransactions(txs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!name || !code) {
      toast.error('Vui lòng nhập tên và mã nguyên liệu');
      return;
    }
    try {
      await inventoryService.createIngredient({
        name,
        code,
        unit,
        current_stock: Number(currentStock),
        min_stock_level: Number(minStock),
        cost_price: Number(costPrice),
        is_active: true,
      });
      toast.success('Thêm nguyên liệu thành công!');
      setCreateModal(false);
      loadData();
    } catch (err: any) {
      toast.error('Lỗi khi tạo nguyên liệu');
    }
  };

  const handleAdjust = async () => {
    if (!selectedIng || !adjustQty) {
      toast.error('Vui lòng nhập số lượng điều chỉnh');
      return;
    }
    try {
      await inventoryService.adjustStock({
        ingredientId: selectedIng.id,
        quantityChange: Number(adjustQty),
        transactionType: adjustType,
        note: adjustNote.trim() || 'Điều chỉnh kiểm kê',
        userId: profile?.id || 'demo-user-id',
      });
      toast.success('Điều chỉnh kho thành công!');
      setAdjustModal(false);
      setSelectedIng(null);
      setAdjustQty('');
      setAdjustNote('');
      loadData();
    } catch (err: any) {
      toast.error('Lỗi khi điều chỉnh tồn kho');
    }
  };

  const filtered = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(search.toLowerCase()) || ing.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Kho Nguyên Liệu & Tồn Kho
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý nguyên liệu pha chế, định mức tồn an toàn và lịch sử xuất nhập
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setCode(`ING-${Math.floor(100 + Math.random() * 900)}`);
              setCreateModal(true);
            }}
          >
            Thêm nguyên liệu mới
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab('stock')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            tab === 'stock'
              ? 'border-brand-700 text-brand-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Tồn kho hiện tại ({ingredients.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            tab === 'history'
              ? 'border-brand-700 text-brand-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Lịch sử biến động kho ({transactions.length})
        </button>
      </div>

      {tab === 'stock' ? (
        <div className="space-y-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Tìm nguyên liệu theo tên, mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Tên nguyên liệu</th>
                    <th className="py-3.5 px-4">Mã SKU</th>
                    <th className="py-3.5 px-4">Đơn vị</th>
                    <th className="py-3.5 px-4 text-right">Tồn kho hiện tại</th>
                    <th className="py-3.5 px-4 text-right">Định mức tối thiểu</th>
                    <th className="py-3.5 px-4 text-right">Giá vốn</th>
                    <th className="py-3.5 px-4 text-center">Tình trạng</th>
                    <th className="py-3.5 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((ing) => {
                    const isLow = Number(ing.current_stock) <= Number(ing.min_stock_level);
                    return (
                      <tr key={ing.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-bold text-slate-800">{ing.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{ing.code}</td>
                        <td className="py-3 px-4 font-semibold text-slate-600">{ing.unit}</td>
                        <td className={`py-3 px-4 text-right font-black text-sm ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                          {ing.current_stock.toLocaleString('vi-VN')} {ing.unit}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500">
                          {ing.min_stock_level.toLocaleString('vi-VN')} {ing.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-700">
                          {formatCurrency(ing.cost_price)}/{ing.unit}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              <AlertTriangle className="w-3 h-3" /> Sắp hết
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Đủ hàng
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedIng(ing);
                              setAdjustModal(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
                          >
                            Kiểm kê / Chỉnh
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* History Transactions Table */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Nguyên liệu</th>
                  <th className="py-3.5 px-4">Loại giao dịch</th>
                  <th className="py-3.5 px-4 text-right">Biến động</th>
                  <th className="py-3.5 px-4 text-right">Tồn sau cùng</th>
                  <th className="py-3.5 px-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {formatDateTime(tx.created_at)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {tx.ingredients?.name || 'Nguyên liệu'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.transaction_type === 'import' ? 'bg-emerald-50 text-emerald-700' :
                        tx.transaction_type === 'order_deduct' ? 'bg-sky-50 text-sky-700' :
                        tx.transaction_type === 'return' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {tx.transaction_type === 'import' ? 'Nhập kho' :
                         tx.transaction_type === 'order_deduct' ? 'Bán hàng (POS)' :
                         tx.transaction_type === 'return' ? 'Hoàn trả do hủy' : 'Hao hụt / Chỉnh'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-black ${Number(tx.quantity_change) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {Number(tx.quantity_change) > 0 ? `+${tx.quantity_change}` : tx.quantity_change} {tx.ingredients?.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {tx.balance_after} {tx.ingredients?.unit}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{tx.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: THÊM NGUYÊN LIỆU MỚI */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Thêm nguyên liệu pha chế" maxWidth="md">
        <div className="space-y-4">
          <Input label="Tên nguyên liệu" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Mã nguyên liệu" value={code} onChange={(e) => setCode(e.target.value)} required />
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Đơn vị tính</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
              >
                <option value="g">Gam (g)</option>
                <option value="ml">Mililít (ml)</option>
                <option value="ly">Ly / Cốc</option>
                <option value="ong_hut">Ống hút</option>
                <option value="hop">Hộp</option>
                <option value="chai">Chai</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Tồn kho ban đầu" type="number" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} />
            <Input label="Định mức tối thiểu" type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
            <Input label="Giá vốn" type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreate}>Lưu nguyên liệu</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: ĐIỀU CHỈNH / KIỂM KÊ KHO */}
      <Modal isOpen={adjustModal} onClose={() => setAdjustModal(false)} title={`Điều chỉnh kho: ${selectedIng?.name}`} maxWidth="sm">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Tồn kho hiện tại: <strong className="text-slate-800">{selectedIng?.current_stock} {selectedIng?.unit}</strong>
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Loại điều chỉnh</label>
            <select
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value as any)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
            >
              <option value="adjustment">Kiểm kê cân bằng (+ hoặc -)</option>
              <option value="waste">Hao hụt / Đổ bỏ / Hỏng hóc (-)</option>
            </select>
          </div>

          <Input
            label="Số lượng thay đổi (dương để cộng, âm để trừ)"
            type="number"
            value={adjustQty}
            onChange={(e) => setAdjustQty(e.target.value)}
            placeholder="VD: -500 hoặc 1000"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Lý do điều chỉnh</label>
            <textarea
              value={adjustNote}
              onChange={(e) => setAdjustNote(e.target.value)}
              rows={2}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
              placeholder="VD: Trà ủ quá 4 tiếng đổ bỏ, sai số pha chế..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAdjustModal(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleAdjust}>Xác nhận điều chỉnh</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
