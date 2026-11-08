import XLSX from 'xlsx-js-style';

export interface ReportSummaryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  openingStock: number;
  totalIn: number;
  totalOut: number;
  closingStock: number;
  totalInValue: number;
  totalOutValue: number;
  stockValue: number;
  currentStock: number;
  warehouseLocation?: string;
}

export interface ReportTransactionItem {
  date: string;
  code: string;
  type: 'Nhập kho' | 'Xuất kho';
  partner: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string;
}

export interface DepartmentSummaryItem {
  departmentName: string;
  departmentGroup?: string;
  orderCount: number;
  totalQuantity: number;
  totalAmount: number;
  percentage?: string;
  receiverNames?: string;
  items?: {
    sku: string;
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

export interface DepartmentDetailItem {
  date: string;
  orderCode: string;
  departmentName: string;
  departmentGroup?: string;
  receiverName?: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  reason?: string;
}

export interface SupplierSummaryItem {
  supplierName: string;
  contactPerson?: string;
  phone?: string;
  receiptCount: number;
  totalQuantity: number;
  totalAmount: number;
  percentage?: string;
  items?: {
    sku: string;
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

export interface SupplierDetailItem {
  date: string;
  receiptCode: string;
  supplierName: string;
  contactPerson?: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface ExportWarehouseReportOptions {
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyTaxCode?: string;
  warehouseName?: string;
  selectedPartner: string;
  fromDate: string;
  toDate: string;
  periodLabel: string;
  summaryRows: ReportSummaryItem[];
  detailRows: ReportTransactionItem[];
  departmentRows?: DepartmentSummaryItem[];
  departmentDetailRows?: DepartmentDetailItem[];
  supplierRows?: SupplierSummaryItem[];
  supplierDetailRows?: SupplierDetailItem[];
  totalAggregates: {
    opening?: number;
    openingValue?: number;
    in: number;
    out: number;
    closing?: number;
    inValue: number;
    outValue: number;
    value: number;
  };
}

export type MonthlySummaryItem = ReportSummaryItem;
export type MonthlyTransactionItem = ReportTransactionItem;

// ==============================================================
// STYLING CONSTANTS & BORDER DEFINITIONS (KHUNG VIỀN ĐẦY ĐỦ)
// ==============================================================
const FONT_NAME = 'Arial';

// Border styles
const BORDER_THIN = { style: 'thin', color: { rgb: '94A3B8' } }; // slate-400 clean gridlines
const BORDER_MEDIUM = { style: 'medium', color: { rgb: '334155' } }; // slate-700 header outline
const BORDER_DOUBLE = { style: 'double', color: { rgb: '0F172A' } }; // double bottom total border

// Full 4-sided borders
export const BORDER_FULL_THIN = {
  top: BORDER_THIN,
  bottom: BORDER_THIN,
  left: BORDER_THIN,
  right: BORDER_THIN,
};

export const BORDER_HEADER = {
  top: BORDER_MEDIUM,
  bottom: BORDER_MEDIUM,
  left: BORDER_THIN,
  right: BORDER_THIN,
};

export const BORDER_TOTAL = {
  top: BORDER_THIN,
  bottom: BORDER_DOUBLE,
  left: BORDER_THIN,
  right: BORDER_THIN,
};

/**
 * Ensures all cells within [startRow, endRow] x [startCol, endCol] have complete borders,
 * appropriate font, alignment, and number formatting.
 */
function applyTableGridStyles(
  ws: XLSX.WorkSheet,
  startRow: number, // 0-indexed
  endRow: number,   // 0-indexed inclusive
  startCol: number, // 0-indexed
  endCol: number,   // 0-indexed inclusive
  isHeaderRow: (r: number) => boolean,
  isTotalRow: (r: number) => boolean,
  getColumnAlign: (c: number) => 'left' | 'center' | 'right',
  isNumberCol: (c: number) => boolean,
  customHeaderFills?: { [col: number]: string }
): void {
  for (let r = startRow; r <= endRow; r++) {
    const isHdr = isHeaderRow(r);
    const isTot = isTotalRow(r);

    for (let c = startCol; c <= endCol; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (!ws[cellRef]) {
        ws[cellRef] = { t: 's', v: '' };
      }
      const cell = ws[cellRef];

      if (isHdr) {
        // Table header cell
        const customBg = customHeaderFills ? customHeaderFills[c] : undefined;
        cell.s = {
          font: {
            name: FONT_NAME,
            sz: 10,
            bold: true,
            color: customBg ? { rgb: '0F172A' } : { rgb: 'FFFFFF' },
          },
          fill: {
            fgColor: { rgb: customBg || '1F4E79' }, // Navy blue or pillar tint
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true,
          },
          border: BORDER_HEADER,
        };
      } else if (isTot) {
        // Grand Total row cell
        cell.s = {
          font: {
            name: FONT_NAME,
            sz: 10.5,
            bold: true,
            color: { rgb: '0F172A' },
          },
          fill: {
            fgColor: { rgb: 'D9E1F2' }, // Corporate soft blue fill
          },
          alignment: {
            horizontal: c === 0 ? 'center' : getColumnAlign(c),
            vertical: 'center',
          },
          border: BORDER_TOTAL,
          numFmt: isNumberCol(c) ? '#,##0' : undefined,
        };
        if (isNumberCol(c) && typeof cell.v === 'number') {
          cell.z = '#,##0';
        }
      } else {
        // Normal data cell - FULL 4-SIDED THIN BORDERS
        const isOddRow = r % 2 === 1;
        const align = getColumnAlign(c);
        const isNum = isNumberCol(c);

        cell.s = {
          font: {
            name: FONT_NAME,
            sz: 9.5,
            bold: c === 1 || (isNum && typeof cell.v === 'number' && cell.v !== 0 && c >= 12), // Bold SKU and Closing stock
            color: { rgb: '1E293B' },
          },
          fill: isOddRow ? { fgColor: { rgb: 'F8FAFC' } } : undefined, // subtle zebra row
          alignment: {
            horizontal: align,
            vertical: 'center',
            wrapText: c === 2, // wrap long item names
          },
          border: BORDER_FULL_THIN, // Khung viền 4 cạnh đầy đủ
          numFmt: isNum ? '#,##0' : undefined,
        };
        if (isNum && typeof cell.v === 'number') {
          cell.z = '#,##0';
        }
      }
    }
  }

  // Ensure gridlines are displayed in Excel/Sheets viewer
  ws['!views'] = [{ showGridLines: true }];
}

function sanitizeFilenamePart(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 30);
}

function formatDateDisplay(dStr: string): string {
  if (!dStr) return '';
  const parts = dStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dStr;
}

/**
 * Style the top header block (Company info & document title)
 */
function styleHeaderBlock(
  ws: XLSX.WorkSheet,
  titleText: string,
  subTitleText: string,
  timeText: string,
  noteText: string,
  lastCol: number
): void {
  // Row 0: Company Name
  const c0 = ws['A1'] || { t: 's', v: '' };
  c0.s = {
    font: { name: FONT_NAME, sz: 12, bold: true, color: { rgb: '1F4E79' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  };
  ws['A1'] = c0;

  // Row 1: Address
  const c1 = ws['A2'] || { t: 's', v: '' };
  c1.s = {
    font: { name: FONT_NAME, sz: 9.5, italic: true, color: { rgb: '475569' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  };
  ws['A2'] = c1;

  // Row 2: Tax & Phone
  const c2 = ws['A3'] || { t: 's', v: '' };
  c2.s = {
    font: { name: FONT_NAME, sz: 9.5, italic: true, color: { rgb: '475569' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  };
  ws['A3'] = c2;

  // Row 4: Main Document Title (Bold 15pt, Navy, Centered)
  const c4 = ws['A5'] || { t: 's', v: titleText };
  c4.s = {
    font: { name: FONT_NAME, sz: 15, bold: true, color: { rgb: '1F4E79' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };
  ws['A5'] = c4;

  // Row 5: Subtitle (Partner / Scope)
  const c5 = ws['A6'] || { t: 's', v: subTitleText };
  c5.s = {
    font: { name: FONT_NAME, sz: 10.5, bold: true, color: { rgb: '0F172A' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };
  ws['A6'] = c5;

  // Row 6: Time period
  const c6 = ws['A7'] || { t: 's', v: timeText };
  c6.s = {
    font: { name: FONT_NAME, sz: 10, italic: true, color: { rgb: '334155' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };
  ws['A7'] = c6;

  // Row 7: Notes & Currency
  const c7 = ws['A8'] || { t: 's', v: noteText };
  c7.s = {
    font: { name: FONT_NAME, sz: 9, italic: true, color: { rgb: '64748B' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };
  ws['A8'] = c7;

  // Merge title rows across the table width
  const merges = ws['!merges'] || [];
  merges.push(
    { s: { r: 4, c: 0 }, e: { r: 4, c: lastCol } },
    { s: { r: 5, c: 0 }, e: { r: 5, c: lastCol } },
    { s: { r: 6, c: 0 }, e: { r: 6, c: lastCol } },
    { s: { r: 7, c: 0 }, e: { r: 7, c: lastCol } }
  );
  ws['!merges'] = merges;
}

/**
 * Adds and styles the 4-signature block at the bottom of a worksheet
 */
function appendSignatureBlock(
  ws: XLSX.WorkSheet,
  startRow: number,
  lastCol: number
): void {
  // Row: Date
  const dateCellRef = XLSX.utils.encode_cell({ r: startRow, c: Math.max(0, lastCol - 3) });
  ws[dateCellRef] = {
    t: 's',
    v: `Hải Phòng, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`,
    s: {
      font: { name: FONT_NAME, sz: 10, italic: true, color: { rgb: '334155' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
  };

  // 4 Signatures columns
  const roles = [
    { title: 'Người Lập Biểu', name: '(Nguyễn Văn Tuấn)', col: 1 },
    { title: 'Thủ Kho IT', name: '(Nguyễn Văn Tuấn)', col: Math.floor(lastCol * 0.35) },
    { title: 'Kế Toán Kho & Vật Tư', name: '(Trần Thị Mai)', col: Math.floor(lastCol * 0.65) },
    { title: 'Giám Đốc Bệnh Viện', name: '(Lãnh Đạo Phê Duyệt)', col: Math.max(lastCol - 2, 2) },
  ];

  roles.forEach((r) => {
    const roleRef = XLSX.utils.encode_cell({ r: startRow + 1, c: r.col });
    ws[roleRef] = {
      t: 's',
      v: r.title,
      s: {
        font: { name: FONT_NAME, sz: 10.5, bold: true, color: { rgb: '0F172A' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      },
    };

    const signRef = XLSX.utils.encode_cell({ r: startRow + 2, c: r.col });
    ws[signRef] = {
      t: 's',
      v: '(Ký, ghi rõ họ tên)',
      s: {
        font: { name: FONT_NAME, sz: 9, italic: true, color: { rgb: '64748B' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      },
    };

    const nameRef = XLSX.utils.encode_cell({ r: startRow + 5, c: r.col });
    ws[nameRef] = {
      t: 's',
      v: r.name,
      s: {
        font: { name: FONT_NAME, sz: 10, bold: true, color: { rgb: '1E293B' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      },
    };
  });
}

/**
 * MAIN EXPORT FUNCTION:
 * Generates an executive, fully bordered Excel workbook with complete framing:
 * Sheet 1: Tong_Hop_Xuat_Nhap_Ton (4 trụ cột Tồn Đầu, Nhập, Xuất, Tồn Cuối)
 * Sheet 2: Chi_Tiet_Xuat_Nhap_Ton (Sổ Chi Tiết Xuất Nhập Tồn Từng Dòng Hàng & Lô Phát Sinh)
 * Sheet 3: Xuat_Khoa_Phong (Thống kê xuất cấp phát cho Khoa / Phòng)
 * Sheet 4: Nhap_Nha_Cung_Cap (Thống kê nhập từ các Nhà Cung Cấp)
 */
export function exportWarehouseReportToExcel(options: ExportWarehouseReportOptions): void {
  const {
    companyName,
    companyAddress = 'Số 1 Tô Ngọc Vân, Phường Tân Hưng, Thành phố Hải Phòng',
    companyPhone = '024.3855.9966 - 0982.558.699',
    companyTaxCode = '0108967822',
    warehouseName = 'Kho IT - Thiết Bị Tin Học & Mực In',
    selectedPartner,
    fromDate,
    toDate,
    periodLabel,
    summaryRows,
    detailRows,
    departmentRows = [],
    departmentDetailRows = [],
    supplierRows = [],
    supplierDetailRows = [],
    totalAggregates,
  } = options;

  const wb = XLSX.utils.book_new();
  const formattedFrom = formatDateDisplay(fromDate);
  const formattedTo = formatDateDisplay(toDate);
  const isSpecificPartner = selectedPartner && selectedPartner !== 'ALL' && selectedPartner !== 'Tất cả đơn vị';
  const partnerDisplay = isSpecificPartner ? selectedPartner : 'Tất cả đơn vị (Toàn bộ đối tác & khoa phòng)';

  // ==============================================================
  // SHEET 1: BẢNG TỔNG HỢP NHẬP - XUẤT - TỒN (4 TRỤ CỘT)
  // ==============================================================
  const ws1Data: (string | number | null | undefined)[][] = [
    [companyName.toUpperCase()],
    [`Địa chỉ: ${companyAddress}`],
    [`Điện thoại: ${companyPhone} | Mã số thuế: ${companyTaxCode}`],
    [],
    [isSpecificPartner ? 'BÁO CÁO NHẬP - XUẤT KHO CHO ĐƠN VỊ' : 'BẢNG TỔNG HỢP NHẬP - XUẤT - TỒN KHO HÀNG HÓA VẬT TƯ IT'],
    [`Đơn vị / Đối tác: ${partnerDisplay}`],
    [`Thời gian báo cáo: Từ ngày ${formattedFrom} đến ngày ${formattedTo} (${periodLabel})`],
    [`Kho Hàng: ${warehouseName} | Ngày lập: ${new Date().toLocaleDateString('vi-VN')} | Đơn vị tính: VNĐ`],
    [],
    // Row 9: Level 1 Table Header
    [
      'STT',
      'Mã Hàng',
      'Tên Hàng Hóa / Quy Cách',
      'Nhóm Hàng',
      'ĐVT',
      'Đơn Giá Vốn (đ)',
      'TỒN ĐẦU KỲ',
      '',
      'NHẬP TRONG KỲ',
      '',
      'XUẤT TRONG KỲ',
      '',
      'TỒN CUỐI KỲ',
      '',
      'Vị Trí Kệ Kho',
    ],
    // Row 10: Level 2 Sub-Headers
    [
      '',
      '',
      '',
      '',
      '',
      '',
      'Số Lượng',
      'Thành Tiền (đ)',
      'Số Lượng',
      'Thành Tiền (đ)',
      'Số Lượng',
      'Thành Tiền (đ)',
      'Số Lượng',
      'Giá Trị Tồn (đ)',
      '',
    ],
    // Data rows
    ...summaryRows.map((r, i) => {
      const openQty = r.openingStock ?? r.currentStock;
      const openVal = openQty * r.costPrice;
      const closeQty = r.closingStock ?? r.currentStock;
      const closeVal = r.stockValue || closeQty * r.costPrice;

      return [
        i + 1,
        r.sku,
        r.name,
        r.category,
        r.unit,
        r.costPrice,
        isSpecificPartner ? r.currentStock : openQty,
        isSpecificPartner ? r.currentStock * r.costPrice : openVal,
        r.totalIn,
        r.totalInValue,
        r.totalOut,
        r.totalOutValue,
        isSpecificPartner ? r.totalOut - r.totalIn : closeQty,
        closeVal,
        r.warehouseLocation || 'Kho IT',
      ];
    }),
    // Total Row
    [
      'TỔNG CỘNG',
      '',
      '',
      '',
      '',
      '',
      isSpecificPartner
        ? summaryRows.reduce((s, r) => s + r.currentStock, 0)
        : (totalAggregates.opening ?? summaryRows.reduce((s, r) => s + (r.openingStock ?? r.currentStock), 0)),
      summaryRows.reduce(
        (s, r) => s + (isSpecificPartner ? r.currentStock * r.costPrice : (r.openingStock ?? r.currentStock) * r.costPrice),
        0
      ),
      totalAggregates.in,
      totalAggregates.inValue,
      totalAggregates.out,
      totalAggregates.outValue,
      isSpecificPartner ? totalAggregates.out - totalAggregates.in : (totalAggregates.closing ?? 0),
      totalAggregates.value,
      '',
    ],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);

  // Set column widths
  ws1['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Mã Hàng
    { wch: 38 }, // Tên Hàng
    { wch: 22 }, // Nhóm Hàng
    { wch: 8 },  // ĐVT
    { wch: 15 }, // Giá vốn
    { wch: 15 }, // Tồn đầu (SL)
    { wch: 20 }, // Tồn đầu (Tiền)
    { wch: 15 }, // SL Nhập
    { wch: 20 }, // Tiền Nhập
    { wch: 15 }, // SL Xuất
    { wch: 20 }, // Tiền Xuất
    { wch: 16 }, // Tồn Cuối (SL)
    { wch: 22 }, // Giá trị tồn cuối
    { wch: 16 }, // Vị trí
  ];

  // Header merges for 2-level headers in Sheet 1
  const ws1Merges = [
    { s: { r: 9, c: 0 }, e: { r: 10, c: 0 } },  // STT
    { s: { r: 9, c: 1 }, e: { r: 10, c: 1 } },  // Mã Hàng
    { s: { r: 9, c: 2 }, e: { r: 10, c: 2 } },  // Tên Hàng
    { s: { r: 9, c: 3 }, e: { r: 10, c: 3 } },  // Nhóm Hàng
    { s: { r: 9, c: 4 }, e: { r: 10, c: 4 } },  // ĐVT
    { s: { r: 9, c: 5 }, e: { r: 10, c: 5 } },  // Đơn Giá Vốn
    { s: { r: 9, c: 6 }, e: { r: 9, c: 7 } },   // TỒN ĐẦU KỲ
    { s: { r: 9, c: 8 }, e: { r: 9, c: 9 } },   // NHẬP TRONG KỲ
    { s: { r: 9, c: 10 }, e: { r: 9, c: 11 } }, // XUẤT TRONG KỲ
    { s: { r: 9, c: 12 }, e: { r: 9, c: 13 } }, // TỒN CUỐI KỲ
    { s: { r: 9, c: 14 }, e: { r: 10, c: 14 } }, // Vị Trí
  ];
  ws1['!merges'] = ws1Merges;

  // Style header block
  styleHeaderBlock(
    ws1,
    isSpecificPartner ? 'BÁO CÁO NHẬP - XUẤT KHO CHO ĐƠN VỊ' : 'BẢNG TỔNG HỢP NHẬP - XUẤT - TỒN KHO HÀNG HÓA VẬT TƯ IT',
    `Đơn vị / Đối tác: ${partnerDisplay}`,
    `Thời gian: Từ ngày ${formattedFrom} đến ngày ${formattedTo} (${periodLabel})`,
    `Kho Hàng: ${warehouseName} | Ngày lập: ${new Date().toLocaleDateString('vi-VN')} | Đơn vị tính: VNĐ`,
    14
  );

  // Apply complete cell borders and styles
  const ws1StartRow = 9;
  const ws1EndRow = 11 + summaryRows.length; // includes Total row
  const totalRow1 = ws1EndRow;

  applyTableGridStyles(
    ws1,
    ws1StartRow,
    ws1EndRow,
    0,
    14,
    (r) => r === 9 || r === 10,
    (r) => r === totalRow1,
    (c) => (c === 0 || c === 1 || c === 4 || c === 14 ? 'center' : c === 2 || c === 3 ? 'left' : 'right'),
    (c) => c >= 5 && c <= 13,
    {
      6: 'D9E1F2', // Soft Blue for Tồn Đầu
      7: 'D9E1F2',
      8: 'FCE4D6', // Soft Amber for Nhập
      9: 'FCE4D6',
      10: 'E2D9F3', // Soft Purple for Xuất
      11: 'E2D9F3',
      12: 'D1FAE5', // Soft Emerald for Tồn Cuối
      13: 'D1FAE5',
    }
  );

  // Append signature block at bottom
  appendSignatureBlock(ws1, totalRow1 + 3, 14);

  XLSX.utils.book_append_sheet(wb, ws1, 'Tong_Hop_Xuat_Nhap_Ton');

  // ==============================================================
  // SHEET 2: SỔ CHI TIẾT XUẤT NHẬP TỒN TỪNG DÒNG HÀNG & LÔ PHÁT SINH
  // ==============================================================
  const sortedDetail = [...detailRows].sort((a, b) => a.date.localeCompare(b.date));

  // Compute running balance for each SKU
  const stockBalanceTracker = new Map<string, number>();
  summaryRows.forEach((r) => {
    stockBalanceTracker.set(r.sku, r.openingStock ?? r.currentStock);
  });

  const detailRowsWithBalance = sortedDetail.map((d) => {
    const prev = stockBalanceTracker.get(d.sku) ?? 0;
    const inQty = d.type === 'Nhập kho' ? d.quantity : 0;
    const inAmt = d.type === 'Nhập kho' ? d.totalPrice : 0;
    const outQty = d.type === 'Xuất kho' ? d.quantity : 0;
    const outAmt = d.type === 'Xuất kho' ? d.totalPrice : 0;
    const newBal = prev + inQty - outQty;
    stockBalanceTracker.set(d.sku, newBal);

    return {
      ...d,
      inQty,
      inAmt,
      outQty,
      outAmt,
      balance: newBal,
    };
  });

  const ws2Data: (string | number | null | undefined)[][] = [
    [companyName.toUpperCase()],
    [`Địa chỉ: ${companyAddress}`],
    [`Điện thoại: ${companyPhone} | Mã số thuế: ${companyTaxCode}`],
    [],
    ['SỔ CHI TIẾT XUẤT - NHẬP - TỒN KHO HÀNG HÓA VẬT TƯ IT'],
    [`(Chi tiết từng chứng từ phát sinh và biến động tồn kho lũy kế)`],
    [`Đơn vị / Đối tác: ${partnerDisplay} | Thời gian: ${formattedFrom} - ${formattedTo} (${periodLabel})`],
    [`Kho: ${warehouseName} | Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')} | ĐVT: VNĐ`],
    [],
    // Table Headers
    [
      'STT',
      'Ngày',
      'Số Chứng Từ',
      'Loại Giao Dịch',
      'Đối Tác / Khoa Phòng',
      'Mã Hàng (SKU)',
      'Tên Hàng Hóa / Quy Cách',
      'ĐVT',
      'Đơn Giá (đ)',
      'SL Nhập',
      'Thành Tiền Nhập (đ)',
      'SL Xuất',
      'Thành Tiền Xuất (đ)',
      'Tồn Sau GD',
      'Diễn Giải / Ghi Chú',
    ],
    ...detailRowsWithBalance.map((d, i) => [
      i + 1,
      formatDateDisplay(d.date),
      d.code,
      d.type,
      d.partner,
      d.sku,
      d.name,
      d.unit,
      d.unitPrice,
      d.inQty > 0 ? d.inQty : 0,
      d.inAmt > 0 ? d.inAmt : 0,
      d.outQty > 0 ? d.outQty : 0,
      d.outAmt > 0 ? d.outAmt : 0,
      d.balance,
      d.notes || '',
    ]),
    // Grand Total Row
    [
      'TỔNG CỘNG',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      detailRowsWithBalance.reduce((s, r) => s + r.inQty, 0),
      detailRowsWithBalance.reduce((s, r) => s + r.inAmt, 0),
      detailRowsWithBalance.reduce((s, r) => s + r.outQty, 0),
      detailRowsWithBalance.reduce((s, r) => s + r.outAmt, 0),
      '',
      '',
    ],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);

  ws2['!cols'] = [
    { wch: 6 },  // STT
    { wch: 13 }, // Ngày
    { wch: 18 }, // Số CT
    { wch: 14 }, // Loại GD
    { wch: 32 }, // Đối tác
    { wch: 14 }, // Mã Hàng
    { wch: 38 }, // Tên Hàng
    { wch: 8 },  // ĐVT
    { wch: 15 }, // Đơn giá
    { wch: 14 }, // SL Nhập
    { wch: 20 }, // Tiền Nhập
    { wch: 14 }, // SL Xuất
    { wch: 20 }, // Tiền Xuất
    { wch: 14 }, // Tồn sau GD
    { wch: 38 }, // Ghi chú
  ];

  styleHeaderBlock(
    ws2,
    'SỔ CHI TIẾT XUẤT - NHẬP - TỒN KHO HÀNG HÓA VẬT TƯ IT',
    `Đối tác / Khoa phòng: ${partnerDisplay}`,
    `Thời gian: Từ ${formattedFrom} đến ${formattedTo} (${periodLabel})`,
    `Kho: ${warehouseName} | Ngày lập: ${new Date().toLocaleDateString('vi-VN')} | ĐVT: VNĐ`,
    14
  );

  const ws2StartRow = 9;
  const ws2EndRow = 10 + detailRowsWithBalance.length;
  const totalRow2 = ws2EndRow;

  applyTableGridStyles(
    ws2,
    ws2StartRow,
    ws2EndRow,
    0,
    14,
    (r) => r === 9,
    (r) => r === totalRow2,
    (c) => (c === 0 || c === 1 || c === 2 || c === 3 || c === 5 || c === 7 ? 'center' : c === 4 || c === 6 || c === 14 ? 'left' : 'right'),
    (c) => (c >= 8 && c <= 13),
    {
      9: 'FCE4D6',  // Nhập tint
      10: 'FCE4D6',
      11: 'E2D9F3', // Xuất tint
      12: 'E2D9F3',
      13: 'D1FAE5', // Tồn tint
    }
  );

  appendSignatureBlock(ws2, totalRow2 + 3, 14);

  XLSX.utils.book_append_sheet(wb, ws2, 'Chi_Tiet_Xuat_Nhap_Ton');

  // ==============================================================
  // SHEET 3: XUẤT CẤP PHÁT KHOA PHÒNG BỆNH VIỆN
  // ==============================================================
  const totalDeptOrders = departmentRows.reduce((s, d) => s + d.orderCount, 0);
  const totalDeptQty = departmentRows.reduce((s, d) => s + d.totalQuantity, 0);
  const totalDeptAmount = departmentRows.reduce((s, d) => s + d.totalAmount, 0);

  const ws3Data: (string | number | null | undefined)[][] = [
    [companyName.toUpperCase()],
    [`Địa chỉ: ${companyAddress}`],
    [`Điện thoại: ${companyPhone} | Mã số thuế: ${companyTaxCode}`],
    [],
    ['BÁO CÁO CHI TIẾT XUẤT CẤP PHÁT VẬT TƯ & MỰC IN CHO CÁC KHOA / PHÒNG BỆNH VIỆN'],
    [`Thời gian báo cáo: Từ ngày ${formattedFrom} đến ngày ${formattedTo} (${periodLabel})`],
    [`Kho xuất: ${warehouseName} | Ngày lập báo cáo: ${new Date().toLocaleDateString('vi-VN')} | Đơn vị tính: VNĐ`],
    [],
    ['I. BẢNG TỔNG HỢP CẤP PHÁT THEO KHOA / PHÒNG'],
    [
      'STT',
      'Tên Khoa / Phòng Nhận',
      'Nhóm Bộ Phận',
      'Số Phiếu Xuất',
      'Tổng SL Vật Tư Nhận (sp)',
      'Tổng Thành Tiền (đ)',
      'Tỷ Trọng (%)',
      'Người Đại Diện Nhận',
    ],
    ...departmentRows.map((d, i) => [
      i + 1,
      d.departmentName,
      d.departmentGroup || 'Khoa / Phòng Bệnh Viện',
      d.orderCount,
      d.totalQuantity,
      d.totalAmount,
      d.percentage || (totalDeptAmount > 0 ? `${((d.totalAmount / totalDeptAmount) * 100).toFixed(1)}%` : '0%'),
      d.receiverNames || 'Đại diện khoa',
    ]),
    [
      'TỔNG CỘNG MỤC I',
      '',
      '',
      totalDeptOrders,
      totalDeptQty,
      totalDeptAmount,
      '100%',
      '',
    ],
    [],
    ['II. SỔ CHI TIẾT CÁC MẶT HÀNG ĐÃ XUẤT CHO TỪNG KHOA / PHÒNG'],
    [
      'STT',
      'Ngày Xuất',
      'Số Phiếu',
      'Khoa / Phòng Nhận',
      'Người Nhận Hàng',
      'Mã Hàng',
      'Tên Vật Tư / Thiết Bị / Mực In',
      'ĐVT',
      'Số Lượng Xuất',
      'Đơn Giá (đ)',
      'Thành Tiền (đ)',
      'Mục Đích / Lý Do Cấp Phát',
    ],
    ...departmentDetailRows.map((it, i) => [
      i + 1,
      formatDateDisplay(it.date),
      it.orderCode,
      it.departmentName,
      it.receiverName || '',
      it.sku,
      it.name,
      it.unit,
      it.quantity,
      it.unitPrice,
      it.totalPrice,
      it.reason || 'Cấp phát sử dụng tại khoa',
    ]),
    [
      'TỔNG CỘNG CHI TIẾT MỤC II',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      departmentDetailRows.reduce((s, r) => s + r.quantity, 0),
      '',
      departmentDetailRows.reduce((s, r) => s + r.totalPrice, 0),
      '',
    ],
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);

  ws3['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Ngày/Khoa
    { wch: 18 }, // Số Phiếu
    { wch: 30 }, // Khoa/Phòng
    { wch: 20 }, // Người Nhận
    { wch: 14 }, // Mã Hàng
    { wch: 38 }, // Tên Hàng
    { wch: 8 },  // ĐVT
    { wch: 15 }, // SL
    { wch: 16 }, // Đơn giá
    { wch: 20 }, // Thành tiền
    { wch: 35 }, // Lý do
  ];

  styleHeaderBlock(
    ws3,
    'BÁO CÁO CHI TIẾT XUẤT CẤP PHÁT CHO CÁC KHOA / PHÒNG BỆNH VIỆN',
    'Thống kê tổng hợp & chi tiết từng mặt hàng mực in và thiết bị IT cấp phát',
    `Thời gian: Từ ${formattedFrom} đến ${formattedTo} (${periodLabel})`,
    `Kho xuất: ${warehouseName} | Đơn vị tính: VNĐ`,
    11
  );

  // Apply borders to Part I (row 9 to 9 + departmentRows.length + 1)
  const part1HeaderRow = 9;
  const part1TotalRow = 10 + departmentRows.length;
  applyTableGridStyles(
    ws3,
    part1HeaderRow,
    part1TotalRow,
    0,
    7,
    (r) => r === part1HeaderRow,
    (r) => r === part1TotalRow,
    (c) => (c === 0 ? 'center' : c === 1 || c === 2 || c === 7 ? 'left' : 'right'),
    (c) => c === 3 || c === 4 || c === 5
  );

  // Apply borders to Part II
  const part2HeaderRow = part1TotalRow + 2;
  const part2TotalRow = part2HeaderRow + 1 + departmentDetailRows.length;
  applyTableGridStyles(
    ws3,
    part2HeaderRow,
    part2TotalRow,
    0,
    11,
    (r) => r === part2HeaderRow,
    (r) => r === part2TotalRow,
    (c) => (c === 0 || c === 1 || c === 2 || c === 5 || c === 7 ? 'center' : c === 3 || c === 4 || c === 6 || c === 11 ? 'left' : 'right'),
    (c) => c === 8 || c === 9 || c === 10
  );

  appendSignatureBlock(ws3, part2TotalRow + 3, 11);

  XLSX.utils.book_append_sheet(wb, ws3, 'Xuat_Khoa_Phong');

  // ==============================================================
  // SHEET 4: NHẬP TỪ NHÀ CUNG CẤP & ĐỐI TÁC
  // ==============================================================
  const totalSupReceipts = supplierRows.reduce((s, r) => s + r.receiptCount, 0);
  const totalSupQty = supplierRows.reduce((s, r) => s + r.totalQuantity, 0);
  const totalSupAmount = supplierRows.reduce((s, r) => s + r.totalAmount, 0);

  const ws4Data: (string | number | null | undefined)[][] = [
    [companyName.toUpperCase()],
    [`Địa chỉ: ${companyAddress}`],
    [`Điện thoại: ${companyPhone} | Mã số thuế: ${companyTaxCode}`],
    [],
    ['BÁO CÁO CHI TIẾT NHẬP HÀNG TỪ CÁC ĐƠN VỊ CUNG CẤP & ĐỐI TÁC'],
    [`Thời gian báo cáo: Từ ngày ${formattedFrom} đến ngày ${formattedTo} (${periodLabel})`],
    [`Kho nhận: ${warehouseName} | Ngày lập báo cáo: ${new Date().toLocaleDateString('vi-VN')} | Đơn vị tính: VNĐ`],
    [],
    ['I. BẢNG TỔNG HỢP NHẬP HÀNG THEO NHÀ CUNG CẤP'],
    [
      'STT',
      'Tên Nhà Cung Cấp / Đơn Vị Giao',
      'Người Liên Hệ / SĐT',
      'Số Phiếu Nhập',
      'Tổng SL Nhập (sp)',
      'Tổng Tiền Hàng (đ)',
      'Tỷ Trọng (%)',
    ],
    ...supplierRows.map((s, i) => [
      i + 1,
      s.supplierName,
      s.contactPerson ? `${s.contactPerson} - ${s.phone || ''}` : s.phone || 'Phòng kinh doanh',
      s.receiptCount,
      s.totalQuantity,
      s.totalAmount,
      s.percentage || (totalSupAmount > 0 ? `${((s.totalAmount / totalSupAmount) * 100).toFixed(1)}%` : '0%'),
    ]),
    [
      'TỔNG CỘNG MỤC I',
      '',
      '',
      totalSupReceipts,
      totalSupQty,
      totalSupAmount,
      '100%',
    ],
    [],
    ['II. SỔ CHI TIẾT CÁC LÔ HÀNG NHẬP THEO NHÀ CUNG CẤP'],
    [
      'STT',
      'Ngày Nhập',
      'Số Phiếu',
      'Tên Nhà Cung Cấp',
      'Mã Hàng',
      'Tên Hàng Hóa / Vật Tư IT',
      'ĐVT',
      'Số Lượng Nhập',
      'Đơn Giá Nhập (đ)',
      'Thành Tiền Nhập (đ)',
      'Ghi Chú / Tình Trạng',
    ],
    ...supplierDetailRows.map((it, i) => [
      i + 1,
      formatDateDisplay(it.date),
      it.receiptCode,
      it.supplierName,
      it.sku,
      it.name,
      it.unit,
      it.quantity,
      it.unitPrice,
      it.totalPrice,
      it.notes || 'Nhập kho phục vụ khám chữa bệnh',
    ]),
    [
      'TỔNG CỘNG CHI TIẾT MỤC II',
      '',
      '',
      '',
      '',
      '',
      '',
      supplierDetailRows.reduce((s, r) => s + r.quantity, 0),
      '',
      supplierDetailRows.reduce((s, r) => s + r.totalPrice, 0),
      '',
    ],
  ];

  const ws4 = XLSX.utils.aoa_to_sheet(ws4Data);

  ws4['!cols'] = [
    { wch: 6 },  // STT
    { wch: 13 }, // Ngày
    { wch: 18 }, // Số Phiếu
    { wch: 36 }, // NCC
    { wch: 14 }, // Mã Hàng
    { wch: 38 }, // Tên Hàng
    { wch: 8 },  // ĐVT
    { wch: 15 }, // SL
    { wch: 16 }, // Đơn giá
    { wch: 20 }, // Thành tiền
    { wch: 35 }, // Ghi chú
  ];

  styleHeaderBlock(
    ws4,
    'BÁO CÁO CHI TIẾT NHẬP HÀNG TỪ CÁC ĐƠN VỊ CUNG CẤP & ĐỐI TÁC',
    'Thống kê tổng hợp & chi tiết từng lô hàng mực in và vật tư thiết bị nhập vào kho IT',
    `Thời gian: Từ ${formattedFrom} đến ${formattedTo} (${periodLabel})`,
    `Kho nhận: ${warehouseName} | Đơn vị tính: VNĐ`,
    10
  );

  // Apply borders to Part I
  const ws4Part1Header = 9;
  const ws4Part1Total = 10 + supplierRows.length;
  applyTableGridStyles(
    ws4,
    ws4Part1Header,
    ws4Part1Total,
    0,
    6,
    (r) => r === ws4Part1Header,
    (r) => r === ws4Part1Total,
    (c) => (c === 0 ? 'center' : c === 1 || c === 2 ? 'left' : 'right'),
    (c) => c === 3 || c === 4 || c === 5
  );

  // Apply borders to Part II
  const ws4Part2Header = ws4Part1Total + 2;
  const ws4Part2Total = ws4Part2Header + 1 + supplierDetailRows.length;
  applyTableGridStyles(
    ws4,
    ws4Part2Header,
    ws4Part2Total,
    0,
    10,
    (r) => r === ws4Part2Header,
    (r) => r === ws4Part2Total,
    (c) => (c === 0 || c === 1 || c === 2 || c === 4 || c === 6 ? 'center' : c === 3 || c === 5 || c === 10 ? 'left' : 'right'),
    (c) => c === 7 || c === 8 || c === 9
  );

  appendSignatureBlock(ws4, ws4Part2Total + 3, 10);

  XLSX.utils.book_append_sheet(wb, ws4, 'Nhap_Nha_Cung_Cap');

  // Trigger file download
  const partnerSlug = isSpecificPartner ? sanitizeFilenamePart(selectedPartner) : 'Tong_Hop_Kho';
  const fromSlug = sanitizeFilenamePart(fromDate);
  const toSlug = sanitizeFilenamePart(toDate);
  const fileName = `Bao_Cao_XNT_Chi_Tiet_${partnerSlug}_${fromSlug}_${toSlug}_VPMED.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Export specialized Department Issue report only with full borders
 */
export function exportDepartmentReportOnlyToExcel(
  companyInfo: { name: string; address?: string; phone?: string; taxCode?: string },
  departmentRows: DepartmentSummaryItem[],
  departmentDetailRows: DepartmentDetailItem[],
  fromDate: string,
  toDate: string,
  periodLabel: string
): void {
  const wb = XLSX.utils.book_new();
  const formattedFrom = formatDateDisplay(fromDate);
  const formattedTo = formatDateDisplay(toDate);
  const totalAmount = departmentRows.reduce((s, d) => s + d.totalAmount, 0);

  const wsData: (string | number | null | undefined)[][] = [
    [companyInfo.name.toUpperCase()],
    [`Địa chỉ: ${companyInfo.address || 'Số 1 Tô Ngọc Vân, Phường Tân Hưng, Thành phố Hải Phòng'}`],
    [],
    ['BÁO CÁO XUẤT CẤP PHÁT THIẾT BỊ VẬT TƯ CHO CÁC KHOA / PHÒNG BỆNH VIỆN'],
    [`Thời gian: Từ ${formattedFrom} đến ${formattedTo} (${periodLabel})`],
    [],
    ['I. TỔNG HỢP THEO KHOA / PHÒNG'],
    ['STT', 'Khoa / Phòng', 'Nhóm Bộ Phận', 'Số Phiếu', 'Tổng SL Nhận', 'Tổng Thành Tiền (đ)', 'Tỷ Trọng (%)'],
    ...departmentRows.map((d, i) => [
      i + 1,
      d.departmentName,
      d.departmentGroup || '',
      d.orderCount,
      d.totalQuantity,
      d.totalAmount,
      d.percentage || (totalAmount > 0 ? `${((d.totalAmount / totalAmount) * 100).toFixed(1)}%` : '0%'),
    ]),
    [
      'TỔNG CỘNG MỤC I',
      '',
      '',
      departmentRows.reduce((s, d) => s + d.orderCount, 0),
      departmentRows.reduce((s, d) => s + d.totalQuantity, 0),
      totalAmount,
      '100%',
    ],
    [],
    ['II. CHI TIẾT TỪNG MẶT HÀNG XUẤT CHO KHOA / PHÒNG'],
    ['STT', 'Ngày', 'Số Phiếu', 'Khoa / Phòng', 'Người Nhận', 'Mã Hàng', 'Tên Hàng Hóa', 'ĐVT', 'Số Lượng', 'Đơn Giá (đ)', 'Thành Tiền (đ)', 'Lý Do'],
    ...departmentDetailRows.map((d, i) => [
      i + 1,
      formatDateDisplay(d.date),
      d.orderCode,
      d.departmentName,
      d.receiverName || '',
      d.sku,
      d.name,
      d.unit,
      d.quantity,
      d.unitPrice,
      d.totalPrice,
      d.reason || '',
    ]),
    [
      'TỔNG CỘNG CHI TIẾT MỤC II',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      departmentDetailRows.reduce((s, r) => s + r.quantity, 0),
      '',
      departmentDetailRows.reduce((s, r) => s + r.totalPrice, 0),
      '',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 13 }, // Ngày
    { wch: 18 }, // Số Phiếu
    { wch: 28 }, // Khoa/Phòng
    { wch: 20 }, // Người Nhận
    { wch: 14 }, // Mã Hàng
    { wch: 38 }, // Tên Hàng
    { wch: 8 },  // ĐVT
    { wch: 14 }, // SL
    { wch: 16 }, // Đơn giá
    { wch: 20 }, // Thành tiền
    { wch: 32 }, // Lý do
  ];

  styleHeaderBlock(
    ws,
    'BÁO CÁO XUẤT CẤP PHÁT CHO CÁC KHOA / PHÒNG BỆNH VIỆN',
    'Thống kê tổng hợp & chi tiết các mặt hàng mực in và vật tư IT',
    `Thời gian: Từ ${formattedFrom} đến ${formattedTo} (${periodLabel})`,
    'Kho IT - CÔNG TY BỆNH VIỆN CỔ PHẦN VPMED',
    11
  );

  const p1Hdr = 7;
  const p1Tot = 8 + departmentRows.length;
  applyTableGridStyles(
    ws,
    p1Hdr,
    p1Tot,
    0,
    6,
    (r) => r === p1Hdr,
    (r) => r === p1Tot,
    (c) => (c === 0 ? 'center' : c === 1 || c === 2 ? 'left' : 'right'),
    (c) => c === 3 || c === 4 || c === 5
  );

  const p2Hdr = p1Tot + 2;
  const p2Tot = p2Hdr + 1 + departmentDetailRows.length;
  applyTableGridStyles(
    ws,
    p2Hdr,
    p2Tot,
    0,
    11,
    (r) => r === p2Hdr,
    (r) => r === p2Tot,
    (c) => (c === 0 || c === 1 || c === 2 || c === 5 || c === 7 ? 'center' : c === 3 || c === 4 || c === 6 || c === 11 ? 'left' : 'right'),
    (c) => c === 8 || c === 9 || c === 10
  );

  appendSignatureBlock(ws, p2Tot + 3, 11);

  XLSX.utils.book_append_sheet(wb, ws, 'Xuat_Khoa_Phong');
  XLSX.writeFile(wb, `Bao_Cao_Xuat_Khoa_Phong_${sanitizeFilenamePart(fromDate)}_${sanitizeFilenamePart(toDate)}_VPMED.xlsx`);
}

/**
 * Export specialized Supplier Receipt report only with full borders
 */
export function exportSupplierReportOnlyToExcel(
  companyInfo: { name: string; address?: string; phone?: string; taxCode?: string },
  supplierRows: SupplierSummaryItem[],
  supplierDetailRows: SupplierDetailItem[],
  fromDate: string,
  toDate: string,
  periodLabel: string
): void {
  const wb = XLSX.utils.book_new();
  const formattedFrom = formatDateDisplay(fromDate);
  const formattedTo = formatDateDisplay(toDate);
  const totalAmount = supplierRows.reduce((s, d) => s + d.totalAmount, 0);

  const wsData: (string | number | null | undefined)[][] = [
    [companyInfo.name.toUpperCase()],
    [`Địa chỉ: ${companyInfo.address || 'Số 1 Tô Ngọc Vân, Phường Tân Hưng, Thành phố Hải Phòng'}`],
    [],
    ['BÁO CÁO NHẬP HÀNG TỪ CÁC ĐƠN VỊ CUNG CẤP & ĐỐI TÁC'],
    [`Thời gian: Từ ${formattedFrom} đến ${formattedTo} (${periodLabel})`],
    [],
    ['I. TỔNG HỢP THEO NHÀ CUNG CẤP'],
    ['STT', 'Nhà Cung Cấp', 'Người Liên Hệ / SĐT', 'Số Phiếu', 'Tổng SL Nhập', 'Tổng Tiền Hàng (đ)', 'Tỷ Trọng (%)'],
    ...supplierRows.map((s, i) => [
      i + 1,
      s.supplierName,
      s.contactPerson ? `${s.contactPerson} - ${s.phone || ''}` : s.phone || '',
      s.receiptCount,
      s.totalQuantity,
      s.totalAmount,
      s.percentage || (totalAmount > 0 ? `${((s.totalAmount / totalAmount) * 100).toFixed(1)}%` : '0%'),
    ]),
    [
      'TỔNG CỘNG MỤC I',
      '',
      '',
      supplierRows.reduce((s, r) => s + r.receiptCount, 0),
      supplierRows.reduce((s, r) => s + r.totalQuantity, 0),
      totalAmount,
      '100%',
    ],
    [],
    ['II. CHI TIẾT TỪNG LÔ HÀNG NHẬP THEO NHÀ CUNG CẤP'],
    ['STT', 'Ngày', 'Số Phiếu', 'Nhà Cung Cấp', 'Mã Hàng', 'Tên Hàng Hóa', 'ĐVT', 'Số Lượng', 'Đơn Giá (đ)', 'Thành Tiền (đ)', 'Ghi Chú'],
    ...supplierDetailRows.map((s, i) => [
      i + 1,
      formatDateDisplay(s.date),
      s.receiptCode,
      s.supplierName,
      s.sku,
      s.name,
      s.unit,
      s.quantity,
      s.unitPrice,
      s.totalPrice,
      s.notes || '',
    ]),
    [
      'TỔNG CỘNG CHI TIẾT MỤC II',
      '',
      '',
      '',
      '',
      '',
      '',
      supplierDetailRows.reduce((s, r) => s + r.quantity, 0),
      '',
      supplierDetailRows.reduce((s, r) => s + r.totalPrice, 0),
      '',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 13 }, // Ngày
    { wch: 18 }, // Số Phiếu
    { wch: 36 }, // Nhà Cung Cấp
    { wch: 14 }, // Mã Hàng
    { wch: 38 }, // Tên Hàng
    { wch: 8 },  // ĐVT
    { wch: 14 }, // SL
    { wch: 16 }, // Đơn giá
    { wch: 20 }, // Thành tiền
    { wch: 35 }, // Ghi Chú
  ];

  styleHeaderBlock(
    ws,
    'BÁO CÁO NHẬP HÀNG TỪ CÁC ĐƠN VỊ CUNG CẤP & ĐỐI TÁC',
    'Thống kê tổng hợp & chi tiết các lô hàng mực in và vật tư thiết bị IT nhập kho',
    `Thời gian: Từ ${formattedFrom} đến ${formattedTo} (${periodLabel})`,
    'Kho IT - CÔNG TY BỆNH VIỆN CỔ PHẦN VPMED',
    10
  );

  const p1Hdr = 7;
  const p1Tot = 8 + supplierRows.length;
  applyTableGridStyles(
    ws,
    p1Hdr,
    p1Tot,
    0,
    6,
    (r) => r === p1Hdr,
    (r) => r === p1Tot,
    (c) => (c === 0 ? 'center' : c === 1 || c === 2 ? 'left' : 'right'),
    (c) => c === 3 || c === 4 || c === 5
  );

  const p2Hdr = p1Tot + 2;
  const p2Tot = p2Hdr + 1 + supplierDetailRows.length;
  applyTableGridStyles(
    ws,
    p2Hdr,
    p2Tot,
    0,
    10,
    (r) => r === p2Hdr,
    (r) => r === p2Tot,
    (c) => (c === 0 || c === 1 || c === 2 || c === 4 || c === 6 ? 'center' : c === 3 || c === 5 || c === 10 ? 'left' : 'right'),
    (c) => c === 7 || c === 8 || c === 9
  );

  appendSignatureBlock(ws, p2Tot + 3, 10);

  XLSX.utils.book_append_sheet(wb, ws, 'Nhap_Nha_Cung_Cap');
  XLSX.writeFile(wb, `Bao_Cao_Nhap_NCC_${sanitizeFilenamePart(fromDate)}_${sanitizeFilenamePart(toDate)}_VPMED.xlsx`);
}

// Backward compatibility wrapper
export function exportMonthlyReportToExcel(options: any): void {
  exportWarehouseReportToExcel({
    companyName: options.companyName,
    companyAddress: options.companyAddress,
    selectedPartner: 'ALL',
    fromDate: options.month === 'ALL' ? `${options.year}-01-01` : `${options.year}-${String(options.month).padStart(2, '0')}-01`,
    toDate: options.month === 'ALL' ? `${options.year}-12-31` : `${options.year}-${String(options.month).padStart(2, '0')}-31`,
    periodLabel: options.month === 'ALL' ? `Cả Năm ${options.year}` : `Tháng ${options.month}/${options.year}`,
    summaryRows: options.summaryRows,
    detailRows: options.detailRows,
    totalAggregates: options.totalAggregates,
  });
}

export interface ExportStockHistoryOptions {
  companyName: string;
  companyAddress?: string;
  selectedPartner?: string;
  fromDate?: string;
  toDate?: string;
  periodLabel?: string;
  itemRows: {
    date: string;
    code: string;
    type: 'Nhập kho' | 'Xuất kho';
    partner: string;
    sku: string;
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    warehouseName: string;
    notes: string;
  }[];
  voucherRows: {
    date: string;
    code: string;
    type: 'Nhập kho' | 'Xuất kho';
    partner: string;
    warehouseName: string;
    itemCount: number;
    totalQuantity: number;
    totalAmount: number;
    paymentStatus?: string;
    notes: string;
  }[];
  aggregates: {
    totalInQty: number;
    totalInAmount: number;
    totalOutQty: number;
    totalOutAmount: number;
  };
}

/**
 * Export stock transaction history with complete borders
 */
export function exportStockHistoryToExcel(options: ExportStockHistoryOptions): void {
  const {
    companyName,
    companyAddress = 'Số 1 Tô Ngọc Vân, Phường Tân Hưng, Thành phố Hải Phòng',
    selectedPartner = 'ALL',
    periodLabel = 'Toàn bộ thời gian',
    itemRows,
    voucherRows,
  } = options;

  const wb = XLSX.utils.book_new();
  const isSpecificPartner = selectedPartner !== 'ALL' && selectedPartner !== 'Tất cả đơn vị';
  const partnerDisplay = isSpecificPartner ? selectedPartner : 'Tất cả đơn vị / đối tác';

  // Sheet 1: Line items
  const ws1Data: (string | number | null | undefined)[][] = [
    [companyName.toUpperCase()],
    [`Địa chỉ: ${companyAddress}`],
    ['SỔ NHẬT KÝ CHI TIẾT TỪNG DÒNG HÀNG XUẤT NHẬP KHO'],
    [`Đối tác / Đơn vị: ${partnerDisplay}`],
    [`Kỳ báo cáo: ${periodLabel} | Ngày lập: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
    [
      'STT',
      'Ngày Giao Dịch',
      'Số Phiếu',
      'Loại GD',
      'Kho Hàng',
      'Đối Tác / Khoa Phòng',
      'Mã Hàng (SKU)',
      'Tên Hàng Hóa / Quy Cách',
      'ĐVT',
      'Số Lượng',
      'Đơn Giá (đ)',
      'Thành Tiền (đ)',
      'Ghi Chú',
    ],
    ...itemRows.map((item, idx) => [
      idx + 1,
      formatDateDisplay(item.date),
      item.code,
      item.type,
      item.warehouseName,
      item.partner,
      item.sku,
      item.name,
      item.unit,
      item.quantity,
      item.unitPrice,
      item.totalPrice,
      item.notes,
    ]),
    [
      'TỔNG CỘNG',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      itemRows.reduce((s, r) => s + r.quantity, 0),
      '',
      itemRows.reduce((s, r) => s + r.totalPrice, 0),
      '',
    ],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  ws1['!cols'] = [
    { wch: 6 },
    { wch: 13 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 36 },
    { wch: 14 },
    { wch: 38 },
    { wch: 8 },
    { wch: 12 },
    { wch: 15 },
    { wch: 18 },
    { wch: 35 },
  ];

  styleHeaderBlock(
    ws1,
    'SỔ NHẬT KÝ CHI TIẾT TỪNG DÒNG HÀNG XUẤT NHẬP KHO',
    `Đối tác / Đơn vị: ${partnerDisplay}`,
    `Kỳ báo cáo: ${periodLabel}`,
    `Kho IT - CÔNG TY BỆNH VIỆN CỔ PHẦN VPMED`,
    12
  );

  const ws1Hdr = 6;
  const ws1Tot = 7 + itemRows.length;
  applyTableGridStyles(
    ws1,
    ws1Hdr,
    ws1Tot,
    0,
    12,
    (r) => r === ws1Hdr,
    (r) => r === ws1Tot,
    (c) => (c === 0 || c === 1 || c === 2 || c === 3 || c === 6 || c === 8 ? 'center' : c === 4 || c === 5 || c === 7 || c === 12 ? 'left' : 'right'),
    (c) => c === 9 || c === 10 || c === 11
  );

  appendSignatureBlock(ws1, ws1Tot + 3, 12);
  XLSX.utils.book_append_sheet(wb, ws1, 'Lich_Su_Dong_Hang');

  // Sheet 2: Vouchers
  const ws2Data: (string | number | null | undefined)[][] = [
    [companyName.toUpperCase()],
    [`Địa chỉ: ${companyAddress}`],
    ['DANH SÁCH CHỨNG TỪ XUẤT NHẬP KHO'],
    [`Đối tác / Đơn vị: ${partnerDisplay}`],
    [`Kỳ báo cáo: ${periodLabel} | Ngày lập: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
    [
      'STT',
      'Ngày',
      'Số Phiếu',
      'Loại Phiếu',
      'Đối Tác / Khoa Phòng',
      'Kho Hàng',
      'Số Mặt Hàng',
      'Tổng Số Lượng',
      'Tổng Tiền (đ)',
      'Thanh Toán',
      'Ghi Chú',
    ],
    ...voucherRows.map((v, i) => [
      i + 1,
      formatDateDisplay(v.date),
      v.code,
      v.type,
      v.partner,
      v.warehouseName,
      v.itemCount,
      v.totalQuantity,
      v.totalAmount,
      v.paymentStatus || '',
      v.notes,
    ]),
    [
      'TỔNG CỘNG',
      '',
      '',
      '',
      '',
      '',
      voucherRows.reduce((s, v) => s + v.itemCount, 0),
      voucherRows.reduce((s, v) => s + v.totalQuantity, 0),
      voucherRows.reduce((s, v) => s + v.totalAmount, 0),
      '',
      '',
    ],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2['!cols'] = [
    { wch: 6 },
    { wch: 13 },
    { wch: 18 },
    { wch: 15 },
    { wch: 38 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
    { wch: 40 },
  ];

  styleHeaderBlock(
    ws2,
    'DANH SÁCH CHỨNG TỪ XUẤT NHẬP KHO',
    `Đối tác / Đơn vị: ${partnerDisplay}`,
    `Kỳ báo cáo: ${periodLabel}`,
    `Kho IT - CÔNG TY BỆNH VIỆN CỔ PHẦN VPMED`,
    10
  );

  const ws2Hdr = 6;
  const ws2Tot = 7 + voucherRows.length;
  applyTableGridStyles(
    ws2,
    ws2Hdr,
    ws2Tot,
    0,
    10,
    (r) => r === ws2Hdr,
    (r) => r === ws2Tot,
    (c) => (c === 0 || c === 1 || c === 2 || c === 3 || c === 9 ? 'center' : c === 4 || c === 5 || c === 10 ? 'left' : 'right'),
    (c) => c === 6 || c === 7 || c === 8
  );

  appendSignatureBlock(ws2, ws2Tot + 3, 10);
  XLSX.utils.book_append_sheet(wb, ws2, 'Danh_Sach_Chung_Tu');

  const partnerSlug = isSpecificPartner ? sanitizeFilenamePart(selectedPartner) : 'Tat_Ca';
  const fileName = `Lich_Su_Xuat_Nhap_${partnerSlug}_${sanitizeFilenamePart(periodLabel)}_VPMED.xlsx`;
  XLSX.writeFile(wb, fileName);
}
