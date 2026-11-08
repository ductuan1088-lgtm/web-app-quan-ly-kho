import React, { useState, useEffect } from 'react';
import {
  Boxes,
  CheckCircle2,
  Info,
  RefreshCw,
  RotateCcw,
  Save,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { INITIAL_PRODUCTS } from '../data/initialData';
import { formatNumber } from '../utils/formatters';

interface KhoITBatchSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KhoITBatchSyncModal: React.FC<KhoITBatchSyncModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { products, updateProduct, resetToDefaultData, quickAdjustStock } = useWarehouse();

  // Local state for batch editing quantities
  const [quantities, setQuantities] = useState<{ [id: string]: number }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialMap: { [id: string]: number } = {};
      products.forEach((p) => {
        initialMap[p.id] = p.stockQuantity;
      });
      setQuantities(initialMap);
      setSaveSuccess(false);
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  const currentTotalQuantity = Object.values(quantities).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );

  const handleQtyChange = (productId: string, val: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    Object.entries(quantities).forEach(([prodId, newQty]) => {
      quickAdjustStock(prodId, Number(newQty), 'Đồng bộ tồn kho thực tế Kho IT');
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetToExactScreenshot = () => {
    const photoMap: { [id: string]: number } = {};
    INITIAL_PRODUCTS.forEach((p) => {
      photoMap[p.id] = p.stockQuantity;
    });
    setQuantities(photoMap);
  };

  const handleAdjustToMatch229 = () => {
    // Screenshot has header "Kho Hàng: Kho IT - Số Lượng: 229"
    // Sum of rows 1-19 is 204. By adding 25 to Mực đổ máy in (73 -> 98), total becomes 229
    const updated = { ...quantities };
    const mucDoProd = products.find((p) => p.sku === 'MD-LASER' || p.sku === 'IT26.23' || p.id === 'prod-it-17');
    if (mucDoProd) {
      updated[mucDoProd.id] = 98;
      setQuantities(updated);
    }
  };

  const handleFullResetApp = () => {
    if (
      confirm(
        'Bạn có chắc chắn muốn làm mới toàn bộ Kho IT về danh mục 19 sản phẩm chuẩn và nạp lại dữ liệu ban đầu?'
      )
    ) {
      resetToDefaultData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 overflow-y-auto no-print">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#2c4779] text-white px-4 py-3 flex items-center justify-between border-b border-[#1f345b]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide">
                LÀM MỚI VÀ ĐIỀU CHỈNH SỐ LƯỢNG TỒN KHO THỰC TẾ · KHO IT
              </h2>
              <p className="text-[11px] text-blue-200">
                Đồng bộ nhanh danh mục 19 mặt hàng & số lượng theo biên bản kiểm kê thực tế
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Help & Guidance */}
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2.5 text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold text-blue-950">Hướng dẫn sửa số lượng tồn thực tế:</span>{' '}
            Bạn có thể nhập trực tiếp số lượng kiểm đếm vào ô <strong>Số Lượng</strong> bên dưới,
            hoặc bấm nút <strong>"Khôi phục theo ảnh kiểm kê"</strong> để tải lại đúng 19 mã hàng
            với tổng số lượng chuẩn. Bấm <strong>"Lưu & Đồng Bộ"</strong> để cập nhật ngay vào kho!
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToExactScreenshot}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded border border-slate-300 font-medium shadow-2xs transition"
              title="Điền lại số lượng đúng như ảnh bảng kiểm kê (Tổng 204)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Khôi phục theo ảnh (Tổng 204)</span>
            </button>

            <button
              type="button"
              onClick={handleAdjustToMatch229}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded border border-slate-300 font-medium shadow-2xs transition"
              title="Chỉnh Mực đổ máy in lên 98 để tổng số lượng đúng 229 theo nhãn Kho IT"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              <span>Cân đối tổng = 229</span>
            </button>

            <button
              type="button"
              onClick={handleFullResetApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded border border-amber-300 font-medium shadow-2xs transition"
              title="Làm mới hoàn toàn dữ liệu về mặc định"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              <span>Làm mới toàn bộ kho</span>
            </button>
          </div>

          {/* Realtime Quantity Pill matching the screenshot group header */}
          <div className="flex items-center gap-2 bg-[#2c4779] text-white px-3 py-1 rounded text-xs font-mono font-bold shadow-xs">
            <span>Kho Hàng: Kho IT</span>
            <span className="text-blue-300">-</span>
            <span>Số Lượng: <span className="text-amber-300 text-sm">{formatNumber(currentTotalQuantity)}</span></span>
          </div>
        </div>

        {/* Main Table replicating user screenshot */}
        <div className="flex-1 overflow-auto p-4 bg-slate-50">
          <form id="khoit-sync-form" onSubmit={handleSaveAll}>
            <div className="border border-slate-300 rounded overflow-hidden bg-white shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#eef2f7] text-slate-700 font-semibold border-b border-slate-300 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center border-r border-slate-200">STT</th>
                    <th className="py-2.5 px-3 w-32 border-r border-slate-200">Mã Hàng</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Tên Hàng</th>
                    <th className="py-2.5 px-3 w-20 text-center border-r border-slate-200">Đơn Vị</th>
                    <th className="py-2.5 px-3 w-40 text-center bg-blue-50/80 border-r border-blue-200 text-blue-900">
                      Số Lượng Thực Tế
                    </th>
                    <th className="py-2.5 px-3 w-32 border-r border-slate-200">Nhóm Hàng</th>
                    <th className="py-2.5 px-3 w-28 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* Group header identical to user screenshot */}
                  <tr className="bg-[#dfe7f3] font-bold text-slate-800 text-[11px]">
                    <td colSpan={7} className="py-1.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-700">&#9662;</span>
                        <span>Kho Hàng: Kho IT</span>
                        <span className="text-slate-400">-</span>
                        <span className="text-blue-900">
                          Số Lượng: {formatNumber(currentTotalQuantity)}
                        </span>
                        <span className="text-[10px] font-normal text-slate-500 italic ml-2">
                          (Gồm {products.length} mặt hàng)
                        </span>
                      </div>
                    </td>
                  </tr>

                  {products.map((p, idx) => {
                    const currentVal = quantities[p.id] ?? p.stockQuantity;
                    const isZero = currentVal === 0;
                    const isLow = currentVal > 0 && currentVal <= p.minStockAlert;

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-blue-50/40 transition ${
                          idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                        }`}
                      >
                        <td className="py-2 px-3 text-center text-slate-500 font-mono border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-blue-700 border-r border-slate-200 whitespace-nowrap">
                          {p.sku}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <div className="font-semibold text-slate-900">{p.name}</div>
                          {p.compatibleModels && (
                            <div className="text-[11px] text-slate-400 line-clamp-1 italic">
                              {p.compatibleModels}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-700 font-medium border-r border-slate-200">
                          {p.unit}
                        </td>
                        {/* Editable Quantity Column */}
                        <td className="py-1.5 px-3 border-r border-blue-200 bg-blue-50/40">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(p.id, Math.max(0, currentVal - 1))}
                              className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs transition"
                              title="Giảm 1"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={currentVal}
                              onChange={(e) =>
                                handleQtyChange(p.id, Math.max(0, parseInt(e.target.value) || 0))
                              }
                              className="w-20 text-center font-mono font-bold text-sm bg-white border border-blue-300 rounded py-1 px-1 text-blue-900 focus:outline-blue-600 focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleQtyChange(p.id, currentVal + 1)}
                              className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs transition"
                              title="Tăng 1"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-slate-600">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-[11px] border border-slate-200">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          {isZero ? (
                            <span className="text-[10px] text-rose-700 bg-rose-100 font-semibold px-2 py-0.5 rounded">
                              Hết hàng (0)
                            </span>
                          ) : isLow ? (
                            <span className="text-[10px] text-amber-800 bg-amber-100 font-semibold px-2 py-0.5 rounded">
                              Sắp hết (&le; {p.minStockAlert})
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded">
                              Đủ hàng
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-300 px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            {saveSuccess ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Đã đồng bộ số lượng tồn kho thành công!
              </span>
            ) : (
              <span>
                Nhập số lượng thực tế kiểm kê rồi bấm <strong>Lưu & Đồng Bộ Tồn Kho</strong> để hoàn tất.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-white font-medium transition"
            >
              Đóng
            </button>
            <button
              type="submit"
              form="khoit-sync-form"
              className="flex items-center gap-1.5 px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>Lưu & Đồng Bộ Tồn Kho</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
