import React, { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';
import { useToastStore } from '../../stores/toastStore';
import type { Customer } from '../../types/database.types';
import { Users, Plus, Search, Edit, Award } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../lib/utils';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCust, setEditingCust] = useState<Customer | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [points, setPoints] = useState('0');

  const toast = useToastStore();

  const loadData = async () => {
    const data = await customerService.getAll(search);
    setCustomers(data);
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleSave = async () => {
    if (!fullName || !phone) {
      toast.error('Vui lòng nhập tên và số điện thoại');
      return;
    }
    try {
      if (editingCust) {
        await customerService.update(editingCust.id, {
          full_name: fullName,
          phone,
          email,
          points: Number(points),
        });
        toast.success('Cập nhật khách hàng thành công!');
      } else {
        await customerService.create({
          full_name: fullName,
          phone,
          email,
          points: Number(points),
          total_spent: 0,
          customer_rank: 'Standard',
        });
        toast.success('Tạo khách hàng mới thành công!');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Lỗi khi lưu khách hàng');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản lý Khách hàng & Thành viên
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi điểm tích lũy, hạng thành viên và tổng tiền chi tiêu
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingCust(null);
            setFullName('');
            setPhone('');
            setEmail('');
            setPoints('0');
            setModalOpen(true);
          }}
        >
          Thêm khách hàng
        </Button>
      </div>

      <div className="w-full sm:w-80">
        <Input
          placeholder="Tìm theo tên hoặc số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3.5 px-4">Tên khách hàng</th>
              <th className="py-3.5 px-4">Số điện thoại</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4 text-center">Hạng thành viên</th>
              <th className="py-3.5 px-4 text-right">Điểm tích lũy</th>
              <th className="py-3.5 px-4 text-right">Tổng chi tiêu</th>
              <th className="py-3.5 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-4 font-bold text-slate-800 text-sm">{c.full_name}</td>
                <td className="py-3 px-4 font-mono font-semibold text-slate-600">{c.phone}</td>
                <td className="py-3 px-4 text-slate-500">{c.email || '—'}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      c.customer_rank === 'VIP'
                        ? 'bg-purple-100 text-purple-800'
                        : c.customer_rank === 'Gold'
                        ? 'bg-amber-100 text-amber-800'
                        : c.customer_rank === 'Silver'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Award className="w-3 h-3" />
                    {c.customer_rank}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-black text-brand-800 text-sm">
                  {c.points}
                </td>
                <td className="py-3 px-4 text-right font-black text-slate-900">
                  {formatCurrency(c.total_spent)}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => {
                      setEditingCust(c);
                      setFullName(c.full_name);
                      setPhone(c.phone);
                      setEmail(c.email || '');
                      setPoints(c.points.toString());
                      setModalOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-brand-700 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCust ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'} maxWidth="sm">
        <div className="space-y-4">
          <Input label="Họ tên khách hàng" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Điểm tích lũy" type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSave}>Lưu khách hàng</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
