# Asset Flow — Web + Mobile

نظام إدارة الأصول والتجهيزات التقنية والعُهد.

## النسختان

### نسخة الويب الحالية
تطبيق React + TypeScript داخل `asset-flow-pwa/`.

```bash
cd asset-flow-pwa
npm install
npm run lint
npm run build
npm run dev
```

### نسخة الموبايل
تطبيق Flutter مستقل داخل `mobile/asset_flow_mobile/`، متصل بمجموعات Firestore نفسها المستخدمة في نسخة الويب.

راجع [دليل تطبيق Flutter](mobile/asset_flow_mobile/README.md) لإعداد Android وiOS وتشغيل الكاميرا وتسجيل الدخول.

## البيانات المشتركة

كلتا النسختين تستخدمان مشروع Firebase نفسه ومسارات Firestore الحالية؛ لا توجد قاعدة بيانات منفصلة للموبايل.

## التطوير والنشر

- لا تدمج أي طلب سحب إلى `main` دون موافقة مالك المستودع.
- لا ترفع مفاتيح التوقيع أو ملفات الاعتماد الخاصة إلى Git.
- اختبر تسجيل الدخول والصلاحيات ومسح الباركود على أجهزة فعلية قبل التوزيع.
- تحقق من قواعد Firestore في Firebase Console قبل الإنتاج.
