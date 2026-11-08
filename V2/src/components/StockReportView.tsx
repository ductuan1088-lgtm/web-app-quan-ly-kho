import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Package,
  Printer,
  Search,
  Table,
  TrendingDown,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';
import {
  DepartmentSummaryItem,
  DepartmentDetailItem,
  SupplierSummaryItem,
  SupplierDetailItem,
  ReportSummaryItem,
  ReportTransactionItem,
} from '../utils/excelExporter';
import {
  computeStockReportData,
  triggerFullStockReportExcelDownload,
  triggerDepartmentExcelDownload,
  triggerSupplierExcelDownload,
} from '../utils/stockReportHelper';

type ReportTabType = 'XUAT_NHAP_TON' | 'KHOA_PHONG' | 'NHA_CUNG_CAP' | 'CHI_TIET_THANG' | 'THE_KHO';
type TransactionTypeFilter = 'ALL' | 'IN' | 'OUT';

export const StockReportView: React.FC = () => {
  const {
    products,
    issueOrders,
    receiptOrders,
    customers,
    suppliers,
    getProductStockLedger,
    companyInfo,
    setSelectedVoucherForPrint,
  } = useWarehouse();

  // Navigation states
  const [activeReportTab, setActiveReportTab] = useState<ReportTabType>('XUAT_NHAP_TON');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Customizable Unit / Partner filter
  const [selectedPartner, setSelectedPartner] = useState<string>('ALL');
  const [onlyTransactedItems, setOnlyTransactedItems] = useState<boolean>(false);

  // 2. Date Range filters (từ ngày .. đến ngày)
  const [datePreset, setDatePreset] = useState<string>('THIS_MONTH');
  const [startDate, setStartDate] = useState<string>('2026-11-01');
  const [endDate, setEndDate] = useState<string>('2026-11-30');

  // 3. Transaction Type filter
  const [transactionType, setTransactionType] = useState<TransactionTypeFilter>('ALL');

  // Excel export & dropdown feedback
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Selected item detail modal states
  const [selectedDeptForDetail, setSelectedDeptForDetail] = useState<DepartmentSummaryItem | null>(null);
  const [selectedSupForDetail, setSelectedSupForDetail] = useState<SupplierSummaryItem | null>(null);

  // Preset Date Handlers
  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    const currentYear = 2026; // System base year

    if (preset === 'TODAY') {
      const today = `${currentYear}-11-04`;
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'THIS_WEEK') {
      setStartDate(`${currentYear}-11-02`);
      setEndDate(`${currentYear}-11-08`);
    } else if (preset === 'THIS_MONTH') {
      setStartDate(`${currentYear}-11-01`);
      setEndDate(`${currentYear}-11-30`);
    } else if (preset === 'LAST_MONTH') {
      setStartDate(`${currentYear}-10-01`);
      setEndDate(`${currentYear}-10-31`);
    } else if (preset === 'QUARTER_4') {
      setStartDate(`${currentYear}-10-01`);
      setEndDate(`${currentYear}-12-31`);
    } else if (preset === 'THIS_YEAR') {
      setStartDate(`${currentYear}-01-01`);
      setEndDate(`${currentYear}-12-31`);
    } else if (preset === 'ALL') {
      setStartDate('2025-01-01');
      setEndDate('2026-12-31');
    }
  };

  // Distinct category list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Combined Partner Options
  const partnerOptions = useMemo(() => {
    const list: { label: string; value: string; type: 'all' | 'customer' | 'supplier' }[] = [
      { label: '--- Tất cả đơn vị (Toàn bộ đối tác) ---', value: 'ALL', type: 'all' },
    ];

    customers.forEach((c) => {
      list.push({ label: `[Khoa/Phòng: ${c.group}] ${c.name}`, value: c.name, type: 'customer' });
    });

    suppliers.forEach((s) => {
      list.push({ label: `[Nhà cung cấp] ${s.name}`, value: s.name, type: 'supplier' });
    });

    issueOrders.forEach((o) => {
      if (o.customerName && !list.some((p) => p.value === o.customerName)) {
        list.push({ label: `[Đơn vị nhận] ${o.customerName}`, value: o.customerName, type: 'customer' });
      }
    });

    receiptOrders.forEach((r) => {
      if (r.supplierName && !list.some((p) => p.value === r.supplierName)) {
        list.push({ label: `[Đơn vị giao] ${r.supplierName}`, value: r.supplierName, type: 'supplier' });
      }
    });

    return list;
  }, [customers, suppliers, issueOrders, receiptOrders]);

  const isSpecificPartner = selectedPartner !== 'ALL';

  // Compute all report data using our centralized helper
  const computedData = useMemo(() => {
    return computeStockReportData({
      products,
      receiptOrders,
      issueOrders,
      customers,
      suppliers,
      startDate,
      endDate,
      selectedPartner,
      transactionType,
      categoryFilter,
      searchTerm,
      onlyTransactedItems,
    });
  }, [
    products,
    receiptOrders,
    issueOrders,
    customers,
    suppliers,
    startDate,
    endDate,
    selectedPartner,
    transactionType,
    categoryFilter,
    searchTerm,
    onlyTransactedItems,
  ]);

  const {
    summaryRows: filteredSummary,
    detailRows: detailedTransactions,
    departmentRows,
    departmentDetailRows,
    supplierRows,
    supplierDetailRows,
    totalAggregates,
    departmentAggregates,
    supplierAggregates,
    periodLabel,
  } = computedData;

  // Filtered detailed transactions by search term
  const filteredTransactions = useMemo(() => {
    if (!searchTerm.trim()) return detailedTransactions;
    const t = searchTerm.toLowerCase();
    return detailedTransactions.filter(
      (m) =>
        m.code.toLowerCase().includes(t) ||
        m.partner.toLowerCase().includes(t) ||
        m.sku.toLowerCase().includes(t) ||
        m.name.toLowerCase().includes(t)
    );
  }, [detailedTransactions, searchTerm]);

  // Stock card for selected product
  const stockLedger = useMemo(() => {
    if (!selectedProductId) return [];
    return getProductStockLedger(selectedProductId);
  }, [selectedProductId, getProductStockLedger]);

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Handler for full Excel Export (4 sheets)
  const handleExportFullExcel = () => {
    setIsExportingExcel(true);
    setIsExportMenuOpen(false);
    try {
      triggerFullStockReportExcelDownload(companyInfo, {
        products,
        receiptOrders,
        issueOrders,
        customers,
        suppliers,
        startDate,
        endDate,
        selectedPartner,
        transactionType,
        categoryFilter,
        searchTerm,
        onlyTransactedItems,
      });

      const partnerText = isSpecificPartner ? selectedPartner : 'Toàn bộ bệnh viện';
      setExportNotice(
        `Đã xuất thành công tệp Excel ĐẦY ĐỦ 4 SHEET (Báo cáo X-N-T, Xuất Khoa Phòng, Nhập NCC, Sổ Chứng Từ) cho "${partnerText}" (${periodLabel})!`
      );
      setTimeout(() => setExportNotice(null), 6000);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo tệp Excel. Vui lòng kiểm tra lại!');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Handler for Department Issue report only
  const handleExportDepartmentExcel = () => {
    setIsExportingExcel(true);
    setIsExportMenuOpen(false);
    try {
      triggerDepartmentExcelDownload(companyInfo, {
        products,
        receiptOrders,
        issueOrders,
        customers,
        suppliers,
        startDate,
        endDate,
        selectedPartner,
      });
      setExportNotice(`Đã xuất thành công tệp Excel Báo Cáo Xuất Cấp Phát Cho Các Khoa / Phòng (${periodLabel})!`);
      setTimeout(() => setExportNotice(null), 6000);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo tệp Excel khoa phòng. Vui lòng thử lại!');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Handler for Supplier Receipt report only
  const handleExportSupplierExcel = () => {
    setIsExportingExcel(true);
    setIsExportMenuOpen(false);
    try {
      triggerSupplierExcelDownload(companyInfo, {
        products,
        receiptOrders,
        issueOrders,
        customers,
        suppliers,
        startDate,
        endDate,
        selectedPartner,
      });
      setExportNotice(`Đã xuất thành công tệp Excel Báo Cáo Nhập Hàng Từ Các Nhà Cung Cấp (${periodLabel})!`);
      setTimeout(() => setExportNotice(null), 6000);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo tệp Excel nhà cung cấp. Vui lòng thử lại!');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* 1. Header Toolbar with Tab Switcher, Unit Filter, Date Range & Excel Button */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs no-print select-none">
        {/* Report Tab Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400">:::</span>
          <div className="flex items-center gap-1 bg-white border border-slate-300 p-0.5 rounded shadow-2xs">
            <button
              onClick={() => setActiveReportTab('XUAT_NHAP_TON')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                activeReportTab === 'XUAT_NHAP_TON'
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>1. Tổng Hợp {isSpecificPartner ? 'Theo Đơn Vị' : 'Nhập - Xuất - Tồn (4 Trụ Cột)'}</span>
            </button>

            <button
              onClick={() => setActiveReportTab('CHI_TIET_THANG')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                activeReportTab === 'CHI_TIET_THANG'
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Sổ Chi Tiết Xuất - Nhập - Tồn ({detailedTransactions.length})</span>
            </button>

            <button
              onClick={() => setActiveReportTab('KHOA_PHONG')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                activeReportTab === 'KHOA_PHONG'
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>3. Xuất Cấp Phát Khoa / Phòng ({departmentRows.length})</span>
            </button>

            <button
              onClick={() => setActiveReportTab('NHA_CUNG_CAP')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                activeReportTab === 'NHA_CUNG_CAP'
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>4. Nhập Từ Nhà Cung Cấp ({supplierRows.length})</span>
            </button>

            <button
              onClick={() => setActiveReportTab('THE_KHO')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                activeReportTab === 'THE_KHO'
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>5. Sổ Thẻ Kho Từng Mặt Hàng</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: Multi-Sheet Excel Export & Print */}
        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              disabled={isExportingExcel}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded font-bold shadow-xs transition hover:scale-[1.01] cursor-pointer"
              title="Xuất file Excel có kẻ khung viền ô đầy đủ, chuẩn mẫu kế toán"
            >
              <FileSpreadsheet className={`w-4 h-4 text-emerald-100 ${isExportingExcel ? 'animate-bounce' : ''}`} />
              <span>{isExportingExcel ? 'Đang xuất...' : 'Xuất Excel Khung Viền Đầy Đủ'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-200" />
            </button>

            {/* Dropdown Menu for Excel Export */}
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-88 bg-white rounded-lg shadow-xl border border-slate-300 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Xuất Báo Cáo Excel (Khung Viền Đầy Đủ)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Kẻ viền từng ô
                  </span>
                </div>

                <button
                  onClick={handleExportFullExcel}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 transition flex items-start gap-2.5 group cursor-pointer border-b border-slate-100"
                >
                  <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 flex items-center gap-1.5">
                      <span>⭐ Xuất Toàn Bộ Báo Cáo (Đầy đủ 4 Sheet)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      1. Tổng hợp X-N-T (4 trụ cột) · 2. Sổ chi tiết từng lô/chứng từ · 3. Xuất Khoa Phòng · 4. Nhập NCC. <span className="text-emerald-700 font-semibold">Tất cả đều kẻ khung viền ô đầy đủ.</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleExportDepartmentExcel}
                  className="w-full text-left px-3.5 py-2 hover:bg-purple-50 transition flex items-start gap-2.5 group cursor-pointer border-b border-slate-100"
                >
                  <div className="w-7 h-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-purple-800">
                      Xuất Báo Cáo Xuất Cấp Phát Khoa / Phòng
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Kẻ khung viền đầy đủ bảng tổng hợp & chi tiết từng mặt hàng cấp phát
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleExportSupplierExcel}
                  className="w-full text-left px-3.5 py-2 hover:bg-amber-50 transition flex items-start gap-2.5 group cursor-pointer border-b border-slate-100"
                >
                  <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-amber-800">
                      Xuất Báo Cáo Nhập Hàng Từ Nhà Cung Cấp
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Kẻ khung viền đầy đủ bảng tổng hợp & chi tiết từng lô hàng nhập từ NCC
                    </div>
                  </div>
                </button>

                <div className="px-3 pt-2 pb-1 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Kho IT · CÔNG TY BỆNH VIỆN CP VPMED</span>
                  <button
                    onClick={() => setIsExportMenuOpen(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded border border-slate-300 font-medium shadow-2xs transition cursor-pointer"
            title="In bảng báo cáo chuẩn A4"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">In A4</span>
          </button>
        </div>
      </div>

      {/* 2. Comprehensive Filter Bar (Tùy chọn kỳ, Từ ngày .. Đến ngày, Đơn vị tùy chọn, Loại GD) */}
      <div className="bg-[#f0f4f9] border-b border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs no-print shadow-2xs">
        {/* Left Side: Unit & Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Unit / Partner Selector (Đơn vị tùy chọn) */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-blue-300 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold text-slate-700 whitespace-nowrap">Đơn Vị:</span>
            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="bg-blue-50/50 border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold text-blue-900 focus:outline-blue-500 max-w-xs truncate cursor-pointer"
              title="Chọn đơn vị khách hàng, phòng ban hoặc nhà cung cấp để xem báo cáo nhập xuất"
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
                title="Bỏ lọc đơn vị, xem tất cả"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-300 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-700">Tùy Chọn:</span>
            <select
              value={datePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs font-medium text-slate-800 focus:outline-blue-500 cursor-pointer"
            >
              <option value="THIS_MONTH">Tháng 11/2026 (Hiện tại)</option>
              <option value="LAST_MONTH">Tháng 10/2026 (Tháng trước)</option>
              <option value="THIS_WEEK">Tuần này</option>
              <option value="TODAY">Hôm nay</option>
              <option value="QUARTER_4">Quý 4/2026</option>
              <option value="THIS_YEAR">Cả năm 2026</option>
              <option value="ALL">Toàn bộ thời gian</option>
            </select>
          </div>

          {/* Date range inputs */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-300 shadow-2xs font-mono">
            <span className="text-slate-500 font-sans">Từ:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset('CUSTOM');
              }}
              className="border border-slate-300 rounded px-1.5 py-0.5 text-xs focus:outline-blue-500"
            />
            <span className="text-slate-500 font-sans">Đến:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset('CUSTOM');
              }}
              className="border border-slate-300 rounded px-1.5 py-0.5 text-xs focus:outline-blue-500"
            />
          </div>

          {/* Transaction Type Filter */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-slate-300 shadow-2xs">
            <span className="font-medium text-slate-700">Giao dịch:</span>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as TransactionTypeFilter)}
              className="border border-slate-300 rounded px-2 py-0.5 text-xs focus:outline-blue-500 cursor-pointer"
            >
              <option value="ALL">Tất cả (Nhập & Xuất)</option>
              <option value="OUT">Chỉ xuất cho đơn vị</option>
              <option value="IN">Chỉ nhập từ đơn vị</option>
            </select>
          </div>
        </div>

        {/* Right Side: Product Category & Search */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">Tất cả nhóm ({products.length} SP)</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã hoặc tên hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded pl-8 pr-2.5 py-1 text-xs focus:outline-blue-500 w-48 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Export notification toast */}
      {exportNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md transition animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
            <span>{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-emerald-100 hover:text-white ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Filter Summary Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-600 no-print">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">{companyInfo.name}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">{companyInfo.address}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 font-semibold">
            Đang chọn: {isSpecificPartner ? selectedPartner : 'Tất cả đơn vị'}
          </span>
          <div className="text-slate-500 font-mono text-[11px]">
            {periodLabel}
          </div>
        </div>
      </div>

      {/* VIEW 1: BÁO CÁO TỔNG HỢP THEO ĐƠN VỊ HOẶC XUẤT NHẬP TỒN (4 TRỤ CỘT) */}
      {activeReportTab === 'XUAT_NHAP_TON' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* 4 KPI Summary Cards matching 4 pillars */}
          <div className="bg-slate-50 border-b border-slate-200 p-2.5 grid grid-cols-2 lg:grid-cols-4 gap-2.5 no-print">
            {/* Card 1: TỒN ĐẦU KỲ */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-2.5 shadow-2xs">
              <div className="text-[11px] text-blue-900 font-bold flex items-center justify-between">
                <span>1. TỒN ĐẦU KỲ ({periodLabel})</span>
                <Boxes className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-mono font-bold text-blue-950">
                  {formatNumber(totalAggregates.opening)}{' '}
                  <span className="text-xs font-normal text-blue-700">sp</span>
                </span>
                <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100/80 px-1.5 py-0.5 rounded">
                  {formatCurrency(totalAggregates.openingValue)}
                </span>
              </div>
            </div>

            {/* Card 2: NHẬP TRONG KỲ */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 shadow-2xs">
              <div className="text-[11px] text-amber-900 font-bold flex items-center justify-between">
                <span>2. NHẬP TRONG KỲ (TỪ NCC)</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-mono font-bold text-amber-900">
                  +{formatNumber(totalAggregates.in)}{' '}
                  <span className="text-xs font-normal text-amber-700">sp</span>
                </span>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                  {formatCurrency(totalAggregates.inValue)}
                </span>
              </div>
            </div>

            {/* Card 3: XUẤT CẤP PHÁT KHOA PHÒNG */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-2.5 shadow-2xs">
              <div className="text-[11px] text-purple-900 font-bold flex items-center justify-between">
                <span>3. XUẤT CẤP PHÁT KHOA PHÒNG</span>
                <TrendingDown className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-mono font-bold text-purple-900">
                  -{formatNumber(totalAggregates.out)}{' '}
                  <span className="text-xs font-normal text-purple-700">sp</span>
                </span>
                <span className="text-xs font-mono font-bold text-purple-800 bg-purple-100/80 px-1.5 py-0.5 rounded">
                  {formatCurrency(totalAggregates.outValue)}
                </span>
              </div>
            </div>

            {/* Card 4: TỒN CUỐI KỲ */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 shadow-2xs">
              <div className="text-[11px] text-emerald-900 font-bold flex items-center justify-between">
                <span>4. TỒN CUỐI KỲ (TỒN KHO)</span>
                <Package className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-mono font-bold text-emerald-950">
                  {formatNumber(totalAggregates.closing)}{' '}
                  <span className="text-xs font-normal text-emerald-700">sp</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                  {formatCurrency(totalAggregates.value)}
                </span>
              </div>
            </div>
          </div>

          {/* Main 4-Pillar Inventory Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#eef2f7] text-slate-700 sticky top-0 border-b border-slate-300 font-semibold z-10 text-[11px]">
                {/* Level 1 Header: Pillar Groups */}
                <tr>
                  <th rowSpan={2} className="py-2 px-3 w-8 text-center border-r border-slate-300">STT</th>
                  <th rowSpan={2} className="py-2 px-3 whitespace-nowrap border-r border-slate-300">Mã Hàng</th>
                  <th rowSpan={2} className="py-2 px-3 min-w-[220px] border-r border-slate-300">Tên Mặt Hàng / Quy Cách</th>
                  <th rowSpan={2} className="py-2 px-2 text-center border-r border-slate-300">ĐVT</th>
                  <th rowSpan={2} className="py-2 px-3 text-right border-r border-slate-300">Đơn Giá Vốn</th>

                  {/* 4 Pillars Header Groups */}
                  <th colSpan={2} className="py-1 px-2 text-center bg-blue-100/80 text-blue-900 border-r border-slate-300">
                    TỒN ĐẦU KỲ
                  </th>
                  <th colSpan={2} className="py-1 px-2 text-center bg-amber-100/80 text-amber-900 border-r border-slate-300">
                    NHẬP TRONG KỲ
                  </th>
                  <th colSpan={2} className="py-1 px-2 text-center bg-purple-100/80 text-purple-900 border-r border-slate-300">
                    XUẤT TRONG KỲ
                  </th>
                  <th colSpan={2} className="py-1 px-2 text-center bg-emerald-100/80 text-emerald-900">
                    TỒN CUỐI KỲ
                  </th>
                </tr>

                {/* Level 2 Sub-Headers: Quantity & Money for each pillar */}
                <tr className="border-t border-slate-200 text-[10px]">
                  {/* Tồn Đầu */}
                  <th className="py-1 px-2 text-right bg-blue-50/60 text-blue-900 border-r border-blue-200">Số Lượng</th>
                  <th className="py-1 px-2 text-right bg-blue-50/60 text-blue-900 border-r border-slate-300">Thành Tiền (đ)</th>

                  {/* Nhập Kỳ */}
                  <th className="py-1 px-2 text-right bg-amber-50/60 text-amber-900 border-r border-amber-200">Số Lượng</th>
                  <th className="py-1 px-2 text-right bg-amber-50/60 text-amber-900 border-r border-slate-300">Thành Tiền (đ)</th>

                  {/* Xuất Kỳ */}
                  <th className="py-1 px-2 text-right bg-purple-50/60 text-purple-900 border-r border-purple-200">Số Lượng</th>
                  <th className="py-1 px-2 text-right bg-purple-50/60 text-purple-900 border-r border-slate-300">Thành Tiền (đ)</th>

                  {/* Tồn Cuối */}
                  <th className="py-1 px-2 text-right bg-emerald-50/60 text-emerald-900 border-r border-emerald-200 font-bold">Số Lượng</th>
                  <th className="py-1 px-2 text-right bg-emerald-50/60 text-emerald-900 font-bold">Giá Trị Tồn (đ)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredSummary.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-12 text-center text-slate-400">
                      <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Không tìm thấy mặt hàng nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredSummary.map((item, idx) => {
                    const openingVal = item.openingStock * item.costPrice;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-blue-50/40 transition cursor-pointer ${
                          selectedProductId === item.id ? 'bg-blue-50/80 font-medium' : idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                        }`}
                        onClick={() => setSelectedProductId(item.id)}
                      >
                        <td className="py-2 px-3 text-center font-mono text-slate-400 text-[11px] border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-blue-700 whitespace-nowrap border-r border-slate-200">
                          {item.sku}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900 max-w-xs truncate border-r border-slate-200">
                          <div>{item.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>{item.category}</span>
                            {item.warehouseLocation && (
                              <span className="text-slate-500">Vị trí: {item.warehouseLocation}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center text-slate-600 border-r border-slate-200">{item.unit}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600 border-r border-slate-200">
                          {formatCurrency(item.costPrice)}
                        </td>

                        {/* Pillar 1: Tồn Đầu Kỳ */}
                        <td className="py-2 px-2 text-right font-mono text-slate-700 bg-blue-50/20 border-r border-blue-100">
                          {formatNumber(item.openingStock)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-slate-700 bg-blue-50/20 border-r border-slate-200">
                          {openingVal > 0 ? formatCurrency(openingVal) : '-'}
                        </td>

                        {/* Pillar 2: Nhập Trong Kỳ */}
                        <td className="py-2 px-2 text-right font-mono font-semibold text-amber-700 bg-amber-50/20 border-r border-amber-100">
                          {item.totalIn > 0 ? `+${formatNumber(item.totalIn)}` : '-'}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-amber-800 bg-amber-50/20 border-r border-slate-200">
                          {item.totalInValue > 0 ? formatCurrency(item.totalInValue) : '-'}
                        </td>

                        {/* Pillar 3: Xuất Trong Kỳ */}
                        <td className="py-2 px-2 text-right font-mono font-semibold text-purple-700 bg-purple-50/20 border-r border-purple-100">
                          {item.totalOut > 0 ? `-${formatNumber(item.totalOut)}` : '-'}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-purple-800 bg-purple-50/20 border-r border-slate-200">
                          {item.totalOutValue > 0 ? formatCurrency(item.totalOutValue) : '-'}
                        </td>

                        {/* Pillar 4: Tồn Cuối Kỳ */}
                        <td
                          className={`py-2 px-2 text-right font-mono font-bold border-r border-emerald-100 ${
                            item.closingStock <= 5 ? 'text-red-600 bg-red-50/50' : 'text-emerald-800 bg-emerald-50/30'
                          }`}
                        >
                          {formatNumber(item.closingStock)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-slate-900 bg-emerald-50/30">
                          {formatCurrency(item.stockValue)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Totals */}
          <div className="bg-[#2c4779] text-white px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono shadow-inner">
            <div>
              Tổng số mặt hàng: <strong>{filteredSummary.length}</strong> / {products.length} SP
            </div>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-300">Tồn đầu:</span>{' '}
                <strong className="text-blue-200">{formatNumber(totalAggregates.opening)} sp</strong>
                <span className="text-[11px] text-blue-100 ml-1">({formatCurrency(totalAggregates.openingValue)})</span>
              </div>
              <div>
                <span className="text-slate-300">Tổng nhập:</span>{' '}
                <strong className="text-amber-300">+{formatNumber(totalAggregates.in)} sp</strong>
                <span className="text-[11px] text-amber-200 ml-1">({formatCurrency(totalAggregates.inValue)})</span>
              </div>
              <div>
                <span className="text-slate-300">Tổng xuất:</span>{' '}
                <strong className="text-purple-300">-{formatNumber(totalAggregates.out)} sp</strong>
                <span className="text-[11px] text-purple-200 ml-1">({formatCurrency(totalAggregates.outValue)})</span>
              </div>
              <div className="bg-emerald-900/80 px-2.5 py-1 rounded border border-emerald-400/50">
                <span className="text-emerald-300 font-bold">Tồn kho cuối kỳ:</span>{' '}
                <strong className="text-emerald-100 text-sm font-bold">{formatNumber(totalAggregates.closing)} sp</strong>
                <span className="text-xs text-emerald-200 ml-1.5 font-bold">({formatCurrency(totalAggregates.value)})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: THỐNG KÊ XUẤT CẤP PHÁT CHO CÁC KHOA / PHÒNG BỆNH VIỆN */}
      {activeReportTab === 'KHOA_PHONG' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* KPI Summary Cards for Department Issue */}
          <div className="bg-purple-50/40 border-b border-purple-200 p-2.5 grid grid-cols-2 lg:grid-cols-4 gap-2.5 no-print">
            <div className="bg-white border border-purple-200 rounded-lg p-2.5 shadow-2xs">
              <div className="text-[11px] text-purple-900 font-bold flex items-center justify-between">
                <span>KHOA / PHÒNG ĐÃ CẤP PHÁT</span>
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-mono font-bold text-purple-950">
                  {departmentRows.length}{' '}
                  <span className="text-xs font-normal text-purple-700">đơn vị</span>
                </span>
                <span className="text-xs font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                  {periodLabel}
                </span>
              </div>
            </div>

            <div className="bg-white border border-purple-200 rounded-lg p-2.5 shadow-2xs">
              <div className="text-[11px] text-purple-900 font-bold flex items-center justify-between">
                <span>TỔNG LƯỢT PHIẾU XUẤT KHO</span>
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-mono font-bold text-purple-950">
                  {departmentAggregates.totalOrders}{' '}
                  <span className="text-xs font-normal text-purple-700">phiếu xuất</span>
                </span>
                <span className="text-xs text-slate-500">
                  Đã duyệt xuất kho
                </span>
              </div>
            </div>

            <div className="bg-white border border-purple-200 rounded-lg p-2.5 shadow-2xs">
              <div className="text-[11px] text-purple-900 font-bold flex items-center justify-between">
                <span>TỔNG SỐ LƯỢNG VẬT TƯ CẤP PHÁT</span>
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-mono font-bold text-purple-950">
                  {formatNumber(departmentAggregates.totalQty)}{' '}
                  <span className="text-xs font-normal text-purple-700">sản phẩm</span>
                </span>
                <span className="text-xs text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-mono">
                  Mực & linh kiện IT
                </span>
              </div>
            </div>

            <div className="bg-white border border-purple-200 rounded-lg p-2.5 shadow-2xs">
              <div className="text-[11px] text-purple-900 font-bold flex items-center justify-between">
                <span>TỔNG KINH PHÍ CẤP PHÁT</span>
                <TrendingDown className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-mono font-bold text-purple-950">
                  {formatCurrency(departmentAggregates.totalAmount)}
                </span>
                <button
                  onClick={handleExportDepartmentExcel}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Xuất Excel
                </button>
              </div>
            </div>
          </div>

          {/* Department Issue Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#f3effa] text-purple-950 sticky top-0 border-b border-purple-300 font-semibold z-10 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center border-r border-purple-200">STT</th>
                  <th className="py-2.5 px-3 min-w-[200px] border-r border-purple-200">Khoa / Phòng Bệnh Viện</th>
                  <th className="py-2.5 px-3 border-r border-purple-200">Nhóm Bộ Phận</th>
                  <th className="py-2.5 px-3 text-center border-r border-purple-200">Số Phiếu Xuất</th>
                  <th className="py-2.5 px-3 text-right border-r border-purple-200">Tổng SL Nhận (sp)</th>
                  <th className="py-2.5 px-3 text-right border-r border-purple-200">Tổng Kinh Phí (đ)</th>
                  <th className="py-2.5 px-3 border-r border-purple-200">Tỷ Trọng (%)</th>
                  <th className="py-2.5 px-3 border-r border-purple-200">Người Đại Diện Nhận</th>
                  <th className="py-2.5 px-3 text-center w-28">Chi Tiết Mặt Hàng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {departmentRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Không có phát sinh xuất cấp phát cho Khoa / Phòng nào trong kỳ {periodLabel}.
                    </td>
                  </tr>
                ) : (
                  departmentRows.map((dept, idx) => (
                    <tr
                      key={dept.departmentName}
                      className={`hover:bg-purple-50/50 transition cursor-pointer ${
                        idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                      }`}
                      onClick={() => setSelectedDeptForDetail(dept)}
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px] border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>{dept.departmentName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                          {dept.departmentGroup || 'Khoa lâm sàng'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-purple-700 border-r border-slate-200">
                        {dept.orderCount} phiếu
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-900 border-r border-slate-200">
                        {formatNumber(dept.totalQuantity)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-800 border-r border-slate-200">
                        {formatCurrency(dept.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-purple-600 h-1.5 rounded-full"
                              style={{ width: dept.percentage || '0%' }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-semibold text-purple-900">
                            {dept.percentage}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200 italic">
                        {dept.receiverNames}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDeptForDetail(dept);
                          }}
                          className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 rounded text-[11px] font-medium flex items-center gap-1 mx-auto transition cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Xem {dept.items?.length || 0} SP</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Department Footer Totals */}
          <div className="bg-[#382654] text-white px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono shadow-inner">
            <div>
              Tổng cộng: <strong>{departmentRows.length}</strong> Khoa / Phòng đã nhận vật tư
            </div>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-purple-200">Tổng phiếu:</span>{' '}
                <strong className="text-white">{departmentAggregates.totalOrders} phiếu</strong>
              </div>
              <div>
                <span className="text-purple-200">Tổng số lượng xuất:</span>{' '}
                <strong className="text-purple-200">{formatNumber(departmentAggregates.totalQty)} sp</strong>
              </div>
              <div className="bg-purple-900/80 px-2.5 py-1 rounded border border-purple-400/50">
                <span className="text-purple-300 font-bold">Tổng kinh phí cấp phát:</span>{' '}
                <strong className="text-white text-sm font-bold ml-1.5">
                  {formatCurrency(departmentAggregates.totalAmount)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: THỐNG KÊ NHẬP HÀNG TỪ CÁC NHÀ CUNG CẤP & ĐỐI TÁC */}
      {activeReportTab === 'NHA_CUNG_CAP' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* KPI Summary Cards for Supplier Receipt */}
          <div className="bg-amber-50/40 border-b border-amber-200 p-2.5 grid grid-cols-2 lg:grid-cols-4 gap-2.5 no-print">
            <div className="bg-white border border-amber-200 rounded-lg p-2.5 shadow-2xs">
              <div className="text-[11px] text-amber-900 font-bold flex items-center justify-between">
                <span>NHÀ CUNG CẤP & ĐỐI TÁC</span>
                <Truck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-mono font-bold text-amber-950">
                  {supplierRows.length}{' '}
                  <span className="text-xs font-normal text-amber-700">đơn vị</span>
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                  {periodLabel}
                </span>
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-lg p-2.5 shadow-2xs">
              <div className="text-[11px] text-amber-900 font-bold flex items-center justify-between">
                <span>TỔNG LƯỢT PHIẾU NHẬP KHO</span>
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-mono font-bold text-amber-950">
                  {supplierAggregates.totalReceipts}{' '}
                  <span className="text-xs font-normal text-amber-700">phiếu nhập</span>
                </span>
                <span className="text-xs text-slate-500">
                  Đã nhập vào kho IT
                </span>
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-lg p-2.5 shadow-2xs">
              <div className="text-[11px] text-amber-900 font-bold flex items-center justify-between">
                <span>TỔNG SỐ LƯỢNG HÀNG NHẬP</span>
                <Package className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-mono font-bold text-amber-950">
                  +{formatNumber(supplierAggregates.totalQty)}{' '}
                  <span className="text-xs font-normal text-amber-700">sản phẩm</span>
                </span>
                <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-mono">
                  Linh kiện & mực
                </span>
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-lg p-2.5 shadow-2xs">
              <div className="text-[11px] text-amber-900 font-bold flex items-center justify-between">
                <span>TỔNG GIÁ TRỊ NHẬP KHO</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-mono font-bold text-amber-950">
                  {formatCurrency(supplierAggregates.totalAmount)}
                </span>
                <button
                  onClick={handleExportSupplierExcel}
                  className="text-xs font-bold text-amber-700 hover:text-amber-900 underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Xuất Excel
                </button>
              </div>
            </div>
          </div>

          {/* Supplier Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#fbf4e8] text-amber-950 sticky top-0 border-b border-amber-300 font-semibold z-10 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center border-r border-amber-200">STT</th>
                  <th className="py-2.5 px-3 min-w-[220px] border-r border-amber-200">Nhà Cung Cấp / Tổng Kho</th>
                  <th className="py-2.5 px-3 border-r border-amber-200">Người Liên Hệ & Điện Thoại</th>
                  <th className="py-2.5 px-3 text-center border-r border-amber-200">Số Phiếu Nhập</th>
                  <th className="py-2.5 px-3 text-right border-r border-amber-200">Tổng SL Nhập (sp)</th>
                  <th className="py-2.5 px-3 text-right border-r border-amber-200">Tổng Giá Trị (đ)</th>
                  <th className="py-2.5 px-3 border-r border-amber-200">Tỷ Trọng (%)</th>
                  <th className="py-2.5 px-3 text-center w-28">Chi Tiết Lô Hàng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {supplierRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Truck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Không có chứng từ nhập hàng nào từ Nhà Cung Cấp trong kỳ {periodLabel}.
                    </td>
                  </tr>
                ) : (
                  supplierRows.map((sup, idx) => (
                    <tr
                      key={sup.supplierName}
                      className={`hover:bg-amber-50/50 transition cursor-pointer ${
                        idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                      }`}
                      onClick={() => setSelectedSupForDetail(sup)}
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px] border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{sup.supplierName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200">
                        <div>{sup.contactPerson}</div>
                        {sup.phone && <div className="text-[11px] font-mono text-slate-500">{sup.phone}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700 border-r border-slate-200">
                        {sup.receiptCount} phiếu
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-900 border-r border-slate-200">
                        +{formatNumber(sup.totalQuantity)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-800 border-r border-slate-200">
                        {formatCurrency(sup.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-600 h-1.5 rounded-full"
                              style={{ width: sup.percentage || '0%' }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-semibold text-amber-900">
                            {sup.percentage}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSupForDetail(sup);
                          }}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 rounded text-[11px] font-medium flex items-center gap-1 mx-auto transition cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Xem {sup.items?.length || 0} SP</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Supplier Footer Totals */}
          <div className="bg-[#4d391f] text-white px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono shadow-inner">
            <div>
              Tổng cộng: <strong>{supplierRows.length}</strong> Nhà Cung Cấp giao hàng
            </div>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-amber-200">Tổng phiếu nhập:</span>{' '}
                <strong className="text-white">{supplierAggregates.totalReceipts} phiếu</strong>
              </div>
              <div>
                <span className="text-amber-200">Tổng số lượng nhập:</span>{' '}
                <strong className="text-amber-200">+{formatNumber(supplierAggregates.totalQty)} sp</strong>
              </div>
              <div className="bg-amber-950/80 px-2.5 py-1 rounded border border-amber-400/50">
                <span className="text-amber-300 font-bold">Tổng tiền hàng nhập:</span>{' '}
                <strong className="text-white text-sm font-bold ml-1.5">
                  {formatCurrency(supplierAggregates.totalAmount)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CHI TIẾT CHỨNG TỪ THEO ĐƠN VỊ & KHOẢNG NGÀY */}
      {/* VIEW 2: SỔ CHI TIẾT XUẤT - NHẬP - TỒN KHO HÀNG HÓA VẬT TƯ IT */}
      {activeReportTab === 'CHI_TIET_THANG' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Top KPI Cards for Detailed Stock Movement */}
          {(() => {
            const inTransactions = filteredTransactions.filter((t) => t.type === 'Nhập kho');
            const outTransactions = filteredTransactions.filter((t) => t.type === 'Xuất kho');
            const inQtyTotal = inTransactions.reduce((s, t) => s + t.quantity, 0);
            const inAmtTotal = inTransactions.reduce((s, t) => s + t.totalPrice, 0);
            const outQtyTotal = outTransactions.reduce((s, t) => s + t.quantity, 0);
            const outAmtTotal = outTransactions.reduce((s, t) => s + t.totalPrice, 0);

            return (
              <div className="bg-slate-50 border-b border-slate-200 p-2.5 grid grid-cols-2 lg:grid-cols-4 gap-2.5 no-print">
                <div className="bg-white border border-slate-300 rounded-lg p-2.5 shadow-2xs">
                  <div className="text-[11px] text-slate-700 font-bold flex items-center justify-between">
                    <span>TỔNG DÒNG CHỨNG TỪ PHÁT SINH</span>
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-base font-mono font-bold text-slate-900">
                      {filteredTransactions.length}{' '}
                      <span className="text-xs font-normal text-slate-500">dòng</span>
                    </span>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {periodLabel}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-2.5 shadow-2xs">
                  <div className="text-[11px] text-amber-900 font-bold flex items-center justify-between">
                    <span>TỔNG NHẬP TRONG KỲ (TỪ NCC)</span>
                    <ArrowDownLeft className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-base font-mono font-bold text-amber-900">
                      +{formatNumber(inQtyTotal)}{' '}
                      <span className="text-xs font-normal text-amber-700">sp</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      {formatCurrency(inAmtTotal)}
                    </span>
                  </div>
                </div>

                <div className="bg-purple-50/60 border border-purple-200 rounded-lg p-2.5 shadow-2xs">
                  <div className="text-[11px] text-purple-900 font-bold flex items-center justify-between">
                    <span>TỔNG XUẤT CẤP PHÁT KHOA PHÒNG</span>
                    <ArrowUpRight className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-base font-mono font-bold text-purple-900">
                      -{formatNumber(outQtyTotal)}{' '}
                      <span className="text-xs font-normal text-purple-700">sp</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                      {formatCurrency(outAmtTotal)}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-2.5 shadow-2xs">
                  <div className="text-[11px] text-blue-900 font-bold flex items-center justify-between">
                    <span>BIẾN ĐỘNG RÒNG (NHẬP - XUẤT)</span>
                    <Boxes className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className={`text-base font-mono font-bold ${inQtyTotal - outQtyTotal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {inQtyTotal - outQtyTotal >= 0 ? `+${formatNumber(inQtyTotal - outQtyTotal)}` : formatNumber(inQtyTotal - outQtyTotal)}{' '}
                      <span className="text-xs font-normal text-slate-500">sp</span>
                    </span>
                    <button
                      onClick={handleExportFullExcel}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Xuất Excel
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Sub Header description */}
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
            <div className="text-slate-700 flex items-center gap-2">
              <span className="font-bold text-slate-900">Sổ Chi Tiết Xuất - Nhập - Tồn Kho Hàng Hóa</span>
              <span className="text-slate-300">|</span>
              <span>Đối tác: <strong className="text-blue-700">{isSpecificPartner ? selectedPartner : 'Toàn bộ đơn vị'}</strong></span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Thời gian: {periodLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Hiển thị cột Nhập & Xuất riêng biệt · Kẻ khung viền chuẩn Excel
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#eef2f7] text-slate-700 sticky top-0 border-b border-slate-300 font-semibold z-10 text-[11px]">
                <tr>
                  <th className="py-2.5 px-2.5 w-8 text-center border-r border-slate-300">#</th>
                  <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-300">Ngày</th>
                  <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-300">Số Chứng Từ</th>
                  <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-300 text-center">Loại GD</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 min-w-[180px]">Đơn Vị / Đối Tác Giao Nhận</th>
                  <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-300">Mã Hàng</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 min-w-[200px]">Tên Mặt Hàng / Quy Cách</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-300">ĐVT</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-300">Đơn Giá (đ)</th>
                  
                  {/* Nhập trong kỳ */}
                  <th className="py-2.5 px-2.5 text-right bg-amber-100/70 text-amber-900 border-r border-amber-200">SL Nhập</th>
                  <th className="py-2.5 px-3 text-right bg-amber-100/70 text-amber-900 border-r border-slate-300">Tiền Nhập (đ)</th>

                  {/* Xuất trong kỳ */}
                  <th className="py-2.5 px-2.5 text-right bg-purple-100/70 text-purple-900 border-r border-purple-200">SL Xuất</th>
                  <th className="py-2.5 px-3 text-right bg-purple-100/70 text-purple-900 border-r border-slate-300">Tiền Xuất (đ)</th>

                  <th className="py-2.5 px-3 border-r border-slate-300 min-w-[180px]">Diễn Giải / Ghi Chú</th>
                  <th className="py-2.5 px-3 text-center w-22">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="py-12 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Không có chứng từ nhập xuất nào cho đơn vị này trong khoảng thời gian {periodLabel}.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, idx) => {
                    const matchedIssue = issueOrders.find((o) => o.code === tx.code);
                    const isNhap = tx.type === 'Nhập kho';

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-blue-50/50 transition ${
                          idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                        }`}
                      >
                        <td className="py-2 px-2.5 text-center font-mono text-slate-400 text-[11px] border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap border-r border-slate-200">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-blue-700 whitespace-nowrap border-r border-slate-200">
                          {tx.code}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-center border-r border-slate-200">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded font-medium inline-block ${
                              isNhap
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-purple-100 text-purple-900 border border-purple-200'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800 max-w-xs truncate border-r border-slate-200">
                          {tx.partner}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-blue-800 whitespace-nowrap border-r border-slate-200">
                          {tx.sku}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900 max-w-xs truncate border-r border-slate-200">
                          {tx.name}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-600 border-r border-slate-200">{tx.unit}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600 border-r border-slate-200">
                          {formatCurrency(tx.unitPrice)}
                        </td>

                        {/* SL & Tiền Nhập */}
                        <td className="py-2 px-2.5 text-right font-mono font-bold text-amber-700 bg-amber-50/20 border-r border-amber-100">
                          {isNhap ? `+${formatNumber(tx.quantity)}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-amber-800 bg-amber-50/20 border-r border-slate-200">
                          {isNhap ? formatCurrency(tx.totalPrice) : '-'}
                        </td>

                        {/* SL & Tiền Xuất */}
                        <td className="py-2 px-2.5 text-right font-mono font-bold text-purple-700 bg-purple-50/20 border-r border-purple-100">
                          {!isNhap ? `-${formatNumber(tx.quantity)}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-purple-800 bg-purple-50/20 border-r border-slate-200">
                          {!isNhap ? formatCurrency(tx.totalPrice) : '-'}
                        </td>

                        <td className="py-2 px-3 text-slate-600 italic max-w-xs truncate border-r border-slate-200">
                          {tx.notes}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          {matchedIssue ? (
                            <button
                              onClick={() => setSelectedVoucherForPrint(matchedIssue)}
                              className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded font-medium text-[11px] flex items-center gap-1 mx-auto cursor-pointer"
                              title="Xem và in phiếu xuất kho chuẩn A4"
                            >
                              <Eye className="w-3 h-3" />
                              <span>In Phiếu</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Phiếu nhập kho</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Detailed table summary footer */}
          {(() => {
            const inQtyTotal = filteredTransactions.filter((t) => t.type === 'Nhập kho').reduce((s, t) => s + t.quantity, 0);
            const inAmtTotal = filteredTransactions.filter((t) => t.type === 'Nhập kho').reduce((s, t) => s + t.totalPrice, 0);
            const outQtyTotal = filteredTransactions.filter((t) => t.type === 'Xuất kho').reduce((s, t) => s + t.quantity, 0);
            const outAmtTotal = filteredTransactions.filter((t) => t.type === 'Xuất kho').reduce((s, t) => s + t.totalPrice, 0);

            return (
              <div className="bg-[#2c4779] text-white px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono shadow-inner">
                <div>
                  Tổng số dòng giao dịch: <strong>{filteredTransactions.length}</strong> dòng
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-300">Tổng nhập:</span>{' '}
                    <strong className="text-amber-300">+{formatNumber(inQtyTotal)} sp</strong>
                    <span className="text-[11px] text-amber-200 ml-1">({formatCurrency(inAmtTotal)})</span>
                  </div>
                  <div>
                    <span className="text-slate-300">Tổng xuất:</span>{' '}
                    <strong className="text-purple-300">-{formatNumber(outQtyTotal)} sp</strong>
                    <span className="text-[11px] text-purple-200 ml-1">({formatCurrency(outAmtTotal)})</span>
                  </div>
                  <div className="bg-blue-900/80 px-2.5 py-1 rounded border border-blue-400/50">
                    <span className="text-blue-200 font-bold">Chênh lệch:</span>{' '}
                    <strong className="text-white text-sm font-bold ml-1">
                      {inQtyTotal - outQtyTotal >= 0 ? `+${formatNumber(inQtyTotal - outQtyTotal)}` : formatNumber(inQtyTotal - outQtyTotal)} sp
                    </strong>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* VIEW 5: SỔ THẺ KHO TỪNG MẶT HÀNG */}
      {activeReportTab === 'THE_KHO' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">Chọn mặt hàng xem thẻ kho:</span>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-blue-900 focus:outline-blue-500 max-w-md truncate cursor-pointer shadow-2xs"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.name} ({p.unit}) - Tồn: {p.stockQuantity}
                  </option>
                ))}
              </select>
            </div>

            {activeProduct && (
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-800 border border-blue-200">
                  Giá vốn: <strong>{formatCurrency(activeProduct.costPrice)}</strong>
                </span>
                <span className="bg-emerald-50 px-2 py-0.5 rounded text-emerald-800 border border-emerald-200 font-bold">
                  Tồn kho hiện tại: {activeProduct.stockQuantity} {activeProduct.unit}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#eef2f7] text-slate-700 sticky top-0 border-b border-slate-300 font-semibold z-10 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Ngày</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Số Chứng Từ</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Loại GD</th>
                  <th className="py-2.5 px-3">Đối Tác / Khoa Phòng</th>
                  <th className="py-2.5 px-3 text-right">SL Nhập</th>
                  <th className="py-2.5 px-3 text-right">SL Xuất</th>
                  <th className="py-2.5 px-3 text-right bg-emerald-100/70 border-x border-emerald-200 font-bold">
                    Tồn Sau GD
                  </th>
                  <th className="py-2.5 px-3 text-right">Đơn Giá</th>
                  <th className="py-2.5 px-3">Diễn Giải</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {stockLedger.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-sans">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Mặt hàng này chưa phát sinh chứng từ xuất nhập kho nào trong kỳ.
                    </td>
                  </tr>
                ) : (
                  stockLedger.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 text-center text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                        {formatDate(row.date)}
                      </td>
                      <td className="py-2 px-3 font-semibold text-blue-700 whitespace-nowrap">
                        {row.voucherCode}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap font-sans">
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                            row.voucherType === 'NHAP'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {row.voucherType === 'NHAP' ? 'Nhập kho' : 'Xuất kho'}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-800 max-w-xs truncate">
                        {row.partnerName}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-amber-700">
                        {row.quantityIn > 0 ? `+${row.quantityIn}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-blue-700">
                        {row.quantityOut > 0 ? `-${row.quantityOut}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-800 bg-emerald-50/70 border-x border-emerald-200">
                        {row.balanceAfter}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        {formatCurrency(row.unitPrice)}
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-600 max-w-xs truncate italic">
                        {row.notes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: Xem danh sách vật tư cấp phát của 1 Khoa / Phòng */}
      {selectedDeptForDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#2c4779] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-purple-300" />
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    Chi Tiết Cấp Phát Cho: {selectedDeptForDetail.departmentName}
                  </h3>
                  <div className="text-xs text-blue-200 mt-0.5">
                    {selectedDeptForDetail.departmentGroup} · Tổng {selectedDeptForDetail.orderCount} phiếu xuất · {selectedDeptForDetail.totalQuantity} sản phẩm
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeptForDetail(null)}
                className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Danh sách vật tư */}
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-300 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2 px-3 text-center w-8">#</th>
                    <th className="py-2 px-3 whitespace-nowrap">Mã Hàng</th>
                    <th className="py-2 px-3">Tên Vật Tư / Thiết Bị IT / Mực</th>
                    <th className="py-2 px-3 text-center">ĐVT</th>
                    <th className="py-2 px-3 text-right">Tổng SL Nhận</th>
                    <th className="py-2 px-3 text-right">Đơn Giá Vốn</th>
                    <th className="py-2 px-3 text-right">Tổng Thành Tiền (đ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedDeptForDetail.items?.map((it, idx) => (
                    <tr key={it.sku || idx} className="hover:bg-purple-50/40">
                      <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{it.sku}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{it.name}</td>
                      <td className="py-2 px-3 text-center text-slate-600">{it.unit}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-purple-700">
                        {it.quantity}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {formatCurrency(it.unitPrice)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(it.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-purple-50 border-t-2 border-purple-200 font-bold text-purple-950">
                    <td colSpan={4} className="py-2.5 px-3 text-right">
                      TỔNG CỘNG CHO KHOA / PHÒNG:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-purple-800">
                      {selectedDeptForDetail.totalQuantity} sp
                    </td>
                    <td className="py-2.5 px-3"></td>
                    <td className="py-2.5 px-3 text-right font-mono text-purple-900 text-sm">
                      {formatCurrency(selectedDeptForDetail.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Người nhận đại diện: <strong>{selectedDeptForDetail.receiverNames}</strong>
              </span>
              <button
                onClick={() => setSelectedDeptForDetail(null)}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded font-medium text-xs cursor-pointer"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: Xem danh sách mặt hàng nhập từ 1 Nhà Cung Cấp */}
      {selectedSupForDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#2c4779] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    Chi Tiết Nhập Từ: {selectedSupForDetail.supplierName}
                  </h3>
                  <div className="text-xs text-blue-200 mt-0.5">
                    Liên hệ: {selectedSupForDetail.contactPerson} ({selectedSupForDetail.phone || 'Chưa có SĐT'}) · Tổng {selectedSupForDetail.receiptCount} phiếu nhập
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedSupForDetail(null)}
                className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Danh sách vật tư */}
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-300 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2 px-3 text-center w-8">#</th>
                    <th className="py-2 px-3 whitespace-nowrap">Mã Hàng</th>
                    <th className="py-2 px-3">Tên Hàng Hóa / Vật Tư IT</th>
                    <th className="py-2 px-3 text-center">ĐVT</th>
                    <th className="py-2 px-3 text-right">Tổng SL Nhập</th>
                    <th className="py-2 px-3 text-right">Đơn Giá Nhập</th>
                    <th className="py-2 px-3 text-right">Tổng Tiền Hàng (đ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedSupForDetail.items?.map((it, idx) => (
                    <tr key={it.sku || idx} className="hover:bg-amber-50/40">
                      <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{it.sku}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{it.name}</td>
                      <td className="py-2 px-3 text-center text-slate-600">{it.unit}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-700">
                        +{it.quantity}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {formatCurrency(it.unitPrice)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(it.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-50 border-t-2 border-amber-200 font-bold text-amber-950">
                    <td colSpan={4} className="py-2.5 px-3 text-right">
                      TỔNG CỘNG TỪ NHÀ CUNG CẤP:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-800">
                      +{selectedSupForDetail.totalQuantity} sp
                    </td>
                    <td className="py-2.5 px-3"></td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-900 text-sm">
                      {formatCurrency(selectedSupForDetail.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Đơn vị tính: <strong>VNĐ</strong> · Đã nhập đầy đủ vào thẻ kho
              </span>
              <button
                onClick={() => setSelectedSupForDetail(null)}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded font-medium text-xs cursor-pointer"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
