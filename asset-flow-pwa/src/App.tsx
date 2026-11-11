import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CustodyCardView } from './components/CustodyCardView';
import { DeviceManagementView } from './components/DeviceManagementView';
import { MovementsView } from './components/MovementsView';
import { TelecomView } from './components/TelecomView';
import { MaintenanceView } from './components/MaintenanceView';
import { ReportsView } from './components/ReportsView';
import { UserManagementView } from './components/UserManagementView';
import { AuditLogView } from './components/AuditLogView';
import { NetworkMapView } from './components/NetworkMapView';
import { ApprovalRequestsView } from './components/ApprovalRequestsView';
import { SheetsSyncModal } from './components/SheetsSyncModal';
import { 
  LayoutDashboard, 
  FileText, 
  Server, 
  Radio, 
  Network,
  Wrench, 
  FileSpreadsheet 
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, isLoading } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Official Header */}
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-16 md:pb-6">
            {isLoading ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-500">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold">جارٍ تحميل بيانات وزارة الطوارئ وإدارة الكوارث - دائرة الاتصالات...</p>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'custody_card' && <CustodyCardView />}
                {activeTab === 'devices' && <DeviceManagementView />}
                {activeTab === 'movements' && <MovementsView />}
                {activeTab === 'telecom' && <TelecomView />}
                {activeTab === 'network_map' && <NetworkMapView />}
                {activeTab === 'maintenance' && <MaintenanceView />}
                {activeTab === 'reports' && <ReportsView onOpenSheetsModal={() => setIsSheetsModalOpen(true)} />}
                {activeTab === 'approvals' && <ApprovalRequestsView />}
                {activeTab === 'users' && <UserManagementView />}
                {activeTab === 'audit' && <AuditLogView />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Quick-Access Bar */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold transition ${
            activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab('custody_card')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold transition ${
            activeTab === 'custody_card' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>العهدة</span>
        </button>

        <button
          onClick={() => setActiveTab('devices')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold transition ${
            activeTab === 'devices' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Server className="w-5 h-5" />
          <span>الأجهزة</span>
        </button>

        <button
          onClick={() => setActiveTab('network_map')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold transition ${
            activeTab === 'network_map' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Network className="w-5 h-5" />
          <span>خارطة الربط</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold transition ${
            activeTab === 'maintenance' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span>الصيانة</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold transition ${
            activeTab === 'reports' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>التقارير</span>
        </button>
      </nav>

      {/* Google Sheets Sync Modal */}
      <SheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
