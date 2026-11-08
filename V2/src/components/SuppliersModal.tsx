import React, { useState } from 'react';
import {
  Download,
  Edit2,
  Plus,
  Search,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Supplier } from '../types';
import { formatCurrency } from '../utils/formatters';

export const SuppliersModal: React.FC = () => {
  const {
    isSupplierModalOpen,
    setIsSupplierModalOpen,
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    setIsCreateReceiptModalOpen,
  } = useWarehouse();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [categories, setCategories] = useState('Mực in & Phôi nạp');
  const [debtPayable, setDebtPayable] = useState<number>(0);

  if (!isSupplierModalOpen) return null;

  const resetForm = () => {
    setName('');
    setContactPerson('');
    setPhone('');
    setAddress('');
    setEmail('');
    setTaxCode('');
    setCategories('Mực in & Phôi nạp');
    setDebtPayable(0);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEditClick = (supp: Supplier) => {
    setEditingId(supp.id);
    setName(supp.name);
    setContactPerson(supp.contactPerson);
    setPhone(supp.phone);
    setAddress(supp.address);
    setEmail(supp.email || '');
    setTaxCode(supp.taxCode || '');
    setCategories(supp.categories);
    setDebtPayable(supp.debtPayable);
    setIsAdding(true);
    setTimeout(() => document.getElementById('supplier-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Vui lòng nhập Tên nhà cung cấp và Số điện thoại.');
      return;
    }
    if (!Number.isFinite(Number(debtPayable)) || Number(debtPayable) < 0) {
      alert('Công nợ phải là số không âm.');
      return;
    }

    if (editingId) {
      updateSupplier(editingId, {
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        address: address.trim(),
        email: email.trim(),
        taxCode: taxCode.trim(),
        categories: categories.trim(),
        debtPayable: Number(debtPayable),
      });
    } else {
      addSupplier({
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        address: address.trim(),
        email: email.trim(),
        taxCode: taxCode.trim(),
        categories: categories.trim(),
        debtPayable: Number(debtPayable),
      });
    }

    resetForm();
  };

  const handleDelete = (supp: Supplier) => {
    if (confirm(`Bạn có chắc chắn muốn xóa Nhà Cung Cấp:\n${supp.code} - ${supp.name}?`)) {
      const res = deleteSupplier(supp.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    if (!searchTerm.trim()) return true;
    const t = searchTerm.toLowerCase();
    return (
      s.code.toLowerCase().includes(t) ||
      s.name.toLowerCase().includes(t) ||
      s.contactPerson.toLowerCase().includes(t) ||
      s.categories.toLowerCase().includes(t) ||
      s.phone.includes(t)
    );
  });

  const totalDebtPayable = suppliers.reduce((sum, s) => sum + s.debtPayable, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-xs tracking-wide">
              Danh Mục Đối Tác · Nhà Cung Cấp Hàng Hoá & Công Nợ Phải Trả
            </span>
          </div>
          <button onClick={() => setIsSupplierModalOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-100 p-3 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isAdding) {
                  resetForm();
                } else {
                  resetForm();
                  setIsAdding(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? 'Đóng Biểu Mẫu' : 'Thêm Nhà Cung Cấp Mới'}</span>
            </button>

            <div className="text-slate-600">
              Tổng số NCC: <strong className="text-slate-900">{suppliers.length}</strong> đối tác
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs">
              Tổng nợ phải trả NCC:{' '}
              <strong className="text-amber-800 font-mono font-bold">
                {formatCurrency(totalDebtPayable)}
              </strong>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã NCC, tên nhà cung cấp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded pl-7 pr-2 py-1 text-xs focus:outline-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-auto p-4 space-y-4 text-xs">
          {/* Add / Edit Form */}
          {isAdding && (
            <form id="supplier-form" onSubmit={handleSave} noValidate className="bg-slate-50 p-3.5 rounded border border-slate-300 space-y-3">
              <div className="font-semibold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>
                  {editingId ? 'Cập Nhật Thông Tin Nhà Cung Cấp' : 'Thêm Mới Nhà Cung Cấp / Tổng Kho'}
                </span>
                <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tên Nhà Cung Cấp / Công Ty <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Tổng Kho Mực In VMAX, NPP Vĩnh Xuân SPC..."
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Người Đại Diện / Phụ Trách KD:</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="VD: Anh Mạnh, Chị Ngọc..."
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Số Điện Thoại Liên Hệ <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="024.xxx.xxxx / 09xx.xxx.xxx"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Email Đặt Hàng:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kinhdoanh@nhacungcap.vn"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Mã Số Thuế:</label>
                  <input
                    type="text"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    placeholder="010xxxxxxx"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 mb-1">Địa Chỉ Kho Hàng / Văn Phòng:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Số nhà, đường, quận, thành phố..."
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Công Nợ Hiện Phải Trả NCC (đ):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={debtPayable}
                    onChange={(e) => setDebtPayable(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-amber-800 font-semibold focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Nhóm Hàng Hoá Cung Ứng Chính:</label>
                <input
                  type="text"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  placeholder="VD: Mực in cartridge, Mực nạp túi 1kg, Trống drum, gạt mực, RAM SSD..."
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs"
                >
                  {editingId ? 'Lưu Cập Nhật' : 'Lưu Nhà Cung Cấp'}
                </button>
              </div>
            </form>
          )}

          {/* Suppliers Table */}
          <div className="border border-slate-300 rounded overflow-x-auto bg-white">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2 px-3 whitespace-nowrap">Mã NCC</th>
                  <th className="py-2 px-3 min-w-[220px]">Tên Nhà Cung Cấp</th>
                  <th className="py-2 px-3 whitespace-nowrap">Người Liên Hệ</th>
                  <th className="py-2 px-3 whitespace-nowrap">Điện Thoại</th>
                  <th className="py-2 px-3">Ngành Hàng Cung Cấp</th>
                  <th className="py-2 px-3 text-right whitespace-nowrap">Công Nợ Phải Trả</th>
                  <th className="py-2 px-3 text-center whitespace-nowrap w-24 sticky right-0 bg-slate-100 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.15)]">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 font-mono font-bold text-amber-800 whitespace-nowrap">
                      {s.code}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2">{s.address}</div>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-700">
                      {s.contactPerson || '-'}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {s.phone}
                    </td>
                    <td className="py-2 px-3 text-slate-600 max-w-[240px] min-w-[180px]" title={s.categories}>
                      <span className="inline-block bg-slate-100 px-1.5 py-0.5 rounded text-[11px] border border-slate-200 whitespace-normal">
                        {s.categories}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className={s.debtPayable > 0 ? 'text-amber-800' : 'text-slate-500'}>
                        {formatCurrency(s.debtPayable)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap sticky right-0 bg-white shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.15)]">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(s)}
                          className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded"
                          title="Sửa thông tin NCC"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setIsSupplierModalOpen(false);
                            setIsCreateReceiptModalOpen(true);
                          }}
                          className="p-1 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded"
                          title="Lập phiếu nhập hàng từ NCC này"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded"
                          title="Xóa NCC"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-mono">
            Hệ thống hỗ trợ quản lý chi tiết công nợ và nguồn hàng đối tác
          </span>
          <button
            onClick={() => setIsSupplierModalOpen(false)}
            className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-white text-xs font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
