import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';

export const LoginView: React.FC = () => {
  const { login, users, companyInfo } = useWarehouse();

  const [username, setUsername] = useState('ituan');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập hoặc email!');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu (mặc định: 123)!');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }, 200);
  };

  const handleQuickLogin = (uname: string, pass: string) => {
    setUsername(uname);
    setPassword(pass);
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      const res = login(uname, pass);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-gradient-to-br from-[#1e293b] via-[#1e3a5f] to-[#0f172a] text-slate-100 select-none overflow-y-auto">
      {/* Top Brand Bar */}
      <div className="w-full bg-slate-900/60 backdrop-blur-md border-b border-slate-700/60 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md border border-cyan-400/30">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm tracking-wide text-white uppercase flex items-center gap-2">
              <span>{companyInfo.name}</span>
              <span className="hidden md:inline text-[10px] bg-blue-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-medium">
                Kho IT & Vật Tư Tin Học
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              {companyInfo.address}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-blue-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Hệ thống Bảo mật Phân quyền RBAC</span>
        </div>
      </div>

      {/* Main Login Center Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-300 text-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Card Header */}
          <div className="bg-[#2c4779] text-white p-5 border-b border-[#1f345b] text-center relative">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 shadow-md">
              <Lock className="w-6 h-6 text-slate-950" />
            </div>
            <h2 className="text-base font-bold uppercase tracking-wider text-white">
              Đăng Nhập Hệ Thống
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Phần Mềm Quản Lý Kho IT · Cấp Phát Cho 21 Khoa Phòng
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-lg flex items-start gap-2.5 animate-in shake duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <span className="font-semibold block mb-0.5">Đăng nhập không thành công</span>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                <span>Tên Đăng Nhập Hoặc Email Công Vụ:</span>
                <span className="text-[11px] text-slate-500 font-normal">(@vpmed.vn)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="VD: ituan, thukho, ketoan..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                <span>Mật Khẩu Đăng Nhập:</span>
                <span className="text-[11px] text-blue-600 font-medium">Mặc định: 123</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-10 py-2 text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs tracking-wide"
              >
                {isLoading ? (
                  <span>Đang xác thực bảo mật...</span>
                ) : (
                  <>
                    <span>ĐĂNG NHẬP VÀO HỆ THỐNG</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Quick 1-Click Login Card for Admin User Only */}
            <div className="pt-3 border-t border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Tài khoản Quản trị hệ thống:</span>
                <span className="text-[10px] text-emerald-600 font-medium">Sẵn sàng đăng nhập</span>
              </div>

              <button
                type="button"
                onClick={() => handleQuickLogin('ituan', '123')}
                className="w-full p-2.5 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-left cursor-pointer transition flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    IT
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <span>Nguyễn Tuấn</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.2 rounded border border-blue-200">
                        Quản trị viên IT
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Tên đăng nhập: <strong className="text-slate-800 font-mono">ituan</strong> · Mật khẩu: <span className="font-mono text-blue-700 font-semibold">123</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-blue-600 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
                  <span>Vào ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 rounded p-2 border border-slate-200 leading-relaxed">
                ℹ️ <strong>Phân quyền người dùng:</strong> Các tài khoản khác (Thủ kho, Kế toán, Khoa phòng...) được cấu hình và phân quyền trực tiếp trong mục <strong>"Quản lý người dùng & phân quyền"</strong> của Quản trị viên (Hệ thống → Người dùng).
              </div>
            </div>
          </form>

          {/* Footer note */}
          <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-between">
            <span>Hỗ trợ kỹ thuật: 0982.558.699</span>
            <span className="font-mono">VPMED Security v2.5</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <footer className="w-full bg-slate-900/80 border-t border-slate-800 text-[11px] py-2 px-4 text-center text-slate-400">
        CÔNG TY BỆNH VIỆN CỔ PHẦN VPMED · Hệ Thống Quản Lý Kho Vật Tư Tin Học & Thiết Bị IT Bệnh Viện
      </footer>
    </div>
  );
};
