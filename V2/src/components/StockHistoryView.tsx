import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Info,
  MapPin,
  Printer,
  Search,
  Table,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';
import { exportStockHistoryToExcel } from '../utils/excelExporter';
import { triggerFullStockReportExcelDownload } from '../utils/stockReportHelper';
import { StockIssueOrder } from '../types';

type TxTypeFilter = 'ALL' | 'IN' | 'OUT';

interface FlattenedItemTransaction {
  id: string;
  orderId: string;
  date: string;
  code: string;
  type: 'Nhập kho' | 'Xuất kho';
  partner: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  warehouseName: string;
  createdBy: string;
  notes: string;
  rawIssueOrder?: StockIssueOrder;
}

interface FlattenedVoucher {
  id: string;
  date: string;
  code: string;
  type: 'Nhập kho' | 'Xuất kho';
  partner: string;
  warehouseName: string;
  createdBy: string;
  receiverName?: string;
  itemCount: number;
  totalQuantity: number;
  totalAmount: number;
  paymentStatus?: string;
  notes: string;
  items: {
    sku: string;
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  rawIssueOrder?: StockIssueOrder;
}

export const StockHistoryView: React.FC = () => {
  const {
    products,
    issueOrders,
    receiptOrders,
    customers,
    suppliers,
    systemLogs,
    companyInfo,
    setSelectedVoucherForPrint,
    setActiveTab,
  } = useWarehouse();

  // Navigation mode
  // Chế độ xem được điều khiển từ menu bên trái (Sidebar)
  const { historyViewMode: viewMode } = useWarehouse();

  // Filters
  const [selectedPartner, setSelectedPartner] = useState<string>('ALL');
  const [txTypeFilter, setTxTypeFilter] = useState<TxTypeFilter>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Date filters
  const [datePreset, setDatePreset] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Expanded voucher for accordion in VOUCHERS mode
  const [expandedVoucherId, setExpandedVoucherId] = useState<string | null>(null);

  // Excel state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Preset date handler
  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'TODAY') {
      setStartDate('2026-11-01');
      setEndDate('2026-11-01');
    } else if (preset === 'LAST_7_DAYS') {
      setStartDate('2026-10-25');
      setEndDate('2026-11-02');
    } else if (preset === 'LAST_30_DAYS') {
      setStartDate('2026-10-01');
      setEndDate('2026-11-02');
    } else if (preset === 'THIS_MONTH') {
      setStartDate('2026-11-01');
      setEndDate('2026-11-30');
    } else if (preset === 'LAST_MONTH') {
      setStartDate('2026-10-01');
      setEndDate('2026-10-31');
    } else if (preset === 'QUARTER_4') {
      setStartDate('2026-10-01');
      setEndDate('2026-12-31');
    } else if (preset === 'THIS_YEAR') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    }
  };

  // Build full partner options
  const partnerOptions = useMemo(() => {
    const list: { label: string; value: string }[] = [
      { label: '--- Tất cả đơn vị / đối tác ---', value: 'ALL' },
    ];

    customers.forEach((c) => {
      list.push({ label: `[Khoa/Phòng: ${c.group}] ${c.name}`, value: c.name });
    });

    suppliers.forEach((s) => {
      list.push({ label: `[Nhà cung cấp] ${s.name}`, value: s.name });
    });

    issueOrders.forEach((o) => {
      if (o.customerName && !list.some((p) => p.value === o.customerName)) {
        list.push({ label: `[Khách hàng] ${o.customerName}`, value: o.customerName });
      }
    });

    receiptOrders.forEach((r) => {
      if (r.supplierName && !list.some((p) => p.value === r.supplierName)) {
        list.push({ label: `[Nhà cung cấp] ${r.supplierName}`, value: r.supplierName });
      }
    });

    return list;
  }, [customers, suppliers, issueOrders, receiptOrders]);

  // Period label
  const periodLabel = useMemo(() => {
    if (!startDate && !endDate) return 'Toàn bộ thời gian';
    const d1 = startDate ? formatDate(startDate) : 'đầu kỳ';
    const d2 = endDate ? formatDate(endDate) : 'hiện tại';
    return `Từ ${d1} đến ${d2}`;
  }, [startDate, endDate]);

  const isSpecificPartner = selectedPartner !== 'ALL';

  // 1. Flatten all transactions into Line Items
  const allLineItems: FlattenedItemTransaction[] = useMemo(() => {
    const list: FlattenedItemTransaction[] = [];

    // Receipts
    receiptOrders.forEach((rec) => {
      rec.items.forEach((it, idx) => {
        const prod = products.find((p) => p.id === it.productId || p.sku === it.sku);
        list.push({
          id: `rec-item-${rec.id}-${idx}`,
          orderId: rec.id,
          date: rec.date,
          code: rec.code,
          type: 'Nhập kho',
          partner: rec.supplierName,
          sku: it.sku,
          name: it.name,
          category: prod?.category || 'Mực in & Linh kiện',
          unit: it.unit,
          quantity: it.quantity,
          unitPrice: it.unitCost,
          totalPrice: it.totalCost,
          warehouseName: rec.warehouseName || 'Kho IT',
          createdBy: rec.createdBy || 'Lê Hoàng Long',
          notes: rec.notes || 'Nhập kho bổ sung vật tư',
        });
      });
    });

    // Issues
    issueOrders.forEach((iss) => {
      iss.items.forEach((it, idx) => {
        const prod = products.find((p) => p.id === it.productId || p.sku === it.sku);
        list.push({
          id: `iss-item-${iss.id}-${idx}`,
          orderId: iss.id,
          date: iss.date,
          code: iss.code,
          type: 'Xuất kho',
          partner: iss.customerName,
          sku: it.sku,
          name: it.name,
          category: prod?.category || 'Mực in & Linh kiện',
          unit: it.unit,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
          warehouseName: iss.warehouseName || 'Kho IT',
          createdBy: iss.createdBy || 'Nguyễn Văn Tuấn',
          notes: iss.reason || 'Xuất hàng cho đối tác',
          rawIssueOrder: iss,
        });
      });
    });

    // Sort descending by date, then code
    list.sort((a, b) => {
      const cmp = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (cmp !== 0) return cmp;
      return b.code.localeCompare(a.code);
    });

    return list;
  }, [receiptOrders, issueOrders, products]);

  // 2. Flatten all Vouchers
  const allVouchers: FlattenedVoucher[] = useMemo(() => {
    const list: FlattenedVoucher[] = [];

    receiptOrders.forEach((rec) => {
      list.push({
        id: rec.id,
        date: rec.date,
        code: rec.code,
        type: 'Nhập kho',
        partner: rec.supplierName,
        warehouseName: rec.warehouseName || 'Kho IT',
        createdBy: rec.createdBy || 'Lê Hoàng Long',
        itemCount: rec.items.length,
        totalQuantity: rec.totalQuantity,
        totalAmount: rec.totalCost,
        paymentStatus: rec.paymentStatus || 'Đã thanh toán',
        notes: rec.notes || 'Phiếu nhập kho vật tư',
        items: rec.items.map((i) => ({
          sku: i.sku,
          name: i.name,
          unit: i.unit,
          quantity: i.quantity,
          unitPrice: i.unitCost,
          totalPrice: i.totalCost,
        })),
      });
    });

    issueOrders.forEach((iss) => {
      list.push({
        id: iss.id,
        date: iss.date,
        code: iss.code,
        type: 'Xuất kho',
        partner: iss.customerName,
        warehouseName: iss.warehouseName || 'Kho IT',
        createdBy: iss.createdBy || 'Nguyễn Văn Tuấn',
        receiverName: iss.receiverName,
        itemCount: iss.items.length,
        totalQuantity: iss.totalQuantity,
        totalAmount: iss.finalAmount,
        paymentStatus: iss.paymentStatus || 'Ghi công nợ',
        notes: iss.reason || 'Phiếu xuất kho bán buôn / dự án',
        items: iss.items.map((i) => ({
          sku: i.sku,
          name: i.name,
          unit: i.unit,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
        })),
        rawIssueOrder: iss,
      });
    });

    list.sort((a, b) => {
      const cmp = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (cmp !== 0) return cmp;
      return b.code.localeCompare(a.code);
    });

    return list;
  }, [receiptOrders, issueOrders]);

  // 3. Filtered Line Items
  const filteredLineItems = useMemo(() => {
    return allLineItems.filter((item) => {
      // Date range
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;

      // Partner
      if (isSpecificPartner && item.partner !== selectedPartner) return false;

      // Transaction Type
      if (txTypeFilter === 'IN' && item.type !== 'Nhập kho') return false;
      if (txTypeFilter === 'OUT' && item.type !== 'Xuất kho') return false;

      // Category
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const mCode = item.code.toLowerCase().includes(t);
        const mPartner = item.partner.toLowerCase().includes(t);
        const mSku = item.sku.toLowerCase().includes(t);
        const mName = item.name.toLowerCase().includes(t);
        const mNotes = item.notes.toLowerCase().includes(t);
        if (!mCode && !mPartner && !mSku && !mName && !mNotes) return false;
      }

      return true;
    });
  }, [allLineItems, startDate, endDate, isSpecificPartner, selectedPartner, txTypeFilter, categoryFilter, searchTerm]);

  // 4. Filtered Vouchers
  const filteredVouchers = useMemo(() => {
    return allVouchers.filter((voucher) => {
      if (startDate && voucher.date < startDate) return false;
      if (endDate && voucher.date > endDate) return false;
      if (isSpecificPartner && voucher.partner !== selectedPartner) return false;
      if (txTypeFilter === 'IN' && voucher.type !== 'Nhập kho') return false;
      if (txTypeFilter === 'OUT' && voucher.type !== 'Xuất kho') return false;

      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const mCode = voucher.code.toLowerCase().includes(t);
        const mPartner = voucher.partner.toLowerCase().includes(t);
        const mNotes = voucher.notes.toLowerCase().includes(t);
        const mItems = voucher.items.some(
          (it) => it.sku.toLowerCase().includes(t) || it.name.toLowerCase().includes(t)
        );
        if (!mCode && !mPartner && !mNotes && !mItems) return false;
      }

      return true;
    });
  }, [allVouchers, startDate, endDate, isSpecificPartner, selectedPartner, txTypeFilter, searchTerm]);

  // 5. Aggregate calculations
  const aggregates = useMemo(() => {
    let totalInQty = 0;
    let totalInAmount = 0;
    let totalOutQty = 0;
    let totalOutAmount = 0;

    filteredLineItems.forEach((item) => {
      if (item.type === 'Nhập kho') {
        totalInQty += item.quantity;
        totalInAmount += item.totalPrice;
      } else {
        totalOutQty += item.quantity;
        totalOutAmount += item.totalPrice;
      }
    });

    return {
      totalInQty,
      totalInAmount,
      totalOutQty,
      totalOutAmount,
      balanceQty: totalInQty - totalOutQty,
      balanceAmount: totalOutAmount - totalInAmount,
    };
  }, [filteredLineItems]);

  // Filtered system logs
  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return systemLogs;
    const t = searchTerm.toLowerCase();
    return systemLogs.filter(
      (log) => log.action.toLowerCase().includes(t) || log.details.toLowerCase().includes(t)
    );
  }, [systemLogs, searchTerm]);

  // Export to Excel handler
  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      exportStockHistoryToExcel({
        companyName: companyInfo.name,
        companyAddress: companyInfo.address,
        selectedPartner: selectedPartner,
        fromDate: startDate || '2026-01-01',
        toDate: endDate || '2026-12-31',
        periodLabel: periodLabel,
        itemRows: filteredLineItems.map((r) => ({
          date: r.date,
          code: r.code,
          type: r.type,
          partner: r.partner,
          sku: r.sku,
          name: r.name,
          unit: r.unit,
          quantity: r.quantity,
          unitPrice: r.unitPrice,
          totalPrice: r.totalPrice,
          warehouseName: r.warehouseName,
          notes: r.notes,
        })),
        voucherRows: filteredVouchers.map((v) => ({
          date: v.date,
          code: v.code,
          type: v.type,
          partner: v.partner,
          warehouseName: v.warehouseName,
          itemCount: v.itemCount,
          totalQuantity: v.totalQuantity,
          totalAmount: v.totalAmount,
          paymentStatus: v.paymentStatus,
          notes: v.notes,
        })),
        aggregates: {
          totalInQty: aggregates.totalInQty,
          totalInAmount: aggregates.totalInAmount,
          totalOutQty: aggregates.totalOutQty,
          totalOutAmount: aggregates.totalOutAmount,
        },
      });

      const partnerText = isSpecificPartner ? selectedPartner : 'Tất cả đơn vị';
      setNotice(
        `Đã xuất thành công tệp Excel Lịch Sử Xuất Nhập cho "${partnerText}" (${filteredLineItems.length} dòng hàng, ${filteredVouchers.length} chứng từ)!`
      );
      setTimeout(() => setNotice(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo tệp Excel lịch sử. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportStockReportExcel = () => {
    setIsExporting(true);
    try {
      triggerFullStockReportExcelDownload(companyInfo, {
        products,
        receiptOrders,
        issueOrders,
        startDate,
        endDate,
        selectedPartner,
        transactionType: txTypeFilter,
        categoryFilter,
        searchTerm,
      });
      const partnerText = isSpecificPartner ? selectedPartner : 'Tất cả đơn vị';
      setNotice(
        `Đã xuất thành công tệp Excel Báo Cáo Xuất-Nhập-Tồn 4 Trụ Cột cho "${partnerText}"!`
      );
      setTimeout(() => setNotice(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo tệp Excel báo cáo xuất nhập tồn. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* 1. Header Toolbar (Navigation tabs, Excel export, Print) */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs no-print select-none">
        <div className="flex items-center gap-2 font-bold text-slate-800 uppercase tracking-wide">
          {viewMode === 'LINE_ITEMS' && <><Table className="w-4 h-4 text-blue-600" /><span>Lịch Sử Dòng Hàng Hóa ({filteredLineItems.length})</span></>}
          {viewMode === 'VOUCHERS' && <><FileText className="w-4 h-4 text-blue-600" /><span>Danh Sách Chứng Từ ({filteredVouchers.length})</span></>}
          {viewMode === 'SYSTEM_LOGS' && <><History className="w-4 h-4 text-blue-600" /><span>Nhật Ký Thao Tác ({systemLogs.length})</span></>}
        </div>

        {/* Action Buttons: Switch to Xuất Nhập Tồn & Excel Export & Print */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('BAO_CAO_XUAT_NHAP_TON')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white rounded font-bold shadow-2xs transition cursor-pointer"
            title="Chuyển sang Bảng tổng hợp Xuất - Nhập - Tồn kho chuẩn 4 Trụ Cột (Tồn Đầu, Nhập, Xuất, Tồn Cuối)"
          >
            <BarChart3 className="w-4 h-4 text-amber-300" />
            <span>📊 Báo Cáo Xuất Nhập Tồn</span>
          </button>

          <button
            onClick={handleExportStockReportExcel}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded font-bold shadow-xs transition hover:scale-[1.01] cursor-pointer"
            title="Xuất trực tiếp Bảng Báo Cáo Xuất - Nhập - Tồn 4 Trụ Cột ra Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Xuất Excel Xuất-Nhập-Tồn</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded font-semibold shadow-2xs transition cursor-pointer"
            title="Tải toàn bộ lịch sử chi tiết từng dòng hàng hóa và chứng từ ra tệp Microsoft Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Xuất Excel Sổ Lịch Sử</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded border border-slate-300 font-medium shadow-2xs transition cursor-pointer"
            title="In sổ lịch sử chuẩn A4"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">In A4</span>
          </button>
        </div>
      </div>

      {/* 2. Comprehensive Filter Toolbar */}
      <div className="bg-[#f0f4f9] border-b border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs no-print shadow-2xs">
        {/* Left Side: Unit, Date Range, Transaction Type */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Đơn vị tùy chọn */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-blue-300 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold text-slate-700 whitespace-nowrap">Đơn Vị:</span>
            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="bg-blue-50/50 border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold text-blue-900 focus:outline-blue-500 max-w-xs truncate cursor-pointer"
            >
              {partnerOptions.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {isSpecificPartner && (
              <button
                onClick={() => setSelectedPartner('ALL')}
                className="text-slate-400 hover:text-red-600 p-0.5"
                title="Bỏ chọn đơn vị, xem tất cả"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-300 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-700">Kỳ:</span>
            <select
              value={datePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs font-medium text-slate-800 focus:outline-blue-500 cursor-pointer"
            >
              <option value="ALL">Toàn bộ thời gian</option>
              <option value="THIS_MONTH">Tháng 11/2026 (Hiện tại)</option>
              <option value="LAST_MONTH">Tháng 10/2026</option>
              <option value="TODAY">Hôm nay (01/11/2026)</option>
              <option value="LAST_7_DAYS">7 ngày gần nhất</option>
              <option value="LAST_30_DAYS">30 ngày gần nhất</option>
              <option value="QUARTER_4">Quý 4/2026</option>
              <option value="THIS_YEAR">Cả năm 2026</option>
              <option value="CUSTOM">Tự chọn ngày...</option>
            </select>
          </div>

          {/* Date range inputs */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-300 shadow-2xs">
            <span className="font-semibold text-slate-700">Từ:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset('CUSTOM');
              }}
              className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono font-medium text-slate-800 focus:outline-blue-500"
            />
            <span className="font-semibold text-slate-700">Đến:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset('CUSTOM');
              }}
              className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono font-medium text-slate-800 focus:outline-blue-500"
            />
          </div>

          {/* Loại giao dịch */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-300 shadow-2xs">
            <span className="font-semibold text-slate-700">Loại:</span>
            <select
              value={txTypeFilter}
              onChange={(e) => setTxTypeFilter(e.target.value as TxTypeFilter)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs font-medium text-slate-800 focus:outline-blue-500 cursor-pointer"
            >
              <option value="ALL">Tất cả (Nhập & Xuất)</option>
              <option value="OUT">Chỉ Xuất hàng (PXK)</option>
              <option value="IN">Chỉ Nhập hàng (PNK)</option>
            </select>
          </div>
        </div>

        {/* Right Side: Category and Search */}
        <div className="flex items-center gap-2">
          {viewMode === 'LINE_ITEMS' && (
            <div className="flex items-center gap-1.5">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-blue-500 font-medium"
              >
                <option value="ALL">Tất cả nhóm hàng</option>
                <option value="Mực in">Mực in</option>
                <option value="Hộp mực đổ">Hộp mực đổ</option>
                <option value="Linh kiện máy in máy tính">Linh kiện máy in máy tính</option>
              </select>
            </div>
          )}

          <div className="relative w-52 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm số phiếu, đối tác, SP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded pl-7 pr-2 py-1 text-xs focus:outline-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Export notification toast */}
      {notice && (
        <div className="bg-emerald-50 border-b border-emerald-300 px-4 py-2 text-xs text-emerald-900 flex items-center justify-between no-print animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900 ml-4">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Company & Unit Identity Strip */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="font-bold text-slate-900 uppercase">
            {companyInfo.name}
          </div>
          <span className="text-slate-400">•</span>
          <div className="text-slate-600 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{companyInfo.address}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded font-medium flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
            <span>Đơn vị: <strong>{isSpecificPartner ? selectedPartner : 'Tất cả đơn vị'}</strong></span>
          </div>
          <div className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
            {periodLabel}
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="bg-slate-50 border-b border-slate-200 p-2.5 grid grid-cols-2 md:grid-cols-4 gap-2.5 no-print">
        <div className="bg-white border border-slate-200 rounded p-2 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">Tổng Chứng Từ / Dòng Giao Dịch</div>
          <div className="text-base font-mono font-bold text-slate-800 mt-0.5">
            {filteredVouchers.length}{' '}
            <span className="text-xs font-normal text-slate-500">phiếu</span>
            <span className="text-xs font-normal text-slate-400 ml-1.5">
              ({filteredLineItems.length} dòng hàng)
            </span>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded p-2 shadow-2xs">
          <div className="text-[11px] text-amber-800 font-medium flex items-center justify-between">
            <span>Tổng Hàng Nhập Kho</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-base font-mono font-bold text-amber-800 mt-0.5">
            +{formatNumber(aggregates.totalInQty)}{' '}
            <span className="text-xs font-normal text-amber-700">sp</span>
            <span className="text-[11px] font-normal text-slate-600 ml-2">
              ({formatCurrency(aggregates.totalInAmount)})
            </span>
          </div>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 rounded p-2 shadow-2xs">
          <div className="text-[11px] text-blue-800 font-medium flex items-center justify-between">
            <span>Tổng Hàng Xuất Kho</span>
            <TrendingDown className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-base font-mono font-bold text-blue-800 mt-0.5">
            -{formatNumber(aggregates.totalOutQty)}{' '}
            <span className="text-xs font-normal text-blue-700">sp</span>
            <span className="text-[11px] font-normal text-slate-600 ml-2">
              ({formatCurrency(aggregates.totalOutAmount)})
            </span>
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded p-2 shadow-2xs">
          <div className="text-[11px] text-emerald-800 font-medium flex items-center justify-between">
            <span>Chênh Lệch (Xuất - Nhập)</span>
            <Boxes className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-base font-mono font-bold text-emerald-900 mt-0.5">
            {aggregates.totalOutQty - aggregates.totalInQty > 0 ? '+' : ''}
            {formatNumber(aggregates.totalOutQty - aggregates.totalInQty)}{' '}
            <span className="text-xs font-normal text-emerald-700">sp</span>
            <span className="text-[11px] font-bold text-emerald-700 ml-2">
              ({formatCurrency(aggregates.totalOutAmount - aggregates.totalInAmount)})
            </span>
          </div>
        </div>
      </div>

      {/* MODE 1: LỊCH SỬ DÒNG HÀNG HÓA CHI TIẾT */}
      {viewMode === 'LINE_ITEMS' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#eef2f7] text-slate-700 sticky top-0 border-b border-slate-300 font-semibold z-10 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Ngày Ghi Sổ</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Số Phiếu</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Loại Giao Dịch</th>
                  <th className="py-2.5 px-3">Đơn Vị / Đối Tác</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Mã Hàng (SKU)</th>
                  <th className="py-2.5 px-3">Tên Mặt Hàng / Quy Cách</th>
                  <th className="py-2.5 px-3 text-center">ĐVT</th>
                  <th className="py-2.5 px-3 text-right">Số Lượng</th>
                  <th className="py-2.5 px-3 text-right">Đơn Giá (đ)</th>
                  <th className="py-2.5 px-3 text-right">Thành Tiền (đ)</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Kho Hàng</th>
                  <th className="py-2.5 px-3">Diễn Giải / Lý Do</th>
                  <th className="py-2.5 px-3 text-center w-20">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLineItems.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-14 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Không tìm thấy dữ liệu xuất nhập hàng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredLineItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-blue-50/50 transition ${
                        idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                      }`}
                    >
                      <td className="py-2 px-3 text-center font-mono text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {item.code}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                            item.type === 'Nhập kho'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800 max-w-xs truncate">
                        {item.partner}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {item.sku}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900 max-w-xs">
                        <div>{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.category}</div>
                      </td>
                      <td className="py-2 px-3 text-center text-slate-600">{item.unit}</td>
                      <td
                        className={`py-2 px-3 text-right font-mono font-bold text-xs ${
                          item.type === 'Nhập kho' ? 'text-amber-700' : 'text-blue-700'
                        }`}
                      >
                        {item.type === 'Nhập kho' ? `+${item.quantity}` : `-${item.quantity}`}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.totalPrice)}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-600 whitespace-nowrap">
                        {item.warehouseName}
                      </td>
                      <td className="py-2 px-3 text-slate-600 italic max-w-xs truncate">
                        {item.notes}
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        {item.rawIssueOrder ? (
                          <button
                            onClick={() => setSelectedVoucherForPrint(item.rawIssueOrder!)}
                            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded font-medium text-[11px] flex items-center gap-1 mx-auto cursor-pointer"
                            title="In phiếu xuất kho A4"
                          >
                            <Eye className="w-3 h-3" />
                            <span>In Phiếu</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">--</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Totals */}
          <div className="bg-[#2c4779] text-white px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono shadow-inner">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider">TỔNG LỊCH SỬ XUẤT NHẬP:</span>
              <span className="text-blue-200">({filteredLineItems.length} dòng hàng)</span>
            </div>
            <div className="flex items-center gap-5">
              <div>
                Tổng Nhập: <strong className="text-amber-300">+{formatNumber(aggregates.totalInQty)} sp</strong>{' '}
                <span className="text-amber-200 font-normal">({formatCurrency(aggregates.totalInAmount)})</span>
              </div>
              <div>
                Tổng Xuất: <strong className="text-sky-300">-{formatNumber(aggregates.totalOutQty)} sp</strong>{' '}
                <span className="text-sky-200 font-normal">({formatCurrency(aggregates.totalOutAmount)})</span>
              </div>
              <div>
                Tổng Doanh Số & Giá Trị:{' '}
                <strong className="text-emerald-300 text-sm font-bold">
                  {formatCurrency(aggregates.totalInAmount + aggregates.totalOutAmount)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: DANH SÁCH CHỨNG TỪ (THEO PHIẾU VOUCHERS) */}
      {viewMode === 'VOUCHERS' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#eef2f7] text-slate-700 sticky top-0 border-b border-slate-300 font-semibold z-10 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Ngày Lập</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Số Chứng Từ</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Loại Phiếu</th>
                  <th className="py-2.5 px-3">Đơn Vị / Đối Tác</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Kho Hàng</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Người Lập</th>
                  <th className="py-2.5 px-3 text-center">Số Mặt Hàng</th>
                  <th className="py-2.5 px-3 text-right">Tổng Số Lượng</th>
                  <th className="py-2.5 px-3 text-right">Tổng Tiền (đ)</th>
                  <th className="py-2.5 px-3">Thanh Toán</th>
                  <th className="py-2.5 px-3">Ghi Chú</th>
                  <th className="py-2.5 px-3 text-center w-24">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-14 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Không tìm thấy chứng từ nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((voucher, idx) => {
                    const isExpanded = expandedVoucherId === voucher.id;
                    return (
                      <React.Fragment key={voucher.id}>
                        <tr
                          className={`hover:bg-blue-50/50 transition cursor-pointer ${
                            isExpanded ? 'bg-blue-50/70 font-medium' : idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                          }`}
                          onClick={() => setExpandedVoucherId(isExpanded ? null : voucher.id)}
                        >
                          <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                            {formatDate(voucher.date)}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              {voucher.code}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                                voucher.type === 'Nhập kho'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-blue-100 text-blue-900 border border-blue-200'
                              }`}
                            >
                              {voucher.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs truncate">
                            {voucher.partner}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {voucher.warehouseName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {voucher.createdBy}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                            {voucher.itemCount} SP
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-mono font-bold ${
                              voucher.type === 'Nhập kho' ? 'text-amber-700' : 'text-blue-700'
                            }`}
                          >
                            {voucher.type === 'Nhập kho' ? `+${voucher.totalQuantity}` : `-${voucher.totalQuantity}`}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(voucher.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {voucher.paymentStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 italic max-w-xs truncate">
                            {voucher.notes}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {voucher.rawIssueOrder ? (
                              <button
                                onClick={() => setSelectedVoucherForPrint(voucher.rawIssueOrder!)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-medium text-[11px] flex items-center gap-1 mx-auto cursor-pointer"
                                title="In phiếu xuất kho A4"
                              >
                                <Eye className="w-3 h-3" />
                                <span>In Phiếu A4</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">Đã nhập kho</span>
                            )}
                          </td>
                        </tr>

                        {/* Accordion breakdown of items inside this voucher */}
                        {isExpanded && (
                          <tr className="bg-blue-50/30">
                            <td colSpan={13} className="p-3 pl-12 border-y border-blue-200">
                              <div className="bg-white rounded border border-blue-200 overflow-hidden shadow-2xs">
                                <div className="bg-blue-100/70 px-3 py-1.5 font-bold text-blue-900 text-[11px] flex items-center justify-between">
                                  <span>Chi tiết các mặt hàng trong chứng từ {voucher.code}</span>
                                  <span>Tổng cộng: {voucher.items.length} mặt hàng</span>
                                </div>
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[10px]">
                                    <tr>
                                      <th className="py-1.5 px-3 w-8 text-center">STT</th>
                                      <th className="py-1.5 px-3">Mã Hàng</th>
                                      <th className="py-1.5 px-3">Tên Hàng Hóa</th>
                                      <th className="py-1.5 px-3 text-center">ĐVT</th>
                                      <th className="py-1.5 px-3 text-right">Số Lượng</th>
                                      <th className="py-1.5 px-3 text-right">Đơn Giá (đ)</th>
                                      <th className="py-1.5 px-3 text-right">Thành Tiền (đ)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                                    {voucher.items.map((it, i) => (
                                      <tr key={i} className="hover:bg-slate-50">
                                        <td className="py-1.5 px-3 text-center text-slate-400">{i + 1}</td>
                                        <td className="py-1.5 px-3 font-bold text-blue-700">{it.sku}</td>
                                        <td className="py-1.5 px-3 font-sans text-slate-900">{it.name}</td>
                                        <td className="py-1.5 px-3 text-center font-sans text-slate-600">{it.unit}</td>
                                        <td className="py-1.5 px-3 text-right font-bold text-slate-800">
                                          {formatNumber(it.quantity)}
                                        </td>
                                        <td className="py-1.5 px-3 text-right text-slate-600">
                                          {formatCurrency(it.unitPrice)}
                                        </td>
                                        <td className="py-1.5 px-3 text-right font-bold text-slate-900">
                                          {formatCurrency(it.totalPrice)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-[#2c4779] text-white px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono shadow-inner">
            <div>
              Tổng số chứng từ: <strong>{filteredVouchers.length}</strong> phiếu
            </div>
            <div className="flex items-center gap-6">
              <div>
                Tổng SL Hàng:{' '}
                <strong className="text-emerald-300">
                  {formatNumber(filteredVouchers.reduce((s, v) => s + v.totalQuantity, 0))} sp
                </strong>
              </div>
              <div>
                Tổng Tiền Chứng Từ:{' '}
                <strong className="text-amber-300 text-sm font-bold">
                  {formatCurrency(filteredVouchers.reduce((s, v) => s + v.totalAmount, 0))}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: NHẬT KÝ THAO TÁC HỆ THỐNG */}
      {viewMode === 'SYSTEM_LOGS' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Nhật ký kiểm toán toàn bộ hoạt động (Thêm/Sửa/Xóa/Xuất/Nhập kho)
            </span>
            <span className="font-mono text-slate-500">Tổng: {filteredLogs.length} bản ghi</span>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-slate-50/50">
            <div className="max-w-4xl mx-auto space-y-2.5">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Chưa có sự kiện nào được ghi nhận.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded bg-white border border-slate-200 hover:border-slate-300 shadow-2xs text-xs transition"
                  >
                    <div className="mt-0.5 shrink-0">
                      {log.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : log.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : log.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{log.action}</span>
                        <span className="font-mono text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
