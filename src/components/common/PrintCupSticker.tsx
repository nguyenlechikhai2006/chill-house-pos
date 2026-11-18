import React from 'react';
import type { Order } from '../../types/database.types';
import { formatDateTime } from '../../lib/utils';

interface PrintCupStickerProps {
  order: Order | null;
}

export const PrintCupSticker: React.FC<PrintCupStickerProps> = ({ order }) => {
  if (!order || !order.order_items) return null;

  // Flatten items by quantity to generate 1 sticker per cup
  const cups: {
    cupIndex: number;
    totalCups: number;
    productName: string;
    size: string;
    sugar: string;
    ice: string;
    toppings: string[];
    notes?: string;
  }[] = [];

  const totalCups = order.order_items.reduce((sum, it) => sum + it.quantity, 0);
  let currentCup = 1;

  order.order_items.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      cups.push({
        cupIndex: currentCup++,
        totalCups,
        productName: item.product_name,
        size: item.size,
        sugar: item.sugar_level,
        ice: item.ice_level,
        toppings: item.toppings?.map((t) => `${t.topping_name} x${t.quantity}`) || [],
        notes: item.notes,
      });
    }
  });

  return (
    <div id="cup-stickers" className="hidden print:block text-black bg-white">
      {cups.map((cup, idx) => (
        <div
          key={idx}
          className="border border-black p-2 mb-2 rounded font-sans text-xs page-break-after"
          style={{ width: '50mm', minHeight: '30mm' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-black pb-1 mb-1">
            <span className="font-bold text-[11px] truncate">{order.order_code}</span>
            <span className="font-extrabold text-[12px] bg-black text-white px-1.5 py-0.5 rounded">
              [{cup.cupIndex}/{cup.totalCups}]
            </span>
          </div>

          {/* Drink Name & Size */}
          <div className="font-extrabold text-[13px] leading-tight mb-1">
            {cup.productName} ({cup.size})
          </div>

          {/* Sugar & Ice */}
          <div className="text-[11px] font-semibold text-gray-800">
            Đường: {cup.sugar} | Đá: {cup.ice}
          </div>

          {/* Toppings */}
          {cup.toppings.length > 0 && (
            <div className="text-[10px] font-medium text-gray-900 mt-1">
              + {cup.toppings.join(', ')}
            </div>
          )}

          {/* Notes */}
          {cup.notes && (
            <div className="text-[10px] italic font-medium text-red-600 mt-0.5">
              *Ghi chú: {cup.notes}
            </div>
          )}

          {/* Timestamp */}
          <div className="text-[9px] text-gray-500 mt-1 pt-1 border-t border-dotted border-gray-400 flex justify-between">
            <span>Chill House Bar</span>
            <span>{formatDateTime(order.created_at).slice(11, 16)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
