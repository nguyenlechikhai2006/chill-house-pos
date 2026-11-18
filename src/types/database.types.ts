export type UserRole = 'admin' | 'manager' | 'cashier' | 'staff';

export interface Role {
  id: string;
  name: UserRole;
  display_name: string;
  description?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  role_id: string;
  employee_code: string;
  full_name: string;
  phone?: string;
  email?: string;
  address?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  roles?: Role;
}

export interface StoreSetting {
  id: string;
  store_name: string;
  logo_url?: string;
  phone: string;
  email: string;
  address: string;
  tax_number?: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_bin: string;
  invoice_footer: string;
  currency: string;
  timezone: string;
  vat_percent: number;
}

export interface Shift {
  id: string;
  profile_id: string;
  shift_name: string;
  start_time: string;
  end_time?: string;
  opening_cash: number;
  closing_cash?: number;
  expected_cash?: number;
  cash_difference?: number;
  total_sales: number;
  total_orders: number;
  notes?: string;
  status: 'open' | 'closed';
  created_at: string;
  profiles?: Profile;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export type ProductSize = 'S' | 'M' | 'L' | 'Standard';

export interface ProductVariant {
  id: string;
  product_id: string;
  size: ProductSize;
  price: number;
  cost_price: number;
  sku_variant?: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  sku: string;
  name: string;
  description?: string;
  image_url?: string;
  base_cost: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  categories?: Category;
  product_variants?: ProductVariant[];
}

export interface Ingredient {
  id: string;
  code: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock_level: number;
  cost_price: number;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  cost_price: number;
  ingredient_id?: string;
  default_quantity: number;
  is_active: boolean;
  ingredients?: Ingredient;
}

export interface RecipeItem {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  ingredients?: Ingredient;
}

export interface Recipe {
  id: string;
  product_variant_id: string;
  yield_amount: number;
  notes?: string;
  recipe_items?: RecipeItem[];
  product_variants?: ProductVariant & { products?: Product };
}

export interface InventoryTransaction {
  id: string;
  ingredient_id: string;
  transaction_type: 'import' | 'order_deduct' | 'waste' | 'adjustment' | 'return';
  reference_id?: string;
  quantity_change: number;
  balance_after: number;
  unit_cost?: number;
  note?: string;
  created_by?: string;
  created_at: string;
  ingredients?: Ingredient;
  profiles?: Profile;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_code?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  ingredient_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  expiry_date?: string;
  ingredients?: Ingredient;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  created_by: string;
  status: 'draft' | 'pending' | 'received' | 'cancelled';
  total_amount: number;
  notes?: string;
  received_at?: string;
  created_at: string;
  suppliers?: Supplier;
  profiles?: Profile;
  purchase_order_items?: PurchaseOrderItem[];
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  birthday?: string;
  address?: string;
  points: number;
  total_spent: number;
  customer_rank: 'Standard' | 'Silver' | 'Gold' | 'VIP';
  notes?: string;
  created_at: string;
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description?: string;
  discount_type: 'percent' | 'fixed_amount';
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
}

export type SugarLevel = '100%' | '70%' | '50%' | '30%' | '0%';
export type IceLevel = '100%' | '70%' | '50%' | '30%' | '0%' | 'Nóng';

export interface OrderItemTopping {
  id?: string;
  order_item_id?: string;
  topping_id: string;
  topping_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_variant_id: string;
  product_name: string;
  size: ProductSize;
  unit_price: number;
  cost_price: number;
  quantity: number;
  subtotal: number;
  sugar_level: SugarLevel;
  ice_level: IceLevel;
  notes?: string;
  toppings: OrderItemTopping[];
}

export interface Payment {
  id?: string;
  order_id: string;
  payment_method: 'cash' | 'bank_transfer' | 'momo' | 'vnpay';
  amount_paid: number;
  customer_given?: number;
  change_returned?: number;
  transaction_ref?: string;
  status: 'success' | 'failed' | 'refunded';
  created_at?: string;
}

export interface Order {
  id: string;
  order_code: string;
  shift_id?: string;
  cashier_id: string;
  customer_id?: string;
  subtotal: number;
  discount_amount: number;
  promotion_id?: string;
  total_amount: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  inventory_deducted: boolean;
  notes?: string;
  cancel_reason?: string;
  cancelled_by?: string;
  created_at: string;
  updated_at: string;
  customers?: Customer;
  profiles?: Profile;
  order_items?: OrderItem[];
  payments?: Payment[];
}

export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
}

export interface Expense {
  id: string;
  expense_category_id: string;
  title: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer';
  expense_date: string;
  recorded_by: string;
  receipt_image_url?: string;
  notes?: string;
  created_at: string;
  expense_categories?: ExpenseCategory;
  profiles?: Profile;
}
