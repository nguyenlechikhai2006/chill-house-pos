import React, { useState, useEffect } from 'react';
import { supplierService } from '../../services/purchaseService';
import { useToastStore } from '../../stores/toastStore';
import type { Supplier } from '../../types/database.types';
import { Truck, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSup, setEditingSup] = useState<Supplier | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const toast = useToastStore();

  const loadData = async () => {
    const data = await supplierService.getAll();
    setSuppliers(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!name || !code) {
      toast.error('Vui lòng nhập tên và mã nhà cung cấp');
      return;
    }
    try {
      if (editingSup) {
        await supplierService.update(editingSup.id, { name, code, contact_name: contactName, phone, email, address });
        toast.success('Cập nhật nhà cung cấp thành công!');
      } else {
        await supplierService.create({ name, code, contact_name: contactName, phone, email, address, is_active: true });
        toast.success('Thêm nhà cung cấp mới thành công!');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Lỗi khi lưu nhà cung cấp');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý Nhà cung cấp</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách đối tác cung ứng nguyên vật liệu pha chế, bao bì ly tách</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingSup(null);
            setName('');
            setCode(`NCC-${Math.floor(100 + Math.random() * 900)}`);
            setContactName('');
            setPhone('');
            setEmail('');
            setAddress('');
            setModalOpen(true);
          }}
        >
          Thêm nhà cung cấp
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3.5 px-4">Mã NCC</th>
              <th className="py-3.5 px-4">Tên nhà cung cấp</th>
              <th className="py-3.5 px-4">Người liên hệ</th>
              <th className="py-3.5 px-4">Số điện thoại</th>
              <th className="py-3.5 px-4">Địa chỉ</th>
              <th className="py-3.5 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-4 font-mono font-bold text-brand-900">{s.code}</td>
                <td className="py-3 px-4 font-bold text-slate-800 text-sm">{s.name}</td>
                <td className="py-3 px-4 text-slate-600">{s.contact_name || '—'}</td>
                <td className="py-3 px-4 font-mono text-slate-700">{s.phone || '—'}</td>
                <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{s.address || '—'}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => {
                      setEditingSup(s);
                      setName(s.name);
                      setCode(s.code);
                      setContactName(s.contact_name || '');
                      setPhone(s.phone || '');
                      setEmail(s.email || '');
                      setAddress(s.address || '');
                      setModalOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-brand-700 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingSup ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'} maxWidth="md">
        <div className="space-y-4">
          <Input label="Tên nhà cung cấp" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Mã NCC" value={code} onChange={(e) => setCode(e.target.value)} required />
            <Input label="Người liên hệ" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Input label="Địa chỉ xưởng / kho" value={address} onChange={(e) => setAddress(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSave}>Lưu nhà cung cấp</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
