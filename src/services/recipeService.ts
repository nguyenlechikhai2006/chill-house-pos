import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Recipe } from '../types/database.types';

export const recipeService = {
  async getAll(): Promise<Recipe[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('recipes')
      .select('*, product_variants(*, products(*)), recipe_items(*, ingredients(*))');

    if (error) throw error;
    return data || [];
  },

  async getByVariantId(variantId: string): Promise<Recipe | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('recipes')
      .select('*, recipe_items(*, ingredients(*))')
      .eq('product_variant_id', variantId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async saveRecipe(variantId: string, items: { ingredient_id: string; quantity: number; unit: string }[], notes?: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    // Check or insert recipe header
    const { data: existing } = await supabase
      .from('recipes')
      .select('id')
      .eq('product_variant_id', variantId)
      .maybeSingle();

    let recipeId = existing?.id;

    if (!recipeId) {
      const { data: created, error } = await supabase
        .from('recipes')
        .insert({ product_variant_id: variantId, notes })
        .select('id')
        .single();
      if (error) throw error;
      recipeId = created.id;
    } else {
      await supabase.from('recipes').update({ notes }).eq('id', recipeId);
      // Remove old items to replace
      await supabase.from('recipe_items').delete().eq('recipe_id', recipeId);
    }

    // Insert new items
    if (items.length > 0) {
      const payload = items.map((it) => ({
        recipe_id: recipeId,
        ingredient_id: it.ingredient_id,
        quantity: it.quantity,
        unit: it.unit,
      }));
      const { error: insErr } = await supabase.from('recipe_items').insert(payload);
      if (insErr) throw insErr;
    }
  }
};
