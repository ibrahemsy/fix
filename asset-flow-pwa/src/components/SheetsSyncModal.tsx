import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  LogIn,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportInventoryToGoogleSheets } from '../services/sheetsService';

interface SheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SheetsSyncModal: React.FC<SheetsSyncModalProps> = ({ isOpen, onClose }) => {
  const { 
    devices, 
    custodyCards, 
    currentUser, 
    loginWithGoogle, 
    googleToken,
    logAuditAction 
  } = useApp();

  const [isExporting, setIsExporting] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    setCreatedUrl(null);
    try {
      const result = await exportInventoryToGoogleSheets(
        'سجل الحواسيب والعهد والتجهيزات المكتبية',
        devices,
        custodyCards
      );
      setCreatedUrl(result.spreadsheetUrl);
      await logAuditAction(
        'مزامنة وتصدير إلى جداول Google',
        'Google Sheets',
        result.spreadsheetId,
        `تم تصدير ${devices.length} جهاز و${custodyCards.length} بطاقة عهدة بنجاح`
      );
    } catch (err: any) {
      console.error('Google Sheets export failed:', err);
      setErrorMessage(err.message || 'فشلت المزامنة مع جداول Google');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 text-right">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">مزامنة وتصدير إلى جداول بيانات Google</h3>
              <p className="text-xs text-slate-500">الربط الرسمي المباشر مع Google Sheets</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!currentUser || !googleToken ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">يتطلب تسجيل الدخول بحساب Google</p>
                <p className="text-slate-600 mt-0.5">
                  لمنح التطبيق الإذن المعتمد بإنشاء وتحديث جدول بيانات Google Sheets بأمان.
                </p>
              </div>
            </div>

            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول بحساب Google الآن</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                الحساب متصل وجاهز للمزامنة: <strong className="text-slate-900">{currentUser.email}</strong>
              </span>
            </div>

            <p className="text-slate-700 leading-relaxed">
              عند الضغط على بدء المزامنة، سيقوم النظام تلقائياً بإنشاء ملف Google Spreadsheet جديد منظم في عدة أوراق عمل:
            </p>

            <ul className="space-y-1.5 text-slate-700 list-disc list-inside mr-2">
              <li>ورقة <strong>سجل الأجهزة والتجهيزات</strong> ({devices.length} جهاز).</li>
              <li>ورقة <strong>بطاقات العهدة الشخصية</strong> ({custodyCards.length} بطاقة).</li>
            </ul>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {createdUrl && (
              <div className="p-4 rounded-xl bg-slate-50 border border-emerald-300 space-y-2 text-center animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-slate-900 text-sm">تم إنشاء ومزامنة جدول البيانات بنجاح!</div>
                <a
                  href={createdUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <span>فتح جدول Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                إغلاق
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold shadow-xs"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ المزامنة والتصدير...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>بدء التصدير إلى Google Sheets</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
