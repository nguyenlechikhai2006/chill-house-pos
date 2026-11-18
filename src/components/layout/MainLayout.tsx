import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/ToastContainer';
import { PrintThermalReceipt } from '../common/PrintThermalReceipt';
import { PrintCupSticker } from '../common/PrintCupSticker';
import { settingService } from '../../services/settingService';
import type { Order, StoreSetting } from '../../types/database.types';

declare global {
  interface Window {
    printReceipt: (order: Order) => void;
    printStickers: (order: Order) => void;
  }
}

export const MainLayout: React.FC = () => {
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [printType, setPrintType] = useState<'receipt' | 'sticker' | null>(null);
  const [setting, setSetting] = useState<StoreSetting>({
    id: 's',
    store_name: 'Chill House Coffee & Tea',
    phone: '0988 123 456',
    email: 'contact@chillhouse.vn',
    address: '123 Đường Cà Phê, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    bank_name: 'MB Bank',
    bank_account_number: '999988889999',
    bank_account_name: 'CHILL HOUSE F&B',
    bank_bin: '970422',
    invoice_footer: 'Cảm ơn quý khách đã ghé Chill House! Hẹn gặp lại quý khách!',
    currency: 'VNĐ',
    timezone: 'Asia/Ho_Chi_Minh',
    vat_percent: 0,
  });

  useEffect(() => {
    settingService.getStoreSetting().then((s: StoreSetting) => {
      if (s) setSetting(s);
    });

    // Register global print triggers
    window.printReceipt = (order: Order) => {
      setPrintOrder(order);
      setPrintType('receipt');
      setTimeout(() => {
        window.print();
      }, 250);
    };

    window.printStickers = (order: Order) => {
      setPrintOrder(order);
      setPrintType('sticker');
      setTimeout(() => {
        window.print();
      }, 250);
    };
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <ToastContainer />

      {/* Hidden print containers */}
      {printType === 'receipt' && <PrintThermalReceipt order={printOrder} setting={setting} />}
      {printType === 'sticker' && <PrintCupSticker order={printOrder} />}
    </div>
  );
};
