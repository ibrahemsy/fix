import React, { useState } from 'react';
import { 
  Radio, 
  Wifi, 
  Network, 
  Globe, 
  Server, 
  Hash, 
  Phone, 
  MapPin, 
  Plus, 
  X, 
  Save, 
  Trash2, 
  Database,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TelecomNetworkInfo, PhoneDirectoryEntry, NetworkPortMapping, Device } from '../types';

export const TelecomView: React.FC = () => {
  const { 
    devices, 
    saveDevice, 
    phoneDirectory, 
    savePhoneEntry, 
    deletePhoneEntry,
    telecomNetworks,
    saveTelecomNetwork,
    deleteTelecomNetwork,
    currentRole 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'networks' | 'switches' | 'phone_directory'>('networks');

  // Network Infrastructure Management
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<TelecomNetworkInfo | null>(null);
  const emptyNetwork: TelecomNetworkInfo = {
    id: `net_${Date.now()}`,
    name: '',
    type: 'شبكة داخلية',
    ipRange: '',
    gateway: '',
    bandwidth: '',
    location: '',
    status: 'active',
  };
  const [netFormData, setNetFormData] = useState<TelecomNetworkInfo>(emptyNetwork);

  const handleSaveNetwork = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveTelecomNetwork(netFormData);
    setIsNetworkModalOpen(false);
  };

  // Switch Port Mapping
  const switches = devices.filter(d => d.category === 'switch' || d.category === 'telecom_gear');
  const [selectedSwitchId, setSelectedSwitchId] = useState<string | null>(switches[0]?.id || null);
  const selectedSwitch = switches.find(s => s.id === selectedSwitchId);

  const [isMappingMode, setIsMappingMode] = useState(false);
  const [editingPort, setEditingPort] = useState<NetworkPortMapping | null>(null);
  const [portFormData, setPortFormData] = useState<NetworkPortMapping>({
    portNumber: '',
    pointNumber: '',
    officeLocation: '',
  });

  const handleSavePortMapping = async () => {
    if (!selectedSwitch) return;
    const mappings = [...(selectedSwitch.portMappings || [])];
    const idx = mappings.findIndex(m => m.portNumber === portFormData.portNumber);
    
    if (idx >= 0) {
      mappings[idx] = portFormData;
    } else {
      mappings.push(portFormData);
    }
    
    await saveDevice({ ...selectedSwitch, portMappings: mappings });
    setIsMappingMode(false);
  };

  // Phone Directory Management
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<PhoneDirectoryEntry | null>(null);
  const emptyPhone: PhoneDirectoryEntry = {
    id: `ph_${Date.now()}`,
    phoneNumber: '',
    employeeName: '',
    department: '',
    officeLocation: '',
    pbxPortNumber: '',
    status: 'active',
  };
  const [phoneFormData, setPhoneFormData] = useState<PhoneDirectoryEntry>(emptyPhone);

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePhoneEntry(phoneFormData);
    setIsPhoneModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600" />
            <span>البنية التحتية والشبكات والاتصالات</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            إدارة الخوادم، توزيع منافذ السويتشات، ودليل هواتف المديرية والمقسم
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
          <button
            onClick={() => setActiveSubTab('networks')}
            className={`px-3 py-2 rounded-lg transition ${
              activeSubTab === 'networks' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الشبكات والخوادم
          </button>
          <button
            onClick={() => setActiveSubTab('switches')}
            className={`px-3 py-2 rounded-lg transition ${
              activeSubTab === 'switches' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            توزيع السويتشات والمنافذ
          </button>
          <button
            onClick={() => setActiveSubTab('phone_directory')}
            className={`px-3 py-2 rounded-lg transition ${
              activeSubTab === 'phone_directory' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            دليل الهواتف والمقسم
          </button>
        </div>
      </div>

      {/* NETWORKS & SERVERS TAB */}
      {activeSubTab === 'networks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span>خطوط الإنترنت والشبكات والخوادم المركزية</span>
            </h3>
            <button
              onClick={() => {
                setNetFormData(emptyNetwork);
                setEditingNetwork(null);
                setIsNetworkModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة شبكة / خادم</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {telecomNetworks.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                <Globe className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold">لا يوجد بيانات مسجلة للشبكات حالياً</p>
              </div>
            ) : (
              telecomNetworks.map((net) => (
                <div key={net.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                        {net.type.includes('خادم') ? <Server className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{net.name}</h4>
                        <span className="text-[10px] text-slate-500 font-bold">{net.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => { setNetFormData(net); setEditingNetwork(net); setIsNetworkModalOpen(true); }} className="p-1.5 rounded-lg bg-slate-100 text-blue-600 hover:bg-blue-50"><Save className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { if(confirm('حذف الشبكة؟')) deleteTelecomNetwork(net.id); }} className="p-1.5 rounded-lg bg-slate-100 text-rose-600 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs border-t border-slate-50 pt-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">الموقع:</span>
                      <span className="font-bold text-slate-800">{net.location}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">العنوان / IP:</span>
                      <span className="font-mono font-bold text-blue-700">{net.ipRange || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">البوابة / التردد:</span>
                      <span className="font-mono font-bold text-slate-600">{net.gateway || net.frequency || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">السعة / السرعة:</span>
                      <span className="font-bold text-emerald-700">{net.bandwidth || '-'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SWITCH PORTS MAPPING TAB */}
      {activeSubTab === 'switches' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">توزيع منافذ السويتشات (Port Mapping)</h3>
                  <p className="text-[11px] text-slate-500 font-medium">ربط منافذ السويتش بنقاط الشبكة في المكاتب</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 whitespace-nowrap">اختر السويتش:</label>
                <select
                  value={selectedSwitchId || ''}
                  onChange={(e) => setSelectedSwitchId(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-700 focus:ring-2 ring-blue-500/20"
                >
                  <option value="">-- اختر جهازاً من السجل --</option>
                  {switches.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.serialNumber})</option>
                  ))}
                </select>
              </div>
            </div>

            {!selectedSwitch ? (
              <div className="py-20 text-center text-slate-400">
                <Network className="w-16 h-16 mx-auto mb-3 opacity-10" />
                <p className="text-sm font-bold">يرجى اختيار سويتش أو جهاز شبكي لعرض توزيع منافذه</p>
                <p className="text-xs mt-1">تأكد من إضافة السويتشات أولاً في سجل الأجهزة وتحديد عدد منافذها</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {Array.from({ length: selectedSwitch.portsCount || 24 }, (_, i) => {
                    const portNum = (i + 1).toString();
                    const mapping = selectedSwitch.portMappings?.find(m => m.portNumber === portNum);
                    return (
                      <button
                        key={portNum}
                        onClick={() => {
                          setPortFormData(mapping || { portNumber: portNum, pointNumber: '', officeLocation: '' });
                          setIsMappingMode(true);
                        }}
                        className={`p-3 rounded-xl border-2 transition text-center group relative ${
                          mapping 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-300'
                        }`}
                      >
                        <Hash className={`w-4 h-4 mx-auto mb-1 ${mapping ? 'text-blue-600' : 'text-slate-300'}`} />
                        <div className="text-xs font-black">{portNum}</div>
                        {mapping && (
                          <div className="mt-1">
                            <div className="text-[9px] font-bold truncate leading-tight">{mapping.pointNumber}</div>
                            <div className="text-[8px] opacity-70 truncate">{mapping.officeLocation}</div>
                          </div>
                        )}
                        <div className="absolute -top-2 -right-1 opacity-0 group-hover:opacity-100 transition">
                          <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg"><Plus className="w-2 h-2" /></div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHONE DIRECTORY TAB */}
      {activeSubTab === 'phone_directory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>دليل الهواتف الداخلية وتوزيع المقسم</span>
            </h3>
            <button
              onClick={() => {
                setPhoneFormData(emptyPhone);
                setEditingPhone(null);
                setIsPhoneModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة رقم هاتف</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">رقم الهاتف</th>
                    <th className="py-3 px-4">الاسم / المسمى</th>
                    <th className="py-3 px-4">القسم / الدائرة</th>
                    <th className="py-3 px-4">الموقع (المكتب)</th>
                    <th className="py-3 px-4">منفذ المقسم (PBX)</th>
                    <th className="py-3 px-4">رقم النقطة</th>
                    <th className="py-3 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {phoneDirectory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">لا توجد أرقام هواتف مسجلة حالياً</td>
                    </tr>
                  ) : (
                    phoneDirectory.map((ph) => (
                      <tr key={ph.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-black text-blue-700 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            {ph.phoneNumber}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{ph.employeeName}</td>
                        <td className="py-3 px-4 text-slate-600">{ph.department}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{ph.officeLocation}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-100">
                            Port {ph.pbxPortNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{ph.pointNumber || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => { setPhoneFormData(ph); setEditingPhone(ph); setIsPhoneModalOpen(true); }} className="p-1.5 rounded-lg bg-slate-100 text-blue-600 hover:bg-blue-50"><Save className="w-4 h-4" /></button>
                            <button onClick={() => { if(confirm('حذف الرقم؟')) deletePhoneEntry(ph.id); }} className="p-1.5 rounded-lg bg-slate-100 text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PORT MAPPING MODAL */}
      {isMappingMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
              <h4 className="font-bold flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span>برمجة وتوزيع المنفذ رقم {portFormData.portNumber}</span>
              </h4>
              <button onClick={() => setIsMappingMode(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم النقطة في المكتب (Wall Socket)</label>
                <input
                  type="text"
                  value={portFormData.pointNumber}
                  onChange={(e) => setPortFormData(prev => ({ ...prev, pointNumber: e.target.value }))}
                  placeholder="مثلاً: IT-04 / SW-A1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">موقع المكتب / اسم الموظف</label>
                <input
                  type="text"
                  value={portFormData.officeLocation}
                  onChange={(e) => setPortFormData(prev => ({ ...prev, officeLocation: e.target.value }))}
                  placeholder="مثلاً: الطابق الثاني - مكتب المدير"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                <textarea
                  value={portFormData.notes || ''}
                  onChange={(e) => setPortFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSavePortMapping} className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-xs hover:bg-blue-700 transition">حفظ التوزيع</button>
                <button 
                  onClick={async () => {
                    if (!selectedSwitch) return;
                    const mappings = (selectedSwitch.portMappings || []).filter(m => m.portNumber !== portFormData.portNumber);
                    await saveDevice({ ...selectedSwitch, portMappings: mappings });
                    setIsMappingMode(false);
                  }}
                  className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs border border-rose-100"
                >
                  حذف الربط
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHONE MODAL */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form onSubmit={handleSavePhone} className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <span>{editingPhone ? 'تعديل بيانات هاتف' : 'إضافة رقم هاتف جديد للدليل'}</span>
              </h4>
              <button type="button" onClick={() => setIsPhoneModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف الداخلي</label>
                <input
                  required
                  type="text"
                  value={phoneFormData.phoneNumber}
                  onChange={(e) => setPhoneFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموظف / صاحب المكتب</label>
                <input
                  required
                  type="text"
                  value={phoneFormData.employeeName}
                  onChange={(e) => setPhoneFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الدائرة / القسم</label>
                <input
                  type="text"
                  value={phoneFormData.department}
                  onChange={(e) => setPhoneFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">موقع المكتب</label>
                <input
                  type="text"
                  value={phoneFormData.officeLocation}
                  onChange={(e) => setPhoneFormData(prev => ({ ...prev, officeLocation: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم المنفذ في المقسم (PBX)</label>
                <input
                  type="text"
                  value={phoneFormData.pbxPortNumber}
                  onChange={(e) => setPhoneFormData(prev => ({ ...prev, pbxPortNumber: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم نقطة الهاتف بالمكتب</label>
                <input
                  type="text"
                  value={phoneFormData.pointNumber || ''}
                  onChange={(e) => setPhoneFormData(prev => ({ ...prev, pointNumber: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div className="sm:col-span-2 pt-2">
                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition">حفظ بيانات الهاتف</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* NETWORK MODAL */}
      {isNetworkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form onSubmit={handleSaveNetwork} className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span>{editingNetwork ? 'تعديل بيانات شبكة/خادم' : 'إضافة شبكة أو خادم جديد'}</span>
              </h4>
              <button type="button" onClick={() => setIsNetworkModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الشبكة / الخادم</label>
                <input
                  required
                  type="text"
                  value={netFormData.name}
                  onChange={(e) => setNetFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">النوع</label>
                <select
                  value={netFormData.type}
                  onChange={(e) => setNetFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="شبكة داخلية">شبكة داخلية</option>
                  <option value="خادم (Server)">خادم (Server)</option>
                  <option value="خط إنترنت رئيسي">خط إنترنت رئيسي</option>
                  <option value="شبكة واسعة">شبكة واسعة</option>
                  <option value="اتصالات لاسلكية">اتصالات لاسلكية</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نطاق IP / العنوان</label>
                <input
                  type="text"
                  value={netFormData.ipRange || ''}
                  onChange={(e) => setNetFormData(prev => ({ ...prev, ipRange: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الموقع</label>
                <input
                  type="text"
                  value={netFormData.location}
                  onChange={(e) => setNetFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">السرعة / السعة</label>
                <input
                  type="text"
                  value={netFormData.bandwidth || ''}
                  onChange={(e) => setNetFormData(prev => ({ ...prev, bandwidth: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="sm:col-span-2 pt-2">
                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition">حفظ البيانات</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
