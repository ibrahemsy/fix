import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Plus, 
  Printer, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCw, 
  FileText, 
  UserCheck, 
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Movement, MovementType } from '../types';

export const MovementsView: React.FC = () => {
  const { movements, saveMovement, devices, currentRole } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printingMovement, setPrintingMovement] = useState<Movement | null>(null);

  const movementTypes: { key: MovementType; label: string; icon: any; color: string }[] = [
    { key: 'handover', label: 'تسليم جهاز لموظف', icon: ArrowUpRight, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { key: 'return', label: 'إعادة جهاز للمستودع', icon: ArrowDownLeft, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { key: 'transfer_employee', label: 'نقل من موظف إلى موظف', icon: UserCheck, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { key: 'transfer_dept', label: 'نقل جهاز بين الأقسام', icon: ArrowLeftRight, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { key: 'replacement', label: 'استبدال جهاز (صيانة أو عطل)', icon: RotateCw, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { key: 'decommission', label: 'إخراج جهاز من الخدمة', icon: FileText, color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { key: 'new_intake', label: 'إدخال جهاز جديد إلى المستودع', icon: Plus, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  ];

  const emptyMovement: Movement = {
    id: `mov_${Date.now()}`,
    referenceNumber: `سند حركة رقم ${Math.floor(100 + Math.random() * 900)} / ${new Date().getFullYear()}`,
    type: 'handover',
    deviceId: '',
    deviceName: '',
    serialNumber: '',
    fromEntity: 'مستودع الدائرة',
    toEntity: '',
    executorName: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
    createdAt: new Date().toISOString(),
  };

  const [formData, setFormData] = useState<Movement>(emptyMovement);

  const handleSelectDevice = (deviceId: string) => {
    const dev = devices.find(d => d.id === deviceId);
    if (!dev) return;
    setFormData(prev => ({
      ...prev,
      deviceId: dev.id,
      deviceName: dev.name,
      serialNumber: dev.serialNumber,
      fromEntity: dev.assignedEmployee || dev.location || 'مستودع دائرة الاتصالات',
    }));
  };

  const handleOpenNew = () => {
    setFormData({
      ...emptyMovement,
      id: `mov_${Date.now()}`,
      referenceNumber: `سند حركة رقم ${Math.floor(100 + Math.random() * 900)} / ${new Date().getFullYear()}`,
    });
    setIsModalOpen(true);
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deviceName || !formData.toEntity) {
      alert('يرجى تحديد الجهاز والجهة أو الموظف المستلم.');
      return;
    }
    await saveMovement(formData);
    setIsModalOpen(false);
  };

  const handlePrintVoucher = (mov: Movement) => {
    setPrintingMovement(mov);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const filteredMovements = movements.filter(m => {
    const matchesSearch = 
      m.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.fromEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.toEntity.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || m.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-blue-600" />
            <span>إدارة حركات الاستلام والتسليم والإعادة ونقل العهد</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            توثيق رسمي لكافة عمليات صرف الحواسيب والتجهيزات ونقلها بين الموظفين والأقسام
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل حركة عهدة جديدة</span>
        </button>
      </div>

      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="بحث برقم السند، الجهاز، الرقم التسلسلي، المستلم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">كافة أنواع الحركات ({movements.length})</option>
            {movementTypes.map(t => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="no-print bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-3">رقم السند المرجعي</th>
                <th className="py-3 px-3">نوع الحركة</th>
                <th className="py-3 px-3">الجهاز المنقول</th>
                <th className="py-3 px-3">الرقم التسلسلي</th>
                <th className="py-3 px-3">الجهة / الموظف المسلّم</th>
                <th className="py-3 px-3">الجهة / الموظف المستلم</th>
                <th className="py-3 px-3">تاريخ الحركة</th>
                <th className="py-3 px-3">المنفذ</th>
                <th className="py-3 px-3 text-center">طباعة سند</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.map((mov) => {
                const typeObj = movementTypes.find(t => t.key === mov.type);
                return (
                  <tr key={mov.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-blue-700">{mov.referenceNumber}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${typeObj?.color || 'bg-slate-100'}`}>
                        {typeObj?.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">{mov.deviceName}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{mov.serialNumber}</td>
                    <td className="py-3 px-3 text-slate-600">{mov.fromEntity}</td>
                    <td className="py-3 px-3 font-bold text-blue-700">{mov.toEntity}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{mov.date}</td>
                    <td className="py-3 px-3 text-slate-700">{mov.executorName}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handlePrintVoucher(mov)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="طباعة سند رسمي"
                      >
                        <Printer className="w-4 h-4 text-blue-600" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW MOVEMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                <span>تسجيل سند استلام / تسليم / نقل عهدة</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم المرجعي للسند</label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع الحركة</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as MovementType }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    {movementTypes.map(t => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    اختيار الجهاز موضوع الحركة <span className="text-rose-600">*</span>
                  </label>
                  <select
                    required
                    value={formData.deviceId}
                    onChange={(e) => handleSelectDevice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="">-- اضغط لاختيار الجهاز من السجل المركزي --</option>
                    {devices.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} | الرقم التسلسلي: {d.serialNumber} | الموقع: {d.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الجهاز</label>
                  <input
                    type="text"
                    value={formData.deviceName}
                    onChange={(e) => setFormData(prev => ({ ...prev, deviceName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم التسلسلي</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الجهة أو الموظف المسلّم</label>
                  <input
                    type="text"
                    value={formData.fromEntity}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromEntity: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الجهة أو الموظف المستلم <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.toEntity}
                    onChange={(e) => setFormData(prev => ({ ...prev, toEntity: e.target.value }))}
                    placeholder="اسم الموظف المستلم أو القسم..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الموظف المنفذ للحركة</label>
                  <input
                    type="text"
                    value={formData.executorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, executorName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ العملية</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">سبب الحركة والتفاصيل الإدارية</label>
                  <textarea
                    rows={2}
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="تسليم عهدة جديدة، نقل بين الأقسام، عطل بحاجة لصيانة..."
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  اعتماد وتسجيل الحركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL VOUCHER */}
      {printingMovement && (
        <div className="hidden print:block bg-white text-black p-8 max-w-[210mm] mx-auto min-h-[297mm] border-2 border-black">
          <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-center text-xs font-bold">
            <div>
              <div>وزارة الطوارئ وإدارة الكوارث</div>
              <div>دائرة الاتصالات</div>
              <div>قسم العهد والتجهيزات التقنية</div>
            </div>
            <div className="text-center font-bold text-sm">
              <div>سند حركة عهدة وتجهيزات رسمية</div>
              <div className="text-xs font-mono mt-1">{printingMovement.referenceNumber}</div>
            </div>
            <div className="text-left font-mono">
              التاريخ: {printingMovement.date}
            </div>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <p className="text-sm">
              بموجب هذا السند الرسمي الصادر عن دائرة الاتصالات، تم توثيق حركة العهدة التالية:
            </p>

            <table className="official-table w-full text-right text-xs border-collapse">
              <tbody>
                <tr>
                  <td className="w-40 font-bold bg-slate-100">نوع الحركة:</td>
                  <td>{movementTypes.find(t => t.key === printingMovement.type)?.label}</td>
                </tr>
                <tr>
                  <td className="font-bold bg-slate-100">اسم الجهاز / المعدة:</td>
                  <td className="font-bold">{printingMovement.deviceName}</td>
                </tr>
                <tr>
                  <td className="font-bold bg-slate-100">الرقم التسلسلي:</td>
                  <td className="font-mono">{printingMovement.serialNumber}</td>
                </tr>
                <tr>
                  <td className="font-bold bg-slate-100">الجهة / الموظف المسلّم:</td>
                  <td>{printingMovement.fromEntity}</td>
                </tr>
                <tr>
                  <td className="font-bold bg-slate-100">الجهة / الموظف المستلم:</td>
                  <td className="font-bold text-blue-900">{printingMovement.toEntity}</td>
                </tr>
                <tr>
                  <td className="font-bold bg-slate-100">سبب الحركة والإجراء:</td>
                  <td>{printingMovement.reason || 'إجراء إداري وفني معتمد'}</td>
                </tr>
                <tr>
                  <td className="font-bold bg-slate-100">الموظف المنفذ:</td>
                  <td>{printingMovement.executorName}</td>
                </tr>
              </tbody>
            </table>

            <div className="grid grid-cols-3 gap-6 pt-16 text-center text-xs font-bold">
              <div>
                <div>توقيع الجهة المسلّمة</div>
                <div className="mt-8">..............................</div>
              </div>
              <div>
                <div>توقيع الجهة المستلمة</div>
                <div className="mt-8">..............................</div>
              </div>
              <div>
                <div>مصادقة رئيس دائرة الاتصالات</div>
                <div className="mt-8">..............................</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
