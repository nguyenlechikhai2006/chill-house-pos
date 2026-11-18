import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { useToastStore } from '../../stores/toastStore';
import type { Category, Product, ProductSize, ProductVariant } from '../../types/database.types';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Coffee,
  CheckCircle2,
  XCircle,
  Tag
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency } from '../../lib/utils';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [baseCost, setBaseCost] = useState('8000');
  const [variants, setVariants] = useState<{ size: ProductSize; price: number; cost_price: number }[]>([
    { size: 'M', price: 35000, cost_price: 8000 },
    { size: 'L', price: 42000, cost_price: 10000 },
  ]);

  const toast = useToastStore();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`CH-${Math.floor(100 + Math.random() * 900)}`);
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80');
    setBaseCost('8000');
    setVariants([
      { size: 'M', price: 35000, cost_price: 8000 },
      { size: 'L', price: 42000, cost_price: 10000 },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategoryId(p.category_id);
    setDescription(p.description || '');
    setImageUrl(p.image_url || '');
    setBaseCost(p.base_cost.toString());
    if (p.product_variants && p.product_variants.length > 0) {
      setVariants(p.product_variants.map((v) => ({ size: v.size, price: v.price, cost_price: v.cost_price })));
    } else {
      setVariants([{ size: 'M', price: 35000, cost_price: 8000 }]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name || !sku || !categoryId) {
      toast.error('Vui lòng điền đầy đủ Tên, SKU và Danh mục');
      return;
    }

    try {
      if (editingProduct) {
        await productService.update(
          editingProduct.id,
          {
            name,
            sku,
            category_id: categoryId,
            description,
            image_url: imageUrl,
            base_cost: Number(baseCost),
          },
          variants.map((v) => ({ ...v, sku_variant: `${sku}-${v.size}` }))
        );
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await productService.create(
          {
            name,
            sku,
            category_id: categoryId,
            description,
            image_url: imageUrl,
            base_cost: Number(baseCost),
            is_active: true,
          },
          variants.map((v) => ({ ...v, sku_variant: `${sku}-${v.size}`, is_active: true }))
        );
        toast.success('Tạo mới sản phẩm thành công!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await productService.delete(deleteConfirmId);
      toast.success('Đã xóa sản phẩm');
      setDeleteConfirmId(null);
      loadData();
    } catch (err: any) {
      toast.error('Lỗi khi xóa sản phẩm');
    }
  };

  const filtered = products.filter((p) => {
    const matchCat = selectedCat === 'all' || p.category_id === selectedCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Quản lý Sản phẩm & Thực đơn
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập danh mục đồ uống, giá bán theo size S/M/L và giá vốn
          </p>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* Filter and search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCat === 'all' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Tất cả ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCat === c.id ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Ảnh & Sản phẩm</th>
                <th className="py-3.5 px-4">Mã SKU</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4">Giá bán theo size</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image_url || 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80'}
                        alt={p.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-800 text-xs sm:text-sm">{p.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{p.sku}</td>
                  <td className="py-3 px-4 font-semibold text-brand-800">
                    {p.categories?.name || categories.find((c) => c.id === p.category_id)?.name || 'Đồ uống'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {p.product_variants?.map((v) => (
                        <span key={v.id} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                          <strong className="text-brand-800 font-bold">{v.size}:</strong> {formatCurrency(v.price)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Đang bán
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-500 hover:text-brand-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CREATE / EDIT PRODUCT */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tên đồ uống" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Mã SKU" value={sku} onChange={(e) => setSku(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Danh mục</label>
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
            <Input label="Giá vốn cơ bản (ước tính)" type="number" value={baseCost} onChange={(e) => setBaseCost(e.target.value)} />
          </div>

          <Input label="Link hình ảnh (URL)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Mô tả sản phẩm</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
            />
          </div>

          {/* Variants configuration (Sizes) */}
          <div className="border-t border-slate-200 pt-3">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Giá bán theo Size</label>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-16 font-bold text-center bg-slate-100 py-2 rounded-xl text-xs">{v.size}</span>
                  <Input
                    placeholder="Giá bán"
                    type="number"
                    value={v.price}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[i].price = Number(e.target.value);
                      setVariants(updated);
                    }}
                  />
                  <Input
                    placeholder="Giá vốn"
                    type="number"
                    value={v.cost_price}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[i].cost_price = Number(e.target.value);
                      setVariants(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSave}>Lưu sản phẩm</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác này sẽ ngừng kinh doanh sản phẩm trên hệ thống POS."
      />
    </div>
  );
};
