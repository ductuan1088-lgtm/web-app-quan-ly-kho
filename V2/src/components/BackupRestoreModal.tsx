import React, { useRef, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Download,
  FolderSync,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';

export const BackupRestoreModal: React.FC = () => {
  const {
    isBackupModalOpen,
    setIsBackupModalOpen,
    exportBackupJson,
    importBackupJson,
    resetToDefaultData,
    products,
    issueOrders,
  } = useWarehouse();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  if (!isBackupModalOpen) return null;

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const dateStr = new Date().toISOString().split('T')[0];
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sao-luu-kho-vietphat-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setRestoreStatus('Đã xuất tệp sao lưu thành công!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackupJson(content);
        if (ok) {
          setRestoreStatus('Phục hồi dữ liệu kho thành công!');
          setTimeout(() => {
            setIsBackupModalOpen(false);
          }, 1200);
        } else {
          setRestoreStatus('Lỗi: Tệp dữ liệu không hợp lệ!');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        'XÁC NHẬN KHÔI PHỤC DỮ LIỆU GỐC:\nThao tác này sẽ tải lại toàn bộ danh mục sản phẩm mẫu chuẩn mực in, hộp mực đổ, linh kiện máy tính ban đầu.'
      )
    ) {
      resetToDefaultData();
      setRestoreStatus('Đã nạp lại dữ liệu danh mục mẫu chuẩn!');
      setTimeout(() => {
        setIsBackupModalOpen(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-xs">
              Hệ Thống · Sao Lưu & Phục Hồi Dữ Liệu Kho
            </span>
          </div>
          <button onClick={() => setIsBackupModalOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {restoreStatus && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-2.5 rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{restoreStatus}</span>
            </div>
          )}

          {/* Section 1: Backup */}
          <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Download className="w-4 h-4 text-sky-600" />
              <span>Sao Lưu Dữ Liệu (Backup JSON)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Tải toàn bộ cơ sở dữ liệu hiện tại ({products.length} sản phẩm, {issueOrders.length} chứng
              từ xuất kho, danh sách khách hàng, công nợ) về máy tính dưới dạng tệp tin an toàn.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded font-medium shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Tệp Sao Lưu (.JSON)</span>
            </button>
          </div>

          {/* Section 2: Restore */}
          <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <FolderSync className="w-4 h-4 text-emerald-600" />
              <span>Phục Hồi Dữ Liệu (Restore)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Chọn tệp tin sao lưu trước đó để nạp lại dữ liệu vào phần mềm quản lý kho.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium shadow-xs transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Chọn Tệp Sao Lưu Để Phục Hồi</span>
            </button>
          </div>

          {/* Section 3: Reset to sample */}
          <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <span>Khôi Phục Danh Mục Mẫu Chuẩn</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Nạp lại danh mục sản phẩm mẫu đầy đủ (Mực in Canon 2900, HP 12A, Brother; Lọ mực đổ 140g,
              1kg; Trống phấn drum, gạt mực, bao lụa sấy, RAM, SSD...).
            </p>
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium shadow-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Khôi Phục Dữ Liệu Mẫu</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-100 px-4 py-2 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsBackupModalOpen(false)}
            className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-white text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
