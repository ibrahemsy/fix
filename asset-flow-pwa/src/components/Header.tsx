import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  FileSpreadsheet,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRoleType } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenSheetsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  isSidebarOpen,
  onOpenSheetsModal
}) => {
  const { 
    currentUser, 
    currentRole, 
    setCurrentRole, 
    headEmail,
    isHeadOfDept,
    isOffline, 
    isSyncing, 
    loginWithGoogle, 
    logout,
    tickets
  } = useApp();

  const [time, setTime] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roleLabels: Record<UserRoleType, { label: string; color: string }> = {
    director: { label: 'رئيس دائرة الاتصالات', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-black' },
    technician: { label: 'فني اتصالات وشبكات', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  };

  const pendingUrgentTickets = tickets.filter(t => t.priority === 'critical' && t.status !== 'closed' && t.status !== 'repaired').length;

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs px-3 py-2.5 sm:px-6">
      <div className="flex items-center justify-between gap-2">
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar} 
            className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            title="تبديل القائمة"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-2 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Laptop className="w-full h-full" />
            </div>
            <div>
              <div className="text-[11px] sm:text-xs text-blue-700 font-extrabold tracking-wide">
                وزارة الطوارئ وإدارة الكوارث
              </div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                دائرة الاتصالات
              </h1>
              <div className="text-[10px] text-slate-500 font-medium">
                تطوير وبرمجة: إبراهيم زينب
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Connectivity, Sync, Time & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Time & Clock */}
          <div className="hidden lg:flex flex-col text-left font-mono text-xs text-slate-600 px-2 py-1 rounded bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400">التوقيت المحلي</span>
            <span className="text-blue-700 font-bold">{time || '--:--:--'}</span>
          </div>

          {/* Live Sync Status */}
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200" title={isOffline ? 'النظام يعمل دون اتصال' : 'متزامن سحابياً'}>
            {isOffline ? (
              <>
                <WifiOff className="w-4 h-4 text-rose-500" />
                <span className="hidden sm:inline text-rose-700 text-[11px] font-semibold">دون اتصال</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline text-emerald-700 text-[11px] font-semibold">متزامن</span>
              </>
            )}
            {isSyncing && (
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin mr-1" />
            )}
          </div>

          {/* Google Sheets Sync Button */}
          <button
            onClick={onOpenSheetsModal}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition shadow-xs font-semibold"
            title="مزامنة وتصدير إلى جدول بيانات Google"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">جداول Google</span>
          </button>

          {/* Urgent Tickets Alert Badge */}
          {pendingUrgentTickets > 0 && (
            <div className="relative p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold" title={`${pendingUrgentTickets} بلاغ صيانة طارئ`}>
              <Bell className="w-4 h-4 animate-bounce" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingUrgentTickets}
              </span>
            </div>
          )}

          {/* Active Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition ${roleLabels[currentRole].color}`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">{roleLabels[currentRole].label.split(' ')[0]}</span>
            </button>

            {showRoleMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] text-slate-500 font-bold">
                  اختر الصلاحية الإدارية:
                </div>
                {(Object.keys(roleLabels) as UserRoleType[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setCurrentRole(role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      currentRole === role ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <span>{roleLabels[role].label}</span>
                    {currentRole === role && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Google Auth Status / Login */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase overflow-hidden">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="user" className="w-full h-full object-cover" />
                ) : (
                  currentUser.displayName?.[0] || 'م'
                )}
              </div>
              <span className="hidden xl:inline text-xs text-slate-700 truncate max-w-[120px] font-medium">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                onClick={logout}
                className="p-1 hover:text-rose-600 text-slate-500 transition"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs"
              title="تسجيل الدخول بحساب Google"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">دخول Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
