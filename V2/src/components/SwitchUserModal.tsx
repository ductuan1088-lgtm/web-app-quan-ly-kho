import React from 'react';
import {
  Check,
  Lock,
  LogIn,
  LogOut,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { AppUser } from '../types';

export const SwitchUserModal: React.FC = () => {
  const {
    isSwitchUserModalOpen,
    setIsSwitchUserModalOpen,
    users,
    currentUser,
    switchUser,
    logout,
    setIsUserManagementModalOpen,
  } = useWarehouse();

  if (!isSwitchUserModalOpen) return null;

  const handleSelectUser = (user: AppUser) => {
    if (!user.isActive) {
      alert(`Tài khoản ${user.username} hiện đang bị khóa. Vui lòng liên hệ Admin IT!`);
      return;
    }
    switchUser(user.id);
    setIsSwitchUserModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600/30 text-cyan-400 rounded border border-blue-400/30">
              <LogIn className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
                Chuyển Đổi Tài Khoản / Đăng Nhập
              </h3>
              <p className="text-[11px] text-slate-300">
                Chọn người dùng để kiểm tra phân quyền & giao diện theo từng vai trò
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSwitchUserModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-700/60 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Account */}
        <div className="bg-blue-50/70 border-b border-blue-200 px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-tr ${
                currentUser.avatarColor || 'from-blue-600 to-indigo-700'
              } text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs`}
            >
              {currentUser.username.substring(0, 2)}
            </div>
            <div>
              <div className="font-semibold text-blue-900 flex items-center gap-2">
                <span>{currentUser.name}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300 font-semibold">
                  Đang Sử Dụng
                </span>
              </div>
              <div className="text-[11px] text-blue-700 font-mono">
                {currentUser.email} · {currentUser.roleTitle}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setIsSwitchUserModalOpen(false);
              setIsUserManagementModalOpen(true);
            }}
            className="px-2.5 py-1 text-[11px] bg-white hover:bg-blue-100 text-blue-700 rounded border border-blue-300 font-medium cursor-pointer transition-colors"
          >
            Phân Quyền User
          </button>
        </div>

        {/* Users List */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Danh sách tài khoản hệ thống ({users.length}):
          </div>

          <div className="space-y-2">
            {users.map((u) => {
              const isCurrent = u.id === currentUser.id;
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
                <div
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    isCurrent
                      ? 'border-blue-400 bg-blue-50/40 ring-1 ring-blue-300'
                      : u.isActive
                      ? 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      : 'border-slate-200 bg-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full bg-gradient-to-tr ${
                        u.avatarColor || 'from-blue-600 to-indigo-700'
                      } text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs`}
                    >
                      {u.username.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs flex items-center gap-2">
                        <span>{u.name}</span>
                        <span className="text-[11px] font-mono text-slate-500">(@{u.username})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{u.department}</span>
                        <span>·</span>
                        <span className="font-mono">{u.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${roleBadge}`}>
                      {u.roleTitle}
                    </span>

                    {isCurrent ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : !u.isActive ? (
                      <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Khóa</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-2xs cursor-pointer"
                      >
                        Đăng Nhập
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              setIsSwitchUserModalOpen(false);
              logout();
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium cursor-pointer shadow-xs transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất (Out Tài Khoản)</span>
          </button>
          <button
            onClick={() => setIsSwitchUserModalOpen(false)}
            className="px-3.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-white text-xs font-medium cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
