-- ============================================================================
-- CHILL HOUSE POS - BUSINESS FUNCTIONS & ATOMIC PROCEDURES (RPC)
-- File: 02_functions_triggers.sql
-- ============================================================================

-- 1. TRIGGER FUNCTION: AUTO UPDATE updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER set_store_settings_updated_at BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER set_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_ingredients_updated_at ON public.ingredients;
CREATE TRIGGER set_ingredients_updated_at BEFORE UPDATE ON public.ingredients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 2. CORE ATOMIC CHECKOUT PROCEDURE (Thanh toán & Trừ kho đồng thời)
CREATE OR REPLACE FUNCTION public.process_order_checkout(
    p_order_code VARCHAR,
    p_shift_id UUID,
    p_cashier_id UUID,
    p_customer_id UUID,
    p_subtotal NUMERIC,
    p_discount_amount NUMERIC,
    p_promotion_id UUID,
    p_total_amount NUMERIC,
    p_notes TEXT,
    p_payment_method VARCHAR,
    p_customer_given NUMERIC,
    p_change_returned NUMERIC,
    p_transaction_ref VARCHAR,
    p_items JSONB -- Array of items with their toppings
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_item RECORD;
    v_order_item_id UUID;
    v_topping JSONB;
    v_recipe_rec RECORD;
    v_ing_rec RECORD;
    v_topping_rec RECORD;
    v_calc_subtotal NUMERIC := 0;
    v_item_subtotal NUMERIC := 0;
    v_current_stock NUMERIC;
    v_new_stock NUMERIC;
    v_points_earned INTEGER := 0;
BEGIN
    -- 1. Create order header
    INSERT INTO public.orders (
        order_code,
        shift_id,
        cashier_id,
        customer_id,
        subtotal,
        discount_amount,
        promotion_id,
        total_amount,
        status,
        payment_status,
        inventory_deducted,
        notes
    ) VALUES (
        p_order_code,
        p_shift_id,
        p_cashier_id,
        p_customer_id,
        p_subtotal,
        p_discount_amount,
        p_promotion_id,
        p_total_amount,
        'completed',
        'paid',
        TRUE,
        p_notes
    ) RETURNING id INTO v_order_id;

    -- 2. Process each item
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_variant_id UUID,
        product_name VARCHAR,
        size VARCHAR,
        unit_price NUMERIC,
        cost_price NUMERIC,
        quantity INTEGER,
        sugar_level VARCHAR,
        ice_level VARCHAR,
        notes TEXT,
        toppings JSONB
    ) LOOP
        -- Calculate item subtotal
        v_item_subtotal := v_item.unit_price * v_item.quantity;

        -- Insert order item
        INSERT INTO public.order_items (
            order_id,
            product_variant_id,
            product_name,
            size,
            unit_price,
            cost_price,
            quantity,
            subtotal,
            sugar_level,
            ice_level,
            notes
        ) VALUES (
            v_order_id,
            v_item.product_variant_id,
            v_item.product_name,
            v_item.size,
            v_item.unit_price,
            v_item.cost_price,
            v_item.quantity,
            v_item_subtotal,
            COALESCE(v_item.sugar_level, '100%'),
            COALESCE(v_item.ice_level, '100%'),
            v_item.notes
        ) RETURNING id INTO v_order_item_id;

        -- 3. Inventory Deduction: Base Recipe for this Product Variant
        FOR v_recipe_rec IN 
            SELECT ri.ingredient_id, ri.quantity, ri.unit
            FROM public.recipes r
            JOIN public.recipe_items ri ON ri.recipe_id = r.id
            WHERE r.product_variant_id = v_item.product_variant_id
        LOOP
            -- Deduct stock: quantity * item.quantity
            SELECT current_stock INTO v_current_stock 
            FROM public.ingredients 
            WHERE id = v_recipe_rec.ingredient_id FOR UPDATE;

            v_new_stock := v_current_stock - (v_recipe_rec.quantity * v_item.quantity);

            UPDATE public.ingredients 
            SET current_stock = v_new_stock
            WHERE id = v_recipe_rec.ingredient_id;

            -- Insert audit transaction
            INSERT INTO public.inventory_transactions (
                ingredient_id,
                transaction_type,
                reference_id,
                quantity_change,
                balance_after,
                note,
                created_by
            ) VALUES (
                v_recipe_rec.ingredient_id,
                'order_deduct',
                v_order_id,
                -(v_recipe_rec.quantity * v_item.quantity),
                v_new_stock,
                'Xuất kho bán hàng: ' || v_item.product_name || ' (' || v_item.size || ') x' || v_item.quantity,
                p_cashier_id
            );
        END LOOP;

        -- 4. Process Item Toppings (if any)
        IF v_item.toppings IS NOT NULL AND jsonb_array_length(v_item.toppings) > 0 THEN
            FOR v_topping IN SELECT * FROM jsonb_array_elements(v_item.toppings) LOOP
                -- Insert order_item_topping
                INSERT INTO public.order_item_toppings (
                    order_item_id,
                    topping_id,
                    topping_name,
                    unit_price,
                    quantity,
                    subtotal
                ) VALUES (
                    v_order_item_id,
                    (v_topping->>'topping_id')::UUID,
                    v_topping->>'topping_name',
                    (v_topping->>'unit_price')::NUMERIC,
                    COALESCE((v_topping->>'quantity')::INTEGER, 1),
                    (v_topping->>'unit_price')::NUMERIC * COALESCE((v_topping->>'quantity')::INTEGER, 1)
                );

                -- Deduct topping ingredient from stock
                SELECT ingredient_id, default_quantity INTO v_topping_rec 
                FROM public.toppings 
                WHERE id = (v_topping->>'topping_id')::UUID;

                IF v_topping_rec.ingredient_id IS NOT NULL THEN
                    SELECT current_stock INTO v_current_stock 
                    FROM public.ingredients 
                    WHERE id = v_topping_rec.ingredient_id FOR UPDATE;

                    v_new_stock := v_current_stock - (v_topping_rec.default_quantity * COALESCE((v_topping->>'quantity')::INTEGER, 1) * v_item.quantity);

                    UPDATE public.ingredients 
                    SET current_stock = v_new_stock 
                    WHERE id = v_topping_rec.ingredient_id;

                    INSERT INTO public.inventory_transactions (
                        ingredient_id,
                        transaction_type,
                        reference_id,
                        quantity_change,
                        balance_after,
                        note,
                        created_by
                    ) VALUES (
                        v_topping_rec.ingredient_id,
                        'order_deduct',
                        v_order_id,
                        -(v_topping_rec.default_quantity * COALESCE((v_topping->>'quantity')::INTEGER, 1) * v_item.quantity),
                        v_new_stock,
                        'Xuất kho Topping: ' || (v_topping->>'topping_name') || ' x' || v_item.quantity,
                        p_cashier_id
                    );
                END IF;
            END LOOP;
        END IF;

    END LOOP;

    -- 5. Insert Payment record
    INSERT INTO public.payments (
        order_id,
        payment_method,
        amount_paid,
        customer_given,
        change_returned,
        transaction_ref,
        status
    ) VALUES (
        v_order_id,
        p_payment_method,
        p_total_amount,
        p_customer_given,
        p_change_returned,
        p_transaction_ref,
        'success'
    );

    -- 6. Update Promotion usage if applied
    IF p_promotion_id IS NOT NULL THEN
        UPDATE public.promotions 
        SET used_count = used_count + 1 
        WHERE id = p_promotion_id;

        INSERT INTO public.promotion_usages (
            promotion_id,
            order_id,
            customer_id,
            discount_amount
        ) VALUES (
            p_promotion_id,
            v_order_id,
            p_customer_id,
            p_discount_amount
        );
    END IF;

    -- 7. Update Customer total spent & points (1 point per 10,000 VND)
    IF p_customer_id IS NOT NULL THEN
        v_points_earned := FLOOR(p_total_amount / 10000);
        UPDATE public.customers
        SET total_spent = total_spent + p_total_amount,
            points = points + v_points_earned,
            customer_rank = CASE 
                WHEN (total_spent + p_total_amount) >= 10000000 THEN 'VIP'
                WHEN (total_spent + p_total_amount) >= 5000000 THEN 'Gold'
                WHEN (total_spent + p_total_amount) >= 2000000 THEN 'Silver'
                ELSE 'Standard'
            END
        WHERE id = p_customer_id;
    END IF;

    -- 8. Update Current Shift totals
    IF p_shift_id IS NOT NULL THEN
        UPDATE public.shifts 
        SET total_sales = total_sales + p_total_amount,
            total_orders = total_orders + 1
        WHERE id = p_shift_id;
    END IF;

    -- Return success result
    RETURN jsonb_build_object(
        'success', TRUE,
        'order_id', v_order_id,
        'order_code', p_order_code,
        'total_amount', p_total_amount,
        'points_earned', v_points_earned
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. PROCEDURE CANCEL ORDER & RESTORE INVENTORY (Hủy đơn & hoàn lại kho)
CREATE OR REPLACE FUNCTION public.cancel_order_and_restore_inventory(
    p_order_id UUID,
    p_cancelled_by UUID,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_recipe_rec RECORD;
    v_topping_rec RECORD;
    v_current_stock NUMERIC;
    v_new_stock NUMERIC;
    v_points_deduct INTEGER := 0;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Không tìm thấy đơn hàng.');
    END IF;

    IF v_order.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Đơn hàng này đã được hủy trước đó.');
    END IF;

    -- If inventory was deducted, restore it
    IF v_order.inventory_deducted = TRUE THEN
        FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
            -- Restore product variant recipe ingredients
            FOR v_recipe_rec IN 
                SELECT ri.ingredient_id, ri.quantity
                FROM public.recipes r
                JOIN public.recipe_items ri ON ri.recipe_id = r.id
                WHERE r.product_variant_id = v_item.product_variant_id
            LOOP
                SELECT current_stock INTO v_current_stock FROM public.ingredients WHERE id = v_recipe_rec.ingredient_id FOR UPDATE;
                v_new_stock := v_current_stock + (v_recipe_rec.quantity * v_item.quantity);

                UPDATE public.ingredients SET current_stock = v_new_stock WHERE id = v_recipe_rec.ingredient_id;

                INSERT INTO public.inventory_transactions (
                    ingredient_id,
                    transaction_type,
                    reference_id,
                    quantity_change,
                    balance_after,
                    note,
                    created_by
                ) VALUES (
                    v_recipe_rec.ingredient_id,
                    'return',
                    p_order_id,
                    (v_recipe_rec.quantity * v_item.quantity),
                    v_new_stock,
                    'Hoàn kho do hủy đơn: ' || v_order.order_code,
                    p_cancelled_by
                );
            END LOOP;

            -- Restore toppings
            FOR v_topping_rec IN 
                SELECT t.ingredient_id, t.default_quantity, oit.quantity AS topping_qty
                FROM public.order_item_toppings oit
                JOIN public.toppings t ON t.id = oit.topping_id
                WHERE oit.order_item_id = v_item.id AND t.ingredient_id IS NOT NULL
            LOOP
                SELECT current_stock INTO v_current_stock FROM public.ingredients WHERE id = v_topping_rec.ingredient_id FOR UPDATE;
                v_new_stock := v_current_stock + (v_topping_rec.default_quantity * v_topping_rec.topping_qty * v_item.quantity);

                UPDATE public.ingredients SET current_stock = v_new_stock WHERE id = v_topping_rec.ingredient_id;

                INSERT INTO public.inventory_transactions (
                    ingredient_id,
                    transaction_type,
                    reference_id,
                    quantity_change,
                    balance_after,
                    note,
                    created_by
                ) VALUES (
                    v_topping_rec.ingredient_id,
                    'return',
                    p_order_id,
                    (v_topping_rec.default_quantity * v_topping_rec.topping_qty * v_item.quantity),
                    v_new_stock,
                    'Hoàn kho topping do hủy đơn: ' || v_order.order_code,
                    p_cancelled_by
                );
            END LOOP;
        END LOOP;
    END IF;

    -- Update order status
    UPDATE public.orders 
    SET status = 'cancelled',
        payment_status = 'refunded',
        inventory_deducted = FALSE,
        cancel_reason = p_reason,
        cancelled_by = p_cancelled_by
    WHERE id = p_order_id;

    -- Update payment status
    UPDATE public.payments SET status = 'refunded' WHERE order_id = p_order_id;

    -- Deduct points & total spent if customer was assigned
    IF v_order.customer_id IS NOT NULL THEN
        v_points_deduct := FLOOR(v_order.total_amount / 10000);
        UPDATE public.customers
        SET total_spent = GREATEST(0, total_spent - v_order.total_amount),
            points = GREATEST(0, points - v_points_deduct)
        WHERE id = v_order.customer_id;
    END IF;

    -- Deduct from shift total if linked
    IF v_order.shift_id IS NOT NULL THEN
        UPDATE public.shifts 
        SET total_sales = GREATEST(0, total_sales - v_order.total_amount),
            total_orders = GREATEST(0, total_orders - 1)
        WHERE id = v_order.shift_id;
    END IF;

    -- Insert Audit log
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        action,
        new_data,
        performed_by
    ) VALUES (
        'orders',
        p_order_id,
        'CANCEL',
        jsonb_build_object('reason', p_reason, 'order_code', v_order.order_code, 'amount', v_order.total_amount),
        p_cancelled_by
    );

    RETURN jsonb_build_object('success', TRUE, 'message', 'Đơn hàng đã được hủy và kho đã được hoàn trả thành công.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. FUNCTION: RECEIVE PURCHASE ORDER (Xác nhận nhập kho & cộng nguyên liệu)
CREATE OR REPLACE FUNCTION public.receive_purchase_order(
    p_po_id UUID,
    p_received_by UUID
)
RETURNS JSONB AS $$
DECLARE
    v_po RECORD;
    v_item RECORD;
    v_current_stock NUMERIC;
    v_new_stock NUMERIC;
BEGIN
    SELECT * INTO v_po FROM public.purchase_orders WHERE id = p_po_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Không tìm thấy phiếu nhập.');
    END IF;

    IF v_po.status = 'received' THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Phiếu nhập đã được ghi nhận trước đó.');
    END IF;

    -- Update inventory for each item in PO
    FOR v_item IN SELECT * FROM public.purchase_order_items WHERE purchase_order_id = p_po_id LOOP
        SELECT current_stock INTO v_current_stock FROM public.ingredients WHERE id = v_item.ingredient_id FOR UPDATE;
        v_new_stock := v_current_stock + v_item.quantity;

        UPDATE public.ingredients 
        SET current_stock = v_new_stock,
            cost_price = v_item.unit_price,
            expiry_date = COALESCE(v_item.expiry_date, expiry_date)
        WHERE id = v_item.ingredient_id;

        INSERT INTO public.inventory_transactions (
            ingredient_id,
            transaction_type,
            reference_id,
            quantity_change,
            balance_after,
            unit_cost,
            note,
            created_by
        ) VALUES (
            v_item.ingredient_id,
            'import',
            p_po_id,
            v_item.quantity,
            v_new_stock,
            v_item.unit_price,
            'Nhập kho theo phiếu ' || v_po.po_number,
            p_received_by
        );
    END LOOP;

    UPDATE public.purchase_orders 
    SET status = 'received',
        received_at = NOW()
    WHERE id = p_po_id;

    RETURN jsonb_build_object('success', TRUE, 'message', 'Đã nhập kho thành công và cập nhật tồn kho.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
