import React, { useMemo, useState } from 'react';
import { Cpu, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { HospitalDevice } from '../types';
import { HOSPITAL_DEPARTMENTS } from './CustomersModal';

const CATEGORIES: HospitalDevice['category'][] = [
  'Máy in văn phòng',
  'Máy tính để bàn',
  'Máy in nhiệt / Siêu âm',
  'Máy scan / Photo',
];
const STATUSES: HospitalDevice['status'][] = ['Đang hoạt động', 'Cần thay mực', 'Bảo dưỡng / Sửa chữa', 'Đã thanh lý'];

const statusTone: Record<HospitalDevice['status'], string> = {
  'Đang hoạt động': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Cần thay mực': 'bg-amber-100 text-amber-800 border-amber-300',
  'Bảo dưỡng / Sửa chữa': 'bg-orange-100 text-orange-800 border-orange-300',
  'Đã thanh lý': 'bg-slate-200 text-slate-600 border-slate-300',
};

const emptyDevice = (): Omit<HospitalDevice, 'id'> => ({
  code: '',
  name: '',
  category: 'Máy in văn phòng',
  serialNumber: '',
  macAddress: '',
  ipAddress: '',
  department: HOSPITAL_DEPARTMENTS[0],
  roomLocation: '',
  assignedUser: '',
  installedDate: new Date().toISOString().slice(0, 10),
  status: 'Đang hoạt động',
  compatibleSupplies: [],
  replacementHistory: [],
});

export const DevicesView: React.FC = () => {
  const { devices, products, addDevice, updateDevice, deleteDevice, hasPermission } = useWarehouse();
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('ALL');
  const [editing, setEditing] = useState<(Omit<HospitalDevice, 'id'> & { id?: string }) | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const canManage = hasPermission('canManageProducts');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return devices.filter(
      (d) =>
        (dept === 'ALL' || d.department === dept) &&
        (!q ||
          [d.code, d.name, d.serialNumber, d.macAddress, d.ipAddress, d.assignedUser, d.roomLocation]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q)))
    );
  }, [devices, search, dept]);

  const save = () => {
    if (!editing) return;
    if (!editing.code.trim() || !editing.name.trim() || !editing.serialNumber.trim()) {
      alert('Vui lòng nhập Mã thiết bị, Tên thiết bị và Số Serial.');
      return;
    }
    const dup = devices.find(
      (d) => d.serialNumber.trim().toLowerCase() === editing.serialNumber.trim().toLowerCase() && d.id !== editing.id
    );
    if (dup) {
      alert(`Số Serial đã tồn tại ở thiết bị ${dup.code}.`);
      return;
    }
    const { id, ...data } = editing;
    if (id) updateDevice(id, data);
    else addDevice(data);
    setEditing(null);
  };

  const field = 'w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-blue-500';

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden text-xs">
      <div className="bg-slate-200 border-b border-slate-300 px-3 py-2 flex flex-wrap items-center gap-2">
        <Cpu className="w-4 h-4 text-blue-700" />
        <span className="font-bold uppercase tracking-wide text-slate-800">Thiết Bị & Serial ({filtered.length})</span>
        <div className="relative ml-2">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã, tên, serial, MAC, IP..."
            className="pl-7 pr-2 py-1.5 border border-slate-300 rounded w-64 bg-white"
          />
        </div>
        <select value={dept} onChange={(e) => setDept(e.target.value)} className="border border-slate-300 rounded px-2 py-1.5 bg-white max-w-[260px]">
          <option value="ALL">Tất cả khoa phòng</option>
          {HOSPITAL_DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button
          onClick={() => {
            if (!canManage) return alert('Bạn không có quyền thêm/sửa thiết bị.');
            setEditing(emptyDevice());
          }}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm Thiết Bị
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="bg-white border border-slate-300 rounded overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold text-[11px]">
              <tr>
                <th className="py-2 px-3">Mã / Tên thiết bị</th>
                <th className="py-2 px-3">Serial / MAC / IP</th>
                <th className="py-2 px-3">Khoa phòng · Vị trí</th>
                <th className="py-2 px-3">Vật tư tương thích</th>
                <th className="py-2 px-3">Trạng thái</th>
                <th className="py-2 px-3 w-24 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((d) => (
                <React.Fragment key={d.id}>
                  <tr className="hover:bg-slate-50 align-top">
                    <td className="py-2 px-3">
                      <button onClick={() => setExpanded(expanded === d.id ? null : d.id)} className="text-left cursor-pointer">
                        <div className="font-mono font-bold text-blue-800">{d.code}</div>
                        <div className="text-slate-800">{d.name}</div>
                        <div className="text-[10px] text-slate-400">{d.category}</div>
                      </button>
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px]">
                      <div className="font-bold">{d.serialNumber}</div>
                      <div className="text-slate-500">{d.macAddress || '—'}</div>
                      <div className="text-slate-500">{d.ipAddress || '—'}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium">{d.department}</div>
                      <div className="text-slate-500">{d.roomLocation}</div>
                      {d.assignedUser && <div className="text-slate-400">Phụ trách: {d.assignedUser}</div>}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-wrap gap-1">
                        {d.compatibleSupplies.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 rounded font-mono text-[10px]">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${statusTone[d.status]}`}>{d.status}</span>
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => canManage ? setEditing({ ...d }) : alert('Bạn không có quyền sửa thiết bị.')}
                        className="p-1 text-slate-500 hover:text-blue-700" title="Sửa"
                      ><Pencil className="w-3.5 h-3.5" /></button>
                      <button
                        onClick={() => {
                          if (!canManage) return alert('Bạn không có quyền xóa thiết bị.');
                          if (confirm(`Xóa thiết bị ${d.code}?`)) deleteDevice(d.id);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-600" title="Xóa"
                      ><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                  {expanded === d.id && (
                    <tr className="bg-slate-50">
                      <td colSpan={6} className="px-6 py-2">
                        <div className="font-semibold text-slate-700 mb-1">Lịch sử thay vật tư ({d.replacementHistory?.length || 0})</div>
                        {(d.replacementHistory || []).length === 0 ? (
                          <div className="text-slate-400">Chưa có lần thay vật tư nào.</div>
                        ) : (
                          <ul className="space-y-0.5">
                            {d.replacementHistory!.map((h, i) => (
                              <li key={i} className="font-mono text-[11px]">
                                {h.date} · {h.supplyName} · {h.replacedBy}{h.notes ? ` · ${h.notes}` : ''}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">Không có thiết bị phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-100">
              <span className="font-bold text-sm">{editing.id ? 'Sửa thiết bị' : 'Thêm thiết bị mới'}</span>
              <button onClick={() => setEditing(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <label>Mã thiết bị *<input className={field} value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} /></label>
              <label>Tên thiết bị / Model *<input className={field} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label>
              <label>Số Serial *<input className={`${field} font-mono`} value={editing.serialNumber} onChange={(e) => setEditing({ ...editing, serialNumber: e.target.value })} /></label>
              <label>Loại thiết bị
                <select className={field} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as HospitalDevice['category'] })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>MAC<input className={`${field} font-mono`} value={editing.macAddress || ''} onChange={(e) => setEditing({ ...editing, macAddress: e.target.value })} /></label>
              <label>IP<input className={`${field} font-mono`} value={editing.ipAddress || ''} onChange={(e) => setEditing({ ...editing, ipAddress: e.target.value })} /></label>
              <label className="col-span-2">Khoa phòng
                <select className={field} value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })}>
                  {HOSPITAL_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </label>
              <label>Vị trí đặt máy<input className={field} value={editing.roomLocation} onChange={(e) => setEditing({ ...editing, roomLocation: e.target.value })} /></label>
              <label>Cán bộ phụ trách<input className={field} value={editing.assignedUser || ''} onChange={(e) => setEditing({ ...editing, assignedUser: e.target.value })} /></label>
              <label>Ngày bàn giao<input type="date" className={field} value={editing.installedDate} onChange={(e) => setEditing({ ...editing, installedDate: e.target.value })} /></label>
              <label>Trạng thái
                <select className={field} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as HospitalDevice['status'] })}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <div className="col-span-2">
                <div className="mb-1">Vật tư tương thích (chọn mã hàng)</div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-auto border border-slate-200 rounded p-2">
                  {products.map((p) => {
                    const on = editing.compatibleSupplies.includes(p.sku);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() =>
                          setEditing({
                            ...editing,
                            compatibleSupplies: on
                              ? editing.compatibleSupplies.filter((s) => s !== p.sku)
                              : [...editing.compatibleSupplies, p.sku],
                          })
                        }
                        className={`px-1.5 py-0.5 rounded border font-mono text-[10px] ${on ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'}`}
                      >{p.sku}</button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t flex justify-end gap-2 bg-slate-50">
              <button onClick={() => setEditing(null)} className="px-3 py-1.5 border border-slate-300 rounded bg-white">Hủy</button>
              <button onClick={save} className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium">Lưu thiết bị</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
