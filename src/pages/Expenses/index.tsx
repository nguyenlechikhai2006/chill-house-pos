import React, { useState, useEffect } from 'react';
import { expenseService } from '../../services/expenseService';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import type { Expense, ExpenseCategory } from '../../types/database.types';
import { CreditCard, Plus, Trash2, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../lib/utils';

export const ExpensesPage: React.FC = () => {
  const { profile } = useAuthStore();
  const toast = useToastStore();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    const [exps, cats] = await Promise.all([
      expenseService.getAll(),
      expenseService.getCategories(),
    ]);
    setExpenses(exps);
    setCategories(cats);
    if (cats.length > 0) setCategoryId(cats[0].id);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!title || !amount || !categoryId) {
      toast.error('Vui lòng điền đủ thông tin chi phí');
      return;
    }
    try {
      await expenseService.create({
        title,
        expense_category_id: categoryId,
        amount: Number(amount),
        payment_method: paymentMethod,
        expense_date: expenseDate,
        recorded_by: profile?.id || 'demo-user-id',
        notes,
      });
      toast.success('Ghi nhận chi phí thành công!');
      setModalOpen(false);
      setTitle('');
      setAmount('');
      setNotes('');
      loadData();
    } catch (err: any) {
      toast.error('Lỗi khi lưu khoản chi');
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản lý Chi Phí Hoạt Động
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ghi chép tiền mặt bằng, điện nước, marketing, lương nhân viên của quán
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-xs">
            <span className="text-amber-800 font-semibold">Tổng chi: </span>
            <span className="font-extrabold text-amber-950 text-sm">{formatCurrency(totalExpense)}</span>
          </div>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Ghi nhận khoản chi
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3.5 px-4">Ngày chi</th>
              <th className="py-3.5 px-4">Khoản chi</th>
              <th className="py-3.5 px-4">Danh mục</th>
              <th className="py-3.5 px-4">Phương thức</th>
              <th className="py-3.5 px-4 text-right">Số tiền (VNĐ)</th>
              <th className="py-3.5 px-4">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-4 font-mono text-slate-500">{formatDate(exp.expense_date)}</td>
                <td className="py-3 px-4 font-bold text-slate-800 text-sm">{exp.title}</td>
                <td className="py-3 px-4 font-semibold text-brand-800">
                  {exp.expense_categories?.name || categories.find((c) => c.id === exp.expense_category_id)?.name || 'Vận hành'}
                </td>
                <td className="py-3 px-4">
                  <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                    {exp.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-black text-rose-600 text-sm">
                  -{formatCurrency(exp.amount)}
                </td>
                <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{exp.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: GHI KHOẢN CHI MỚI */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ghi nhận chi phí hoạt động" maxWidth="md">
        <div className="space-y-4">
          <Input label="Tên khoản chi / Nội dung" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Tiền điện tháng 11, Mua nước rửa chén..." required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Loại chi phí</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Input label="Số tiền (VNĐ)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500000" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Hình thức chi</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
              >
                <option value="cash">Tiền mặt từ két</option>
                <option value="bank_transfer">Chuyển khoản ngân hàng</option>
              </select>
            </div>
            <Input label="Ngày thực hiện" type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
          </div>

          <Input label="Ghi chú chi tiết" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSave}>Lưu khoản chi</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
