import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { useToastStore } from '../../stores/toastStore';
import type { Category } from '../../types/database.types';
import { Boxes, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState('1');
  const toast = useToastStore();

  const loadData = async () => {
    const data = await categoryService.getAll();
    setCategories(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!name || !slug) {
      toast.error('Vui lòng nhập tên và slug');
      return;
    }
    try {
      if (editingCat) {
        await categoryService.update(editingCat.id, { name, slug, display_order: Number(order) });
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await categoryService.create({ name, slug, display_order: Number(order), is_active: true });
        toast.success('Tạo danh mục mới thành công!');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Lỗi khi lưu danh mục');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý Danh mục đồ uống</h1>
          <p className="text-xs text-slate-500 mt-1">Phân loại các dòng sản phẩm của Chill House</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingCat(null);
            setName('');
            setSlug('');
            setOrder((categories.length + 1).toString());
            setModalOpen(true);
          }}
        >
          Thêm danh mục
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3.5 px-4">Thứ tự</th>
              <th className="py-3.5 px-4">Tên danh mục</th>
              <th className="py-3.5 px-4">Đường dẫn (Slug)</th>
              <th className="py-3.5 px-4 text-center">Trạng thái</th>
              <th className="py-3.5 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-4 font-bold text-slate-500 w-20 text-center">{c.display_order}</td>
                <td className="py-3 px-4 font-bold text-slate-800 text-sm">{c.name}</td>
                <td className="py-3 px-4 font-mono text-slate-500">{c.slug}</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Kinh doanh
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => {
                      setEditingCat(c);
                      setName(c.name);
                      setSlug(c.slug);
                      setOrder(c.display_order.toString());
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCat ? 'Sửa danh mục' : 'Thêm danh mục mới'} maxWidth="sm">
        <div className="space-y-4">
          <Input
            label="Tên danh mục"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editingCat) {
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd')
                    .replace(/[^a-z0-9]/g, '-')
                );
              }
            }}
            required
          />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          <Input label="Thứ tự hiển thị" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSave}>Lưu danh mục</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
