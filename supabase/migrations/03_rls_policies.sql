-- ============================================================================
-- CHILL HOUSE POS - ROW LEVEL SECURITY (RLS) POLICIES
-- File: 03_rls_policies.sql
-- ============================================================================

-- 1. Helper function: Get user role name
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
DECLARE
    v_role_name VARCHAR;
BEGIN
    SELECT r.name INTO v_role_name
    FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = auth.uid();

    RETURN COALESCE(v_role_name, 'anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ENABLE RLS ON ALL TABLES
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES DEFINITIONS

-- Roles: Anyone authenticated can view roles
CREATE POLICY "Allow authenticated to view roles" ON public.roles
    FOR SELECT TO authenticated USING (true);

-- Profiles: Authenticated can view profiles; Admin can manage all; Users can update own
CREATE POLICY "Allow view profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow admin and manager to insert/update profiles" ON public.profiles
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

-- Store Settings: Viewable by all authenticated, editable by admin
CREATE POLICY "Allow view store settings" ON public.store_settings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to update store settings" ON public.store_settings
    FOR ALL TO authenticated USING (public.get_current_user_role() = 'admin');

-- Master data: Categories, Products, Variants, Toppings, Recipes
CREATE POLICY "Allow all authenticated to view catalog" ON public.categories
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to edit categories" ON public.categories
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Allow all authenticated to view products" ON public.products
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to edit products" ON public.products
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Allow all authenticated to view variants" ON public.product_variants
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to edit variants" ON public.product_variants
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Allow all authenticated to view toppings" ON public.toppings
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to edit toppings" ON public.toppings
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Allow all authenticated to view product toppings" ON public.product_toppings
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to edit product toppings" ON public.product_toppings
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Allow all authenticated to view recipes" ON public.recipes
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to edit recipes" ON public.recipes
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Allow all authenticated to view recipe items" ON public.recipe_items
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to edit recipe items" ON public.recipe_items
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

-- Inventory & Ingredients
CREATE POLICY "Allow view ingredients" ON public.ingredients
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to manage ingredients" ON public.ingredients
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Allow view inventory transactions" ON public.inventory_transactions
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to manage inventory transactions" ON public.inventory_transactions
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

-- Orders, Items, Payments
CREATE POLICY "Allow staff to view orders" ON public.orders
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow cashiers and admins to insert orders" ON public.orders
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow admin/manager to update orders" ON public.orders
    FOR UPDATE TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Allow staff to view order items" ON public.order_items
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow cashiers and admins to insert order items" ON public.order_items
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow staff to view order toppings" ON public.order_item_toppings
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow cashiers and admins to insert order toppings" ON public.order_item_toppings
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow staff to view payments" ON public.payments
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow cashiers to insert payments" ON public.payments
    FOR INSERT TO authenticated WITH CHECK (true);

-- Shifts
CREATE POLICY "Allow view shifts" ON public.shifts
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow cashiers to insert and update own shift" ON public.shifts
    FOR ALL TO authenticated USING (profile_id = auth.uid() OR public.get_current_user_role() IN ('admin', 'manager'));

-- Customers
CREATE POLICY "Allow view customers" ON public.customers
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow cashiers/managers/admin to edit customers" ON public.customers
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager', 'cashier'));

-- Promotions
CREATE POLICY "Allow view promotions" ON public.promotions
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to edit promotions" ON public.promotions
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));
CREATE POLICY "Allow insert promotion usages" ON public.promotion_usages
    FOR ALL TO authenticated USING (true);

-- Suppliers & Purchase Orders
CREATE POLICY "Allow view suppliers" ON public.suppliers
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to edit suppliers" ON public.suppliers
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Allow view purchase orders" ON public.purchase_orders
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to edit purchase orders" ON public.purchase_orders
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Allow view purchase order items" ON public.purchase_order_items
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to edit purchase order items" ON public.purchase_order_items
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

-- Expenses
CREATE POLICY "Allow view expenses" ON public.expenses
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager/cashier to insert expense" ON public.expenses
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow admin/manager to update/delete expenses" ON public.expenses
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

CREATE POLICY "Allow view expense categories" ON public.expense_categories
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin/manager to edit expense categories" ON public.expense_categories
    FOR ALL TO authenticated USING (public.get_current_user_role() IN ('admin', 'manager'));

-- Audit logs: Readonly for admin
CREATE POLICY "Allow admin to view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (public.get_current_user_role() = 'admin');
