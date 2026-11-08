export type ProductCategory = 'Mực in' | 'Hộp mực đổ' | 'Linh kiện máy in máy tính';

export interface Product {
  id: string;
  sku: string; // Mã hàng (e.g. MI-CANON-303, MD-12A-140G, LK-DRUM-12A)
  name: string; // Tên hàng hóa
  category: ProductCategory; // Nhóm hàng
  unit: string; // Đơn vị tính: Hộp, Chai, Cái, Chiếc, Bộ, Cây
  costPrice: number; // Giá vốn (VNĐ)
  sellingPrice: number; // Giá xuất / bán (VNĐ)
  stockQuantity: number; // Số lượng tồn kho thời gian thực
  minStockAlert: number; // Định mức tồn tối thiểu
  warehouseLocation: string; // Vị trí trong kho (Kệ A1, Ngăn 03...)
  compatibleModels?: string; // Dòng máy in/máy tính tương thích
  barcode?: string;
  notes?: string;
  updatedAt: string;
}

export interface StockIssueItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number; // % chiết khấu
  totalPrice: number; // (quantity * unitPrice) * (1 - discountPercent/100)
  stockAvailableBefore: number; // Tồn kho trước khi xuất
  notes?: string;
}

export interface StockIssueOrder {
  id: string;
  code: string; // Mã phiếu: PXK-YYYYMMDD-XXXX
  date: string; // Ngày chứng từ YYYY-MM-DD
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  warehouseName: string; // Kho xuất hàng (Kho Chính, Kho Linh Kiện...)
  reason: string; // Lý do xuất (Xuất bán cho khách, Xuất bảo hành, Xuất lắp ráp...)
  createdBy: string; // Nhân viên lập phiếu
  receiverName: string; // Người nhận hàng
  items: StockIssueItem[];
  totalQuantity: number;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number; // Tổng tiền thanh toán
  paymentStatus: 'Đã thanh toán' | 'Chưa thanh toán' | 'Thanh toán một phần' | 'Ghi công nợ';
  paidAmount: number;
  status: 'Đã xuất kho' | 'Chờ xuất kho' | 'Đã hủy';
  // Thiết bị nhận vật tư
  deviceId?: string;
  deviceName?: string;
  deviceSerial?: string;
  // Phê duyệt xuất âm
  notes?: string;
  createdAt: string;
}

export interface StockReceiptItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface StockReceiptOrder {
  id: string;
  code: string; // Mã phiếu: PNK-YYYYMMDD-XXXX
  date: string;
  supplierId?: string;
  supplierName: string;
  warehouseName: string;
  createdBy: string;
  items: StockReceiptItem[];
  totalQuantity: number;
  totalCost: number;
  paymentStatus?: 'Đã thanh toán' | 'Ghi nợ NCC';
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  debtAmount: number; // Công nợ khách hàng nợ mình
  group: string; // Tên Khoa/Phòng/Bộ phận hoặc Nhóm đối tượng
}

export interface Supplier {
  id: string;
  code: string; // NCC-001, NCC-002...
  name: string; // Tên nhà cung cấp / Tổng kho nhập khẩu
  contactPerson: string; // Người liên hệ / Kinh doanh
  phone: string;
  address: string;
  email?: string;
  taxCode?: string;
  categories: string; // Ngành hàng cung ứng (Mực in chính hãng, Mực nạp & phôi, Linh kiện máy in máy tính)
  debtPayable: number; // Công nợ mình phải trả nhà cung cấp
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  manager: string;
}

export interface StockCardRecord {
  id: string;
  date: string;
  voucherCode: string;
  voucherType: 'XUAT' | 'NHAP' | 'KHOI_TAO';
  partnerName: string; // Khách hàng hoặc Nhà cung cấp
  quantityIn: number;
  quantityOut: number;
  balanceAfter: number;
  unitPrice: number;
  notes: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxCode: string;
  director: string;
  chiefAccountant: string;
  storekeeper: string;
}

export type ActiveTab =
  | 'DASHBOARD'
  | 'QUAN_LY_XUAT_KHO'
  | 'DANH_MUC_HANG_HOA'
  | 'QUAN_LY_TON_KHO'
  | 'BAO_CAO_XUAT_NHAP_TON'
  | 'NHAT_KY'
  | 'KIEM_KE_KHO'
  | 'QUAN_LY_THIET_BI'
  | 'QUAN_LY_BAO_HANH';

export type SubTabXuattKho = 'LAP_PHIEU' | 'DANH_SACH' | 'CHI_TIET';

export type HistoryViewMode = 'LINE_ITEMS' | 'VOUCHERS' | 'SYSTEM_LOGS';

// --- RBAC & USER MANAGEMENT ---
export type UserRole = 'ADMIN' | 'STOREKEEPER' | 'ACCOUNTANT' | 'STAFF_VIEWER';

export interface UserPermissions {
  // Kho hàng & Chứng từ
  canIssueStock: boolean; // Quyền lập phiếu xuất kho vật tư
  canEditIssueOrder: boolean; // Quyền sửa phiếu xuất kho đã lập
  canReceiptStock: boolean; // Quyền lập phiếu nhập kho hàng
  canAdjustStock: boolean; // Quyền điều chỉnh tồn & Làm Mới Kho IT
  canDeleteVouchers: boolean; // Quyền xóa chứng từ xuất / nhập

  // Danh mục
  canManageProducts: boolean; // Quyền thêm, sửa, xóa danh mục mặt hàng
  canManageCustomers: boolean; // Quyền quản lý danh bạ 21 khoa phòng & cán bộ
  canManageSuppliers: boolean; // Quyền quản lý nhà cung cấp

  // Báo cáo & Lịch sử
  canViewReports: boolean; // Quyền xem báo cáo xuất nhập tồn & Thẻ kho
  canViewHistory: boolean; // Quyền xem lịch sử chứng từ xuất nhập
  canViewSystemLogs: boolean; // Quyền xem nhật ký hệ thống kiểm toán
  canExportExcel: boolean; // Quyền xuất báo cáo & thống kê ra file Excel

  // Hệ thống & Quản trị
  canManageUsers: boolean; // Quyền tạo user, đổi mật khẩu và phân quyền sử dụng
  canBackupRestore: boolean; // Quyền sao lưu & phục hồi dữ liệu hệ thống
}

export interface AppUser {
  id: string;
  username: string;
  email: string;
  name: string;
  phone: string;
  department: string; // Thuộc 21 khoa phòng VPMED
  role: UserRole;
  roleTitle: string;
  permissions: UserPermissions;
  isActive: boolean;
  password?: string;
  avatarColor?: string;
  lastLogin?: string;
  notes?: string;
}

// --- QUẢN LÝ THIẾT BỊ & SERIAL 21 KHOA PHÒNG ---
export interface HospitalDevice {
  id: string;
  code: string; // TB-CANON-01, TB-DELL-05...
  name: string; // Máy in Canon LBP 2900, Máy in HP LaserJet Pro M404dn...
  category: 'Máy in văn phòng' | 'Máy tính để bàn' | 'Máy in nhiệt / Siêu âm' | 'Máy scan / Photo';
  serialNumber: string; // VD: CN2900-CC01, DELL-OPT-9941
  macAddress?: string; // VD: 00:1A:2B:3C:4D:5E
  ipAddress?: string; // VD: 192.168.1.105
  department: string; // Khoa phòng trực thuộc (21 khoa phòng VPMED)
  roomLocation: string; // Bàn trực cấp cứu, Phòng giao ban, Quầy tiếp đón...
  assignedUser?: string; // Bác sĩ / Cán bộ phụ trách chính
  installedDate: string; // Ngày bàn giao lắp đặt YYYY-MM-DD
  status: 'Đang hoạt động' | 'Cần thay mực' | 'Bảo dưỡng / Sửa chữa' | 'Đã thanh lý';
  compatibleSupplies: string[]; // Danh sách mã SKU hoặc tên vật tư tương thích (MD-12A-140G, LK-DRUM-12A...)
  replacementHistory?: {
    date: string;
    supplyName: string;
    replacedBy: string;
    notes?: string;
  }[];
}

// --- KIỂM KÊ KHO (STOCKTAKE) ---
export interface StockAuditItem {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  systemStock: number; // Tồn sổ sách phần mềm
  actualStock: number; // Tồn kiểm đếm thực tế trên kệ
  difference: number; // actualStock - systemStock (+ thừa, - thiếu)
  costPrice: number;
  diffValue: number; // difference * costPrice
  notes?: string;
}

export interface StockAuditOrder {
  id: string;
  code: string; // KK-YYYYMMDD-XXXX
  auditDate: string;
  auditorName: string; // Người kiểm kê chính
  witnessName: string; // Người chứng kiến / Thủ kho
  items: StockAuditItem[];
  totalSystemStock: number;
  totalActualStock: number;
  totalDiffQuantity: number;
  totalDiffValue: number;
  status: 'Đã hoàn thành' | 'Đã cân bằng kho' | 'Bản nháp';
  balancedAt?: string;
  notes?: string;
  createdAt: string;
}

// --- QUY TRÌNH KÝ DUYỆT CẤP PHÁT ONLINE 2 BƯỚC ---
// --- QUẢN LÝ BẢO HÀNH & ĐỔI TRẢ NCC ---
export interface WarrantyItem {
  id: string;
  serialNumber?: string;
  productId: string;
  productName: string;
  sku: string;
  supplierId: string;
  supplierName: string;
  departmentUsed: string; // Khoa phòng đang dùng
  warrantyMonths: number; // Số tháng bảo hành (e.g. 6 tháng, 12 tháng)
  startDate: string; // Ngày bàn giao / xuất
  endDate: string; // Ngày hết hạn bảo hành
  status: 'CON_BAO_HANH' | 'SAP_HET_HAN' | 'HET_HAN' | 'DANG_DOI_TRA_NCC' | 'DA_DOI_TRA_XONG';
  returnHistory?: {
    returnDate: string;
    reason: string;
    supplierResponse: string;
    resolvedDate?: string;
    status: 'Chờ NCC đổi mới' | 'NCC đã đổi mới' | 'NCC hoàn tiền';
  }[];
  notes?: string;
}

