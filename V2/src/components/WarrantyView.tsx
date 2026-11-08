import React, { useMemo, useState } from 'react';
import { Plus, RotateCcw, ShieldAlert, Trash2 } from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { WarrantyItem } from '../types';
import { HOSPITAL_DEPARTMENTS } from './CustomersModal';

type Status = WarrantyItem['status'];
const LABEL: Record<Status, { t: string; c: string }> = {
  CON_BAO_HANH: { t: 'Còn bảo hành', c: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  SAP_HET_HAN: { t: 'Sắp hết hạn', c: 'bg-amber-100 text-amber-800 border-amber-300' },
  HET_HAN: { t: 'Hết hạn', c: 'bg-slate-200 text-slate-600 border-slate-300' },
  DANG_DOI_TRA_NCC: { t: 'Đang đổi trả NCC', c: 'bg-blue-100 text-blue-800 border-blue-300' },
  DA_DOI_TRA_XONG: { t: 'Đã đổi trả xong', c: 'bg-violet-100 text-violet-800 border-violet-300' },
};

const addMonths = (date: string, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

/** Trạng thái hiệu lực theo ngày hôm nay (trừ khi đang trong quy trình đổi trả). */
const effectiveStatus = (w: WarrantyItem): Status => {
  if (w.status === 'DANG_DOI_TRA_NCC' || w.status === 'DA_DOI_TRA_XONG') return w.status;
  const days = (new Date(w.endDate).getTime() - Date.now()) / 86400000;
  if (days < 0) return 'HET_HAN';
  if (days <= 30) return 'SAP_HET_HAN';
  return 'CON_BAO_HANH';
};

export const WarrantyView: React.FC = () => {
  const { warranties, products, suppliers, addWarranty, updateWarranty, deleteWarranty } = useWarehouse();
  const [filter, setFilter] = useState<'ALL' | Status>('ALL');
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({
    productId: products[0]?.id || '',
    supplierId: suppliers[0]?.id || '',
    serialNumber: '',
    departmentUsed: HOSPITAL_DEPARTMENTS[0],
    warrantyMonths: 12,
    startDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const rows = useMemo(
    () => warranties.map((w) => ({ w, st: effectiveStatus(w) })).filter((r) => filter === 'ALL' || r.st === filter),
    [warranties, filter]
  );

  const save = () => {
    const p = products.find((x) => x.id === f.productId);
    const s = suppliers.find((x) => x.id === f.supplierId);
    if (!p || !s) return alert('Vui lòng chọn mặt hàng và nhà cung cấp.');
    if (!(f.warrantyMonths > 0)) return alert('Số tháng bảo hành phải lớn hơn 0.');
    addWarranty({
      serialNumber: f.serialNumber.trim(),
      productId: p.id, productName: p.name, sku: p.sku,
      supplierId: s.id, supplierName: s.name,
      departmentUsed: f.departmentUsed,
      warrantyMonths: f.warrantyMonths,
      startDate: f.startDate,
      endDate: addMonths(f.startDate, f.warrantyMonths),
      status: 'CON_BAO_HANH',
      notes: f.notes.trim(),
    });
    setCreating(false);
  };

  const sendToSupplier = (w: WarrantyItem) => {
    const reason = prompt('Lý do đổi trả / lỗi của linh kiện:');
    if (!reason?.trim()) return;
    updateWarranty(w.id, {
      status: 'DANG_DOI_TRA_NCC',
      returnHistory: [
        ...(w.returnHistory || []),
        { returnDate: new Date().toISOString().slice(0, 10), reason: reason.trim(), supplierResponse: 'Đã gửi NCC, chờ phản hồi', status: 'Chờ NCC đổi mới' },
      ],
    });
  };

  const resolve = (w: WarrantyItem, outcome: 'NCC đã đổi mới' | 'NCC hoàn tiền') => {
    const hist = [...(w.returnHistory || [])];
    if (hist.length === 0) return;
    hist[hist.length - 1] = { ...hist[hist.length - 1], status: outcome, resolvedDate: new Date().toISOString().slice(0, 10), supplierResponse: outcome };
    updateWarranty(w.id, { status: 'DA_DOI_TRA_XONG', returnHistory: hist });
  };

  const field = 'w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs';

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden text-xs">
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 flex flex-wrap items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-blue-700" />
        <span className="font-bold uppercase tracking-wide text-slate-800">Bảo Hành & Đổi Trả NCC ({rows.length})</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="border border-slate-300 rounded px-2 py-1.5 bg-white">
          <option value="ALL">Tất cả</option>
          {Object.entries(LABEL).map(([k, v]) => <option key={k} value={k}>{v.t}</option>)}
        </select>
        <button onClick={() => setCreating((v) => !v)} className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium">
          <Plus className="w-3.5 h-3.5" /> {creating ? 'Đóng form' : 'Thêm Bảo Hành'}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {creating && (
          <div className="bg-white border border-slate-300 rounded p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
            <label className="md:col-span-2">Mặt hàng / linh kiện
              <select className={field} value={f.productId} onChange={(e) => setF({ ...f, productId: e.target.value })}>
                {products.map((p) => <option key={p.id} value={p.id}>[{p.sku}] {p.name}</option>)}
              </select></label>
            <label className="md:col-span-2">Nhà cung cấp
              <select className={field} value={f.supplierId} onChange={(e) => setF({ ...f, supplierId: e.target.value })}>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select></label>
            <label>Serial / Số lô<input className={`${field} font-mono`} value={f.serialNumber} onChange={(e) => setF({ ...f, serialNumber: e.target.value })} /></label>
            <label className="md:col-span-2">Khoa phòng đang dùng
              <select className={field} value={f.departmentUsed} onChange={(e) => setF({ ...f, departmentUsed: e.target.value })}>
                {HOSPITAL_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select></label>
            <label>Số tháng BH<input type="number" min="1" className={field} value={f.warrantyMonths} onChange={(e) => setF({ ...f, warrantyMonths: Number(e.target.value) })} /></label>
            <label>Ngày bàn giao<input type="date" className={field} value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></label>
            <label className="md:col-span-2">Ghi chú<input className={field} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
            <div className="flex items-end justify-end"><button onClick={save} className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium">Lưu</button></div>
          </div>
        )}

        <div className="bg-white border border-slate-300 rounded overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] font-semibold border-b border-slate-200"><tr>
              <th className="py-2 px-3">Linh kiện / Serial</th><th className="py-2 px-3">NCC</th><th className="py-2 px-3">Khoa phòng</th>
              <th className="py-2 px-3">Thời hạn BH</th><th className="py-2 px-3">Trạng thái</th><th className="py-2 px-3">Đổi trả</th><th className="py-2 px-3 w-10" />
            </tr></thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map(({ w, st }) => (
                <tr key={w.id} className="align-top hover:bg-slate-50">
                  <td className="py-2 px-3"><div className="font-mono font-bold text-blue-800">{w.sku}</div><div>{w.productName}</div><div className="font-mono text-[10px] text-slate-400">{w.serialNumber || '—'}</div></td>
                  <td className="py-2 px-3">{w.supplierName}</td>
                  <td className="py-2 px-3">{w.departmentUsed}</td>
                  <td className="py-2 px-3 font-mono text-[11px]">{w.startDate} → {w.endDate}<div className="text-slate-400">{w.warrantyMonths} tháng</div></td>
                  <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${LABEL[st].c}`}>{LABEL[st].t}</span></td>
                  <td className="py-2 px-3">
                    {(w.returnHistory || []).map((h, i) => (
                      <div key={i} className="text-[11px] mb-1"><b>{h.returnDate}</b> · {h.reason}<div className="text-slate-500">{h.status}{h.resolvedDate ? ` (${h.resolvedDate})` : ''}</div></div>
                    ))}
                    {(st === 'CON_BAO_HANH' || st === 'SAP_HET_HAN') && (
                      <button onClick={() => sendToSupplier(w)} className="flex items-center gap-1 px-2 py-1 border border-blue-300 text-blue-800 rounded bg-white"><RotateCcw className="w-3 h-3" /> Gửi đổi trả NCC</button>
                    )}
                    {st === 'DANG_DOI_TRA_NCC' && (
                      <div className="flex gap-1">
                        <button onClick={() => resolve(w, 'NCC đã đổi mới')} className="px-2 py-1 bg-emerald-600 text-white rounded">NCC đã đổi mới</button>
                        <button onClick={() => resolve(w, 'NCC hoàn tiền')} className="px-2 py-1 bg-violet-600 text-white rounded">NCC hoàn tiền</button>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3"><button onClick={() => confirm('Xóa hồ sơ bảo hành này?') && deleteWarranty(w.id)} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-slate-400">Không có hồ sơ phù hợp.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
