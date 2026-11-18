-- ============================================================================
-- CHILL HOUSE POS - REALISTIC SEED DATA (MENU, RECIPES, INGREDIENTS)
-- File: 04_seed_chill_house.sql
-- (All UUIDs strictly use standard hexadecimal digits: 0-9, a-f)
-- ============================================================================

-- 1. SEED ROLES
INSERT INTO public.roles (name, display_name, description) VALUES
('admin', 'Chủ cửa hàng (Admin)', 'Toàn quyền cấu hình, xem doanh thu, lợi nhuận, phân quyền'),
('manager', 'Quản lý (Manager)', 'Quản lý kho, xuất nhập hàng, duyệt hủy đơn, xem báo cáo'),
('cashier', 'Thu ngân (Cashier)', 'Mở ca, bán hàng POS, in hóa đơn, quản lý khách hàng'),
('staff', 'Nhân viên pha chế / Phục vụ (Staff)', 'Xem danh sách món cần làm trên màn hình Bếp/Bar')
ON CONFLICT (name) DO NOTHING;

-- 2. SEED STORE SETTINGS
INSERT INTO public.store_settings (
    store_name,
    phone,
    email,
    address,
    tax_number,
    bank_name,
    bank_account_number,
    bank_account_name,
    bank_bin,
    invoice_footer
) VALUES (
    'Chill House Coffee & Tea',
    '0988 123 456',
    'hello@chillhouse.vn',
    '123 Đường Cà Phê, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    '0312345678',
    'MB Bank',
    '999988889999',
    'CHILL HOUSE F&B',
    '970422',
    'Cảm ơn quý khách đã ghé Chill House! Chúc quý khách một ngày tràn đầy năng lượng!'
) ON CONFLICT DO NOTHING;

-- 3. SEED CATEGORIES (c1000000-...)
INSERT INTO public.categories (id, name, slug, description, display_order, is_active) VALUES
('c1000000-0000-0000-0000-000000000001', 'Cà phê', 'ca-phe', 'Cà phê pha phin truyền thống & pha máy', 1, true),
('c1000000-0000-0000-0000-000000000002', 'Trà sữa', 'tra-sua', 'Trà sữa đậm vị thơm béo với nhiều loại topping', 2, true),
('c1000000-0000-0000-0000-000000000003', 'Trà trái cây', 'tra-trai-cay', 'Trà thanh mát kết hợp trái cây nhiệt đới tươi ngon', 3, true),
('c1000000-0000-0000-0000-000000000004', 'Nước ép & Sinh tố', 'nuoc-ep-sinh-to', 'Nước ép nguyên chất và sinh tố tươi mỗi ngày', 4, true),
('c1000000-0000-0000-0000-000000000005', 'Đá xay (Ice Blended)', 'da-xay', 'Đá xay mát lạnh phủ kem whipping béo ngậy', 5, true),
('c1000000-0000-0000-0000-000000000006', 'Bánh ngọt & Snack', 'banh-snack', 'Các loại bánh ăn kèm đồ uống', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- 4. SEED INGREDIENTS (a1000000-...)
INSERT INTO public.ingredients (id, code, name, unit, current_stock, min_stock_level, cost_price) VALUES
('a1000000-0000-0000-0000-000000000001', 'ING-CF-ROBUSTA', 'Cà phê Robusta mộc', 'g', 15000, 2000, 180),
('a1000000-0000-0000-0000-000000000002', 'ING-CF-ARABICA', 'Cà phê Arabica Cầu Đất', 'g', 10000, 1500, 280),
('a1000000-0000-0000-0000-000000000003', 'ING-SUA-TUOI', 'Sữa tươi thanh trùng Barista', 'ml', 30000, 5000, 38),
('a1000000-0000-0000-0000-000000000004', 'ING-SUA-DAC', 'Sữa đặc Ngôi Sao Phương Nam', 'g', 25000, 3000, 45),
('a1000000-0000-0000-0000-000000000005', 'ING-TRA-DEN', 'Trà đen Ceylon Phúc Long', 'g', 8000, 1000, 220),
('a1000000-0000-0000-0000-000000000006', 'ING-TRA-OOLONG', 'Trà Ô Long nướng rang củi', 'g', 6000, 1000, 320),
('a1000000-0000-0000-0000-000000000007', 'ING-TRA-LAI', 'Trà lài thượng hạng', 'g', 8000, 1000, 240),
('a1000000-0000-0000-0000-000000000008', 'ING-DUONG-CAT', 'Nước đường pha chế (Sugar Syrup)', 'ml', 40000, 5000, 22),
('a1000000-0000-0000-0000-000000000009', 'ING-DUONG-DEN', 'Syrup Đường đen Hàn Quốc', 'ml', 10000, 1500, 95),
('a1000000-0000-0000-0000-000000000010', 'ING-BOT-BEO', 'Bột kem béo thực vật Frima', 'g', 20000, 3000, 85),
('a1000000-0000-0000-0000-000000000011', 'ING-SYRUP-DAO', 'Syrup Đào Monin', 'ml', 5000, 800, 320),
('a1000000-0000-0000-0000-000000000012', 'ING-SYRUP-VAI', 'Syrup Vải Monin', 'ml', 5000, 800, 320),
('a1000000-0000-0000-0000-000000000013', 'ING-CAM-TUOI', 'Cam vàng Navel tươi', 'g', 15000, 3000, 65),
('a1000000-0000-0000-0000-000000000014', 'ING-SA-TUOI', 'Sả cây tươi', 'g', 3000, 500, 30),
('a1000000-0000-0000-0000-000000000015', 'ING-BOT-MATCHA', 'Bột Matcha Uji Nhật Bản', 'g', 2000, 300, 950),
('a1000000-0000-0000-0000-000000000016', 'ING-KEM-CHEESE', 'Bột màng sữa Váng Sữa Macchiato', 'g', 5000, 1000, 260),
('a1000000-0000-0000-0000-000000000017', 'ING-TRAN-CHAU-DEN', 'Trân châu đen Đài Loan', 'g', 20000, 3000, 55),
('a1000000-0000-0000-0000-000000000018', 'ING-TRAN-CHAU-TRANG','Trân châu trắng 3Q', 'g', 15000, 2000, 68),
('a1000000-0000-0000-0000-000000000019', 'ING-LY-NHUA-M', 'Ly nhựa PP 500ml (Size M)', 'ly', 2500, 300, 550),
('a1000000-0000-0000-0000-000000000020', 'ING-LY-NHUA-L', 'Ly nhựa PP 700ml (Size L)', 'ly', 2500, 300, 650),
('a1000000-0000-0000-0000-000000000021', 'ING-ONG-HUT', 'Ống hút bọc màng tiệt trùng', 'ong_hut', 5000, 500, 120)
ON CONFLICT (code) DO NOTHING;

-- 5. SEED TOPPINGS (b1000000-...)
INSERT INTO public.toppings (id, name, price, cost_price, ingredient_id, default_quantity, is_active) VALUES
('b1000000-0000-0000-0000-000000000001', 'Trân châu đen dẻo', 8000, 2500, 'a1000000-0000-0000-0000-000000000017', 50, true),
('b1000000-0000-0000-0000-000000000002', 'Trân châu trắng 3Q', 10000, 3200, 'a1000000-0000-0000-0000-000000000018', 50, true),
('b1000000-0000-0000-0000-000000000003', 'Kem Cheese Macchiato béo', 12000, 4500, 'a1000000-0000-0000-0000-000000000016', 40, true),
('b1000000-0000-0000-0000-000000000004', 'Thạch đào giòn', 10000, 3000, 'a1000000-0000-0000-0000-000000000011', 40, true)
ON CONFLICT DO NOTHING;

-- 6. SEED PRODUCTS & PRODUCT VARIANTS (SIZES S, M, L)
-- Product 1: Cà phê sữa đá (d1000000-0000-0000-0000-000000000001)
INSERT INTO public.products (id, category_id, sku, name, description, image_url, base_cost, is_active, is_featured) VALUES
('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'CF-SUA-DA', 'Cà phê sữa đá Chill', 'Hương vị cà phê Robusta rang mộc đậm đà quyện cùng sữa đặc béo ngậy truyền thống', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80', 7500, true, true)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, size, price, cost_price, sku_variant) VALUES
('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'S', 25000, 6000, 'CF-SUA-DA-S'),
('e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'M', 29000, 7500, 'CF-SUA-DA-M'),
('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'L', 35000, 9500, 'CF-SUA-DA-L')
ON CONFLICT (sku_variant) DO NOTHING;

-- Product 2: Bạc xỉu 3 tầng
INSERT INTO public.products (id, category_id, sku, name, description, image_url, base_cost, is_active, is_featured) VALUES
('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'BAC-XIU', 'Bạc xỉu 3 tầng Chill House', 'Vị ngọt dịu của sữa tươi, sữa đặc hòa cùng chút đắng nhẹ của cà phê phin', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=80', 8000, true, true)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, size, price, cost_price, sku_variant) VALUES
('e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'M', 32000, 8000, 'BAC-XIU-M'),
('e1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000002', 'L', 38000, 10000, 'BAC-XIU-L')
ON CONFLICT (sku_variant) DO NOTHING;

-- Product 3: Trà sữa Chill House truyền thống
INSERT INTO public.products (id, category_id, sku, name, description, image_url, base_cost, is_active, is_featured) VALUES
('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'TS-CHILL-HOUSE', 'Trà sữa Chill House Signature', 'Trà sữa ủ từ lá trà đen Ceylon cao cấp hòa cùng kem sữa béo ngậy thơm lừng', 'https://images.unsplash.com/photo-1558857563-b37cfb8f152f?w=500&q=80', 9500, true, true)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, size, price, cost_price, sku_variant) VALUES
('e1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000003', 'M', 35000, 9500, 'TS-CHILL-M'),
('e1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000003', 'L', 42000, 12000, 'TS-CHILL-L')
ON CONFLICT (sku_variant) DO NOTHING;

-- Product 4: Trà sữa Ô Long nướng
INSERT INTO public.products (id, category_id, sku, name, description, image_url, base_cost, is_active, is_featured) VALUES
('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'TS-OOLONG-NUONG', 'Trà sữa Ô Long Nướng', 'Vị trà Ô Long sao vàng thơm nồng kết hợp sữa kem béo đậm đà khó cưỡng', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80', 10500, true, true)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, size, price, cost_price, sku_variant) VALUES
('e1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000004', 'M', 38000, 10500, 'TS-OOLONG-M'),
('e1000000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000004', 'L', 45000, 13000, 'TS-OOLONG-L')
ON CONFLICT (sku_variant) DO NOTHING;

-- Product 5: Trà Đào Cam Sả
INSERT INTO public.products (id, category_id, sku, name, description, image_url, base_cost, is_active, is_featured) VALUES
('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003', 'TRA-DAO-CAM-SA', 'Trà Đào Cam Sả Tươi', 'Vị thanh ngọt của đào, vị chua dịu của cam tươi và hương thơm sả nồng nàn sảng khoái', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80', 11000, true, true)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, size, price, cost_price, sku_variant) VALUES
('e1000000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000005', 'M', 39000, 11000, 'TRA-DAO-M'),
('e1000000-0000-0000-0000-000000000011', 'd1000000-0000-0000-0000-000000000005', 'L', 45000, 13500, 'TRA-DAO-L')
ON CONFLICT (sku_variant) DO NOTHING;

-- Product 6: Matcha Đá Xay Kem Cheese
INSERT INTO public.products (id, category_id, sku, name, description, image_url, base_cost, is_active, is_featured) VALUES
('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000005', 'MATCHA-DA-XAY', 'Matcha Đá Xay Macchiato', 'Matcha Nhật Bản xay tuyết mát lạnh phủ lớp kem cheese béo mặn thơm ngậy', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&q=80', 14000, true, true)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, size, price, cost_price, sku_variant) VALUES
('e1000000-0000-0000-0000-000000000012', 'd1000000-0000-0000-0000-000000000006', 'M', 45000, 14000, 'MATCHA-DX-M'),
('e1000000-0000-0000-0000-000000000013', 'd1000000-0000-0000-0000-000000000006', 'L', 52000, 16500, 'MATCHA-DX-L')
ON CONFLICT (sku_variant) DO NOTHING;

-- 7. SEED RECIPES (Công thức trừ kho chuẩn cho từng Size)
-- Recipe cho Cà phê sữa đá Size M (e1000000-0000-0000-0000-000000000002)
INSERT INTO public.recipes (id, product_variant_id, yield_amount, notes) VALUES
('f1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 1, 'Công thức Cà phê sữa đá size M')
ON CONFLICT (product_variant_id) DO NOTHING;

INSERT INTO public.recipe_items (recipe_id, ingredient_id, quantity, unit) VALUES
('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 25, 'g'), -- 25g Robusta
('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 35, 'g'), -- 35g sữa đặc
('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000019', 1, 'ly'),  -- 1 ly 500ml
('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000021', 1, 'ong_hut')
ON CONFLICT DO NOTHING;

-- Recipe cho Trà sữa Chill House Size M (e1000000-0000-0000-0000-000000000006)
INSERT INTO public.recipes (id, product_variant_id, yield_amount, notes) VALUES
('f1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000006', 1, 'Công thức Trà sữa Chill House size M')
ON CONFLICT (product_variant_id) DO NOTHING;

INSERT INTO public.recipe_items (recipe_id, ingredient_id, quantity, unit) VALUES
('f1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000005', 15, 'g'), -- 15g trà đen
('f1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000010', 30, 'g'), -- 30g bột béo
('f1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000008', 25, 'ml'), -- 25ml nước đường
('f1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000019', 1, 'ly'),
('f1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000021', 1, 'ong_hut')
ON CONFLICT DO NOTHING;

-- Recipe cho Trà Đào Cam Sả Size L (e1000000-0000-0000-0000-000000000011)
INSERT INTO public.recipes (id, product_variant_id, yield_amount, notes) VALUES
('f1000000-0000-0000-0000-000000000011', 'e1000000-0000-0000-0000-000000000011', 1, 'Công thức Trà Đào Cam Sả size L')
ON CONFLICT (product_variant_id) DO NOTHING;

INSERT INTO public.recipe_items (recipe_id, ingredient_id, quantity, unit) VALUES
('f1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000007', 15, 'g'), -- 15g trà lài
('f1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000011', 30, 'ml'), -- 30ml syrup đào
('f1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000013', 40, 'g'), -- 40g cam tươi
('f1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000014', 10, 'g'), -- 10g sả
('f1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000020', 1, 'ly'), -- 1 ly 700ml
('f1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000021', 1, 'ong_hut')
ON CONFLICT DO NOTHING;

-- 8. SEED SUPPLIERS (01000000-...)
INSERT INTO public.suppliers (id, code, name, contact_name, phone, email, address) VALUES
('01000000-0000-0000-0000-000000000001', 'NCC-NGUYEN-LIEU-SG', 'Công ty TNHH Nguyên Liệu Pha Chế Sài Gòn', 'Anh Hoàng Long', '0909 111 222', 'sales@nguyenlieusg.vn', 'Số 45 Bình Thới, Quận 11, TP. HCM'),
('01000000-0000-0000-0000-000000000002', 'NCC-BAO-BI-XANH', 'Xưởng Bao Bì & Ly Nhựa Xanh', 'Chị Mai Lan', '0918 333 444', 'baobixanh@gmail.com', 'Khu công nghiệp Tân Bình, TP. HCM')
ON CONFLICT (code) DO NOTHING;

-- 9. SEED EXPENSE CATEGORIES
INSERT INTO public.expense_categories (name, code, description) VALUES
('Mặt bằng & Cơ sở vật chất', 'EXP-MAT-BANG', 'Tiền thuê mặt bằng, sửa chữa quán'),
('Điện & Nước sinh hoạt', 'EXP-DIEN-NUOC', 'Hóa đơn tiền điện lạnh máy pha chế và nước máy'),
('Lương & Thưởng nhân viên', 'EXP-LUONG', 'Chi phí chi trả lương cho nhân viên các ca'),
('Marketing & Khuyến mãi', 'EXP-MARKETING', 'Chi phí chạy quảng cáo Facebook, in ấn banner tờ rơi'),
('Chi phí vận hành khác', 'EXP-KHAC', 'Vật dụng lau dọn, rác sinh hoạt, đá lạnh ngoài')
ON CONFLICT (code) DO NOTHING;

-- 10. SEED PROMOTIONS
INSERT INTO public.promotions (
    code,
    title,
    description,
    discount_type,
    discount_value,
    min_order_value,
    max_discount_amount,
    start_date,
    end_date,
    usage_limit
) VALUES
('CHILLWELCOME', 'Chào bạn mới Chill House', 'Giảm 10% cho đơn hàng đầu tiên từ 50k', 'percent', 10, 50000, 30000, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 500),
('GIAM20K', 'Giờ vàng Chill House', 'Giảm trực tiếp 20.000đ cho đơn từ 100k', 'fixed_amount', 20000, 100000, 20000, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 200)
ON CONFLICT (code) DO NOTHING;

-- 11. SEED SAMPLE CUSTOMERS
INSERT INTO public.customers (full_name, phone, email, points, total_spent, customer_rank) VALUES
('Nguyễn Văn An', '0901234567', 'an.nguyen@gmail.com', 45, 450000, 'Standard'),
('Trần Thị Bích Ngọc', '0912345678', 'bichngoc@gmail.com', 250, 2500000, 'Silver'),
('Lê Hoàng Nam', '0988776655', 'nam.le@gmail.com', 620, 6200000, 'Gold')
ON CONFLICT (phone) DO NOTHING;
