import { Product, StockIssueOrder, StockReceiptOrder, CompanyInfo, Customer, Supplier } from '../types';
import {
  ReportSummaryItem,
  ReportTransactionItem,
  DepartmentSummaryItem,
  DepartmentDetailItem,
  SupplierSummaryItem,
  SupplierDetailItem,
  exportWarehouseReportToExcel,
  exportDepartmentReportOnlyToExcel,
  exportSupplierReportOnlyToExcel,
} from './excelExporter';

export interface ComputeStockReportParams {
  products: Product[];
  receiptOrders: StockReceiptOrder[];
  issueOrders: StockIssueOrder[];
  customers?: Customer[];
  suppliers?: Supplier[];
  startDate?: string;
  endDate?: string;
  selectedPartner?: string;
  transactionType?: 'ALL' | 'IN' | 'OUT';
  categoryFilter?: string;
  searchTerm?: string;
  onlyTransactedItems?: boolean;
}

export function computeStockReportData(params: ComputeStockReportParams) {
  const {
    products,
    receiptOrders,
    issueOrders,
    customers = [],
    suppliers = [],
    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate = new Date().toISOString().split('T')[0],
    selectedPartner = 'ALL',
    transactionType = 'ALL',
    categoryFilter = 'ALL',
    searchTerm = '',
    onlyTransactedItems = false,
  } = params;

  const isSpecificPartner = selectedPartner !== 'ALL' && selectedPartner !== 'Tất cả đơn vị';

  // ==============================================================
  // 1. TÍNH TOÁN 4 TRỤ CỘT CHO MẶT HÀNG (TỒN ĐẦU, NHẬP, XUẤT, TỒN CUỐI)
  // ==============================================================
  const allSummaryRows: ReportSummaryItem[] = products.map((prod) => {
    // Tổng nhập & xuất trọn đời để tính mốc gốc
    const lifetimeIn = receiptOrders.reduce((sum, rec) => {
      const it = rec.items.find((item) => item.productId === prod.id);
      return sum + (it ? it.quantity : 0);
    }, 0);

    const lifetimeOut = issueOrders.reduce((sum, iss) => {
      const it = iss.items.find((item) => item.productId === prod.id);
      return sum + (it ? it.quantity : 0);
    }, 0);

    const baselineStock = Math.max(0, prod.stockQuantity - lifetimeIn + lifetimeOut);

    // Giao dịch TRƯỚC startDate
    const receiptsBefore = receiptOrders
      .filter((rec) => rec.date < startDate)
      .reduce((sum, rec) => {
        const it = rec.items.find((item) => item.productId === prod.id);
        return sum + (it ? it.quantity : 0);
      }, 0);

    const issuesBefore = issueOrders
      .filter((iss) => iss.date < startDate)
      .reduce((sum, iss) => {
        const it = iss.items.find((item) => item.productId === prod.id);
        return sum + (it ? it.quantity : 0);
      }, 0);

    const openingStock = Math.max(0, baselineStock + receiptsBefore - issuesBefore);

    // Giao dịch TRONG KỲ [startDate, endDate]
    let inValue = 0;
    let totalIn = 0;
    if (transactionType === 'ALL' || transactionType === 'IN') {
      receiptOrders
        .filter((rec) => {
          if (rec.date < startDate || rec.date > endDate) return false;
          if (isSpecificPartner && rec.supplierName !== selectedPartner) return false;
          return true;
        })
        .forEach((rec) => {
          const it = rec.items.find((item) => item.productId === prod.id);
          if (it) {
            totalIn += it.quantity;
            inValue += it.quantity * it.unitCost;
          }
        });
    }

    let outValue = 0;
    let totalOut = 0;
    if (transactionType === 'ALL' || transactionType === 'OUT') {
      issueOrders
        .filter((iss) => {
          if (iss.date < startDate || iss.date > endDate) return false;
          if (isSpecificPartner && iss.customerName !== selectedPartner) return false;
          return true;
        })
        .forEach((iss) => {
          const it = iss.items.find((item) => item.productId === prod.id);
          if (it) {
            totalOut += it.quantity;
            outValue += it.quantity * it.unitPrice;
          }
        });
    }

    const closingStock = isSpecificPartner
      ? prod.stockQuantity
      : Math.max(0, openingStock + totalIn - totalOut);

    const stockValue = closingStock * prod.costPrice;

    return {
      id: prod.id,
      sku: prod.sku,
      name: prod.name,
      category: prod.category,
      unit: prod.unit,
      costPrice: prod.costPrice,
      sellingPrice: prod.sellingPrice,
      openingStock,
      totalIn,
      totalOut,
      closingStock,
      totalInValue: inValue,
      totalOutValue: outValue,
      stockValue,
      currentStock: prod.stockQuantity,
      warehouseLocation: prod.warehouseLocation,
    };
  });

  const summaryRows = allSummaryRows.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (onlyTransactedItems && item.totalIn === 0 && item.totalOut === 0) return false;
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      const m1 = item.sku.toLowerCase().includes(t);
      const m2 = item.name.toLowerCase().includes(t);
      if (!m1 && !m2) return false;
    }
    return true;
  });

  // Tổng cộng 4 trụ cột
  const totalAggregates = summaryRows.reduce(
    (acc, it) => {
      acc.opening += it.openingStock;
      acc.openingValue += it.openingStock * it.costPrice;
      acc.in += it.totalIn;
      acc.out += it.totalOut;
      acc.closing += it.closingStock;
      acc.inValue += it.totalInValue;
      acc.outValue += it.totalOutValue;
      acc.value += it.stockValue;
      return acc;
    },
    {
      opening: 0,
      openingValue: 0,
      in: 0,
      out: 0,
      closing: 0,
      inValue: 0,
      outValue: 0,
      value: 0,
    }
  );

  // ==============================================================
  // 2. THỐNG KÊ XUẤT CẤP PHÁT CHO TỪNG KHOA / PHÒNG
  // ==============================================================
  const relevantIssues = issueOrders.filter((iss) => {
    if (iss.date < startDate || iss.date > endDate) return false;
    if (isSpecificPartner && iss.customerName !== selectedPartner) return false;
    return true;
  });

  // Gom theo Khoa / Phòng
  const deptMap = new Map<string, {
    departmentName: string;
    departmentGroup: string;
    orders: StockIssueOrder[];
    receivers: Set<string>;
    itemMap: Map<string, { sku: string; name: string; unit: string; quantity: number; unitPrice: number; totalPrice: number }>;
  }>();

  relevantIssues.forEach((order) => {
    const deptName = order.customerName || 'Chưa xác định';
    if (!deptMap.has(deptName)) {
      const cust = customers.find((c) => c.name === deptName || c.group === deptName);
      deptMap.set(deptName, {
        departmentName: deptName,
        departmentGroup: cust?.group || 'Khoa / Phòng Bệnh viện',
        orders: [],
        receivers: new Set(),
        itemMap: new Map(),
      });
    }

    const entry = deptMap.get(deptName)!;
    entry.orders.push(order);
    if (order.receiverName) entry.receivers.add(order.receiverName);

    order.items.forEach((item) => {
      if (!entry.itemMap.has(item.productId)) {
        entry.itemMap.set(item.productId, {
          sku: item.sku,
          name: item.name,
          unit: item.unit,
          quantity: 0,
          unitPrice: item.unitPrice,
          totalPrice: 0,
        });
      }
      const it = entry.itemMap.get(item.productId)!;
      it.quantity += item.quantity;
      it.totalPrice += item.totalPrice;
    });
  });

  const totalDeptOverallAmount = Array.from(deptMap.values()).reduce(
    (sum, d) => sum + d.orders.reduce((s, o) => s + o.finalAmount, 0),
    0
  );

  const departmentRows: DepartmentSummaryItem[] = Array.from(deptMap.values()).map((d) => {
    const totalQty = d.orders.reduce((s, o) => s + o.totalQuantity, 0);
    const totalAmount = d.orders.reduce((s, o) => s + o.finalAmount, 0);
    const pct = totalDeptOverallAmount > 0 ? ((totalAmount / totalDeptOverallAmount) * 100).toFixed(1) + '%' : '0%';

    return {
      departmentName: d.departmentName,
      departmentGroup: d.departmentGroup,
      orderCount: d.orders.length,
      totalQuantity: totalQty,
      totalAmount,
      percentage: pct,
      receiverNames: Array.from(d.receivers).join(', ') || 'Đại diện khoa',
      items: Array.from(d.itemMap.values()),
    };
  });

  departmentRows.sort((a, b) => b.totalAmount - a.totalAmount);

  // Chi tiết từng dòng xuất cho từng khoa
  const departmentDetailRows: DepartmentDetailItem[] = [];
  relevantIssues.forEach((order) => {
    const cust = customers.find((c) => c.name === order.customerName || c.group === order.customerName);
    order.items.forEach((it) => {
      departmentDetailRows.push({
        date: order.date,
        orderCode: order.code,
        departmentName: order.customerName,
        departmentGroup: cust?.group || 'Khoa / Phòng Bệnh viện',
        receiverName: order.receiverName,
        sku: it.sku,
        name: it.name,
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
        reason: order.reason || 'Cấp phát phục vụ công tác khám chữa bệnh',
      });
    });
  });
  departmentDetailRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ==============================================================
  // 3. THỐNG KÊ NHẬP HÀNG TỪ CÁC NHÀ CUNG CẤP & ĐỐI TÁC
  // ==============================================================
  const relevantReceipts = receiptOrders.filter((rec) => {
    if (rec.date < startDate || rec.date > endDate) return false;
    if (isSpecificPartner && rec.supplierName !== selectedPartner) return false;
    return true;
  });

  const supMap = new Map<string, {
    supplierName: string;
    contactPerson: string;
    phone: string;
    receipts: StockReceiptOrder[];
    itemMap: Map<string, { sku: string; name: string; unit: string; quantity: number; unitPrice: number; totalPrice: number }>;
  }>();

  relevantReceipts.forEach((receipt) => {
    const supName = receipt.supplierName || 'Chưa xác định';
    if (!supMap.has(supName)) {
      const sup = suppliers.find((s) => s.name === supName);
      supMap.set(supName, {
        supplierName: supName,
        contactPerson: sup?.contactPerson || 'Phòng kinh doanh',
        phone: sup?.phone || '',
        receipts: [],
        itemMap: new Map(),
      });
    }

    const entry = supMap.get(supName)!;
    entry.receipts.push(receipt);

    receipt.items.forEach((item) => {
      if (!entry.itemMap.has(item.productId)) {
        entry.itemMap.set(item.productId, {
          sku: item.sku,
          name: item.name,
          unit: item.unit,
          quantity: 0,
          unitPrice: item.unitCost,
          totalPrice: 0,
        });
      }
      const it = entry.itemMap.get(item.productId)!;
      it.quantity += item.quantity;
      it.totalPrice += item.totalCost;
    });
  });

  const totalSupOverallAmount = Array.from(supMap.values()).reduce(
    (sum, s) => sum + s.receipts.reduce((tot, r) => tot + r.totalCost, 0),
    0
  );

  const supplierRows: SupplierSummaryItem[] = Array.from(supMap.values()).map((s) => {
    const totalQty = s.receipts.reduce((tot, r) => tot + r.totalQuantity, 0);
    const totalAmount = s.receipts.reduce((tot, r) => tot + r.totalCost, 0);
    const pct = totalSupOverallAmount > 0 ? ((totalAmount / totalSupOverallAmount) * 100).toFixed(1) + '%' : '0%';

    return {
      supplierName: s.supplierName,
      contactPerson: s.contactPerson,
      phone: s.phone,
      receiptCount: s.receipts.length,
      totalQuantity: totalQty,
      totalAmount,
      percentage: pct,
      items: Array.from(s.itemMap.values()),
    };
  });

  supplierRows.sort((a, b) => b.totalAmount - a.totalAmount);

  // Chi tiết từng dòng nhập từ nhà cung cấp
  const supplierDetailRows: SupplierDetailItem[] = [];
  relevantReceipts.forEach((rec) => {
    const sup = suppliers.find((s) => s.name === rec.supplierName);
    rec.items.forEach((it) => {
      supplierDetailRows.push({
        date: rec.date,
        receiptCode: rec.code,
        supplierName: rec.supplierName,
        contactPerson: sup?.contactPerson,
        sku: it.sku,
        name: it.name,
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: it.unitCost,
        totalPrice: it.totalCost,
        notes: rec.notes || 'Nhập kho phục vụ công tác bệnh viện',
      });
    });
  });
  supplierDetailRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ==============================================================
  // 4. DANH SÁCH TẤT CẢ CHỨNG TỪ XUẤT & NHẬP TRONG KỲ
  // ==============================================================
  const detailRows: ReportTransactionItem[] = [];

  if (transactionType === 'ALL' || transactionType === 'IN') {
    relevantReceipts.forEach((rec) => {
      rec.items.forEach((it) => {
        detailRows.push({
          date: rec.date,
          code: rec.code,
          type: 'Nhập kho',
          partner: rec.supplierName,
          sku: it.sku,
          name: it.name,
          unit: it.unit,
          quantity: it.quantity,
          unitPrice: it.unitCost,
          totalPrice: it.totalCost,
          notes: rec.notes || 'Nhập hàng vào Kho IT',
        });
      });
    });
  }

  if (transactionType === 'ALL' || transactionType === 'OUT') {
    relevantIssues.forEach((iss) => {
      iss.items.forEach((it) => {
        detailRows.push({
          date: iss.date,
          code: iss.code,
          type: 'Xuất kho',
          partner: iss.customerName,
          sku: it.sku,
          name: it.name,
          unit: it.unit,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
          notes: iss.reason || 'Xuất hàng cấp phát cho Khoa / Phòng',
        });
      });
    });
  }

  detailRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Nhãn thời gian
  const parts1 = startDate.split('-');
  const parts2 = endDate.split('-');
  const d1 = parts1.length === 3 ? `${parts1[2]}/${parts1[1]}/${parts1[0]}` : startDate;
  const d2 = parts2.length === 3 ? `${parts2[2]}/${parts2[1]}/${parts2[0]}` : endDate;
  const periodLabel = `Từ ${d1} đến ${d2}`;

  // Aggregates for departments and suppliers
  const totalDeptOrders = departmentRows.reduce((s, d) => s + d.orderCount, 0);
  const totalDeptQty = departmentRows.reduce((s, d) => s + d.totalQuantity, 0);
  const totalDeptAmount = departmentRows.reduce((s, d) => s + d.totalAmount, 0);

  const totalSupReceipts = supplierRows.reduce((s, r) => s + r.receiptCount, 0);
  const totalSupQty = supplierRows.reduce((s, r) => s + r.totalQuantity, 0);
  const totalSupAmount = supplierRows.reduce((s, r) => s + r.totalAmount, 0);

  return {
    summaryRows,
    detailRows,
    departmentRows,
    departmentDetailRows,
    supplierRows,
    supplierDetailRows,
    totalAggregates,
    departmentAggregates: {
      count: departmentRows.length,
      totalOrders: totalDeptOrders,
      totalQty: totalDeptQty,
      totalAmount: totalDeptAmount,
    },
    supplierAggregates: {
      count: supplierRows.length,
      totalReceipts: totalSupReceipts,
      totalQty: totalSupQty,
      totalAmount: totalSupAmount,
    },
    periodLabel,
    startDate,
    endDate,
  };
}

/**
 * Triggers complete Excel report download with all 4 sheets
 */
export function triggerFullStockReportExcelDownload(
  companyInfo: CompanyInfo,
  params: ComputeStockReportParams
) {
  const data = computeStockReportData(params);

  exportWarehouseReportToExcel({
    companyName: companyInfo.name,
    companyAddress: companyInfo.address,
    companyPhone: companyInfo.phone,
    companyTaxCode: companyInfo.taxCode,
    warehouseName: 'Kho IT - Thiết Bị Tin Học & Mực In',
    selectedPartner: params.selectedPartner || 'ALL',
    fromDate: data.startDate,
    toDate: data.endDate,
    periodLabel: data.periodLabel,
    summaryRows: data.summaryRows,
    detailRows: data.detailRows,
    departmentRows: data.departmentRows,
    departmentDetailRows: data.departmentDetailRows,
    supplierRows: data.supplierRows,
    supplierDetailRows: data.supplierDetailRows,
    totalAggregates: data.totalAggregates,
  });

  return data;
}

/**
 * Triggers Department Issue report download only
 */
export function triggerDepartmentExcelDownload(
  companyInfo: CompanyInfo,
  params: ComputeStockReportParams
) {
  const data = computeStockReportData(params);
  exportDepartmentReportOnlyToExcel(
    companyInfo,
    data.departmentRows,
    data.departmentDetailRows,
    data.startDate,
    data.endDate,
    data.periodLabel
  );
  return data;
}

/**
 * Triggers Supplier Receipt report download only
 */
export function triggerSupplierExcelDownload(
  companyInfo: CompanyInfo,
  params: ComputeStockReportParams
) {
  const data = computeStockReportData(params);
  exportSupplierReportOnlyToExcel(
    companyInfo,
    data.supplierRows,
    data.supplierDetailRows,
    data.startDate,
    data.endDate,
    data.periodLabel
  );
  return data;
}
