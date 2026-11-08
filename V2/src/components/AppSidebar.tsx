import React, { useState } from 'react';
import {
  BarChart3,
  Boxes,
  ChevronDown,
  ClipboardCheck,
  Cpu,
  Database,
  Download,
  FileSignature,
  FileSpreadsheet,
  FileText,
  History,
  LayoutDashboard,
  Package,
  PackagePlus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Store,
  Table,
  Truck,
  Upload,
  Users,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { ActiveTab, HistoryViewMode, SubTabXuattKho } from '../types';
import { triggerFullStockReportExcelDownload } from '../utils/stockReportHelper';

type IconType = React.ComponentType<{ className?: string }>;

interface NavLeaf {
  key: string;
  label: string;
  icon: IconType;
  active: boolean;
  badge?: number;
  badgeTone?: 'rose' | 'amber';
  locked?: boolean;
  onClick: () => void;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavLeaf[];
  /** Mục con hiển thị thụt vào dưới mục cha (thay cho thanh tab phụ). */
  children?: Record<string, NavLeaf[]>;
}

export const AppSidebar: React.FC = () => {
  const {
    products,
    receiptOrders,
    issueOrders,
    warranties,
    activeTab,
    setActiveTab,
    subTabXuattKho,
    setSubTabXuattKho,
    setEditingIssueOrder,
    historyViewMode,
    setHistoryViewMode,
    isSidebarCollapsed: collapsed,
    setIsCreateReceiptModalOpen,
    setIsBackupModalOpen,
    setIsCustomerModalOpen,
    setIsSupplierModalOpen,
    setIsKhoITSyncModalOpen,
    setIsUserManagementModalOpen,
    setIsCompanySettingsModalOpen,
    setIsVoucherSignatoriesModalOpen,
    hasPermission,
    currentUser,
    resetToDefaultData,
    companyInfo,
    systemLogs,
  } = useWarehouse();

  const [openSystem, setOpenSystem] = useState(false);

  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockAlert).length;
  const warrantyAlerts = warranties.filter(
    (w) => w.status === 'SAP_HET_HAN' || w.status === 'DANG_DOI_TRA_NCC'
  ).length;

  const guard = (perm: Parameters<typeof hasPermission>[0], msg: string, fn: () => void) => () => {
    if (!hasPermission(perm)) {
      alert(msg);
      return;
    }
    fn();
  };

  const goTab = (tab: ActiveTab) => () => setActiveTab(tab);
  const goIssue = (sub: SubTabXuattKho) => () => {
    if (sub === 'LAP_PHIEU') setEditingIssueOrder(null);
    setActiveTab('QUAN_LY_XUAT_KHO');
    setSubTabXuattKho(sub);
  };
  const goHistory = (mode: HistoryViewMode) => () => {
    setActiveTab('NHAT_KY');
    setHistoryViewMode(mode);
  };

  const exportExcel = () => {
    setActiveTab('BAO_CAO_XUAT_NHAP_TON');
    try {
      triggerFullStockReportExcelDownload(companyInfo, { products, receiptOrders, issueOrders });
    } catch (err) {
      console.error('Lỗi xuất Excel:', err);
      alert('Có lỗi khi xuất Excel. Vui lòng thử lại!');
    }
  };

  const groups: NavGroup[] = [
    {
      id: 'overview',
      title: 'Tổng quan',
      items: [
        {
          key: 'dash',
          label: 'Dashboard Điều Hành',
          icon: LayoutDashboard,
          active: activeTab === 'DASHBOARD',
          badge: lowStockCount,
          badgeTone: 'rose',
          onClick: goTab('DASHBOARD'),
        },
      ],
    },
    {
      id: 'warehouse',
      title: 'Kho hàng',
      items: [
        {
          key: 'issue',
          label: 'Xuất Kho',
          icon: Upload,
          active: activeTab === 'QUAN_LY_XUAT_KHO',
          onClick: goIssue(subTabXuattKho),
        },
        {
          key: 'receipt',
          label: 'Nhập Kho',
          icon: Download,
          active: false,
          locked: !hasPermission('canReceiptStock'),
          onClick: guard('canReceiptStock', 'Tài khoản của bạn không có quyền lập phiếu nhập kho!', () =>
            setIsCreateReceiptModalOpen(true)
          ),
        },
        {
          key: 'stock',
          label: 'Tồn Kho Thời Gian Thực',
          icon: Boxes,
          active: activeTab === 'QUAN_LY_TON_KHO',
          badge: lowStockCount,
          badgeTone: 'amber',
          onClick: goTab('QUAN_LY_TON_KHO'),
        },
        {
          key: 'audit',
          label: 'Kiểm Kê Kho',
          icon: ClipboardCheck,
          active: activeTab === 'KIEM_KE_KHO',
          onClick: goTab('KIEM_KE_KHO'),
        },
      ],
      children: {
        issue: [
          {
            key: 'issue-new',
            label: 'Lập Phiếu Xuất Kho',
            icon: PackagePlus,
            active: activeTab === 'QUAN_LY_XUAT_KHO' && subTabXuattKho === 'LAP_PHIEU',
            locked: !hasPermission('canIssueStock'),
            onClick: guard('canIssueStock', 'Tài khoản của bạn không có quyền lập phiếu xuất kho vật tư!', goIssue('LAP_PHIEU')),
          },
          {
            key: 'issue-list',
            label: 'Danh Sách Chứng Từ',
            icon: FileSpreadsheet,
            active: activeTab === 'QUAN_LY_XUAT_KHO' && subTabXuattKho === 'DANH_SACH',
            onClick: goIssue('DANH_SACH'),
          },
          {
            key: 'issue-detail',
            label: 'Chi Tiết Xuất Kho',
            icon: Table,
            active: activeTab === 'QUAN_LY_XUAT_KHO' && subTabXuattKho === 'CHI_TIET',
            onClick: goIssue('CHI_TIET'),
          },
        ],
      },
    },
    {
      id: 'catalog',
      title: 'Danh mục',
      items: [
        {
          key: 'products',
          label: 'Hàng Hoá',
          icon: Package,
          active: activeTab === 'DANH_MUC_HANG_HOA',
          onClick: goTab('DANH_MUC_HANG_HOA'),
        },
        {
          key: 'devices',
          label: 'Thiết Bị & Serial',
          icon: Cpu,
          active: activeTab === 'QUAN_LY_THIET_BI',
          onClick: goTab('QUAN_LY_THIET_BI'),
        },
        {
          key: 'warranty',
          label: 'Bảo Hành & NCC',
          icon: ShieldAlert,
          active: activeTab === 'QUAN_LY_BAO_HANH',
          badge: warrantyAlerts,
          badgeTone: 'amber',
          onClick: goTab('QUAN_LY_BAO_HANH'),
        },
        {
          key: 'customers',
          label: 'Khoa Phòng / Cán Bộ',
          icon: Users,
          active: false,
          onClick: () => setIsCustomerModalOpen(true),
        },
        {
          key: 'suppliers',
          label: 'Nhà Cung Cấp',
          icon: Truck,
          active: false,
          onClick: () => setIsSupplierModalOpen(true),
        },
      ],
    },
    {
      id: 'reports',
      title: 'Báo cáo & Nhật ký',
      items: [
        {
          key: 'report',
          label: 'Xuất Nhập Tồn & Thẻ Kho',
          icon: BarChart3,
          active: activeTab === 'BAO_CAO_XUAT_NHAP_TON',
          locked: !hasPermission('canViewReports'),
          onClick: guard('canViewReports', 'Tài khoản của bạn không có quyền xem Báo Cáo Xuất Nhập Tồn & Thẻ Kho.', goTab('BAO_CAO_XUAT_NHAP_TON')),
        },
        {
          key: 'excel',
          label: 'Xuất Excel Báo Cáo',
          icon: FileSpreadsheet,
          active: false,
          locked: !hasPermission('canExportExcel'),
          onClick: guard('canExportExcel', 'Tài khoản của bạn không có quyền xuất Excel.', exportExcel),
        },
        {
          key: 'history',
          label: 'Lịch Sử & Nhật Ký',
          icon: History,
          active: activeTab === 'NHAT_KY',
          locked: !hasPermission('canViewHistory'),
          onClick: guard('canViewHistory', 'Tài khoản của bạn không có quyền xem Lịch Sử Xuất Nhập Hàng.', goHistory(historyViewMode)),
        },
      ],
      children: {
        history: [
          {
            key: 'h-lines',
            label: 'Lịch Sử Dòng Hàng Hóa',
            icon: Table,
            active: activeTab === 'NHAT_KY' && historyViewMode === 'LINE_ITEMS',
            onClick: goHistory('LINE_ITEMS'),
          },
          {
            key: 'h-vouchers',
            label: 'Danh Sách Chứng Từ',
            icon: FileText,
            active: activeTab === 'NHAT_KY' && historyViewMode === 'VOUCHERS',
            onClick: goHistory('VOUCHERS'),
          },
          {
            key: 'h-logs',
            label: `Nhật Ký Thao Tác (${systemLogs.length})`,
            icon: History,
            active: activeTab === 'NHAT_KY' && historyViewMode === 'SYSTEM_LOGS',
            locked: !hasPermission('canViewSystemLogs'),
            onClick: guard('canViewSystemLogs', 'Tài khoản của bạn không có quyền xem nhật ký hệ thống.', goHistory('SYSTEM_LOGS')),
          },
        ],
      },
    },
  ];

  const systemItems: NavLeaf[] = [
    {
      key: 'signers',
      label: 'Người Ký & Nhận',
      icon: FileSignature,
      active: false,
      onClick: () => setIsVoucherSignatoriesModalOpen(true),
    },
    {
      key: 'rbac',
      label: 'Phân Quyền',
      icon: ShieldCheck,
      active: false,
      locked: !hasPermission('canManageUsers'),
      onClick: guard('canManageUsers', 'Chỉ tài khoản Quản trị viên (Admin) mới có quyền truy cập Quản Lý Người Dùng & Phân Quyền!', () =>
        setIsUserManagementModalOpen(true)
      ),
    },
    {
      key: 'company',
      label: 'Đơn Vị & Hotline',
      icon: Store,
      active: false,
      onClick: () => setIsCompanySettingsModalOpen(true),
    },
    {
      key: 'backup',
      label: 'Sao Lưu / Phục Hồi',
      icon: Database,
      active: false,
      locked: !hasPermission('canBackupRestore'),
      onClick: guard('canBackupRestore', 'Bạn không có quyền sao lưu dữ liệu hệ thống.', () => setIsBackupModalOpen(true)),
    },
    {
      key: 'sync',
      label: 'Làm Mới Kho IT',
      icon: RotateCcw,
      active: false,
      locked: !hasPermission('canAdjustStock'),
      onClick: guard('canAdjustStock', 'Bạn không có quyền điều chỉnh tồn kho. Vui lòng liên hệ Quản trị viên!', () =>
        setIsKhoITSyncModalOpen(true)
      ),
    },
    {
      key: 'reset',
      label: 'Nạp Dữ Liệu Mẫu',
      icon: RefreshCw,
      active: false,
      locked: currentUser.role !== 'ADMIN',
      onClick: () => {
        if (currentUser.role !== 'ADMIN') {
          alert('Chỉ tài khoản Quản trị viên mới có quyền nạp lại dữ liệu mẫu!');
          return;
        }
        if (confirm('Nạp lại toàn bộ dữ liệu mẫu? Dữ liệu hiện tại sẽ bị ghi đè.')) resetToDefaultData();
      },
    },
  ];

  const badgeClass = (tone?: 'rose' | 'amber') =>
    tone === 'rose' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300';

  const renderLeaf = (leaf: NavLeaf, nested = false) => {
    const Icon = leaf.icon;
    return (
      <button
        key={leaf.key}
        onClick={leaf.onClick}
        title={collapsed ? leaf.label : undefined}
        className={`w-full flex items-center gap-2.5 rounded-md text-left transition cursor-pointer ${
          collapsed ? 'justify-center px-0 py-2' : nested ? 'pl-9 pr-2.5 py-1.5' : 'px-2.5 py-2'
        } ${
          leaf.active
            ? 'bg-blue-600 text-white font-semibold shadow-xs'
            : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
        } ${leaf.locked ? 'opacity-50' : ''}`}
      >
        <span className="relative shrink-0">
          <Icon className={nested ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          {collapsed && !!leaf.badge && leaf.badge > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-xs">{leaf.label}</span>
            {!!leaf.badge && leaf.badge > 0 && (
              <span className={`px-1.5 rounded-full text-[10px] font-bold font-mono ${badgeClass(leaf.badgeTone)}`}>
                {leaf.badge}
              </span>
            )}
            {leaf.locked && <span className="text-[9px] bg-slate-600 text-slate-200 px-1 rounded">Khóa</span>}
          </>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`no-print shrink-0 bg-slate-900 text-slate-200 border-r border-slate-700 flex flex-col select-none transition-[width] duration-200 ${
        collapsed ? 'w-14' : 'w-60'
      }`}
    >
      <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-3">
        {groups.map((group) => (
          <div key={group.id}>
            {!collapsed && (
              <div className="px-2.5 pb-1 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                {group.title}
              </div>
            )}
            {collapsed && <div className="mx-2 border-t border-slate-700 mb-1" />}
            <div className="space-y-0.5">
              {group.items.map((leaf) => {
                const kids = group.children?.[leaf.key];
                return (
                  <React.Fragment key={leaf.key}>
                    {renderLeaf(leaf)}
                    {!collapsed && kids && leaf.active && (
                      <div className="space-y-0.5 pb-1">{kids.map((k) => renderLeaf(k, true))}</div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}

        {/* Hệ thống: thu gọn mặc định để giảm rối */}
        <div>
          {collapsed ? (
            <div className="mx-2 border-t border-slate-700 mb-1" />
          ) : (
            <button
              onClick={() => setOpenSystem((v) => !v)}
              className="w-full flex items-center justify-between px-2.5 pb-1 text-[10px] uppercase tracking-wider font-semibold text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <span>Hệ thống</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${openSystem ? 'rotate-180' : ''}`} />
            </button>
          )}
          {(openSystem || collapsed) && (
            <div className="space-y-0.5">{systemItems.map((leaf) => renderLeaf(leaf))}</div>
          )}
        </div>
      </nav>

      {!collapsed && (
        <div className="px-3 py-2 border-t border-slate-700 text-[10px] text-slate-500 flex items-center gap-1.5">
          <WarehouseIcon className="w-3 h-3" />
          <span className="truncate">{companyInfo.name}</span>
        </div>
      )}
    </aside>
  );
};
