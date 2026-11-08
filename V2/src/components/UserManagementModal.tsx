import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  KeyRound,
  Lock,
  LogIn,
  Pencil,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Unlock,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { AppUser, UserPermissions, UserRole } from '../types';
import { HOSPITAL_DEPARTMENTS } from './CustomersModal';
import { ROLE_PRESET_PERMISSIONS } from '../data/initialData';

interface PermissionItemDef {
  key: keyof UserPermissions;
  label: string;
  description: string;
  category: 'KHO_HANG' | 'DANH_MUC' | 'BAO_CAO' | 'HE_THONG';
}

const PERMISSION_DEFINITIONS: PermissionItemDef[] = [
  {
    key: 'canIssueStock',
    label: 'Lập Phiếu Xuất Kho',
    description: 'Tạo phiếu cấp phát vật tư máy in, linh kiện cho các khoa phòng',
    category: 'KHO_HANG',
  },
  {
    key: 'canEditIssueOrder',
    label: 'Sửa Phiếu Xuất Kho Đã Lập',
    description: 'Chỉnh sửa chi tiết số lượng và vật tư trong chứng từ xuất',
    category: 'KHO_HANG',
  },
  {
    key: 'canReceiptStock',
    label: 'Lập Phiếu Nhập Kho',
    description: 'Tạo phiếu nhập vật tư mới từ nhà cung cấp về kho IT',
    category: 'KHO_HANG',
  },
  {
    key: 'canAdjustStock',
    label: 'Điều Chỉnh Tồn & Làm Mới Kho IT',
    description: 'Chỉnh sửa trực tiếp số lượng tồn thực tế và kiểm kê 19 mặt hàng',
    category: 'KHO_HANG',
  },
  {
    key: 'canDeleteVouchers',
    label: 'Xóa Chứng Từ Xuất / Nhập',
    description: 'Hủy hoặc xóa vĩnh viễn các phiếu xuất kho, phiếu nhập kho đã lập',
    category: 'KHO_HANG',
  },
  {
    key: 'canManageProducts',
    label: 'Quản Lý Danh Mục Hàng Hóa',
    description: 'Thêm mới, sửa thông tin, giá vốn, định mức tồn sản phẩm',
    category: 'DANH_MUC',
  },
  {
    key: 'canManageCustomers',
    label: 'Quản Lý Cán Bộ & 21 Khoa Phòng',
    description: 'Thêm sửa xóa cán bộ, điều chuyển khoa phòng nhận vật tư',
    category: 'DANH_MUC',
  },
  {
    key: 'canManageSuppliers',
    label: 'Quản Lý Nhà Cung Cấp',
    description: 'Thêm, sửa thông tin và liên hệ tổng kho cung ứng vật tư',
    category: 'DANH_MUC',
  },
  {
    key: 'canViewReports',
    label: 'Xem Báo Cáo Xuất Nhập Tồn & Thẻ Kho',
    description: 'Truy cập tab báo cáo tổng hợp, lọc đơn vị, xem thẻ kho thời gian thực',
    category: 'BAO_CAO',
  },
  {
    key: 'canViewHistory',
    label: 'Xem Lịch Sử Xuất Nhập Hàng',
    description: 'Truy cập tab lịch sử biến động từng mặt hàng và sổ nhật ký chứng từ',
    category: 'BAO_CAO',
  },
  {
    key: 'canViewSystemLogs',
    label: 'Xem Nhật Ký Kiểm Toán Hệ Thống',
    description: 'Theo dõi chi tiết các thao tác đăng nhập, sửa đổi, thêm xóa trong hệ thống',
    category: 'HE_THONG',
  },
  {
    key: 'canExportExcel',
    label: 'Xuất Báo Cáo Ra Excel (.xlsx)',
    description: 'Tải các bảng tổng hợp xuất nhập tồn, thẻ kho, lịch sử ra file Excel',
    category: 'HE_THONG',
  },
  {
    key: 'canManageUsers',
    label: 'Quản Lý User & Phân Quyền (RBAC)',
    description: 'Tạo tài khoản người dùng mới, đổi mật khẩu và phân chia quyền hạn',
    category: 'HE_THONG',
  },
  {
    key: 'canBackupRestore',
    label: 'Sao Lưu & Phục Hồi Dữ Liệu',
    description: 'Xuất sao lưu JSON và nạp lại dữ liệu toàn hệ thống',
    category: 'HE_THONG',
  },
];

export const UserManagementModal: React.FC = () => {
  const {
    isUserManagementModalOpen,
    setIsUserManagementModalOpen,
    users,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    switchUser,
  } = useWarehouse();

  // Mode: list or edit/create form
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Phòng Công Nghệ Thông Tin');
  const [role, setRole] = useState<UserRole>('STOREKEEPER');
  const [notes, setNotes] = useState('');
  const [permissions, setPermissions] = useState<UserPermissions>(
    ROLE_PRESET_PERMISSIONS.STOREKEEPER.permissions
  );

  // Search & visibility
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showPasswordInTable, setShowPasswordInTable] = useState(false);

  if (!isUserManagementModalOpen) return null;

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setName('');
    setUsername('');
    setPassword('123');
    setEmail('');
    setPhone('');
    setDepartment('Phòng Công Nghệ Thông Tin');
    setRole('STOREKEEPER');
    setNotes('');
    setPermissions({ ...ROLE_PRESET_PERMISSIONS.STOREKEEPER.permissions });
    setIsEditing(true);
  };

  const handleOpenEdit = (user: AppUser) => {
    setSelectedUser(user);
    setName(user.name);
    setUsername(user.username);
    setPassword(user.password || '123');
    setEmail(user.email);
    setPhone(user.phone || '');
    setDepartment(user.department || 'Phòng Công Nghệ Thông Tin');
    setRole(user.role);
    setNotes(user.notes || '');
    const preset =
      ROLE_PRESET_PERMISSIONS[user.role]?.permissions ||
      ROLE_PRESET_PERMISSIONS.STAFF_VIEWER.permissions;
    setPermissions({ ...preset, ...(user.permissions || {}) });
    setIsEditing(true);
  };

  const handlePresetRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setPermissions({ ...ROLE_PRESET_PERMISSIONS[newRole].permissions });
  };

  const handleTogglePermission = (key: keyof UserPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAllPermissions = (enable: boolean) => {
    const updated: UserPermissions = {
      canIssueStock: enable,
      canEditIssueOrder: enable,
      canReceiptStock: enable,
      canAdjustStock: enable,
      canDeleteVouchers: enable,
      canManageProducts: enable,
      canManageCustomers: enable,
      canManageSuppliers: enable,
      canViewReports: enable,
      canViewHistory: enable,
      canViewSystemLogs: enable,
      canExportExcel: enable,
      canManageUsers: enable,
      canBackupRestore: enable,
    };
    setPermissions(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      showNotification('Vui lòng nhập họ tên và tên đăng nhập!');
      return;
    }

    const roleTitle = role === 'ADMIN' ? 'Nhân viên IT' : ROLE_PRESET_PERMISSIONS[role].title;
    const finalPassword = password.trim() || '123';

    if (selectedUser) {
      // Edit
      updateUser(selectedUser.id, {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password: finalPassword,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department,
        role,
        roleTitle,
        permissions,
        notes: notes.trim(),
      });
      showNotification(`Đã cập nhật tài khoản và phân quyền cho "${name.trim()}" thành công!`);
    } else {
      // Create new
      const exists = users.some(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() ||
          (email.trim() && u.email.toLowerCase() === email.trim().toLowerCase())
      );
      if (exists) {
        showNotification('Tên đăng nhập hoặc email này đã tồn tại trong hệ thống. Vui lòng chọn tên khác!');
        return;
      }

      addUser({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password: finalPassword,
        email: email.trim().toLowerCase() || `${username.trim().toLowerCase()}@vpmed.vn`,
        phone: phone.trim(),
        department,
        role,
        roleTitle,
        permissions,
        isActive: true,
        notes: notes.trim(),
        avatarColor: 'from-blue-600 to-indigo-700',
        lastLogin: 'Chưa đăng nhập',
      });
      showNotification(`Đã tạo mới tài khoản "${name.trim()}" (Mật khẩu: ${finalPassword})!`);
    }

    setIsEditing(false);
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.department.toLowerCase().includes(term) ||
      u.roleTitle.toLowerCase().includes(term)
    );
  });

  const countActivePermissions = (target: AppUser | UserPermissions) => {
    if ('role' in target && target.role === 'ADMIN') return 14;
    const perms = 'permissions' in target ? target.permissions || {} : target;
    return Object.values(perms).filter(Boolean).length;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600/30 text-cyan-400 rounded border border-blue-400/30">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-semibold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <span>Quản Lý Người Dùng & Phân Quyền Truy Cập (RBAC)</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30 font-normal">
                  VPMED Security
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                CÔNG TY BỆNH VIỆN CỔ PHẦN VPMED · Thiết lập tài khoản, mật khẩu & 14 quyền hạn
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsUserManagementModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-700/60 rounded cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast notification */}
        {toastMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{toastMsg}</span>
            </div>
            <button
              onClick={() => setToastMsg(null)}
              className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 space-y-3 text-xs flex-1 flex flex-col overflow-hidden bg-slate-50">
          {!isEditing ? (
            <>
              {/* Action & Filter Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 shrink-0 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-700">
                    Tổng cộng: <strong className="text-blue-900">{users.length}</strong> tài khoản
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600">
                    Đang đăng nhập: <strong className="text-emerald-700">{currentUser.name}</strong> ({currentUser.roleTitle})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordInTable(!showPasswordInTable)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                    title="Hiện/Ẩn mật khẩu trong danh sách"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>{showPasswordInTable ? 'Ẩn Mật Khẩu' : 'Hiện Mật Khẩu'}</span>
                  </button>

                  <div className="relative w-44 sm:w-52">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm user, email, khoa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded pl-7 pr-2 py-1 text-xs focus:outline-blue-500 shadow-2xs"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs cursor-pointer transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Tạo User Mới</span>
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="border border-slate-300 rounded-lg overflow-x-auto overflow-y-auto flex-1 bg-white shadow-2xs">
                <table className="w-full min-w-[850px] text-xs text-left border-collapse">
                  <thead className="bg-[#eef2f7] text-slate-700 sticky top-0 border-b border-slate-300 font-semibold z-10 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">STT</th>
                      <th className="py-2.5 px-3">Tài Khoản / Cán Bộ</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Mật Khẩu</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Khoa / Phòng</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Vai Trò & Quyền Hạn</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap w-24">Trạng Thái</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap w-56 min-w-[210px]">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Không tìm thấy người dùng nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, idx) => {
                        const isCurrent = u.id === currentUser.id;
                        const activePerms = countActivePermissions(u);

                        let roleBadge = 'bg-slate-100 text-slate-700 border-slate-300';
                        if (u.role === 'ADMIN') {
                          roleBadge = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                        } else if (u.role === 'STOREKEEPER') {
                          roleBadge = 'bg-blue-50 text-blue-700 border-blue-200 font-bold';
                        } else if (u.role === 'ACCOUNTANT') {
                          roleBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
                        } else if (u.role === 'STAFF_VIEWER') {
                          roleBadge = 'bg-purple-50 text-purple-700 border-purple-200';
                        }

                        return (
                          <tr
                            key={u.id}
                            className={`transition-colors ${
                              isCurrent ? 'bg-blue-50/70 font-medium' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-7 h-7 rounded-full bg-gradient-to-tr ${
                                    u.avatarColor || 'from-blue-600 to-indigo-700'
                                  } text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs`}
                                >
                                  {u.username.substring(0, 2)}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {isCurrent && (
                                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full border border-emerald-300 font-semibold">
                                        Đang Đăng Nhập
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-500">
                                    @{u.username} · {u.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                <KeyRound className="w-3 h-3 text-amber-600" />
                                {showPasswordInTable ? (
                                  <span className="font-bold text-blue-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    {u.password || '123'}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-bold">••••••</span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                {u.department}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className={`text-[11px] px-2 py-0.5 rounded border ${roleBadge}`}>
                                  {u.roleTitle}
                                </span>
                                <span
                                  className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200"
                                  title={`${activePerms}/14 quyền hạn được kích hoạt`}
                                >
                                  {activePerms}/14 quyền
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => {
                                  if (u.id === currentUser.id) {
                                    showNotification('Không thể tự khóa tài khoản bạn đang sử dụng!');
                                    return;
                                  }
                                  updateUser(u.id, { isActive: !u.isActive });
                                  showNotification(
                                    `Đã ${!u.isActive ? 'kích hoạt' : 'khóa'} tài khoản ${u.username}`
                                  );
                                }}
                                className={`text-[11px] px-2 py-0.5 rounded border font-medium cursor-pointer transition-colors inline-flex items-center gap-1 ${
                                  u.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                }`}
                                title="Nhấp để bật/khóa tài khoản"
                              >
                                {u.isActive ? (
                                  <>
                                    <Unlock className="w-3 h-3 text-emerald-600" />
                                    <span>Hoạt động</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3 h-3 text-rose-600" />
                                    <span>Đã khóa</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                {!isCurrent && (
                                  <button
                                    onClick={() => {
                                      if (switchUser(u.id)) {
                                        showNotification(`Đã chuyển sang tài khoản ${u.name}!`);
                                      }
                                    }}
                                    className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded border border-slate-200 hover:border-emerald-300 cursor-pointer"
                                    title="Chuyển đăng nhập ngay vào tài khoản này"
                                  >
                                    <LogIn className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenEdit(u)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded font-semibold text-[11px] cursor-pointer shadow-2xs transition-colors"
                                  title="Chỉnh sửa thông tin, mật khẩu & 14 quyền hạn RBAC"
                                >
                                  <Pencil className="w-3 h-3 text-amber-700" />
                                  <span>Sửa & Quyền</span>
                                </button>
                                
                                {!isCurrent ? (
                                  <button
                                    onClick={() => setUserToDelete(u)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-300 hover:border-rose-600 rounded font-bold text-[11px] cursor-pointer shadow-2xs transition-colors"
                                    title={`Xóa vĩnh viễn tài khoản cán bộ ${u.name} (@${u.username})`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600 group-hover:text-white" />
                                    <span>Xóa</span>
                                  </button>
                                ) : (
                                  <span
                                    className="text-[10px] text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded border border-slate-200 cursor-not-allowed select-none"
                                    title="Không thể tự xóa tài khoản bạn đang đăng nhập"
                                  >
                                    Đang Đăng Nhập
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* Create / Edit User & Granular RBAC Permissions Form */
            <form onSubmit={handleSave} className="flex-1 flex flex-col space-y-3.5 overflow-hidden">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      {selectedUser
                        ? `Chỉnh Sửa Thông Tin, Mật Khẩu & Phân Quyền: ${selectedUser.name}`
                        : 'Thêm Mới Người Dùng, Cấp Mật Khẩu & Thiết Lập Quyền Hạn'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tùy chỉnh vai trò và kiểm soát 14 quyền hạn chi tiết trong hệ thống Quản Lý Kho VPMED
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedUser && selectedUser.id !== currentUser.id && (
                    <button
                      type="button"
                      onClick={() => setUserToDelete(selectedUser)}
                      className="px-3 py-1.5 rounded border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 font-medium cursor-pointer flex items-center gap-1.5 text-xs transition-colors"
                      title="Xóa tài khoản người dùng này"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Xóa User Này</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
                  >
                    Quay Lại Danh Sách
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu Cấu Hình Tài Khoản</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {/* 1. Thông Tin Cơ Bản & Mật Khẩu */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                  <div className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>1. Thông Tin Cán Bộ & Mật Khẩu Đăng Nhập</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Họ và tên cán bộ <span className="text-rose-500">*</span>:
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="VD: Nguyễn Tuấn, Bs. Phan Thị Huyền..."
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Tên đăng nhập (Username) <span className="text-rose-500">*</span>:
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="VD: ituan, thukho, ketoan..."
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold text-blue-700 focus:outline-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1 flex items-center justify-between">
                        <span>Mật khẩu đăng nhập <span className="text-rose-500">*</span>:</span>
                        <span className="text-[10px] text-blue-600 font-normal">Mặc định: 123</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu..."
                        className="w-full bg-amber-50 border border-amber-300 rounded px-2.5 py-1.5 font-mono font-bold text-amber-900 focus:outline-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Email công vụ (@vpmed.vn):
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="VD: ituan@vpmed.vn..."
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-800 focus:outline-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Số điện thoại liên hệ:</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Số ĐT hoặc số máy lẻ..."
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono focus:outline-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Khoa / Phòng Trực Thuộc (21 Khoa Phòng):
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-medium text-slate-800"
                      >
                        {HOSPITAL_DEPARTMENTS.map((dept, idx) => (
                          <option key={idx} value={dept}>
                            {idx + 1}. {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-slate-700 font-medium mb-1">Ghi chú chức vụ / nhiệm vụ:</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Phụ trách kho mực in, máy tính..."
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Chọn Vai Trò Mẫu (Preset Role) */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                  <div className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span>2. Nhóm Vai Trò Tiêu Chuẩn (Preset Roles)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Chọn vai trò mẫu để nạp nhanh quyền hạn chuẩn, sau đó có thể tùy biến chi tiết bên dưới.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {(
                      [
                        {
                          id: 'ADMIN',
                          title: '👑 Quản Trị Viên / Nhân viên IT',
                          desc: 'Toàn quyền 15/14 tính năng: phân quyền, đổi pass, xóa chứng từ, sao lưu & làm mới kho.',
                          border: 'hover:border-rose-300',
                          active: 'border-rose-500 bg-rose-50/50 text-rose-900',
                        },
                        {
                          id: 'STOREKEEPER',
                          title: '📦 Thủ Kho IT (Storekeeper)',
                          desc: 'Lập & sửa phiếu xuất, nhập, điều chỉnh tồn thực tế, quản lý danh mục và xuất Excel.',
                          border: 'hover:border-blue-300',
                          active: 'border-blue-500 bg-blue-50/50 text-blue-900',
                        },
                        {
                          id: 'ACCOUNTANT',
                          title: '📑 Kế Toán Kho (Accountant)',
                          desc: 'Xem báo cáo xuất nhập tồn, giá vốn, thẻ kho, lịch sử và xuất Excel. Không sửa kho.',
                          border: 'hover:border-emerald-300',
                          active: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
                        },
                        {
                          id: 'STAFF_VIEWER',
                          title: '👁️ Cán Bộ Khoa (Staff Viewer)',
                          desc: 'Chỉ tra cứu danh mục và số lượng tồn hiện có để đề xuất cấp phát. Không có quyền sửa.',
                          border: 'hover:border-purple-300',
                          active: 'border-purple-500 bg-purple-50/50 text-purple-900',
                        },
                      ] as const
                    ).map((r) => {
                      const isSelected = role === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => handlePresetRoleChange(r.id)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected ? r.active : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs">{r.title}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{r.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Bảng Chi Tiết 14 Quyền Hạn (Granular Permission Matrix) */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      <span>3. Bảng Phân Quyền Chi Tiết (Granular Permissions Matrix)</span>
                      <span className="text-[11px] text-blue-600 font-normal">
                        ({countActivePermissions(permissions)}/14 quyền được bật)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAllPermissions(true)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                      >
                        Bật tất cả
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAllPermissions(false)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                      >
                        Tắt tất cả
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {PERMISSION_DEFINITIONS.map((def) => {
                      const isGranted = !!permissions[def.key];
                      return (
                        <div
                          key={def.key}
                          onClick={() => handleTogglePermission(def.key)}
                          className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isGranted
                              ? 'bg-blue-50/50 border-blue-300 shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50 opacity-80'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isGranted}
                            onChange={() => {}}
                            className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{def.label}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-normal uppercase ${
                                  def.category === 'KHO_HANG'
                                    ? 'bg-amber-100 text-amber-800'
                                    : def.category === 'DANH_MUC'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : def.category === 'BAO_CAO'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {def.category === 'KHO_HANG'
                                  ? 'Kho Hàng'
                                  : def.category === 'DANH_MUC'
                                  ? 'Danh Mục'
                                  : def.category === 'BAO_CAO'
                                  ? 'Báo Cáo'
                                  : 'Hệ Thống'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{def.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs shrink-0 flex items-center justify-between">
                <div>
                  {selectedUser && selectedUser.id !== currentUser.id ? (
                    <button
                      type="button"
                      onClick={() => setUserToDelete(selectedUser)}
                      className="px-3.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Xóa Vĩnh Viễn User Này</span>
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-500">
                      Mật khẩu và phân quyền sẽ được cập nhật ngay lập tức cho người dùng.
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu Cấu Hình Tài Khoản</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Hệ thống Quản Lý Cấp Phát Vật Tư Kho IT · CÔNG TY BỆNH VIỆN CỔ PHẦN VPMED
          </div>
          <button
            onClick={() => setIsUserManagementModalOpen(false)}
            className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-white text-xs font-medium cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal (Không dùng window.confirm) */}
      {userToDelete && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-md w-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-rose-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                    Xác Nhận Xóa Tài Khoản Người Dùng
                  </h4>
                  <p className="text-[11px] text-rose-100">
                    CÔNG TY BỆNH VIỆN CỔ PHẦN VPMED
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-tr ${
                    userToDelete.avatarColor || 'from-blue-600 to-indigo-700'
                  } text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm shrink-0`}
                >
                  {userToDelete.username.substring(0, 2)}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                    <span>{userToDelete.name}</span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded border border-rose-300 font-semibold">
                      {userToDelete.roleTitle}
                    </span>
                  </div>
                  <div className="text-slate-600 font-mono text-[11px]">
                    @{userToDelete.username} · {userToDelete.email}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {userToDelete.department}
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản <strong>{userToDelete.name}</strong> (@{userToDelete.username}) khỏi hệ thống? Sau khi xóa, cán bộ này sẽ không thể đăng nhập vào kho IT nữa.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = deleteUser(userToDelete.id);
                  if (selectedUser?.id === userToDelete.id) {
                    setIsEditing(false);
                    setSelectedUser(null);
                  }
                  setUserToDelete(null);
                  showNotification(res.message);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác Nhận Xóa Vĩnh Viễn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
