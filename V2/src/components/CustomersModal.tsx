import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Customer } from '../types';

export const HOSPITAL_DEPARTMENTS = [
  'Ban Giám đốc',
  'Khoa Cấp cứu, Hồi sức tích cực',
  'Khoa Khám bệnh',
  'Khoa Nội',
  'Khoa Ngoại - PTGMHS',
  'Khoa Phụ Sản',
  'Khoa Nhi',
  'Khoa CĐHA - TDCN',
  'Khoa Xét Nghiệm',
  'Khoa Dược',
  'Khoa U Bướu - Y HỌC HẠT NHÂN',
  'Khoa LCK (Mắt - TMH - RHM)',
  'Khoa PHCN',
  'Khoa Y học cổ truyền',
  'Khoa KSNK',
  'Phòng KHTH',
  'Phòng TCHC',
  'Phòng Điều dưỡng',
  'Phòng Tài chính Kế toán',
  'Phòng Công Nghệ Thông Tin',
  'Khác',
];

export const CustomersModal: React.FC = () => {
  const {
    isCustomerModalOpen,
    setIsCustomerModalOpen,
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    resetCustomersToDefault,
    hasPermission,
  } = useWarehouse();

  // Add state
  const [isAdding, setIsAdding] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addGroup, setAddGroup] = useState<string>('Khoa Khám bệnh');

  // Edit state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editName, setEditName] = useState('');
  const [editGroup, setEditGroup] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Delete state (replacing window.confirm with in-app modal)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Quick feedback notification
  const [notification, setNotification] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (selectedDeptFilter !== 'ALL' && c.group !== selectedDeptFilter) return false;
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const mName = c.name.toLowerCase().includes(t);
        const mDept = (c.group || '').toLowerCase().includes(t);
        const mPhone = (c.phone || '').toLowerCase().includes(t);
        const mCode = (c.code || '').toLowerCase().includes(t);
        if (!mName && !mDept && !mPhone && !mCode) return false;
      }
      return true;
    });
  }, [customers, selectedDeptFilter, searchTerm]);

  if (!isCustomerModalOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleOpenEdit = (customer: Customer) => {
    if (!hasPermission('canManageCustomers')) {
      showToast('Tài khoản của bạn không có quyền chỉnh sửa thông tin nhân viên/khoa phòng. Vui lòng liên hệ Admin IT!');
      return;
    }
    setEditingCustomer(customer);
    setEditName(customer.name);
    setEditGroup(customer.group || 'Khoa Khám bệnh');
    setEditPhone(customer.phone || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editName.trim()) return;

    updateCustomer(editingCustomer.id, {
      name: editName.trim(),
      group: editGroup.trim() || 'Khoa Khám bệnh',
      phone: editPhone.trim(),
    });

    const isDeptChanged = editingCustomer.group !== editGroup;
    showToast(
      isDeptChanged
        ? `Đã chuyển nhân viên "${editName.trim()}" sang ${editGroup} thành công!`
        : `Đã cập nhật thông tin nhân viên "${editName.trim()}" thành công!`
    );

    setEditingCustomer(null);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;

    addCustomer({
      name: addName.trim(),
      phone: addPhone.trim(),
      address: addGroup,
      debtAmount: 0,
      group: addGroup,
    });

    showToast(`Đã thêm mới nhân viên "${addName.trim()}" vào ${addGroup}!`);
    setAddName('');
    setAddPhone('');
    setIsAdding(false);
  };

  const handleConfirmDelete = () => {
    if (!customerToDelete) return;
    deleteCustomer(customerToDelete.id);
    showToast(`Đã xóa nhân viên "${customerToDelete.name}" (${customerToDelete.group}) thành công!`);
    setCustomerToDelete(null);
  };

  const handleResetToStandard208 = () => {
    resetCustomersToDefault();
    setSelectedDeptFilter('ALL');
    setSearchTerm('');
    setIsResetConfirmOpen(false);
    showToast('Đã xóa danh sách cũ và nạp lại chuẩn 208 nhân viên thuộc 21 khoa phòng VPMED!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-sm border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600/30 text-cyan-400 rounded-lg border border-blue-400/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <span>Danh Mục Khách Hàng / Nhân Viên Khoa Phòng VPMED</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
                  {customers.length} Nhân Viên
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                CÔNG TY BỆNH VIỆN CỔ PHẦN VPMED · Đơn vị nhận cấp phát vật tư từ Kho IT
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsCustomerModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-700/60 rounded cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Optional Notification Toast */}
        {notification && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="p-3.5 space-y-3 text-xs flex-1 flex flex-col overflow-hidden bg-slate-50/50">
          {/* Action & Filter Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 shrink-0 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700">
                Tổng: <strong className="text-blue-900 font-bold">{customers.length}</strong> nhân viên
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-semibold">
                Hiển thị: {filteredCustomers.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Reset to standard 208 roster button */}
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 rounded border border-slate-300 hover:border-blue-300 font-medium cursor-pointer transition-colors shadow-2xs"
                title="Xóa danh mục cũ và nạp lại chuẩn 208 nhân viên từ danh sách bệnh viện"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Nạp Lại Chuẩn 208 Cán Bộ</span>
              </button>

              {/* Department Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs focus:outline-blue-500 font-medium text-slate-700 max-w-xs shadow-2xs cursor-pointer"
                >
                  <option value="ALL">-- Tất cả 21 Khoa / Phòng ({customers.length}) --</option>
                  {HOSPITAL_DEPARTMENTS.map((dept, i) => {
                    const count = customers.filter((c) => c.group === dept).length;
                    return (
                      <option key={i} value={dept}>
                        {dept} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Search input */}
              <div className="relative w-48 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tên nhân viên, khoa phòng, số ĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded pl-7 pr-7 py-1 text-xs focus:outline-blue-500 shadow-2xs"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Add customer button */}
              <button
                onClick={() => {
                  if (!hasPermission('canManageCustomers')) {
                    showToast('Tài khoản của bạn không có quyền thêm mới nhân viên. Vui lòng liên hệ Admin IT!');
                    return;
                  }
                  setIsAdding(!isAdding);
                  if (editingCustomer) setEditingCustomer(null);
                }}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAdding ? 'Đóng Thêm' : 'Thêm Nhân Viên Mới'}</span>
              </button>
            </div>
          </div>

          {/* Add form - Clean 3 fields */}
          {isAdding && (
            <form
              onSubmit={handleSaveNew}
              className="bg-blue-50/80 p-3.5 rounded-lg border border-blue-200 space-y-3 shrink-0 animate-in fade-in duration-150 shadow-2xs"
            >
              <div className="flex items-center justify-between pb-1 border-b border-blue-200/60">
                <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Thêm Mới Nhân Viên Nhận Cấp Phát Vật Tư</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Khoa / Phòng <span className="text-rose-500">*</span>:
                  </label>
                  <select
                    value={addGroup}
                    onChange={(e) => setAddGroup(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-blue-500 font-medium"
                  >
                    {HOSPITAL_DEPARTMENTS.map((dept, i) => (
                      <option key={i} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Tên Nhân Viên <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="VD: Nguyễn Văn Test, Vũ Thị Thùy Dương..."
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Số Điện Thoại:
                  </label>
                  <input
                    type="text"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="VD: 0912345658"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Vào Danh Mục</span>
                </button>
              </div>
            </form>
          )}

          {/* Table: Số thứ tự - Tên nhân viên - Khoa phòng - Số điện thoại - Thao tác */}
          <div className="border border-slate-300 rounded-lg overflow-hidden flex-1 overflow-y-auto bg-white shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f8fafc] text-slate-700 sticky top-0 border-b border-slate-300 font-semibold z-10 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-14 text-center text-slate-500 font-bold">STT</th>
                  <th className="py-2.5 px-4 text-slate-800 font-bold">Tên Nhân Viên</th>
                  <th className="py-2.5 px-4 text-slate-800 font-bold whitespace-nowrap">Khoa Phòng</th>
                  <th className="py-2.5 px-4 text-slate-800 font-bold whitespace-nowrap">Số Điện Thoại</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap w-28 text-slate-600 font-bold">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="space-y-2">
                        <Users className="w-8 h-8 text-slate-300 mx-auto" />
                        <div>Không tìm thấy nhân viên hoặc khoa phòng nào phù hợp với bộ lọc hiện tại.</div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDeptFilter('ALL');
                            setSearchTerm('');
                          }}
                          className="text-blue-600 hover:underline font-medium text-xs cursor-pointer"
                        >
                          Xóa bộ lọc tìm kiếm
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c, idx) => {
                    const isBeingEdited = editingCustomer?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        className={`transition-colors ${
                          isBeingEdited
                            ? 'bg-amber-50/80 ring-1 ring-amber-300'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* 1. Số Thứ Tự */}
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-xs font-semibold">
                          {idx + 1}
                        </td>

                        {/* 2. Tên Nhân Viên */}
                        <td className="py-2.5 px-4 font-semibold text-slate-900 text-xs">
                          {c.name}
                        </td>

                        {/* 3. Khoa Phòng */}
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            title="Nhấp để đổi khoa phòng hoặc sửa thông tin"
                            className="inline-flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200 font-medium transition-colors cursor-pointer group"
                          >
                            <span>{c.group}</span>
                            <Pencil className="w-2.5 h-2.5 text-blue-400 group-hover:text-blue-700 opacity-60 group-hover:opacity-100" />
                          </button>
                        </td>

                        {/* 4. Số Điện Thoại */}
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          {c.phone ? (
                            <span className="font-mono font-bold text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded border border-blue-200/60 text-xs">
                              {c.phone}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* 5. Thao Tác (Sửa & Xóa) */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                              title="Chỉnh sửa thông tin / Chuyển khoa phòng"
                            >
                              <Pencil className="w-3 h-3 text-amber-600" />
                              <span>Sửa</span>
                            </button>
                            <button
                              onClick={() => {
                                if (!hasPermission('canManageCustomers')) {
                                  showToast('Tài khoản của bạn không có quyền xóa nhân viên. Vui lòng liên hệ Admin IT!');
                                  return;
                                }
                                setCustomerToDelete(c);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 cursor-pointer transition-colors"
                              title="Xóa nhân viên khỏi danh mục"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dedicated Edit Modal: Chỉnh Sửa Tên Nhân Viên & Điều Chuyển Khoa Phòng */}
        {editingCustomer && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
              {/* Edit Modal Header */}
              <div className="bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-600/30 text-amber-400 rounded-lg border border-amber-400/30">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                      Chỉnh Sửa Nhân Viên & Điều Chuyển Khoa Phòng
                    </h3>
                    <div className="text-[11px] text-slate-300">
                      Nhân viên: <strong className="text-amber-300">{editingCustomer.name}</strong> ({editingCustomer.group})
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCustomer(null)}
                  className="text-slate-400 hover:text-white p-1 hover:bg-slate-700/60 rounded cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveEdit} className="p-4 space-y-3.5 text-xs bg-slate-50/50">
                {/* Highlighted Department Switcher */}
                <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3">
                  <label className="block text-blue-900 font-bold mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Khoa Phòng Trực Thuộc (21 Khoa Phòng VPMED) <span className="text-rose-500">*</span></span>
                  </label>
                  <p className="text-[11px] text-blue-700 mb-2">
                    Chọn khoa phòng mới nếu nhân viên điều chuyển công tác sang đơn vị khác:
                  </p>
                  <select
                    value={editGroup}
                    onChange={(e) => setEditGroup(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-blue-400 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-blue-600 shadow-2xs cursor-pointer"
                  >
                    {HOSPITAL_DEPARTMENTS.map((dept, i) => (
                      <option key={i} value={dept}>
                        {i + 1}. {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 shadow-2xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Tên Nhân Viên <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="VD: Trương Trọng Phương, Vũ Thị Thùy Dương..."
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Số Điện Thoại / Liên Hệ:
                    </label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Số ĐT nhân viên..."
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono focus:outline-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu Cập Nhật & Thay Đổi Khoa Phòng</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal (In-App Modal - NO window.confirm!) */}
        {customerToDelete && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="bg-rose-600 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded">
                    <Trash2 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-xs uppercase tracking-wider">
                    Xác Nhận Xóa Nhân Viên Khỏi Danh Mục
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomerToDelete(null)}
                  className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                  <div className="font-bold text-slate-900 text-sm">
                    {customerToDelete.name}
                  </div>
                  <div className="text-blue-800 font-medium">
                    Khoa phòng: <strong>{customerToDelete.group}</strong>
                  </div>
                  {customerToDelete.phone && (
                    <div className="text-slate-600 font-mono">
                      Số điện thoại: {customerToDelete.phone}
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    Bạn có chắc chắn muốn xóa nhân viên này khỏi danh bạ cấp phát vật tư? Các phiếu xuất kho đã lập trước đó vẫn được giữ nguyên để phục vụ báo cáo.
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCustomerToDelete(null)}
                  className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xác Nhận Xóa</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Confirmation Modal */}
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-white" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">
                    Đồng Bộ Chuẩn 208 Cán Bộ VPMED
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-900 leading-relaxed">
                  Hệ thống sẽ <strong>xóa toàn bộ các dữ liệu cũ</strong> và nạp lại chính xác đầy đủ <strong>208 cán bộ</strong> thuộc <strong>21 khoa phòng</strong> bệnh viện VPMED như danh sách phân khoa.
                </div>
              </div>

              <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleResetToStandard208}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Xác Nhận Nạp Lại 208 Cán Bộ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            CÔNG TY BỆNH VIỆN CỔ PHẦN VPMED · Hệ thống Quản Lý Cấp Phát Vật Tư Kho IT
          </div>
          <button
            onClick={() => setIsCustomerModalOpen(false)}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-xs font-medium cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
