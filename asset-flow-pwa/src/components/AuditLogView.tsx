import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Clock, 
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <span>سجل التدقيق الأمني والرقابة الإدارية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            سجل دائم غير قابل للتعديل يوثق كافة العمليات، الإدخالات، التعديلات، الحذف والطباعة لحماية السجلات الرسمية
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>السجل مشفر ومحمي في قاعدة البيانات</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="بحث في سجل العمليات، الإجراء، المنفذ، التفاصيل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <span className="text-xs text-slate-500 font-bold">
          {filteredLogs.length} سجل مقيد
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-3">التوقيت والتاريخ</th>
                <th className="py-3 px-3">الإجراء المنفذ</th>
                <th className="py-3 px-3">الكيان / السجل</th>
                <th className="py-3 px-3">الرقم المرجعي</th>
                <th className="py-3 px-3">المستخدم المنفذ</th>
                <th className="py-3 px-3">تفاصيل العملية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold">لا توجد سجلات تدقيق سابقة</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('ar-SY')}
                    </td>
                    <td className="py-3 px-3 font-sans font-bold text-blue-700">
                      {log.action}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-800 font-medium">
                      {log.entity}
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-700">
                      {log.entityId}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-700">
                      <div className="font-bold">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.userEmail}</div>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-600 max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
