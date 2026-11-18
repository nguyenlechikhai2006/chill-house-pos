# CHILL HOUSE - HỆ THỐNG QUẢN LÝ BÁN HÀNG F&B TOÀN DIỆN

Hệ thống quản lý chuỗi kinh doanh đồ uống (Cà phê, Trà sữa, Trà trái cây, Nước ép, Đá xay) chuyên nghiệp, tích hợp bán hàng tại quầy (POS cảm ứng), quản lý kho nguyên liệu theo định lượng công thức (BOM Recipe), quản lý ca làm việc (Shift), tự động sinh mã VietQR chuyển khoản và in hóa đơn nhiệt / tem dán ly.

---

## ☕ 1. CÔNG NGHỆ BẮT BUỘC (TECH STACK)
* **Frontend:** React 18+ • Vite • TypeScript • React Router DOM v6 • Tailwind CSS • Lucide React Icons.
* **Quản lý trạng thái:** Zustand (CartStore, AuthStore, ShiftStore, ToastStore).
* **Biểu đồ:** Recharts.
* **Backend & Database:** Supabase (PostgreSQL 15+) • Supabase Auth • Supabase Storage • Row Level Security (RLS) • PostgreSQL RPC Transactions.

---

## 🏗️ 2. CẤU TRÚC DỰ ÁN
```text
chill-house-pos/
├── supabase/
│   ├── migrations/
│   │   ├── 01_schema.sql             # 26 bảng dữ liệu, PK, FK, Indexes, Constraints
│   │   ├── 02_functions_triggers.sql # RPC process_order_checkout, hoàn kho, updated_at
│   │   ├── 03_rls_policies.sql       # Phân quyền bảo mật Row Level Security
│   │   └── 04_seed_chill_house.sql   # Dữ liệu thực tế menu, định lượng công thức, topping
│   └── master_init.sql               # Script thực thi toàn bộ trong 1 bước trên Supabase
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/                   # Modal, Badge, Button, Input, Select, Toast...
│   │   │   ├── PrintThermalReceipt.tsx # Mẫu in hóa đơn nhiệt K80/K58
│   │   │   └── PrintCupSticker.tsx    # Mẫu in tem dán thân ly (50x30mm)
│   │   └── layout/                   # Sidebar, Header, MainLayout, ProtectedRoute
│   ├── pages/
│   │   ├── POS/                      # Màn hình bán hàng POS, chọn Size, % Đường, % Đá, Topping, VietQR
│   │   ├── Kitchen/                  # Màn hình KDS quầy Bar / Bếp pha chế
│   │   ├── Dashboard/                # Tổng quan doanh thu, lợi nhuận, biểu đồ 7 ngày
│   │   ├── Orders/                   # Quản lý đơn hàng, xem chi tiết, hủy & hoàn trả kho
│   │   ├── Products/                 # Quản lý đồ uống, SKU, giá bán S/M/L, giá vốn
│   │   ├── Categories/               # Quản lý nhóm món (Cà phê, Trà sữa, Đá xay...)
│   │   ├── Inventory/                # Quản lý kho, tồn kho, kiểm kê, lịch sử biến động
│   │   ├── Recipes/                  # Quản lý công thức định lượng (BOM) từng ly
│   │   ├── Purchases/                # Nhập hàng từ nhà cung cấp & tự động tăng kho
│   │   ├── Suppliers/                # Quản lý danh bạ nhà cung cấp
│   │   ├── Customers/                # Khách hàng, tích điểm, xếp hạng thành viên
│   │   ├── Employees/                # Quản lý nhân viên & gán vai trò quyền hạn
│   │   ├── Shifts/                   # Mở ca, bàn giao tiền lẻ, kết ca kiểm két tiền mặt
│   │   ├── Expenses/                 # Sổ chi phí hoạt động (mặt bằng, điện, nước, lương)
│   │   ├── Promotions/               # Quản lý Voucher, mã giảm giá % hoặc cố định
│   │   ├── Reports/                  # Báo cáo tài chính, COGS, lợi nhuận, xuất CSV
│   │   ├── Settings/                 # Cấu hình cửa hàng, tài khoản ngân hàng VietQR
│   │   └── Auth/                     # Đăng nhập & chuyển đổi nhanh quyền thử nghiệm
│   ├── services/                     # Tầng kết nối Supabase và Database RPC
│   ├── stores/                       # Zustand Global Stores
│   ├── types/                        # TypeScript Schema Definitions
│   └── lib/                          # Supabase client, VietQR generator, utils
```

---

## 🚀 3. HƯỚNG DẪN KHỞI TẠO VÀ CHẠY DỰ ÁN

### Bước 1: Khởi tạo Database trên Supabase
1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com) và tạo một Project mới.
2. Mở tab **SQL Editor**.
3. Mở file `supabase/master_init.sql` (hoặc copy lần lượt nội dung từ các file trong `supabase/migrations/` theo thứ tự: `01_schema.sql` $\rightarrow$ `02_functions_triggers.sql` $\rightarrow$ `03_rls_policies.sql` $\rightarrow$ `04_seed_chill_house.sql`).
4. Bấm **RUN** để khởi tạo toàn bộ 26 bảng, các hàm RPC trừ kho tự động và dữ liệu mẫu của quán Chill House.

### Bước 2: Cấu hình biến môi trường Frontend
Tạo file `.env` tại thư mục gốc của dự án (`chill-house-pos/`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
*(Nếu chưa điền Supabase, hệ thống được trang bị cơ chế Mock/Demo Mode thông minh giúp bạn kiểm thử ngay lập tức toàn bộ chức năng POS, đổi Size, Đường, Đá, Topping, VietQR, In Bill mà không bị văng lỗi).*

### Bước 3: Cài đặt và chạy Local
```bash
cd chill-house-pos
npm install
npm run dev
```
Trình duyệt sẽ mở tại `http://localhost:5173`.

---

## 🖨️ 4. CHỨC NĂNG IN ẤN CHUYÊN DỤNG CHO F&B
1. **In Hóa Đơn Nhiệt (K80 / K58):**
   * Định dạng chuẩn in hóa đơn quầy thu ngân.
   * Hiển thị đầy đủ thương hiệu Chill House, hotline, danh sách món kèm size, mức đường, đá, danh sách topping, số tiền khách đưa, tiền thừa trả khách.
2. **In Tem Dán Thân Ly (Cup Sticker 50x30mm):**
   * Tự động sinh tem cho từng ly nước (`[1/3]`, `[2/3]`, `[3/3]`).
   * Ghi rõ Tên món, Size, % Đường, % Đá, Topping và Ghi chú riêng của khách để nhân viên quầy Bar pha chế chuẩn xác 100%.

---

## 🛡️ 5. PHÂN QUYỀN TRUY CẬP (RBAC)
* **Chủ cửa hàng (Admin):** Toàn quyền cấu hình quán, phân quyền nhân viên, xem báo cáo doanh thu, giá vốn và lợi nhuận ròng.
* **Quản lý (Manager):** Quản lý thực đơn, công thức pha chế, duyệt nhập kho, kiểm kê tồn kho, duyệt hủy đơn.
* **Thu ngân (Cashier):** Mở ca làm việc, thao tác POS, tìm kiếm khách hàng tích điểm, áp voucher, in hóa đơn.
* **Pha chế (Staff):** Màn hình KDS quầy Bar, theo dõi danh sách ly cần làm và bấm hoàn thành.
