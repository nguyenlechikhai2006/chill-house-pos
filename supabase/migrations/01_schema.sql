-- ============================================================================
-- CHILL HOUSE POS & F&B MANAGEMENT SYSTEM - DATABASE SCHEMA
-- File: 01_schema.sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'admin', 'manager', 'cashier', 'staff'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id),
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150),
    address TEXT,
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name VARCHAR(150) NOT NULL DEFAULT 'Chill House Coffee & Tea',
    logo_url TEXT,
    phone VARCHAR(30) DEFAULT '0988 123 456',
    email VARCHAR(100) DEFAULT 'contact@chillhouse.vn',
    address TEXT DEFAULT '123 Đường Cà Phê, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    tax_number VARCHAR(50),
    bank_name VARCHAR(100) DEFAULT 'MB Bank',
    bank_account_number VARCHAR(50) DEFAULT '999988889999',
    bank_account_name VARCHAR(100) DEFAULT 'CHILL HOUSE F&B',
    bank_bin VARCHAR(20) DEFAULT '970422', -- MB Bank BIN for VietQR
    invoice_footer TEXT DEFAULT 'Cảm ơn quý khách đã ghé Chill House! Hẹn gặp lại quý khách!',
    currency VARCHAR(10) DEFAULT 'VNĐ',
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    vat_percent NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WORK SHIFTS (Ca làm việc & kiểm két tiền mặt)
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id),
    shift_name VARCHAR(50) NOT NULL, -- 'Ca Sáng', 'Ca Chiều', 'Ca Tối'
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    opening_cash NUMERIC(12,2) NOT NULL DEFAULT 0, -- Tiền lẻ ban đầu
    closing_cash NUMERIC(12,2), -- Tiền đếm khi kết ca
    expected_cash NUMERIC(12,2), -- Tiền lý thuyết (opening + cash sales - cash refunds - cash expenses)
    cash_difference NUMERIC(12,2), -- Chênh lệch tiền mặt
    total_sales NUMERIC(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image_url TEXT,
    base_cost NUMERIC(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRODUCT VARIANTS (Size S, M, L)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL CHECK (size IN ('S', 'M', 'L', 'Standard')),
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    cost_price NUMERIC(12,2) DEFAULT 0,
    sku_variant VARCHAR(60) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, size)
);

-- 8. INGREDIENTS (Kho nguyên liệu pha chế)
CREATE TABLE IF NOT EXISTS public.ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    unit VARCHAR(30) NOT NULL, -- 'g', 'ml', 'ly', 'ong_hut', 'hop', 'chai'
    current_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
    min_stock_level NUMERIC(12,3) NOT NULL DEFAULT 10,
    cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TOPPINGS
CREATE TABLE IF NOT EXISTS public.toppings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    cost_price NUMERIC(12,2) DEFAULT 0,
    ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE SET NULL,
    default_quantity NUMERIC(10,2) DEFAULT 1, -- Khối lượng định lượng trừ kho (g hoặc ml)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PRODUCT TOPPING ALLOWANCE (Liên kết topping với sản phẩm)
CREATE TABLE IF NOT EXISTS public.product_toppings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    topping_id UUID NOT NULL REFERENCES public.toppings(id) ON DELETE CASCADE,
    UNIQUE(product_id, topping_id)
);

-- 11. RECIPES (Công thức định lượng theo từng Size sản phẩm)
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_variant_id UUID UNIQUE NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    yield_amount NUMERIC(10,2) DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. RECIPE ITEMS (Chi tiết nguyên liệu trong công thức)
CREATE TABLE IF NOT EXISTS public.recipe_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(12,3) NOT NULL, -- Lượng nguyên liệu cho 1 ly
    unit VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(recipe_id, ingredient_id)
);

-- 13. INVENTORY TRANSACTIONS (Lịch sử biến động kho)
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('import', 'order_deduct', 'waste', 'adjustment', 'return')),
    reference_id UUID, -- order_id, purchase_order_id, hoặc adjustment_id
    quantity_change NUMERIC(12,3) NOT NULL, -- Số âm nếu xuất/trừ kho, số dương nếu nhập
    balance_after NUMERIC(12,3) NOT NULL,
    unit_cost NUMERIC(12,2) DEFAULT 0,
    note TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. SUPPLIERS (Nhà cung cấp)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(100),
    address TEXT,
    tax_code VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. PURCHASE ORDERS (Phiếu nhập kho)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    status VARCHAR(30) DEFAULT 'received' CHECK (status IN ('draft', 'pending', 'received', 'cancelled')),
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. PURCHASE ORDER ITEMS (Chi tiết nguyên liệu nhập)
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(12,3) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. CUSTOMERS (Khách hàng & tích điểm)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(100),
    birthday DATE,
    address TEXT,
    points INTEGER DEFAULT 0,
    total_spent NUMERIC(12,2) DEFAULT 0,
    customer_rank VARCHAR(30) DEFAULT 'Standard' CHECK (customer_rank IN ('Standard', 'Silver', 'Gold', 'VIP')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. PROMOTIONS & VOUCHERS
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percent', 'fixed_amount')),
    discount_value NUMERIC(12,2) NOT NULL, -- e.g. 10 (%) or 20000 (VND)
    min_order_value NUMERIC(12,2) DEFAULT 0,
    max_discount_amount NUMERIC(12,2), -- Giảm tối đa nếu là percent
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    usage_limit INTEGER DEFAULT 1000,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. ORDERS (Đơn hàng)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code VARCHAR(50) UNIQUE NOT NULL,
    shift_id UUID REFERENCES public.shifts(id),
    cashier_id UUID NOT NULL REFERENCES public.profiles(id),
    customer_id UUID REFERENCES public.customers(id),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    promotion_id UUID REFERENCES public.promotions(id),
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) DEFAULT 'completed' CHECK (status IN ('pending', 'preparing', 'completed', 'cancelled')),
    payment_status VARCHAR(30) DEFAULT 'paid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    inventory_deducted BOOLEAN DEFAULT FALSE,
    notes TEXT,
    cancel_reason TEXT,
    cancelled_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. ORDER ITEMS (Chi tiết từng món trong đơn)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    product_name VARCHAR(150) NOT NULL,
    size VARCHAR(20) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    cost_price NUMERIC(12,2) DEFAULT 0,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(12,2) NOT NULL,
    sugar_level VARCHAR(20) DEFAULT '100%' CHECK (sugar_level IN ('100%', '70%', '50%', '30%', '0%')),
    ice_level VARCHAR(20) DEFAULT '100%' CHECK (ice_level IN ('100%', '70%', '50%', '30%', '0%', 'Nóng')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. ORDER ITEM TOPPINGS (Topping gắn theo món)
CREATE TABLE IF NOT EXISTS public.order_item_toppings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    topping_id UUID NOT NULL REFERENCES public.toppings(id),
    topping_name VARCHAR(100) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    subtotal NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. PAYMENTS (Giao dịch thanh toán)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'momo', 'vnpay')),
    amount_paid NUMERIC(12,2) NOT NULL,
    customer_given NUMERIC(12,2),
    change_returned NUMERIC(12,2) DEFAULT 0,
    transaction_ref VARCHAR(100),
    status VARCHAR(30) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. PROMOTION USAGES
CREATE TABLE IF NOT EXISTS public.promotion_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id),
    discount_amount NUMERIC(12,2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. EXPENSE CATEGORIES (Danh mục chi phí vận hành)
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. EXPENSES (Sổ chi phí vận hành)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_category_id UUID NOT NULL REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(30) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer')),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recorded_by UUID NOT NULL REFERENCES public.profiles(id),
    receipt_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. AUDIT LOGS (Nhật ký kiểm toán hệ thống)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'CHECKOUT', 'CANCEL', 'REFUND')),
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES public.profiles(id),
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR FREQUENT QUERIES & OPTIMIZATION
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_cashier_id ON public.orders(cashier_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_stock ON public.ingredients(current_stock);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_tx_ingredient ON public.inventory_transactions(ingredient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shifts_profile_status ON public.shifts(profile_id, status);
