import React, { useState } from 'react';
import { Printer, X } from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { StockIssueOrder } from '../types';
import { formatNumber, numberToVietnameseWords } from '../utils/formatters';

interface PrintableVoucherModalProps {
  order: StockIssueOrder;
  onClose: () => void;
}

export const PrintableVoucherModal: React.FC<PrintableVoucherModalProps> = ({ order, onClose }) => {
  const { companyInfo } = useWarehouse();

  // Exactly 3 Signatories as requested: Người lập phiếu, Người nhận hàng, Quản lý khoa phòng
  const [signatories, setSignatories] = useState({
    createdBy: (order.createdBy || 'Nguyễn Văn Tuấn').normalize('NFC'),
    receiver: (order.receiverName || order.customerName || '').normalize('NFC'),
    departmentManager: '', // Quản lý khoa phòng (có thể gõ tên hoặc để trống ký tay)
  });

  const handlePrint = () => {
    window.print();
  };

  const parsedDate = new Date(order.date || new Date());
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const year = parsedDate.getFullYear();

  // Safe normalized text strings in Unicode NFC
  const titleText = 'PHIẾU XUẤT KHO'.normalize('NFC');
  const mẫuSốText = 'Mẫu số 02 - VT'.normalize('NFC');
  const circularText = '(Ban hành theo Thông tư số 200/2014/TT-BTC ngày 22/12/2014 của Bộ Tài chính)'.normalize('NFC');
  const amountInWords = numberToVietnameseWords(order.finalAmount).normalize('NFC');
  const receiverNameText = (order.receiverName || order.customerName || '').normalize('NFC');
  const departmentText = (order.customerAddress || order.customerName || '').normalize('NFC');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden print:w-full print:max-w-none print:shadow-none print:border-none">
        {/* Modal Action Bar (Hidden when printing) - Clean & Minimal */}
        <div className="no-print bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-xs tracking-wide">
              Xem Trước Phiếu Xuất Kho Chuẩn Kế Toán (Mẫu số 02 - VT)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Print button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu A4 Ngay</span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area - 100% Default Times New Roman Standard */}
        <div
          className="print-area p-8 text-slate-950 bg-white"
          style={{
            fontFamily: '"Times New Roman", Times, "Liberation Serif", serif',
          }}
        >
          {/* Company & Document Header */}
          <div className="flex justify-between items-start border-b border-black/40 pb-3 mb-4">
            <div className="text-xs leading-relaxed max-w-sm">
              <div className="font-bold uppercase tracking-normal text-slate-950">
                {companyInfo.name.normalize('NFC')}
              </div>
              <div>Địa chỉ: {companyInfo.address.normalize('NFC')}</div>
              <div>Điện thoại: {companyInfo.phone.normalize('NFC')}</div>
              <div>Mã số thuế: {companyInfo.taxCode.normalize('NFC')}</div>
            </div>

            <div className="text-right text-xs">
              <div className="font-bold text-slate-950">{mẫuSốText}</div>
              <div className="italic text-[11px] text-slate-700 max-w-xs leading-tight mt-0.5">
                {circularText}
              </div>
              <div className="mt-2 font-mono font-bold text-sm text-slate-900">
                Số: {order.code}
              </div>
              <div className="text-[11px] text-slate-700 font-mono">Nợ: 632 / Có: 156</div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-4">
            <h1 className="text-2xl font-bold uppercase tracking-normal text-slate-950">
              {titleText}
            </h1>
            <div className="italic text-xs text-slate-700 mt-1">
              Ngày {day} tháng {month} năm {year}
            </div>
          </div>

          {/* Receiver & Warehouse Information */}
          <div className="text-xs space-y-1.5 mb-5 leading-relaxed">
            <div className="flex">
              <span className="w-48 text-slate-700">Họ và tên người nhận hàng:</span>
              <span className="font-bold text-slate-950">{receiverNameText}</span>
            </div>
            <div className="flex">
              <span className="w-48 text-slate-700">Khoa / Phòng nhận:</span>
              <span className="font-semibold text-slate-950">{departmentText}</span>
              {order.customerPhone && (
                <span className="ml-4 text-slate-700">
                  - SĐT: <span className="font-mono font-medium">{order.customerPhone}</span>
                </span>
              )}
            </div>
            <div className="flex">
              <span className="w-48 text-slate-700">Lý do xuất kho:</span>
              <span className="italic text-slate-800">
                {(order.reason || 'Xuất cấp phát vật tư mực in & linh kiện máy tính').normalize('NFC')}
              </span>
            </div>
            <div className="flex">
              <span className="w-48 text-slate-700">Xuất tại kho:</span>
              <span className="font-medium text-slate-950">
                {order.warehouseName.normalize('NFC')}
              </span>
            </div>
          </div>

          {/* Table of Goods */}
          <table className="w-full text-xs border border-black border-collapse mb-4">
            <thead>
              <tr className="bg-slate-100/80 text-center font-bold">
                <th className="border border-black py-2 px-1 w-8" rowSpan={2}>
                  STT
                </th>
                <th className="border border-black py-2 px-2" rowSpan={2}>
                  Tên, nhãn hiệu, quy cách, phẩm chất vật tư
                  <div className="font-normal text-[10px] italic">(Mực in, đổ, linh kiện)</div>
                </th>
                <th className="border border-black py-2 px-2 w-28" rowSpan={2}>
                  Mã số (SKU)
                </th>
                <th className="border border-black py-2 px-2 w-14" rowSpan={2}>
                  ĐVT
                </th>
                <th className="border border-black py-1 px-2" colSpan={2}>
                  Số lượng
                </th>
                <th className="border border-black py-2 px-2 w-24 text-right" rowSpan={2}>
                  Đơn giá (đ)
                </th>
                <th className="border border-black py-2 px-2 w-28 text-right" rowSpan={2}>
                  Thành tiền (đ)
                </th>
              </tr>
              <tr className="bg-slate-50 text-center text-[10px]">
                <th className="border border-black py-1 px-1 w-14">Yêu cầu</th>
                <th className="border border-black py-1 px-1 w-14">Thực xuất</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={it.id || idx}>
                  <td className="border border-black py-1.5 px-1 text-center font-mono">
                    {idx + 1}
                  </td>
                  <td className="border border-black py-1.5 px-2">
                    <div className="font-semibold text-slate-900">{it.name.normalize('NFC')}</div>
                  </td>
                  <td className="border border-black py-1.5 px-2 font-mono text-[11px] text-center">
                    {it.sku}
                  </td>
                  <td className="border border-black py-1.5 px-1 text-center">{it.unit}</td>
                  <td className="border border-black py-1.5 px-1 text-center font-mono">
                    {it.quantity}
                  </td>
                  <td className="border border-black py-1.5 px-1 text-center font-mono font-bold">
                    {it.quantity}
                  </td>
                  <td className="border border-black py-1.5 px-2 text-right font-mono">
                    {formatNumber(it.unitPrice)}
                  </td>
                  <td className="border border-black py-1.5 px-2 text-right font-mono font-semibold">
                    {formatNumber(it.totalPrice)}
                  </td>
                </tr>
              ))}

              {/* Total row */}
              <tr className="font-bold bg-slate-50/80">
                <td colSpan={4} className="border border-black py-2 px-3 text-center uppercase tracking-wide">
                  TỔNG CỘNG
                </td>
                <td className="border border-black py-2 px-1 text-center font-mono">
                  {order.totalQuantity}
                </td>
                <td className="border border-black py-2 px-1 text-center font-mono font-bold">
                  {order.totalQuantity}
                </td>
                <td className="border border-black py-2 px-2 text-right">x</td>
                <td className="border border-black py-2 px-2 text-right font-mono text-sm font-bold">
                  {formatNumber(order.finalAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Amount in words */}
          <div className="text-xs mb-6 italic text-slate-900">
            - Tổng số tiền (viết bằng chữ):{' '}
            <strong className="font-bold not-italic text-slate-950">
              {amountInWords}
            </strong>
          </div>

          {/* Date & 3 Signature Columns */}
          <div className="text-right text-xs italic mb-2">
            Xuất kho, ngày {day} tháng {month} năm {year}
          </div>

          {/* Exactly 3 Signature Columns: Người lập phiếu, Người nhận hàng, Quản lý khoa phòng */}
          <div className="grid grid-cols-3 text-center text-xs gap-6 pt-3 pb-4">
            {/* 1. Người lập phiếu */}
            <div className="flex flex-col items-center">
              <div className="font-bold text-slate-950 uppercase tracking-wide">
                Người lập phiếu
              </div>
              <div className="italic text-[10px] text-slate-600">(Ký, họ tên)</div>
              <div className="h-20"></div>
              <div className="w-full max-w-[220px]">
                <input
                  type="text"
                  value={signatories.createdBy}
                  onChange={(e) =>
                    setSignatories((prev) => ({ ...prev, createdBy: e.target.value }))
                  }
                  title="Nhấp để sửa tên người lập phiếu nếu cần"
                  className="w-full text-center font-bold text-slate-950 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-blue-50/40 rounded px-1 py-0.5 outline-none print:border-none print:bg-transparent text-xs transition cursor-text"
                />
              </div>
            </div>

            {/* 2. Người nhận hàng */}
            <div className="flex flex-col items-center">
              <div className="font-bold text-slate-950 uppercase tracking-wide">
                Người nhận hàng
              </div>
              <div className="italic text-[10px] text-slate-600">(Ký, họ tên)</div>
              <div className="h-20"></div>
              <div className="w-full max-w-[220px]">
                <input
                  type="text"
                  value={signatories.receiver}
                  onChange={(e) =>
                    setSignatories((prev) => ({ ...prev, receiver: e.target.value }))
                  }
                  title="Nhấp để sửa tên người nhận hàng nếu cần"
                  className="w-full text-center font-bold text-slate-950 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-blue-50/40 rounded px-1 py-0.5 outline-none print:border-none print:bg-transparent text-xs transition cursor-text"
                />
              </div>
            </div>

            {/* 3. Quản lý khoa phòng */}
            <div className="flex flex-col items-center">
              <div className="font-bold text-slate-950 uppercase tracking-wide">
                Quản lý khoa phòng
              </div>
              <div className="italic text-[10px] text-slate-600">(Ký, họ tên)</div>
              <div className="h-20"></div>
              <div className="w-full max-w-[220px]">
                <input
                  type="text"
                  value={signatories.departmentManager}
                  onChange={(e) =>
                    setSignatories((prev) => ({ ...prev, departmentManager: e.target.value }))
                  }
                  placeholder="(Ký, ghi rõ họ tên)"
                  title="Nhấp để điền họ tên Quản lý khoa phòng hoặc để trống ký tay"
                  className="w-full text-center font-bold text-slate-950 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-blue-50/40 rounded px-1 py-0.5 outline-none print:border-none print:bg-transparent text-xs transition cursor-text placeholder:text-slate-400 placeholder:italic placeholder:font-normal"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
