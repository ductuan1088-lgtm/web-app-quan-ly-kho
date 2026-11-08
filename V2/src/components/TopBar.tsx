import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Boxes,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  Menu,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';

export const TopBar: React.FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const {
    products,
    receiptOrders,
    issueOrders,
    activeTab,
    setActiveTab,
    setSubTabXuattKho,
    setIsCreateProductModalOpen,
    setIsCreateReceiptModalOpen,
    setIsBackupModalOpen,
    setIsCustomerModalOpen,
    setIsSupplierModalOpen,
    setIsKhoITSyncModalOpen,
    isUserManagementModalOpen,
    setIsUserManagementModalOpen,
    isSwitchUserModalOpen,
    setIsSwitchUserModalOpen,
    isChangePasswordModalOpen,
    setIsChangePasswordModalOpen,
    setIsCompanySettingsModalOpen,
    setIsVoucherSignatoriesModalOpen,
    currentUser,
    logout,
    hasPermission,
    resetToDefaultData,
    companyInfo,
    getOverallStats,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useWarehouse();

  const stats = getOverallStats();
  const lowStockAlertProducts = products.filter((p) => p.stockQuantity <= p.minStockAlert);
  const outOfStockCount = lowStockAlertProducts.filter((p) => p.stockQuantity === 0).length;

  return (
    <header className="bg-[#2c4779] border-b border-[#1f345b] select-none shadow-sm no-print">
      {/* Top Application Bar */}
      <div className="text-white px-3 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 rounded hover:bg-white/15 cursor-pointer"
            title={isSidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            <Menu className="w-4 h-4" />
          </button>
          {/* Software Brand Mark */}
          <div className="w-5 h-5 rounded bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Boxes className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold tracking-wide text-white">
            QUẢN LÝ XUẤT NHẬP TỒN KHO · MỰC IN & LINH KIỆN MÁY TÍNH
          </span>
          <span className="text-blue-200/60 hidden md:inline">|</span>
          <span className="text-blue-200/80 hidden md:inline truncate max-w-sm">
            {companyInfo.name}
          </span>
        </div>

        {/* User Info & Quick Stock Stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden lg:flex items-center gap-3 text-blue-100">
            <span>
              Tổng SP: <strong className="text-white font-bold">{stats.totalProducts}</strong>
            </span>
            <span>·</span>
            <span>
              Tồn kho: <strong className="text-emerald-300 font-bold">{stats.totalStockCount.toLocaleString('vi-VN')}</strong>
            </span>
            {stats.lowStockCount > 0 && (
              <>
                <span>·</span>
                <span className="text-amber-300 font-bold">
                  Sắp hết: {stats.lowStockCount}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 relative">
            {/* Notification Bell with Warning Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsUserMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer shadow-xs border ${
                  lowStockAlertProducts.length > 0
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 ring-2 ring-rose-400/30'
                    : 'bg-[#1e3256] hover:bg-[#253f6d] text-blue-200 border-blue-400/40'
                }`}
                title={
                  lowStockAlertProducts.length > 0
                    ? `Có ${lowStockAlertProducts.length} mặt hàng chạm hoặc dưới hạn mức tồn tối thiểu cần đặt hàng!`
                    : 'Không có cảnh báo tồn kho'
                }
              >
                <div className="relative">
                  <Bell className={`w-3.5 h-3.5 ${lowStockAlertProducts.length > 0 ? 'text-amber-200 animate-bounce' : 'text-blue-300'}`} />
                  {lowStockAlertProducts.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                  )}
                </div>
                <span className="font-sans">
                  {lowStockAlertProducts.length > 0 ? (
                    <span className="flex items-center gap-1">
                      <span>Cảnh Báo</span>
                      <span className="bg-white text-rose-700 rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                        {lowStockAlertProducts.length}
                      </span>
                    </span>
                  ) : (
                    <span>Thông Báo</span>
                  )}
                </span>
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-96 bg-white rounded-lg shadow-2xl border border-slate-300 text-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-rose-700 to-rose-900 text-white p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-amber-300" />
                        </div>
                        <div>
                          <div className="font-bold text-xs uppercase tracking-wide">
                            Cảnh Báo Tồn Kho Tối Thiểu
                          </div>
                          <div className="text-[11px] text-rose-100">
                            {lowStockAlertProducts.length} mặt hàng cần đặt hàng bổ sung
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-white/20 text-white font-mono px-2 py-0.5 rounded-full font-bold">
                        {outOfStockCount > 0 ? `🔴 ${outOfStockCount} hết hàng` : 'Đang thiếu hàng'}
                      </span>
                    </div>

                    {/* Quick Action Bar inside Notification */}
                    <div className="bg-rose-50 px-3 py-2 border-b border-rose-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-rose-800 font-medium">
                        Kho IT VPMED · Định mức tối thiểu
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setIsNotificationOpen(false);
                            setIsCreateReceiptModalOpen(true);
                          }}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        >
                          <PackagePlus className="w-3 h-3" />
                          <span>+ Đặt Hàng Ngay</span>
                        </button>
                      </div>
                    </div>

                    {/* Low stock list */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                      {lowStockAlertProducts.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">
                          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                          <div className="font-medium text-slate-700">Tồn kho an toàn!</div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Tất cả mặt hàng đều đạt hoặc vượt định mức tối thiểu.
                          </div>
                        </div>
                      ) : (
                        lowStockAlertProducts.map((p) => {
                          const isZero = p.stockQuantity === 0;
                          const ratio = p.minStockAlert > 0 ? Math.round((p.stockQuantity / p.minStockAlert) * 100) : 100;
                          return (
                            <div
                              key={p.id}
                              className={`p-2.5 hover:bg-slate-50 transition flex items-center justify-between gap-2 ${
                                isZero ? 'bg-rose-50/40' : ''
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-blue-900 text-[11px]">
                                    {p.sku}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                      isZero
                                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                        : ratio <= 50
                                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                                    }`}
                                  >
                                    {isZero ? 'HẾT HÀNG' : `CÒN ${ratio}% ĐỊNH MỨC`}
                                  </span>
                                </div>
                                <div className="font-medium text-slate-900 truncate mt-0.5 text-xs" title={p.name}>
                                  {p.name}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span>
                                    Hiện tồn: <strong className={isZero ? 'text-rose-600 font-bold' : 'text-slate-800 font-bold'}>{p.stockQuantity} {p.unit}</strong>
                                  </span>
                                  <span>·</span>
                                  <span>Định mức: <strong>{p.minStockAlert}</strong></span>
                                  <span>·</span>
                                  <span className="text-slate-400">{p.warehouseLocation || 'Kho IT'}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setIsNotificationOpen(false);
                                  setIsCreateReceiptModalOpen(true);
                                }}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded text-[11px] border border-blue-200 shrink-0 cursor-pointer transition flex items-center gap-1"
                                title="Lập phiếu nhập hàng mới cho mặt hàng này"
                              >
                                <span>Đặt Hàng</span>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer with Links */}
                    <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          setIsNotificationOpen(false);
                          setActiveTab('DASHBOARD');
                        }}
                        className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Xem Bảng Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsNotificationOpen(false);
                          setActiveTab('QUAN_LY_TON_KHO');
                        }}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Boxes className="w-3.5 h-3.5" />
                        <span>Xem Bảng Tồn Kho</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile Pill & Dropdown Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 bg-[#1e3256] hover:bg-[#253f6d] px-2.5 py-1 rounded text-blue-200 border border-blue-400/40 cursor-pointer transition-colors shadow-2xs group"
                title="Nhấp để xem tài khoản, đổi mật khẩu hoặc đăng xuất"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-gradient-to-tr ${
                    currentUser.avatarColor || 'from-blue-600 to-indigo-700'
                  } text-white flex items-center justify-center font-bold text-[9px] shadow-xs`}
                >
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-white max-w-[130px] truncate">{currentUser.name}</span>
                <span className="text-[10px] bg-blue-500/30 text-cyan-200 px-1.5 py-0.2 rounded border border-blue-400/30 font-sans font-medium">
                  {currentUser.roleTitle}
                </span>
                <ChevronDown className={`w-3 h-3 text-blue-300 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Profile Dropdown Popover */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-lg shadow-2xl border border-slate-300 text-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* User Header */}
                    <div className="bg-[#1e293b] text-white p-3 border-b border-slate-700">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-tr ${
                            currentUser.avatarColor || 'from-blue-600 to-indigo-700'
                          } text-white flex items-center justify-center font-bold text-xs uppercase shadow-md border border-white/20`}
                        >
                          {currentUser.username.substring(0, 2)}
                        </div>
                        <div className="overflow-hidden flex-1">
                          <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                            <span>{currentUser.name}</span>
                            <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-400/30 font-normal">
                              {currentUser.roleTitle}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 truncate font-mono">
                            {currentUser.email}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
                        <span>{currentUser.department}</span>
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Đang hoạt động
                        </span>
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="p-2 space-y-1 text-xs">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsChangePasswordModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer transition text-left"
                      >
                        <KeyRound className="w-4 h-4 text-amber-500" />
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">Đổi Mật Khẩu</div>
                          <div className="text-[10px] text-slate-500">Cập nhật mật khẩu cá nhân</div>
                        </div>
                      </button>

                      {hasPermission('canManageUsers') && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsUserManagementModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 text-slate-700 hover:bg-blue-50 rounded-md cursor-pointer transition text-left"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <div className="flex-1">
                            <div className="font-semibold text-blue-900">Quản Lý Người Dùng & Phân Quyền</div>
                            <div className="text-[10px] text-slate-500">Thiết lập tài khoản & 14 quyền hạn RBAC</div>
                          </div>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsSwitchUserModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer transition text-left"
                      >
                        <Users className="w-4 h-4 text-indigo-500" />
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">Chuyển Sang Tài Khoản Khác</div>
                          <div className="text-[10px] text-slate-500">Đăng nhập tài khoản nhân sự khác</div>
                        </div>
                      </button>
                    </div>

                    {/* Big Red Logout Button Inside Dropdown */}
                    <div className="p-2 border-t border-slate-200 bg-slate-50">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-md flex items-center justify-center gap-2 cursor-pointer shadow-xs text-xs transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>ĐĂNG XUẤT (OUT TÀI KHOẢN)</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
