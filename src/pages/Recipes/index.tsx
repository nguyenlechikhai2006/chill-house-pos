import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { inventoryService } from '../../services/inventoryService';
import { recipeService } from '../../services/recipeService';
import { useToastStore } from '../../stores/toastStore';
import type { Ingredient, Product, ProductVariant, Recipe } from '../../types/database.types';
import { Scroll, Plus, Trash2, Edit, Save, Calculator } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../lib/utils';

export const RecipesPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected variant for editing recipe
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [recipeModal, setRecipeModal] = useState(false);
  const [recipeItems, setRecipeItems] = useState<{ ingredient_id: string; quantity: number; unit: string }[]>([]);
  const [recipeNotes, setRecipeNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toast = useToastStore();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, ings] = await Promise.all([
        productService.getAll(),
        inventoryService.getIngredients(),
      ]);
      setProducts(prods);
      setIngredients(ings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openRecipeEditor = async (variant: ProductVariant, prodName: string) => {
    setSelectedVariant(variant);
    setSelectedProductName(prodName);
    const existing = await recipeService.getByVariantId(variant.id);
    if (existing && existing.recipe_items) {
      setRecipeItems(
        existing.recipe_items.map((it) => ({
          ingredient_id: it.ingredient_id,
          quantity: it.quantity,
          unit: it.unit,
        }))
      );
      setRecipeNotes(existing.notes || '');
    } else {
      setRecipeItems([
        { ingredient_id: ingredients[0]?.id || '', quantity: 20, unit: ingredients[0]?.unit || 'g' },
      ]);
      setRecipeNotes('');
    }
    setRecipeModal(true);
  };

  const handleAddIngredientRow = () => {
    if (ingredients.length === 0) return;
    setRecipeItems((prev) => [
      ...prev,
      { ingredient_id: ingredients[0].id, quantity: 10, unit: ingredients[0].unit },
    ]);
  };

  const handleRemoveRow = (idx: number) => {
    setRecipeItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleIngredientChange = (idx: number, ingId: string) => {
    const targetIng = ingredients.find((ing) => ing.id === ingId);
    setRecipeItems((prev) => {
      const updated = [...prev];
      updated[idx].ingredient_id = ingId;
      if (targetIng) updated[idx].unit = targetIng.unit;
      return updated;
    });
  };

  const handleSaveRecipe = async () => {
    if (!selectedVariant) return;
    setIsSaving(true);
    try {
      await recipeService.saveRecipe(selectedVariant.id, recipeItems, recipeNotes);
      toast.success('Lưu công thức pha chế thành công! Hệ thống sẽ trừ kho chính xác theo định lượng này.');
      setRecipeModal(false);
    } catch (err: any) {
      toast.error('Lỗi khi lưu công thức');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate estimated recipe cost
  const estimatedCost = recipeItems.reduce((acc, item) => {
    const ing = ingredients.find((i) => i.id === item.ingredient_id);
    if (!ing) return acc;
    return acc + Number(ing.cost_price) * Number(item.quantity);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Công Thức Pha Chế (BOM / Recipe)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Thiết lập định lượng nguyên liệu trừ kho cho từng kích thước ly (Size S, M, L)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((prod) => (
          <div key={prod.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <img
                  src={prod.image_url || 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80'}
                  alt={prod.name}
                  className="w-10 h-10 rounded-xl object-cover border"
                />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800">{prod.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</p>
                </div>
              </div>

              {/* Variants Recipe Setup */}
              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Các size có công thức:</p>
                {prod.product_variants?.map((v) => (
                  <div key={v.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-brand-900 bg-brand-100 px-2 py-0.5 rounded">
                        Size {v.size}
                      </span>
                      <span className="ml-2 font-medium text-slate-600">{formatCurrency(v.price)}</span>
                    </div>
                    <button
                      onClick={() => openRecipeEditor(v, prod.name)}
                      className="px-2.5 py-1 text-xs font-bold text-brand-700 bg-white border border-brand-200 hover:bg-brand-50 rounded-lg transition flex items-center gap-1 shadow-2xs"
                    >
                      <Edit className="w-3 h-3" />
                      Sửa công thức
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: RECIPE EDITOR */}
      <Modal
        isOpen={recipeModal}
        onClose={() => setRecipeModal(false)}
        title={`Công thức: ${selectedProductName} (Size ${selectedVariant?.size})`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-brand-50 p-3 rounded-xl border border-brand-200 text-xs">
            <div>
              <p className="font-bold text-brand-900">Chi phí nguyên liệu ước tính:</p>
              <p className="text-[11px] text-slate-600">Dựa trên giá vốn các nguyên liệu bên dưới</p>
            </div>
            <span className="text-base font-extrabold text-brand-800">
              {formatCurrency(estimatedCost)} / ly
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Danh sách nguyên liệu định lượng:
              </label>
              <button
                onClick={handleAddIngredientRow}
                className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Thêm nguyên liệu
              </button>
            </div>

            {recipeItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <select
                  value={item.ingredient_id}
                  onChange={(e) => handleIngredientChange(idx, e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const updated = [...recipeItems];
                    updated[idx].quantity = Number(e.target.value);
                    setRecipeItems(updated);
                  }}
                  className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-center font-bold"
                  placeholder="Lượng"
                />

                <span className="w-12 text-center text-xs font-semibold text-slate-500">{item.unit}</span>

                <button
                  onClick={() => handleRemoveRow(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ghi chú pha chế</label>
            <textarea
              value={recipeNotes}
              onChange={(e) => setRecipeNotes(e.target.value)}
              rows={2}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs"
              placeholder="VD: Cà phê phin chảy 4 phút, lắc đều với đá trước khi rót..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setRecipeModal(false)}>Hủy</Button>
            <Button variant="primary" loading={isSaving} onClick={handleSaveRecipe}>Lưu công thức</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
