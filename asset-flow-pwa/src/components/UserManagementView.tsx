import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  ShieldAlert, 
  Key, 
  ShieldCheck,
  Mail,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRoleType, UserProfile } from '../types';

export const UserManagementView: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    headEmail, 
    isHeadOfDept, 
    updateHeadEmail, 
    logAuditAction,
    setActiveTab 
  } = useApp();

  const [newEmailInput, setNewEmailInput] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const roleDefinitions: { key: UserRoleType; name: string; desc: string; color: string }[] = [
    { 
      key: 'director', 
      name: 'رئيس دائرة الاتصالات (صلاحيات الاعتماد حصراً)', 
      desc: 'المصادقة والإدارة الكاملة، اعتماد كافة الإضافات والتعديلات وبطاقات العهدة والشبكات',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' 
    },
    { 
      key: 'technician', 
      name: 'فني اتصالات وشبكات', 
      desc: 'تسجيل الأجهزة، إعداد البطاقات، رسم خارطة الربط الشبكي، وإرسال طلبات الاعتماد لرئيس الدائرة',
      color: 'bg-blue-50 text-blue-700 border-blue-200 font-bold' 
    },
  ];

  const handleHeadEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim()) return;
    await updateHeadEmail(newEmailInput.trim());
    setIsEditingEmail(false);
    setNewEmailInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>نظام التحكم بالهيكلية وصلاحيات دائرة الاتصالات</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تأكيد بريد رئيس الدائرة المعتمد وإدارة طلبات اعتماد الفنيين والموظفين
          </p>
        </div>

        <button
          onClick={() => setActiveTab('approvals')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>سجل طلبات الاعتماد</span>
        </button>
      </div>

      {/* Head of Department Status Card */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-600 text-white shadow-lg">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs text-blue-300 font-bold uppercase tracking-wider">رئيس دائرة الاتصالات المعيّن والنظامي:</div>
              <h3 className="text-xl font-mono font-black text-white mt-0.5">{headEmail}</h3>
              <p className="text-xs text-slate-300 mt-1">
                {isHeadOfDept 
                  ? '✓ أنت مسجل حالياً بريد رئيس الدائرة ويحق لك المصادقة والاعتماد حصراً.'
                  : 'جميع التعديلات المدخلة من حسابات أخرى تتطلب موافقة هذا البريد حصراً.'}
              </p>
            </div>
          </div>

          {isHeadOfDept && (
            <div>
              {!isEditingEmail ? (
                <button
                  onClick={() => {
                    setNewEmailInput(headEmail);
                    setIsEditingEmail(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition whitespace-nowrap"
                >
                  تعديل بريد رئيس الدائرة
                </button>
              ) : (
                <form onSubmit={handleHeadEmailChange} className="flex items-center gap-2">
                  <input
                    type="email"
                    required
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-600 text-white text-xs font-mono font-bold rounded-lg"
                  />
                  <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg">حفظ</button>
                  <button type="button" onClick={() => setIsEditingEmail(false)} className="px-2 py-1.5 text-slate-300 text-xs">إلغاء</button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Role Definitions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">الهيكل التنظيمي وصلاحيات الدائرة</h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
            صفة حسابك الحالي: {isHeadOfDept ? 'رئيس دائرة الاتصالات (صلاحية الاعتماد)' : 'فني / موظف بالدائرة'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roleDefinitions.map((role) => (
            <div
              key={role.key}
              className={`p-4 rounded-xl border text-right transition text-xs flex flex-col justify-between ${role.color}`}
            >
              <div>
                <div className="font-bold text-slate-900 text-sm mb-1">{role.name}</div>
                <div className="text-xs text-slate-600 leading-relaxed">{role.desc}</div>
              </div>
              {(isHeadOfDept && role.key === 'director') && (
                <div className="mt-3 text-[11px] font-bold text-rose-700 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>الصلاحية النشطة بحسابك الحالي</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
