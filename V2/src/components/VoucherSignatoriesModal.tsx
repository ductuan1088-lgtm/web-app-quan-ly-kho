import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  FileSignature,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { HOSPITAL_DEPARTMENTS } from './CustomersModal';
import { Customer } from '../types';

export const VoucherSignatoriesModal: React.FC = () => {
  const {
    isVoucherSignatoriesModalOpen,
    setIsVoucherSignatoriesModalOpen,
    issueOrderCreators,
    defaultIssueCreator,
    addIssueOrderCreator,
    removeIssueOrderCreator,
    setDefaultIssueCreator,
    customers,
    addCustomer,
    deleteCustomer,
    resetCustomersToDefault,
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'CREATORS' | 'RECEIVERS'>('CREATORS');

  // Tab 1: New creator input
  const [newCreatorName, setNewCreatorName] = useState('');
  const [creatorSuccessMsg, setCreatorSuccessMsg] = useState<string | null>(null);

  // Tab 2: Receiver search & filters
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchReceiver, setSearchReceiver] = useState<string>('');
  const [isAddingReceiver, setIsAddingReceiver] = useState(false);
  const [newReceiverName, setNewReceiverName] = useState('');
  const [newReceiverDept, setNewReceiverDept] = useState(HOSPITAL_DEPARTMENTS[0]);
  const [newReceiverPhone, setNewReceiverPhone] = useState('');
  const [receiverSuccessMsg, setReceiverSuccessMsg] = useState<string | null>(null);

  if (!isVoucherSignatoriesModalOpen) return null;

  // Handle add creator
  const handleAddCreator = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCreatorName.trim();
    if (!trimmed) return;

    if (issueOrderCreators.includes(trimmed)) {
      alert('Tên người lập phiếu này đã tồn tại trong danh sách!');
      return;
    }

    addIssueOrderCreator(trimmed);
    setNewCreatorName('');
    setCreatorSuccessMsg(`Đã thêm "${trimmed}" vào danh sách người lập phiếu xuất kho!`);
    setTimeout(() => setCreatorSuccessMsg(null), 3000);
  };

  // Handle add receiver
  const handleAddReceiver = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = newReceiverName.trim();
    if (!nameTrim) {
      alert('Vui lòng nhập họ và tên người nhận hàng!');
      return;
    }

    addCustomer({
      name: nameTrim,
      group: newReceiverDept,
      address: newReceiverDept,
      phone: newReceiverPhone.trim(),
      debtAmount: 0,
    });

    setNewReceiverName('');
    setNewReceiverPhone('');
    setIsAddingReceiver(false);
    setReceiverSuccessMsg(`Đã thêm cán bộ "${nameTrim}" (${newReceiverDept}) vào danh sách người nhận hàng!`);
    setTimeout(() => setReceiverSuccessMsg(null), 3000);
  };

  // Filtered receivers list
  const filteredReceivers = customers.filter((c) => {
    if (selectedDept !== 'ALL' && c.group !== selectedDept && c.address !== selectedDept) {
      return false;
    }
    if (searchReceiver.trim()) {
      const q = searchReceiver.toLowerCase().trim();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = (c.phone || '').includes(q);
      const matchDept = (c.group || c.address || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchDept) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <FileSignature className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                Cài Đặt Người Lập & Người Nhận Hàng (Phiếu Xuất Kho)
              </h3>
              <p className="text-[11px] text-slate-400">
                Quản lý danh sách nhân sự lập phiếu và cán bộ nhận hàng của 21 khoa phòng bệnh viện
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVoucherSignatoriesModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded cursor-pointer transition"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-5 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('CREATORS')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold cursor-pointer transition ${
              activeTab === 'CREATORS'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>1. Người Lập Phiếu Xuất Kho ({issueOrderCreators.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('RECEIVERS')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold cursor-pointer transition ${
              activeTab === 'RECEIVERS'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>2. Cán Bộ Nhận Hàng 21 Khoa Phòng ({customers.length})</span>
          </button>
        </div>

        {/* Tab 1 Content: Người Lập Phiếu */}
        {activeTab === 'CREATORS' && (
          <div className="p-5 space-y-4 text-xs">
            {creatorSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg p-2.5 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{creatorSuccessMsg}</span>
              </div>
            )}

            {/* Quick note */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-slate-700 leading-relaxed">
              💡 <strong>Quy định lập phiếu:</strong> Khi nhân viên bấm <strong>"Lập Phiếu Xuất Kho"</strong>, mục <em>Người Lập Phiếu</em> sẽ tự động điền người được đánh dấu <span className="font-bold text-amber-700">★ Mặc định</span>. Bạn có thể thêm người lập mới, xóa hoặc thay đổi người mặc định tại đây.
            </div>

            {/* Form Add Creator */}
            <form onSubmit={handleAddCreator} className="flex gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex-1">
                <input
                  type="text"
                  required
                  value={newCreatorName}
                  onChange={(e) => setNewCreatorName(e.target.value)}
                  placeholder="Nhập họ và tên người lập phiếu mới (VD: Nguyễn Tuấn, Lê Hoàng Long...)"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-blue-500 shadow-2xs"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Người Lập</span>
              </button>
            </form>

            {/* Creators List */}
            <div>
              <div className="font-bold text-slate-700 uppercase tracking-wide mb-2 text-[11px]">
                Danh Sách Nhân Sự Lập Phiếu Xuất Kho Hiện Tại:
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                {issueOrderCreators.map((name, idx) => {
                  const isDefault = name === defaultIssueCreator;
                  return (
                    <div
                      key={name}
                      className={`p-3 flex items-center justify-between transition ${
                        isDefault ? 'bg-amber-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-mono flex items-center justify-center text-[11px] font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                            <span>{name}</span>
                            {isDefault && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 shadow-2xs">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>Mặc định khi lập phiếu</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Nhân sự kho IT / Cán bộ lập chứng từ
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isDefault ? (
                          <button
                            type="button"
                            onClick={() => {
                              setDefaultIssueCreator(name);
                              setCreatorSuccessMsg(`Đã đặt "${name}" làm Người Lập Phiếu mặc định!`);
                              setTimeout(() => setCreatorSuccessMsg(null), 3000);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-300 hover:border-amber-300 rounded font-semibold text-[11px] cursor-pointer transition flex items-center gap-1 shadow-2xs"
                          >
                            <Star className="w-3 h-3 text-amber-500" />
                            <span>Đặt làm mặc định</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đang mặc định</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (issueOrderCreators.length <= 1) {
                              setCreatorSuccessMsg('Cần giữ ít nhất 1 người lập phiếu trong danh sách!');
                              setTimeout(() => setCreatorSuccessMsg(null), 3000);
                              return;
                            }
                            removeIssueOrderCreator(name);
                            setCreatorSuccessMsg(`Đã xóa thành công "${name}" khỏi danh sách người lập phiếu!`);
                            setTimeout(() => setCreatorSuccessMsg(null), 3000);
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg cursor-pointer transition border border-rose-200 shadow-2xs"
                          title={`Xóa "${name}" khỏi danh sách`}
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Cán Bộ Nhận Hàng (21 Khoa Phòng) */}
        {activeTab === 'RECEIVERS' && (
          <div className="p-5 space-y-4 text-xs">
            {receiverSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg p-2.5 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{receiverSuccessMsg}</span>
              </div>
            )}

            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchReceiver}
                    onChange={(e) => setSearchReceiver(e.target.value)}
                    placeholder="Tìm tên cán bộ, SĐT hoặc khoa phòng..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-blue-500"
                  />
                </div>

                {/* Dept Filter */}
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:outline-blue-500 max-w-[200px]"
                >
                  <option value="ALL">-- Tất cả 21 Khoa/Phòng --</option>
                  {HOSPITAL_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingReceiver(!isAddingReceiver)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Thêm Cán Bộ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetCustomersToDefault();
                    setReceiverSuccessMsg('Đã khôi phục thành công danh bạ 208 cán bộ VPMED!');
                    setTimeout(() => setReceiverSuccessMsg(null), 3000);
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 cursor-pointer transition flex items-center gap-1.5 text-xs font-semibold"
                  title="Khôi phục danh bạ cán bộ chuẩn 208 người"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Khôi phục 208 cán bộ</span>
                </button>
              </div>
            </div>

            {/* Add Receiver Form Accordion */}
            {isAddingReceiver && (
              <form
                onSubmit={handleAddReceiver}
                className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5 space-y-3 animate-in fade-in duration-150"
              >
                <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-700" />
                  <span>Thêm Cán Bộ Nhận Hàng Mới Cho Khoa Phòng:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Họ và tên cán bộ: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newReceiverName}
                      onChange={(e) => setNewReceiverName(e.target.value)}
                      placeholder="VD: Nguyễn Văn An"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Khoa / Phòng trực thuộc: <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newReceiverDept}
                      onChange={(e) => setNewReceiverDept(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold focus:outline-emerald-500"
                    >
                      {HOSPITAL_DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Số điện thoại liên hệ:
                    </label>
                    <input
                      type="text"
                      value={newReceiverPhone}
                      onChange={(e) => setNewReceiverPhone(e.target.value)}
                      placeholder="VD: 0912345678"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-mono focus:outline-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingReceiver(false)}
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded text-xs border border-slate-300 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Lưu Cán Bộ
                  </button>
                </div>
              </form>
            )}

            {/* Receivers Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 text-slate-700 text-[11px] uppercase tracking-wide">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center font-bold">STT</th>
                      <th className="py-2 px-3 font-bold">Tên Cán Bộ Nhận</th>
                      <th className="py-2 px-3 font-bold">Khoa / Phòng</th>
                      <th className="py-2 px-3 font-bold">Số Điện Thoại</th>
                      <th className="py-2 px-3 text-center w-16 font-bold">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReceivers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Không tìm thấy cán bộ nào phù hợp với bộ lọc!
                        </td>
                      </tr>
                    ) : (
                      filteredReceivers.map((r, idx) => (
                        <tr key={r.id || idx} className="hover:bg-blue-50/40 transition">
                          <td className="py-2 px-3 text-center font-mono text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {r.name}
                          </td>
                          <td className="py-2 px-3 text-slate-700 font-medium">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                              {r.group || r.address}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700">
                            {r.phone || <span className="text-slate-400 italic">Chưa có</span>}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                deleteCustomer(r.id);
                                setReceiverSuccessMsg(`Đã xóa cán bộ "${r.name}" (${r.group || r.address})!`);
                                setTimeout(() => setReceiverSuccessMsg(null), 3000);
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition cursor-pointer"
                              title={`Xóa cán bộ "${r.name}"`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>
                  Hiển thị <strong>{filteredReceivers.length}</strong> / tổng số {customers.length} cán bộ
                </span>
                <span className="italic">
                  * Dữ liệu đồng bộ trực tiếp với danh bạ 21 khoa phòng khi Lập Phiếu Xuất Kho
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            Hệ thống Quản lý Xuất Nhập Tồn Kho IT & Mực in · Cấp phát 21 Khoa Phòng
          </span>
          <button
            type="button"
            onClick={() => setIsVoucherSignatoriesModalOpen(false)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer transition"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
