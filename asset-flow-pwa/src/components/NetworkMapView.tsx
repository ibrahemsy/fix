import React, { useState, useMemo } from 'react';
import { 
  Network, 
  Server, 
  Laptop, 
  MapPin, 
  Hash, 
  ArrowRightLeft, 
  Plus, 
  X,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Device, NetworkPortMapping } from '../types';

export const NetworkMapView: React.FC = () => {
  const { devices, saveDevice } = useApp();

  const [zoom, setZoom] = useState(1);
  const [selectedSwitchId, setSelectedSwitchId] = useState<string | null>(null);
  const [activeMappingPort, setActiveMappingPort] = useState<string | null>(null);

  // Filter switches and routers as infrastructure nodes
  const infraNodes = useMemo(() => 
    devices.filter(d => d.category === 'switch' || d.category === 'router' || d.category === 'telecom_gear'),
    [devices]
  );

  // Filter possible end-nodes (Desktops, Laptops, Printers, Servers)
  const endNodes = useMemo(() => 
    devices.filter(d => ['desktop', 'laptop', 'printer', 'server', 'telephony'].includes(d.category)),
    [devices]
  );

  const selectedSwitch = useMemo(() => 
    infraNodes.find(n => n.id === selectedSwitchId),
    [infraNodes, selectedSwitchId]
  );

  const handleConnectPort = async (portNum: string, node: Device) => {
    if (!selectedSwitch) return;

    const newMapping: NetworkPortMapping = {
      portNumber: portNum,
      pointNumber: node.assetNumber || `Node-${node.serialNumber.slice(-4)}`,
      officeLocation: node.location,
      connectedDevice: node.name,
      notes: `توصيل فيزيائي للجهاز: ${node.manufacturer} ${node.model}`
    };

    const currentMappings = [...(selectedSwitch.portMappings || [])];
    const existingIdx = currentMappings.findIndex(m => m.portNumber === portNum);

    if (existingIdx >= 0) {
      currentMappings[existingIdx] = newMapping;
    } else {
      currentMappings.push(newMapping);
    }

    await saveDevice({
      ...selectedSwitch,
      portMappings: currentMappings
    });

    setActiveMappingPort(null);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            <span>خارطة توزيع الشبكة والربط الفيزيائي</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            توثيق بصري لتوصيلات الكابلات من السويتشات المركزية إلى نقاط العمل والمكاتب
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} className="p-1.5 hover:bg-white rounded-lg transition"><ZoomOut className="w-4 h-4 text-slate-600" /></button>
            <span className="px-3 text-[11px] font-bold text-slate-700 font-mono">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} className="p-1.5 hover:bg-white rounded-lg transition"><ZoomIn className="w-4 h-4 text-slate-600" /></button>
          </div>
          <button className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600 transition"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 min-h-[500px] grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Infrastructure Selection */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)] no-scrollbar">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">أجهزة التوزيع (Infrastructure)</h3>
          {infraNodes.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-[11px] font-bold">لا توجد سويتشات مسجلة في السجل</p>
            </div>
          ) : (
            infraNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => {
                  setSelectedSwitchId(node.id);
                  setActiveMappingPort(null);
                }}
                className={`w-full p-4 rounded-2xl border-2 text-right transition group ${
                  selectedSwitchId === node.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition ${selectedSwitchId === node.id ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                    <Server className="w-5 h-5" />
                  </div>
                  <div className="flex-1 truncate">
                    <div className="font-bold text-sm truncate">{node.name}</div>
                    <div className={`text-[10px] font-mono ${selectedSwitchId === node.id ? 'text-blue-100' : 'text-slate-500'}`}>
                      {node.serialNumber} • {node.portsCount || 24} منفذ
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Center: Visual Map Area */}
        <div className="lg:col-span-3 bg-slate-50 rounded-3xl border-2 border-slate-200 relative overflow-hidden flex flex-col">
          {!selectedSwitch ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <Network className="w-12 h-12 text-slate-200" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">يرجى اختيار جهاز بنية تحتية لبدء الرسم</h4>
                  <p className="text-xs max-w-xs mx-auto mt-2">اختر سويتش أو راوتر من القائمة الجانبية لعرض وتوثيق خريطة التوصيلات الخاصة به</p>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Switch Visual Representation */}
              <div className="p-6 bg-white border-b border-slate-200 shrink-0">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg">
                      <Server className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{selectedSwitch.name}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {selectedSwitch.location}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                          <Hash className="w-3 h-3" /> {selectedSwitch.portsCount || 24} منفذ مادي
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    تم توثيق {(selectedSwitch.portMappings?.length || 0)} منافذ
                  </div>
                </div>

                {/* Ports Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2">
                  {Array.from({ length: selectedSwitch.portsCount || 24 }, (_, i) => {
                    const portNum = (i + 1).toString();
                    const mapping = selectedSwitch.portMappings?.find(m => m.portNumber === portNum);
                    const isActive = activeMappingPort === portNum;
                    
                    return (
                      <button
                        key={portNum}
                        onClick={() => setActiveMappingPort(isActive ? null : portNum)}
                        className={`aspect-square rounded-lg border-2 transition-all flex flex-col items-center justify-center relative ${
                          isActive 
                            ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg z-10' 
                            : mapping 
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700 hover:bg-indigo-100' 
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-400 hover:bg-white'
                        }`}
                      >
                        <span className="text-[10px] font-black">{portNum}</span>
                        {mapping && !isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1 animate-pulse"></div>}
                        {isActive && <div className="w-2 h-2 rounded-full bg-white mt-1"></div>}
                        
                        {/* Connection Line Indicator (Simplified CSS) */}
                        {mapping && (
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-indigo-200/50 pointer-events-none hidden lg:block"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Connected Nodes Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <AnimatePresence mode="wait">
                  {activeMappingPort ? (
                    <motion.div
                      key="mapping-selector"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-blue-800 flex items-center gap-2">
                          <ArrowRightLeft className="w-4 h-4" />
                          <span>اختر الجهاز المرتبط بالمنفذ رقم {activeMappingPort}</span>
                        </h4>
                        <button onClick={() => setActiveMappingPort(null)} className="text-slate-400 hover:text-rose-600 transition">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {endNodes.map((node) => {
                          const isAlreadyConnected = devices.some(d => d.portMappings?.some(m => m.connectedDevice === node.name));
                          
                          return (
                            <button
                              key={node.id}
                              onClick={() => handleConnectPort(activeMappingPort, node)}
                              className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition text-right group"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 transition">
                                  {node.category === 'laptop' ? <Laptop className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 truncate">
                                  <div className="text-xs font-bold text-slate-800 truncate">{node.name}</div>
                                  <div className="text-[10px] text-slate-500 font-medium truncate">{node.location}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mappings-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {selectedSwitch.portMappings?.map((mapping) => (
                        <div key={mapping.portNumber} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500"></div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded">PORT {mapping.portNumber}</span>
                            <span className="text-[10px] font-bold text-slate-400">نقطة: {mapping.pointNumber}</span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 mb-1">{mapping.connectedDevice}</h5>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <MapPin className="w-3 h-3" />
                            <span>{mapping.officeLocation}</span>
                          </div>

                          <button 
                            onClick={async () => {
                              const newMappings = selectedSwitch.portMappings?.filter(m => m.portNumber !== mapping.portNumber) || [];
                              await saveDevice({ ...selectedSwitch, portMappings: newMappings });
                            }}
                            className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-rose-50 text-rose-600 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {(!selectedSwitch.portMappings || selectedSwitch.portMappings.length === 0) && (
                        <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                            <Plus className="w-6 h-6 text-slate-200" />
                          </div>
                          <p className="text-xs font-bold">لا توجد توصيلات موثقة لهذا السويتش حالياً</p>
                          <p className="text-[10px] mt-1">انقر على أي منفذ في السويتش بالأعلى لبدء ربطه بنقطة عمل</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
