import React, { useEffect, useState } from 'react';
import {
  Download,
  Plus,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { StockReceiptItem } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const CreateReceiptModal: React.FC = () => {
  const {
    isCreateReceiptModalOpen,
    setIsCreateReceiptModalOpen,
    products,
    warehouses,
    suppliers,
    createReceiptOrder,
    setIsSupplierModalOpen,
  } = useWarehouse();

  const todayStr = new Date().toISOString().split('T')[0];
  const [code, setCode] = useState(
    `PNK-${todayStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [date, setDate] = useState(todayStr);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [supplierName, setSupplierName] = useState(suppliers[0]?.name || 'Tổng Kho Sản Xuất & Nhập Khẩu Mực In VMAX');
  const [paymentStatus, setPaymentStatus] = useState<'Đã thanh toán' | 'Ghi nợ NCC'>('Đã thanh toán');
  const [warehouseName, setWarehouseName] = useState('Kho Tổng (Hà Nội)');
  const [createdBy, setCreatedBy] = useState('Lê Hoàng Long');
  const [notes, setNotes] = useState('Nhập bổ sung kho theo đơn đặt hàng');

  const [items, setItems] = useState<StockReceiptItem[]>([
    {
      id: 'ri-' + Date.now(),
      productId: products[0]?.id || '',
      sku: products[0]?.sku || '',
      name: products[0]?.name || '',
      unit: products[0]?.unit || 'Hộp',
      quantity: 20,
      unitCost: products[0]?.costPrice || 150000,
      totalCost: (products[0]?.costPrice || 150000) * 20,
    },
  ]);

  useEffect(() => {
    if (suppliers.length > 0 && !selectedSupplierId) {
      setSelectedSupplierId(suppliers[0].id);
      setSupplierName(suppliers[0].name);
    }
  }, [suppliers]);

  if (!isCreateReceiptModalOpen) return null;

  const handleSupplierSelect = (id: string) => {
    setSelectedSupplierId(id);
    const found = suppliers.find((s) => s.id === id);
    if (found) {
      setSupplierName(found.name);
    }
  };

  const handleAddItem = () => {
    const p = products[0];
    if (!p) return;
    setItems((prev) => [
      ...prev,
      {
        id: 'ri-' + Date.now() + Math.random().toString().slice(2, 5),
        productId: p.id,
        sku: p.sku,
        name: p.name,
        unit: p.unit,
        quantity: 10,
        unitCost: p.costPrice,
        totalCost: p.costPrice * 10,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleProductChange = (itemId: string, newProdId: string) => {
    const p = products.find((prod) => prod.id === newProdId);
    if (!p) return;
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const qty = it.quantity || 1;
          const cost = p.costPrice;
          return {
            ...it,
            productId: p.id,
            sku: p.sku,
            name: p.name,
            unit: p.unit,
            unitCost: cost,
            totalCost: qty * cost,
          };
        }
        return it;
      })
    );
  };

  const handleFieldChange = (itemId: string, field: 'quantity' | 'unitCost', value: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const qty = field === 'quantity' ? value : it.quantity;
          const cost = field === 'unitCost' ? value : it.unitCost;
          return {
            ...it,
            [field]: value,
            totalCost: qty * cost,
          };
        }
        return it;
      })
    );
  };

  const totalQuantity = items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  const totalCost = items.reduce((sum, it) => sum + (Number(it.totalCost) || 0), 0);

  const selectedSupplierObj = suppliers.find((s) => s.id === selectedSupplierId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert('Vui lòng chọn hoặc nhập tên nhà cung cấp');
      return;
    }

    createReceiptOrder({
      code,
      date,
      supplierId: selectedSupplierId,
      supplierName: supplierName.trim(),
      warehouseName,
      createdBy,
      items,
      totalQuantity,
      totalCost,
      paymentStatus,
      notes: notes.trim(),
    });

    setIsCreateReceiptModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-xs">
              Lập Phiếu Nhập Kho Từ Nhà Cung Cấp (Tăng Tồn Kho Thực Tế)
            </span>
          </div>
          <button
            onClick={() => setIsCreateReceiptModalOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Số Phiếu Nhập (PNK):</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold text-amber-700"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Ngày Nhập Kho:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Kho Nhập Hàng:</label>
              <select
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-medium"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Supplier Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chọn Nhà Cung Cấp Hàng Hoá:</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(true)}
                  className="text-blue-600 hover:text-blue-800 text-[11px] underline font-medium"
                >
                  + Quản lý danh mục NCC
                </button>
              </div>
              <select
                value={selectedSupplierId}
                onChange={(e) => handleSupplierSelect(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-blue-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.code}] {s.name} - ({s.categories})
                  </option>
                ))}
              </select>
              {selectedSupplierObj && (
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>ĐT: {selectedSupplierObj.phone} · ĐC: {selectedSupplierObj.address}</span>
                  <span className="font-mono text-amber-700 font-semibold">
                    Nợ hiện tại: {formatCurrency(selectedSupplierObj.debtPayable)}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Thanh Toán NCC:</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-medium"
              >
                <option value="Đã thanh toán">Đã thanh toán (Tiền mặt / CK)</option>
                <option value="Ghi nợ NCC">Ghi nợ NCC (Cộng vào công nợ phải trả)</option>
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 flex items-center justify-between border-b border-slate-200">
              <span className="font-semibold text-slate-800">
                Chi Tiết Mặt Hàng Nhập Kho (Mực in / Hộp mực đổ / Linh kiện)
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Dòng Hàng Hóa</span>
              </button>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 text-[11px] border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-1.5 px-2.5">Mặt Hàng Nhập</th>
                  <th className="py-1.5 px-2 text-center w-16">ĐVT</th>
                  <th className="py-1.5 px-2 text-right w-24">Số Lượng</th>
                  <th className="py-1.5 px-2 text-right w-28">Đơn Giá Vốn</th>
                  <th className="py-1.5 px-2 text-right w-32">Thành Tiền (đ)</th>
                  <th className="py-1.5 px-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-1.5 px-2.5">
                      <select
                        value={it.productId}
                        onChange={(e) => handleProductChange(it.id, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.sku}] - {p.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5 px-2 text-center text-slate-600">{it.unit}</td>
                    <td className="py-1.5 px-2 text-right">
                      <input
                        type="number"
                        min="1"
                        required
                        value={it.quantity}
                        onChange={(e) =>
                          handleFieldChange(it.id, 'quantity', Number(e.target.value))
                        }
                        className="w-20 text-right font-mono font-bold px-2 py-1 border border-slate-300 rounded focus:outline-blue-500"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={it.unitCost}
                        onChange={(e) =>
                          handleFieldChange(it.id, 'unitCost', Number(e.target.value))
                        }
                        className="w-24 text-right font-mono px-2 py-1 border border-slate-300 rounded focus:outline-blue-500"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(it.totalCost)}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(it.id)}
                        className="text-slate-400 hover:text-rose-600"
                        title="Xóa dòng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="text-xs font-mono">
              Tổng số lượng nhập: <strong className="text-amber-700 font-bold">{formatNumber(totalQuantity)}</strong> sp |
              Tổng chi phí nhập kho: <strong className="text-emerald-700 font-bold text-sm">{formatCurrency(totalCost)}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateReceiptModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium shadow-xs"
              >
                Xác Nhận Nhập Kho
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
