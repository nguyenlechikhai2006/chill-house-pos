import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Product, ProductVariant, Topping } from '../types/database.types';

export const productService = {
  async getAll(): Promise<Product[]> {
    if (!isSupabaseConfigured()) {
      return [
        {
          id: 'p1',
          category_id: 'c1',
          sku: 'CF-SUA-DA',
          name: 'Cà phê sữa đá Chill',
          description: 'Cà phê Robusta mộc pha phin cùng sữa đặc béo ngọt truyền thống',
          image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80',
          base_cost: 7500,
          is_active: true,
          is_featured: true,
          created_at: new Date().toISOString(),
          product_variants: [
            { id: 'v1', product_id: 'p1', size: 'S', price: 25000, cost_price: 6000, sku_variant: 'CF-S', is_active: true },
            { id: 'v2', product_id: 'p1', size: 'M', price: 29000, cost_price: 7500, sku_variant: 'CF-M', is_active: true },
            { id: 'v3', product_id: 'p1', size: 'L', price: 35000, cost_price: 9500, sku_variant: 'CF-L', is_active: true },
          ]
        },
        {
          id: 'p2',
          category_id: 'c1',
          sku: 'BAC-XIU',
          name: 'Bạc xỉu 3 tầng Chill House',
          description: 'Sữa tươi, sữa đặc và chút cà phê phin đắng nhẹ',
          image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=80',
          base_cost: 8000,
          is_active: true,
          is_featured: true,
          created_at: new Date().toISOString(),
          product_variants: [
            { id: 'v4', product_id: 'p2', size: 'M', price: 32000, cost_price: 8000, sku_variant: 'BX-M', is_active: true },
            { id: 'v5', product_id: 'p2', size: 'L', price: 38000, cost_price: 10000, sku_variant: 'BX-L', is_active: true },
          ]
        },
        {
          id: 'p3',
          category_id: 'c2',
          sku: 'TS-CHILL-HOUSE',
          name: 'Trà sữa Chill House Signature',
          description: 'Trà đen Ceylon cao cấp hòa quyện bột béo thơm lừng',
          image_url: 'https://images.unsplash.com/photo-1558857563-b37cfb8f152f?w=500&q=80',
          base_cost: 9500,
          is_active: true,
          is_featured: true,
          created_at: new Date().toISOString(),
          product_variants: [
            { id: 'v6', product_id: 'p3', size: 'M', price: 35000, cost_price: 9500, sku_variant: 'TS-M', is_active: true },
            { id: 'v7', product_id: 'p3', size: 'L', price: 42000, cost_price: 12000, sku_variant: 'TS-L', is_active: true },
          ]
        },
        {
          id: 'p4',
          category_id: 'c2',
          sku: 'TS-OOLONG-NUONG',
          name: 'Trà sữa Ô Long Nướng',
          description: 'Trà Ô Long sao vàng rang củi đậm vị sữa béo',
          image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80',
          base_cost: 10500,
          is_active: true,
          is_featured: true,
          created_at: new Date().toISOString(),
          product_variants: [
            { id: 'v8', product_id: 'p4', size: 'M', price: 38000, cost_price: 10500, sku_variant: 'TS-OL-M', is_active: true },
            { id: 'v9', product_id: 'p4', size: 'L', price: 45000, cost_price: 13000, sku_variant: 'TS-OL-L', is_active: true },
          ]
        },
        {
          id: 'p5',
          category_id: 'c3',
          sku: 'TRA-DAO-CAM-SA',
          name: 'Trà Đào Cam Sả Tươi',
          description: 'Trà lài, đào ngâm giòn, cam tươi và sả thanh mát giải nhiệt',
          image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
          base_cost: 11000,
          is_active: true,
          is_featured: true,
          created_at: new Date().toISOString(),
          product_variants: [
            { id: 'v10', product_id: 'p5', size: 'M', price: 39000, cost_price: 11000, sku_variant: 'TD-M', is_active: true },
            { id: 'v11', product_id: 'p5', size: 'L', price: 45000, cost_price: 13500, sku_variant: 'TD-L', is_active: true },
          ]
        },
        {
          id: 'p6',
          category_id: 'c5',
          sku: 'MATCHA-DA-XAY',
          name: 'Matcha Đá Xay Macchiato',
          description: 'Matcha Nhật Bản xay tuyết mát lạnh phủ kem cheese béo mặn',
          image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&q=80',
          base_cost: 14000,
          is_active: true,
          is_featured: true,
          created_at: new Date().toISOString(),
          product_variants: [
            { id: 'v12', product_id: 'p6', size: 'M', price: 45000, cost_price: 14000, sku_variant: 'MDX-M', is_active: true },
            { id: 'v13', product_id: 'p6', size: 'L', price: 52000, cost_price: 16500, sku_variant: 'MDX-L', is_active: true },
          ]
        }
      ];
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), product_variants(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getToppings(): Promise<Topping[]> {
    if (!isSupabaseConfigured()) {
      return [
        { id: 't1', name: 'Trân châu đen dẻo', price: 8000, cost_price: 2500, default_quantity: 50, is_active: true },
        { id: 't2', name: 'Trân châu trắng 3Q', price: 10000, cost_price: 3200, default_quantity: 50, is_active: true },
        { id: 't3', name: 'Kem Cheese Macchiato béo', price: 12000, cost_price: 4500, default_quantity: 40, is_active: true },
        { id: 't4', name: 'Thạch đào giòn', price: 10000, cost_price: 3000, default_quantity: 40, is_active: true },
      ];
    }

    const { data, error } = await supabase
      .from('toppings')
      .select('*, ingredients(*)')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(product: Partial<Product>, variants: Partial<ProductVariant>[]): Promise<Product> {
    const { data: newProd, error: prodErr } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (prodErr) throw prodErr;

    if (variants.length > 0) {
      const variantPayload = variants.map((v) => ({
        ...v,
        product_id: newProd.id,
      }));
      const { error: varErr } = await supabase
        .from('product_variants')
        .insert(variantPayload);
      if (varErr) throw varErr;
    }

    return newProd;
  },

  async update(id: string, product: Partial<Product>, variants?: Partial<ProductVariant>[]): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (variants) {
      for (const v of variants) {
        if (v.id) {
          await supabase.from('product_variants').update(v).eq('id', v.id);
        } else {
          await supabase.from('product_variants').insert({ ...v, product_id: id });
        }
      }
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }
};
