import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Server, 
  ArrowLeftRight, 
  Radio, 
  Wrench, 
  FileSpreadsheet, 
  Users, 
  ShieldAlert,
  ChevronLeft,
  Network,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, custodyCards, devices, tickets } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم والمؤشرات',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'custody_card',
      label: 'بطاقة العهدة الشخصية',
      icon: FileText,
      badge: custodyCards.length,
      badgeColor: 'bg-sky-100 text-sky-700',
    },
    {
      id: 'devices',
      label: 'سجل الحواسيب والتجهيزات',
      icon: Server,
      badge: devices.length,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'movements',
      label: 'الاستلام والتسليم والإعادة',
      icon: ArrowLeftRight,
      badge: null,
    },
    {
      id: 'telecom',
      label: 'البنية التحتية والمقسّم',
      icon: Radio,
      badge: null,
    },
    {
      id: 'network_map',
      label: 'خارطة الشبكة والربط',
      icon: Network,
      badge: null,
    },
    {
      id: 'maintenance',
      label: 'الصيانة وبلاغات الأعطال',
      icon: Wrench,
      badge: tickets.filter(t => t.status !== 'closed' && t.status !== 'repaired').length || null,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'reports',
      label: 'البحث والتقارير والجرد',
      icon: FileSpreadsheet,
      badge: '10',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'approvals',
      label: 'طلبات الاعتماد والانضمام',
      icon: ShieldCheck,
      badge: useApp().pendingRequests.filter(r => r.status === 'pending').length || null,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
    },
    {
      id: 'users',
      label: 'المستخدمون والصلاحيات',
      icon: Users,
      badge: null,
    },
    {
      id: 'audit',
      label: 'سجل التدقيق والحماية',
      icon: ShieldAlert,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      <aside
        className={`no-print fixed md:static top-[57px] right-0 bottom-0 z-30 w-72 bg-white border-l border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            الأقسام والخدمات الرئيسية
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== null && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronLeft className="w-4 h-4 text-white/90" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Official Footer Banner inside Sidebar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-600 space-y-1">
            <span className="block font-bold text-slate-800">وزارة الطوارئ وإدارة الكوارث</span>
            <span className="block text-[11px] text-slate-500">دائرة الاتصالات - إدارة العهد</span>
            <div className="pt-1 border-t border-slate-200 text-[11px] text-blue-700 font-bold">
              تطوير وبرمجة: إبراهيم زينب
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
              <span>الإصدار المعتمد</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">V 2.6</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
