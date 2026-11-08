import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BarChart2,
  Boxes,
  CheckCircle2,
  Download,
  MapPin,
  Package,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Product, ProductCategory } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const InventoryRealtimeView: React.FC = () => {
  const {
    products,
    getOverallStats,
    setActiveTab,
    setSubTabXuattKho,
    setIsCreateReceiptModalOpen,
    setIsKhoITSyncModalOpen,
    quickAdjustStock,
  } = useWarehouse();

  const stats = getOverallStats();
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'SAFE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Quick adjust state
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [newStockQty, setNewStockQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Kiểm kê kho thực tế');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
      if (statusFilter === 'CRITICAL' && p.stockQuantity > p.minStockAlert) return false;
      if (statusFilter === 'SAFE' && p.stockQuantity <= p.minStockAlert) return false;

      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const m1 = p.sku.toLowerCase().includes(t);
        const m2 = p.name.toLowerCase().includes(t);
        const m3 = p.warehouseLocation?.toLowerCase().includes(t);
        const m4 = p.compatibleModels?.toLowerCase().includes(t);
        if (!m1 && !m2 && !m3 && !m4) return false;
      }
      return true;
    });
  }, [products, categoryFilter, statusFilter, searchTerm]);

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    quickAdjustStock(adjustingProduct.id, Number(newStockQty), adjustReason);
    setAdjustingProduct(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Realtime KPI Strip */}
      <div className="bg-white border-b border-slate-300 p-3 grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
          <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
            <span>Tổng Mặt Hàng</span>
            <Package className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-mono font-bold text-slate-900 mt-1">
            {stats.totalProducts} <span className="text-xs font-normal text-slate-500">mã</span>
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded p-2.5">
          <div className="text-[11px] font-medium text-emerald-800 flex items-center justify-between">
            <span>Tồn Kho Thực Tế</span>
            <Boxes className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-800 mt-1">
            {formatNumber(stats.totalStockCount)}{' '}
            <span className="text-xs font-normal text-emerald-600">sp</span>
          </div>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 rounded p-2.5">
          <div className="text-[11px] font-medium text-blue-800 flex items-center justify-between">
            <span>Giá Trị Tồn (Vốn)</span>
            <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-base font-mono font-bold text-blue-900 mt-1 truncate">
            {formatCurrency(stats.totalStockValue)}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`cursor-pointer border rounded p-2.5 transition ${
            stats.lowStockCount > 0
              ? 'bg-amber-50 border-amber-300 hover:bg-amber-100/70'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-[11px] font-medium text-amber-800 flex items-center justify-between">
            <span>Sắp Hết Hàng (&le; Min)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-mono font-bold text-amber-700 mt-1">
            {stats.lowStockCount} <span className="text-xs font-normal text-amber-600">mã</span>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`cursor-pointer border rounded p-2.5 transition ${
            stats.outOfStockCount > 0
              ? 'bg-rose-50 border-rose-300 hover:bg-rose-100/70'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-[11px] font-medium text-rose-800 flex items-center justify-between">
            <span>Đã Hết Hàng (= 0)</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-mono font-bold text-rose-700 mt-1">
            {stats.outOfStockCount} <span className="text-xs font-normal text-rose-600">mã</span>
          </div>
        </div>
      </div>

      {/* Subheader and Filters */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 uppercase tracking-wide">
            Giám Sát Tồn Kho Thời Gian Thực (Live Stock)
          </span>

          <span className="h-4 w-px bg-slate-300 mx-1"></span>

          <button
            onClick={() => setIsCreateReceiptModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium shadow-2xs transition"
          >
            <Download className="w-3 h-3" />
            <span>Nhập Hàng Vào Kho</span>
          </button>

          <button
            onClick={() => setIsKhoITSyncModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#2c4779] hover:bg-[#1f345b] text-white rounded font-semibold shadow-2xs transition"
            title="Làm mới kho và chỉnh sửa trực tiếp số lượng tồn thực tế 19 mặt hàng Kho IT"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
            <span>Làm Mới Kho IT (Sửa SL Thực Tế)</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Nhóm:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-blue-500 font-medium"
            >
              <option value="ALL">Tất cả nhóm</option>
              <option value="Mực in">Mực in</option>
              <option value="Hộp mực đổ">Hộp mực đổ</option>
              <option value="Linh kiện máy in máy tính">Linh kiện máy in máy tính</option>
            </select>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã SKU, tên hàng, vị trí kệ..."
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

      {/* Real-time Inventory Table */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-300 font-semibold z-10">
            <tr>
              <th className="py-2 px-3 w-10 text-center">#</th>
              <th className="py-2 px-3 whitespace-nowrap">Mã Sản Phẩm</th>
              <th className="py-2 px-3">Tên Mặt Hàng / Quy Cách</th>
              <th className="py-2 px-3 whitespace-nowrap">Nhóm Hàng</th>
              <th className="py-2 px-3 text-center whitespace-nowrap">ĐVT</th>
              <th className="py-2 px-3 whitespace-nowrap">Vị Trí Kệ</th>
              <th className="py-2 px-3 text-right whitespace-nowrap">Định Mức Min</th>
              <th className="py-2 px-3 text-right whitespace-nowrap bg-emerald-50/70 border-x border-emerald-200">
                Tồn Kho Thời Gian Thực
              </th>
              <th className="py-2 px-3 text-center whitespace-nowrap">Trạng Thái Kho</th>
              <th className="py-2 px-3 text-right whitespace-nowrap">Giá Trị Tồn (đ)</th>
              <th className="py-2 px-3 text-center whitespace-nowrap w-36">Hành Động Nhanh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredProducts.map((p, idx) => {
              const isOutOfStock = p.stockQuantity === 0;
              const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert;
              const stockPercentage = Math.min(100, Math.round((p.stockQuantity / (p.minStockAlert * 2)) * 100));

              return (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 font-mono whitespace-nowrap">
                    <span className="font-bold text-blue-800 bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-200">
                      {p.sku}
                    </span>
                    {p.notes && p.notes.includes('Mã cũ:') && (
                      <div className="text-[10px] text-slate-400 font-normal font-sans mt-0.5">
                        {p.notes.match(/\(Mã cũ: [^)]+\)/)?.[0] || ''}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    {p.compatibleModels && (
                      <div className="text-[11px] text-slate-500 line-clamp-1 italic">
                        Tương thích: {p.compatibleModels}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                        p.category === 'Mực in'
                          ? 'bg-blue-100 text-blue-800'
                          : p.category === 'Hộp mực đổ'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.category}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center text-slate-600 font-medium">{p.unit}</td>
                  <td className="py-2 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                    <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {p.warehouseLocation}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-500">
                    {p.minStockAlert}
                  </td>
                  {/* Realtime Stock Level with mini bar */}
                  <td className="py-2 px-3 text-right font-mono font-bold bg-emerald-50/70 border-x border-emerald-200">
                    <div className="flex flex-col items-end">
                      <span
                        className={`text-sm ${
                          isOutOfStock
                            ? 'text-rose-600'
                            : isLowStock
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {formatNumber(p.stockQuantity)}
                      </span>
                      {/* Visual indicator bar */}
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOutOfStock
                              ? 'bg-rose-500'
                              : isLowStock
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(5, stockPercentage)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  {/* Status */}
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3" />
                        Hết Hàng
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3" />
                        Sắp Hết
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        Còn Hàng
                      </span>
                    )}
                  </td>
                  {/* Total Stock Value */}
                  <td className="py-2 px-3 text-right font-mono font-medium text-slate-800">
                    {formatCurrency(p.stockQuantity * p.costPrice)}
                  </td>
                  {/* Quick Actions */}
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          setAdjustingProduct(p);
                          setNewStockQty(p.stockQuantity);
                          setAdjustReason('Kiểm kê kho thực tế');
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-[11px] font-medium transition"
                        title="Điều chỉnh số lượng kiểm kê"
                      >
                        Kiểm kê
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('QUAN_LY_XUAT_KHO');
                          setSubTabXuattKho('LAP_PHIEU');
                        }}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 text-[11px] font-medium transition"
                        title="Lập phiếu xuất mặt hàng này"
                      >
                        Xuất
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Adjust Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-md overflow-hidden">
            <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
              <span className="font-semibold text-xs">
                Cập Nhật Tồn Kho: {adjustingProduct.sku}
              </span>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="font-medium text-slate-900">{adjustingProduct.name}</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  ĐVT: {adjustingProduct.unit} | Tồn hiện tại:{' '}
                  <strong className="text-slate-800">{adjustingProduct.stockQuantity}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Số lượng tồn thực tế mới:
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(Number(e.target.value))}
                  className="w-full bg-white border border-blue-400 rounded px-2.5 py-1.5 font-mono text-blue-700 font-bold text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Lý do điều chỉnh:</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
                >
                  Lưu Tồn Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
