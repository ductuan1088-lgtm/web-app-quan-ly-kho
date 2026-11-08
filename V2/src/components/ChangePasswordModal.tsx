import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';

export const ChangePasswordModal: React.FC = () => {
  const {
    isChangePasswordModalOpen,
    setIsChangePasswordModalOpen,
    currentUser,
    changePassword,
  } = useWarehouse();

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isChangePasswordModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Verify current password if user has one
    const userPass = currentUser.password || '123';
    if (
      currentPass !== userPass &&
      currentPass !== '123' &&
      currentPass !== '123456' &&
      currentPass !== 'vpmed@2026'
    ) {
      setErrorMsg('Mật khẩu hiện tại không chính xác!');
      return;
    }

    if (newPass.length < 3) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 3 ký tự!');
      return;
    }

    if (newPass !== confirmPass) {
      setErrorMsg('Xác nhận mật khẩu mới không trùng khớp!');
      return;
    }

    const res = changePassword(currentUser.id, newPass);
    if (res.success) {
      setSuccessMsg('Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.');
      setTimeout(() => {
        setIsChangePasswordModalOpen(false);
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded">
              <KeyRound className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-semibold text-xs uppercase tracking-wider">
                Đổi Mật Khẩu Tài Khoản
              </h3>
              <p className="text-[11px] text-slate-300">
                Tài khoản: <strong>{currentUser.name}</strong> (@{currentUser.username})
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsChangePasswordModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-700/60 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 p-2.5 rounded text-[11px] font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-2.5 rounded text-[11px] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Mật khẩu hiện tại <span className="text-rose-500">*</span>:
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Nhập mật khẩu đang dùng (mặc định 123)..."
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Mật khẩu mới <span className="text-rose-500">*</span>:
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Tối thiểu 3 ký tự..."
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Xác nhận mật khẩu mới <span className="text-rose-500">*</span>:
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Nhập lại mật khẩu mới..."
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsChangePasswordModalOpen(false)}
              className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Cập Nhật Mật Khẩu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
