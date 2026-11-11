import React, { useState } from 'react';
import { 
  Printer, 
  Save, 
  Plus, 
  Trash2, 
  FileCheck, 
  FolderOpen, 
  Search, 
  Eye, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CustodyCard, CustodyCardItem } from '../types';

export const CustodyCardView: React.FC = () => {
  const { 
    custodyCards, 
    saveCustodyCard, 
    deleteCustodyCard, 
    devices,
    currentRole,
    isHeadOfDept,
    logAuditAction
  } = useApp();

  const [selectedCardId, setSelectedCardId] = useState<string>(custodyCards[0]?.id || 'new');
  const [viewMode, setViewMode] = useState<'editor' | 'official_print' | 'archive'>('editor');
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Generate 10 initial rows for a blank card
  const generateDefaultItems = (count = 10): CustodyCardItem[] => {
    return Array.from({ length: count }, (_, idx) => ({
      id: `item_${Date.now()}_${idx + 1}`,
      no: idx + 1,
      name: '',
      description: '',
      unit: 'عدد',
      quantity: 1,
      serialNumber: '',
      barcode: `BAR-${Math.floor(100000 + Math.random() * 900000)}`,
      itemCode: '',
      receiptDetails: '',
      receiptDate: new Date().toISOString().split('T')[0],
      returnDetails: '',
      custodyNumber: '',
      returnDate: '',
      balance: 1,
      notes: '',
    }));
  };

  const createNewCardTemplate = (): CustodyCard => ({
    id: `card_${Date.now()}`,
    cardNumber: `بطاقة عهدة رقم ${Math.floor(100 + Math.random() * 900)} / ${new Date().getFullYear()}`,
    employeeName: '',
    jobTitle: '',
    directorate: 'وزارة الطوارئ وإدارة الكوارث',
    workCenter: 'المقر الرئيسي',
    department: 'دائرة الاتصالات',
    division: '',
    officeOrCenter: '',
    creationDate: new Date().toISOString().split('T')[0],
    items: generateDefaultItems(10),
    employeeSignature: '',
    deliveryOfficerSignature: '',
    deptHeadSignature: '',
    warehouseKeeperSignature: '',
    adminEndorsement: 'تمت المصادقة والمطابقة أصولاً مع سجلات المستودع المركزي والتجهيزات',
    endorsementDate: new Date().toISOString().split('T')[0],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [activeCard, setActiveCard] = useState<CustodyCard>(() => {
    return custodyCards[0] || createNewCardTemplate();
  });

  const handleSelectCard = (card: CustodyCard) => {
    setActiveCard(card);
    setSelectedCardId(card.id);
    setViewMode('editor');
  };

  const handleStartNewCard = () => {
    const newCard = createNewCardTemplate();
    setActiveCard(newCard);
    setSelectedCardId(newCard.id);
    setViewMode('editor');
  };

  const handleItemChange = (index: number, field: keyof CustodyCardItem, value: any) => {
    const updatedItems = [...activeCard.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    if (field === 'quantity' || field === 'returnDetails') {
      const isReturned = updatedItems[index].returnDate && updatedItems[index].returnDate.trim() !== '';
      updatedItems[index].balance = isReturned ? 0 : Number(updatedItems[index].quantity || 0);
    }
    setActiveCard(prev => ({ ...prev, items: updatedItems }));
  };

  const handleAddRow = () => {
    const newNo = activeCard.items.length + 1;
    const newItem: CustodyCardItem = {
      id: `item_${Date.now()}_${newNo}`,
      no: newNo,
      name: '',
      description: '',
      unit: 'عدد',
      quantity: 1,
      serialNumber: '',
      barcode: `BAR-${Math.floor(100000 + Math.random() * 900000)}`,
      itemCode: '',
      receiptDetails: 'صرف مستودعي',
      receiptDate: new Date().toISOString().split('T')[0],
      returnDetails: '',
      custodyNumber: '',
      returnDate: '',
      balance: 1,
      notes: '',
    };
    setActiveCard(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveRow = (index: number) => {
    if (activeCard.items.length <= 1) return;
    const updatedItems = activeCard.items.filter((_, idx) => idx !== index)
      .map((item, idx) => ({ ...item, no: idx + 1 }));
    setActiveCard(prev => ({ ...prev, items: updatedItems }));
  };

  const handlePickDevice = (index: number, deviceId: string) => {
    const dev = devices.find(d => d.id === deviceId);
    if (!dev) return;

    const updatedItems = [...activeCard.items];
    updatedItems[index] = {
      ...updatedItems[index],
      name: dev.name,
      description: `${dev.manufacturer} ${dev.model} - ${dev.condition}`,
      serialNumber: dev.serialNumber,
      custodyNumber: dev.assetNumber || `عُهدة-${dev.serialNumber}`,
      itemCode: `رمز-${dev.category}`,
      quantity: 1,
      balance: 1,
      deviceId: dev.id,
      notes: dev.notes || '',
    };
    setActiveCard(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSave = async () => {
    if (!activeCard.employeeName.trim()) {
      alert('يرجى كتابة الاسم الثلاثي للموظف المسؤول قبل الحفظ.');
      return;
    }
    const cardToSave: CustodyCard = {
      ...activeCard,
      updatedAt: new Date().toISOString(),
    };
    await saveCustodyCard(cardToSave);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handlePrint = () => {
    window.print();
    logAuditAction('طباعة بطاقة عهدة رسمية', 'بطاقة عهدة', activeCard.cardNumber, `الموظف: ${activeCard.employeeName}`);
  };

  const handlePrintBlank = () => {
    const blankCard = createNewCardTemplate();
    blankCard.cardNumber = 'بطاقة عهدة رقم: .................... / ...........';
    blankCard.employeeName = '...................................................';
    blankCard.jobTitle = '...................................................';
    blankCard.directorate = '...................................................';
    blankCard.workCenter = '...................................................';
    blankCard.department = '...................................................';
    blankCard.division = '...................................................';
    blankCard.officeOrCenter = '...................................................';
    blankCard.creationDate = '.... / .... / 202...';
    blankCard.items = generateDefaultItems(12);
    setActiveCard(blankCard);
    setViewMode('official_print');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const filteredCards = custodyCards.filter(c => 
    c.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">بطاقة العهدة الشخصية – تجهيزات حاسوب وملحقاتها</h2>
            <p className="text-xs text-slate-500">النموذج الورقي الحكومي الرسمي المعتمد لإدارة العهد</p>
          </div>
        </div>

        {/* View Mode Switcher and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'editor' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              محرر البيانات
            </button>
            <button
              onClick={() => setViewMode('official_print')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'official_print' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة النموذج</span>
            </button>
            <button
              onClick={() => setViewMode('archive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'archive' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>الأرشيف ({custodyCards.length})</span>
            </button>
          </div>

          <button
            onClick={handleStartNewCard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>بطاقة جديدة</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>حفظ البطاقة</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة البطاقة</span>
          </button>

          <button
            onClick={handlePrintBlank}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition"
          >
            <span>طباعة فارغة</span>
          </button>
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="no-print p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>تم حفظ بطاقة العهدة وتحديث السجلات بنجاح في قاعدة البيانات.</span>
        </div>
      )}

      {/* ARCHIVE VIEW */}
      {viewMode === 'archive' && (
        <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900 text-base">أرشيف بطاقات العهدة الصادرة</h3>
            <div className="relative w-72">
              <input
                type="text"
                placeholder="بحث باسم الموظف أو رقم البطاقة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                  <th className="py-2.5 px-3">رقم البطاقة</th>
                  <th className="py-2.5 px-3">اسم الموظف المسؤول</th>
                  <th className="py-2.5 px-3">الصفة الوظيفية</th>
                  <th className="py-2.5 px-3">المديرية / الدائرة</th>
                  <th className="py-2.5 px-3">تاريخ الإنشاء</th>
                  <th className="py-2.5 px-3">المواد المسجلة</th>
                  <th className="py-2.5 px-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-blue-700">{card.cardNumber}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{card.employeeName}</td>
                    <td className="py-3 px-3 text-slate-600">{card.jobTitle}</td>
                    <td className="py-3 px-3 text-slate-500">{card.department} - {card.division}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{card.creationDate}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">
                        {card.items?.length || 0} أسطر
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelectCard(card)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition"
                        >
                          فتح وتعديل
                        </button>
                        <button
                          onClick={() => {
                            setActiveCard(card);
                            setViewMode('official_print');
                          }}
                          className="p-1 text-slate-500 hover:text-blue-700 transition"
                          title="معاينة وطباعة"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {(isHeadOfDept || currentRole === 'director') && (
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف بطاقة ${card.employeeName}؟`)) {
                                deleteCustodyCard(card.id);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-rose-600 transition"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INTERACTIVE FORM EDITOR VIEW */}
      {viewMode === 'editor' && (
        <div className="no-print space-y-6">
          {/* Employee Metadata Fields */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                بيانات الموظف المسؤول وصاحب العهدة
              </h3>
              <span className="text-xs text-blue-700 font-mono font-bold bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                {activeCard.cardNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. الاسم الثلاثي للمسؤول <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={activeCard.employeeName}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, employeeName: e.target.value }))}
                  placeholder="مثلاً: أحمد عمار خليل"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. صفته الوظيفية <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={activeCard.jobTitle}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="مهندس اتصالات / فني شبكات..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">3. المديرية</label>
                <input
                  type="text"
                  value={activeCard.directorate}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, directorate: e.target.value }))}
                  placeholder="مديرية الاتصالات"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">4. مركز العمل</label>
                <input
                  type="text"
                  value={activeCard.workCenter}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, workCenter: e.target.value }))}
                  placeholder="المقر الرئيسي - الإدارة"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">5. الدائرة</label>
                <input
                  type="text"
                  value={activeCard.department}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="دائرة الاتصالات"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">6. الشعبة</label>
                <input
                  type="text"
                  value={activeCard.division}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, division: e.target.value }))}
                  placeholder="شعبة الشبكات والصيانة"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">7. المكتب</label>
                <input
                  type="text"
                  value={activeCard.officeOrCenter}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, officeOrCenter: e.target.value }))}
                  placeholder="مكتب رقم 4"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">8. رقم البطاقة</label>
                <input
                  type="text"
                  value={activeCard.cardNumber}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, cardNumber: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">9. تاريخ إنشاء البطاقة</label>
                <input
                  type="date"
                  value={activeCard.creationDate}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, creationDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Items Table Editor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">جدول مواد العهدة وتجهيزات الحاسوب المكتبية</h3>
                <p className="text-xs text-slate-500">يتضمن كافة الحقول الأصلية (بيانات الاستلام، الإعادة، الأرقام التسلسلية، والرصيد)</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة سطر جديد</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-2 text-center w-10">م</th>
                    <th className="py-2.5 px-2 min-w-[150px]">اسم المادة</th>
                    <th className="py-2.5 px-2 min-w-[180px]">الوصف والمواصفات</th>
                    <th className="py-2.5 px-2 w-20">الوحدة</th>
                    <th className="py-2.5 px-2 w-16 text-center">الكمية</th>
                    <th className="py-2.5 px-2 min-w-[140px]">الرقم التسلسلي</th>
                    <th className="py-2.5 px-2 min-w-[110px]">رمز المادة</th>
                    <th className="py-2.5 px-2 min-w-[120px]">بيانات الاستلام</th>
                    <th className="py-2.5 px-2 w-28">تاريخ الاستلام</th>
                    <th className="py-2.5 px-2 min-w-[120px]">بيانات الإعادة</th>
                    <th className="py-2.5 px-2 min-w-[110px]">رقم العهدة</th>
                    <th className="py-2.5 px-2 w-28">تاريخ الإعادة</th>
                    <th className="py-2.5 px-2 w-16 text-center">الرصيد</th>
                    <th className="py-2.5 px-2 min-w-[120px]">الملاحظات</th>
                    <th className="py-2.5 px-2 w-10 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeCard.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-2 text-center font-bold text-slate-500">{item.no}</td>
                      
                      <td className="py-2 px-2">
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            placeholder="اسم الجهاز أو المادة"
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                          />
                          {devices.length > 0 && (
                            <select
                              onChange={(e) => handlePickDevice(index, e.target.value)}
                              className="w-full text-[10px] px-1 py-0.5 bg-slate-100 text-blue-700 border border-slate-200 rounded font-semibold"
                            >
                              <option value="">+ اختيار سريع من المستودع...</option>
                              {devices.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.serialNumber})</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="المواصفات والمعالج..."
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                        />
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 text-center focus:outline-hidden focus:border-blue-500"
                        />
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 text-center font-bold focus:outline-hidden focus:border-blue-500"
                        />
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.serialNumber}
                          onChange={(e) => handleItemChange(index, 'serialNumber', e.target.value)}
                          placeholder="الرقم التسلسلي"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-hidden focus:border-blue-500"
                        />
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.itemCode}
                          onChange={(e) => handleItemChange(index, 'itemCode', e.target.value)}
                          placeholder="الرمز"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-hidden focus:border-blue-500"
                        />
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.receiptDetails}
                          onChange={(e) => handleItemChange(index, 'receiptDetails', e.target.value)}
                          placeholder="إذن صرف..."
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                        />
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="date"
                          value={item.receiptDate}
                          onChange={(e) => handleItemChange(index, 'receiptDate', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                        />
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.returnDetails}
                          onChange={(e) => handleItemChange(index, 'returnDetails', e.target.value)}
                          placeholder="سبب الإعادة..."
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                        />
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.custodyNumber}
                          onChange={(e) => handleItemChange(index, 'custodyNumber', e.target.value)}
                          placeholder="رقم العهدة"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-hidden focus:border-blue-500"
                        />
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="date"
                          value={item.returnDate}
                          onChange={(e) => handleItemChange(index, 'returnDate', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                        />
                      </td>

                      <td className="py-2 px-2 text-center">
                        <span className={`font-bold ${item.balance > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {item.balance}
                        </span>
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                        />
                      </td>

                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => handleRemoveRow(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="حذف هذا السطر"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures & Admin Endorsement */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              التوقيعات والمصادقات الإدارية الرسمية
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم وتوقيع الموظف المستلم</label>
                <input
                  type="text"
                  value={activeCard.employeeSignature || activeCard.employeeName}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, employeeSignature: e.target.value }))}
                  placeholder="الموظف المستلم"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المسؤول عن تسليم المواد</label>
                <input
                  type="text"
                  value={activeCard.deliveryOfficerSignature}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, deliveryOfficerSignature: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رئيس دائرة الاتصالات</label>
                <input
                  type="text"
                  value={activeCard.deptHeadSignature}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, deptHeadSignature: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">أمين المستودع المركزي</label>
                <input
                  type="text"
                  value={activeCard.warehouseKeeperSignature}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, warehouseKeeperSignature: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">خانة المصادقة الإدارية</label>
                <input
                  type="text"
                  value={activeCard.adminEndorsement}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, adminEndorsement: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ المصادقة</label>
                <input
                  type="date"
                  value={activeCard.endorsementDate}
                  onChange={(e) => setActiveCard(prev => ({ ...prev, endorsementDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINT DOCUMENT */}
      <div className={`print-area ${viewMode === 'official_print' ? 'block' : 'hidden print:block'} bg-white text-black p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-300 max-w-[210mm] mx-auto min-h-[297mm]`}>
        <div className="border-b-2 border-black pb-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="text-right space-y-0.5 text-xs font-bold leading-relaxed">
              <div>وزارة الطوارئ وإدارة الكوارث</div>
              <div>دائرة الاتصالات</div>
              <div>قسم العهد والتجهيزات التقنية</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto border-2 border-black rounded-full p-1 flex items-center justify-center font-bold text-[9px] leading-tight">
                وزارة الطوارئ<br/>وإدارة الكوارث<br/>دائرة الاتصالات
              </div>
            </div>

            <div className="text-left space-y-1 text-xs">
              <div className="font-bold border border-black px-2 py-1 inline-block">
                {activeCard.cardNumber}
              </div>
              <div className="text-[11px] font-mono">
                التاريخ: {activeCard.creationDate}
              </div>
            </div>
          </div>

          <div className="text-center mt-3 pt-2 border-t border-black">
            <h1 className="text-lg sm:text-xl font-extrabold tracking-wide underline underline-offset-4">
              بطاقة العهدة الشخصية – تجهيزات حاسوب وملحقاتها
            </h1>
          </div>
        </div>

        <div className="border-2 border-black p-3 mb-4 text-xs font-bold space-y-2 bg-slate-50">
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            <div>
              <span className="font-bold ml-1">الاسم الثلاثي للمسؤول:</span>
              <span className="border-b border-dotted border-black pb-0.5 px-2 font-bold text-sm">
                {activeCard.employeeName || '...................................................'}
              </span>
            </div>
            <div>
              <span className="font-bold ml-1">صفته الوظيفية:</span>
              <span className="border-b border-dotted border-black pb-0.5 px-2">
                {activeCard.jobTitle || '...................................................'}
              </span>
            </div>
            <div>
              <span className="font-bold ml-1">المديرية:</span>
              <span className="border-b border-dotted border-black pb-0.5 px-2">
                {activeCard.directorate || '...................................................'}
              </span>
            </div>
            <div>
              <span className="font-bold ml-1">مركز العمل:</span>
              <span className="border-b border-dotted border-black pb-0.5 px-2">
                {activeCard.workCenter || '...................................................'}
              </span>
            </div>
            <div>
              <span className="font-bold ml-1">الدائرة:</span>
              <span className="border-b border-dotted border-black pb-0.5 px-2">
                {activeCard.department || '...................................................'}
              </span>
            </div>
            <div>
              <span className="font-bold ml-1">الشعبة:</span>
              <span className="border-b border-dotted border-black pb-0.5 px-2">
                {activeCard.division || '...................................................'}
              </span>
            </div>
            <div>
              <span className="font-bold ml-1">المكتب:</span>
              <span className="border-b border-dotted border-black pb-0.5 px-2">
                {activeCard.officeOrCenter || '...................................................'}
              </span>
            </div>
            <div>
              <span className="font-bold ml-1">تاريخ الإنشاء:</span>
              <span className="border-b border-dotted border-black pb-0.5 px-2 font-mono">
                {activeCard.creationDate || '...................................................'}
              </span>
            </div>
          </div>
        </div>

        <table className="official-table w-full text-right text-[9pt] border-collapse mb-6">
          <thead>
            <tr className="bg-slate-100 font-bold text-center">
              <th className="w-6">م</th>
              <th className="min-w-[100px]">اسم المادة</th>
              <th className="min-w-[120px]">وصف المادة ومواصفاتها</th>
              <th className="w-12">وحدة القياس</th>
              <th className="w-10">الكمية</th>
              <th className="min-w-[90px]">الرقم التسلسلي</th>
              <th className="min-w-[70px]">رمز المادة</th>
              <th className="min-w-[80px]">بيانات الاستلام</th>
              <th className="w-16">تاريخ الاستلام</th>
              <th className="min-w-[70px]">بيانات الإعادة</th>
              <th className="min-w-[70px]">رقم العهدة</th>
              <th className="w-16">تاريخ الإعادة</th>
              <th className="w-10">الرصيد</th>
              <th className="min-w-[70px]">الملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {activeCard.items.map((item, idx) => (
              <tr key={item.id || idx} className="h-7 text-center">
                <td className="font-bold">{item.no}</td>
                <td className="text-right px-1 font-semibold">{item.name || ''}</td>
                <td className="text-right px-1 text-[8.5pt]">{item.description || ''}</td>
                <td>{item.unit || ''}</td>
                <td className="font-bold">{item.name ? item.quantity : ''}</td>
                <td className="font-mono text-[8pt]">{item.serialNumber || ''}</td>
                <td className="font-mono text-[8pt]">{item.itemCode || ''}</td>
                <td className="text-right px-1 text-[8pt]">{item.receiptDetails || ''}</td>
                <td className="font-mono text-[8pt]">{item.receiptDate || ''}</td>
                <td className="text-right px-1 text-[8pt]">{item.returnDetails || ''}</td>
                <td className="font-mono text-[8pt]">{item.custodyNumber || ''}</td>
                <td className="font-mono text-[8pt]">{item.returnDate || ''}</td>
                <td className="font-bold">{item.name ? item.balance : ''}</td>
                <td className="text-right px-1 text-[8pt]">{item.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t-2 border-black pt-4 text-xs font-bold space-y-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="space-y-8">
              <div>اسم وتوقيع الموظف المستلم</div>
              <div className="font-normal border-b border-black pb-1">
                {activeCard.employeeSignature || activeCard.employeeName || '..............................'}
              </div>
            </div>

            <div className="space-y-8">
              <div>المسؤول عن تسليم المواد</div>
              <div className="font-normal border-b border-black pb-1">
                {activeCard.deliveryOfficerSignature || '..............................'}
              </div>
            </div>

            <div className="space-y-8">
              <div>رئيس دائرة الاتصالات</div>
              <div className="font-normal border-b border-black pb-1">
                {activeCard.deptHeadSignature || '..............................'}
              </div>
            </div>

            <div className="space-y-8">
              <div>أمين المستودع المركزي</div>
              <div className="font-normal border-b border-black pb-1">
                {activeCard.warehouseKeeperSignature || '..............................'}
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 border-2 border-black flex items-center justify-between">
            <div className="space-y-1 text-right">
              <div className="font-extrabold underline">المصادقة الإدارية:</div>
              <div className="font-normal text-[11px]">
                {activeCard.adminEndorsement || 'تمت المصادقة والمطابقة أصولاً مع سجلات المستودع المركزي والتجهيزات.'}
              </div>
              <div className="text-[10px] text-slate-700">تاريخ المصادقة: {activeCard.endorsementDate}</div>
            </div>

            <div className="w-24 h-24 border-2 border-dashed border-black rounded-full flex flex-col items-center justify-center text-[9px] font-bold text-center leading-tight">
              <span>خاتم الإدارة</span>
              <span className="text-[7px] text-slate-600">طوارئ وكوارث</span>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
            <span>وزارة الطوارئ وإدارة الكوارث - دائرة الاتصالات</span>
            <span className="font-bold text-slate-700">تطوير وبرمجة: إبراهيم زينب</span>
          </div>
        </div>
      </div>
    </div>
  );
};
