# تطبيق إدارة الأصول والعُهد — Flutter

هذا تطبيق موبايل مستقل ضمن المستودع نفسه، ويقرأ من قاعدة Firebase/Firestore المستخدمة حالياً في نسخة الويب.

## الوظائف المضمنة

- تسجيل الدخول بحساب Google عبر Firebase Authentication.
- لوحة مختصرة للأجهزة والعُهد وبلاغات الصيانة.
- عرض سجلات الأجهزة وبطاقات العهدة والحركات وبلاغات الصيانة والشبكات وسجل التدقيق مباشرة من Firestore.
- قسم طلبات الاعتماد: يعرض للمستخدم طلباته فقط، ويتيح لرئيس الدائرة اعتماد الطلبات أو رفضها.
- مسح QR والباركود بكاميرا الهاتف والبحث عن الجهاز بالباركود أو الرقم التسلسلي أو رقم الأصل.
- إضافة جهاز: رئيس الدائرة يحفظ مباشرة مع سجل تدقيق؛ المستخدم الآخر يرسل طلب إضافة إلى مجموعة `pendingRequests` للموافقة.
- منع تكرار الرقم التسلسلي والباركود قبل إرسال/حفظ سجل الجهاز.

## بنية البيانات الحالية

- `department_data/telecom/devices`
- `department_data/telecom/custodyCards`
- `department_data/telecom/movements`
- `department_data/telecom/maintenanceTickets`
- `department_data/telecom/auditLogs`
- `systemSettings/headOffice`
- `pendingRequests`

لا ينشئ التطبيق قاعدة بيانات جديدة ولا ينسخ بياناتك إلى مكان آخر.

## المتطلبات

- Flutter 3.24 أو أحدث.
- Android Studio / Android SDK لبناء APK.
- Xcode على macOS لبناء iOS (الحد الأدنى المستهدف iOS 15.5 بسبب متطلبات مكتبة قارئ الباركود).
- تفعيل Google في Firebase Authentication.
- تسجيل تطبيقي Android وiOS الأصليين داخل مشروع Firebase الحالي.

## إنشاء ملفات المنصات

من هذا المجلد نفّذ:

```bash
flutter create --platforms=android,ios,web --project-name asset_flow_mobile .
flutter pub get
flutter analyze
```

## إعداد Firebase للمنصات

التهيئة الحالية تستخدم بيانات مشروع Firebase الموجود في `asset-flow-pwa/firebase-applet-config.json` كقيم افتراضية لمشروع الويب. يجب تسجيل تطبيق Android وتطبيق iOS في **مشروع Firebase نفسه** قبل توزيع نسخ الهاتف.

استبدل قيمة App ID الافتراضية بمعرّف التطبيق الأصلي الذي يعرضه Firebase لكل منصة عند البناء:

```bash
flutter build apk --release \
  --dart-define=FIREBASE_PROJECT_ID=engaged-descent-1gtt6 \
  --dart-define=FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY \
  --dart-define=FIREBASE_APP_ID=YOUR_ANDROID_FIREBASE_APP_ID \
  --dart-define=FIREBASE_MESSAGING_SENDER_ID=24654767968 \
  --dart-define=FIREBASE_STORAGE_BUCKET=engaged-descent-1gtt6.firebasestorage.app
```

على Android أضف SHA-1 وSHA-256 لشهادة التوقيع في إعدادات تطبيق Android داخل Firebase، وتأكد من تفعيل Google provider. وعلى iOS أضف إعدادات OAuth وURL scheme المطلوبة في Xcode وفق ملف GoogleService-Info.plist الصادر من Firebase. لا تضع ملفات الاعتماد الخاصة أو مفاتيح التوقيع في Git.

### أذونات الكاميرا

أضف `android.permission.CAMERA` إلى AndroidManifest.xml، و`NSCameraUsageDescription` إلى Info.plist قبل تشغيل الكاميرا على الأجهزة الفعلية. ملف `tool/prepare_platforms.sh` يضيف إذن Android تلقائياً بعد إنشاء ملفات المنصة.

## ملاحظات أمان وتشغيل

- النسخة المحمولة لا تمنح المستخدم صلاحيات أعلى من قواعد Firestore الحالية.
- لا يتم السماح للمستخدم العادي بالكتابة المباشرة إلى سجلات القسم؛ تُرسل طلبات الإضافة للموافقة.
- قواعد Firestore الحالية تمنح القراءة للمستخدم المسجل، وتقيّد الكتابة المباشرة برئيس الدائرة. يجب مراجعة القواعد ونشرها من مالك مشروع Firebase قبل الإنتاج.
- فحص التكرار في الواجهة ليس قيد uniqueness ذرياً على مستوى قاعدة البيانات؛ يجب إضافة آلية خادمية/معاملة موثوقة إذا كان مطلوباً منع التصادم في جميع العملاء.
- اختبار الكاميرا الفعلي وتسجيل الدخول على Android وiOS يتطلبان جهازاً وإعداد OAuth الأصليين. نجاح بناء CI وحده لا يثبت نجاح تسجيل الدخول أو أذونات الكاميرا على الأجهزة.

## بناء تطبيقات الهاتف

```bash
flutter build apk --release
flutter build ios --release --no-codesign
```

يتطلب بناء iOS جهاز macOS مع Xcode. المشروع يحتوي نسخة Flutter مستقلة للموبايل، بينما تبقى نسخة الويب هي تطبيق React الحالي؛ لا يستبدل تطبيق Flutter نسخة React ولا يغير قاعدة بياناته.
