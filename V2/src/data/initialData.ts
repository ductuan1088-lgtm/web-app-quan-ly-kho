import {
  AppUser,
  CompanyInfo,
  Customer,
  HospitalDevice,
  IssueApprovalRequest,
  Product,
  StockAuditOrder,
  StockIssueOrder,
  StockReceiptOrder,
  Supplier,
  UserPermissions,
  UserRole,
  Warehouse,
  WarrantyItem,
} from '../types';

export const INITIAL_COMPANY: CompanyInfo = {
  name: 'CÔNG TY BỆNH VIỆN CỔ PHẦN VPMED',
  address: 'Số 1 Tô Ngọc Vân, Phường Tân Hưng, Thành phố Hải Phòng',
  phone: '024.3855.9966 - 0982.558.699',
  email: 'ituan@vpmed.vn',
  taxCode: '0108967822',
  director: 'Nguyễn Văn Tuấn',
  chiefAccountant: 'Trần Thị Mai',
  storekeeper: 'Lê Hoàng Long',
};

export const INITIAL_WAREHOUSES: Warehouse[] = [
  { id: 'wh-it', code: 'KHO-IT', name: 'Kho IT', address: 'Kho Phòng IT / Thiết Bị Tin Học & Máy In', manager: 'ituan@vpmed.vn' },
  { id: 'wh-1', code: 'KHO-TONG', name: 'Kho Tổng (Hà Nội)', address: 'Kho A, Số 48 Khuất Duy Tiến, Hà Nội', manager: 'Lê Hoàng Long' },
  { id: 'wh-2', code: 'KHO-LINHKIEN', name: 'Kho Linh Kiện & Mực', address: 'Tầng 1 Showroom, Thanh Xuân', manager: 'Phạm Minh Đức' },
  { id: 'wh-3', code: 'KHO-KYTHUAT', name: 'Kho Kỹ Thuật Bảo Hành', address: 'Phòng Kỹ Thuật Tầng 2', manager: 'Vũ Quốc Toàn' },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  // ==================== BAN GIÁM ĐỐC ====================
  { id: 'cust-001', code: 'bsphuong', name: 'Trương Trọng Phương', phone: '0912450553', address: 'Ban Giám đốc', debtAmount: 0, group: 'Ban Giám đốc' },
  { id: 'cust-002', code: 'dnduc', name: 'Đồng Ngọc Đức', phone: '0936009057', address: 'Ban Giám đốc', debtAmount: 0, group: 'Ban Giám đốc' },
  { id: 'cust-003', code: 'pgdnvdoi', name: 'Nguyễn Văn Đối', phone: '0912600027', address: 'Ban Giám đốc', debtAmount: 0, group: 'Ban Giám đốc' },
  { id: 'cust-004', code: 'pvminh', name: 'Phạm Văn Minh', phone: '0369566066', address: 'Ban Giám đốc', debtAmount: 0, group: 'Ban Giám đốc' },

  // ==================== KHOA CẤP CỨU, HỒI SỨC TÍCH CỰC ====================
  { id: 'cust-005', code: 'thu', name: 'Phạm Thị Thư', phone: '0989236558', address: 'Khoa Cấp cứu, Hồi sức tích cực', debtAmount: 0, group: 'Khoa Cấp cứu, Hồi sức tích cực' },
  { id: 'cust-006', code: 'vdanh', name: 'Vũ Đức Anh', phone: '0978882186', address: 'Khoa Cấp cứu, Hồi sức tích cực', debtAmount: 0, group: 'Khoa Cấp cứu, Hồi sức tích cực' },
  { id: 'cust-007', code: 'ntyen', name: 'Nguyễn Thị Yến', phone: '0973878812', address: 'Khoa Cấp cứu, Hồi sức tích cực', debtAmount: 0, group: 'Khoa Cấp cứu, Hồi sức tích cực' },
  { id: 'cust-008', code: 'lxhieu', name: 'Lê Xuân Hiếu', phone: '0978732733', address: 'Khoa Cấp cứu, Hồi sức tích cực', debtAmount: 0, group: 'Khoa Cấp cứu, Hồi sức tích cực' },

  // ==================== KHOA NỘI ====================
  { id: 'cust-009', code: 'pvkien', name: 'Phạm Văn Kiên', phone: '0377507466', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },
  { id: 'cust-010', code: 'ntntrang', name: 'Nguyễn Thị Như Trang', phone: '0364965171', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },

  // ==================== KHOA CĐHA - TDCN ====================
  { id: 'cust-011', code: 'btkhiet', name: 'Bùi Thanh Khiết', phone: '0982715858', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-012', code: 'tnuyen', name: 'Trần Ngọc Uyên', phone: '0913040305', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-013', code: 'nttung', name: 'Nguyễn Thanh Tùng', phone: '0778330340', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-014', code: 'hangsa', name: 'Đặng Thị Thu Hằng', phone: '0965621556', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-015', code: 'dtlan', name: 'Dương Thị Lan', phone: '0385717204', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-016', code: 'ntpanhns', name: 'Nguyễn Thị Phương Anh', phone: '0964990122', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-017', code: 'phthang', name: 'Phạm Huy Thắng', phone: '0766425435', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-018', code: 'pxthanh', name: 'Phạm Xuân Thành', phone: '0588511115', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-019', code: 'vvchinh', name: 'Vũ Văn Chính', phone: '0326028724', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-020', code: 'nhduong', name: 'Nguyễn Hoàng Dương', phone: '0332096760', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-021', code: 'vhanh', name: 'Vũ Hoàng Anh', phone: '0837003214', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-022', code: 'nttmy', name: 'Nguyễn Thị Trà My', phone: '0868953829', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-023', code: 'dtthom', name: 'Đinh Thị Thơm', phone: '0969823402', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-024', code: 'hkhanh', name: 'Hà Kim Hạnh', phone: '0986432784', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-025', code: 'tttan', name: 'Trần Thị Tân', phone: '0369253529', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-026', code: 'bslong', name: 'Nguyễn Thanh Long', phone: '0904376737', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-027', code: 'lvha', name: 'Lương Văn Hạ', phone: '0977134116', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-028', code: 'pvque', name: 'Phạm Văn Quế', phone: '0904994992', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },

  // ==================== KHOA DƯỢC ====================
  { id: 'cust-029', code: 'ptgiua', name: 'Phùng Thị Giữa', phone: '0987590626', address: 'Khoa Dược', debtAmount: 0, group: 'Khoa Dược' },
  { id: 'cust-030', code: 'ntthuy', name: 'Nguyễn Thị Thuý', phone: '0326661041', address: 'Khoa Dược', debtAmount: 0, group: 'Khoa Dược' },
  { id: 'cust-031', code: 'vttuyen', name: 'Vũ Thị Tuyên', phone: '0986386576', address: 'Khoa Dược', debtAmount: 0, group: 'Khoa Dược' },
  { id: 'cust-032', code: 'vtloanduoc', name: 'Vũ Thị Loan', phone: '0974869920', address: 'Khoa Dược', debtAmount: 0, group: 'Khoa Dược' },

  // ==================== PHÒNG ĐIỀU DƯỠNG ====================
  { id: 'cust-033', code: 'oanh', name: 'Đào Thị Oanh', phone: '0975653670', address: 'Phòng Điều dưỡng', debtAmount: 0, group: 'Phòng Điều dưỡng' },

  // ==================== KHOA NỘI ====================
  { id: 'cust-034', code: 'ktnhung', name: 'Khương Thị Nhung', phone: '0904297597', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },

  // ==================== KHOA KHÁM BỆNH ====================
  { id: 'cust-035', code: 'vvdai', name: 'Vũ Văn Đại', phone: '0854388555', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },

  // ==================== KHOA U BƯỚU - Y HỌC HẠT NHÂN ====================
  { id: 'cust-036', code: 'dtthuy', name: 'Đỗ Thị Thùy', phone: '0906004675', address: 'Khoa U Bướu - Y HỌC HẠT NHÂN', debtAmount: 0, group: 'Khoa U Bướu - Y HỌC HẠT NHÂN' },

  // ==================== KHOA KHÁM BỆNH ====================
  { id: 'cust-037', code: 'pthien', name: 'Phạm Thị Thu Hiền', phone: '0969253759', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },
  { id: 'cust-038', code: 'nvson', name: 'Nguyễn Văn Sơn', phone: '0946841996', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },
  { id: 'cust-039', code: 'nqlam', name: 'Nguyễn Quốc Lâm', phone: '0912164696', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },
  { id: 'cust-040', code: 'dtgam', name: 'Đồng Thị Gấm', phone: '0904196484', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },
  { id: 'cust-041', code: 'vtnhung', name: 'Vũ Thị Nhung', phone: '0353508496', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },

  // ==================== KHOA KSNK ====================
  { id: 'cust-042', code: 'ntlan', name: 'Nguyễn Thị Lan', phone: '0988452974', address: 'Khoa KSNK', debtAmount: 0, group: 'Khoa KSNK' },

  // ==================== KHOA LCK (MẮT - TMH - RHM) ====================
  { id: 'cust-043', code: 'dvthuong', name: 'Đồng Văn Thưởng', phone: '0973867920', address: 'Khoa LCK (Mắt - TMH - RHM)', debtAmount: 0, group: 'Khoa LCK (Mắt - TMH - RHM)' },
  { id: 'cust-044', code: 'nthay', name: 'Nguyễn Thị Hay', phone: '0988151453', address: 'Khoa LCK (Mắt - TMH - RHM)', debtAmount: 0, group: 'Khoa LCK (Mắt - TMH - RHM)' },
  { id: 'cust-045', code: 'ltluyen', name: 'Lê Thị Luyên', phone: '0362622804', address: 'Khoa LCK (Mắt - TMH - RHM)', debtAmount: 0, group: 'Khoa LCK (Mắt - TMH - RHM)' },
  { id: 'cust-046', code: 'bspvhung', name: 'Phạm Văn Hùng', phone: '0945256258', address: 'Khoa LCK (Mắt - TMH - RHM)', debtAmount: 0, group: 'Khoa LCK (Mắt - TMH - RHM)' },
  { id: 'cust-047', code: 'nttrangxn', name: 'Nguyễn Thị Trang', phone: '0981766081', address: 'Khoa LCK (Mắt - TMH - RHM)', debtAmount: 0, group: 'Khoa LCK (Mắt - TMH - RHM)' },
  { id: 'cust-048', code: 'cmlinh', name: 'Chu Mỹ Linh', phone: '0968523103', address: 'Khoa LCK (Mắt - TMH - RHM)', debtAmount: 0, group: 'Khoa LCK (Mắt - TMH - RHM)' },
  { id: 'cust-049', code: 'vthue', name: 'Vũ Thị Huê', phone: '0988675639', address: 'Khoa LCK (Mắt - TMH - RHM)', debtAmount: 0, group: 'Khoa LCK (Mắt - TMH - RHM)' },
  { id: 'cust-050', code: 'vtthao', name: 'Võ Thị Thảo', phone: '0972346979', address: 'Khoa LCK (Mắt - TMH - RHM)', debtAmount: 0, group: 'Khoa LCK (Mắt - TMH - RHM)' },
  { id: 'cust-051', code: 'ptduyen', name: 'Phạm Thị Duyên', phone: '0376033226', address: 'Khoa LCK (Mắt - TMH - RHM)', debtAmount: 0, group: 'Khoa LCK (Mắt - TMH - RHM)' },
  { id: 'cust-052', code: 'ntvanlck', name: 'Nguyễn Thảo Vân', phone: '0325551264', address: 'Khoa LCK (Mắt - TMH - RHM)', debtAmount: 0, group: 'Khoa LCK (Mắt - TMH - RHM)' },
  { id: 'cust-053', code: 'bhanh', name: 'Bùi Thị Hạnh', phone: '0982839786', address: 'Khoa LCK (Mắt - TMH - RHM)', debtAmount: 0, group: 'Khoa LCK (Mắt - TMH - RHM)' },

  // ==================== PHÒNG KHTH ====================
  { id: 'cust-054', code: 'dvkhoi', name: 'Đoàn Văn Khôi', phone: '0328699799', address: 'Phòng KHTH', debtAmount: 0, group: 'Phòng KHTH' },

  // ==================== KHOA NỘI ====================
  { id: 'cust-055', code: 'bsvtvan', name: 'Vũ Thị Vân', phone: '0978253326', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },
  { id: 'cust-056', code: 'ntninh', name: 'Nguyễn Thị Ninh', phone: '0366045207', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },
  { id: 'cust-057', code: 'bsdtyen', name: 'Đỗ Thị Yến', phone: '0963043059', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },
  { id: 'cust-058', code: 'ttlhuong', name: 'Trần Thị Lan Hương', phone: '0983982601', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },

  // ==================== KHOA NHI ====================
  { id: 'cust-059', code: 'ltchi', name: 'Lê Thảo Chi', phone: '0943148132', address: 'Khoa Nhi', debtAmount: 0, group: 'Khoa Nhi' },
  { id: 'cust-060', code: 'tqdat', name: 'Trần Quốc Đạt', phone: '0788368115', address: 'Khoa Nhi', debtAmount: 0, group: 'Khoa Nhi' },

  // ==================== PHÒNG KHTH ====================
  { id: 'cust-061', code: 'bsnttha', name: 'Nguyễn Thị Thu Hà', phone: '0979228536', address: 'Phòng KHTH', debtAmount: 0, group: 'Phòng KHTH' },
  { id: 'cust-062', code: 'ntngoan', name: 'Nguyễn Thị Ngoan', phone: '0904255380', address: 'Phòng KHTH', debtAmount: 0, group: 'Phòng KHTH' },
  { id: 'cust-063', code: 'ntthuong', name: 'Nguyễn Thị Thu Hương', phone: '0976552609', address: 'Phòng KHTH', debtAmount: 0, group: 'Phòng KHTH' },

  // ==================== PHÒNG TCHC ====================
  { id: 'cust-064', code: 'ntlphuong', name: 'Nguyễn Thị Lan Phương', phone: '0988657389', address: 'Phòng TCHC', debtAmount: 0, group: 'Phòng TCHC' },

  // ==================== KHOA NGOẠI - PTGMHS ====================
  { id: 'cust-065', code: 'dtthanh', name: 'Đoàn Tuấn Thành', phone: '0904197757', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-066', code: 'nddong', name: 'Nguyễn Duy Đông', phone: '0912310028', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-067', code: 'htkhiem', name: 'Hồ Trọng Khiêm', phone: '0936274293', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-068', code: 'dvtoa', name: 'Đỗ Văn Toạ', phone: '0968029830', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },

  // ==================== KHOA U BƯỚU - Y HỌC HẠT NHÂN ====================
  { id: 'cust-069', code: 'lhanh', name: 'Lý Hoàng Anh', phone: '0355300215', address: 'Khoa U Bướu - Y HỌC HẠT NHÂN', debtAmount: 0, group: 'Khoa U Bướu - Y HỌC HẠT NHÂN' },

  // ==================== KHOA NGOẠI - PTGMHS ====================
  { id: 'cust-070', code: 'vvsang', name: 'Vũ Văn Sang', phone: '0869777040', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-071', code: 'nttuyen', name: 'Nguyễn Thanh Tuyền', phone: '0866952979', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-072', code: 'hoangoai', name: 'Nguyễn Thị Hoa', phone: '0387591079', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-073', code: 'ptdam', name: 'Phạm Thị Đàm', phone: '0983211505', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-074', code: 'mtnguyet', name: 'Mạc Thị Nguyệt', phone: '0376253739', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-075', code: 'nttrang', name: 'Nguyễn Thu Trang', phone: '0398218677', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-076', code: 'ndthanh', name: 'Nguyễn Đình Thành', phone: '0974090585', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-077', code: 'ntthuy1', name: 'Nguyễn Thị Thuỷ', phone: '0368650866', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-078', code: 'ptthao', name: 'Phan Thị Thảo', phone: '0373515087', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-079', code: 'pthuyen', name: 'Phạm Thị Huyền', phone: '0349646517', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },

  // ==================== KHOA U BƯỚU - Y HỌC HẠT NHÂN ====================
  { id: 'cust-080', code: 'lhhanh', name: 'Lưu Hoàng Hạnh', phone: '0333275064', address: 'Khoa U Bướu - Y HỌC HẠT NHÂN', debtAmount: 0, group: 'Khoa U Bướu - Y HỌC HẠT NHÂN' },

  // ==================== KHOA NGOẠI - PTGMHS ====================
  { id: 'cust-081', code: 'ptmhien', name: 'Phạm Thị Minh Hiền', phone: '0981074608', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-082', code: 'ldthai', name: 'Lê Đình Thái', phone: '0915152899', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },

  // ==================== KHOA U BƯỚU - Y HỌC HẠT NHÂN ====================
  { id: 'cust-083', code: 'natien', name: 'Ngô Anh Tiến', phone: '0363991525', address: 'Khoa U Bướu - Y HỌC HẠT NHÂN', debtAmount: 0, group: 'Khoa U Bướu - Y HỌC HẠT NHÂN' },

  // ==================== KHOA NGOẠI - PTGMHS ====================
  { id: 'cust-084', code: 'nnthien', name: 'Nguyễn Như Thiện', phone: '0364042979', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },

  // ==================== KHOA U BƯỚU - Y HỌC HẠT NHÂN ====================
  { id: 'cust-085', code: 'tdnam', name: 'Trương Đức Nam', phone: '0983016545', address: 'Khoa U Bướu - Y HỌC HẠT NHÂN', debtAmount: 0, group: 'Khoa U Bướu - Y HỌC HẠT NHÂN' },

  // ==================== KHOA NGOẠI - PTGMHS ====================
  { id: 'cust-086', code: 'vtdchi', name: 'Vũ Thị Diệu Chi', phone: '0968837512', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-087', code: 'nbthao', name: 'Nguyễn Bá Thao', phone: '0975525580', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-088', code: 'dtthien', name: 'Đào Thị Thu Hiền', phone: '0972308325', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },

  // ==================== KHOA U BƯỚU - Y HỌC HẠT NHÂN ====================
  { id: 'cust-089', code: 'hnlinh', name: 'Hoàng Ngọc Linh', phone: '0827559251', address: 'Khoa U Bướu - Y HỌC HẠT NHÂN', debtAmount: 0, group: 'Khoa U Bướu - Y HỌC HẠT NHÂN' },

  // ==================== KHOA NGOẠI - PTGMHS ====================
  { id: 'cust-090', code: 'dtmhien', name: 'Đào Thị Mai Hiền', phone: '0985937781', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-091', code: 'nthang1', name: 'Nguyễn Thị Hằng', phone: '0334320934', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },

  // ==================== KHOA U BƯỚU - Y HỌC HẠT NHÂN ====================
  { id: 'cust-092', code: 'pduong', name: 'Phạm Hữu Dương', phone: '0917505827', address: 'Khoa U Bướu - Y HỌC HẠT NHÂN', debtAmount: 0, group: 'Khoa U Bướu - Y HỌC HẠT NHÂN' },

  // ==================== KHOA KHÁM BỆNH ====================
  { id: 'cust-093', code: 'dtanh96', name: 'Đỗ Thị Anh', phone: '0964958733', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },

  // ==================== KHOA PHỤ SẢN ====================
  { id: 'cust-094', code: 'ndtho', name: 'Nguyễn Đức Thơ', phone: '0912057217', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },
  { id: 'cust-095', code: 'nthue', name: 'Nguyễn Thị Huệ', phone: '0978348610', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },
  { id: 'cust-096', code: 'pthong', name: 'Phạm Thị Hồng', phone: '0358965016', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },
  { id: 'cust-097', code: 'dtphuong', name: 'Đinh Thị Phương', phone: '0372592566', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },
  { id: 'cust-098', code: 'nthuong', name: 'Nguyễn Thị Hương', phone: '0396331330', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },
  { id: 'cust-099', code: 'ntkhuyen', name: 'Nguyễn Thị Khuyên', phone: '0768304166', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },
  { id: 'cust-100', code: 'ntdao', name: 'Nguyễn Thị Đào', phone: '0901973888', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },

  // ==================== KHOA PHCN ====================
  { id: 'cust-101', code: 'ltmanh', name: 'Lương Thế Mạnh', phone: '0373398369', address: 'Khoa PHCN', debtAmount: 0, group: 'Khoa PHCN' },
  { id: 'cust-102', code: 'pvmanh', name: 'Phạm Văn Mạnh', phone: '0985270886', address: 'Khoa PHCN', debtAmount: 0, group: 'Khoa PHCN' },
  { id: 'cust-103', code: 'ntdiu', name: 'Nguyễn Thị Dịu', phone: '0964491445', address: 'Khoa PHCN', debtAmount: 0, group: 'Khoa PHCN' },
  { id: 'cust-104', code: 'mtphuong', name: 'Mạc Thị Phương', phone: '0989469143', address: 'Khoa PHCN', debtAmount: 0, group: 'Khoa PHCN' },

  // ==================== PHÒNG KHTH ====================
  { id: 'cust-105', code: 'ntninh1', name: 'Nguyễn Thị Ninh', phone: '0366502133', address: 'Phòng KHTH', debtAmount: 0, group: 'Phòng KHTH' },

  // ==================== KHOA PHCN ====================
  { id: 'cust-106', code: 'dtluyen', name: 'Đàm Thị Luyến', phone: '0964851683', address: 'Khoa PHCN', debtAmount: 0, group: 'Khoa PHCN' },
  { id: 'cust-107', code: 'dpmai', name: 'Đàm Phương Mai', phone: '0352559566', address: 'Khoa PHCN', debtAmount: 0, group: 'Khoa PHCN' },

  // ==================== KHOA CẤP CỨU, HỒI SỨC TÍCH CỰC ====================
  { id: 'cust-108', code: 'ntngan', name: 'Nguyễn Thế Ngăn', phone: '0382568255', address: 'Khoa Cấp cứu, Hồi sức tích cực', debtAmount: 0, group: 'Khoa Cấp cứu, Hồi sức tích cực' },

  // ==================== KHOA PHCN ====================
  { id: 'cust-109', code: 'ntxquynh', name: 'Nguyễn Thị Xuân Quỳnh', phone: '0981064525', address: 'Khoa PHCN', debtAmount: 0, group: 'Khoa PHCN' },
  { id: 'cust-110', code: 'ltthu', name: 'Lê Thị Thu', phone: '0399629036', address: 'Khoa PHCN', debtAmount: 0, group: 'Khoa PHCN' },

  // ==================== KHOA CẤP CỨU, HỒI SỨC TÍCH CỰC ====================
  { id: 'cust-111', code: 'nthiep', name: 'Nguyễn Tuấn Hiệp', phone: '0916598890', address: 'Khoa Cấp cứu, Hồi sức tích cực', debtAmount: 0, group: 'Khoa Cấp cứu, Hồi sức tích cực' },

  // ==================== KHOA PHCN ====================
  { id: 'cust-112', code: 'tttphuong', name: 'Trần Thị Thu Phương', phone: '0985850068', address: 'Khoa PHCN', debtAmount: 0, group: 'Khoa PHCN' },
  { id: 'cust-113', code: 'nvtrang', name: 'Nguyễn Văn Trang', phone: '0905099418', address: 'Khoa PHCN', debtAmount: 0, group: 'Khoa PHCN' },
  { id: 'cust-114', code: 'ptpnga', name: 'Phạm Thị Phương Nga', phone: '0966765264', address: 'Khoa PHCN', debtAmount: 0, group: 'Khoa PHCN' },
  { id: 'cust-115', code: 'nttngan', name: 'Nguyễn Thị Thùy Ngân', phone: '0964755552', address: 'Khoa PHCN', debtAmount: 0, group: 'Khoa PHCN' },
  { id: 'cust-116', code: 'lthang', name: 'Lê Thu Hằng', phone: '0332498581', address: 'Khoa PHCN', debtAmount: 0, group: 'Khoa PHCN' },

  // ==================== KHOA XÉT NGHIỆM ====================
  { id: 'cust-117', code: 'vbvphuong', name: 'Vũ Bá Việt Phương', phone: '0383131943', address: 'Khoa Xét Nghiệm', debtAmount: 0, group: 'Khoa Xét Nghiệm' },
  { id: 'cust-118', code: 'nttham', name: 'Nguyễn Thị Thấm', phone: '0346933058', address: 'Khoa Xét Nghiệm', debtAmount: 0, group: 'Khoa Xét Nghiệm' },
  { id: 'cust-119', code: 'dttnhan', name: 'Đào Thị Thanh Nhàn', phone: '0383673772', address: 'Khoa Xét Nghiệm', debtAmount: 0, group: 'Khoa Xét Nghiệm' },
  { id: 'cust-120', code: 'ntqnga', name: 'Nguyễn Thị Quỳnh Nga', phone: '0389967610', address: 'Khoa Xét Nghiệm', debtAmount: 0, group: 'Khoa Xét Nghiệm' },
  { id: 'cust-121', code: 'ctdhuong', name: 'Cao Thị Diễm Hương', phone: '0349499188', address: 'Khoa Xét Nghiệm', debtAmount: 0, group: 'Khoa Xét Nghiệm' },
  { id: 'cust-122', code: 'nttrangxn1', name: 'Nguyễn Thị Trang', phone: '0965068189', address: 'Khoa Xét Nghiệm', debtAmount: 0, group: 'Khoa Xét Nghiệm' },
  { id: 'cust-123', code: 'pttrang', name: 'Phạm Thị Trang', phone: '0339674862', address: 'Khoa Xét Nghiệm', debtAmount: 0, group: 'Khoa Xét Nghiệm' },
  { id: 'cust-124', code: 'nvduy', name: 'Nguyễn Văn Duy', phone: '0968801904', address: 'Khoa Xét Nghiệm', debtAmount: 0, group: 'Khoa Xét Nghiệm' },
  { id: 'cust-125', code: 'nttvan', name: 'Nguyễn Thị Thuý Vân', phone: '0964346200', address: 'Khoa Xét Nghiệm', debtAmount: 0, group: 'Khoa Xét Nghiệm' },
  { id: 'cust-126', code: 'vhhoang', name: 'Vũ Huy Hoàng', phone: '0852155994', address: 'Khoa Xét Nghiệm', debtAmount: 0, group: 'Khoa Xét Nghiệm' },

  // ==================== KHOA Y HỌC CỔ TRUYỀN ====================
  { id: 'cust-127', code: 'pvthai', name: 'Phạm Văn Thái', phone: '0989262529', address: 'Khoa Y học cổ truyền', debtAmount: 0, group: 'Khoa Y học cổ truyền' },
  { id: 'cust-128', code: 'dtngan', name: 'Đinh Thị Kim Ngân', phone: '0974150988', address: 'Khoa Y học cổ truyền', debtAmount: 0, group: 'Khoa Y học cổ truyền' },
  { id: 'cust-129', code: 'ptanh', name: 'Phan Thảo Anh', phone: '0386676711', address: 'Khoa Y học cổ truyền', debtAmount: 0, group: 'Khoa Y học cổ truyền' },
  { id: 'cust-130', code: 'hqhoan', name: 'Hoàng Quý Hoan', phone: '0904122161', address: 'Khoa Y học cổ truyền', debtAmount: 0, group: 'Khoa Y học cổ truyền' },

  // ==================== KHOA LCK (MẮT - TMH - RHM) ====================
  { id: 'cust-131', code: 'ntvan', name: 'Nguyễn Thị Vân', phone: '0975189657', address: 'Khoa LCK (Mắt - TMH - RHM)', debtAmount: 0, group: 'Khoa LCK (Mắt - TMH - RHM)' },

  // ==================== KHOA XÉT NGHIỆM ====================
  { id: 'cust-132', code: 'dtluong', name: 'Đỗ Thị Lương', phone: '0343688215', address: 'Khoa Xét Nghiệm', debtAmount: 0, group: 'Khoa Xét Nghiệm' },

  // ==================== KHOA NHI ====================
  { id: 'cust-133', code: 'btnga', name: 'Bùi Thị Nga', phone: '0961805997', address: 'Khoa Nhi', debtAmount: 0, group: 'Khoa Nhi' },
  { id: 'cust-134', code: 'ntthuc', name: 'Nguyễn Thị Thức', phone: '0914971688', address: 'Khoa Nhi', debtAmount: 0, group: 'Khoa Nhi' },
  { id: 'cust-135', code: 'pvtoan', name: 'Phạm Văn Toàn', phone: '0358231818', address: 'Khoa Nhi', debtAmount: 0, group: 'Khoa Nhi' },

  // ==================== KHOA U BƯỚU - Y HỌC HẠT NHÂN ====================
  { id: 'cust-136', code: 'dhtuyen', name: 'Đoàn Huy Tuyền', phone: '0382158115', address: 'Khoa U Bướu - Y HỌC HẠT NHÂN', debtAmount: 0, group: 'Khoa U Bướu - Y HỌC HẠT NHÂN' },

  // ==================== KHOA KHÁM BỆNH ====================
  { id: 'cust-137', code: 'nttanh', name: 'Nguyễn Thị Trâm Anh', phone: '0869233726', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },

  // ==================== KHOA XÉT NGHIỆM ====================
  { id: 'cust-138', code: 'vgtlam', name: 'Vũ Gia Thành Lâm', phone: '0336160202', address: 'Khoa Xét Nghiệm', debtAmount: 0, group: 'Khoa Xét Nghiệm' },

  // ==================== KHOA PHỤ SẢN ====================
  { id: 'cust-139', code: 'pttdung', name: 'Phạm Thị Thùy Dung', phone: '0399925784', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },
  { id: 'cust-140', code: 'pttham', name: 'Phạm Thị Thắm', phone: '0966736569', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },
  { id: 'cust-141', code: 'pthyen', name: 'Phạm Thị hải yến', phone: '0869316277', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },

  // ==================== KHOA NỘI ====================
  { id: 'cust-142', code: 'ntmnguyet', name: 'nguyễn thị minh nguyệt', phone: '0343031155', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },

  // ==================== KHOA NHI ====================
  { id: 'cust-143', code: 'ntpanh', name: 'nguyễn thu phương anh', phone: '0979550555', address: 'Khoa Nhi', debtAmount: 0, group: 'Khoa Nhi' },

  // ==================== KHOA KHÁM BỆNH ====================
  { id: 'cust-144', code: 'ntpanhns1', name: 'nguyễn thị phương anh', phone: '0368228339', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },
  { id: 'cust-145', code: 'ndkien', name: 'nguyễn đăng kiên', phone: '034.393.8777', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },
  { id: 'cust-146', code: 'dmnhung', name: 'Đặng Mai Nhung', phone: '0857035480', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },

  // ==================== KHOA PHỤ SẢN ====================
  { id: 'cust-147', code: 'ttoanh', name: 'Trần thị oanh', phone: '0966199181', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },

  // ==================== KHOA KHÁM BỆNH ====================
  { id: 'cust-148', code: 'vttngan', name: 'vũ thị thủy ngân', phone: '0347672185', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },

  // ==================== KHOA XÉT NGHIỆM ====================
  { id: 'cust-149', code: 'ntphuong', name: 'nguyễn thu phương', phone: '0333698685', address: 'Khoa Xét Nghiệm', debtAmount: 0, group: 'Khoa Xét Nghiệm' },

  // ==================== KHOA PHỤ SẢN ====================
  { id: 'cust-150', code: 'nthdiep', name: 'nguyễn thị hồng diệp', phone: '0984530013', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },
  { id: 'cust-151', code: 'lcthanh', name: 'Lê Chí Thành', phone: '0914739915', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },
  { id: 'cust-152', code: 'dtvanh', name: 'Dương Thị Vân Anh', phone: '0814752434', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },
  { id: 'cust-153', code: 'ntdieu', name: 'Nguyễn Tiến Diệu', phone: '0982255913', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },

  // ==================== KHOA KHÁM BỆNH ====================
  { id: 'cust-154', code: 'vvthoai', name: 'Vũ Văn Thoại', phone: '0342925845', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },
  { id: 'cust-155', code: 'dklinh', name: 'Đỗ Khánh Linh', phone: '0357899860', address: 'Khoa Khám bệnh', debtAmount: 0, group: 'Khoa Khám bệnh' },

  // ==================== KHOA NỘI ====================
  { id: 'cust-156', code: 'ntninh2', name: 'Nguyễn Thị Ninh', phone: '0366045207', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },

  // ==================== KHÁC ====================
  { id: 'cust-157', code: 'htthuy', name: 'Hà Thị Thùy', phone: '0386858604', address: 'Khác', debtAmount: 0, group: 'Khác' },

  // ==================== KHOA CĐHA - TDCN ====================
  { id: 'cust-158', code: 'dncuong', name: 'Đỗ Như Cương', phone: '0989165725', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },

  // ==================== PHÒNG KHTH ====================
  { id: 'cust-159', code: 'ttben', name: 'Trương Thị Bền', phone: '0968391816', address: 'Phòng KHTH', debtAmount: 0, group: 'Phòng KHTH' },

  // ==================== KHOA CĐHA - TDCN ====================
  { id: 'cust-160', code: 'vtngoc', name: 'Vũ Thị Ngọc', phone: '0358367082', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },

  // ==================== KHOA NHI ====================
  { id: 'cust-161', code: 'havh', name: 'Vũ Hải Hà', phone: '0968582826', address: 'Khoa Nhi', debtAmount: 0, group: 'Khoa Nhi' },

  // ==================== PHÒNG TÀI CHÍNH KẾ TOÁN ====================
  { id: 'cust-162', code: 'ntylinh', name: 'Nguyễn Thị Yến Linh', phone: '0339131555', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },
  { id: 'cust-163', code: 'nthtrang', name: 'Nguyễn Thị Huyền Trang', phone: '0372908793', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },
  { id: 'cust-164', code: 'ltmai', name: 'Lê Thị Mai', phone: '0973579679', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },

  // ==================== KHOA CĐHA - TDCN ====================
  { id: 'cust-165', code: 'hndzien', name: 'Hoàng Nam Dziền', phone: '0904447025', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },

  // ==================== KHOA PHỤ SẢN ====================
  { id: 'cust-166', code: 'ttoanh1', name: 'Trần thị oanh', phone: '0966195513', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },

  // ==================== PHÒNG TÀI CHÍNH KẾ TOÁN ====================
  { id: 'cust-167', code: 'bttha', name: 'Bùi Thị Thanh Hà', phone: '0963439895', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },
  { id: 'cust-168', code: 'huyenttt', name: 'Trần Thị Thu Huyền', phone: '0982651279', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },
  { id: 'cust-169', code: 'tthoa', name: 'Trương Thị Hoa', phone: '0358165089', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },
  { id: 'cust-170', code: 'vtyen', name: 'Vũ Thị Yến', phone: '0989527657', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },
  { id: 'cust-171', code: 'ptdung', name: 'Phạm Tuấn Dũng', phone: '0799248827', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },
  { id: 'cust-172', code: 'tienpt', name: 'Phạm Thị Tiến', phone: '0976558426', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },

  // ==================== KHOA CĐHA - TDCN ====================
  { id: 'cust-173', code: 'ntduong', name: 'Nguyễn Thị Dương', phone: '0328871053', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },

  // ==================== PHÒNG KHTH ====================
  { id: 'cust-174', code: 'ntninh3', name: 'Nguyễn Thị Ninh', phone: '', address: 'Phòng KHTH', debtAmount: 0, group: 'Phòng KHTH' },

  // ==================== PHÒNG TÀI CHÍNH KẾ TOÁN ====================
  { id: 'cust-175', code: 'htphuong', name: 'Hoàng Thị Phương', phone: '0988639655', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },

  // ==================== KHOA Y HỌC CỔ TRUYỀN ====================
  { id: 'cust-176', code: 'bttha1', name: 'Bùi Thị Thanh Hà', phone: '0329071272', address: 'Khoa Y học cổ truyền', debtAmount: 0, group: 'Khoa Y học cổ truyền' },

  // ==================== KHOA NGOẠI - PTGMHS ====================
  { id: 'cust-177', code: 'nhson', name: 'Nguyễn Hoàng Sơn', phone: '0362762001', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },

  // ==================== KHOA CẤP CỨU, HỒI SỨC TÍCH CỰC ====================
  { id: 'cust-178', code: 'ntmanh', name: 'Nguyễn Thị Minh Anh', phone: '0353788239', address: 'Khoa Cấp cứu, Hồi sức tích cực', debtAmount: 0, group: 'Khoa Cấp cứu, Hồi sức tích cực' },

  // ==================== KHOA CĐHA - TDCN ====================
  { id: 'cust-179', code: 'phuongnv', name: 'Nguyễn Văn Phương', phone: '0355777436', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },

  // ==================== KHOA PHỤ SẢN ====================
  { id: 'cust-180', code: 'ntha', name: 'Nguyễn Thị Hà', phone: '0397355939', address: 'Khoa Phụ Sản', debtAmount: 0, group: 'Khoa Phụ Sản' },

  // ==================== PHÒNG TÀI CHÍNH KẾ TOÁN ====================
  { id: 'cust-181', code: 'vdsao', name: 'Vũ Đức Sáo', phone: '0372168961', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },

  // ==================== KHOA NỘI ====================
  { id: 'cust-182', code: 'pthung', name: 'Phạm Tuấn Hưng', phone: '0989941363', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },

  // ==================== KHOA Y HỌC CỔ TRUYỀN ====================
  { id: 'cust-183', code: 'vinhnx', name: 'Nguyễn Xuân Vĩnh', phone: '0965646119', address: 'Khoa Y học cổ truyền', debtAmount: 0, group: 'Khoa Y học cổ truyền' },

  // ==================== KHOA NỘI ====================
  { id: 'cust-184', code: 'nhudtq', name: 'Đỗ Thị Quỳnh Như', phone: '0855341708', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },

  // ==================== KHOA NGOẠI - PTGMHS ====================
  { id: 'cust-185', code: 'manhdv', name: 'Đào Văn Mạnh', phone: '0365141953', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-186', code: 'duyenlm', name: 'Lương Minh Duyên', phone: '0388172857', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },

  // ==================== KHOA CĐHA - TDCN ====================
  { id: 'cust-187', code: 'diepnn', name: 'Nguyễn Ngọc Diệp', phone: '0356246055', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },

  // ==================== KHOA NGOẠI - PTGMHS ====================
  { id: 'cust-188', code: 'anhktk1', name: 'Kiều Thị Kim Anh', phone: '0373873335', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },

  // ==================== KHOA NỘI ====================
  { id: 'cust-189', code: 'thunt', name: 'Nguyễn Thị Thu', phone: '0983506013', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },

  // ==================== PHÒNG TÀI CHÍNH KẾ TOÁN ====================
  { id: 'cust-190', code: 'nhungnt1', name: 'Nguyễn Thị Nhung', phone: '0938053566', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },

  // ==================== KHOA NỘI ====================
  { id: 'cust-191', code: 'trinhttv', name: 'Trương Thị Việt Trinh', phone: '0968243080', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },
  { id: 'cust-192', code: 'nttrangxn2', name: 'Nguyễn Thị Trang', phone: '0344371186', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },

  // ==================== KHOA CĐHA - TDCN ====================
  { id: 'cust-193', code: 'pthoa', name: 'Phạm Thị Hoa', phone: '0981173838', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },

  // ==================== KHOA DƯỢC ====================
  { id: 'cust-194', code: 'hoangpd', name: 'Phạm Đức Hoàng', phone: '0358919978', address: 'Khoa Dược', debtAmount: 0, group: 'Khoa Dược' },

  // ==================== KHOA NGOẠI - PTGMHS ====================
  { id: 'cust-195', code: 'ngavt', name: 'Vũ Thi Nga', phone: '0977021124', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-196', code: 'anhnn', name: 'Nguyễn Ngọc Ánh', phone: '0823728270', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },

  // ==================== PHÒNG TÀI CHÍNH KẾ TOÁN ====================
  { id: 'cust-197', code: 'lanptn', name: 'Phạm Thị Ngọc Lan', phone: '0377270028', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },
  { id: 'cust-198', code: 'diepdt', name: 'Đinh Thị Điệp', phone: '0915476317', address: 'Phòng Tài chính Kế toán', debtAmount: 0, group: 'Phòng Tài chính Kế toán' },

  // ==================== KHOA LCK (MẮT - TMH - RHM) ====================
  { id: 'cust-199', code: 'ntyen1', name: 'Nguyễn Thị Yến', phone: '0383575344', address: 'Khoa LCK (Mắt - TMH - RHM)', debtAmount: 0, group: 'Khoa LCK (Mắt - TMH - RHM)' },

  // ==================== BAN GIÁM ĐỐC ====================
  { id: 'cust-200', code: 'trangnguyen', name: 'Nguyễn Thị Thu Trang', phone: '0983007969', address: 'Ban Giám đốc', debtAmount: 0, group: 'Ban Giám đốc' },

  // ==================== KHOA CĐHA - TDCN ====================
  { id: 'cust-201', code: 'trangpat', name: 'Phùng Ánh Thùy Trang', phone: '0347180818', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-202', code: 'anhph', name: 'Phạm Hoàng Anh', phone: '0961531829', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },
  { id: 'cust-203', code: 'huyenht', name: 'Nguyễn Thu Huyền', phone: '0383438564', address: 'Khoa CĐHA - TDCN', debtAmount: 0, group: 'Khoa CĐHA - TDCN' },

  // ==================== KHOA NỘI ====================
  { id: 'cust-204', code: 'chamntn', name: 'Nguyễn Thị Ngọc Châm', phone: '0386795358', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },

  // ==================== KHOA NGOẠI - PTGMHS ====================
  { id: 'cust-205', code: 'pdcong', name: 'Phạm Đức Công', phone: '0386350646', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },
  { id: 'cust-206', code: 'huongnt1', name: 'Ngô Thu Hương', phone: '0357533280', address: 'Khoa Ngoại - PTGMHS', debtAmount: 0, group: 'Khoa Ngoại - PTGMHS' },

  // ==================== KHOA NỘI ====================
  { id: 'cust-207', code: 'dtyen', name: 'Đào Thị Yến', phone: '0947641159', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },
  { id: 'cust-208', code: 'thult1', name: 'Lại Thị Thư', phone: '0348340945', address: 'Khoa Nội', debtAmount: 0, group: 'Khoa Nội' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    code: 'NCC-001',
    name: 'Tổng Kho Sản Xuất & Nhập Khẩu Mực In VMAX',
    contactPerson: 'Trần Văn Mạnh (Trưởng phòng KD)',
    phone: '028.3758.9999 - 0903.112.233',
    address: 'Khu Công Nghiệp Tân Bình, P. Tây Thạnh, Q. Tân Phú, TP. HCM',
    email: 'kinhdoanh@vmaxink.vn',
    taxCode: '0304568912',
    categories: 'Mực in Cartridge Canon, HP, Brother, Epson',
    debtPayable: 15600000,
  },
  {
    id: 'supp-2',
    code: 'NCC-002',
    name: 'Công Ty TNHH Thương Mại & Kỹ Thuật Mực In Á Châu',
    contactPerson: 'Nguyễn Thị Bích Ngọc',
    phone: '024.3869.4567 - 0918.445.566',
    address: 'Số 168 Đường Giải Phóng, Phương Liệt, Thanh Xuân, Hà Nội',
    email: 'vattu@achauink.com.vn',
    taxCode: '0105678923',
    categories: 'Hộp mực đổ, Mực nạp đa năng 140g, Mực chai Ricoh 1kg',
    debtPayable: 8400000,
  },
  {
    id: 'supp-3',
    code: 'NCC-003',
    name: 'Tổng Kho Vật Tư Linh Kiện Máy In Toàn Phát',
    contactPerson: 'Hoàng Quốc Việt',
    phone: '0936.889.922',
    address: 'Số 42 Ngõ 178 Thái Hà, Đống Đa, Hà Nội',
    email: 'toanphatprinters@gmail.com',
    taxCode: '0107890123',
    categories: 'Linh kiện máy in: Trống drum Mitsu, trục từ, gạt mực, bao lụa sấy, quả đào kéo giấy',
    debtPayable: 4200000,
  },
  {
    id: 'supp-4',
    code: 'NCC-004',
    name: 'Nhà Phân Phối Linh Kiện Vi Tính Vĩnh Xuân (SPC Computer)',
    contactPerson: 'Đặng Minh Châu',
    phone: '024.3943.9121',
    address: 'Số 9 ngõ 117 Thái Hà, Trung Liệt, Đống Đa, Hà Nội',
    email: 'contact@spc.com.vn',
    taxCode: '0101234567',
    categories: 'Linh kiện máy tính: RAM Kingston DDR4, SSD NVMe, Bộ phím chuột Logitech',
    debtPayable: 0,
  },
  {
    id: 'supp-5',
    code: 'NCC-005',
    name: 'Công Ty Phụ Kiện Công Nghệ & Dây Cáp Ugreen Việt Nam',
    contactPerson: 'Lê Thanh Bình',
    phone: '0979.556.677',
    address: 'Tầng 3 Tòa Nhà Simco, 28 Phạm Hùng, Mỹ Đình, Hà Nội',
    email: 'sales@ugreenvietnam.vn',
    taxCode: '0109988776',
    categories: 'Cáp máy in USB 2.0 chống nhiễu, cáp chuyển đổi, thiết bị mạng',
    debtPayable: 2150000,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. LK-BAC-2900 - Bạc lô ép 2900 - SL: 2
  {
    id: 'prod-it-01',
    sku: 'LK-BAC-2900',
    name: 'Bạc lô ép 2900',
    category: 'Linh kiện máy in máy tính',
    unit: 'Bộ',
    costPrice: 25000,
    sellingPrice: 50000,
    stockQuantity: 2,
    minStockAlert: 2,
    warehouseLocation: 'Kho IT - Kệ 01',
    compatibleModels: 'Canon LBP 2900, 3000',
    notes: 'Bạc lô ép chịu nhiệt cụm sấy Canon 2900 (Mã cũ: IT018.23)',
    updatedAt: '2026-11-01 08:00',
  },
  // 2. LK-DAU-HDMI - Đầu chuyển đổi HDMI số - SL: 33
  {
    id: 'prod-it-02',
    sku: 'LK-DAU-HDMI',
    name: 'Đầu chuyển đổi HDMI số',
    category: 'Linh kiện máy in máy tính',
    unit: 'Cái',
    costPrice: 45000,
    sellingPrice: 85000,
    stockQuantity: 33,
    minStockAlert: 5,
    warehouseLocation: 'Kho IT - Kệ 01',
    compatibleModels: 'PC, Laptop, Màn hình, Máy chiếu',
    notes: 'Đầu chuyển kỹ thuật số HDMI to VGA/DVI có âm thanh (Mã cũ: IT223.23)',
    updatedAt: '2026-11-01 08:00',
  },
  // 3. LK-DAU-SAY - Dầu sấy máy in - SL: 1
  {
    id: 'prod-it-03',
    sku: 'LK-DAU-SAY',
    name: 'Dầu sấy máy in',
    category: 'Linh kiện máy in máy tính',
    unit: 'Chai',
    costPrice: 35000,
    sellingPrice: 70000,
    stockQuantity: 1,
    minStockAlert: 2,
    warehouseLocation: 'Kho IT - Kệ 01',
    compatibleModels: 'Bao lụa máy in Canon, HP, Brother, Ricoh',
    notes: 'Dầu bôi trơn bao lụa sấy nhiệt độ cao - Sắp hết (Mã cũ: IT02.05)',
    updatedAt: '2026-11-01 08:00',
  },
  // 4. LK-USB-COM - Dây chuyển đổi USB sang cổng Com - SL: 1
  {
    id: 'prod-it-04',
    sku: 'LK-USB-COM',
    name: 'Dây chuyển đổi USB sang cổng Com',
    category: 'Linh kiện máy in máy tính',
    unit: 'Cái',
    costPrice: 65000,
    sellingPrice: 120000,
    stockQuantity: 1,
    minStockAlert: 2,
    warehouseLocation: 'Kho IT - Kệ 02',
    compatibleModels: 'Cổng RS232 COM DB9 đực',
    notes: 'Dùng kết nối máy in hóa đơn, máy CNC, thiết bị viễn thông (Mã cũ: IT168.23)',
    updatedAt: '2026-11-01 08:00',
  },
  // 5. LK-GAT-MUC - Gạt mực máy in - SL: 13
  {
    id: 'prod-it-05',
    sku: 'LK-GAT-MUC',
    name: 'Gạt mực máy in',
    category: 'Linh kiện máy in máy tính',
    unit: 'Chiếc',
    costPrice: 12000,
    sellingPrice: 30000,
    stockQuantity: 13,
    minStockAlert: 5,
    warehouseLocation: 'Kho IT - Kệ 02',
    compatibleModels: 'Hộp mực 12A, 303, 49A, 05A, 85A, 325, 328',
    notes: 'Gạt lớn thu hồi mực thải (Mã cũ: IT13.23)',
    updatedAt: '2026-11-01 08:00',
  },
  // 6. HM-136 - Hộp mực 136 - SL: 3
  {
    id: 'prod-it-06',
    sku: 'HM-136',
    name: 'Hộp mực 136',
    category: 'Mực in',
    unit: 'Hộp',
    costPrice: 180000,
    sellingPrice: 290000,
    stockQuantity: 3,
    minStockAlert: 2,
    warehouseLocation: 'Kho IT - Kệ M1',
    compatibleModels: 'HP LaserJet M211d, M211dw, MFP M236d, M236dw (HP W1360A)',
    notes: 'Cartridge nguyên hộp phôi chuẩn (Mã cũ: HH2)',
    updatedAt: '2026-11-01 08:00',
  },
  // 7. HM-325 - Hộp mực 325 - SL: 4
  {
    id: 'prod-it-07',
    sku: 'HM-325',
    name: 'Hộp mực 325',
    category: 'Mực in',
    unit: 'Hộp',
    costPrice: 175000,
    sellingPrice: 280000,
    stockQuantity: 4,
    minStockAlert: 3,
    warehouseLocation: 'Kho IT - Kệ M1',
    compatibleModels: 'Canon LBP 6000, 6030, 6030w, MF3010 / HP 85A (P1102)',
    notes: 'Hộp mực in laser Canon Cartridge 325 (Mã cũ: IT.325)',
    updatedAt: '2026-11-01 08:00',
  },
  // 8. HM-328 - Hộp mực 328 - SL: 5
  {
    id: 'prod-it-08',
    sku: 'HM-328',
    name: 'Hộp mực 328',
    category: 'Mực in',
    unit: 'Hộp',
    costPrice: 185000,
    sellingPrice: 300000,
    stockQuantity: 5,
    minStockAlert: 3,
    warehouseLocation: 'Kho IT - Kệ M1',
    compatibleModels: 'Canon MF4412, MF4420n, MF4450, MF4550d, MF4570dn, D520',
    notes: 'Hộp mực máy in đa năng Canon Cartridge 328 (Mã cũ: HH1)',
    updatedAt: '2026-11-01 08:00',
  },
  // 9. HM-057 - Hộp mực máy in 057 - SL: 11
  {
    id: 'prod-it-09',
    sku: 'HM-057',
    name: 'Hộp mực máy in 057',
    category: 'Mực in',
    unit: 'Hộp',
    costPrice: 240000,
    sellingPrice: 390000,
    stockQuantity: 11,
    minStockAlert: 3,
    warehouseLocation: 'Kho IT - Kệ M2',
    compatibleModels: 'Canon LBP 223dw, 226dw, MF445dw, MF449x (CRG-057) / HP 76A (CF276A)',
    notes: 'Hộp mực laser công suất 3.100 trang in (Mã cũ: IT24.23)',
    updatedAt: '2026-11-01 08:00',
  },
  // 10. HM-070 - Hộp mực máy in 070 (Hộp mực 070) - SL: 12
  {
    id: 'prod-it-10',
    sku: 'HM-070',
    name: 'Hộp mực máy in 070 (Hộp mực 070)',
    category: 'Mực in',
    unit: 'Hộp',
    costPrice: 250000,
    sellingPrice: 410000,
    stockQuantity: 12,
    minStockAlert: 3,
    warehouseLocation: 'Kho IT - Kệ M2',
    compatibleModels: 'Canon LBP 243dw, LBP 246dw, MF462dw, MF465dw (CRG-070)',
    notes: 'Hộp mực đời mới máy in Canon LBP 240 series (Mã cũ: IT23.23)',
    updatedAt: '2026-11-01 08:00',
  },
  // 11. HM-2900 - Hộp mực máy in 2900 (Hộp mực 12) - SL: 17
  {
    id: 'prod-it-11',
    sku: 'HM-2900',
    name: 'Hộp mực máy in 2900 (Hộp mực 12)',
    category: 'Mực in',
    unit: 'Hộp',
    costPrice: 165000,
    sellingPrice: 280000,
    stockQuantity: 17,
    minStockAlert: 5,
    warehouseLocation: 'Kho IT - Kệ M2',
    compatibleModels: 'Canon LBP 2900, 3000 / HP LaserJet 1020, 1010, 1018, 3050 (Cartridge 303/12A)',
    notes: 'Hộp mực phôi chuẩn có nắp đổ và lỗ xả mực thải (Mã cũ: IT24/23)',
    updatedAt: '2026-11-01 08:00',
  },
  // 12. LK-CUON-2900 - Lô cuốn giấy 2900 - SL: 3
  {
    id: 'prod-it-12',
    sku: 'LK-CUON-2900',
    name: 'Lô cuốn giấy 2900',
    category: 'Linh kiện máy in máy tính',
    unit: 'Chiếc',
    costPrice: 20000,
    sellingPrice: 45000,
    stockQuantity: 3,
    minStockAlert: 3,
    warehouseLocation: 'Kho IT - Kệ K3',
    compatibleModels: 'Canon LBP 2900, 3000 / HP 1020',
    notes: 'Quả đào kéo giấy Pick-up roller cao su bám (Mã cũ: IT023.23)',
    updatedAt: '2026-11-01 08:00',
  },
  // 13. LK-LO-EP - Lô ép máy in - SL: 6
  {
    id: 'prod-it-13',
    sku: 'LK-LO-EP',
    name: 'Lô ép máy in',
    category: 'Linh kiện máy in máy tính',
    unit: 'Chiếc',
    costPrice: 55000,
    sellingPrice: 110000,
    stockQuantity: 6,
    minStockAlert: 3,
    warehouseLocation: 'Kho IT - Kệ K3',
    compatibleModels: 'Cụm sấy máy in laser Canon, HP',
    notes: 'Trục cao su ép sấy chịu nhiệt cao (Mã cũ: IT006.01)',
    updatedAt: '2026-11-01 08:00',
  },
  // 14. LK-LO-SAY-2900 - Lô sấy máy in 2900 - SL: 8
  {
    id: 'prod-it-14',
    sku: 'LK-LO-SAY-2900',
    name: 'Lô sấy máy in 2900',
    category: 'Linh kiện máy in máy tính',
    unit: 'Chiếc',
    costPrice: 65000,
    sellingPrice: 130000,
    stockQuantity: 8,
    minStockAlert: 3,
    warehouseLocation: 'Kho IT - Kệ K3',
    compatibleModels: 'Canon LBP 2900, 3000 / HP 1020',
    notes: 'Bao lụa sấy / Lô sấy kim loại xám truyền nhiệt (Mã cũ: IT01.11)',
    updatedAt: '2026-11-01 08:00',
  },
  // 15. LK-MO-NHIET - Mỡ nhiệt loại 1 - SL: 2
  {
    id: 'prod-it-15',
    sku: 'LK-MO-NHIET',
    name: 'Mỡ nhiệt loại 1',
    category: 'Linh kiện máy in máy tính',
    unit: 'Lọ',
    costPrice: 30000,
    sellingPrice: 60000,
    stockQuantity: 2,
    minStockAlert: 2,
    warehouseLocation: 'Kho IT - Kệ K3',
    compatibleModels: 'Thanh nhiệt và bao lụa cụm sấy máy in',
    notes: 'Mỡ bôi trơn hàn nhiệt cao cấp (Mã cũ: IT01.05)',
    updatedAt: '2026-11-01 08:00',
  },
  // 16. MD-A850 - Mực Aficio A850 - SL: 6
  {
    id: 'prod-it-16',
    sku: 'MD-A850',
    name: 'Mực Aficio A850',
    category: 'Hộp mực đổ',
    unit: 'Túi',
    costPrice: 190000,
    sellingPrice: 320000,
    stockQuantity: 6,
    minStockAlert: 2,
    warehouseLocation: 'Kho IT - Kệ D1',
    compatibleModels: 'Máy photocopy Ricoh Aficio MP 1900, 2000, 2501, 2851, 3352...',
    notes: 'Mực đổ túi bạc 1.000g cho máy photo Ricoh (Mã cũ: IT.A850)',
    updatedAt: '2026-11-01 08:00',
  },
  // 17. MD-LASER - Mực đổ máy in - SL: 73
  {
    id: 'prod-it-17',
    sku: 'MD-LASER',
    name: 'Mực đổ máy in',
    category: 'Hộp mực đổ',
    unit: 'Lọ',
    costPrice: 22000,
    sellingPrice: 45000,
    stockQuantity: 73,
    minStockAlert: 20,
    warehouseLocation: 'Kho IT - Kệ D1',
    compatibleModels: 'Canon LBP 2900, 3300, 6030, HP 1020, 1102, 1005... (12A/49A/05A)',
    notes: 'Mực nạp đa năng 140g siêu mịn, từ tính cao, ít mực thải (Mã cũ: IT26.23)',
    updatedAt: '2026-11-01 08:00',
  },
  // 18. MD-L1210 - Mực Epson L1210 - SL: 0
  {
    id: 'prod-it-18',
    sku: 'MD-L1210',
    name: 'Mực Epson L1210',
    category: 'Hộp mực đổ',
    unit: 'Lọ',
    costPrice: 65000,
    sellingPrice: 120000,
    stockQuantity: 0,
    minStockAlert: 5,
    warehouseLocation: 'Kho IT - Kệ D2',
    compatibleModels: 'Epson L1210, L1250, L3210, L3250, L5290 (Mã mực 003)',
    notes: 'Hết hàng trong kho - Cần tạo phiếu nhập từ NCC (Mã cũ: IT.L1210)',
    updatedAt: '2026-11-01 08:00',
  },
  // 19. MD-L8050 - Mực Epson L8050 - SL: 4
  {
    id: 'prod-it-19',
    sku: 'MD-L8050',
    name: 'Mực Epson L8050',
    category: 'Hộp mực đổ',
    unit: 'Lọ',
    costPrice: 95000,
    sellingPrice: 170000,
    stockQuantity: 4,
    minStockAlert: 3,
    warehouseLocation: 'Kho IT - Kệ D2',
    compatibleModels: 'Epson L8050, L18050 in ảnh 6 màu (Mã mực 057)',
    notes: 'Mực nước in ảnh chính hãng 70ml (Mã cũ: IT.L8050)',
    updatedAt: '2026-11-01 08:00',
  },
];

export const INITIAL_ISSUE_ORDERS: StockIssueOrder[] = [
  {
    id: 'issue-001',
    code: 'PXK-202611-0001',
    date: '2026-11-01',
    customerId: 'cust-kb-01',
    customerName: 'Vũ Thị Thùy Dương - Khoa Khám bệnh',
    customerPhone: '0988.112.233',
    customerAddress: 'Khoa Khám bệnh - Bệnh Viện VPMED Hải Phòng',
    warehouseName: 'Kho IT',
    reason: 'Xuất hộp mực 12 và mực đổ phục vụ máy in phòng khám',
    createdBy: 'Nguyễn Văn Tuấn',
    receiverName: 'Vũ Thị Thùy Dương',
    items: [
      {
        id: 'item-001-1',
        productId: 'prod-it-11',
        sku: 'HM-2900',
        name: 'Hộp mực máy in 2900 (Hộp mực 12)',
        unit: 'Hộp',
        quantity: 3,
        unitPrice: 280000,
        discountPercent: 5,
        totalPrice: 798000,
        stockAvailableBefore: 20,
      },
      {
        id: 'item-001-2',
        productId: 'prod-it-17',
        sku: 'MD-LASER',
        name: 'Mực đổ máy in',
        unit: 'Lọ',
        quantity: 10,
        unitPrice: 45000,
        discountPercent: 0,
        totalPrice: 450000,
        stockAvailableBefore: 83,
      },
      {
        id: 'item-001-3',
        productId: 'prod-it-02',
        sku: 'LK-DAU-HDMI',
        name: 'Đầu chuyển đổi HDMI số',
        unit: 'Cái',
        quantity: 2,
        unitPrice: 85000,
        discountPercent: 0,
        totalPrice: 170000,
        stockAvailableBefore: 35,
      },
    ],
    totalQuantity: 15,
    subtotalAmount: 1460000,
    discountAmount: 42000,
    taxAmount: 0,
    finalAmount: 1418000,
    paymentStatus: 'Đã thanh toán',
    paidAmount: 1418000,
    status: 'Đã xuất kho',
    notes: 'Cấp phát vật tư mực in và đầu chuyển đổi cho Khoa Khám bệnh',
    createdAt: '2026-11-01 08:45',
  },
  {
    id: 'issue-002',
    code: 'PXK-202611-0002',
    date: '2026-11-02',
    customerId: 'cust-khth-01',
    customerName: 'Trương Thị Bên - Phòng KHTH',
    customerPhone: '0912.445.566',
    customerAddress: 'Phòng KHTH - Bệnh Viện VPMED Hải Phòng',
    warehouseName: 'Kho IT',
    reason: 'Xuất thay thế linh kiện lô sấy máy in 2900 và gạt mực định kỳ',
    createdBy: 'Phạm Minh Đức',
    receiverName: 'Trương Thị Bên',
    items: [
      {
        id: 'item-002-1',
        productId: 'prod-it-14',
        sku: 'LK-LO-SAY-2900',
        name: 'Lô sấy máy in 2900',
        unit: 'Chiếc',
        quantity: 2,
        unitPrice: 160000,
        discountPercent: 0,
        totalPrice: 320000,
        stockAvailableBefore: 10,
      },
      {
        id: 'item-002-2',
        productId: 'prod-it-05',
        sku: 'LK-GAT-MUC',
        name: 'Gạt mực máy in',
        unit: 'Chiếc',
        quantity: 4,
        unitPrice: 30000,
        discountPercent: 0,
        totalPrice: 120000,
        stockAvailableBefore: 17,
      },
      {
        id: 'item-002-3',
        productId: 'prod-it-01',
        sku: 'LK-BAC-2900',
        name: 'Bạc lô ép 2900',
        unit: 'Bộ',
        quantity: 1,
        unitPrice: 50000,
        discountPercent: 0,
        totalPrice: 50000,
        stockAvailableBefore: 3,
      },
    ],
    totalQuantity: 7,
    subtotalAmount: 490000,
    discountAmount: 0,
    taxAmount: 0,
    finalAmount: 490000,
    paymentStatus: 'Đã thanh toán',
    paidAmount: 490000,
    status: 'Đã xuất kho',
    notes: 'Bảo trì thay thế linh kiện máy in hồ sơ bệnh án KHTH',
    createdAt: '2026-11-02 10:15',
  },
  {
    id: 'issue-003',
    code: 'PXK-202611-0003',
    date: '2026-11-02',
    customerId: 'cust-cdha-01',
    customerName: 'Phan Xuân Thành - Khoa CĐHA',
    customerPhone: '0904.778.899',
    customerAddress: 'Khoa Chẩn Đoán Hình Ảnh - TDCN, BV VPMED',
    warehouseName: 'Kho IT',
    reason: 'Xuất mực đổ và phụ kiện máy in kết quả chẩn đoán hình ảnh',
    createdBy: 'Nguyễn Văn Tuấn',
    receiverName: 'Phan Xuân Thành',
    items: [
      {
        id: 'item-003-1',
        productId: 'prod-it-17',
        sku: 'MD-LASER',
        name: 'Mực đổ máy in',
        unit: 'Lọ',
        quantity: 20,
        unitPrice: 42000,
        discountPercent: 0,
        totalPrice: 840000,
        stockAvailableBefore: 103,
      },
      {
        id: 'item-003-2',
        productId: 'prod-it-12',
        sku: 'LK-CUON-2900',
        name: 'Lô cuốn giấy 2900',
        unit: 'Chiếc',
        quantity: 3,
        unitPrice: 45000,
        discountPercent: 0,
        totalPrice: 135000,
        stockAvailableBefore: 6,
      },
      {
        id: 'item-003-3',
        productId: 'prod-it-04',
        sku: 'LK-USB-COM',
        name: 'Dây chuyển đổi USB sang cổng Com',
        unit: 'Cái',
        quantity: 1,
        unitPrice: 120000,
        discountPercent: 0,
        totalPrice: 120000,
        stockAvailableBefore: 2,
      },
    ],
    totalQuantity: 24,
    subtotalAmount: 1095000,
    discountAmount: 0,
    taxAmount: 0,
    finalAmount: 1095000,
    paymentStatus: 'Đã thanh toán',
    paidAmount: 1095000,
    status: 'Đã xuất kho',
    notes: 'Cấp phát vật tư cho phòng in kết quả siêu âm & X-Quang',
    createdAt: '2026-11-02 15:30',
  },
  {
    id: 'issue-004',
    code: 'PXK-202611-0004',
    date: '2026-11-03',
    customerId: 'cust-cc-01',
    customerName: 'Phạm Thị Thư - Khoa Cấp cứu, HSTC',
    customerPhone: '0989.236.558',
    customerAddress: 'Khoa Cấp cứu, Hồi sức tích cực - BV VPMED Hải Phòng',
    warehouseName: 'Kho IT',
    reason: 'Xuất hộp mực in hồ sơ bệnh nhân cấp cứu và phiếu theo dõi chỉ số sinh tồn',
    createdBy: 'Nguyễn Văn Tuấn',
    receiverName: 'Phạm Thị Thư',
    items: [
      {
        id: 'item-004-1',
        productId: 'prod-it-11',
        sku: 'HM-2900',
        name: 'Hộp mực máy in 2900 (Hộp mực 12)',
        unit: 'Hộp',
        quantity: 2,
        unitPrice: 280000,
        discountPercent: 0,
        totalPrice: 560000,
        stockAvailableBefore: 17,
      },
      {
        id: 'item-004-2',
        productId: 'prod-it-17',
        sku: 'MD-LASER',
        name: 'Mực đổ máy in',
        unit: 'Lọ',
        quantity: 6,
        unitPrice: 45000,
        discountPercent: 0,
        totalPrice: 270000,
        stockAvailableBefore: 83,
      },
    ],
    totalQuantity: 8,
    subtotalAmount: 830000,
    discountAmount: 0,
    taxAmount: 0,
    finalAmount: 830000,
    paymentStatus: 'Đã thanh toán',
    paidAmount: 830000,
    status: 'Đã xuất kho',
    notes: 'Cấp phát phục vụ trực cấp cứu 24/7',
    createdAt: '2026-11-03 09:15',
  },
  {
    id: 'issue-005',
    code: 'PXK-202611-0005',
    date: '2026-11-03',
    customerId: 'cust-duoc-01',
    customerName: 'Phùng Thị Giữa - Khoa Dược',
    customerPhone: '0987.590.626',
    customerAddress: 'Khoa Dược Bệnh Viện VPMED Hải Phòng',
    warehouseName: 'Kho IT',
    reason: 'Cấp phát mực in tem nhãn thuốc và phiếu xuất dược nội trú',
    createdBy: 'Nguyễn Văn Tuấn',
    receiverName: 'Phùng Thị Giữa',
    items: [
      {
        id: 'item-005-1',
        productId: 'prod-it-11',
        sku: 'HM-2900',
        name: 'Hộp mực máy in 2900 (Hộp mực 12)',
        unit: 'Hộp',
        quantity: 1,
        unitPrice: 280000,
        discountPercent: 0,
        totalPrice: 280000,
        stockAvailableBefore: 15,
      },
      {
        id: 'item-005-2',
        productId: 'prod-it-17',
        sku: 'MD-LASER',
        name: 'Mực đổ máy in',
        unit: 'Lọ',
        quantity: 4,
        unitPrice: 45000,
        discountPercent: 0,
        totalPrice: 180000,
        stockAvailableBefore: 77,
      },
    ],
    totalQuantity: 5,
    subtotalAmount: 460000,
    discountAmount: 0,
    taxAmount: 0,
    finalAmount: 460000,
    paymentStatus: 'Đã thanh toán',
    paidAmount: 460000,
    status: 'Đã xuất kho',
    notes: 'In phiếu cấp phát thuốc nội trú và ngoại trú',
    createdAt: '2026-11-03 14:00',
  },
];

export const INITIAL_RECEIPT_ORDERS: StockReceiptOrder[] = [
  {
    id: 'rec-001',
    code: 'PNK-202610-0012',
    date: '2026-10-25',
    supplierName: 'Tổng Kho Sản Xuất & Nhập Khẩu Mực In VMAX',
    warehouseName: 'Kho IT',
    createdBy: 'Lê Hoàng Long',
    items: [
      { id: 'ri-1', productId: 'prod-it-11', sku: 'HM-2900', name: 'Hộp mực máy in 2900 (Hộp mực 12)', unit: 'Hộp', quantity: 20, unitCost: 155000, totalCost: 3100000 },
      { id: 'ri-2', productId: 'prod-it-17', sku: 'MD-LASER', name: 'Mực đổ máy in', unit: 'Lọ', quantity: 100, unitCost: 22000, totalCost: 2200000 },
    ],
    totalQuantity: 120,
    totalCost: 5300000,
    notes: 'Lô hàng nhập mới nguyên kiện bổ sung vào Kho IT',
    createdAt: '2026-10-25 10:00',
  },
  {
    id: 'rec-002',
    code: 'PNK-202611-0001',
    date: '2026-11-01',
    supplierName: 'Công Ty TNHH Thương Mại & Kỹ Thuật Mực In Á Châu',
    warehouseName: 'Kho IT',
    createdBy: 'Lê Hoàng Long',
    items: [
      { id: 'ri-3', productId: 'prod-it-14', sku: 'LK-LO-SAY-2900', name: 'Lô sấy máy in 2900', unit: 'Chiếc', quantity: 10, unitCost: 95000, totalCost: 950000 },
      { id: 'ri-4', productId: 'prod-it-13', sku: 'LK-LO-EP', name: 'Lô ép máy in', unit: 'Chiếc', quantity: 8, unitCost: 85000, totalCost: 680000 },
      { id: 'ri-5', productId: 'prod-it-01', sku: 'LK-BAC-2900', name: 'Bạc lô ép 2900', unit: 'Bộ', quantity: 5, unitCost: 28000, totalCost: 140000 },
    ],
    totalQuantity: 23,
    totalCost: 1770000,
    notes: 'Nhập bổ sung linh kiện máy in Canon 2900',
    createdAt: '2026-11-01 09:30',
  },
  {
    id: 'rec-003',
    code: 'PNK-202611-0002',
    date: '2026-11-02',
    supplierName: 'Tổng Kho Vật Tư Linh Kiện Máy In Toàn Phát',
    warehouseName: 'Kho IT',
    createdBy: 'Lê Hoàng Long',
    items: [
      { id: 'ri-6', productId: 'prod-it-02', sku: 'LK-DAU-HDMI', name: 'Đầu chuyển đổi HDMI số', unit: 'Cái', quantity: 40, unitCost: 48000, totalCost: 1920000 },
      { id: 'ri-7', productId: 'prod-it-04', sku: 'LK-USB-COM', name: 'Dây chuyển đổi USB sang cổng Com', unit: 'Cái', quantity: 5, unitCost: 65000, totalCost: 325000 },
      { id: 'ri-8', productId: 'prod-it-15', sku: 'LK-MO-NHIET', name: 'Mỡ nhiệt loại 1', unit: 'Lọ', quantity: 5, unitCost: 35000, totalCost: 175000 },
    ],
    totalQuantity: 50,
    totalCost: 2420000,
    notes: 'Nhập thiết bị chuyển đổi và phụ trợ máy tính văn phòng',
    createdAt: '2026-11-02 11:00',
  },
];

export const ROLE_PRESET_PERMISSIONS: Record<UserRole, { title: string; permissions: UserPermissions }> = {
  ADMIN: {
    title: 'Quản Trị Viên / Nhân viên IT',
    permissions: {
      canIssueStock: true,
      canEditIssueOrder: true,
      canReceiptStock: true,
      canAdjustStock: true,
      canDeleteVouchers: true,
      canApproveNegativeStock: true, // Quyền duyệt xuất âm ngoại lệ
      canManageProducts: true,
      canManageCustomers: true,
      canManageSuppliers: true,
      canViewReports: true,
      canViewHistory: true,
      canViewSystemLogs: true,
      canExportExcel: true,
      canManageUsers: true,
      canBackupRestore: true,
    },
  },
  STOREKEEPER: {
    title: 'Thủ Kho IT (Quản Lý Kho Hàng)',
    permissions: {
      canIssueStock: true,
      canEditIssueOrder: true,
      canReceiptStock: true,
      canAdjustStock: true,
      canDeleteVouchers: false,
      canApproveNegativeStock: false,
      canManageProducts: true,
      canManageCustomers: true,
      canManageSuppliers: true,
      canViewReports: true,
      canViewHistory: true,
      canViewSystemLogs: false,
      canExportExcel: true,
      canManageUsers: false,
      canBackupRestore: false,
    },
  },
  ACCOUNTANT: {
    title: 'Kế Toán Kho & Kiểm Soát Vật Tư',
    permissions: {
      canIssueStock: false,
      canEditIssueOrder: false,
      canReceiptStock: false,
      canAdjustStock: false,
      canDeleteVouchers: false,
      canApproveNegativeStock: false,
      canManageProducts: false,
      canManageCustomers: false,
      canManageSuppliers: false,
      canViewReports: true,
      canViewHistory: true,
      canViewSystemLogs: false,
      canExportExcel: true,
      canManageUsers: false,
      canBackupRestore: false,
    },
  },
  STAFF_VIEWER: {
    title: 'Cán Bộ Khoa Phòng (Chỉ Tra Cứu Tồn Kho)',
    permissions: {
      canIssueStock: false,
      canEditIssueOrder: false,
      canReceiptStock: false,
      canAdjustStock: false,
      canDeleteVouchers: false,
      canApproveNegativeStock: false,
      canManageProducts: false,
      canManageCustomers: false,
      canManageSuppliers: false,
      canViewReports: false,
      canViewHistory: false,
      canViewSystemLogs: false,
      canExportExcel: false,
      canManageUsers: false,
      canBackupRestore: false,
    },
  },
};

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'user-ituan',
    username: 'ituan',
    email: 'ituan@vpmed.vn',
    name: 'Nguyễn Tuấn',
    phone: '0982.558.699',
    department: 'Phòng Công Nghệ Thông Tin',
    role: 'ADMIN',
    roleTitle: 'Nhân viên IT',
    permissions: ROLE_PRESET_PERMISSIONS.ADMIN.permissions,
    isActive: true,
    password: '123',
    avatarColor: 'from-blue-600 to-indigo-700',
    notes: 'Tài khoản Quản trị viên Nhân viên IT Bệnh viện VPMED - Toàn quyền quản trị & phân quyền',
    lastLogin: '2026-11-02 08:30',
  },
  {
    id: 'user-thukho',
    username: 'thukho',
    email: 'thukho@vpmed.vn',
    name: 'Vũ Văn Khoa',
    phone: '0912.456.789',
    department: 'Phòng Công Nghệ Thông Tin',
    role: 'STOREKEEPER',
    roleTitle: 'Thủ Kho IT',
    permissions: ROLE_PRESET_PERMISSIONS.STOREKEEPER.permissions,
    isActive: true,
    password: '123',
    avatarColor: 'from-amber-500 to-orange-600',
    notes: 'Phụ trách trực tiếp xuất nhập kho vật tư máy in, linh kiện máy tính',
    lastLogin: '2026-11-02 08:15',
  },
  {
    id: 'user-ketoan',
    username: 'ketoan',
    email: 'ketoan@vpmed.vn',
    name: 'Trần Thị Mai',
    phone: '0934.567.890',
    department: 'Phòng Tài Chính - Kế Toán',
    role: 'ACCOUNTANT',
    roleTitle: 'Kế Toán Kho & Vật Tư',
    permissions: ROLE_PRESET_PERMISSIONS.ACCOUNTANT.permissions,
    isActive: true,
    password: '123',
    avatarColor: 'from-emerald-500 to-teal-700',
    notes: 'Kiểm soát báo cáo xuất nhập tồn, giá vốn và đối soát chi phí vật tư',
    lastLogin: '2026-11-01 16:40',
  },
  {
    id: 'user-khambenh',
    username: 'pthuyenkb',
    email: 'khambenh@vpmed.vn',
    name: 'Bs. Phan Thị Huyền',
    phone: '0978.654.321',
    department: 'Khoa Khám bệnh',
    role: 'STAFF_VIEWER',
    roleTitle: 'Đại Diện Khoa Khám Bệnh',
    permissions: ROLE_PRESET_PERMISSIONS.STAFF_VIEWER.permissions,
    isActive: true,
    password: '123',
    avatarColor: 'from-violet-500 to-purple-700',
    notes: 'Tra cứu tồn kho mực in, linh kiện máy tính cho khoa',
  },
];

// ==================== DANH SÁCH THIẾT BỊ GẮN 21 KHOA PHÒNG ====================
export const INITIAL_DEVICES: HospitalDevice[] = [
  {
    id: 'dev-001',
    code: 'TB-CANON-CC01',
    name: 'Máy in Canon LBP 2900 (Bàn Trực Cấp Cứu)',
    category: 'Máy in văn phòng',
    serialNumber: 'CN2900-CC-8891',
    macAddress: '00:1A:2B:CC:01:29',
    ipAddress: '192.168.1.101',
    department: 'Khoa Cấp cứu, Hồi sức tích cực',
    roomLocation: 'Bàn tiếp nhận & Phân loại bệnh nhân',
    assignedUser: 'Lê Xuân Hiếu',
    installedDate: '2025-03-15',
    status: 'Đang hoạt động',
    compatibleSupplies: ['MD-12A-140G', 'LK-DRUM-12A', 'LK-TRUC-TU-12A', 'LK-BAC-2900', 'LK-BAO-LUA-2900'],
    replacementHistory: [
      { date: '2026-10-15', supplyName: 'Hộp mực nạp 12A siêu mịn 140g', replacedBy: 'Nguyễn Tuấn', notes: 'Đổ mực định kỳ' },
      { date: '2026-09-02', supplyName: 'Trống in Drum 12A', replacedBy: 'Vũ Văn Khoa', notes: 'Thay trống do vệt sọc đen' },
    ],
  },
  {
    id: 'dev-002',
    code: 'TB-HP-KB02',
    name: 'Máy in HP LaserJet Pro M404dn (Phòng Khám Nội)',
    category: 'Máy in văn phòng',
    serialNumber: 'HP404-KB-5542',
    macAddress: '00:1A:2B:KB:02:40',
    ipAddress: '192.168.1.102',
    department: 'Khoa Khám bệnh',
    roomLocation: 'Phòng khám Nội số 102',
    assignedUser: 'Bs. Phan Thị Huyền',
    installedDate: '2025-06-10',
    status: 'Đang hoạt động',
    compatibleSupplies: ['MD-12A-140G', 'LK-DRUM-12A', 'LK-TRUC-SAC'],
    replacementHistory: [
      { date: '2026-10-28', supplyName: 'Hộp mực nạp 12A siêu mịn 140g', replacedBy: 'Nguyễn Tuấn', notes: 'Bơm mực lần 3' },
    ],
  },
  {
    id: 'dev-003',
    code: 'TB-CANON-3300-KHTH',
    name: 'Máy in Canon LBP 3300 Đảo Mặt (Phòng KHTH)',
    category: 'Máy in văn phòng',
    serialNumber: 'CN3300-KHTH-1234',
    macAddress: '00:1A:2B:KH:03:33',
    ipAddress: '192.168.1.103',
    department: 'Phòng KHTH',
    roomLocation: 'Bàn tổng hợp bệnh án',
    assignedUser: 'Đoàn Văn Khôi',
    installedDate: '2024-11-20',
    status: 'Đang hoạt động',
    compatibleSupplies: ['MD-12A-140G', 'LK-DRUM-12A', 'LK-BAO-LUA-2900'],
    replacementHistory: [
      { date: '2026-11-01', supplyName: 'Bạc lô ép 2900', replacedBy: 'Lê Hoàng Long', notes: 'Kẹt giấy đảo mặt' },
    ],
  },
  {
    id: 'dev-004',
    code: 'TB-BROTHER-TC04',
    name: 'Máy in Brother HL-L2321D (Phòng Kế Toán)',
    category: 'Máy in văn phòng',
    serialNumber: 'BR2321-TC-9911',
    macAddress: '00:1A:2B:TC:04:23',
    ipAddress: '192.168.1.104',
    department: 'Phòng Tài Chính - Kế Toán',
    roomLocation: 'Bàn thủ quỹ & Viện phí',
    assignedUser: 'Trần Thị Mai',
    installedDate: '2025-01-15',
    status: 'Cần thay mực',
    compatibleSupplies: ['MD-12A-140G', 'LK-DRUM-12A'],
    replacementHistory: [],
  },
  {
    id: 'dev-005',
    code: 'TB-DELL-NG01',
    name: 'Máy tính để bàn Dell Optiplex 7070 (Phòng Mổ Số 1)',
    category: 'Máy tính để bàn',
    serialNumber: 'DELL-OPT-7070-NG01',
    macAddress: '00:1A:2B:99:88:77',
    ipAddress: '192.168.1.150',
    department: 'Khoa Ngoại - PTGMHS',
    roomLocation: 'Phòng phẫu thuật số 1',
    assignedUser: 'Đoàn Tuấn Thành',
    installedDate: '2024-08-01',
    status: 'Đang hoạt động',
    compatibleSupplies: ['LK-DAU-HDMI', 'LK-USB-COM', 'LK-NGUON-S80', 'LK-MO-NHIET'],
    replacementHistory: [
      { date: '2026-08-10', supplyName: 'Đầu chuyển đổi HDMI số sang VGA', replacedBy: 'Nguyễn Tuấn', notes: 'Kết nối màn hình mổ nội soi' },
    ],
  },
  {
    id: 'dev-006',
    code: 'TB-SONY-XN01',
    name: 'Máy in nhiệt siêu âm Sony UP-X898MD (Khoa CĐHA)',
    category: 'Máy in nhiệt / Siêu âm',
    serialNumber: 'SONY-X898-CD01',
    department: 'Khoa Chẩn đoán hình ảnh',
    roomLocation: 'Phòng siêu âm màu 4D số 3',
    assignedUser: 'Trương Trọng Phương',
    installedDate: '2025-02-12',
    status: 'Đang hoạt động',
    compatibleSupplies: ['MI-CANON-303'],
    replacementHistory: [],
  },
  {
    id: 'dev-007',
    code: 'TB-CANON-DUOC01',
    name: 'Máy in hóa đơn xuất nhập kho thuốc (Khoa Dược)',
    category: 'Máy in văn phòng',
    serialNumber: 'CN2900-DUOC-7712',
    macAddress: '00:1A:2B:DU:01:29',
    ipAddress: '192.168.1.106',
    department: 'Khoa Dược',
    roomLocation: 'Quầy cấp phát thuốc BHYT',
    assignedUser: 'Phạm Văn Dược',
    installedDate: '2025-04-18',
    status: 'Đang hoạt động',
    compatibleSupplies: ['MD-12A-140G', 'LK-DRUM-12A', 'LK-BAC-2900'],
    replacementHistory: [],
  },
];

// ==================== PHIẾU KIỂM KÊ KHO MẪU (STOCKTAKE) ====================
export const INITIAL_AUDIT_ORDERS: StockAuditOrder[] = [
  {
    id: 'audit-001',
    code: 'KK-20261031-001',
    auditDate: '2026-10-31',
    auditorName: 'Nguyễn Tuấn',
    witnessName: 'Vũ Văn Khoa (Thủ Kho)',
    totalSystemStock: 215,
    totalActualStock: 215,
    totalDiffQuantity: 0,
    totalDiffValue: 0,
    status: 'Đã cân bằng kho',
    balancedAt: '2026-10-31 17:30',
    notes: 'Kiểm kê định kỳ tháng 10/2026 - Tồn thực tế khớp 100% với phần mềm',
    createdAt: '2026-10-31 16:00',
    items: [
      { productId: 'prod-it-01', sku: 'LK-BAC-2900', name: 'Bạc lô ép 2900', unit: 'Chiếc', systemStock: 1, actualStock: 1, difference: 0, costPrice: 35000, diffValue: 0 },
      { productId: 'prod-it-02', sku: 'LK-BAO-LUA-2900', name: 'Bao lụa 2900', unit: 'Chiếc', systemStock: 2, actualStock: 2, difference: 0, costPrice: 45000, diffValue: 0 },
      { productId: 'prod-it-06', sku: 'MD-12A-140G', name: 'Hộp mực nạp 12A siêu mịn 140g', unit: 'Chai', systemStock: 28, actualStock: 28, difference: 0, costPrice: 42000, diffValue: 0 },
      { productId: 'prod-it-08', sku: 'LK-DRUM-12A', name: 'Trống in Drum 12A phấn', unit: 'Cây', systemStock: 12, actualStock: 12, difference: 0, costPrice: 45000, diffValue: 0 },
    ],
  },
];

// ==================== PHIẾU YÊU CẦU CẤP PHÁT ONLINE MẪU ====================
export const INITIAL_APPROVAL_REQUESTS: IssueApprovalRequest[] = [
  {
    id: 'req-001',
    code: 'YCCP-20261106-001',
    requestDate: '2026-11-06',
    department: 'Khoa Cấp cứu, Hồi sức tích cực',
    requestedBy: 'Lê Xuân Hiếu',
    phone: '0978732733',
    deviceId: 'dev-001',
    deviceName: 'Máy in Canon LBP 2900 (Bàn Trực Cấp Cứu)',
    deviceSerial: 'CN2900-CC-8891',
    urgency: 'Cấp bách (Cấp cứu/Phòng mổ)',
    status: 'CHO_DUYET',
    reviewNotes: '',
    items: [
      { productId: 'prod-it-06', sku: 'MD-12A-140G', name: 'Hộp mực nạp 12A siêu mịn 140g', unit: 'Chai', quantity: 2, notes: 'Máy hết mực mờ không in được kết quả xét nghiệm cấp cứu' },
      { productId: 'prod-it-08', sku: 'LK-DRUM-12A', name: 'Trống in Drum 12A phấn', unit: 'Cây', quantity: 1, notes: 'Trống bị xước' },
    ],
    createdAt: '2026-11-06 08:15',
  },
  {
    id: 'req-002',
    code: 'YCCP-20261105-002',
    requestDate: '2026-11-05',
    department: 'Khoa Khám bệnh',
    requestedBy: 'Bs. Phan Thị Huyền',
    phone: '0978654321',
    deviceId: 'dev-002',
    deviceName: 'Máy in HP LaserJet Pro M404dn (Phòng Khám Nội)',
    deviceSerial: 'HP404-KB-5542',
    urgency: 'Thường',
    status: 'DA_DUYET',
    reviewedBy: 'Nguyễn Tuấn',
    reviewedAt: '2026-11-05 14:00',
    reviewNotes: 'Đã duyệt cấp phát 1 chai mực nạp phục vụ in đơn thuốc',
    items: [
      { productId: 'prod-it-06', sku: 'MD-12A-140G', name: 'Hộp mực nạp 12A siêu mịn 140g', unit: 'Chai', quantity: 1, notes: 'In đơn thuốc cho bệnh nhân ngoại trú' },
    ],
    createdAt: '2026-11-05 09:30',
  },
];

// ==================== THEO DÕI BẢO HÀNH & ĐỔI TRẢ NCC MẪU ====================
export const INITIAL_WARRANTIES: WarrantyItem[] = [
  {
    id: 'war-001',
    serialNumber: 'BH-LK-HDMI-9921',
    productId: 'prod-it-03',
    productName: 'Đầu chuyển đổi HDMI số sang VGA kèm Audio',
    sku: 'LK-DAU-HDMI',
    supplierId: 'supp-01',
    supplierName: 'Tổng Kho Phân Phối Mực In & Linh Kiện Hà Nội',
    departmentUsed: 'Khoa Ngoại - PTGMHS (Phòng mổ 1)',
    warrantyMonths: 12,
    startDate: '2026-05-10',
    endDate: '2027-05-10',
    status: 'CON_BAO_HANH',
    notes: 'Bảo hành 1 đổi 1 trong 12 tháng nếu không lên hình',
  },
  {
    id: 'war-002',
    serialNumber: 'BH-NGUON-80S-4412',
    productId: 'prod-it-10',
    productName: 'Nguồn máy in nhiệt K80',
    sku: 'LK-NGUON-S80',
    supplierId: 'supp-02',
    supplierName: 'Linh Kiện Máy In & Máy Tính Hải Phòng Vina',
    departmentUsed: 'Khoa Khám bệnh (Quầy tiếp đón)',
    warrantyMonths: 6,
    startDate: '2026-06-01',
    endDate: '2026-12-01',
    status: 'DANG_DOI_TRA_NCC',
    notes: 'Nguồn chập chờn điện, đã gửi nhà cung cấp đổi bộ mới',
    returnHistory: [
      {
        returnDate: '2026-11-02',
        reason: 'Nguồn sụt áp, máy in nhiệt chập chờn khi in phiếu số thứ tự',
        supplierResponse: 'NCC Hải Phòng Vina đã nhận kiểm tra, cam kết đổi mới trong 3 ngày',
        status: 'Chờ NCC đổi mới',
      },
    ],
  },
  {
    id: 'war-003',
    serialNumber: 'BH-DRUM-12A-1102',
    productId: 'prod-it-08',
    productName: 'Trống in Drum 12A phấn',
    sku: 'LK-DRUM-12A',
    supplierId: 'supp-01',
    supplierName: 'Tổng Kho Phân Phối Mực In & Linh Kiện Hà Nội',
    departmentUsed: 'Khoa Cấp cứu',
    warrantyMonths: 3,
    startDate: '2026-09-01',
    endDate: '2026-12-01',
    status: 'CON_BAO_HANH',
    notes: 'Trống in cam kết in 3 lần nạp mực',
  },
];

