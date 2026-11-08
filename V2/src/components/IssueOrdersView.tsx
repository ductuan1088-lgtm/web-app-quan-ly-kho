import React, { useMemo, useState } from 'react';
import {
  Eye,
  FileCheck,
  FileSpreadsheet,
  Plus,
  Printer,
  Search,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { StockIssueOrder } from '../types';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';

export const IssueOrdersView: React.FC = () => {
  const {
    issueOrders,
    deleteIssueOrder,
    setEditingIssueOrder,
    setSelectedVoucherForPrint,
    setSubTabXuattKho,
    subTabXuattKho,
    customers,
    hasPermission,
  } = useWarehouse();

  // Selection state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    issueOrders[0]?.id || null
  );

  // Filters matching screenshot
  const [dateFilterOption, setDateFilterOption] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-11-30');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected order details
  const selectedOrder = useMemo(() => {
    return issueOrders.find((o) => o.id === selectedOrderId) || issueOrders[0] || null;
  }, [issueOrders, selectedOrderId]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return issueOrders.filter((order) => {
      // Date filter
      if (dateFilterOption === 'custom') {
        if (startDate && order.date < startDate) return false;
        if (endDate && order.date > endDate) return false;
      }
      // Customer filter
      if (selectedCustomerFilter !== 'ALL' && order.customerId !== selectedCustomerFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchCode = order.code.toLowerCase().includes(term);
        const matchCust = order.customerName.toLowerCase().includes(term);
        const matchReason = order.reason?.toLowerCase().includes(term);
        const matchItem = order.items.some(
          (it) => it.name.toLowerCase().includes(term) || it.sku.toLowerCase().includes(term)
        );
        if (!matchCode && !matchCust && !matchReason && !matchItem) return false;
      }
      return true;
    });
  }, [issueOrders, dateFilterOption, startDate, endDate, selectedCustomerFilter, searchTerm]);

  // Aggregate stats of filtered orders
  const totals = useMemo(() => {
    return filteredOrders.reduce(
      (acc, o) => {
        acc.count += 1;
        acc.quantity += o.totalQuantity;
        acc.amount += o.finalAmount;
        return acc;
      },
      { count: 0, quantity: 0, amount: 0 }
    );
  }, [filteredOrders]);

  const handleDateOptionChange = (opt: string) => {
    setDateFilterOption(opt);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    if (opt === 'this_month') {
      const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (opt === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleDeleteCurrent = () => {
    if (!selectedOrder) {
      alert('Vui lòng chọn một chứng từ xuất kho để xóa');
      return;
    }
    if (!hasPermission('canDeleteVouchers')) {
      alert('Tài khoản của bạn không có quyền xóa chứng từ xuất kho. Vui lòng liên hệ Quản trị viên!');
      return;
    }
    if (
      confirm(
        `XÁC NHẬN XÓA:\nBạn có chắc chắn muốn xóa phiếu xuất kho "${selectedOrder.code}"?\n\nToàn bộ ${selectedOrder.totalQuantity} sản phẩm trong phiếu sẽ được hoàn lại tồn kho thực tế ngay lập tức.`
      )
    ) {
      deleteIssueOrder(selectedOrder.id);
      setSelectedOrderId(null);
    }
  };

  const handleEditCurrent = () => {
    if (!selectedOrder) {
      alert('Vui lòng chọn một chứng từ xuất kho để sửa');
      return;
    }
    setEditingIssueOrder(selectedOrder);
    setSubTabXuattKho('LAP_PHIEU');
  };

  const handlePrintCurrent = () => {
    if (!selectedOrder) {
      alert('Vui lòng chọn một chứng từ xuất kho để xem và in');
      return;
    }
    setSelectedVoucherForPrint(selectedOrder);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Title & Toolbar Bar - Exactly matching screenshot "Chứng Từ Xuất Kho" */}
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Action Buttons: Xem, Sửa, Xóa, Lập Phiếu Thu, Đóng */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 mr-1 text-xs">:::</span>

            {/* Xem / Chi tiết */}
            <button
              onClick={handlePrintCurrent}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 rounded border border-slate-300 text-xs font-medium shadow-2xs hover:border-slate-400 transition"
              title="Xem trước mẫu phiếu xuất kho"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xem Phiếu</span>
            </button>

            {/* Sửa */}
            <button
              onClick={handleEditCurrent}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 rounded border border-slate-300 text-xs font-medium shadow-2xs hover:border-slate-400 transition"
              title="Chỉnh sửa chứng từ đã lập"
            >
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              <span>Sửa</span>
            </button>

            {/* Xóa */}
            <button
              onClick={handleDeleteCurrent}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-700 rounded border border-slate-300 text-xs font-medium shadow-2xs hover:border-rose-300 transition"
              title="Xóa chứng từ & hoàn tồn kho"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Xóa</span>
            </button>

            {/* In Phiếu Chuẩn */}
            <button
              onClick={handlePrintCurrent}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 rounded border border-slate-300 text-xs font-medium shadow-2xs hover:border-slate-400 transition"
              title="In hóa đơn xuất kho A4"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>In Phiếu A4</span>
            </button>

            <span className="h-4 w-px bg-slate-300 mx-1"></span>

            {/* Lập Phiếu Xuất Mới */}
            <button
              onClick={() => {
                setEditingIssueOrder(null);
                setSubTabXuattKho('LAP_PHIEU');
              }}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lập Phiếu Mới</span>
            </button>
          </div>

          {/* Header Title on the right */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Chứng Từ Xuất Kho
            </span>
          </div>
        </div>

        {/* Filters Bar: Tùy Chọn, Từ ngày, Đến ngày, Khách Hàng */}
        <div className="mt-2 pt-2 border-t border-slate-300 flex flex-wrap items-center gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium whitespace-nowrap">Tùy Chọn:</span>
            <select
              value={dateFilterOption}
              onChange={(e) => handleDateOptionChange(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-blue-500 font-medium"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="this_month">Tháng hiện tại (11/2026)</option>
              <option value="custom">Tự chọn ngày...</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 whitespace-nowrap">Từ:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateFilterOption('custom');
              }}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 whitespace-nowrap">Đến:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateFilterOption('custom');
              }}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 min-w-[220px]">
            <span className="text-slate-600 whitespace-nowrap font-medium">Khoa / Đơn Vị:</span>
            <select
              value={selectedCustomerFilter}
              onChange={(e) => setSelectedCustomerFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-blue-500 flex-1 truncate font-medium"
            >
              <option value="ALL">-- Tất cả khoa phòng / cán bộ --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.group}] {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã PXK, tên khách, mặt hàng..."
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

      {/* Main Content Area: Master List + Detail Inspector */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Master Table of Issue Orders */}
        <div className="flex-1 flex flex-col border-r border-slate-300 overflow-hidden bg-white">
          <div className="overflow-auto flex-1">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-300 font-semibold z-10">
                <tr>
                  <th className="py-2 px-3 w-10 text-center">#</th>
                  <th className="py-2 px-3 whitespace-nowrap">Số Chứng Từ</th>
                  <th className="py-2 px-3 whitespace-nowrap">Ngày Xuất</th>
                  <th className="py-2 px-3 whitespace-nowrap">Người Nhận & Khoa Phòng</th>
                  <th className="py-2 px-3 text-right whitespace-nowrap">SL Xuất</th>
                  <th className="py-2 px-3 text-right whitespace-nowrap">Tổng Tiền (đ)</th>
                  <th className="py-2 px-3 whitespace-nowrap">Thanh Toán</th>
                  <th className="py-2 px-3 whitespace-nowrap">Kho Xuất</th>
                  <th className="py-2 px-3 whitespace-nowrap">Người Lập</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      Không tìm thấy chứng từ xuất kho nào phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, idx) => {
                    const isSelected = selectedOrderId === order.id;
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        onDoubleClick={handlePrintCurrent}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-900 font-medium'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-mono font-semibold text-blue-700 whitespace-nowrap">
                          {order.code}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {formatDate(order.date)}
                        </td>
                        <td className="py-2 px-3 max-w-xs truncate" title={order.customerName}>
                          <div className="font-semibold text-slate-900">{order.receiverName || order.customerName}</div>
                          <div className="text-[11px] text-slate-500">{order.customerAddress || order.customerName}</div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium">
                          {formatNumber(order.totalQuantity)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                          {formatCurrency(order.finalAmount)}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded ${
                              order.paymentStatus === 'Đã thanh toán'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.paymentStatus === 'Ghi công nợ'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-[120px]">
                          {order.warehouseName}
                        </td>
                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                          {order.createdBy}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Master Footer Summary */}
          <div className="bg-slate-100 border-t border-slate-300 px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-700">
            <div>
              Tổng số chứng từ: <strong className="text-slate-900 font-bold">{totals.count}</strong> phiếu
            </div>
            <div className="flex items-center gap-6">
              <div>
                Tổng số lượng xuất: <strong className="text-blue-700 font-bold">{formatNumber(totals.quantity)}</strong> mặt hàng
              </div>
              <div>
                Tổng tiền hàng xuất:{' '}
                <strong className="text-emerald-700 font-bold text-sm">
                  {formatCurrency(totals.amount)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Panel: Selected Voucher Preview (Chi Tiết Mặt Hàng) */}
        {selectedOrder && (
          <div className="w-full md:w-[420px] lg:w-[480px] bg-slate-50 border-t md:border-t-0 flex flex-col overflow-hidden">
            <div className="bg-slate-200/90 px-3 py-2 border-b border-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-700" />
                <span className="font-semibold text-xs text-slate-800">
                  Chi Tiết Phiếu: {selectedOrder.code}
                </span>
              </div>
              <button
                onClick={handlePrintCurrent}
                className="flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 font-medium underline"
              >
                <Printer className="w-3 h-3" />
                In phiếu
              </button>
            </div>

            {/* Voucher Metadata */}
            <div className="p-3 bg-white border-b border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Người nhận:</span>
                <span className="font-semibold text-slate-900 text-right truncate max-w-[260px]">
                  {selectedOrder.receiverName || selectedOrder.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khoa / Phòng:</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[260px]">
                  {selectedOrder.customerAddress || selectedOrder.customerName}
                </span>
              </div>
              {selectedOrder.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="font-mono text-slate-800">{selectedOrder.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Kho xuất:</span>
                <span className="text-slate-800 font-medium">{selectedOrder.warehouseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lý do xuất:</span>
                <span className="text-slate-700 italic text-right max-w-[260px]">
                  {selectedOrder.reason || 'Xuất bán hàng'}
                </span>
              </div>
            </div>

            {/* Items Table in Selected Order */}
            <div className="flex-1 overflow-auto bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-1.5 px-2.5">Sản Phẩm / Mã Hàng</th>
                    <th className="py-1.5 px-2 text-right">ĐVT</th>
                    <th className="py-1.5 px-2 text-right">SL</th>
                    <th className="py-1.5 px-2 text-right">Đơn Giá</th>
                    <th className="py-1.5 px-2.5 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items.map((it, idx) => (
                    <tr key={it.id || idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2.5">
                        <div className="font-medium text-slate-900 line-clamp-2">{it.name}</div>
                        <div className="text-[10px] text-blue-600 font-mono">{it.sku}</div>
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-600">{it.unit}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                        {it.quantity}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-600">
                        {formatNumber(it.unitPrice)}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono font-semibold text-slate-900">
                        {formatNumber(it.totalPrice)} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Bottom Financial Summary */}
            <div className="bg-slate-50 p-3 border-t border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Cộng tiền hàng:</span>
                <span className="font-mono">{formatCurrency(selectedOrder.subtotalAmount)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Chiết khấu giảm trừ:</span>
                  <span className="font-mono">-{formatCurrency(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-300">
                <span>Tổng cộng thanh toán:</span>
                <span className="text-emerald-700 font-mono">
                  {formatCurrency(selectedOrder.finalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
