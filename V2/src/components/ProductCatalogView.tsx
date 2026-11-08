import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  Cpu,
  Edit2,
  MapPin,
  Package,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Product, ProductCategory } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const ProductCatalogView: React.FC = () => {
  const {
    products,
    deleteProduct,
    setEditingProduct,
    setIsCreateProductModalOpen,
    setIsKhoITSyncModalOpen,
    setActiveTab,
    quickAdjustStock,
  } = useWarehouse();

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('Kiểm kê kho thực tế');

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: products.length,
      mucIn: products.filter((p) => p.category === 'Mực in').length,
      hopMucDo: products.filter((p) => p.category === 'Hộp mực đổ').length,
      linhKien: products.filter((p) => p.category === 'Linh kiện máy in máy tính').length,
    };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }
      // Stock status
      if (stockStatusFilter === 'IN_STOCK' && (p.stockQuantity <= p.minStockAlert || p.stockQuantity === 0)) return false;
      if (stockStatusFilter === 'LOW_STOCK' && (p.stockQuantity === 0 || p.stockQuantity > p.minStockAlert)) return false;
      if (stockStatusFilter === 'OUT_OF_STOCK' && p.stockQuantity > 0) return false;

      // Search
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const m1 = p.sku.toLowerCase().includes(t);
        const m2 = p.name.toLowerCase().includes(t);
        const m3 = p.compatibleModels?.toLowerCase().includes(t);
        const m4 = p.warehouseLocation?.toLowerCase().includes(t);
        if (!m1 && !m2 && !m3 && !m4) return false;
      }

      return true;
    });
  }, [products, selectedCategory, stockStatusFilter, searchTerm]);

  const handleDelete = (prod: Product) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm:\n[${prod.sku}] ${prod.name}?`)) {
      const res = deleteProduct(prod.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsCreateProductModalOpen(true);
  };

  const handleOpenAdjustModal = (prod: Product) => {
    setAdjustingProduct(prod);
    setAdjustmentValue(prod.stockQuantity);
    setAdjustmentReason('Kiểm kê kho thực tế');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    quickAdjustStock(adjustingProduct.id, Number(adjustmentValue), adjustmentReason);
    setAdjustingProduct(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Top action and filter bar */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">:::</span>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsCreateProductModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Mặt Hàng Mới</span>
          </button>

          <button
            onClick={() => setIsKhoITSyncModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c4779] hover:bg-[#1f345b] text-white rounded font-medium shadow-xs transition"
            title="Làm mới kho và chỉnh sửa trực tiếp số lượng tồn thực tế 19 mặt hàng Kho IT"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
            <span>Làm Mới & Sửa SL Kho IT</span>
          </button>

          <span className="h-4 w-px bg-slate-300 mx-1"></span>

          {/* Quick status filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-300 p-0.5 rounded">
            <button
              onClick={() => setStockStatusFilter('ALL')}
              className={`px-2 py-0.5 rounded transition ${
                stockStatusFilter === 'ALL' ? 'bg-slate-800 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStockStatusFilter('LOW_STOCK')}
              className={`px-2 py-0.5 rounded transition flex items-center gap-1 ${
                stockStatusFilter === 'LOW_STOCK' ? 'bg-amber-600 text-white font-medium' : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Sắp hết
            </button>
            <button
              onClick={() => setStockStatusFilter('OUT_OF_STOCK')}
              className={`px-2 py-0.5 rounded transition ${
                stockStatusFilter === 'OUT_OF_STOCK' ? 'bg-rose-600 text-white font-medium' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Hết hàng
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã SKU, tên hàng, dòng máy in (Canon 2900, HP 12A...)"
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

      {/* Category Tabs: Mực in, Hộp mực đổ, Linh kiện máy in máy tính */}
      <div className="bg-slate-50 border-b border-slate-300 px-3 pt-2 flex items-center gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition ${
            selectedCategory === 'ALL'
              ? 'border-blue-600 text-blue-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Tất Cả Danh Mục</span>
          <span className="font-mono text-[11px] bg-slate-200 px-1.5 py-0.2 rounded text-slate-700">
            {categoryCounts.all}
          </span>
        </button>

        <button
          onClick={() => setSelectedCategory('Mực in')}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition ${
            selectedCategory === 'Mực in'
              ? 'border-blue-600 text-blue-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Printer className="w-3.5 h-3.5 text-blue-600" />
          <span>Mực In (Cartridge)</span>
          <span className="font-mono text-[11px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
            {categoryCounts.mucIn}
          </span>
        </button>

        <button
          onClick={() => setSelectedCategory('Hộp mực đổ')}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition ${
            selectedCategory === 'Hộp mực đổ'
              ? 'border-blue-600 text-blue-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-amber-600" />
          <span>Hộp Mực Đổ (Mực Nạp)</span>
          <span className="font-mono text-[11px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
            {categoryCounts.hopMucDo}
          </span>
        </button>

        <button
          onClick={() => setSelectedCategory('Linh kiện máy in máy tính')}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 font-medium transition ${
            selectedCategory === 'Linh kiện máy in máy tính'
              ? 'border-blue-600 text-blue-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-600" />
          <span>Linh Kiện Máy In Máy Tính</span>
          <span className="font-mono text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
            {categoryCounts.linhKien}
          </span>
        </button>
      </div>

      {/* Main Table View */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-300 font-semibold z-10">
            <tr>
              <th className="py-2 px-3 w-10 text-center">#</th>
              <th className="py-2 px-3 whitespace-nowrap">Mã SKU</th>
              <th className="py-2 px-3">Tên Sản Phẩm / Quy Cách</th>
              <th className="py-2 px-3 whitespace-nowrap">Nhóm Hàng</th>
              <th className="py-2 px-3 text-center whitespace-nowrap">ĐVT</th>
              <th className="py-2 px-3 text-right whitespace-nowrap">Giá Vốn</th>
              <th className="py-2 px-3 text-right whitespace-nowrap">Giá Xuất/Bán</th>
              <th className="py-2 px-3 text-right whitespace-nowrap bg-blue-50/70 border-x border-blue-200">
                Tồn Kho Hiện Tại
              </th>
              <th className="py-2 px-3 text-right whitespace-nowrap">Định Mức Tối Thiểu</th>
              <th className="py-2 px-3 whitespace-nowrap">Vị Trí Kho</th>
              <th className="py-2 px-3 text-center whitespace-nowrap w-28">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Không có sản phẩm nào phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p, idx) => {
                const isOutOfStock = p.stockQuantity === 0;
                const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {p.sku}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-slate-900">{p.name}</div>
                      {p.compatibleModels && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 italic">
                          Dùng cho: {p.compatibleModels}
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
                    <td className="py-2 px-3 text-right font-mono text-slate-600">
                      {formatCurrency(p.costPrice)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(p.sellingPrice)}
                    </td>
                    {/* Live Real-Time Stock Column */}
                    <td className="py-2 px-3 text-right font-mono font-bold bg-blue-50/70 border-x border-blue-200">
                      <div className="flex items-center justify-end gap-1.5">
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
                        {isLowStock && (
                          <span
                            className="text-[10px] text-amber-700 bg-amber-100 px-1 rounded font-normal"
                            title="Sắp hết hàng, cần nhập thêm"
                          >
                            Cảnh báo
                          </span>
                        )}
                        {isOutOfStock && (
                          <span
                            className="text-[10px] text-rose-700 bg-rose-100 px-1 rounded font-normal"
                            title="Đã hết hàng trong kho"
                          >
                            Hết hàng
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500">
                      {p.minStockAlert}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-600">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {p.warehouseLocation || 'Kho Tổng'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenAdjustModal(p)}
                          className="p-1 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded"
                          title="Kiểm kê / Điều chỉnh nhanh số lượng tồn kho"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="bg-slate-100 border-t border-slate-300 px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-700">
        <div>
          Số lượng mặt hàng hiển thị: <strong className="text-slate-900">{filteredProducts.length}</strong> sản phẩm
        </div>
        <div className="flex items-center gap-6">
          <div>
            Tổng số lượng tồn:{' '}
            <strong className="text-blue-700 font-bold">
              {formatNumber(filteredProducts.reduce((sum, p) => sum + p.stockQuantity, 0))}
            </strong>
          </div>
          <div>
            Tổng giá trị tồn theo giá vốn:{' '}
            <strong className="text-emerald-700 font-bold text-sm">
              {formatCurrency(
                filteredProducts.reduce((sum, p) => sum + p.stockQuantity * p.costPrice, 0)
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* Quick Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-xs">
                  Kiểm Kê / Điều Chỉnh Tồn Kho Thời Gian Thực
                </span>
              </div>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="font-mono font-bold text-blue-700">{adjustingProduct.sku}</div>
                <div className="font-medium text-slate-800">{adjustingProduct.name}</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Đơn vị tính: <strong>{adjustingProduct.unit}</strong> | Vị trí: <strong>{adjustingProduct.warehouseLocation}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Tồn kho hiện tại:</label>
                  <input
                    type="text"
                    disabled
                    value={adjustingProduct.stockQuantity}
                    className="w-full bg-slate-100 border border-slate-200 rounded px-2.5 py-1.5 font-mono text-slate-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-900 font-semibold mb-1">
                    Số lượng thực tế mới:
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={adjustmentValue}
                    onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                    className="w-full bg-white border border-blue-400 rounded px-2.5 py-1.5 font-mono text-blue-700 font-bold text-sm focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Lý do điều chỉnh kiểm kê:</label>
                <input
                  type="text"
                  required
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Kiểm kê định kỳ, sai lệch kiểm đếm, hỏng vỡ..."
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs"
                >
                  Xác Nhận Lưu Tồn Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
