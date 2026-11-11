import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Filter, 
  Calendar, 
  Search, 
  RefreshCw,
  FileText,
  Server
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { DeviceCategory, DeviceCondition, DeviceStatus } from '../types';

export const ReportsView: React.FC<{ onOpenSheetsModal: () => void }> = ({ onOpenSheetsModal }) => {
  const { devices, custodyCards, movements, tickets, phoneDirectory, telecomNetworks, logAuditAction } = useApp();

  const [activeReportKey, setActiveReportKey] = useState<string>('custom_inventory');

  // Custom Filter State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('');

  const reportsList = [
    { key: 'custom_inventory', title: '1. التقرير المخصص (تصفية متقدمة)', desc: 'تخصيص كامل للنطاق الزمني والتصنيف والحالة الفنية' },
    { key: 'custody_cards', title: '2. بطاقات العهد الشخصية', desc: 'كافة بطاقات العهد الصادرة للموظفين ومحتوياتها' },
    { key: 'assigned_devices', title: '3. الأجهزة المسلّمة للموظفين', desc: 'كشف الأجهزة الموجودة بعهدة الموظفين خارج المستودع' },
    { key: 'warehouse_stock', title: '4. مخزون المستودع المركزي', desc: 'جرد التجهيزات والقطع المتاحة في المستودع' },
    { key: 'defective_devices', title: '5. الأجهزة المعطلة والخارجة عن الخدمة', desc: 'حصر التجهيزات المعطلة والخارجة عن الخدمة' },
    { key: 'maintenance_tickets', title: '6. الصيانة وبلاغات الأعطال', desc: 'سجل أعمال الصيانة وقطع الغيار المستهلكة' },
    { key: 'telecom_infrastructure', title: '7. البنية التحتية والشبكات', desc: 'سجل السويتشات، الموجهات، والمقسّم' },
    { key: 'movements_log', title: '8. حركة وتسليم الأجهزة', desc: 'سجل سندات الصرف والاستلام والنقل بين الأقسام' },
  ];

  // Filtered devices list based on custom filters
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      // Category filter
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
      // Condition filter
      if (conditionFilter !== 'all' && d.condition !== conditionFilter) return false;
      // Status filter
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      // Employee search
      if (employeeFilter.trim()) {
        const emp = (d.assignedEmployee || '').toLowerCase();
        const loc = (d.location || '').toLowerCase();
        const search = employeeFilter.trim().toLowerCase();
        if (!emp.includes(search) && !loc.includes(search)) return false;
      }
      // Date range filter
      if (startDate) {
        if (d.purchaseDate && d.purchaseDate < startDate) return false;
      }
      if (endDate) {
        if (d.purchaseDate && d.purchaseDate > endDate) return false;
      }
      return true;
    });
  }, [devices, categoryFilter, conditionFilter, statusFilter, employeeFilter, startDate, endDate]);

  const handleExportExcel = () => {
    let dataToExport: any[] = [];
    let filename = 'تقرير_دائرة_الاتصالات';

    if (activeReportKey === 'custom_inventory') {
      filename = 'تقرير_مخصص_موجودات_الشبكات';
      dataToExport = filteredDevices.map((d, idx) => ({
        'م': idx + 1,
        'اسم الجهاز / التجهيز': d.name,
        'التصنيف': d.category,
        'الشركة المصنعة': d.manufacturer,
        'الطراز': d.model,
        'الرقم التسلسلي': d.serialNumber,
        'رقم العهدة المالي': d.assetNumber || '-',
        'المعالج CPU': d.cpu || '-',
        'الذاكرة RAM': d.ram || '-',
        'التخزين Storage': d.storage || '-',
        'الحالة الفنية': d.condition,
        'حالة التواجد': d.status,
        'مكان التواجد / المكتب': d.location,
        'الموظف المستلم': d.assignedEmployee || '-',
        'تاريخ التوريد': d.purchaseDate || '-',
      }));
    } else if (activeReportKey === 'custody_cards') {
      filename = 'تقرير_بطاقات_العهد_الشخصية';
      dataToExport = custodyCards.map(c => ({
        'رقم البطاقة': c.cardNumber,
        'اسم الموظف': c.employeeName,
        'الصفة الوظيفية': c.jobTitle,
        'المديرية': c.directorate,
        'الدائرة': c.department,
        'الشعبة': c.division,
        'تاريخ الإنشاء': c.creationDate,
        'عدد المواد': c.items.length,
        'المصادقة الإدارية': c.adminEndorsement,
      }));
    } else if (activeReportKey === 'assigned_devices') {
      filename = 'تقرير_الأجهزة_المسلمة_للموظفين';
      dataToExport = devices.filter(d => d.assignedEmployee).map(d => ({
        'اسم الجهاز': d.name,
        'النوع': d.category,
        'الشركة': d.manufacturer,
        'الطراز': d.model,
        'الرقم التسلسلي': d.serialNumber,
        'الموظف المستلم': d.assignedEmployee,
        'الموقع': d.location,
        'تاريخ التسليم': d.deliveryDate || '-',
        'الحالة': d.condition,
      }));
    } else if (activeReportKey === 'warehouse_stock') {
      filename = 'تقرير_مخزون_المستودع';
      dataToExport = devices.filter(d => d.status === 'in_warehouse').map(d => ({
        'اسم الجهاز': d.name,
        'النوع': d.category,
        'الشركة': d.manufacturer,
        'الرقم التسلسلي': d.serialNumber,
        'الموقع في المستودع': d.location,
        'الحالة الفنية': d.condition,
        'الملاحظات': d.notes || '-',
      }));
    } else if (activeReportKey === 'telecom_infrastructure') {
      filename = 'تقرير_البنية_التحتية_والمقسّم';
      dataToExport = telecomNetworks.map(n => ({
        'اسم الشبكة / الخادم': n.name,
        'النوع': n.type,
        'نطاق IP': n.ipRange || '-',
        'البوابة / التردد': n.gateway || n.frequency || '-',
        'الموقع': n.location,
        'السعة والسرعة': n.bandwidth || '-',
        'الحالة التشغيلية': n.status,
      }));
    } else {
      filename = `تقرير_${activeReportKey}`;
      dataToExport = devices.map(d => ({
        'اسم الجهاز': d.name,
        'الرقم التسلسلي': d.serialNumber,
        'الموقع': d.location,
        'الحالة': d.condition,
      }));
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'التقرير الرسمي');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);

    logAuditAction('تصدير تقرير إلى Excel', 'التقارير', activeReportKey, filename);
  };

  const handleExportCSV = () => {
    const dataToExport = filteredDevices.map(d => ({
      'اسم الجهاز': d.name,
      'النوع': d.category,
      'الشركة': d.manufacturer,
      'الرقم التسلسلي': d.serialNumber,
      'الحالة': d.condition,
      'الموقع': d.location,
      'المستلم': d.assignedEmployee || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    
    // Add UTF-8 BOM for Arabic support in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `تقرير_دائرة_الاتصالات_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
    logAuditAction('طباعة تقرير رسمي', 'التقارير', activeReportKey, `طباعة تقرير: ${activeReportKey}`);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-600" />
            <span>نظام التقارير المخصصة والجرد السنوي والتصدير</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            توليد التقارير المخصصة، التصفية حسب التاريخ والحالة، والتصدير بصيغ Excel و CSV والطباعة الرسمية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenSheetsModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ربط Google Sheets</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>تصدير CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير A4</span>
          </button>
        </div>
      </div>

      {/* Reports Selection Grid */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {reportsList.map((rep) => {
          const isActive = activeReportKey === rep.key;
          return (
            <button
              key={rep.key}
              onClick={() => setActiveReportKey(rep.key)}
              className={`p-3 rounded-xl text-right transition border text-xs font-semibold ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold truncate">{rep.title}</div>
              <div className={`text-[10px] mt-1 line-clamp-1 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>{rep.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Advanced Custom Filters Bar */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>خيارات التصفية والتخصيص المتقدمة للتقرير</span>
          </div>
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setCategoryFilter('all');
              setConditionFilter('all');
              setStatusFilter('all');
              setEmployeeFilter('');
            }}
            className="text-[11px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>إعادة ضبط الفلاتر</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">من تاريخ التوريد</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">إلى تاريخ التوريد</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">نوع الجهاز</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
            >
              <option value="all">كافة الأنواع</option>
              <option value="desktop">حواسيب مكتبية</option>
              <option value="laptop">حواسيب محمولة</option>
              <option value="monitor">شاشات</option>
              <option value="printer">طابعات</option>
              <option value="switch">سويتشات ومحولات</option>
              <option value="router">راوترات وموجهات</option>
              <option value="ups">مزودات طاقة UPS</option>
              <option value="telephony">هواتف داخلي ومقسم</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">الحالة الفنية</label>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
            >
              <option value="all">كافة الحالات الفنية</option>
              <option value="excellent">ممتاز</option>
              <option value="good">جيد جداً</option>
              <option value="needs_maintenance">يحتاج صيانة</option>
              <option value="defective">معطل</option>
              <option value="out_of_service">خارج الخدمة</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">حالة التواجد</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
            >
              <option value="all">كافة النطاقات</option>
              <option value="in_warehouse">في المستودع</option>
              <option value="assigned_employee">مسلم لموظف (عهدة)</option>
              <option value="assigned_department">مسلم لقسم / شعبة</option>
              <option value="in_maintenance">قيد الصيانة</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">الموظف / المكتب</label>
            <input
              type="text"
              placeholder="بحث بالاسم أو المكتب..."
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
            />
          </div>
        </div>
      </div>

      {/* Official Syrian Paper Layout Container */}
      <div className="bg-white print:border-none text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-300 space-y-6">
        {/* Official Header */}
        <div className="border-b-2 border-black pb-4">
          <div className="flex justify-between items-start text-xs font-bold">
            <div className="space-y-0.5">
              <div>الجمهورية العربية السورية</div>
              <div>وزارة الطوارئ وإدارة الكوارث</div>
              <div className="text-blue-900 font-extrabold">دائرة الاتصالات</div>
            </div>
            
            <div className="text-center">
              <h2 className="text-base sm:text-xl font-black underline underline-offset-8 text-slate-900">
                {reportsList.find(r => r.key === activeReportKey)?.title || 'تقرير رسمي'}
              </h2>
              <div className="text-[11px] text-slate-700 font-normal mt-2">
                تاريخ استخراج التقرير: <span className="font-mono font-bold">{new Date().toLocaleDateString('ar-SY')}</span>
              </div>
            </div>

            <div className="text-left font-mono text-[11px] space-y-0.5">
              <div>الرقم المرجعي: REP-{Date.now().toString().slice(-6)}</div>
              <div>مكان الإصدار: دمشق - المقر الرئيسي</div>
              <div>الصفحات: 1 من 1</div>
            </div>
          </div>
        </div>

        {/* CUSTOM INVENTORY REPORT TABLE */}
        {activeReportKey === 'custom_inventory' && (
          <table className="official-table w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold text-center border-b-2 border-slate-400">
                <th className="w-8 py-2">م</th>
                <th className="py-2">اسم الجهاز والتجهيز</th>
                <th className="py-2">الشركة والطراز</th>
                <th className="py-2">الرقم التسلسلي</th>
                <th className="py-2">المواصفات (CPU/RAM/Disk)</th>
                <th className="py-2">الموقع / الموظف</th>
                <th className="py-2">الحالة الفنية</th>
                <th className="py-2">تاريخ التوريد</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-bold">لا توجد سجلات مطابقة لفلاتر التقرير المحددة</td>
                </tr>
              ) : (
                filteredDevices.map((d, idx) => (
                  <tr key={d.id} className="text-center border-b border-slate-200">
                    <td className="py-2">{idx + 1}</td>
                    <td className="text-right px-2 font-bold text-slate-900">{d.name}</td>
                    <td className="text-right px-2">{d.manufacturer} {d.model}</td>
                    <td className="font-mono font-bold text-blue-900">{d.serialNumber}</td>
                    <td className="text-right px-2 text-[10px]">
                      {[d.cpu, d.ram, d.storage].filter(Boolean).join(' • ') || '-'}
                    </td>
                    <td className="text-right px-2 font-semibold">
                      {d.assignedEmployee ? `بعهدة: ${d.assignedEmployee}` : d.location}
                    </td>
                    <td className="font-bold">{d.condition}</td>
                    <td className="font-mono text-[11px]">{d.purchaseDate || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* CUSTODY CARDS REPORT */}
        {activeReportKey === 'custody_cards' && (
          <table className="official-table w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold text-center border-b-2 border-slate-400">
                <th className="w-8 py-2">م</th>
                <th className="py-2">رقم البطاقة</th>
                <th className="py-2">اسم الموظف المسؤول</th>
                <th className="py-2">الصفة الوظيفية</th>
                <th className="py-2">المديرية / الدائرة</th>
                <th className="py-2">تاريخ الإنشاء</th>
                <th className="py-2">عدد المواد</th>
                <th className="py-2">المصادقة الإدارية</th>
              </tr>
            </thead>
            <tbody>
              {custodyCards.map((c, idx) => (
                <tr key={c.id} className="text-center border-b border-slate-200">
                  <td className="py-2">{idx + 1}</td>
                  <td className="font-bold text-blue-900 font-mono">{c.cardNumber}</td>
                  <td className="text-right px-2 font-bold">{c.employeeName}</td>
                  <td className="text-right px-2">{c.jobTitle}</td>
                  <td className="text-right px-2">{c.department} - {c.division}</td>
                  <td className="font-mono">{c.creationDate}</td>
                  <td className="font-bold">{c.items.length}</td>
                  <td className="text-right px-2 text-[10px]">{c.adminEndorsement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ASSIGNED DEVICES REPORT */}
        {activeReportKey === 'assigned_devices' && (
          <table className="official-table w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold text-center border-b-2 border-slate-400">
                <th className="w-8 py-2">م</th>
                <th className="py-2">اسم الجهاز</th>
                <th className="py-2">النوع والطراز</th>
                <th className="py-2">الرقم التسلسلي</th>
                <th className="py-2">الموظف المستلم (العهدة)</th>
                <th className="py-2">مكان التواجد</th>
                <th className="py-2">تاريخ التسليم</th>
                <th className="py-2">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {devices.filter(d => d.assignedEmployee).map((d, idx) => (
                <tr key={d.id} className="text-center border-b border-slate-200">
                  <td className="py-2">{idx + 1}</td>
                  <td className="text-right px-2 font-bold">{d.name}</td>
                  <td>{d.manufacturer} {d.model}</td>
                  <td className="font-mono font-bold text-blue-900">{d.serialNumber}</td>
                  <td className="text-right px-2 font-bold text-blue-950">{d.assignedEmployee}</td>
                  <td className="text-right px-2">{d.location}</td>
                  <td className="font-mono">{d.deliveryDate || '-'}</td>
                  <td>{d.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* TELECOM INFRASTRUCTURE REPORT */}
        {activeReportKey === 'telecom_infrastructure' && (
          <table className="official-table w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold text-center border-b-2 border-slate-400">
                <th className="w-8 py-2">م</th>
                <th className="py-2">اسم التجهيز / الشبكة</th>
                <th className="py-2">النوع والتصنيف</th>
                <th className="py-2">العنوان / IP</th>
                <th className="py-2">البوابة / التردد</th>
                <th className="py-2">الموقع الفعلي</th>
                <th className="py-2">السعة / المنافذ</th>
                <th className="py-2">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {telecomNetworks.map((n, idx) => (
                <tr key={n.id} className="text-center border-b border-slate-200">
                  <td className="py-2">{idx + 1}</td>
                  <td className="text-right px-2 font-bold">{n.name}</td>
                  <td>{n.type}</td>
                  <td className="font-mono font-bold">{n.ipRange || '-'}</td>
                  <td className="font-mono">{n.gateway || n.frequency || '-'}</td>
                  <td className="text-right px-2">{n.location}</td>
                  <td className="font-bold">{n.bandwidth || '-'}</td>
                  <td>{n.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* OTHER DEFAULT REPORTS */}
        {!['custom_inventory', 'custody_cards', 'assigned_devices', 'telecom_infrastructure'].includes(activeReportKey) && (
          <table className="official-table w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold text-center border-b-2 border-slate-400">
                <th className="w-8 py-2">م</th>
                <th className="py-2">البيان / الجهاز</th>
                <th className="py-2">الرقم المرجعي / التسلسلي</th>
                <th className="py-2">الموقع / الجهة</th>
                <th className="py-2">التاريخ</th>
                <th className="py-2">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m, idx) => (
                <tr key={m.id} className="text-center border-b border-slate-200">
                  <td className="py-2">{idx + 1}</td>
                  <td className="text-right px-2 font-bold">{m.deviceName}</td>
                  <td className="font-mono font-bold">{m.serialNumber}</td>
                  <td className="text-right px-2">من: {m.fromEntity} إلى: {m.toEntity}</td>
                  <td className="font-mono">{m.date}</td>
                  <td>{m.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Official Signatures Block matching Syrian Government standards */}
        <div className="grid grid-cols-3 gap-8 mt-12 pt-6 border-t-2 border-black text-center text-xs font-bold">
          <div>
            <div>منظم التقرير (فني الدعم)</div>
            <div className="mt-10 font-normal">التوقيع: ............................</div>
          </div>
          <div>
            <div>أمين المستودع المركزي</div>
            <div className="mt-10 font-normal">التوقيع: ............................</div>
          </div>
          <div>
            <div className="text-blue-900 font-black">رئيس دائرة الاتصالات</div>
            <div className="text-[10px] text-slate-600">({useApp().headEmail})</div>
            <div className="mt-8 font-normal">التوقيع والخاتم: ............................</div>
          </div>
        </div>
      </div>
    </div>
  );
};
