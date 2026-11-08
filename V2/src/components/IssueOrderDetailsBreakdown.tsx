import React, { useMemo, useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';

export const IssueOrderDetailsBreakdown: React.FC = () => {
  const { issueOrders, products } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Flatten all line items with voucher metadata
  const allLineItems = useMemo(() => {
    const list: Array<{
      orderId: string;
      orderCode: string;
      orderDate: string;
      customerName: string;
      itemId: string;
      productId: string;
      sku: string;
      name: string;
      category: string;
      unit: string;
      quantity: number;
      unitPrice: number;
      discountPercent: number;
      totalPrice: number;
    }> = [];

    issueOrders.forEach((order) => {
      order.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        list.push({
          orderId: order.id,
          orderCode: order.code,
          orderDate: order.date,
          customerName: order.customerName,
          itemId: item.id,
          productId: item.productId,
          sku: item.sku,
          name: item.name,
          category: prod?.category || 'Linh kiện máy in máy tính',
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          totalPrice: item.totalPrice,
        });
      });
    });

    return list.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [issueOrders, products]);

  const filteredItems = useMemo(() => {
    return allLineItems.filter((item) => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const m1 = item.orderCode.toLowerCase().includes(t);
        const m2 = item.customerName.toLowerCase().includes(t);
        const m3 = item.sku.toLowerCase().includes(t);
        const m4 = item.name.toLowerCase().includes(t);
        if (!m1 && !m2 && !m3 && !m4) return false;
      }
      return true;
    });
  }, [allLineItems, categoryFilter, searchTerm]);

  const totalSummary = useMemo(() => {
    return filteredItems.reduce(
      (acc, it) => {
        acc.quantity += it.quantity;
        acc.amount += it.totalPrice;
        return acc;
      },
      { quantity: 0, amount: 0 }
    );
  }, [filteredItems]);

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Subheader and Filters */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 uppercase tracking-wide">
            Bảng Kê Chi Tiết Hàng Xuất Kho
          </span>
          <span className="text-slate-500">
            ({filteredItems.length} dòng ghi nhận)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Nhóm hàng:</span>
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

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã hàng, tên sản phẩm..."
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

      {/* Grid of detail rows */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-300 font-semibold z-10">
            <tr>
              <th className="py-2 px-3 w-10 text-center">#</th>
              <th className="py-2 px-3 whitespace-nowrap">Ngày Xuất</th>
              <th className="py-2 px-3 whitespace-nowrap">Số Phiếu PXK</th>
              <th className="py-2 px-3 whitespace-nowrap">Khách Hàng Nhận</th>
              <th className="py-2 px-3 whitespace-nowrap">Mã Sản Phẩm</th>
              <th className="py-2 px-3">Tên Mặt Hàng</th>
              <th className="py-2 px-3 whitespace-nowrap">Nhóm Hàng</th>
              <th className="py-2 px-3 text-center whitespace-nowrap">ĐVT</th>
              <th className="py-2 px-3 text-right whitespace-nowrap">Số Lượng</th>
              <th className="py-2 px-3 text-right whitespace-nowrap">Đơn Giá Xuất</th>
              <th className="py-2 px-3 text-right whitespace-nowrap">Thành Tiền (đ)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Không có chi tiết mặt hàng xuất nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => (
                <tr key={`${item.orderId}-${item.itemId}`} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">
                    {formatDate(item.orderDate)}
                  </td>
                  <td className="py-2 px-3 font-mono font-medium text-blue-700 whitespace-nowrap">
                    {item.orderCode}
                  </td>
                  <td className="py-2 px-3 max-w-[180px] truncate" title={item.customerName}>
                    {item.customerName}
                  </td>
                  <td className="py-2 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {item.sku}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900 max-w-xs truncate" title={item.name}>
                    {item.name}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                        item.category === 'Mực in'
                          ? 'bg-blue-100 text-blue-800'
                          : item.category === 'Hộp mực đổ'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center text-slate-600">{item.unit}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    {formatNumber(item.quantity)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(item.totalPrice)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer totals */}
      <div className="bg-slate-100 border-t border-slate-300 px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-700">
        <div>
          Tổng dòng chi tiết: <strong>{filteredItems.length}</strong> dòng
        </div>
        <div className="flex items-center gap-6">
          <div>
            Tổng số lượng xuất: <strong className="text-blue-700 font-bold">{formatNumber(totalSummary.quantity)}</strong>
          </div>
          <div>
            Tổng thành tiền:{' '}
            <strong className="text-emerald-700 font-bold text-sm">
              {formatCurrency(totalSummary.amount)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
