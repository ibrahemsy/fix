import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Mail, 
  UserCheck, 
  FileText, 
  Server, 
  Radio, 
  Phone, 
  AlertCircle,
  Edit3,
  Trash2,
  PlusCircle,
  KeyRound
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PendingRequest } from '../types';

export const ApprovalRequestsView: React.FC = () => {
  const { 
    currentUser, 
    headEmail, 
    isHeadOfDept, 
    pendingRequests, 
    approvePendingRequest, 
    rejectPendingRequest,
    updateHeadEmail,
    requestJoinDepartment 
  } = useApp();

  const [newHeadEmail, setNewHeadEmail] = useState('');
  const [isEditingHeadEmail, setIsEditingHeadEmail] = useState(false);

  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  // Join Request State for non-head
  const [roleRequested, setRoleRequested] = useState('فني شبكات واتصالات');
  const [joinNotes, setJoinNotes] = useState('');

  const filteredRequests = pendingRequests.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const pendingCount = pendingRequests.filter(r => r.status === 'pending').length;

  const handleHeadEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeadEmail.trim()) return;
    await updateHeadEmail(newHeadEmail.trim());
    setIsEditingHeadEmail(false);
    setNewHeadEmail('');
  };

  const handleConfirmReject = async () => {
    if (!rejectionModalId) return;
    await rejectPendingRequest(rejectionModalId, rejectionReason);
    setRejectionModalId(null);
    setRejectionReason('');
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestJoinDepartment(roleRequested, joinNotes);
    setJoinNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-blue-900 text-white border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>نظام الصلاحيات والاعتماد المركزي</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            طلبات الاعتماد ومصادقة رئيس الدائرة
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            لا تضاف أي أجهزة أو تعديلات إلى قاعدة البيانات الرسمية إلا بعد مصادقة وموافقة رئيس الدائرة حصراً.
          </p>
        </div>

        {/* Head Email Verification Badge */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-left flex items-center gap-3 shrink-0">
          <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="text-right">
            <div className="text-[10px] text-blue-200 font-bold">رئيس دائرة الاتصالات المعتمد:</div>
            <div className="font-mono font-black text-sm text-white">{headEmail}</div>
            <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">
              {isHeadOfDept ? '✓ أنت مسجل كـ رئيس الدائرة الحالي' : 'مستلِم الطلبات والاعتمادات'}
            </div>
          </div>
        </div>
      </div>

      {/* Head Email Management Box (Only Visible/Editable by Head of Department) */}
      {isHeadOfDept && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">إدارة البريد الإلكتروني لرئيس الدائرة</h3>
              <p className="text-xs text-slate-500">
                البريد الإلكتروني المخصص لرئيس دائرة الاتصالات الذي يملك صلاحية الاعتماد حصراً
              </p>
            </div>
          </div>

          {!isEditingHeadEmail ? (
            <button
              onClick={() => {
                setNewHeadEmail(headEmail);
                setIsEditingHeadEmail(true);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition whitespace-nowrap"
            >
              تغيير بريد رئيس الدائرة
            </button>
          ) : (
            <form onSubmit={handleHeadEmailSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                required
                value={newHeadEmail}
                onChange={(e) => setNewHeadEmail(e.target.value)}
                placeholder="ferasnatof@gmail.com"
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition whitespace-nowrap"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setIsEditingHeadEmail(false)}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold whitespace-nowrap"
              >
                إلغاء
              </button>
            </form>
          )}
        </div>
      )}

      {/* Non-Head User Notice & Join Request Form */}
      {!isHeadOfDept && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-amber-950">تنبيه صلاحيات الموظفين والفنيين</h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                حسابك الحالي ({currentUser?.email}) يعمل بصلاحيات العرض وإرسال طلبات الإضافة والتعديل. جميع إدخالاتك للأجهزة، البطاقات، والصيانة ترسل آلياً كـ <span className="font-bold">"طلب اعتماد"</span> إلى رئيس دائرة الاتصالات (<span className="font-mono font-bold">{headEmail}</span>) ولن تظهر في سجلات الدائرة الرسمية إلا بعد موافقته.
              </p>
            </div>
          </div>

          <form onSubmit={handleJoinSubmit} className="bg-white p-4 rounded-xl border border-amber-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-800">إرسال طلب انضمام / اعتماد حساب جديد لرئيس الدائرة:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الصفة المطلوب الاعتماد بها</label>
                <select
                  value={roleRequested}
                  onChange={(e) => setRoleRequested(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="فني اتصالات وشبكات">فني اتصالات وشبكات</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات / تبرير الطلب</label>
                <input
                  type="text"
                  value={joinNotes}
                  onChange={(e) => setJoinNotes(e.target.value)}
                  placeholder="اسم الشعبة، رقم الهاتف الداخلي..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
            >
              تقديم طلب الاعتماد والانضمام
            </button>
          </form>
        </div>
      )}

      {/* Main Approval Requests List Header & Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">سجل طلبات التعديل والاعتماد</h3>
            <p className="text-xs text-slate-500">
              مراجعة ومصادقة الطلبات المرسلة من فنيي وموظفي الدائرة
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              filterStatus === 'pending' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>طلبات قيد الانتظار</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'approved' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الطلبات المعتمدة
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'rejected' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الطلبات المرفوضة
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            كافة الطلبات ({pendingRequests.length})
          </button>
        </div>
      </div>

      {/* Requests Table / Cards */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm font-bold">لا توجد طلبات في هذه الفئة حالياً</p>
            <p className="text-xs mt-1">جميع طلبات الإضافة والتعديل تمت معالجتها أو لم يتم تقديم طلبات جديدة</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div 
              key={req.id} 
              className={`bg-white border rounded-2xl p-5 shadow-xs transition space-y-4 ${
                req.status === 'pending' ? 'border-amber-300 ring-2 ring-amber-500/10' :
                req.status === 'approved' ? 'border-emerald-200' : 'border-rose-200 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {req.actionType.includes('device') ? <Server className="w-5 h-5" /> :
                     req.actionType.includes('custody') ? <FileText className="w-5 h-5" /> :
                     req.actionType.includes('phone') ? <Phone className="w-5 h-5" /> :
                     req.actionType.includes('network') ? <Radio className="w-5 h-5" /> :
                     <UserCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{req.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>المرسِل: <span className="font-bold text-slate-800">{req.requesterName}</span> ({req.requesterEmail})</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{req.createdAt.replace('T', ' ').substring(0, 16)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    req.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    req.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {req.status === 'pending' ? 'بانتظار موافقة رئيس الدائرة' :
                     req.status === 'approved' ? 'تم الاعتماد والتسجيل' : 'مرفوض إدارياً'}
                  </span>
                </div>
              </div>

              {/* Request Details & Data Payload */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800">{req.details}</div>
                
                {req.payload && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 overflow-x-auto max-h-36">
                    {req.payload.name && <div>• الاسم: {req.payload.name}</div>}
                    {req.payload.serialNumber && <div>• الرقم التسلسلي: {req.payload.serialNumber}</div>}
                    {req.payload.employeeName && <div>• الموظف: {req.payload.employeeName}</div>}
                    {req.payload.cardNumber && <div>• رقم البطاقة: {req.payload.cardNumber}</div>}
                    {req.payload.location && <div>• الموقع: {req.payload.location}</div>}
                    {req.payload.condition && <div>• الحالة الفنية: {req.payload.condition}</div>}
                  </div>
                )}

                {req.rejectionReason && (
                  <div className="text-rose-700 font-bold pt-1 border-t border-rose-100">
                    سبب الرفض: {req.rejectionReason}
                  </div>
                )}
              </div>

              {/* Action Buttons for Head of Department */}
              {isHeadOfDept && req.status === 'pending' && (
                <div className="flex items-center gap-3 pt-2 justify-end">
                  <button
                    onClick={() => approvePendingRequest(req)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد وموافق حصراً (Approve)</span>
                  </button>

                  <button
                    onClick={() => setRejectionModalId(req.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>رفض الطلب</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Rejection Modal */}
      {rejectionModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-rose-600">
              <XCircle className="w-5 h-5" />
              <span>رفض طلب التعديل / الإضافة</span>
            </h4>
            <p className="text-xs text-slate-600">
              يرجى إدخال سبب الرفض لإعلام الموظف المتقدم بالطلب:
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثلاً: عدم استيفاء المواصفات المعتمدة، نقص في البيانات التسلسلية..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition"
              >
                تأكيد الرفض
              </button>
              <button
                onClick={() => setRejectionModalId(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
