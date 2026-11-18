import React, { useState, useEffect } from 'react';
import { settingService } from '../../services/settingService';
import { useToastStore } from '../../stores/toastStore';
import type { StoreSetting } from '../../types/database.types';
import { Settings, Save, QrCode, Store } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const SettingsPage: React.FC = () => {
  const [setting, setSetting] = useState<StoreSetting | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToastStore();

  useEffect(() => {
    settingService.getStoreSetting().then((s: StoreSetting) => setSetting(s));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setting) return;
    setLoading(true);
    try {
      await settingService.updateStoreSetting(setting.id, setting);
      toast.success('Cập nhật cấu hình cửa hàng thành công!');
    } catch (err: any) {
      toast.error('Lỗi khi lưu cấu hình');
    } finally {
      setLoading(false);
    }
  };

  if (!setting) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Cài Đặt Hệ Thống Chill House</h1>
        <p className="text-xs text-slate-500 mt-1">Cấu hình thông tin quán, tài khoản nhận tiền VietQR và mẫu in hóa đơn</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Basic Info */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-brand-900 font-bold text-sm">
            <Store className="w-4 h-4" />
            <span>Thông tin cửa hàng</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên quán nước / Thương hiệu"
              value={setting.store_name}
              onChange={(e) => setSetting({ ...setting, store_name: e.target.value })}
              required
            />
            <Input
              label="Hotline đặt món"
              value={setting.phone}
              onChange={(e) => setSetting({ ...setting, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email liên hệ"
              value={setting.email}
              onChange={(e) => setSetting({ ...setting, email: e.target.value })}
            />
            <Input
              label="Mã số thuế"
              value={setting.tax_number || ''}
              onChange={(e) => setSetting({ ...setting, tax_number: e.target.value })}
            />
          </div>

          <Input
            label="Địa chỉ quán (in trên Bill)"
            value={setting.address}
            onChange={(e) => setSetting({ ...setting, address: e.target.value })}
            required
          />
        </div>

        {/* VietQR Bank Account Settings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-brand-900 font-bold text-sm">
            <QrCode className="w-4 h-4" />
            <span>Cấu hình Thanh toán Chuyển khoản (VietQR Napas 247)</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên Ngân hàng"
              value={setting.bank_name}
              onChange={(e) => setSetting({ ...setting, bank_name: e.target.value })}
              placeholder="MB Bank, Vietcombank, Techcombank..."
              required
            />
            <Input
              label="Mã BIN ngân hàng (Napas)"
              value={setting.bank_bin}
              onChange={(e) => setSetting({ ...setting, bank_bin: e.target.value })}
              placeholder="970422 (MB), 970436 (VCB)..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số tài khoản ngân hàng"
              value={setting.bank_account_number}
              onChange={(e) => setSetting({ ...setting, bank_account_number: e.target.value })}
              required
            />
            <Input
              label="Tên chủ tài khoản (In hoa không dấu)"
              value={setting.bank_account_name}
              onChange={(e) => setSetting({ ...setting, bank_account_name: e.target.value.toUpperCase() })}
              required
            />
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-brand-900 font-bold text-sm">
            <span>Lời nhắn chân trang hóa đơn nhiệt (Footer)</span>
          </div>

          <div>
            <textarea
              value={setting.invoice_footer}
              onChange={(e) => setSetting({ ...setting, invoice_footer: e.target.value })}
              rows={2}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" size="lg" type="submit" loading={loading} icon={<Save className="w-5 h-5" />}>
            Lưu thay đổi cấu hình
          </Button>
        </div>
      </form>
    </div>
  );
};
