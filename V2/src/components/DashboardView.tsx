import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Filter,
  LayoutDashboard,
  Medal,
  Package,
  PackagePlus,
  Percent,
  PieChart,
  Printer,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';
import { Product, StockIssueOrder } from '../types';

interface TopDepartmentInk {
  departmentName: string;
  departmentGroup: string;
  orderCount: number;
  totalQuantity: number;
  totalAmount: number;
  percentage: number;
  topProducts: { name: string; quantity: number }[];
  recentOrders: StockIssueOrder[];
}

export const DashboardView: React.FC = () => {
  const {
    products,
    issueOrders,
    receiptOrders,
    customers,
    companyInfo,
    setActiveTab,
    setIsCreateReceiptModalOpen,
    setIsCreateProductModalOpen,
    setSelectedVoucherForPrint,
  } = useWarehouse();

  // Period filter
  const [selectedPeriod, setSelectedPeriod] = useState<string>('THIS_MONTH');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'OUT' | 'CRITICAL' | 'WARNING'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDeptModal, setSelectedDeptModal] = useState<TopDepartmentInk | null>(null);
  const [chartMode, setChartMode] = useState<'DONUT' | 'PIE' | 'BAR'>('DONUT');
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  // Compute date range based on selectedPeriod
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const currentYear = 2026;
    if (selectedPeriod === 'THIS_MONTH') {
      return {
        startDate: `${currentYear}-11-01`,
        endDate: `${currentYear}-11-30`,
        periodLabel: 'Tháng 11/2026 (Hiện tại)',
      };
    } else if (selectedPeriod === 'LAST_MONTH') {
      return {
        startDate: `${currentYear}-10-01`,
        endDate: `${currentYear}-10-31`,
        periodLabel: 'Tháng 10/2026 (Tháng trước)',
      };
    } else if (selectedPeriod === 'QUARTER_4') {
      return {
        startDate: `${currentYear}-10-01`,
        endDate: `${currentYear}-12-31`,
        periodLabel: 'Quý 4/2026',
      };
    }
    return {
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`,
      periodLabel: 'Cả năm 2026',
    };
  }, [selectedPeriod]);

  // 1. FILTER RELEVANT ISSUE ORDERS FOR THE PERIOD
  const periodIssueOrders = useMemo(() => {
    return issueOrders.filter((order) => {
      return order.date >= startDate && order.date <= endDate;
    });
  }, [issueOrders, startDate, endDate]);

  // 2. COMPUTE TOP 5 DEPARTMENTS USING INK IN THE MONTH
  // Helper to test if product is an ink item
  const isInkProduct = (productName: string, sku: string, category?: string) => {
    const lowerName = productName.toLowerCase();
    const lowerSku = sku.toLowerCase();
    const lowerCat = (category || '').toLowerCase();

    return (
      lowerCat.includes('mực') ||
      lowerName.includes('mực') ||
      lowerName.includes('cartridge') ||
      lowerName.includes('toner') ||
      lowerName.includes('lọ mực') ||
      lowerName.includes('hộp mực') ||
      lowerSku.startsWith('hm-') ||
      lowerSku.startsWith('md-') ||
      lowerSku.includes('mi-') ||
      lowerSku.includes('md-') ||
      lowerSku.startsWith('it24') ||
      lowerSku.startsWith('it26') ||
      lowerSku.includes('l1210') ||
      lowerSku.includes('l8050')
    );
  };

  const { top5Departments, totalHospitalInkQuantity, totalHospitalInkAmount, allDepartmentInkStats } = useMemo(() => {
    const deptMap = new Map<
      string,
      {
        departmentName: string;
        departmentGroup: string;
        orders: StockIssueOrder[];
        totalQuantity: number;
        totalAmount: number;
        productCounts: Map<string, number>;
      }
    >();

    let totalAllQty = 0;
    let totalAllAmount = 0;

    periodIssueOrders.forEach((order) => {
      const deptName = order.customerName || 'Chưa xác định';
      const cust = customers.find((c) => c.name === deptName || c.group === deptName);
      const groupName = cust?.group || 'Khoa / Phòng Bệnh Viện';

      order.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const isInk = isInkProduct(item.name, item.sku, prod?.category);

        if (isInk) {
          totalAllQty += item.quantity;
          totalAllAmount += item.totalPrice;

          if (!deptMap.has(deptName)) {
            deptMap.set(deptName, {
              departmentName: deptName,
              departmentGroup: groupName,
              orders: [],
              totalQuantity: 0,
              totalAmount: 0,
              productCounts: new Map(),
            });
          }

          const entry = deptMap.get(deptName)!;
          if (!entry.orders.some((o) => o.id === order.id)) {
            entry.orders.push(order);
          }
          entry.totalQuantity += item.quantity;
          entry.totalAmount += item.totalPrice;

          const currentCount = entry.productCounts.get(item.name) || 0;
          entry.productCounts.set(item.name, currentCount + item.quantity);
        }
      });
    });

    const list: TopDepartmentInk[] = Array.from(deptMap.values()).map((dept) => {
      const pct = totalAllQty > 0 ? (dept.totalQuantity / totalAllQty) * 100 : 0;
      const sortedProds = Array.from(dept.productCounts.entries())
        .map(([name, qty]) => ({ name, quantity: qty }))
        .sort((a, b) => b.quantity - a.quantity);

      return {
        departmentName: dept.departmentName,
        departmentGroup: dept.departmentGroup,
        orderCount: dept.orders.length,
        totalQuantity: dept.totalQuantity,
        totalAmount: dept.totalAmount,
        percentage: Number(pct.toFixed(1)),
        topProducts: sortedProds,
        recentOrders: dept.orders,
      };
    });

    list.sort((a, b) => b.totalQuantity - a.totalQuantity);

    return {
      top5Departments: list.slice(0, 5),
      allDepartmentInkStats: list,
      totalHospitalInkQuantity: totalAllQty,
      totalHospitalInkAmount: totalAllAmount,
    };
  }, [periodIssueOrders, customers, products]);

  // 3. LOW STOCK & THRESHOLD ALERTS (MẶT HÀNG SẮP HẾT HẠN MỨC)
  const lowStockProducts = useMemo(() => {
    return products.map((prod) => {
      const isOutOfStock = prod.stockQuantity === 0;
      const isCritical = prod.stockQuantity > 0 && prod.stockQuantity <= Math.ceil(prod.minStockAlert / 2);
      const isWarning = prod.stockQuantity > 0 && prod.stockQuantity <= prod.minStockAlert;
      const deficit = Math.max(0, prod.minStockAlert * 2 - prod.stockQuantity); // Đề xuất nhập thêm để đạt ngưỡng an toàn

      return {
        ...prod,
        isOutOfStock,
        isCritical,
        isWarning,
        deficit,
        stockRatio: prod.minStockAlert > 0 ? (prod.stockQuantity / prod.minStockAlert) * 100 : 100,
      };
    });
  }, [products]);

  // Filtered alert list
  const filteredAlertProducts = useMemo(() => {
    return lowStockProducts.filter((p) => {
      if (stockFilter === 'OUT' && !p.isOutOfStock) return false;
      if (stockFilter === 'CRITICAL' && !p.isCritical) return false;
      if (stockFilter === 'WARNING' && !p.isWarning) return false;
      if (stockFilter === 'ALL' && !p.isOutOfStock && !p.isWarning) return false;

      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const m1 = p.sku.toLowerCase().includes(t);
        const m2 = p.name.toLowerCase().includes(t);
        const m3 = p.category.toLowerCase().includes(t);
        const m4 = (p.warehouseLocation || '').toLowerCase().includes(t);
        if (!m1 && !m2 && !m3 && !m4) return false;
      }
      return true;
    });
  }, [lowStockProducts, stockFilter, searchTerm]);

  // Aggregated Alert Counters
  const alertStats = useMemo(() => {
    const outOfStock = lowStockProducts.filter((p) => p.isOutOfStock).length;
    const critical = lowStockProducts.filter((p) => p.isCritical).length;
    const warning = lowStockProducts.filter((p) => p.isWarning && !p.isCritical).length;
    const totalAlerts = outOfStock + critical + warning;
    const totalInventoryValue = products.reduce((sum, p) => sum + p.stockQuantity * p.costPrice, 0);
    const totalItemsCount = products.reduce((sum, p) => sum + p.stockQuantity, 0);

    return {
      outOfStock,
      critical,
      warning,
      totalAlerts,
      totalInventoryValue,
      totalItemsCount,
    };
  }, [lowStockProducts, products]);

  // Max quantity among Top 5 for progress bar calculation
  const maxTopQty = top5Departments[0]?.totalQuantity || 1;

  // Rank Styling Helper
  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs shadow-xs border border-amber-300">
          🥇
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="w-6 h-6 rounded-full bg-slate-400 text-white font-bold flex items-center justify-center text-xs shadow-xs border border-slate-300">
          🥈
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-xs shadow-xs border border-amber-600">
          🥉
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-xs border border-blue-200">
        #{index + 1}
      </span>
    );
  };

  // Color palette for Top 5 departments in charts
  const deptColors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#94a3b8'];

  // SVG Donut calculation
  const donutSlices = useMemo(() => {
    if (totalHospitalInkQuantity === 0) return [];
    let cumulativeAngle = 0;
    const top5Total = top5Departments.reduce((s, d) => s + d.totalQuantity, 0);
    const remainingQty = Math.max(0, totalHospitalInkQuantity - top5Total);

    const slices = top5Departments.map((dept, idx) => {
      const sliceAngle = (dept.totalQuantity / totalHospitalInkQuantity) * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += sliceAngle;
      return {
        name: dept.departmentName,
        quantity: dept.totalQuantity,
        percent: dept.percentage,
        color: deptColors[idx],
        startAngle,
        endAngle: cumulativeAngle,
      };
    });

    if (remainingQty > 0) {
      slices.push({
        name: 'Các khoa phòng khác',
        quantity: remainingQty,
        percent: Number(((remainingQty / totalHospitalInkQuantity) * 100).toFixed(1)),
        color: deptColors[5],
        startAngle: cumulativeAngle,
        endAngle: 360,
      });
    }

    return slices;
  }, [top5Departments, totalHospitalInkQuantity]);

  // Stock Health Distribution (Safe vs Warning vs Out of stock)
  const stockHealthStats = useMemo(() => {
    const total = products.length || 1;
    const outCount = products.filter((p) => p.stockQuantity === 0).length;
    const warningCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert).length;
    const safeCount = products.filter((p) => p.stockQuantity > p.minStockAlert).length;

    const safePercent = Number(((safeCount / total) * 100).toFixed(1));
    const warningPercent = Number(((warningCount / total) * 100).toFixed(1));
    const outPercent = Number(((outCount / total) * 100).toFixed(1));

    let angle = 0;
    const safeAngle = (safeCount / total) * 360;
    const warnAngle = (warningCount / total) * 360;
    const outAngle = (outCount / total) * 360;

    const slices = [
      { name: 'Đủ Định Mức An Toàn', count: safeCount, percent: safePercent, color: '#10b981', startAngle: angle, endAngle: (angle += safeAngle) },
      { name: 'Cận Ngưỡng Tối Thiểu', count: warningCount, percent: warningPercent, color: '#f59e0b', startAngle: angle, endAngle: (angle += warnAngle) },
      { name: 'Hết Hàng Hoàn Toàn', count: outCount, percent: outPercent, color: '#ef4444', startAngle: angle, endAngle: (angle += outAngle) },
    ].filter((s) => s.count > 0);

    return {
      total,
      outCount,
      warningCount,
      safeCount,
      safePercent,
      warningPercent,
      outPercent,
      slices,
    };
  }, [products]);

  // Helper for SVG arc path (supports custom center and radius)
  const getArcPath = (
    startAngle: number,
    endAngle: number,
    radius: number,
    innerRadius: number,
    cx: number = 110,
    cy: number = 110
  ) => {
    const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + r * Math.cos(angleInRadians),
        y: centerY + r * Math.sin(angleInRadians),
      };
    };

    const sweepAngle = Math.min(Math.max(0, endAngle - startAngle), 359.99);
    if (sweepAngle <= 0) return '';
    const actualEnd = startAngle + sweepAngle;

    const startOuter = polarToCartesian(cx, cy, radius, actualEnd);
    const endOuter = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = sweepAngle > 180 ? 1 : 0;

    if (innerRadius <= 0) {
      // Solid Pie slice
      return [
        `M ${cx} ${cy}`,
        `L ${endOuter.x} ${endOuter.y}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${startOuter.x} ${startOuter.y}`,
        'Z',
      ].join(' ');
    }

    const startInner = polarToCartesian(cx, cy, innerRadius, actualEnd);
    const endInner = polarToCartesian(cx, cy, innerRadius, startAngle);

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${startInner.x} ${startInner.y}`,
      'Z',
    ].join(' ');
  };

  // Mini circular % gauge renderer for individual low stock items
  const renderCircularGauge = (current: number, minAlert: number) => {
    const isZero = current === 0;
    const pct = minAlert > 0 ? Math.min(100, Math.round((current / minAlert) * 100)) : 100;
    const color = isZero ? '#ef4444' : pct <= 50 ? '#f97316' : '#eab308';
    const radius = 13;
    const circ = 2 * Math.PI * radius;
    const strokeDashoffset = circ - (pct / 100) * circ;

    return (
      <div
        className="relative w-11 h-11 shrink-0 flex items-center justify-center bg-white rounded-lg border border-slate-200/80 shadow-2xs"
        title={`Hiện tồn: ${current} / Tối thiểu: ${minAlert} (${pct}% định mức)`}
      >
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="3.2"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3.2"
            strokeDasharray={circ}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span
          className={`absolute text-[9px] font-bold font-mono ${
            isZero ? 'text-rose-600' : pct <= 50 ? 'text-amber-800' : 'text-slate-800'
          }`}
        >
          {pct}%
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f6fa] overflow-y-auto select-none pb-12">
      {/* 1. Header Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                DASHBOARD ĐIỀU HÀNH KHO IT · CÔNG TY BỆNH VIỆN CỔ PHẦN VPMED
              </h1>
              <span className="text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-semibold">
                REALTIME INSIGHTS
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Tổng quan hạn mức tồn kho & Biểu đồ phân tích tiêu thụ mực in các khoa phòng
            </p>
          </div>
        </div>

        {/* Date Selector & Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-300 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700">Kỳ Thống Kê:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-medium text-slate-800 focus:outline-blue-500 cursor-pointer"
            >
              <option value="THIS_MONTH">Tháng 11/2026 (Hiện tại)</option>
              <option value="LAST_MONTH">Tháng 10/2026 (Tháng trước)</option>
              <option value="QUARTER_4">Quý 4/2026</option>
              <option value="THIS_YEAR">Cả năm 2026</option>
            </select>
          </div>

          <button
            onClick={() => setActiveTab('BAO_CAO_XUAT_NHAP_TON')}
            className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 text-blue-700 border border-blue-300 rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Báo Cáo Chi Tiết</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-medium shadow-2xs transition cursor-pointer"
            title="In trang Dashboard A4"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>In A4</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Executive KPI Cards */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Hàng Sắp Hết Hạn Mức */}
        <div className="bg-white border border-red-200 rounded-xl p-3.5 shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              CẢNH BÁO HẠN MỨC TỒN
            </span>
            <span className="text-[10px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
              {alertStats.totalAlerts} mặt hàng
            </span>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-red-700">
                {alertStats.totalAlerts}
              </span>
              <span className="text-xs text-slate-500">cần nhập bổ sung</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200 font-bold">
                🔴 {alertStats.outOfStock} hết hẳn (0 sp)
              </span>
              <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
                🟠 {alertStats.critical} nguy cấp
              </span>
            </div>
          </div>
          <button
            onClick={() => setStockFilter('ALL')}
            className="mt-3 text-[11px] text-red-700 font-semibold hover:text-red-900 flex items-center gap-1 group cursor-pointer pt-2 border-t border-red-100"
          >
            <span>Xem danh sách cảnh báo</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
          </button>
        </div>

        {/* Card 2: Tiêu Thụ Mực In Trong Tháng */}
        <div className="bg-white border border-blue-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-600" />
              MỰC IN XUẤT TRONG KỲ
            </span>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
              {periodLabel}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-blue-950">
                {formatNumber(totalHospitalInkQuantity)}
              </span>
              <span className="text-xs text-blue-800 font-medium">hộp & lọ mực</span>
            </div>
            <div className="mt-1 text-xs font-mono font-bold text-blue-700">
              Tổng kinh phí: {formatCurrency(totalHospitalInkAmount)}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Cấp cho {allDepartmentInkStats.length} khoa phòng</span>
            <span className="text-blue-700 font-semibold">IT Kho VPMED</span>
          </div>
        </div>

        {/* Card 3: Khoa Tiêu Thụ Mực Nhiều Nhất */}
        <div className="bg-white border border-amber-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <Medal className="w-4 h-4 text-amber-600" />
              KHOA DÙNG MỰC NHIỀU NHẤT
            </span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full">
              TOP 1 QUÁN QUÂN
            </span>
          </div>
          <div className="mt-2.5">
            <div className="font-bold text-slate-900 truncate text-sm" title={top5Departments[0]?.departmentName || 'Chưa có'}>
              {top5Departments[0]?.departmentName || 'Chưa có phát sinh'}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-mono font-bold text-amber-800">
                {top5Departments[0]?.totalQuantity || 0} hộp
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                ({top5Departments[0]?.percentage || 0}% toàn viện)
              </span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Kinh phí: {formatCurrency(top5Departments[0]?.totalAmount || 0)}</span>
            <span className="text-amber-800 font-medium">Khoa trọng điểm</span>
          </div>
        </div>

        {/* Card 4: Tổng Giá Trị Kho Hàng Thực Tế */}
        <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-emerald-600" />
              TỒN KHO THỰC TẾ (KHO IT)
            </span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
              {products.length} SP
            </span>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-emerald-900">
                {formatNumber(alertStats.totalItemsCount)}
              </span>
              <span className="text-xs text-emerald-800">sản phẩm tồn</span>
            </div>
            <div className="mt-1 text-xs font-mono font-bold text-emerald-700">
              {formatCurrency(alertStats.totalInventoryValue)}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Định giá theo giá vốn</span>
            <button
              onClick={() => setActiveTab('QUAN_LY_TON_KHO')}
              className="text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              Xem tồn kho →
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT: 2 COLUMNS (BIỂU ĐỒ TOP 5 KHOA vs CẢNH BÁO HẠN MỨC) */}
      <div className="px-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ======================================================== */}
        {/* CỘT TRÁI (7 COLS): TOP 5 KHOA SỬ DỤNG MỰC IN NHIỀU NHẤT */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between">
          {/* Section Header with View Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-100 text-amber-800">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  TOP 5 KHOA SỬ DỤNG MỰC IN NHIỀU NHẤT ({periodLabel})
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Biểu đồ thống kê số lượng hộp mực in & mực đổ cấp phát cho các khoa phòng
              </p>
            </div>

            {/* Toggle Circular Donut vs Circular Pie vs Horizontal Bar */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
              <button
                onClick={() => setChartMode('DONUT')}
                className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition cursor-pointer ${
                  chartMode === 'DONUT'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hiển thị biểu đồ hình tròn khuyên Donut %"
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Bảng Tròn Donut %</span>
              </button>
              <button
                onClick={() => setChartMode('PIE')}
                className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition cursor-pointer ${
                  chartMode === 'PIE'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hiển thị biểu đồ hình quạt tròn Pie %"
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Bánh Tròn Pie %</span>
              </button>
              <button
                onClick={() => setChartMode('BAR')}
                className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition cursor-pointer ${
                  chartMode === 'BAR'
                    ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hiển thị biểu đồ dạng cột ngang"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Cột Ngang</span>
              </button>
            </div>
          </div>

          {/* VIEW A & B: CIRCULAR % CHARTS (DONUT & PIE) - DEFAULT & PRIMARY */}
          {(chartMode === 'DONUT' || chartMode === 'PIE') && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Large Circular % SVG */}
                <div className="md:col-span-5 flex flex-col items-center justify-center relative p-2 bg-gradient-to-b from-slate-50/60 to-white rounded-xl border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <PieChart className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cơ Cấu Tiêu Thụ Mực (%)</span>
                  </div>

                  <svg viewBox="0 0 220 220" className="w-52 h-52 drop-shadow-xs transition-transform">
                    {donutSlices.map((slice, i) => {
                      const isHovered = hoveredSlice === i;
                      const innerR = chartMode === 'DONUT' ? 58 : 0;
                      const outerR = isHovered ? 98 : 94;

                      return (
                        <path
                          key={i}
                          d={getArcPath(slice.startAngle, slice.endAngle, outerR, innerR, 110, 110)}
                          fill={slice.color}
                          stroke={isHovered ? '#ffffff' : '#f8fafc'}
                          strokeWidth={isHovered ? 3 : 1.5}
                          className="transition-all duration-200 cursor-pointer hover:opacity-95"
                          onMouseEnter={() => setHoveredSlice(i)}
                          onMouseLeave={() => setHoveredSlice(null)}
                          onClick={() => {
                            const dept = top5Departments.find((d) => d.departmentName === slice.name);
                            if (dept) setSelectedDeptModal(dept);
                          }}
                        />
                      );
                    })}

                    {/* Central Hub Display inside Donut */}
                    {chartMode === 'DONUT' && (
                      <g className="pointer-events-none select-none">
                        <circle cx="110" cy="110" r="54" fill="#ffffff" className="drop-shadow-inner" />
                        {hoveredSlice !== null && donutSlices[hoveredSlice] ? (
                          <>
                            <text
                              x="110"
                              y="93"
                              textAnchor="middle"
                              className="text-[10px] font-sans fill-slate-500 font-bold uppercase tracking-wider"
                            >
                              {donutSlices[hoveredSlice].name.length > 14
                                ? `${donutSlices[hoveredSlice].name.slice(0, 13)}…`
                                : donutSlices[hoveredSlice].name}
                            </text>
                            <text
                              x="110"
                              y="117"
                              textAnchor="middle"
                              className="text-2xl font-mono font-bold fill-blue-900"
                            >
                              {donutSlices[hoveredSlice].percent}%
                            </text>
                            <text
                              x="110"
                              y="134"
                              textAnchor="middle"
                              className="text-[10px] font-mono fill-slate-600 font-semibold"
                            >
                              {donutSlices[hoveredSlice].quantity} Hộp/Lọ
                            </text>
                          </>
                        ) : (
                          <>
                            <text
                              x="110"
                              y="93"
                              textAnchor="middle"
                              className="text-[9px] font-sans fill-slate-400 font-bold uppercase tracking-wider"
                            >
                              TỔNG MỰC XUẤT
                            </text>
                            <text
                              x="110"
                              y="117"
                              textAnchor="middle"
                              className="text-2xl font-mono font-bold fill-slate-900"
                            >
                              {totalHospitalInkQuantity}
                            </text>
                            <text
                              x="110"
                              y="134"
                              textAnchor="middle"
                              className="text-[10px] font-sans fill-blue-700 font-bold"
                            >
                              100% Toàn Viện
                            </text>
                          </>
                        )}
                      </g>
                    )}
                  </svg>
                  <div className="text-[10px] text-slate-400 mt-1 italic">
                    Rê chuột vào cung tròn để xem chi tiết % từng khoa
                  </div>
                </div>

                {/* Legend & Ranked Department Percentage Breakdown */}
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1 border-b border-slate-100">
                    <span>Khoa / Phòng Nhận Mực</span>
                    <span>Số Lượng · Tỷ Lệ %</span>
                  </div>

                  {donutSlices.map((slice, i) => {
                    const isHovered = hoveredSlice === i;
                    const dept = top5Departments.find((d) => d.departmentName === slice.name);

                    return (
                      <div
                        key={i}
                        className={`p-2 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 ${
                          isHovered
                            ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                            : 'bg-white hover:bg-slate-50/80 border-slate-100'
                        }`}
                        onMouseEnter={() => setHoveredSlice(i)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        onClick={() => {
                          if (dept) setSelectedDeptModal(dept);
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {i < 5 ? (
                            getRankBadge(i)
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                              #
                            </span>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: slice.color }}
                              />
                              <span className="font-bold text-xs text-slate-900 truncate" title={slice.name}>
                                {slice.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate ml-4">
                              {dept ? `${dept.departmentGroup} · ${formatCurrency(dept.totalAmount)}` : 'Khoa phòng khác'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-mono">
                          <span className="text-xs font-bold text-slate-700">
                            {slice.quantity} <span className="text-[10px] font-normal text-slate-500">sp</span>
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-2xs"
                            style={{ backgroundColor: slice.color }}
                          >
                            {slice.percent}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Second Circular Infographic: TỶ LỆ AN TOÀN TỒN KHO (%) */}
              <div className="mt-4 pt-3 border-t border-slate-200 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Tỷ Lệ % An Toàn Hạn Mức Tồn Kho Toàn Viện
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    {stockHealthStats.safePercent}% Đạt Chuẩn Kho
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Small Circular Health Gauge */}
                  <div className="sm:col-span-4 flex items-center justify-center">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-2xs">
                        {stockHealthStats.slices.map((slice, idx) => (
                          <path
                            key={idx}
                            d={getArcPath(slice.startAngle, slice.endAngle, 52, 34, 60, 60)}
                            fill={slice.color}
                            className="transition hover:opacity-85"
                          />
                        ))}
                      </svg>
                      <div className="absolute text-center pointer-events-none">
                        <div className="text-[9px] font-sans text-slate-400 font-bold uppercase">AN TOÀN</div>
                        <div className="text-base font-mono font-bold text-slate-900">
                          {stockHealthStats.safePercent}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="sm:col-span-8 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-emerald-800 font-semibold uppercase">Đủ Định Mức</div>
                      <div className="text-base font-mono font-bold text-emerald-950 mt-0.5">
                        {stockHealthStats.safePercent}%
                      </div>
                      <div className="text-[10px] font-mono text-emerald-700">{stockHealthStats.safeCount} / {stockHealthStats.total} SP</div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-amber-800 font-semibold uppercase">Cận Định Mức</div>
                      <div className="text-base font-mono font-bold text-amber-950 mt-0.5">
                        {stockHealthStats.warningPercent}%
                      </div>
                      <div className="text-[10px] font-mono text-amber-700">{stockHealthStats.warningCount} SP</div>
                    </div>

                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-rose-800 font-semibold uppercase">Hết Hàng</div>
                      <div className="text-base font-mono font-bold text-rose-950 mt-0.5">
                        {stockHealthStats.outPercent}%
                      </div>
                      <div className="text-[10px] font-mono text-rose-700">{stockHealthStats.outCount} SP</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW C: HORIZONTAL BAR CHART */}
          {chartMode === 'BAR' && (
            <div className="mt-4 space-y-4">
              {top5Departments.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Chưa có dữ liệu xuất cấp phát mực in trong kỳ {periodLabel}.
                </div>
              ) : (
                top5Departments.map((dept, index) => {
                  const widthPercent = Math.max(12, Math.round((dept.totalQuantity / maxTopQty) * 100));
                  const color = deptColors[index];

                  return (
                    <div
                      key={dept.departmentName}
                      className="group p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition cursor-pointer"
                      onClick={() => setSelectedDeptModal(dept)}
                      title="Nhấn để xem chi tiết các mặt hàng mực khoa này đã nhận"
                    >
                      {/* Top row: Rank, Name, Qty & Percent */}
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          {getRankBadge(index)}
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                              {dept.departmentName}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-1.5 font-normal">
                              ({dept.departmentGroup})
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {dept.totalQuantity} <span className="text-xs font-normal text-slate-500">hộp/lọ</span>
                          </span>
                          <span className="ml-2 font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                            {dept.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner relative">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${widthPercent}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>

                      {/* Bottom row: Cost & Favorite Ink item */}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-600">Loại mực dùng nhiều:</span>
                          <span className="text-slate-700 font-semibold truncate max-w-xs">
                            {dept.topProducts[0]?.name || 'Mực in tiêu chuẩn'}
                          </span>
                          <span className="text-blue-600 font-mono">
                            ({dept.topProducts[0]?.quantity || 0} sp)
                          </span>
                        </div>
                        <div className="font-mono font-bold text-slate-700">
                          {formatCurrency(dept.totalAmount)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Bottom Card Summary */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Tổng chi phí mực in toàn viện kỳ này: <strong className="text-slate-900 font-mono">{formatCurrency(totalHospitalInkAmount)}</strong>
            </span>
            <button
              onClick={() => setActiveTab('BAO_CAO_XUAT_NHAP_TON')}
              className="text-blue-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xem sổ cấp phát Khoa / Phòng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CỘT PHẢI (5 COLS): MẶT HÀNG SẮP HẾT HẠN MỨC (THRESHOLD) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between">
          {/* Section Header */}
          <div className="pb-3 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-red-100 text-red-800">
                  <AlertCircle className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  MẶT HÀNG SẮP HẾT HẠN MỨC
                </h2>
              </div>
              <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                {filteredAlertProducts.length} SP
              </span>
            </div>

            {/* Filter Pills */}
            <div className="mt-2.5 flex items-center gap-1 overflow-x-auto text-[11px]">
              <button
                onClick={() => setStockFilter('ALL')}
                className={`px-2 py-0.5 rounded border transition cursor-pointer font-medium ${
                  stockFilter === 'ALL'
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tất cả ({alertStats.totalAlerts})
              </button>
              <button
                onClick={() => setStockFilter('OUT')}
                className={`px-2 py-0.5 rounded border transition cursor-pointer font-medium ${
                  stockFilter === 'OUT'
                    ? 'bg-red-600 text-white border-red-600 font-bold'
                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                }`}
              >
                🔴 Hết hẳn ({alertStats.outOfStock})
              </button>
              <button
                onClick={() => setStockFilter('CRITICAL')}
                className={`px-2 py-0.5 rounded border transition cursor-pointer font-medium ${
                  stockFilter === 'CRITICAL'
                    ? 'bg-amber-600 text-white border-amber-600 font-bold'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                🟠 Nguy cấp ({alertStats.critical})
              </button>
              <button
                onClick={() => setStockFilter('WARNING')}
                className={`px-2 py-0.5 rounded border transition cursor-pointer font-medium ${
                  stockFilter === 'WARNING'
                    ? 'bg-yellow-600 text-white border-yellow-600 font-bold'
                    : 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
                }`}
              >
                🟡 Sắp hết ({alertStats.warning})
              </button>
            </div>
          </div>

          {/* List of Alert Products */}
          <div className="mt-3 space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {filteredAlertProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <div className="font-semibold text-slate-700 text-xs">Kho Hàng An Toàn</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Không có mặt hàng nào thuộc mức cảnh báo này.
                </div>
              </div>
            ) : (
              filteredAlertProducts.map((p) => {
                const isOut = p.stockQuantity === 0;
                const isCrit = p.stockQuantity > 0 && p.stockQuantity <= Math.ceil(p.minStockAlert / 2);

                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-lg border transition ${
                      isOut
                        ? 'bg-red-50/40 border-red-200'
                        : isCrit
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-yellow-50/30 border-yellow-200'
                    }`}
                  >
                    {/* Header line with Mini Circular % Gauge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        {renderCircularGauge(p.stockQuantity, p.minStockAlert)}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-blue-700">{p.sku}</span>
                            <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                              {p.category}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5" title={p.name}>
                            {p.name}
                          </h4>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Vị trí: <span className="font-semibold text-slate-700">{p.warehouseLocation || 'Kho IT'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Urgency Tag */}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 ${
                          isOut
                            ? 'bg-red-600 text-white'
                            : isCrit
                            ? 'bg-amber-600 text-white'
                            : 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                        }`}
                      >
                        {isOut ? 'HẾT HÀNG (0)' : isCrit ? 'NGUY CẤP' : 'DƯỚI HẠN MỨC'}
                      </span>
                    </div>

                    {/* Stock comparison & progress gauge */}
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <div className="flex items-baseline gap-1">
                        <span className="text-slate-500 text-[11px]">Tồn kho:</span>
                        <strong
                          className={`font-mono text-sm ${
                            isOut ? 'text-red-700' : isCrit ? 'text-amber-800' : 'text-yellow-800'
                          }`}
                        >
                          {p.stockQuantity} {p.unit}
                        </strong>
                        <span className="text-slate-400 text-[11px]">/ Đ.mức {p.minStockAlert} {p.unit}</span>
                      </div>

                      <div className="text-[11px] font-mono text-slate-500">
                        {isOut ? 'Thiếu 100%' : `Còn lại ${Math.round((p.stockQuantity / p.minStockAlert) * 100)}%`}
                      </div>
                    </div>

                    {/* Gauge Bar */}
                    <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isOut ? 'bg-red-600 w-0' : isCrit ? 'bg-amber-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, p.stockRatio))}%` }}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-500">
                        Đề xuất nhập thêm: <strong className="text-slate-800 font-mono">+{p.deficit} {p.unit}</strong>
                      </span>

                      <button
                        onClick={() => setIsCreateReceiptModalOpen(true)}
                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
                        title="Tạo phiếu nhập kho bổ sung mặt hàng này"
                      >
                        <PackagePlus className="w-3 h-3" />
                        <span>Nhập Hàng</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick link to realtime inventory */}
          <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              Tự động cập nhật theo mọi phiếu xuất/nhập
            </span>
            <button
              onClick={() => setActiveTab('QUAN_LY_TON_KHO')}
              className="text-blue-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xem 19 mặt hàng kho IT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. DETAILS MODAL FOR SELECTED TOP 5 DEPARTMENT */}
      {selectedDeptModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#2c4779] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-sm">
                  🏆
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {selectedDeptModal.departmentName}
                  </h3>
                  <div className="text-xs text-blue-200 mt-0.5">
                    {selectedDeptModal.departmentGroup} · Tổng {selectedDeptModal.totalQuantity} hộp/lọ mực ({selectedDeptModal.percentage}% toàn viện)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeptModal(null)}
                className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* Product ink breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  Cơ cấu mực in đã lĩnh trong kỳ
                </h4>
                <div className="space-y-1.5 border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                  {selectedDeptModal.topProducts.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 px-2 bg-white rounded border border-slate-100"
                    >
                      <span className="font-medium text-slate-800">{p.name}</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {p.quantity} sp
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order history */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  Các phiếu xuất kho đã cấp ({selectedDeptModal.recentOrders.length} phiếu)
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 text-[11px] font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Ngày</th>
                        <th className="py-2 px-3">Số Phiếu</th>
                        <th className="py-2 px-3">Người Nhận</th>
                        <th className="py-2 px-3 text-right">Tổng Tiền</th>
                        <th className="py-2 px-3 text-center">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDeptModal.recentOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-600">{formatDate(o.date)}</td>
                          <td className="py-2 px-3 font-mono font-bold text-blue-700">{o.code}</td>
                          <td className="py-2 px-3 text-slate-800">{o.receiverName}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(o.finalAmount)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedVoucherForPrint(o);
                                setSelectedDeptModal(null);
                              }}
                              className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] hover:bg-blue-100"
                            >
                              In Phiếu
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Tổng giá trị: <strong>{formatCurrency(selectedDeptModal.totalAmount)}</strong>
              </span>
              <button
                onClick={() => setSelectedDeptModal(null)}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
