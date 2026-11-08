import React from 'react';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { CreateIssueOrderModal } from './components/CreateIssueOrderModal';
import { CreateProductModal } from './components/CreateProductModal';
import { CreateReceiptModal } from './components/CreateReceiptModal';
import { CustomersModal } from './components/CustomersModal';
import { SuppliersModal } from './components/SuppliersModal';
import { InventoryRealtimeView } from './components/InventoryRealtimeView';
import { IssueOrderDetailsBreakdown } from './components/IssueOrderDetailsBreakdown';
import { IssueOrdersView } from './components/IssueOrdersView';
import { PrintableVoucherModal } from './components/PrintableVoucherModal';
import { ProductCatalogView } from './components/ProductCatalogView';
import { TopBar } from './components/TopBar';
import { AppSidebar } from './components/AppSidebar';
import { DevicesView } from './components/DevicesView';
import { StockAuditView } from './components/StockAuditView';
import { WarrantyView } from './components/WarrantyView';
import { StockReportView } from './components/StockReportView';
import { StockHistoryView } from './components/StockHistoryView';
import { DashboardView } from './components/DashboardView';
import { KhoITBatchSyncModal } from './components/KhoITBatchSyncModal';
import { UserManagementModal } from './components/UserManagementModal';
import { SwitchUserModal } from './components/SwitchUserModal';
import { LoginView } from './components/LoginView';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { VoucherSignatoriesModal } from './components/VoucherSignatoriesModal';
import { useWarehouse, WarehouseProvider } from './context/WarehouseContext';

function WarehouseAppContent() {
  const {
    activeTab,
    subTabXuattKho,
    selectedVoucherForPrint,
    setSelectedVoucherForPrint,
    companyInfo,
    products,
    issueOrders,
    isKhoITSyncModalOpen,
    setIsKhoITSyncModalOpen,
    setIsCompanySettingsModalOpen,
    isAuthenticated,
  } = useWarehouse();

  // Show professional hospital LoginView if not authenticated
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden text-slate-800">
      {/* 1. Thanh tiêu đề gọn (thương hiệu, cảnh báo, tài khoản) */}
      <TopBar />

      <div className="flex flex-1 min-h-0">
        {/* 2. Menu điều hướng duy nhất: Sidebar bên trái */}
        <AppSidebar />

        {/* 3. Main Workspace Display Area */}
        <main className="flex-1 min-w-0 overflow-hidden flex flex-col relative">
      {/* Module: DASHBOARD ĐIỀU HÀNH */}
        {activeTab === 'DASHBOARD' && <DashboardView />}

        {/* Module: QUẢN LÝ XUẤT KHO */}
        {activeTab === 'QUAN_LY_XUAT_KHO' && (
          <>
            {subTabXuattKho === 'LAP_PHIEU' && <CreateIssueOrderModal />}
            {subTabXuattKho === 'DANH_SACH' && <IssueOrdersView />}
            {subTabXuattKho === 'CHI_TIET' && <IssueOrderDetailsBreakdown />}
          </>
        )}

        {/* Module: DANH MỤC HÀNG HOÁ (Mực in, Hộp mực đổ, Linh kiện) */}
        {activeTab === 'DANH_MUC_HANG_HOA' && <ProductCatalogView />}

        {/* Module: QUẢN LÝ TỒN KHO THỜI GIAN THỰC */}
        {activeTab === 'QUAN_LY_TON_KHO' && <InventoryRealtimeView />}

        {/* Module: BÁO CÁO XUẤT NHẬP TỒN & THẺ KHO */}
        {activeTab === 'BAO_CAO_XUAT_NHAP_TON' && <StockReportView />}

        {/* Module: LỊCH SỬ XUẤT NHẬP HÀNG & NHẬT KÝ HỆ THỐNG */}
        {activeTab === 'NHAT_KY' && <StockHistoryView />}

        {activeTab === 'KIEM_KE_KHO' && <StockAuditView />}
        {activeTab === 'QUAN_LY_THIET_BI' && <DevicesView />}
        {activeTab === 'QUAN_LY_BAO_HANH' && <WarrantyView />}
        </main>
      </div>

      {/* 4. Desktop Status Bar */}
      <footer className="no-print bg-slate-200 border-t border-slate-300 px-3 py-1 text-[11px] font-mono text-slate-600 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Hệ Thống Sẵn Sàng (Trực Tuyến)
          </span>
          <span>|</span>
          <span>Cơ sở dữ liệu: Local Storage v1.0</span>
          <span>|</span>
          <button
            onClick={() => setIsCompanySettingsModalOpen(true)}
            className="hidden md:inline hover:text-blue-700 hover:underline cursor-pointer text-left"
            title="Nhấp để xem và sửa thông tin đơn vị"
          >
            Đơn vị: {companyInfo.name}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span>
            {products.length} Mặt hàng · {issueOrders.length} Chứng từ xuất
          </span>
          <span>|</span>
          <button
            onClick={() => setIsCompanySettingsModalOpen(true)}
            className="hover:text-blue-700 hover:underline cursor-pointer font-semibold"
            title="Nhấp để xem hoặc sửa số Hotline hỗ trợ"
          >
            Hỗ trợ: 0982.558.699
          </button>
        </div>
      </footer>

      {/* Global Modals */}
      <CreateProductModal />
      <CreateReceiptModal />
      <BackupRestoreModal />
      <CustomersModal />
      <SuppliersModal />
      <CompanySettingsModal />
      <VoucherSignatoriesModal />
      <KhoITBatchSyncModal
        isOpen={isKhoITSyncModalOpen}
        onClose={() => setIsKhoITSyncModalOpen(false)}
      />
      <UserManagementModal />
      <SwitchUserModal />
      <ChangePasswordModal />
      {selectedVoucherForPrint && (
        <PrintableVoucherModal
          order={selectedVoucherForPrint}
          onClose={() => setSelectedVoucherForPrint(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WarehouseProvider>
      <WarehouseAppContent />
    </WarehouseProvider>
  );
}
