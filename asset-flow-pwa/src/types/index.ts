export type UserRoleType = 
  | 'director'          // رئيس دائرة الاتصالات (صلاحيات الاعتماد والإدارة حصراً)
  | 'technician';       // فني اتصالات وشبكات (إرسال طلبات الاعتماد والتعديل)

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRoleType;
  department: string;
  jobTitle?: string;
  phone?: string;
  createdAt: string;
}

export type RequestActionType = 
  | 'add_device' 
  | 'edit_device' 
  | 'delete_device'
  | 'add_custody' 
  | 'edit_custody' 
  | 'delete_custody'
  | 'add_movement'
  | 'add_ticket' 
  | 'edit_ticket'
  | 'add_phone' 
  | 'edit_phone'
  | 'add_network'
  | 'join_department';

export interface PendingRequest {
  id: string;
  actionType: RequestActionType;
  title: string;
  details: string;
  requesterUid: string;
  requesterEmail: string;
  requesterName: string;
  payload: any;
  targetCollection: string;
  targetDocId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface SystemSettings {
  headEmail: string;
  departmentName: string;
  updatedAt?: string;
}

export interface CustodyCardItem {
  id: string;
  no: number;                     // مسلسل
  name: string;                   // اسم المادة
  description: string;            // وصف المادة ومواصفاتها (المعالج، الرام، الذاكرة، الكيس...)
  unit: string;                   // وحدة القياس
  quantity: number;               // الكمية
  serialNumber: string;           // الرقم التسلسلي
  barcode: string;                // رقم الباركود / QR
  itemCode: string;               // رمز المادة
  receiptDetails: string;         // بيانات الاستلام
  receiptDate: string;            // تاريخ الاستلام
  returnDetails: string;          // بيانات إعادة المادة
  custodyNumber: string;          // رقم العهدة
  returnDate: string;             // تاريخ الإعادة
  balance: number;                // الرصيد
  notes: string;                  // الملاحظات
  deviceId?: string;              // معرف الجهاز المرتبط
}

export interface CustodyCard {
  id: string;
  cardNumber: string;             // رقم البطاقة
  employeeName: string;           // الاسم الثلاثي للمسؤول
  jobTitle: string;               // صفته الوظيفية
  directorate: string;            // المديرية
  workCenter: string;             // مركز العمل
  department: string;             // الدائرة
  division: string;               // الشعبة
  officeOrCenter: string;         // المكتب
  creationDate: string;           // تاريخ إنشاء البطاقة
  items: CustodyCardItem[];       // جدول المواد
  
  employeeSignature: string;      // توقيع الموظف
  deliveryOfficerSignature: string; // مسؤول التسليم
  deptHeadSignature: string;      // رئيس دائرة الاتصالات
  warehouseKeeperSignature: string; // أمين المستودع
  adminEndorsement: string;       // المصادقة الإدارية
  endorsementDate: string;        // تاريخ المصادقة
  
  status: 'active' | 'archived' | 'pending';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export type DeviceCategory = 
  | 'desktop'           // حاسب مكتبي (كيس، معالج، رام، ذاكرة)
  | 'laptop'            // حاسب محمول
  | 'monitor'           // شاشة عرض
  | 'printer'           // طابعة مكتبية
  | 'scanner'           // ماسح ضوئي
  | 'ups'               // مزود طاقة احتياطي
  | 'router'            // جهاز توجيه شبكي
  | 'switch'            // محول شبكة مركزى
  | 'access_point'      // نقطة بث لاسلكي
  | 'wireless_radio'    // اتصالات لاسلكية
  | 'telephony'         // هاتف أرضي أو شبكي
  | 'modem'             // مودم اتصالات
  | 'cables_fiber'      // كابلات ألياف ضوئية وشبكة (CAT6, Fiber)
  | 'telecom_gear'      // معدات شبكات واتصالات
  | 'peripherals'       // ملحقات حاسوب
  | 'spare_parts'       // قطع غيار وأجزاء
  | 'other';            // تجهيزات أخرى

export type DeviceCondition = 'excellent' | 'good' | 'needs_maintenance' | 'defective' | 'out_of_service';
export type DeviceStatus = 'in_warehouse' | 'assigned_employee' | 'assigned_department' | 'in_maintenance' | 'decommissioned';

export interface DeviceAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'doc';
  dataUrl: string;
  uploadedAt: string;
}

export interface Device {
  id: string;
  name: string;                   // اسم الجهاز
  category: DeviceCategory;       // نوعه
  manufacturer: string;           // الشركة المصنعة
  model: string;                  // الطراز (Model)
  serialNumber: string;           // الرقم التسلسلي
  barcode: string;                // رقم الباركود / QR
  assetNumber: string;            // الرقم المالي أو رقم العهدة
  
  // Detailed IT Specifications (المواصفات التفصيلية للحاسب والتجهيزات)
  cpu?: string;                   // المعالج (Processor)
  ram?: string;                   // الذاكرة العشوائية (RAM)
  storage?: string;               // وحدة التخزين (SSD / HDD)
  caseType?: string;              // صندوق الحاسب (Case / Chassis)
  networkCables?: string;         // نوع الكابلات والتوصيلات
  ipAddress?: string;             // عنوان IP
  macAddress?: string;            // عنوان MAC
  
  purchaseDate: string;           // تاريخ الشراء
  supplier: string;               // مصدر التوريد
  condition: DeviceCondition;     // الحالة الفنية
  status: DeviceStatus;           // حالة التواجد
  location: string;               // موقع الجهاز / المكتب
  assignedEmployee?: string;      // الموظف المسؤول عنه
  assignedStationOrDept?: string; // القسم أو المكتب التابع له
  deliveryDate?: string;          // تاريخ التسليم
  warrantyEnd?: string;           // تاريخ انتهاء الضمان
  notes?: string;                 // الملاحظات
  attachments: DeviceAttachment[];// المرفقات
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 
  | 'handover'              // تسليم جهاز لموظف
  | 'return'                // إعادة جهاز إلى المستودع
  | 'transfer_employee'     // نقل جهاز من موظف إلى آخر
  | 'transfer_dept'         // نقل جهاز بين الأقسام
  | 'replacement'           // استبدال جهاز
  | 'decommission'          // إخراج جهاز من الخدمة
  | 'new_intake';           // إدخال جهاز جديد إلى المستودع

export interface Movement {
  id: string;
  referenceNumber: string;        // رقم مرجعي (سند حركة)
  type: MovementType;
  deviceId: string;
  deviceName: string;
  serialNumber: string;
  barcode?: string;
  fromEntity: string;             // الجهة أو الموظف المسلّم
  toEntity: string;               // الجهة أو الموظف المستلم
  executorName: string;           // الموظف المنفذ
  date: string;
  reason: string;
  notes?: string;
  createdAt: string;
}

export type TicketPriority = 'critical' | 'high' | 'normal' | 'low';
export type TicketStatus = 'new' | 'in_progress' | 'waiting_spare_parts' | 'repaired' | 'closed';

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;           // رقم البلاغ
  deviceId?: string;
  deviceName: string;             // نوع الجهاز / اسمه
  serialNumber?: string;
  barcode?: string;
  faultDescription: string;       // وصف العطل
  stationOrDept: string;          // القسم أو المكتب
  reportDate: string;             // تاريخ تسجيل العطل
  priority: TicketPriority;       // درجة الأولوية
  assignedTech: string;           // الفني المكلف
  actionsTaken: string;           // الإجراءات المتخذة
  sparePartsUsed: string;         // قطع الغيار المستخدمة
  resolutionDate?: string;        // تاريخ الإصلاح
  status: TicketStatus;           // حالة البلاغ
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;                 // إضافة، تعديل، حذف، طباعة، تسليم...
  entity: string;                 // عهدة، جهاز، حركة، بطاقة...
  entityId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  details: string;
}

export interface TelecomNetworkInfo {
  id: string;
  name: string;
  type: 'شبكة داخلية' | 'شبكة لاسلكية' | 'شبكة واسعة' | 'اتصالات لاسلكية' | 'خط إنترنت رئيسي' | 'خادم (Server)';
  ipRange?: string;
  gateway?: string;
  bandwidth?: string;
  frequency?: string;
  location: string;
  status: 'active' | 'inactive' | 'degraded';
  notes?: string;
}

export interface NetworkPortMapping {
  portNumber: string;             // رقم المنفذ في السويتش
  pointNumber: string;            // رقم النقطة في المكتب (Wall Socket)
  officeLocation: string;         // مكان المكتب
  connectedDevice?: string;       // الجهاز المتصل (اسم أو ID)
  notes?: string;
}

export interface PhoneDirectoryEntry {
  id: string;
  phoneNumber: string;            // رقم الهاتف الداخلي
  employeeName: string;           // اسم الموظف أو صاحب المكتب
  department: string;             // الدائرة / القسم
  officeLocation: string;         // موقع المكتب
  pbxPortNumber: string;          // رقم المنفذ في المقسم (PBX Port)
  pointNumber?: string;           // رقم نقطة الهاتف في المكتب
  status: 'active' | 'inactive';
  notes?: string;
}

export interface InfrastructureExtension {
  portsCount?: number;            // عدد المنافذ (للسويتشات)
  portMappings?: NetworkPortMapping[]; // خريطة التوزيع للمنافذ
}

// Update Device interface to include optional infra specs
export interface Device {
  id: string;
  name: string;                   // اسم الجهاز
  category: DeviceCategory;       // نوعه
  manufacturer: string;           // الشركة المصنعة
  model: string;                  // الطراز (Model)
  serialNumber: string;           // الرقم التسلسلي
  barcode: string;                // رقم الباركود / QR
  assetNumber: string;            // الرقم المالي أو رقم العهدة
  
  // Detailed IT Specifications
  cpu?: string;
  ram?: string;
  storage?: string;
  caseType?: string;
  networkCables?: string;
  
  // Infrastructure Specs (New)
  portsCount?: number;
  portMappings?: NetworkPortMapping[];

  purchaseDate: string;           // تاريخ الشراء
  supplier: string;               // مصدر التوريد
  condition: DeviceCondition;     // الحالة الفنية
  status: DeviceStatus;           // حالة التواجد
  location: string;               // موقع الجهاز / المكتب
  assignedEmployee?: string;      // الموظف المسؤول عنه
  assignedStationOrDept?: string; // القسم أو المكتب التابع له
  deliveryDate?: string;          // تاريخ التسليم
  warrantyEnd?: string;           // تاريخ انتهاء الضمان
  isVerified?: boolean;           // تم الاعتماد رسمياً من رئيس الدائرة
  verifiedBy?: string;            // اسم الشخص المعتمِد
  notes?: string;                 // الملاحظات
  attachments: DeviceAttachment[];// المرفقات
  createdAt: string;
  updatedAt: string;
}
