import React, { useState, useRef, useEffect } from 'react';
import { 
  Server, 
  Plus, 
  Search, 
  Camera, 
  Upload, 
  X, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  FileText,
  Image as ImageIcon,
  CheckCircle
} from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useApp } from '../context/AppContext';
import { Device, DeviceCategory, DeviceCondition, DeviceStatus, DeviceAttachment } from '../types';
import { getModelSuggestions } from '../services/aiService';

export const DeviceManagementView: React.FC = () => {
  const { devices, saveDevice, deleteDevice, currentRole, isHeadOfDept, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Camera capture state
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Camera scanner supports QR and common 1D retail/asset barcode formats.
  const [barcodeScanTarget, setBarcodeScanTarget] = useState<'form' | 'search' | null>(null);
  const scannerElementId = useRef(`device-barcode-reader-${Date.now()}`);

  const handleScan = (decodedText: string) => {
    const value = String(decodedText || '').trim();
    if (!value) return;
    if (barcodeScanTarget === 'search') {
      setSearchTerm(value);
    } else {
      setFormData(prev => ({ ...prev, barcode: value }));
      alert(`تم مسح الباركود بنجاح: ${value}`);
    }
    setBarcodeScanTarget(null);
  };

  useEffect(() => {
    if (!barcodeScanTarget) return;
    const scanner = new Html5QrcodeScanner(
      scannerElementId.current,
      {
        fps: 12,
        qrbox: { width: 260, height: 150 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
        ],
        rememberLastUsedCamera: true,
      },
      false
    );
    scanner.render(
      (decodedText) => handleScan(decodedText),
      () => undefined
    );
    return () => {
      scanner.clear().catch(() => undefined);
    };
  }, [barcodeScanTarget]);

  const startBarcodeScanner = (target: 'form' | 'search' = 'form') => {
    setBarcodeScanTarget(target);
  };

  const stopBarcodeScanner = () => {
    setBarcodeScanTarget(null);
  };

  const emptyDevice: Device = {
    id: `dev_${Date.now()}`,
    name: '',
    category: 'desktop',
    manufacturer: '',
    model: '',
    serialNumber: '',
    barcode: `BAR-${Date.now()}`,
    assetNumber: '',
    cpu: '',
    ram: '',
    storage: '',
    caseType: '',
    networkCables: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    supplier: '',
    condition: 'excellent',
    status: 'in_warehouse',
    location: 'مستودع دائرة الاتصالات',
    assignedEmployee: '',
    assignedStationOrDept: '',
    deliveryDate: '',
    warrantyEnd: '',
    notes: '',
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [formData, setFormData] = useState<Device>(emptyDevice);

  const categories: { key: DeviceCategory; label: string }[] = [
    { key: 'desktop', label: 'حاسب مكتبي متقدم' },
    { key: 'laptop', label: 'حاسب محمول' },
    { key: 'monitor', label: 'شاشة عرض' },
    { key: 'printer', label: 'طابعة مكتبية' },
    { key: 'scanner', label: 'ماسح ضوئي' },
    { key: 'ups', label: 'مزود طاقة احتياطي' },
    { key: 'router', label: 'جهاز توجيه شبكي' },
    { key: 'switch', label: 'محول شبكة مركزي' },
    { key: 'access_point', label: 'نقطة بث لاسلكي' },
    { key: 'wireless_radio', label: 'اتصالات لاسلكية' },
    { key: 'telephony', label: 'هاتف أرضي أو شبكي' },
    { key: 'modem', label: 'مودم اتصالات' },
    { key: 'cables_fiber', label: 'كابلات وألياف ضوئية' },
    { key: 'telecom_gear', label: 'معدات شبكات واتصالات' },
    { key: 'peripherals', label: 'ملحقات حاسوب' },
    { key: 'spare_parts', label: 'قطع غيار وأجزاء' },
    { key: 'other', label: 'تجهيزات أخرى' },
  ];

  const conditions: { key: DeviceCondition; label: string; color: string }[] = [
    { key: 'excellent', label: 'ممتاز', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { key: 'good', label: 'جيد جداً', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { key: 'needs_maintenance', label: 'يحتاج صيانة', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { key: 'defective', label: 'معطل', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { key: 'out_of_service', label: 'خارج الخدمة', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  ];

  const statuses: { key: DeviceStatus; label: string; color: string }[] = [
    { key: 'in_warehouse', label: 'في المستودع', color: 'bg-purple-50 text-purple-700' },
    { key: 'assigned_employee', label: 'مسلّم لموظف (عهدة)', color: 'bg-emerald-50 text-emerald-700' },
    { key: 'assigned_department', label: 'مسلّم لقسم / شعبة', color: 'bg-sky-50 text-sky-700' },
    { key: 'in_maintenance', label: 'قيد الصيانة', color: 'bg-amber-50 text-amber-700' },
    { key: 'decommissioned', label: 'مخرَج من الخدمة', color: 'bg-rose-50 text-rose-700' },
  ];

  const categoryKeywords: Record<DeviceCategory, string[]> = {
    desktop: ['pc', 'desktop', 'workstation', 'كيس', 'حاسب مكتبي', 'خادم', 'server'],
    laptop: ['laptop', 'notebook', 'thinkpad', 'macbook', 'حاسب محمول', 'لابتوب'],
    monitor: ['monitor', 'screen', 'display', 'شاشة', 'عرض'],
    printer: ['printer', 'epson', 'hp laser', 'canon', 'طابعة', 'ليزر'],
    scanner: ['scanner', 'scan', 'ماسح'],
    ups: ['ups', 'power', 'battery', 'apc', 'مزود طاقة'],
    router: ['router', 'cisco', 'mikrotik', 'موجه'],
    switch: ['switch', 'محول شبكة'],
    access_point: ['ap', 'wireless', 'wifi', 'نقطة بث'],
    wireless_radio: ['radio', 'vhf', 'uhf', 'لاسلكي'],
    telephony: ['phone', 'ip phone', 'هاتف'],
    modem: ['modem', 'مودم'],
    cables_fiber: ['cable', 'fiber', 'cat6', 'كابل'],
    telecom_gear: ['telecom', 'rack', 'تجهيزات اتصالات'],
    peripherals: ['mouse', 'keyboard', 'webcam', 'لوحة مفاتيح', 'فأرة'],
    spare_parts: ['ram', 'disk', 'ssd', 'hdd', 'قطع غيار'],
    other: []
  };

  const manufacturerModels: Record<string, string[]> = {
    'HP': ['ProDesk 600 G6', 'EliteBook 840', 'LaserJet Pro M404', 'Z2 Mini G9', 'E27 G4 Monitor'],
    'Dell': ['OptiPlex 7080', 'Latitude 5420', 'PowerEdge R740', 'Precision 3650', 'UltraSharp U2722D'],
    'Lenovo': ['ThinkCentre M70', 'ThinkPad T14', 'ThinkStation P340', 'V530 Tower'],
    'Cisco': ['Catalyst 2960', 'ISR 4331', 'IP Phone 7841', 'Meraki MR33'],
    'Epson': ['L3150', 'WorkForce WF-C5790', 'EcoTank L5290'],
    'APC': ['Smart-UPS 3000', 'Back-UPS 800', 'SurgeArrest'],
    'TP-Link': ['Archer C6', 'TL-SG1024', 'Deco M4'],
  };

  const handleNameChange = (val: string) => {
    setFormData(prev => {
      const next = { ...prev, name: val };
      // Auto-classify based on name keywords
      const lowerName = val.toLowerCase();
      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(k => lowerName.includes(k))) {
          next.category = cat as DeviceCategory;
          break;
        }
      }
      return next;
    });
  };

  const [suggestedModels, setModelSuggestions] = useState<string[]>([]);

  const handleManufacturerChange = async (val: string) => {
    setFormData(prev => ({ ...prev, manufacturer: val }));
    
    // Check local hardcoded suggestions first
    const match = Object.keys(manufacturerModels).find(m => 
      m.toLowerCase() === val.trim().toLowerCase()
    );
    
    if (match) {
      setModelSuggestions(manufacturerModels[match]);
    } else if (val.trim().length > 2) {
      // Fetch from AI if no local match and input is long enough
      const aiSuggestions = await getModelSuggestions(val, formData.category);
      if (aiSuggestions && aiSuggestions.length > 0) {
        setModelSuggestions(aiSuggestions);
      }
    } else {
      setModelSuggestions([]);
    }
  };

  const handleSerialNumberChange = (val: string) => {
    setFormData(prev => ({ ...prev, serialNumber: val }));
    const trimmed = val.trim();
    if (!trimmed) {
      setDuplicateWarning(null);
      return;
    }
    const duplicate = devices.find(d => 
      d.serialNumber.toLowerCase() === trimmed.toLowerCase() && 
      d.id !== formData.id
    );
    if (duplicate) {
      setDuplicateWarning(`تنبيه: الرقم التسلسلي مستخدم مسبقاً للجهاز: "${duplicate.name}" (${duplicate.location})`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ ...emptyDevice, id: `dev_${Date.now()}` });
    setEditingDevice(null);
    setDuplicateWarning(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dev: Device) => {
    setFormData(dev);
    setEditingDevice(dev);
    setDuplicateWarning(null);
    setIsModalOpen(true);
  };

  const startCamera = async () => {
    setIsCapturingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('تعذر فتح الكاميرا: يرجى التحقق من أذونات الكاميرا بالمتصفح.');
      setIsCapturingCamera(false);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsCapturingCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const newAttachment: DeviceAttachment = {
        id: `att_${Date.now()}`,
        name: `صورة جهاز أو رقم تسلسلي - ${new Date().toLocaleDateString('ar-SY')}`,
        type: 'image',
        dataUrl,
        uploadedAt: new Date().toISOString(),
      };
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAttachment],
      }));
    }
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        const newAttachment: DeviceAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          name: file.name,
          type: file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'doc',
          dataUrl,
          uploadedAt: new Date().toISOString(),
        };
        setFormData(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), newAttachment],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (attId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attId),
    }));
  };

  const handleSaveDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.serialNumber.trim()) {
      alert('يرجى ملء اسم الجهاز والرقم التسلسلي.');
      return;
    }
    const normalizedBarcode = (formData.barcode || '').trim().toLowerCase();
    const duplicateBarcode = normalizedBarcode
      ? devices.find(d => (d.barcode || '').trim().toLowerCase() === normalizedBarcode && d.id !== formData.id)
      : undefined;
    if (duplicateBarcode) {
      alert(`رقم الباركود مستخدم مسبقاً للجهاز: "${duplicateBarcode.name}" (${duplicateBarcode.location}). يرجى إدخال رقم فريد.`);
      return;
    }
    await saveDevice({ ...formData, barcode: (formData.barcode || '').trim() });
    setIsModalOpen(false);
  };

  const filteredDevices = devices.filter(d => {
    const rawTerm = searchTerm.toLowerCase().trim();
    if (!rawTerm) return (
      (selectedCategory === 'all' || d.category === selectedCategory) &&
      (selectedCondition === 'all' || d.condition === selectedCondition) &&
      (selectedStatus === 'all' || d.status === selectedStatus)
    );

    const tokens = rawTerm.split(/\s+/).filter(Boolean);
    const combinedSearchableText = [
      d.name,
      d.model,
      d.manufacturer,
      d.serialNumber,
      d.barcode || '',
      d.assetNumber,
      d.assignedEmployee || '',
      d.location,
      d.ipAddress || '',
      d.macAddress || '',
      d.cpu || '',
      d.ram || '',
      d.storage || '',
      d.notes || ''
    ].join(' ').toLowerCase();

    const matchesSearch = tokens.every(token => combinedSearchableText.includes(token));

    const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesCondition = selectedCondition === 'all' || d.condition === selectedCondition;
    const matchesStatus = selectedStatus === 'all' || d.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesCondition && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            <span>سجل الحواسيب والتجهيزات المكتبية والمستودع</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            قاعدة بيانات الحواسيب، السويتشات، والتجهيزات التقنية ({devices.length} جهاز مقيد)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل جهاز جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="البحث بالاسم، الباركود، رقم الموديل، الرقم التسلسلي..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <button
              type="button"
              onClick={() => startBarcodeScanner('search')}
              title="مسح باركود للبحث عن جهاز"
              className="absolute left-2 top-2 text-blue-600 hover:text-blue-800"
            >
              <Camera className="w-4 h-4" />
            </button>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-200 transition"
                title="مسح نص البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">كافة أنواع التجهيزات ({devices.length})</option>
              {categories.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">كافة الحالات الفنية</option>
              {conditions.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">كافة حالات التواجد (مستودع / عهدة)</option>
              {statuses.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {barcodeScanTarget === 'search' && (
          <div className="p-3 bg-slate-900 border border-blue-500 rounded-xl space-y-2">
            <div className="text-xs text-white text-center font-semibold">امسح باركود الجهاز بكاميرا الهاتف للعثور عليه</div>
            <div className="w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-white p-2">
              <div id={scannerElementId.current} />
            </div>
            <div className="flex justify-center">
              <button type="button" onClick={stopBarcodeScanner} className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg text-xs">إلغاء المسح</button>
            </div>
          </div>
        )}

        {/* Real-time search status and active filter indicator */}
        {(searchTerm || selectedCategory !== 'all' || selectedCondition !== 'all' || selectedStatus !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200">
                نتائج التصفية الحية: {filteredDevices.length} من أصل {devices.length} جهاز
              </span>
              {searchTerm && (
                <span className="text-slate-500">
                  البحث النشط عن: <strong className="text-slate-900">"{searchTerm}"</strong>
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedCondition('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold underline"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Devices List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-3">اسم الجهاز والتصنيف</th>
                <th className="py-3 px-3">الشركة والطراز</th>
                <th className="py-3 px-3">الرقم التسلسلي</th>
                <th className="py-3 px-3">رقم العهدة المالي</th>
                <th className="py-3 px-3">الحالة الفنية</th>
                <th className="py-3 px-3">حالة التواجد</th>
                <th className="py-3 px-3">الموقع / المسؤول</th>
                <th className="py-3 px-3 text-center">المرفقات</th>
                <th className="py-3 px-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Server className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold">لم يتم العثور على أجهزة مطابقة لخيارات البحث</p>
                  </td>
                </tr>
              ) : (
                filteredDevices.map((dev) => {
                  const condObj = conditions.find(c => c.key === dev.condition);
                  const statusObj = statuses.find(s => s.key === dev.status);
                  return (
                    <tr key={dev.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {dev.name}
                          {dev.isVerified && (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{categories.find(c => c.key === dev.category)?.label}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{dev.manufacturer} {dev.model}</div>
                        {(dev.cpu || dev.ram || dev.storage) && (
                          <div className="text-[10px] text-blue-600 font-medium mt-0.5 flex flex-wrap gap-x-2">
                            {dev.cpu && <span>المعالج: {dev.cpu}</span>}
                            {dev.ram && <span>رام: {dev.ram}</span>}
                            {dev.storage && <span>تخزين: {dev.storage}</span>}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">
                        {dev.serialNumber}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {dev.assetNumber || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${condObj?.color || 'bg-slate-100'}`}>
                          {condObj?.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusObj?.color || 'bg-slate-100'}`}>
                          {statusObj?.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">{dev.location}</div>
                        {dev.assignedEmployee && (
                          <div className="text-[11px] text-emerald-700 font-semibold">بعهدة: {dev.assignedEmployee}</div>
                        )}
                        {dev.assignedStationOrDept && (
                          <div className="text-[10px] text-blue-600">{dev.assignedStationOrDept}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {dev.attachments && dev.attachments.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{dev.attachments.length}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(dev)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="تعديل بيانات الجهاز"
                          >
                            <Edit3 className="w-4 h-4 text-blue-600" />
                          </button>
                          {(isHeadOfDept || currentRole === 'director') && (
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف الجهاز "${dev.name}"؟`)) {
                                  deleteDevice(dev.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-rose-600 transition"
                              title="حذف الجهاز"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT DEVICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                <span>{editingDevice ? 'تعديل بيانات الجهاز' : 'تسجيل حاسب أو جهاز جديد'}</span>
              </h3>
              <button
                onClick={() => {
                  stopCamera();
                  stopBarcodeScanner();
                  setIsModalOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDevice} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {duplicateWarning && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                  <span>{duplicateWarning}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    اسم الجهاز أو المادة <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="مثلاً: حاسب مكتبي متقدم / طابعة ليزرية ملونة"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع الجهاز / التصنيف</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as DeviceCategory }))}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500 font-bold"
                  >
                    {categories.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الشركة المصنعة</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => handleManufacturerChange(e.target.value)}
                    placeholder="اتش بي، ديل، لينوفو، سيسكو..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الطراز (Model)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="ProDesk 600 G6 / ThinkPad T14..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                    {suggestedModels.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                        <div className="p-2 bg-slate-50 text-[10px] text-slate-500 font-bold border-b border-slate-100">موديلات مقترحة من {formData.manufacturer}:</div>
                        {suggestedModels.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, model: m }));
                              setModelSuggestions([]);
                            }}
                            className="w-full text-right px-3 py-1.5 text-xs hover:bg-blue-50 text-slate-700 transition"
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {(formData.category === 'switch' || formData.category === 'router' || formData.category === 'telecom_gear') && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">عدد المنافذ (Ports)</label>
                    <input
                      type="number"
                      value={formData.portsCount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, portsCount: parseInt(e.target.value) || 0 }))}
                      placeholder="8 / 16 / 24 / 48..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500 font-bold"
                    />
                  </div>
                )}

                {/* Technical Specifications Section */}
                <div className="sm:col-span-2 pt-2 pb-1 border-b border-slate-100 mb-2">
                  <h4 className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">المواصفات التقنية التفصيلية (للحواسيب والشبكات)</h4>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المعالج (CPU)</label>
                  <input
                    type="text"
                    value={formData.cpu || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpu: e.target.value }))}
                    placeholder="Core i7 / Ryzen 5 / Xeon..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الذاكرة العشوائية (RAM)</label>
                  <input
                    type="text"
                    value={formData.ram || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, ram: e.target.value }))}
                    placeholder="8GB / 16GB / 32GB DDR4..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">وحدة التخزين / القرص الصلب</label>
                  <input
                    type="text"
                    value={formData.storage || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, storage: e.target.value }))}
                    placeholder="512GB SSD / 1TB HDD..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">صندوق الجهاز (Case / Chassis)</label>
                  <input
                    type="text"
                    value={formData.caseType || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, caseType: e.target.value }))}
                    placeholder="Tower / Mini PC / Rackmount..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">كبلات وتوصيلات الشبكة</label>
                  <input
                    type="text"
                    value={formData.networkCables || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, networkCables: e.target.value }))}
                    placeholder="CAT6 / Fiber / RJ45..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 pb-1 border-b border-slate-100 mb-2">
                  <h4 className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">بيانات العهدة والتوريد</h4>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الرقم التسلسلي المصنعي <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={(e) => handleSerialNumberChange(e.target.value)}
                    placeholder="SN-..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">الباركود الداخلي</label>
                    <button
                      type="button"
                      onClick={startBarcodeScanner}
                      className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition"
                    >
                      <Camera className="w-3 h-3" />
                      <span>مسح بالكاميرا</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = (e.currentTarget.value || '').trim();
                        if (value) setFormData(prev => ({ ...prev, barcode: value }));
                      }
                    }}
                    placeholder="وجّه قارئ USB/Bluetooth إلى هذا الحقل ثم امسح الرمز"
                    aria-label="الباركود الداخلي، جاهز لاستقبال قارئ الباركود"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                  <p className="mt-1 text-[10px] text-slate-500">
                    يدعم قارئات USB وBluetooth التي تعمل كلوحة مفاتيح؛ ضع المؤشر هنا ثم امسح الملصق. لا يتغير الرقم التسلسلي عند المسح.
                  </p>
                </div>

                {barcodeScanTarget === 'form' && (
                  <div className="sm:col-span-2 p-3 bg-slate-900 border border-blue-500 rounded-xl space-y-2">
                    <div className="text-xs text-white text-center font-semibold mb-2">وجه كاميرا الهاتف نحو باركود أو QR الجهاز</div>
                    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-white p-2">
                      <div id={scannerElementId.current} />
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={stopBarcodeScanner}
                        className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg text-xs"
                      >
                        إلغاء المسح
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم العهدة المالي</label>
                  <input
                    type="text"
                    value={formData.assetNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, assetNumber: e.target.value }))}
                    placeholder="MET-IT-2024-001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الشراء / التوريد</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">مصدر التوريد</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="الشركة الموردة..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحالة الفنية للجهاز</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as DeviceCondition }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    {conditions.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">حالة التواجد</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as DeviceStatus }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    {statuses.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الموقع الفعلي</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="مستودع دائرة الاتصالات / مكتب 4..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الموظف المسؤول (المستلم)</label>
                  <input
                    type="text"
                    value={formData.assignedEmployee || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedEmployee: e.target.value }))}
                    placeholder="اسم الموظف"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم أو الشعبة التابع لها</label>
                  <input
                    type="text"
                    value={formData.assignedStationOrDept || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedStationOrDept: e.target.value }))}
                    placeholder="دائرة الاتصالات..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ التسليم</label>
                  <input
                    type="date"
                    value={formData.deliveryDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ انتهاء الضمان</label>
                  <input
                    type="date"
                    value={formData.warrantyEnd || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, warrantyEnd: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">الملاحظات والمواصفات الفنية</label>
                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="ملاحظات الصيانة، المعالج، الذاكرة، الأقراص..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {(isHeadOfDept || currentRole === 'director') && (
                  <div className="sm:col-span-2 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-xs text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900 text-sm">مراجعة واعتماد رئيس الدائرة</h4>
                        <p className="text-[10px] text-emerald-700">تفعيل هذا الخيار يعني أن المواصفات التقنية دقيقة وتمت مراجعتها رسمياً</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.isVerified || false}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          isVerified: e.target.checked,
                          verifiedBy: e.target.checked ? currentUser?.displayName || 'رئيس الدائرة' : undefined
                        }))}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>المرفقات وتصوير الجهاز</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>فتح الكاميرا</span>
                    </button>

                    <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer font-bold">
                      <Upload className="w-3.5 h-3.5" />
                      <span>إرفاق ملف / صورة</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {isCapturingCamera && (
                  <div className="p-3 bg-slate-900 border border-blue-500 rounded-xl space-y-2">
                    <div className="relative aspect-video max-w-sm mx-auto overflow-hidden rounded-lg bg-black">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg shadow-xs"
                      >
                        التقاط الصورة
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}

                {formData.attachments && formData.attachments.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    {formData.attachments.map((att) => (
                      <div key={att.id} className="relative group p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                        {att.type === 'image' ? (
                          <img src={att.dataUrl} alt={att.name} className="w-full h-20 object-cover rounded mb-1" />
                        ) : (
                          <div className="w-full h-20 flex items-center justify-center bg-slate-100 rounded mb-1">
                            <FileText className="w-8 h-8 text-blue-600" />
                          </div>
                        )}
                        <div className="text-[10px] text-slate-600 truncate">{att.name}</div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="absolute -top-1 -right-1 p-1 bg-rose-600 text-white rounded-full shadow"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  {editingDevice ? 'حفظ التعديلات' : 'تسجيل الجهاز'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
