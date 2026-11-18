import React, { useState, useEffect } from 'react';
import { promotionService } from '../../services/promotionService';
import { useToastStore } from '../../stores/toastStore';
import type { Promotion } from '../../types/database.types';
import { TicketPercent, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../lib/utils';

export const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed_amount'>('percent');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrder, setMinOrder] = useState('50000');
  const [limit, setLimit] = useState('500');

  const toast = useToastStore();

  const loadData = async () => {
    const data = await promotionService.getAll();
    setPromotions(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!code || !title) {
      toast.error('Vui lòng nhập mã và tiêu đề voucher');
      return;
    }
    try {
      await promotionService.create({
        code: code.toUpperCase(),
        title,
        description,
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_value: Number(minOrder),
        usage_limit: Number(limit),
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000 * 60).toISOString(),
        is_active: true,
      });
      toast.success('Tạo chương trình khuyến mãi thành công!');
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Lỗi khi lưu khuyến mãi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Chương trình Khuyến mãi & Voucher</h1>
          <p className="text-xs text-slate-500 mt-1">Cấu hình mã giảm giá theo %, số tiền cố định và đơn hàng tối thiểu</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setCode('CHILL' + Math.floor(10 + Math.random() * 90));
            setTitle('');
            setDescription('');
            setModalOpen(true);
          }}
        >
          Tạo voucher mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {promotions.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-2xl border border-dashed border-brand-300 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="font-mono font-black text-lg text-brand-800 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
                  {p.code}
                </span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {p.discount_type === 'percent' ? `Giảm ${p.discount_value}%` : `Giảm ${formatCurrency(p.discount_value)}`}
                </span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm mt-3">{p.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{p.description}</p>
              <div className="mt-3 text-[11px] space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                <p>• Đơn tối thiểu: <strong>{formatCurrency(p.min_order_value)}</strong></p>
                <p>• Lượt đã dùng: <strong>{p.used_count || 0} / {p.usage_limit}</strong></p>
                <p>• Hạn sử dụng: <strong>{formatDate(p.end_date)}</strong></p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Thêm mã khuyến mãi mới" maxWidth="sm">
        <div className="space-y-4">
          <Input label="Mã voucher (In hoa)" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
          <Input label="Tên chương trình" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chào bạn mới Chill House" required />
          <Input label="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Loại giảm</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              >
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed_amount">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
            <Input label="Mức giảm" type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Đơn tối thiểu (VNĐ)" type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
            <Input label="Số lượt tối đa" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSave}>Lưu khuyến mãi</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
