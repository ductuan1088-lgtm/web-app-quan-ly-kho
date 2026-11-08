import React, { useMemo, useState } from 'react';
import { ClipboardCheck, Plus, Scale, Trash2 } from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { StockAuditItem, StockAuditOrder } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const StockAuditView: React.FC = () => {
  const { products, auditOrders, createAuditOrder, balanceAuditOrder, deleteAuditOrder, currentUser, hasPermission } =
    useWarehouse();
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [auditor, setAuditor] = useState(currentUser.name);
  const [witness, setWitness] = useState('');
  const [notes, setNotes] = useState('');
  const [actuals, setActuals] = useState<Record<string, string>>({});
  const [onlyDiff, setOnlyDiff] = useState(false);

  const rows = useMemo(
    () =>
      products.map((p) => {
        const raw = actuals[p.id];
        const counted = raw !== undefined && raw !== '';
        const actual = counted ? Number(raw) : p.stockQuantity;
        return { p, counted, actual, diff: actual - p.stockQuantity };
      }),
    [products, actuals]
  );
  const visibleRows = onlyDiff ? rows.filter((r) => r.diff !== 0) : rows;
  const totalDiff = rows.reduce((s, r) => s + r.diff, 0);
  const totalDiffValue = rows.reduce((s, r) => s + r.diff * r.p.costPrice, 0);

  const startNew = () => {
    setActuals({});
    setNotes('');
    setWitness('');
    setAuditor(currentUser.name);
    setCreating(true);
  };

  const save = (status: StockAuditOrder['status']) => {
    if (!auditor.trim() || !witness.trim()) {
      alert('Vui lòng nhập Người kiểm kê và Người chứng kiến.');
      return;
    }
    if (rows.some((r) => r.counted && (!Number.isFinite(r.actual) || r.actual < 0))) {
      alert('Số lượng kiểm đếm thực tế phải là số không âm.');
      return;
    }
    const items: StockAuditItem[] = rows.map(({ p, actual, diff }) => ({
      productId: p.id,
      sku: p.sku,
      name: p.name,
      unit: p.unit,
      systemStock: p.stockQuantity,
      actualStock: actual,
      difference: diff,
      costPrice: p.costPrice,
      diffValue: diff * p.costPrice,
    }));
    const today = new Date().toISOString().slice(0, 10);
    const order = createAuditOrder({
      code: `KK-${today.replace(/-/g, '')}-${String(auditOrders.length + 1).padStart(3, '0')}`,
      auditDate: today,
      auditorName: auditor.trim(),
      witnessName: witness.trim(),
      items,
      totalSystemStock: items.reduce((s, i) => s + i.systemStock, 0),
      totalActualStock: items.reduce((s, i) => s + i.actualStock, 0),
      totalDiffQuantity: totalDiff,
      totalDiffValue,
      status,
      notes: notes.trim(),
    });
    setCreating(false);
    setExpanded(order.id);
  };

  const diffClass = (n: number) => (n === 0 ? 'text-slate-500' : n > 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold');

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden text-xs">
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 flex items-center gap-2">
        <ClipboardCheck className="w-4 h-4 text-blue-700" />
        <span className="font-bold uppercase tracking-wide text-slate-800">
          {creating ? 'Lập Phiếu Kiểm Kê Mới' : `Kiểm Kê Kho (${auditOrders.length} phiếu)`}
        </span>
        {!creating ? (
          <button onClick={startNew} className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium">
            <Plus className="w-3.5 h-3.5" /> Lập Phiếu Kiểm Kê
          </button>
        ) : (
          <div className="ml-auto flex gap-2">
            <button onClick={() => setCreating(false)} className="px-3 py-1.5 border border-slate-300 rounded bg-white">Hủy</button>
            <button onClick={() => save('Bản nháp')} className="px-3 py-1.5 border border-blue-300 text-blue-800 rounded bg-white">Lưu nháp</button>
            <button onClick={() => save('Đã hoàn thành')} className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium">Hoàn thành kiểm kê</button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {creating && (
          <div className="bg-white border border-slate-300 rounded">
            <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-slate-200">
              <label>Người kiểm kê *<input className="w-full border border-slate-300 rounded px-2 py-1.5" value={auditor} onChange={(e) => setAuditor(e.target.value)} /></label>
              <label>Người chứng kiến / Thủ kho *<input className="w-full border border-slate-300 rounded px-2 py-1.5" value={witness} onChange={(e) => setWitness(e.target.value)} /></label>
              <label>Ghi chú<input className="w-full border border-slate-300 rounded px-2 py-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
            </div>
            <div className="px-3 py-2 flex items-center gap-4 bg-slate-50 border-b border-slate-200">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} /> Chỉ hiện dòng có chênh lệch
              </label>
              <span className="text-slate-500">Dòng chưa nhập được coi là khớp sổ sách.</span>
              <span className="ml-auto">Chênh lệch: <b className={diffClass(totalDiff)}>{totalDiff > 0 ? '+' : ''}{formatNumber(totalDiff)}</b> · <b className={diffClass(totalDiffValue)}>{formatCurrency(totalDiffValue)}</b></span>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Mã hàng</th><th className="py-2 px-3">Tên hàng</th>
                  <th className="py-2 px-3 text-right">Tồn sổ sách</th><th className="py-2 px-3 text-right w-32">Tồn thực tế</th>
                  <th className="py-2 px-3 text-right">Chênh lệch</th><th className="py-2 px-3 text-right">Giá trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRows.map(({ p, diff }) => (
                  <tr key={p.id} className={diff !== 0 ? 'bg-amber-50/50' : ''}>
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-800">{p.sku}</td>
                    <td className="py-1.5 px-3">{p.name}</td>
                    <td className="py-1.5 px-3 text-right font-mono">{formatNumber(p.stockQuantity)} {p.unit}</td>
                    <td className="py-1.5 px-3 text-right">
                      <input
                        type="number" min="0" placeholder={String(p.stockQuantity)}
                        value={actuals[p.id] ?? ''}
                        onChange={(e) => setActuals((a) => ({ ...a, [p.id]: e.target.value }))}
                        className="w-24 text-right font-mono border border-slate-300 rounded px-2 py-1"
                      />
                    </td>
                    <td className={`py-1.5 px-3 text-right font-mono ${diffClass(diff)}`}>{diff > 0 ? '+' : ''}{diff}</td>
                    <td className={`py-1.5 px-3 text-right font-mono ${diffClass(diff)}`}>{formatCurrency(diff * p.costPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!creating && auditOrders.map((o) => (
          <div key={o.id} className="bg-white border border-slate-300 rounded">
            <div className="px-3 py-2 flex flex-wrap items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
              <span className="font-mono font-bold text-blue-800">{o.code}</span>
              <span>{o.auditDate}</span>
              <span className="text-slate-500">KK: {o.auditorName} · CK: {o.witnessName}</span>
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${o.status === 'Đã cân bằng kho' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : o.status === 'Bản nháp' ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>{o.status}</span>
              <span className="ml-auto">Chênh lệch: <b className={diffClass(o.totalDiffQuantity)}>{o.totalDiffQuantity > 0 ? '+' : ''}{o.totalDiffQuantity}</b> · <b className={diffClass(o.totalDiffValue)}>{formatCurrency(o.totalDiffValue)}</b></span>
              {o.status !== 'Đã cân bằng kho' && (
                <span className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      if (!hasPermission('canAdjustStock')) return alert('Bạn không có quyền cân bằng kho.');
                      if (!confirm(`Cân bằng kho theo ${o.code}? Phần thừa/thiếu sẽ được cộng/trừ vào tồn kho hiện tại.`)) return;
                      const r = balanceAuditOrder(o.id);
                      if (!r.success) alert(r.message);
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded"
                  ><Scale className="w-3 h-3" /> Cân bằng kho</button>
                  <button onClick={() => confirm(`Xóa phiếu ${o.code}?`) && deleteAuditOrder(o.id)} className="p-1 text-slate-500 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </span>
              )}
            </div>
            {expanded === o.id && (
              <div className="border-t border-slate-200 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-semibold"><tr>
                    <th className="py-1.5 px-3">Mã hàng</th><th className="py-1.5 px-3">Tên hàng</th>
                    <th className="py-1.5 px-3 text-right">Sổ sách</th><th className="py-1.5 px-3 text-right">Thực tế</th>
                    <th className="py-1.5 px-3 text-right">Chênh lệch</th><th className="py-1.5 px-3 text-right">Giá trị</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {o.items.map((i) => (
                      <tr key={i.productId} className={i.difference !== 0 ? 'bg-amber-50/50' : ''}>
                        <td className="py-1 px-3 font-mono">{i.sku}</td><td className="py-1 px-3">{i.name}</td>
                        <td className="py-1 px-3 text-right font-mono">{i.systemStock}</td><td className="py-1 px-3 text-right font-mono">{i.actualStock}</td>
                        <td className={`py-1 px-3 text-right font-mono ${diffClass(i.difference)}`}>{i.difference > 0 ? '+' : ''}{i.difference}</td>
                        <td className={`py-1 px-3 text-right font-mono ${diffClass(i.difference)}`}>{formatCurrency(i.diffValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {o.notes && <div className="px-3 py-2 text-slate-500 border-t border-slate-100">Ghi chú: {o.notes}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
