import React from 'react';
import type { Order, StoreSetting } from '../../types/database.types';
import { formatCurrency, formatDateTime } from '../../lib/utils';

interface PrintReceiptProps {
  order: Order | null;
  setting: StoreSetting;
}

export const PrintThermalReceipt: React.FC<PrintReceiptProps> = ({ order, setting }) => {
  if (!order) return null;

  const payment = order.payments && order.payments.length > 0 ? order.payments[0] : null;

  return (
    <div id="thermal-receipt" className="hidden print:block text-black bg-white">
      <div className="text-center pb-2 border-b border-dashed border-black">
        <h1 className="text-base font-extrabold uppercase tracking-wide">{setting.store_name}</h1>
        <p className="text-xs">{setting.address}</p>
        <p className="text-xs">Hotline: {setting.phone}</p>
        <h2 className="text-sm font-bold mt-2 uppercase">PHIẾU THANH TOÁN</h2>
        <p className="text-xs">Mã đơn: <span className="font-bold">{order.order_code}</span></p>
        <p className="text-xs">Ngày: {formatDateTime(order.created_at)}</p>
        <p className="text-xs">Thu ngân: {order.profiles?.full_name || 'Thu ngân'}</p>
        {order.customers && (
          <p className="text-xs">Khách hàng: {order.customers.full_name} ({order.customers.phone})</p>
        )}
      </div>

      {/* Items Table */}
      <div className="py-2 border-b border-dashed border-black text-xs">
        <div className="flex justify-between font-bold pb-1 border-b border-black">
          <span className="w-1/2">Món</span>
          <span className="w-1/6 text-center">SL</span>
          <span className="w-1/3 text-right">T.Tiền</span>
        </div>
        {order.order_items?.map((item, idx) => (
          <div key={idx} className="py-1">
            <div className="flex justify-between">
              <span className="w-1/2 font-medium">
                {item.product_name} ({item.size})
              </span>
              <span className="w-1/6 text-center">{item.quantity}</span>
              <span className="w-1/3 text-right font-medium">{formatCurrency(item.subtotal)}</span>
            </div>
            {/* Modifiers */}
            {(item.sugar_level !== '100%' || item.ice_level !== '100%' || item.notes) && (
              <div className="text-[10px] text-gray-700 pl-2">
                - {item.sugar_level} đường, {item.ice_level} đá
                {item.notes ? ` (${item.notes})` : ''}
              </div>
            )}
            {/* Toppings */}
            {item.toppings?.map((top, tIdx) => (
              <div key={tIdx} className="text-[10px] text-gray-700 pl-2 flex justify-between">
                <span>+ {top.topping_name} x{top.quantity}</span>
                <span>{formatCurrency(top.subtotal)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="py-2 border-b border-dashed border-black text-xs space-y-1">
        <div className="flex justify-between">
          <span>Tổng tiền hàng:</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        {Number(order.discount_amount) > 0 && (
          <div className="flex justify-between">
            <span>Giảm giá / Voucher:</span>
            <span>-{formatCurrency(order.discount_amount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold pt-1 border-t border-black">
          <span>THANH TOÁN:</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
        {payment && (
          <>
            <div className="flex justify-between text-[11px] pt-1">
              <span>Hình thức:</span>
              <span className="uppercase font-medium">
                {payment.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản (VietQR)'}
              </span>
            </div>
            {payment.payment_method === 'cash' && (
              <>
                <div className="flex justify-between text-[11px]">
                  <span>Tiền khách đưa:</span>
                  <span>{formatCurrency(payment.customer_given || order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Tiền trả lại:</span>
                  <span>{formatCurrency(payment.change_returned || 0)}</span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pt-3 text-[11px]">
        <p className="italic">{setting.invoice_footer}</p>
        <p className="mt-1 font-mono text-[9px]">Chill House POS - Powered by Antigravity</p>
      </div>
    </div>
  );
};
