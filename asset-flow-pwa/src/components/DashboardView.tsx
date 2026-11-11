import React from 'react';
import { 
  Users, 
  Server, 
  UserCheck, 
  Archive, 
  AlertTriangle, 
  Wrench, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Radio, 
  CheckCircle2, 
  Clock, 
  Plus, 
  FileText,
  TrendingUp,
  Activity,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DashboardView: React.FC = () => {
  const { 
    devices, 
    custodyCards, 
    movements, 
    tickets, 
    setActiveTab 
  } = useApp();

  // Metrics calculations
  const totalEmployees = new Set(custodyCards.map(c => c.employeeName)).size;
  const totalDevices = devices.length;
  const assignedDevices = devices.filter(d => d.status === 'assigned_employee' || d.assignedEmployee).length;
  const inWarehouseDevices = devices.filter(d => d.status === 'in_warehouse').length;
  const defectiveDevices = devices.filter(d => d.condition === 'defective' || d.condition === 'out_of_service').length;
  const maintenanceNeeded = devices.filter(d => d.condition === 'needs_maintenance' || d.status === 'in_maintenance').length;
  
  const dispatchesCount = movements.filter(m => m.type === 'handover' || m.type === 'transfer_employee' || m.type === 'transfer_dept').length;
  const returnsCount = movements.filter(m => m.type === 'return').length;
  
  const telecomEquipCount = devices.filter(d => 
    ['router', 'switch', 'access_point', 'wireless_radio', 'telephony', 'modem', 'cables_fiber', 'telecom_gear'].includes(d.category)
  ).length;

  // Urgent tickets requiring action
  const urgentTickets = tickets.filter(t => t.status !== 'repaired' && t.status !== 'closed');

  // Device categories distribution
  const categoriesMap: Record<string, number> = {};
  devices.forEach(d => {
    categoriesMap[d.category] = (categoriesMap[d.category] || 0) + 1;
  });

  const categoryLabels: Record<string, string> = {
    desktop: 'حواسيب مكتبية',
    laptop: 'حواسيب محمولة',
    monitor: 'شاشات عرض',
    printer: 'طابعات وماسحات',
    ups: 'مزودات طاقة احتياطية',
    router: 'أجهزة توجيه شبكي',
    switch: 'محولات شبكة مركزية',
    wireless_radio: 'اتصالات لاسلكية',
    telephony: 'هواتف شبكية',
    peripherals: 'ملحقات حواسيب',
    spare_parts: 'قطع غيار وأجزاء',
    other: 'تجهيزات أخرى',
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-gradient-to-l from-blue-900 via-indigo-900 to-blue-800 text-white border border-blue-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-100 text-xs font-semibold mb-2">
              <Activity className="w-3.5 h-3.5" />
              وزارة الطوارئ وادارة الكوارث - دائرة الاتصالات
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              لوحة المؤشرات العامة للعهد والحواسيب والتجهيزات
            </h2>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('custody_card')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-lg transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              <span>بطاقة عهدة جديدة</span>
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white border border-blue-700 font-semibold text-xs sm:text-sm transition"
            >
              <Server className="w-4 h-4 text-blue-200" />
              <span>تسجيل حاسب / جهاز</span>
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white border border-blue-700 font-semibold text-xs sm:text-sm transition"
            >
              <Wrench className="w-4 h-4 text-amber-300" />
              <span>بلاغ صيانة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (8 Official Indicators without Stations) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Total Employees */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">الموظفون المسجلون</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalEmployees}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">يحملون بطاقات عهدة</div>
        </div>

        {/* 2. Total Equipment */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">إجمالي الأجهزة</span>
            <Server className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalDevices}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">حاسب وتجهيز مقيد</div>
        </div>

        {/* 3. Assigned to Staff */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">مسلّمة للموظفين</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{assignedDevices}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">{Math.round((assignedDevices / (totalDevices || 1)) * 100)}% من التجهيزات</div>
        </div>

        {/* 4. In Warehouse */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">في المستودع</span>
            <Archive className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">{inWarehouseDevices}</div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">جاهزة للصرف والتوزيع</div>
        </div>

        {/* 5. Defective */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">أجهزة معطلة</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{defectiveDevices}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">تتطلب استبدال أو إخراج من الخدمة</div>
        </div>

        {/* 6. Needs Maintenance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">تحتاج صيانة</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{maintenanceNeeded}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">قيد المتابعة الفنية</div>
        </div>

        {/* 7. Dispatches */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">عمليات التسليم</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">{dispatchesCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">سندات تسليم موثقة</div>
        </div>

        {/* 8. Telecom & Network Equipment */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">تجهيز الشبكات</span>
            <Radio className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700">{telecomEquipCount}</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">موجهات ومحولات</div>
        </div>
      </div>

      {/* Middle Section: Urgent Alerts & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Alerts and Tasks */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-base">تنبيهات ومهام تحتاج متابعة</h3>
              </div>
              <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold">
                {urgentTickets.length} بلاغات
              </span>
            </div>

            <div className="space-y-3">
              {urgentTickets.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">لا توجد بلاغات أعطال حرجة حالياً</p>
                  <p className="text-xs text-slate-500 mt-1">جميع الحواسيب والتجهيزات تعمل بحالة مستقرة</p>
                </div>
              ) : (
                urgentTickets.slice(0, 4).map((ticket) => (
                  <div 
                    key={ticket.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">{ticket.deviceName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        ticket.priority === 'critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {ticket.priority === 'critical' ? 'عاجل جداً' : 'مرتفع'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{ticket.faultDescription}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                      <span>القسم: {ticket.stationOrDept}</span>
                      <span className="text-blue-600 font-semibold">المكلف: {ticket.assignedTech || 'غير محدد'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('maintenance')}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <span>عرض ومتابعة كافة بلاغات الصيانة</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Equipment Distribution Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">توزيع الأجهزة والتجهيزات حسب التصنيف</h3>
            </div>
            <span className="text-xs text-slate-500 font-bold">{totalDevices} إجمالي التجهيزات</span>
          </div>

          <div className="space-y-3 mt-4">
            {Object.entries(categoriesMap).slice(0, 6).map(([catKey, count]) => {
              const label = categoryLabels[catKey] || catKey;
              const percent = Math.round((count / (totalDevices || 1)) * 100);
              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-bold">{label}</span>
                    <span className="text-slate-500 font-mono font-semibold">
                      {count} جهاز ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-l from-blue-600 to-indigo-600 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Status Pill Counters */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-xs text-emerald-700 font-bold">بحالة فنية ممتازة</div>
              <div className="text-xl font-black text-emerald-800 mt-0.5">
                {devices.filter(d => d.condition === 'excellent').length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <div className="text-xs text-blue-700 font-bold">بحالة جيدة جداً</div>
              <div className="text-xl font-black text-blue-800 mt-0.5">
                {devices.filter(d => d.condition === 'good').length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <div className="text-xs text-rose-700 font-bold">أعطال وخارج الخدمة</div>
              <div className="text-xl font-black text-rose-800 mt-0.5">
                {defectiveDevices}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Movements and Recent Custody Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Handover & Movement Operations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">آخر عمليات التسليم والاسترجاع</h3>
            </div>
            <button
              onClick={() => setActiveTab('movements')}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold"
            >
              عرض الكل
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {movements.slice(0, 4).map((mov) => (
              <div key={mov.id} className="py-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className={`mt-0.5 p-1.5 rounded-lg ${
                    mov.type === 'handover' ? 'bg-blue-50 text-blue-600' :
                    mov.type === 'return' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {mov.type === 'return' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{mov.referenceNumber}</div>
                    <div className="text-xs text-slate-700 mt-0.5">{mov.deviceName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      من: <span className="font-semibold text-slate-700">{mov.fromEntity}</span> إلى: <span className="font-semibold text-blue-700">{mov.toEntity}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left text-[11px] text-slate-400 font-mono shrink-0">
                  {mov.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Custody Cards Issued */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">آخر بطاقات العهدة الشخصية المعتمدة</h3>
            </div>
            <button
              onClick={() => setActiveTab('custody_card')}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold"
            >
              عرض السجل
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {custodyCards.slice(0, 4).map((card) => (
              <div key={card.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {card.employeeName?.[0] || 'ع'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{card.employeeName}</div>
                    <div className="text-[11px] text-slate-500">{card.jobTitle} - {card.department}</div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-0.5">{card.cardNumber}</div>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                    {card.items?.length || 0} مواد مسجلة
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">{card.creationDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* APK & Desktop Instructions Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-xs mt-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl">
            <Laptop className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-blue-900">طريقة تحويل البرنامج إلى APK وتطبيقات سطح المكتب</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
          <div className="bg-white p-4 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-2">1. تطبيقات الهواتف (Android/APK):</h4>
            <p className="text-slate-700">
              البرنامج مصمم كـ PWA (تطبيق ويب تقدمي). لتحويله إلى APK:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
              <li>افتح الرابط في متصفح Chrome على هاتفك.</li>
              <li>اضغط على النقاط الثلاث (القائمة) واختر "إضافة إلى الشاشة الرئيسية".</li>
              <li>سيتم تثبيته كتطبيق مستقل تماماً بدون شريط المتصفح.</li>
              <li>لتحويله إلى ملف APK حقيقي للرفع على المتجر، يمكنك استخدام خدمة <span className="font-bold text-blue-600">PWABuilder.com</span>.</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-2">2. تطبيقات سطح المكتب (Windows/Mac):</h4>
            <p className="text-slate-700">
              يمكنك تشغيل البرنامج كبرنامج ديسكتوب عبر:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
              <li>استخدام متصفح Edge أو Chrome والضغط على أيقونة "تثبيت" في شريط العنوان.</li>
              <li>سيظهر البرنامج كأيقونة على سطح المكتب وفي قائمة ابدأ.</li>
              <li>لتحويله إلى ملف EXE احترافي، يوصى باستخدام إطار عمل <span className="font-bold text-blue-600">Electron.js</span> أو <span className="font-bold text-blue-600">Nativefier</span>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
