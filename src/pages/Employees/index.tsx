import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService';
import { useToastStore } from '../../stores/toastStore';
import type { Profile, Role } from '../../types/database.types';
import { UserCheck, Shield, Edit, Plus } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editingEmp, setEditingEmp] = useState<Profile | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToastStore();

  const loadData = async () => {
    const [emps, rls] = await Promise.all([
      employeeService.getAll(),
      employeeService.getRoles(),
    ]);
    setEmployees(emps);
    setRoles(rls);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateRole = async () => {
    if (!editingEmp) return;
    try {
      await employeeService.update(editingEmp.id, {
        role_id: selectedRoleId,
        full_name: fullName,
        phone,
      });
      toast.success('Cập nhật phân quyền nhân viên thành công!');
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật quyền');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý Nhân viên & Phân quyền</h1>
          <p className="text-xs text-slate-500 mt-1">Phân quyền chức vụ Admin, Quản lý, Thu ngân và Pha chế theo chuẩn bảo mật RLS</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3.5 px-4">Mã NV</th>
              <th className="py-3.5 px-4">Họ và tên</th>
              <th className="py-3.5 px-4">Email / Tài khoản</th>
              <th className="py-3.5 px-4">Số điện thoại</th>
              <th className="py-3.5 px-4 text-center">Chức vụ & Quyền hạn</th>
              <th className="py-3.5 px-4 text-center">Trạng thái</th>
              <th className="py-3.5 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-4 font-mono font-bold text-brand-900">{emp.employee_code}</td>
                <td className="py-3 px-4 font-bold text-slate-800 text-sm">{emp.full_name}</td>
                <td className="py-3 px-4 text-slate-500">{emp.email || '—'}</td>
                <td className="py-3 px-4 font-mono text-slate-600">{emp.phone || '—'}</td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    <Shield className="w-3 h-3 text-brand-700" />
                    {emp.roles?.display_name || 'Nhân viên'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Đang làm việc
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => {
                      setEditingEmp(emp);
                      setFullName(emp.full_name);
                      setPhone(emp.phone || '');
                      setSelectedRoleId(emp.role_id);
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Cập nhật quyền: ${editingEmp?.employee_code}`} maxWidth="sm">
        <div className="space-y-4">
          <Input label="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Chức vụ & Quyền hạn</label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.display_name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleUpdateRole}>Lưu phân quyền</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
