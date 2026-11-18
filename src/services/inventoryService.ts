import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Ingredient, InventoryTransaction } from '../types/database.types';

export const inventoryService = {
  async getIngredients(): Promise<Ingredient[]> {
    if (!isSupabaseConfigured()) {
      return [
        { id: 'i1', code: 'ING-CF-ROBUSTA', name: 'Cà phê Robusta mộc', unit: 'g', current_stock: 14200, min_stock_level: 2000, cost_price: 180, is_active: true, created_at: '', updated_at: '' },
        { id: 'i2', code: 'ING-SUA-TUOI', name: 'Sữa tươi thanh trùng Barista', unit: 'ml', current_stock: 28500, min_stock_level: 5000, cost_price: 38, is_active: true, created_at: '', updated_at: '' },
        { id: 'i3', code: 'ING-SUA-DAC', name: 'Sữa đặc Ngôi Sao Phương Nam', unit: 'g', current_stock: 22100, min_stock_level: 3000, cost_price: 45, is_active: true, created_at: '', updated_at: '' },
        { id: 'i4', code: 'ING-TRA-DEN', name: 'Trà đen Ceylon Phúc Long', unit: 'g', current_stock: 7400, min_stock_level: 1000, cost_price: 220, is_active: true, created_at: '', updated_at: '' },
        { id: 'i5', code: 'ING-TRA-OOLONG', name: 'Trà Ô Long nướng rang củi', unit: 'g', current_stock: 5200, min_stock_level: 1000, cost_price: 320, is_active: true, created_at: '', updated_at: '' },
        { id: 'i6', code: 'ING-BOT-BEO', name: 'Bột kem béo thực vật Frima', unit: 'g', current_stock: 18500, min_stock_level: 3000, cost_price: 85, is_active: true, created_at: '', updated_at: '' },
        { id: 'i7', code: 'ING-SYRUP-DAO', name: 'Syrup Đào Monin', unit: 'ml', current_stock: 4600, min_stock_level: 800, cost_price: 320, is_active: true, created_at: '', updated_at: '' },
        { id: 'i8', code: 'ING-TRAN-CHAU-DEN', name: 'Trân châu đen Đài Loan', unit: 'g', current_stock: 1600, min_stock_level: 3000, cost_price: 55, is_active: true, created_at: '', updated_at: '' }, // LOW STOCK!
        { id: 'i9', code: 'ING-LY-NHUA-M', name: 'Ly nhựa PP 500ml (Size M)', unit: 'ly', current_stock: 2150, min_stock_level: 300, cost_price: 550, is_active: true, created_at: '', updated_at: '' },
      ];
    }

    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createIngredient(item: Partial<Ingredient>): Promise<Ingredient> {
    const { data, error } = await supabase
      .from('ingredients')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateIngredient(id: string, item: Partial<Ingredient>): Promise<Ingredient> {
    const { data, error } = await supabase
      .from('ingredients')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async adjustStock(params: {
    ingredientId: string;
    quantityChange: number;
    transactionType: 'adjustment' | 'waste';
    note: string;
    userId: string;
  }): Promise<void> {
    if (!isSupabaseConfigured()) return;

    // Fetch current
    const { data: ing, error: ingErr } = await supabase
      .from('ingredients')
      .select('current_stock')
      .eq('id', params.ingredientId)
      .single();

    if (ingErr) throw ingErr;

    const newStock = Number(ing.current_stock) + Number(params.quantityChange);

    const { error: updErr } = await supabase
      .from('ingredients')
      .update({ current_stock: newStock })
      .eq('id', params.ingredientId);

    if (updErr) throw updErr;

    const { error: txErr } = await supabase
      .from('inventory_transactions')
      .insert({
        ingredient_id: params.ingredientId,
        transaction_type: params.transactionType,
        quantity_change: params.quantityChange,
        balance_after: newStock,
        note: params.note,
        created_by: params.userId,
      });

    if (txErr) throw txErr;
  },

  async getTransactions(ingredientId?: string): Promise<InventoryTransaction[]> {
    if (!isSupabaseConfigured()) {
      return [
        {
          id: 'tx-1',
          ingredient_id: 'i1',
          transaction_type: 'import',
          quantity_change: 15000,
          balance_after: 15000,
          unit_cost: 180,
          note: 'Nhập kho ban đầu',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          ingredients: { id: 'i1', code: 'ING-CF-ROBUSTA', name: 'Cà phê Robusta mộc', unit: 'g' } as any
        },
        {
          id: 'tx-2',
          ingredient_id: 'i1',
          transaction_type: 'order_deduct',
          quantity_change: -800,
          balance_after: 14200,
          note: 'Xuất kho bán hàng trong ca',
          created_at: new Date().toISOString(),
          ingredients: { id: 'i1', code: 'ING-CF-ROBUSTA', name: 'Cà phê Robusta mộc', unit: 'g' } as any
        }
      ];
    }

    let query = supabase
      .from('inventory_transactions')
      .select('*, ingredients(*), profiles(*)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (ingredientId) {
      query = query.eq('ingredient_id', ingredientId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
};
