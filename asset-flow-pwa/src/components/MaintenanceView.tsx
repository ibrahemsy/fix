import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MaintenanceTicket, TicketPriority, TicketStatus } from '../types';

export const MaintenanceView: React.FC = () => {
  const { tickets, saveTicket, deleteTicket, devices, currentRole, isHeadOfDept } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicket | null>(null);

  const priorities: { key: TicketPriority; label: string; color: string }[] = [
    { key: 'critical', label: 'عاجل جداً (طارئ)', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { key: 'high', label: 'مرتفع', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { key: 'normal', label: 'عادي', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { key: 'low', label: 'منخفض', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  ];

  const ticketStatuses: { key: TicketStatus; label: string; color: string }[] = [
    { key: 'new', label: 'جديد', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    { key: 'in_progress', label: 'قيد المعالجة', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { key: 'waiting_spare_parts', label: 'بانتظار قطع الغيار', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { key: 'repaired', label: 'تم الإصلاح', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { key: 'closed', label: 'مغلق ومؤرشف', color: 'bg-slate-100 text-slate-600 border-slate-300' },
  ];

  const emptyTicket: MaintenanceTicket = {
    id: `tkt_${Date.now()}`,
    ticketNumber: `بلاغ صيانة رقم ${Math.floor(100 + Math.random() * 900)} / ${new Date().getFullYear()}`,
    deviceId: '',
    deviceName: '',
    serialNumber: '',
    faultDescription: '',
    stationOrDept: '',
    reportDate: new Date().toISOString().split('T')[0],
    priority: 'normal',
    assignedTech: 'فني أول سامر العلي',
    actionsTaken: '',
    sparePartsUsed: '',
    resolutionDate: '',
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  const [formData, setFormData] = useState<MaintenanceTicket>(emptyTicket);

  const handleSelectDevice = (deviceId: string) => {
    const dev = devices.find(d => d.id === deviceId);
    if (!dev) return;
    setFormData(prev => ({
      ...prev,
      deviceId: dev.id,
      deviceName: dev.name,
      serialNumber: dev.serialNumber,
      stationOrDept: dev.assignedStationOrDept || dev.location || '',
    }));
  };

  const handleOpenNew = () => {
    setFormData({
      ...emptyTicket,
      id: `tkt_${Date.now()}`,
      ticketNumber: `بلاغ صيانة رقم ${Math.floor(100 + Math.random() * 900)} / ${new Date().getFullYear()}`,
    });
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tkt: MaintenanceTicket) => {
    setFormData(tkt);
    setEditingTicket(tkt);
    setIsModalOpen(true);
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.faultDescription.trim() || !formData.deviceName.trim()) {
      alert('يرجى تحديد الجهاز ووصف العطل.');
      return;
    }
    await saveTicket(formData);
    setIsModalOpen(false);
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.faultDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.stationOrDept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignedTech.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            <span>إدارة الصيانة وبلاغات الأعطال الفنية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة بلاغات الأعطال للحواسيب والطابعات والشبكات، تكليف الفنيين، وتوثيق الإجراءات ({tickets.length} بلاغ مسجل)
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل بلاغ عطل جديد</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث برقم البلاغ، الجهاز، القسم، الفني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">كافة حالات البلاغات</option>
            {ticketStatuses.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">كافة درجات الأولوية</option>
            {priorities.map(p => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTickets.map((ticket) => {
          const priorityObj = priorities.find(p => p.key === ticket.priority);
          const statusObj = ticketStatuses.find(s => s.key === ticket.status);

          return (
            <div 
              key={ticket.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                    {ticket.ticketNumber}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{ticket.deviceName}</h3>
                  {ticket.serialNumber && (
                    <span className="text-[10px] font-mono text-slate-500">الرقم التسلسلي: {ticket.serialNumber}</span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${priorityObj?.color}`}>
                    {priorityObj?.label}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusObj?.color}`}>
                    {statusObj?.label}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-amber-700 block mb-1">وصف العطل:</span>
                <p>{ticket.faultDescription}</p>
              </div>

              {ticket.actionsTaken && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-emerald-700 block mb-0.5">الإجراءات المتخذة:</span>
                  <p>{ticket.actionsTaken}</p>
                  {ticket.sparePartsUsed && (
                    <div className="text-[11px] text-slate-500 mt-1 pt-1 border-t border-slate-200">
                      قطع الغيار المستخدمة: <span className="text-slate-800 font-semibold">{ticket.sparePartsUsed}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div>القسم: <span className="text-slate-800 font-bold">{ticket.stationOrDept}</span></div>
                <div>الفني المكلف: <span className="text-blue-700 font-bold">{ticket.assignedTech}</span></div>
                <div>تاريخ البلاغ: <span className="font-mono text-slate-700">{ticket.reportDate}</span></div>
                <div>
                  {ticket.resolutionDate ? (
                    <span>تاريخ الإصلاح: <span className="font-mono text-emerald-700 font-bold">{ticket.resolutionDate}</span></span>
                  ) : (
                    <span className="text-amber-700 font-semibold">قيد المتابعة</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleOpenEdit(ticket)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تحديث الإجراءات والحالة</span>
                </button>

                {(isHeadOfDept || currentRole === 'director') && (
                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف هذا البلاغ؟`)) {
                        deleteTicket(ticket.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                    title="حذف البلاغ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                <span>{editingTicket ? 'تعديل وتحديث بلاغ الصيانة' : 'تسجيل بلاغ عطل فني جديد'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم البلاغ</label>
                  <input
                    type="text"
                    value={formData.ticketNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, ticketNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اختيار الجهاز المتعطل</label>
                  <select
                    value={formData.deviceId}
                    onChange={(e) => handleSelectDevice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="">-- اختر جهازاً من السجل --</option>
                    {devices.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.serialNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    اسم الجهاز / نوعه <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.deviceName}
                    onChange={(e) => setFormData(prev => ({ ...prev, deviceName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم التسلسلي</label>
                  <input
                    type="text"
                    value={formData.serialNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم أو المكتب المتواجد به</label>
                  <input
                    type="text"
                    value={formData.stationOrDept}
                    onChange={(e) => setFormData(prev => ({ ...prev, stationOrDept: e.target.value }))}
                    placeholder="دائرة الاتصالات..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">درجة الأولوية</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TicketPriority }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    {priorities.map(p => (
                      <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الفني المكلف بالصيانة</label>
                  <input
                    type="text"
                    value={formData.assignedTech}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedTech: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">حالة البلاغ</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TicketStatus }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    {ticketStatuses.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    وصف العطل بدقة <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.faultDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, faultDescription: e.target.value }))}
                    placeholder="تفاصيل العطل، الرسائل الظاهرة على الشاشة، توقف الشبكة..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">الإجراءات المتخذة للإصلاح</label>
                  <textarea
                    rows={2}
                    value={formData.actionsTaken}
                    onChange={(e) => setFormData(prev => ({ ...prev, actionsTaken: e.target.value }))}
                    placeholder="الفحص، تبديل لوحة التغذية، إعادة البرمجة..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">قطع الغيار المستخدمة</label>
                  <input
                    type="text"
                    value={formData.sparePartsUsed}
                    onChange={(e) => setFormData(prev => ({ ...prev, sparePartsUsed: e.target.value }))}
                    placeholder="كابل شبكي، باور سبلاي..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الإصلاح (إن تم)</label>
                  <input
                    type="date"
                    value={formData.resolutionDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, resolutionDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
                >
                  حفظ البلاغ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
