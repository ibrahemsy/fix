import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
// ignore: deprecated_member_use
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

const _projectId = String.fromEnvironment(
  'FIREBASE_PROJECT_ID',
  defaultValue: 'engaged-descent-1gtt6',
);
const _apiKey = String.fromEnvironment(
  'FIREBASE_API_KEY',
  defaultValue: 'AIzaSyAyDcsEo72AbomJev5f0TMAwYLjtQp3Kkw',
);
const _messagingSenderId = String.fromEnvironment(
  'FIREBASE_MESSAGING_SENDER_ID',
  defaultValue: '24654767968',
);
const _storageBucket = String.fromEnvironment(
  'FIREBASE_STORAGE_BUCKET',
  defaultValue: 'engaged-descent-1gtt6.firebasestorage.app',
);
const _webAppId = '1:24654767968:web:b5a9e1f10d0dda9d1e6005';
const _appId = String.fromEnvironment('FIREBASE_APP_ID', defaultValue: _webAppId);
const _authDomain = 'engaged-descent-1gtt6.firebaseapp.com';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: FirebaseOptions(
      apiKey: _apiKey,
      appId: _appId,
      messagingSenderId: _messagingSenderId,
      projectId: _projectId,
      authDomain: _authDomain,
      storageBucket: _storageBucket,
    ),
  );
  runApp(const AssetFlowApp());
}

class AssetFlowApp extends StatelessWidget {
  const AssetFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'إدارة الأصول والعُهد',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF155EEF)),
        scaffoldBackgroundColor: const Color(0xFFF5F7FB),
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF172B4D),
          elevation: 0,
          centerTitle: false,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFFE3E8EF)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFFE3E8EF)),
          ),
        ),
      ),
      builder: (context, child) => Directionality(
        textDirection: TextDirection.rtl,
        child: child ?? const SizedBox.shrink(),
      ),
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  Future<void> _signIn(BuildContext context) async {
    try {
      final provider = GoogleAuthProvider()
        ..addScope('email')
        ..setCustomParameters({'prompt': 'select_account'});
      if (kIsWeb) {
        await FirebaseAuth.instance.signInWithPopup(provider);
      } else {
        await FirebaseAuth.instance.signInWithProvider(provider);
      }
    } on FirebaseAuthException catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('تعذر تسجيل الدخول: ${error.message ?? error.code}')),
        );
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('حدث خطأ أثناء تسجيل الدخول: $error')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }
        if (snapshot.data == null) {
          return Scaffold(
            body: SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 420),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(
                            color: const Color(0xFFEAF1FF),
                            borderRadius: BorderRadius.circular(26),
                          ),
                          child: const Icon(Icons.inventory_2_rounded, size: 46, color: Color(0xFF155EEF)),
                        ),
                        const SizedBox(height: 22),
                        const Text('إدارة الأصول والعُهد', style: TextStyle(fontSize: 25, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 8),
                        const Text(
                          'تطبيق ميداني لإدارة الأجهزة والعُهد والصيانة وحركات التسليم والاستلام.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Color(0xFF667085), height: 1.6),
                        ),
                        const SizedBox(height: 28),
                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: FilledButton.icon(
                            onPressed: () => _signIn(context),
                            icon: const Icon(Icons.login),
                            label: const Text('تسجيل الدخول باستخدام Google'),
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'يتم تطبيق صلاحيات النظام الحالية من قاعدة بيانات Firebase.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, color: Color(0xFF98A2B3)),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        }
        return const MobileHome();
      },
    );
  }
}

class MobileHome extends StatefulWidget {
  const MobileHome({super.key});

  @override
  State<MobileHome> createState() => _MobileHomeState();
}

class _MobileHomeState extends State<MobileHome> {
  int _tab = 0;
  String _headEmail = 'ferasnatof@gmail.com';
  bool _headLoaded = false;

  CollectionReference<Map<String, dynamic>> get _base =>
      FirebaseFirestore.instance.collection('department_data').doc('telecom').collection('devices');

  CollectionReference<Map<String, dynamic>> _collection(String name) =>
      FirebaseFirestore.instance.collection('department_data').doc('telecom').collection(name);

  User get _user => FirebaseAuth.instance.currentUser!;
  bool get _isHead =>
      (_user.email ?? '').toLowerCase() == _headEmail.toLowerCase() ||
      (_user.email ?? '').toLowerCase() == 'ferasnatof@gmail.com' ||
      (_user.email ?? '').toLowerCase() == 'gfa437926@gmail.com';

  @override
  void initState() {
    super.initState();
    _loadHeadEmail();
  }

  Future<void> _loadHeadEmail() async {
    try {
      final snap = await FirebaseFirestore.instance.collection('systemSettings').doc('headOffice').get();
      final email = snap.data()?['headEmail'];
      if (email is String && email.isNotEmpty && mounted) {
        setState(() => _headEmail = email);
      }
    } catch (_) {
      // Keep the same fallback as the existing web client.
    } finally {
      if (mounted) setState(() => _headLoaded = true);
    }
  }

  Future<void> _saveOrRequestDevice(Map<String, dynamic> data) async {
    final id = data['id'] as String;
    final now = DateTime.now().toUtc().toIso8601String();
    data['updatedAt'] = now;
    if (_isHead) {
      await _base.doc(id).set(data);
      final log = FirebaseFirestore.instance
          .collection('department_data').doc('telecom').collection('auditLogs').doc();
      await log.set({
        'id': log.id,
        'action': 'تسجيل جهاز من تطبيق الموبايل',
        'entity': 'devices',
        'entityId': id,
        'userName': _user.displayName ?? 'مستخدم',
        'userEmail': _user.email ?? '',
        'timestamp': now,
        'details': 'إضافة الجهاز: ${data['name']}',
      });
    } else {
      final request = FirebaseFirestore.instance.collection('pendingRequests').doc();
      await request.set({
        'id': request.id,
        'actionType': 'add_device',
        'title': 'تسجيل جهاز جديد من تطبيق الموبايل',
        'details': 'الجهاز: ${data['name']} (${data['serialNumber']})',
        'requesterUid': _user.uid,
        'requesterEmail': _user.email ?? '',
        'requesterName': _user.displayName ?? 'موظف',
        'payload': data,
        'targetCollection': 'devices',
        'status': 'pending',
        'createdAt': now,
      });
    }
  }

  Future<void> _showAddDevice() async {
    final formKey = GlobalKey<FormState>();
    final name = TextEditingController();
    final serial = TextEditingController();
    final barcode = TextEditingController();
    final manufacturer = TextEditingController();
    final model = TextEditingController();
    final location = TextEditingController(text: 'مستودع دائرة الاتصالات');
    final notes = TextEditingController();
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          padding: EdgeInsets.fromLTRB(18, 18, 18, MediaQuery.of(context).viewInsets.bottom + 20),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('تسجيل جهاز جديد', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  _field(name, 'اسم الجهاز', required: true),
                  _field(serial, 'الرقم التسلسلي المصنعي', required: true),
                  Row(
                    children: [
                      Expanded(child: _field(barcode, 'الباركود الداخلي')),
                      IconButton.filledTonal(
                        tooltip: 'مسح الباركود بالكاميرا',
                        onPressed: () async {
                          final result = await Navigator.of(context).push<String>(
                            MaterialPageRoute(builder: (_) => const BarcodeScannerPage()),
                          );
                          if (result != null) setSheetState(() => barcode.text = result);
                        },
                        icon: const Icon(Icons.qr_code_scanner),
                      ),
                    ],
                  ),
                  _field(manufacturer, 'الشركة المصنعة'),
                  _field(model, 'الطراز / الموديل'),
                  _field(location, 'الموقع'),
                  _field(notes, 'ملاحظات', maxLines: 2),
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: () async {
                      if (!formKey.currentState!.validate()) return;
                      final now = DateTime.now().toUtc().toIso8601String();
                      final id = 'dev_${DateTime.now().microsecondsSinceEpoch}';
                      final payload = <String, dynamic>{
                        'id': id,
                        'name': name.text.trim(),
                        'category': 'other',
                        'manufacturer': manufacturer.text.trim(),
                        'model': model.text.trim(),
                        'serialNumber': serial.text.trim(),
                        'barcode': barcode.text.trim(),
                        'assetNumber': '',
                        'purchaseDate': DateTime.now().toIso8601String().split('T').first,
                        'supplier': '',
                        'condition': 'excellent',
                        'status': 'in_warehouse',
                        'location': location.text.trim(),
                        'notes': notes.text.trim(),
                        'attachments': <dynamic>[],
                        'createdAt': now,
                        'updatedAt': now,
                      };
                      try {
                        final duplicates = await _base.where('serialNumber', isEqualTo: serial.text.trim()).limit(1).get();
                        if (duplicates.docs.isNotEmpty) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('هذا الرقم التسلسلي مسجل مسبقاً.')),
                            );
                          }
                          return;
                        }
                        if (barcode.text.trim().isNotEmpty) {
                          final barcodeDuplicates = await _base.where('barcode', isEqualTo: barcode.text.trim()).limit(1).get();
                          if (barcodeDuplicates.docs.isNotEmpty) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('هذا الباركود مرتبط بجهاز آخر.')),
                              );
                            }
                            return;
                          }
                        }
                        await _saveOrRequestDevice(payload);
                        if (sheetContext.mounted) Navigator.pop(sheetContext);
                        if (mounted) {
                          ScaffoldMessenger.of(this.context).showSnackBar(
                            SnackBar(content: Text(_isHead ? 'تم حفظ الجهاز.' : 'أُرسل طلب إضافة الجهاز للاعتماد.')),
                          );
                        }
                      } catch (error) {
                        if (mounted) {
                          ScaffoldMessenger.of(this.context).showSnackBar(
                            SnackBar(content: Text('تعذر حفظ البيانات: $error')),
                          );
                        }
                      }
                    },
                    child: Text(_isHead ? 'حفظ الجهاز' : 'إرسال طلب الاعتماد'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
    name.dispose();
    serial.dispose();
    barcode.dispose();
    manufacturer.dispose();
    model.dispose();
    location.dispose();
    notes.dispose();
  }

  Widget _field(TextEditingController controller, String label, {bool required = false, int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 11),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        decoration: InputDecoration(labelText: label),
        validator: required
            ? (value) => value == null || value.trim().isEmpty ? 'هذا الحقل مطلوب' : null
            : null,
      ),
    );
  }

  Future<void> _scanAndFind() async {
    final code = await Navigator.of(context).push<String>(
      MaterialPageRoute(builder: (_) => const BarcodeScannerPage()),
    );
    if (code == null || !mounted) return;
    final snapshot = await _base.get();
    final matches = snapshot.docs.where((doc) {
      final d = doc.data();
      return [d['barcode'], d['serialNumber'], d['assetNumber']]
          .any((value) => value != null && value.toString().trim().toLowerCase() == code.trim().toLowerCase());
    }).toList();
    final match = matches.isEmpty ? null : matches.first;
    if (!mounted) return;
    if (match == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('لم يتم العثور على جهاز بالرمز: $code')));
      return;
    }
    setState(() => _tab = 1);
    await showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(match.data()['name']?.toString() ?? 'الجهاز'),
        content: Text('الباركود: ${match.data()['barcode'] ?? '-'}\nالرقم التسلسلي: ${match.data()['serialNumber'] ?? '-'}\nالموقع: ${match.data()['location'] ?? '-'}'),
        actions: [TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('إغلاق'))],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final titles = ['الرئيسية', 'الأجهزة', 'العُهد', 'الحركات', 'الصيانة'];
    final pages = [
      _dashboard(),
      _devices(),
      _records('custodyCards', 'لا توجد بطاقات عهدة مسجلة', Icons.assignment_ind_outlined),
      _records('movements', 'لا توجد حركات مسجلة', Icons.swap_horiz_rounded),
      _records('maintenanceTickets', 'لا توجد بلاغات صيانة', Icons.build_outlined),
    ];
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(titles[_tab], style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            Text(_user.email ?? '', style: const TextStyle(fontSize: 11, color: Color(0xFF667085))),
          ],
        ),
        actions: [
          IconButton(tooltip: 'مسح باركود', onPressed: _scanAndFind, icon: const Icon(Icons.qr_code_scanner)),
          IconButton(
            tooltip: 'تسجيل الخروج',
            onPressed: () => FirebaseAuth.instance.signOut(),
            icon: const Icon(Icons.logout_rounded),
          ),
        ],
      ),
      body: IndexedStack(index: _tab, children: pages),
      floatingActionButton: _tab == 1
          ? FloatingActionButton.extended(
              onPressed: _showAddDevice,
              icon: const Icon(Icons.add),
              label: const Text('جهاز جديد'),
            )
          : null,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (value) => setState(() => _tab = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'الرئيسية'),
          NavigationDestination(icon: Icon(Icons.devices_outlined), selectedIcon: Icon(Icons.devices), label: 'الأجهزة'),
          NavigationDestination(icon: Icon(Icons.assignment_ind_outlined), label: 'العُهد'),
          NavigationDestination(icon: Icon(Icons.swap_horiz), label: 'الحركات'),
          NavigationDestination(icon: Icon(Icons.build_outlined), label: 'الصيانة'),
        ],
      ),
    );
  }

  Widget _dashboard() {
    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: _base.snapshots(),
      builder: (context, devices) {
        return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
          stream: _collection('maintenanceTickets').snapshots(),
          builder: (context, tickets) {
            return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: _collection('custodyCards').snapshots(),
              builder: (context, custody) {
                final deviceCount = devices.data?.docs.length ?? 0;
                final ticketCount = tickets.data?.docs.where((d) => d.data()['status'] != 'closed' && d.data()['status'] != 'repaired').length ?? 0;
                final custodyCount = custody.data?.docs.length ?? 0;
                return ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFF155EEF), Color(0xFF3538CD)]),
                        borderRadius: BorderRadius.circular(22),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('مرحباً بك في نظام إدارة الأصول', style: TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Text(_isHead ? 'دخول رئيس الدائرة' : 'حساب مستخدم — التعديلات تتطلب الاعتماد', style: const TextStyle(color: Colors.white70)),
                          const SizedBox(height: 14),
                          Text(_user.displayName ?? _user.email ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.55,
                      children: [
                        _statCard('الأجهزة', '$deviceCount', Icons.devices, const Color(0xFF155EEF)),
                        _statCard('بطاقات العهدة', '$custodyCount', Icons.assignment_ind, const Color(0xFF039855)),
                        _statCard('بلاغات مفتوحة', '$ticketCount', Icons.build, const Color(0xFFDC6803)),
                        _statCard('حالة الاتصال', 'مباشر', Icons.cloud_done, const Color(0xFF079455)),
                      ],
                    ),
                    const SizedBox(height: 18),
                    Card(
                      child: ListTile(
                        leading: const CircleAvatar(child: Icon(Icons.qr_code_scanner)),
                        title: const Text('جرد سريع بالباركود', style: TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: const Text('امسح رمز QR أو الباركود للعثور على الجهاز.'),
                        trailing: const Icon(Icons.chevron_left),
                        onTap: _scanAndFind,
                      ),
                    ),
                    if (!_headLoaded)
                      const Padding(padding: EdgeInsets.all(12), child: LinearProgressIndicator()),
                  ],
                );
              },
            );
          },
        );
      },
    );
  }

  Widget _statCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 25),
          Text(value, style: const TextStyle(fontSize: 23, fontWeight: FontWeight.w800)),
          Text(label, style: const TextStyle(color: Color(0xFF667085), fontSize: 12)),
        ],
      ),
    );
  }

  Widget _devices() {
    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: _base.snapshots(),
      builder: (context, snapshot) {
        if (snapshot.hasError) return _errorState(snapshot.error.toString());
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        final docs = snapshot.data!.docs;
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 90),
          children: [
            Text('${docs.length} جهاز مسجل', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF475467))),
            const SizedBox(height: 12),
            ...docs.map((doc) {
              final d = doc.data();
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.devices_other)),
                  title: Text(d['name']?.toString() ?? 'جهاز دون اسم', style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('تسلسلي: ${d['serialNumber'] ?? '-'}\nباركود: ${d['barcode'] ?? '-'}\nالموقع: ${d['location'] ?? '-'}'),
                  isThreeLine: true,
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => showDialog<void>(
                    context: context,
                    builder: (dialogContext) => AlertDialog(
                      title: Text(d['name']?.toString() ?? 'تفاصيل الجهاز'),
                      content: Text('الشركة: ${d['manufacturer'] ?? '-'}\nالطراز: ${d['model'] ?? '-'}\nالحالة: ${d['condition'] ?? '-'}\nالوضع: ${d['status'] ?? '-'}\nالموقع: ${d['location'] ?? '-'}\nملاحظات: ${d['notes'] ?? '-'}'),
                      actions: [TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('إغلاق'))],
                    ),
                  ),
                ),
              );
            }),
          ],
        );
      },
    );
  }

  Widget _records(String collection, String emptyText, IconData icon) {
    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: _collection(collection).snapshots(),
      builder: (context, snapshot) {
        if (snapshot.hasError) return _errorState(snapshot.error.toString());
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        final docs = snapshot.data!.docs;
        if (docs.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 42, color: Colors.blueGrey),
                const SizedBox(height: 10),
                Text(emptyText),
              ],
            ),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: docs.length,
          itemBuilder: (context, index) {
            final d = docs[index].data();
            final title = d['employeeName'] ?? d['deviceName'] ?? d['ticketNumber'] ?? d['cardNumber'] ?? 'سجل';
            final subtitle = d['referenceNumber'] ?? d['serialNumber'] ?? d['status'] ?? d['date'] ?? d['reportDate'] ?? '';
            return Card(
              child: ListTile(
                leading: CircleAvatar(child: Icon(icon)),
                title: Text(title.toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(subtitle.toString()),
                trailing: const Icon(Icons.chevron_left),
                onTap: () => showDialog<void>(
                  context: context,
                  builder: (dialogContext) => AlertDialog(
                    title: Text(title.toString()),
                    content: SingleChildScrollView(child: Text(d.entries.map((e) => '${e.key}: ${e.value}').join('\n'))),
                    actions: [TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('إغلاق'))],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _errorState(String message) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.cloud_off, size: 42, color: Colors.redAccent),
        const SizedBox(height: 12),
        const Text('تعذر تحميل البيانات', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text(message, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12)),
      ]),
    ),
  );
}

class BarcodeScannerPage extends StatefulWidget {
  const BarcodeScannerPage({super.key});

  @override
  State<BarcodeScannerPage> createState() => _BarcodeScannerPageState();
}

class _BarcodeScannerPageState extends State<BarcodeScannerPage> {
  bool _handled = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('مسح الباركود')),
      body: Stack(
        children: [
          MobileScanner(
            onDetect: (capture) {
              if (_handled || capture.barcodes.isEmpty) return;
              final value = capture.barcodes.first.rawValue;
              if (value == null || value.trim().isEmpty) return;
              _handled = true;
              Navigator.of(context).pop(value.trim());
            },
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              color: Colors.black54,
              child: const Text(
                'وجّه الكاميرا نحو رمز QR أو الباركود حتى تتم قراءته تلقائياً.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
