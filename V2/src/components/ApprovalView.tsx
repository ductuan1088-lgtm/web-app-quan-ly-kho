import React, { useState } from 'react';
import { CheckCircle2, ListChecks, Plus, Send, Trash2, XCircle } from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { IssueApprovalRequest } from '../types';
import { HOSPITAL_DEPARTMENTS } from './CustomersModal';

const STATUS: Record<IssueApprovalRequest['status'], { label: string; cls: string }> = {
  CHO_DUYET: { label: 'Chờ duyệt', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  DA_DUYET: { label: 'Đã duyệt - chờ xuất kho', cls: 'bg-blue-100 text-blue-800 border-blue-300' },
  TU_CHOI: { label: 'Từ chối', cls: 'bg-rose-100 text-rose-800 border-rose-300' },
  DA_XUAT_KHO: { label: 'Đã xuất kho', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
};

type Line = { productId: string; quantity: number; notes: string };

export const ApprovalView: React.FC = () => {
  const {
    approvalRequests, products, devices, createApprovalRequest, reviewApprovalRequest, convertApprovalToIssue,
    hasPermission, currentUser, setActiveTab, setSubTabXuattKho,
  } = useWarehouse();
  const [filter, setFilter] = useState<'ALL' | IssueApprovalRequest['status']>('ALL');
  const [creating, setCreating] = useState(false);
  const [department, setDepartment] = useState(HOSPITAL_DEPARTMENTS[0]);
  const [requestedBy, setRequestedBy] = useState(currentUser.name);
  const [phone, setPhone] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [urgency, setUrgency] = useState<IssueApprovalRequest['urgency']>('Thường');
  const [lines, setLines] = useState<Line[]>([{ productId: products[0]?.id || '', quantity: 1, notes: '' }]);
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});

  const canReview = hasPermission('canApproveNegativeStock');
  const list = approvalRequests.filter((r) => filter === 'ALL' || r.status === filter);
  const deptDevices = devices.filter((d) => d.department === department && d.status !== 'Đã thanh lý');

  const submit = () => {
    if (!requestedBy.trim()) return alert('Vui lòng nhập tên cán bộ yêu cầu.');
    if (lines.some((l) => !l.productId || !(l.quantity > 0))) return alert('Mỗi dòng cần chọn mặt hàng và số lượng > 0.');
    const dev = devices.find((d) => d.id === deviceId);
    createApprovalRequest({
      requestDate: new Date().toISOString().slice(0, 10),
      department,
      requestedBy: requestedBy.trim(),
      phone: phone.trim(),
      deviceId: dev?.id,
      deviceName: dev?.name,
      deviceSerial: dev?.serialNumber,
      urgency,
      items: lines.map((l) => {
        const p = products.find((x) => x.id === l.productId)!;
        return { productId: p.id, sku: p.sku, name: p.name, unit: p.unit, quantity: l.quantity, notes: l.notes };
      }),
    });
    setCreating(false);
    setLines([{ productId: products[0]?.id || '', quantity: 1, notes: '' }]);
  };

  const field = 'w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs';

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden text-xs">
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 flex flex-wrap items-center gap-2">
        <ListChecks className="w-4 h-4 text-blue-700" />
        <span className="font-bold uppercase tracking-wide text-slate-800">Duyệt Cấp Phát (Khoa yêu cầu → Duyệt → Xuất kho)</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="border border-slate-300 rounded px-2 py-1.5 bg-white">
          <option value="ALL">Tất cả trạng thái</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={() => setCreating((v) => !v)} className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium">
          <Plus className="w-3.5 h-3.5" /> {creating ? 'Đóng form' : 'Tạo Yêu Cầu'}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {creating && (
          <div className="bg-white border border-slate-300 rounded p-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <label className="md:col-span-2">Khoa phòng yêu cầu
                <select className={field} value={department} onChange={(e) => { setDepartment(e.target.value); setDeviceId(''); }}>
                  {HOSPITAL_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </label>
              <label>Cán bộ yêu cầu<input className={field} value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} /></label>
              <label>Điện thoại<input className={`${field} font-mono`} value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
              <label className="md:col-span-2">Thiết bị cần thay vật tư
                <select className={field} value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
                  <option value="">— Không chọn —</option>
                  {deptDevices.map((d) => <option key={d.id} value={d.id}>{d.code} · {d.name} · S/N {d.serialNumber}</option>)}
                </select>
              </label>
              <label>Mức độ
                <select className={field} value={urgency} onChange={(e) => setUrgency(e.target.value as typeof urgency)}>
                  <option>Thường</option><option>Cấp bách (Cấp cứu/Phòng mổ)</option>
                </select>
              </label>
            </div>
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <select className={`${field} col-span-6`} value={l.productId} onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, productId: e.target.value } : x))}>
                  {products.map((p) => <option key={p.id} value={p.id}>[{p.sku}] {p.name} (Tồn: {p.stockQuantity})</option>)}
                </select>
                <input type="number" min="1" className={`${field} col-span-1 text-right font-mono`} value={l.quantity} onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, quantity: Number(e.target.value) } : x))} />
                <input className={`${field} col-span-4`} placeholder="Lý do / tình trạng" value={l.notes} onChange={(e) => setLines(lines.map((x, j) => j === i ? { ...x, notes: e.target.value } : x))} />
                <button disabled={lines.length === 1} onClick={() => setLines(lines.filter((_, j) => j !== i))} className="col-span-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"><Trash2 className="w-3.5 h-3.5 mx-auto" /></button>
              </div>
            ))}
            <div className="flex justify-between">
              <button onClick={() => setLines([...lines, { productId: products[0]?.id || '', quantity: 1, notes: '' }])} className="text-blue-700 hover:underline">+ Thêm dòng</button>
              <button onClick={submit} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded font-medium"><Send className="w-3.5 h-3.5" /> Gửi yêu cầu</button>
            </div>
          </div>
        )}

        {list.map((r) => {
          const st = STATUS[r.status];
          return (
            <div key={r.id} className="bg-white border border-slate-300 rounded">
              <div className="px-3 py-2 flex flex-wrap items-center gap-3 border-b border-slate-100">
                <span className="font-mono font-bold text-blue-800">{r.code}</span>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${st.cls}`}>{st.label}</span>
                {r.urgency !== 'Thường' && <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">CẤP BÁCH</span>}
                <span className="text-slate-600">{r.department} · {r.requestedBy}{r.phone ? ` · ${r.phone}` : ''}</span>
                <span className="ml-auto text-slate-400">{r.requestDate}</span>
              </div>
              <div className="px-3 py-2">
                {r.deviceName && <div className="text-slate-500 mb-1">Thiết bị: {r.deviceName} (S/N {r.deviceSerial})</div>}
                <ul className="space-y-0.5">
                  {r.items.map((it, i) => (
                    <li key={i}><span className="font-mono font-bold">{it.sku}</span> × {it.quantity} {it.unit}
                      <span className="text-slate-400"> — {it.name}{it.notes ? ` (${it.notes})` : ''}</span></li>
                  ))}
                </ul>
                {r.reviewedBy && <div className="mt-1 text-slate-500">Duyệt bởi {r.reviewedBy} ({r.reviewedAt}): {r.reviewNotes}</div>}
              </div>
              {r.status === 'CHO_DUYET' && (
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  {canReview ? (
                    <>
                      <input className="flex-1 min-w-[200px] border border-slate-300 rounded px-2 py-1.5 bg-white" placeholder="Ghi chú duyệt / lý do từ chối" value={reviewNote[r.id] || ''} onChange={(e) => setReviewNote({ ...reviewNote, [r.id]: e.target.value })} />
                      <button onClick={() => { const x = reviewApprovalRequest(r.id, true, reviewNote[r.id] || ''); if (!x.success) alert(x.message); }} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded"><CheckCircle2 className="w-3.5 h-3.5" /> Duyệt</button>
                      <button onClick={() => { const x = reviewApprovalRequest(r.id, false, reviewNote[r.id] || ''); if (!x.success) alert(x.message); }} className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded"><XCircle className="w-3.5 h-3.5" /> Từ chối</button>
                    </>
                  ) : (
                    <span className="text-slate-500">Đang chờ Trưởng khoa / Trưởng phòng IT duyệt.</span>
                  )}
                </div>
              )}
              {r.status === 'DA_DUYET' && (
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => { const x = convertApprovalToIssue(r.id); alert(x.message); if (x.success) { setActiveTab('QUAN_LY_XUAT_KHO'); setSubTabXuattKho('DANH_SACH'); } }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium"
                  >Xuất kho theo yêu cầu này</button>
                  <span className="ml-2 text-slate-400">Tự động tạo phiếu xuất & ghi lịch sử thay vật tư cho thiết bị.</span>
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && <div className="text-center text-slate-400 py-10">Chưa có yêu cầu nào.</div>}
      </div>
    </div>
  );
};
