import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { useShiftStore } from '../../stores/shiftStore';
import { useToastStore } from '../../stores/toastStore';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { customerService } from '../../services/customerService';
import { promotionService } from '../../services/promotionService';
import { orderService } from '../../services/orderService';
import { settingService } from '../../services/settingService';
import type {
  Category,
  Customer,
  OrderItem,
  Product,
  ProductSize,
  Promotion,
  StoreSetting,
  Topping,
} from '../../types/database.types';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Tag,
  User,
  CreditCard,
  Banknote,
  Receipt,
  QrCode,
  Coffee,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import {
  formatCurrency,
  generateOrderCode,
  generateVietQRUrl,
} from '../../lib/utils';

export const POSPage: React.FC = () => {
  const { profile } = useAuthStore();
  const { activeShift } = useShiftStore();
  const toast = useToastStore();

  const {
    items,
    customer,
    promotion,
    discountAmount,
    orderNotes,
    addItem,
    removeItem,
    updateQuantity,
    setCustomer,
    applyPromotion,
    removePromotion,
    setOrderNotes,
    clearCart,
    getSubtotal,
    getTotal,
    getItemCount,
  } = useCartStore();

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [storeSetting, setStoreSetting] = useState<StoreSetting | null>(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');
  const [sugarLevel, setSugarLevel] = useState<OrderItem['sugar_level']>('100%');
  const [iceLevel, setIceLevel] = useState<OrderItem['ice_level']>('100%');
  const [selectedToppings, setSelectedToppings] = useState<{ [id: string]: number }>({});
  const [itemNote, setItemNote] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  // Customer modal
  const [customerModal, setCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Voucher modal
  const [promoModal, setPromoModal] = useState(false);
  const [voucherInput, setVoucherInput] = useState('');

  // Checkout modal
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [customerGiven, setCustomerGiven] = useState('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [currentOrderCode, setCurrentOrderCode] = useState('');

  // Load initial data
  useEffect(() => {
    Promise.all([
      categoryService.getAll(),
      productService.getAll(),
      productService.getToppings(),
      customerService.getAll(),
      promotionService.getActivePromotions(),
      settingService.getStoreSetting(),
    ]).then(([catData, prodData, topData, custData, promoData, settingData]) => {
      setCategories(catData);
      setProducts(prodData);
      setToppings(topData);
      setCustomers(custData);
      setPromotions(promoData);
      setStoreSetting(settingData);
    });
  }, []);

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchCat = selectedCategory === 'all' || prod.category_id === selectedCategory;
    const matchSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch && prod.is_active;
  });

  // Open item customizer
  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    // Find default size (prefer M if available)
    const variants = product.product_variants || [];
    const hasM = variants.find((v) => v.size === 'M');
    setSelectedSize(hasM ? 'M' : variants[0]?.size || 'Standard');
    setSugarLevel('100%');
    setIceLevel('100%');
    setSelectedToppings({});
    setItemNote('');
    setItemQuantity(1);
  };

  // Add customized drink to cart
  const handleConfirmAddDrink = () => {
    if (!selectedProduct) return;
    const variant = selectedProduct.product_variants?.find((v) => v.size === selectedSize);
    if (!variant) {
      toast.error('Không tìm thấy biến thể kích thước này');
      return;
    }

    const drinkToppings = Object.entries(selectedToppings)
      .filter(([_, qty]) => qty > 0)
      .map(([topId, qty]) => {
        const tObj = toppings.find((t) => t.id === topId);
        return {
          topping_id: topId,
          topping_name: tObj?.name || 'Topping',
          unit_price: tObj?.price || 0,
          quantity: qty,
          subtotal: (tObj?.price || 0) * qty,
        };
      });

    addItem({
      product_variant_id: variant.id,
      product_name: selectedProduct.name,
      size: selectedSize,
      unit_price: Number(variant.price),
      cost_price: Number(variant.cost_price || selectedProduct.base_cost),
      quantity: itemQuantity,
      sugar_level: sugarLevel,
      ice_level: iceLevel,
      notes: itemNote.trim() || undefined,
      toppings: drinkToppings,
    });

    toast.success(`Đã thêm ${selectedProduct.name} (${selectedSize}) vào đơn`);
    setSelectedProduct(null);
  };

  // Quick calculate change
  const subtotal = getSubtotal();
  const total = getTotal();
  const givenNum = Number(customerGiven) || 0;
  const changeReturned = Math.max(0, givenNum - total);

  // Quick preset buttons for customer given cash
  const quickCashPresets = [
    total,
    Math.ceil(total / 10000) * 10000,
    Math.ceil(total / 50000) * 50000,
    100000,
    200000,
    500000,
  ].filter((v, i, a) => v >= total && a.indexOf(v) === i);

  // Execute checkout
  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Giỏ hàng đang trống!');
      return;
    }

    if (paymentMethod === 'cash' && givenNum < total) {
      toast.error('Số tiền khách đưa chưa đủ!');
      return;
    }

    setIsProcessingCheckout(true);
    const code = currentOrderCode || generateOrderCode();

    try {
      const payload = {
        order_code: code,
        shift_id: activeShift?.id || null,
        cashier_id: profile?.id || 'demo-user-id',
        customer_id: customer?.id || null,
        subtotal,
        discount_amount: discountAmount,
        promotion_id: promotion?.id || null,
        total_amount: total,
        notes: orderNotes,
        payment_method: paymentMethod,
        customer_given: paymentMethod === 'cash' ? givenNum : total,
        change_returned: paymentMethod === 'cash' ? changeReturned : 0,
        transaction_ref: paymentMethod === 'bank_transfer' ? code : undefined,
        items,
      };

      const result = await orderService.checkout(payload);

      if (result.success) {
        toast.success(`Thanh toán đơn hàng ${code} thành công! Kho đã được cập nhật.`);
        
        // Construct full order object for immediate printing
        const completedOrder: any = {
          ...payload,
          id: result.order_id,
          created_at: new Date().toISOString(),
          profiles: profile,
          customers: customer,
          order_items: items,
          payments: [
            {
              payment_method: paymentMethod,
              amount_paid: total,
              customer_given: givenNum,
              change_returned: changeReturned,
            },
          ],
        };

        // Auto print receipt
        if (window.printReceipt) {
          window.printReceipt(completedOrder);
        }

        clearCart();
        setCheckoutModal(false);
      } else {
        toast.error(result.message || 'Lỗi xử lý đơn hàng');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi gọi thanh toán');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-5rem)]">
      {/* ================= LEFT: PRODUCT CATALOG ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm đồ uống theo tên, mã SKU... (VD: Cà phê sữa, Trà đào, TS01)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                selectedCategory === 'all'
                  ? 'bg-brand-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả món ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                  selectedCategory === cat.id
                    ? 'bg-brand-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredProducts.map((prod) => {
              const defaultVariant = prod.product_variants?.find((v) => v.size === 'M') || prod.product_variants?.[0];
              const priceDisplay = defaultVariant ? defaultVariant.price : prod.base_cost;

              return (
                <div
                  key={prod.id}
                  onClick={() => handleOpenProduct(prod)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col select-none"
                >
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    {prod.image_url ? (
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Coffee className="w-10 h-10" />
                      </div>
                    )}
                    {prod.is_featured && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
                        HOT
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-900/70 text-white backdrop-blur-xs">
                      {prod.product_variants?.length || 1} size
                    </span>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1 group-hover:text-brand-700 transition">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{prod.sku}</p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="font-extrabold text-sm sm:text-base text-brand-800">
                        {formatCurrency(priceDisplay)}
                      </span>
                      <span className="w-7 h-7 rounded-lg bg-brand-50 group-hover:bg-brand-700 text-brand-700 group-hover:text-white flex items-center justify-center transition-colors">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= RIGHT: CART & BILLING PANEL ================= */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex-shrink-0">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-800 text-base">Đơn hàng hiện tại</h3>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-brand-100 text-brand-800">
              {getItemCount()} ly
            </span>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa hết
            </button>
          )}
        </div>

        {/* Customer Select Bar */}
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            {customer ? (
              <div>
                <span className="font-bold text-slate-800">{customer.full_name}</span>
                <span className="text-[11px] text-emerald-600 ml-1.5 font-semibold">
                  ({customer.customer_rank} - {customer.points} điểm)
                </span>
              </div>
            ) : (
              <span className="text-slate-500">Khách vãng lai</span>
            )}
          </div>
          <button
            onClick={() => setCustomerModal(true)}
            className="text-brand-700 font-bold hover:underline"
          >
            {customer ? 'Đổi' : 'Chọn khách'}
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <Coffee className="w-12 h-12 text-slate-300 stroke-1 mb-2" />
              <p className="text-sm font-semibold">Chưa có món nào</p>
              <p className="text-xs text-slate-400 mt-1">
                Chọn món từ danh mục bên trái để thêm vào đơn
              </p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                      {item.product_name}
                    </h5>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-brand-800 uppercase">Size {item.size}</span>
                      <span>•</span>
                      <span>{item.sugar_level} ngọt</span>
                      <span>•</span>
                      <span>{item.ice_level} đá</span>
                    </div>

                    {/* Toppings badge */}
                    {item.toppings?.length > 0 && (
                      <div className="text-[10px] text-brand-700 font-medium mt-1">
                        + {item.toppings.map((t) => `${t.topping_name} x${t.quantity}`).join(', ')}
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-[10px] italic text-slate-500 mt-0.5">
                        * {item.notes}
                      </p>
                    )}
                  </div>

                  <span className="font-extrabold text-xs text-slate-800">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] text-slate-400">
                    {formatCurrency(item.unit_price)}/ly
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-800 w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(idx)}
                      className="ml-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Voucher & Pricing Summary */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
          {/* Voucher Bar */}
          <div className="flex items-center justify-between">
            {promotion ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex-1 mr-2 truncate">
                <Tag className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-bold truncate">{promotion.code}</span>
                <span className="text-[11px]">(-{formatCurrency(discountAmount)})</span>
                <button
                  onClick={removePromotion}
                  className="ml-auto text-emerald-600 hover:text-emerald-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPromoModal(true)}
                className="text-xs font-semibold text-brand-700 hover:underline flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5" />
                Áp dụng mã giảm giá / Voucher
              </button>
            )}
          </div>

          {/* Pricing calculations */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Tạm tính ({getItemCount()} món):</span>
              <span className="font-medium text-slate-800">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Giảm giá khuyến mãi:</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-800 text-sm">TỔNG THANH TOÁN:</span>
              <span className="font-extrabold text-xl text-brand-800">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Action Button: Checkout */}
          <Button
            variant="primary"
            size="lg"
            disabled={items.length === 0}
            onClick={() => {
              setCurrentOrderCode(generateOrderCode());
              setCustomerGiven(total.toString());
              setCheckoutModal(true);
            }}
            className="w-full shadow-md"
          >
            Thanh toán ({formatCurrency(total)})
          </Button>
        </div>
      </div>

      {/* ================= MODAL: CUSTOMIZE BEVERAGE ================= */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name || 'Tùy chỉnh đồ uống'}
        maxWidth="lg"
      >
        {selectedProduct && (
          <div className="space-y-5">
            {/* Size Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Chọn kích thước (Size)
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(selectedProduct.product_variants || []).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedSize(v.size)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center ${
                      selectedSize === v.size
                        ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-sm font-extrabold">Size {v.size}</span>
                    <span className="text-xs text-brand-700 font-semibold mt-0.5">
                      {formatCurrency(v.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sugar Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Lượng đường
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['100%', '70%', '50%', '30%', '0%'] as OrderItem['sugar_level'][]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSugarLevel(s)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center ${
                      sugarLevel === s
                        ? 'bg-brand-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Ice Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Lượng đá
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {(['100%', '70%', '50%', '30%', '0%', 'Nóng'] as OrderItem['ice_level'][]).map((i) => (
                  <button
                    key={i}
                    onClick={() => setIceLevel(i)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center ${
                      iceLevel === i
                        ? 'bg-brand-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Toppings */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                4. Topping thêm
              </label>
              <div className="grid grid-cols-2 gap-2">
                {toppings.map((top) => {
                  const qty = selectedToppings[top.id] || 0;
                  return (
                    <div
                      key={top.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                        qty > 0
                          ? 'border-brand-500 bg-brand-50/50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{top.name}</p>
                        <p className="text-[11px] text-brand-700 font-semibold">
                          +{formatCurrency(top.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {qty > 0 && (
                          <>
                            <button
                              onClick={() =>
                                setSelectedToppings((prev) => ({
                                  ...prev,
                                  [top.id]: Math.max(0, qty - 1),
                                }))
                              }
                              className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{qty}</span>
                          </>
                        )}
                        <button
                          onClick={() =>
                            setSelectedToppings((prev) => ({
                              ...prev,
                              [top.id]: qty + 1,
                            }))
                          }
                          className="w-6 h-6 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note & Quantity */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Input
                  label="Ghi chú pha chế"
                  placeholder="VD: ít sữa, uống liền, pha đậm trà..."
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Số lượng
                </label>
                <div className="flex items-center h-10 border border-slate-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    className="w-10 h-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 font-bold"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm">{itemQuantity}</span>
                  <button
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="w-10 h-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelectedProduct(null)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleConfirmAddDrink}>
                Thêm vào đơn hàng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= MODAL: CHỌN / TẠO KHÁCH HÀNG ================= */}
      <Modal isOpen={customerModal} onClose={() => setCustomerModal(false)} title="Khách hàng tích điểm" maxWidth="md">
        <div className="space-y-4">
          <Input
            placeholder="Tìm theo số điện thoại hoặc tên khách..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-100 rounded-xl p-1">
            {customers
              .filter(
                (c) =>
                  c.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.phone.includes(customerSearch)
              )
              .map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setCustomer(c);
                    setCustomerModal(false);
                    toast.success(`Đã chọn khách: ${c.full_name}`);
                  }}
                  className="p-2.5 rounded-lg hover:bg-brand-50 cursor-pointer flex justify-between items-center transition"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{c.full_name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{c.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {c.customer_rank}
                    </span>
                    <p className="text-xs font-extrabold text-brand-700 mt-0.5">{c.points} điểm</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Quick create new customer */}
          <div className="pt-3 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-700 mb-2">Thêm nhanh khách hàng mới</p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Tên khách hàng"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />
              <Input
                placeholder="Số điện thoại"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={async () => {
                if (!newCustomerName || !newCustomerPhone) {
                  toast.error('Vui lòng nhập tên và SĐT');
                  return;
                }
                const newC = await customerService.create({
                  full_name: newCustomerName,
                  phone: newCustomerPhone,
                });
                setCustomers((prev) => [newC, ...prev]);
                setCustomer(newC);
                setCustomerModal(false);
                toast.success('Đã thêm khách hàng mới thành công!');
              }}
            >
              Tạo và chọn khách
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= MODAL: ÁP DỤNG VOUCHER ================= */}
      <Modal isOpen={promoModal} onClose={() => setPromoModal(false)} title="Chọn mã khuyến mãi" maxWidth="sm">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã voucher (VD: CHILLWELCOME)"
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
            />
            <Button
              variant="primary"
              onClick={() => {
                const target = promotions.find((p) => p.code.toUpperCase() === voucherInput.trim());
                if (!target) {
                  toast.error('Mã khuyến mãi không tồn tại');
                  return;
                }
                const res = applyPromotion(target);
                if (res.success) {
                  toast.success(res.message);
                  setPromoModal(false);
                } else {
                  toast.error(res.message);
                }
              }}
            >
              Áp dụng
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-slate-700 uppercase">Khuyến mãi đang có:</p>
            {promotions.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  const res = applyPromotion(p);
                  if (res.success) {
                    toast.success(res.message);
                    setPromoModal(false);
                  } else {
                    toast.error(res.message);
                  }
                }}
                className="p-2.5 rounded-xl border border-dashed border-brand-300 bg-brand-50/40 hover:bg-brand-50 cursor-pointer transition flex justify-between items-center"
              >
                <div>
                  <p className="text-xs font-bold text-brand-900">{p.code}</p>
                  <p className="text-[11px] text-slate-600">{p.description}</p>
                </div>
                <span className="text-xs font-bold text-brand-800">
                  {p.discount_type === 'percent'
                    ? `-${p.discount_value}%`
                    : `-${formatCurrency(p.discount_value)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* ================= MODAL: CHECKOUT & THANH TOÁN (VIETQR / TIỀN MẶT) ================= */}
      <Modal
        isOpen={checkoutModal}
        onClose={() => setCheckoutModal(false)}
        title={`Thanh toán đơn hàng: ${currentOrderCode}`}
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Payment Method Tabs */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                paymentMethod === 'cash'
                  ? 'border-brand-700 bg-brand-50 text-brand-900 font-bold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Banknote className="w-6 h-6 text-emerald-600" />
              <span className="text-sm">Tiền mặt</span>
            </button>
            <button
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                paymentMethod === 'bank_transfer'
                  ? 'border-brand-700 bg-brand-50 text-brand-900 font-bold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-6 h-6 text-brand-700" />
              <span className="text-sm">Chuyển khoản (VietQR)</span>
            </button>
          </div>

          {/* CASH PAYMENT UI */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                <span>Số tiền phải thu:</span>
                <span className="text-xl text-brand-800 font-extrabold">{formatCurrency(total)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tiền khách đưa (VNĐ)
                </label>
                <input
                  type="number"
                  value={customerGiven}
                  onChange={(e) => setCustomerGiven(e.target.value)}
                  className="w-full text-xl font-bold bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="0"
                />
              </div>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap gap-2">
                {quickCashPresets.map((val) => (
                  <button
                    key={val}
                    onClick={() => setCustomerGiven(val.toString())}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                  >
                    {formatCurrency(val)}
                  </button>
                ))}
              </div>

              {/* Change Returned */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">Tiền thừa trả khách:</span>
                <span
                  className={`text-lg font-extrabold ${
                    givenNum >= total ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {givenNum >= total ? formatCurrency(changeReturned) : 'Chưa đủ tiền'}
                </span>
              </div>
            </div>
          )}

          {/* VIETQR PAYMENT UI */}
          {paymentMethod === 'bank_transfer' && storeSetting && (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
                <img
                  src={generateVietQRUrl({
                    bankBin: storeSetting.bank_bin || '970422',
                    accountNumber: storeSetting.bank_account_number || '999988889999',
                    amount: total,
                    description: currentOrderCode,
                    accountName: storeSetting.bank_account_name || 'CHILL HOUSE',
                  })}
                  alt="VietQR Chill House"
                  className="w-56 h-auto object-contain rounded-lg"
                />
              </div>
              <div className="text-center text-xs space-y-1">
                <p className="font-bold text-slate-800">
                  {storeSetting.bank_name} - {storeSetting.bank_account_number}
                </p>
                <p className="text-slate-600 uppercase font-semibold">
                  {storeSetting.bank_account_name}
                </p>
                <p className="text-emerald-700 font-extrabold text-sm">
                  Số tiền: {formatCurrency(total)}
                </p>
                <p className="text-slate-400 font-mono text-[11px]">
                  Nội dung: {currentOrderCode}
                </p>
              </div>
            </div>
          )}

          {/* Order Notes */}
          <Input
            label="Ghi chú toàn đơn hàng"
            placeholder="Ghi chú giao nhận, bàn số..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCheckoutModal(false)}>
              Quay lại
            </Button>
            <Button
              variant="success"
              size="lg"
              loading={isProcessingCheckout}
              onClick={handleCheckout}
              className="gap-2"
            >
              <Check className="w-5 h-5" />
              Xác nhận thanh toán & In hóa đơn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
