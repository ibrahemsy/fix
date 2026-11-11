import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { 
  db, 
  initAuthListener, 
  signInWithGoogle, 
  logoutUser, 
  getCachedAccessToken
} from '../firebase';
import { 
  CustodyCard, 
  Device, 
  Movement, 
  MaintenanceTicket, 
  AuditLog, 
  UserRoleType, 
  UserProfile,
  TelecomNetworkInfo,
  PhoneDirectoryEntry,
  PendingRequest,
  SystemSettings
} from '../types';

const DEFAULT_HEAD_EMAIL = 'ferasnatof@gmail.com';

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRoleType;
  currentProfile: UserProfile;
  headEmail: string;
  isHeadOfDept: boolean;
  setCurrentRole: (role: UserRoleType) => void;
  isLoggedIn: boolean;
  googleToken: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  
  devices: Device[];
  custodyCards: CustodyCard[];
  movements: Movement[];
  tickets: MaintenanceTicket[];
  auditLogs: AuditLog[];
  phoneDirectory: PhoneDirectoryEntry[];
  telecomNetworks: TelecomNetworkInfo[];
  pendingRequests: PendingRequest[];
  
  isLoading: boolean;
  isSyncing: boolean;
  isOffline: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  saveCustodyCard: (card: CustodyCard) => Promise<void>;
  deleteCustodyCard: (id: string) => Promise<void>;
  saveDevice: (device: Device) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  saveMovement: (movement: Movement) => Promise<void>;
  saveTicket: (ticket: MaintenanceTicket) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  savePhoneEntry: (entry: PhoneDirectoryEntry) => Promise<void>;
  deletePhoneEntry: (id: string) => Promise<void>;
  saveTelecomNetwork: (network: TelecomNetworkInfo) => Promise<void>;
  deleteTelecomNetwork: (id: string) => Promise<void>;
  
  approvePendingRequest: (req: PendingRequest) => Promise<void>;
  rejectPendingRequest: (requestId: string, reason: string) => Promise<void>;
  updateHeadEmail: (newEmail: string) => Promise<void>;
  requestJoinDepartment: (roleRequested: string, notes: string) => Promise<void>;
  
  logAuditAction: (action: string, entity: string, entityId: string, details: string) => Promise<void>;
  resetToDefaultData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [headEmail, setHeadEmail] = useState<string>(DEFAULT_HEAD_EMAIL);
  const [currentRole, setCurrentRole] = useState<UserRoleType>('technician');
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [devices, setDevices] = useState<Device[]>([]);
  const [custodyCards, setCustodyCards] = useState<CustodyCard[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [phoneDirectory, setPhoneDirectory] = useState<PhoneDirectoryEntry[]>([]);
  const [telecomNetworks, setTelecomNetworks] = useState<TelecomNetworkInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  const isHeadOfDept = Boolean(
    currentUser?.email && (
      currentUser.email.toLowerCase() === headEmail.toLowerCase() ||
      currentUser.email.toLowerCase() === DEFAULT_HEAD_EMAIL.toLowerCase() ||
      currentUser.email.toLowerCase() === 'gfa437926@gmail.com'
    )
  );

  useEffect(() => {
    if (isHeadOfDept) {
      setCurrentRole('director');
    }
  }, [isHeadOfDept]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = initAuthListener(
      (user, token) => {
        setCurrentUser(user);
        setGoogleToken(token || getCachedAccessToken());
      },
      () => {
        setCurrentUser(null);
        setGoogleToken(null);
        setDevices([]);
        setCustodyCards([]);
        setMovements([]);
        setTickets([]);
        setAuditLogs([]);
        setPhoneDirectory([]);
        setTelecomNetworks([]);
        setPendingRequests([]);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch Central Department Data & System Settings
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    let unsubs: (() => void)[] = [];

    const initializeDepartmentData = async () => {
      setIsLoading(true);
      try {
        // Fetch System Settings (Head of Dept Email)
        const settingsRef = doc(db, 'systemSettings', 'headOffice');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists() && settingsSnap.data().headEmail) {
          setHeadEmail(settingsSnap.data().headEmail);
        } else {
          // Initialize system settings with ferasnatof@gmail.com
          await setDoc(settingsRef, {
            headEmail: DEFAULT_HEAD_EMAIL,
            departmentName: 'دائرة الاتصالات - وزارة الطوارئ وإدارة الكوارث',
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }

        // 1. Devices
        const devUnsub = onSnapshot(collection(db, 'department_data', 'telecom', 'devices'), (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Device));
          setDevices(list);
        }, (err) => console.warn('Devices snapshot:', err));
        unsubs.push(devUnsub);

        // 2. Custody Cards
        const cardUnsub = onSnapshot(collection(db, 'department_data', 'telecom', 'custodyCards'), (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CustodyCard));
          setCustodyCards(list);
        }, (err) => console.warn('Custody cards snapshot:', err));
        unsubs.push(cardUnsub);

        // 3. Movements
        const movUnsub = onSnapshot(collection(db, 'department_data', 'telecom', 'movements'), (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Movement));
          setMovements(list);
        }, (err) => console.warn('Movements snapshot:', err));
        unsubs.push(movUnsub);

        // 4. Maintenance Tickets
        const tktUnsub = onSnapshot(collection(db, 'department_data', 'telecom', 'maintenanceTickets'), (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceTicket));
          setTickets(list);
        }, (err) => console.warn('Tickets snapshot:', err));
        unsubs.push(tktUnsub);

        // 5. Audit Logs
        const auditUnsub = onSnapshot(collection(db, 'department_data', 'telecom', 'auditLogs'), (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
          setAuditLogs(list.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1)));
        }, (err) => console.warn('Audit snapshot:', err));
        unsubs.push(auditUnsub);

        // 6. Phone Directory
        const phoneUnsub = onSnapshot(collection(db, 'department_data', 'telecom', 'phoneDirectory'), (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PhoneDirectoryEntry));
          setPhoneDirectory(list);
        }, (err) => console.warn('Phone directory snapshot:', err));
        unsubs.push(phoneUnsub);

        // 7. Telecom Networks
        const telecomUnsub = onSnapshot(collection(db, 'department_data', 'telecom', 'telecomNetworks'), (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TelecomNetworkInfo));
          setTelecomNetworks(list);
        }, (err) => console.warn('Networks snapshot:', err));
        unsubs.push(telecomUnsub);

        // 8. Pending Requests
        const reqUnsub = onSnapshot(collection(db, 'pendingRequests'), (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PendingRequest));
          setPendingRequests(list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)));
        }, (err) => console.warn('Requests snapshot:', err));
        unsubs.push(reqUnsub);

      } catch (err) {
        console.error('Data initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDepartmentData();
    return () => {
      unsubs.forEach(u => u());
    };
  }, [currentUser]);

  const logAuditAction = async (action: string, entity: string, entityId: string, details: string) => {
    if (!currentUser) return;
    const logItem: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      entity,
      entityId,
      userName: currentUser.displayName || 'المستخدم',
      userEmail: currentUser.email || '',
      timestamp: new Date().toISOString(),
      details,
    };
    try {
      const logRef = doc(db, 'department_data', 'telecom', 'auditLogs', logItem.id);
      await setDoc(logRef, logItem);
    } catch (e) {
      console.warn('Audit log error:', e);
    }
  };

  // Submit a pending request if not Head of Dept, or commit directly if Head of Dept
  const submitOrCommit = async (
    targetCollection: string,
    actionType: any,
    title: string,
    details: string,
    payload: any,
    targetDocId?: string
  ) => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      if (isHeadOfDept) {
        // Direct commit for Head of Department
        const ref = doc(db, 'department_data', 'telecom', targetCollection, payload.id || targetDocId);
        if (actionType.startsWith('delete')) {
          await deleteDoc(ref);
        } else {
          await setDoc(ref, payload);
        }
        await logAuditAction(title, targetCollection, payload.id || targetDocId || '', details);
      } else {
        // Submit for Head Approval
        const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const pendingReq: PendingRequest = {
          id: reqId,
          actionType,
          title,
          details,
          requesterUid: currentUser.uid,
          requesterEmail: currentUser.email || '',
          requesterName: currentUser.displayName || 'موظف/فني الدائرة',
          payload,
          targetCollection,
          targetDocId: payload.id || targetDocId,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        const reqRef = doc(db, 'pendingRequests', reqId);
        await setDoc(reqRef, pendingReq);
        alert(`تم إرسال طلبك بنجاح إلى رئيس دائرة الاتصالات (${headEmail}) للمراجعة والاعتماد. التغييرات لن تطبق إلا بعد موافقة رئيس الدائرة.`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const saveCustodyCard = async (card: CustodyCard) => {
    await submitOrCommit(
      'custodyCards',
      'add_custody',
      'حفظ بطاقة عهدة',
      `الموظف: ${card.employeeName} (${card.cardNumber})`,
      card
    );
  };

  const deleteCustodyCard = async (id: string) => {
    const card = custodyCards.find(c => c.id === id);
    await submitOrCommit(
      'custodyCards',
      'delete_custody',
      'حذف بطاقة عهدة',
      `حذف بطاقة العهدة: ${card?.cardNumber || id}`,
      { id },
      id
    );
  };

  const saveDevice = async (device: Device) => {
    await submitOrCommit(
      'devices',
      'add_device',
      'تسجيل/تعديل جهاز',
      `الجهاز: ${device.name} (${device.serialNumber})`,
      device
    );
  };

  const deleteDevice = async (id: string) => {
    const dev = devices.find(d => d.id === id);
    await submitOrCommit(
      'devices',
      'delete_device',
      'حذف جهاز',
      `حذف الجهاز: ${dev?.name || id}`,
      { id },
      id
    );
  };

  const saveMovement = async (movement: Movement) => {
    await submitOrCommit(
      'movements',
      'add_movement',
      'سند تسليم/إعادة',
      `السند: ${movement.referenceNumber} (${movement.deviceName})`,
      movement
    );
    // Automatic device location update if Head
    if (isHeadOfDept) {
      const dev = devices.find(d => d.id === movement.deviceId || d.serialNumber === movement.serialNumber);
      if (dev) {
        let newStatus = dev.status;
        let newAssignee = dev.assignedEmployee;
        let newLocation = dev.location;

        if (movement.type === 'handover') {
          newStatus = 'assigned_employee';
          newAssignee = movement.toEntity;
          newLocation = `بعهدة الموظف: ${movement.toEntity}`;
        } else if (movement.type === 'return') {
          newStatus = 'in_warehouse';
          newAssignee = undefined;
          newLocation = 'مستودع الدائرة الرئيسي';
        }

        const updatedDev = { ...dev, status: newStatus, assignedEmployee: newAssignee, location: newLocation, updatedAt: new Date().toISOString() };
        await setDoc(doc(db, 'department_data', 'telecom', 'devices', updatedDev.id), updatedDev);
      }
    }
  };

  const saveTicket = async (ticket: MaintenanceTicket) => {
    await submitOrCommit(
      'maintenanceTickets',
      'add_ticket',
      'تسجيل/تحديث بلاغ صيانة',
      `البلاغ: ${ticket.ticketNumber} - ${ticket.deviceName}`,
      ticket
    );
  };

  const deleteTicket = async (id: string) => {
    await submitOrCommit(
      'maintenanceTickets',
      'delete_ticket',
      'حذف بلاغ صيانة',
      `حذف البلاغ: ${id}`,
      { id },
      id
    );
  };

  const savePhoneEntry = async (entry: PhoneDirectoryEntry) => {
    await submitOrCommit(
      'phoneDirectory',
      'add_phone',
      'تسجيل/تعديل رقم هاتف',
      `الهاتف: ${entry.phoneNumber} - ${entry.employeeName}`,
      entry
    );
  };

  const deletePhoneEntry = async (id: string) => {
    await submitOrCommit(
      'phoneDirectory',
      'delete_phone',
      'حذف رقم هاتف',
      `حذف الرقم: ${id}`,
      { id },
      id
    );
  };

  const saveTelecomNetwork = async (network: TelecomNetworkInfo) => {
    await submitOrCommit(
      'telecomNetworks',
      'add_network',
      'تسجيل/تعديل شبكة أو خادم',
      `الشبكة: ${network.name} (${network.type})`,
      network
    );
  };

  const deleteTelecomNetwork = async (id: string) => {
    await submitOrCommit(
      'telecomNetworks',
      'delete_network',
      'حذف شبكة',
      `حذف الشبكة: ${id}`,
      { id },
      id
    );
  };

  // Approval & Rejection Logic for Head of Department
  const approvePendingRequest = async (req: PendingRequest) => {
    if (!isHeadOfDept) {
      alert('عذراً، الموافقة على الطلبات محصورة برئيس دائرة الاتصالات حصراً.');
      return;
    }

    setIsSyncing(true);
    try {
      if (req.actionType.startsWith('delete')) {
        const docRef = doc(db, 'department_data', 'telecom', req.targetCollection, req.targetDocId || req.payload.id);
        await deleteDoc(docRef);
      } else {
        const docRef = doc(db, 'department_data', 'telecom', req.targetCollection, req.payload.id);
        await setDoc(docRef, req.payload);
      }

      // Mark request as approved
      const reqRef = doc(db, 'pendingRequests', req.id);
      await setDoc(reqRef, {
        ...req,
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: currentUser?.email || 'رئيس الدائرة',
      });

      await logAuditAction('اعتماد طلب', req.targetCollection, req.id, `تمت موافقة رئيس الدائرة على طلب: ${req.title} من ${req.requesterName}`);
      alert(`تم اعتماد الطلب وتحديث بيانات الدائرة بنجاح.`);
    } catch (err: any) {
      alert(`حدث خطأ أثناء اعتماد الطلب: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const rejectPendingRequest = async (requestId: string, reason: string) => {
    if (!isHeadOfDept) return;
    setIsSyncing(true);
    try {
      const reqRef = doc(db, 'pendingRequests', requestId);
      const req = pendingRequests.find(r => r.id === requestId);
      if (req) {
        await setDoc(reqRef, {
          ...req,
          status: 'rejected',
          rejectionReason: reason || 'لم يتم استيفاء المبررات الإدارية',
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser?.email || 'رئيس الدائرة',
        });
        await logAuditAction('رفض طلب', 'طلبات الاعتماد', requestId, `تم رفض الطلب بواسطة رئيس الدائرة. السبب: ${reason}`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const updateHeadEmail = async (newEmail: string) => {
    if (!isHeadOfDept) {
      alert('تغيير بريد رئيس الدائرة متاح حصراً لرئيس الدائرة الحالي.');
      return;
    }
    const trimmed = newEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      alert('يرجى كتابة عنوان بريد إلكتروني صحيح.');
      return;
    }

    setIsSyncing(true);
    try {
      const settingsRef = doc(db, 'systemSettings', 'headOffice');
      await setDoc(settingsRef, {
        headEmail: trimmed,
        departmentName: 'دائرة الاتصالات - وزارة الطوارئ وإدارة الكوارث',
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setHeadEmail(trimmed);
      await logAuditAction('تعديل بريد رئيس الدائرة', 'إعدادات النظام', trimmed, `تم تحديث البريد الإلكتروني لرئيس الدائرة إلى: ${trimmed}`);
      alert(`تم تحديث بريد رئيس الدائرة إلى: ${trimmed} بنجاح.`);
    } catch (err: any) {
      alert(`تعذر التحديث: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const requestJoinDepartment = async (roleRequested: string, notes: string) => {
    if (!currentUser) return;
    const reqId = `req_join_${Date.now()}`;
    const pendingReq: PendingRequest = {
      id: reqId,
      actionType: 'join_department',
      title: 'طلب انضمام واعتماد حساب موظف',
      details: `طلب الانضمام بصفة: ${roleRequested} - ملاحظات: ${notes}`,
      requesterUid: currentUser.uid,
      requesterEmail: currentUser.email || '',
      requesterName: currentUser.displayName || 'موظف جديد',
      payload: { roleRequested, notes },
      targetCollection: 'users',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const reqRef = doc(db, 'pendingRequests', reqId);
    await setDoc(reqRef, pendingReq);
    alert(`تم إرسال طلب الانضمام والاعتماد إلى رئيس دائرة الاتصالات (${headEmail}).`);
  };

  const resetToDefaultData = async () => {
    setDevices([]);
    setCustodyCards([]);
    setMovements([]);
    setTickets([]);
    setPhoneDirectory([]);
    setTelecomNetworks([]);
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithGoogle();
      if (res) {
        setCurrentUser(res.user);
        setGoogleToken(res.accessToken);
      }
    } catch (err) {
      alert('حدث خطأ غير متوقع أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    }
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setGoogleToken(null);
  };

  const currentProfile: UserProfile = {
    id: currentUser?.uid || 'usr_guest',
    email: currentUser?.email || '',
    displayName: currentUser?.displayName || 'المستخدم',
    role: isHeadOfDept ? 'director' : 'technician',
    department: 'دائرة الاتصالات',
    jobTitle: isHeadOfDept ? 'رئيس دائرة الاتصالات' : 'فني اتصالات وشبكات',
    createdAt: new Date().toISOString(),
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        currentProfile,
        headEmail,
        isHeadOfDept,
        setCurrentRole,
        isLoggedIn: !!currentUser,
        googleToken,
        loginWithGoogle,
        logout,
        devices,
        custodyCards,
        movements,
        tickets,
        auditLogs,
        phoneDirectory,
        telecomNetworks,
        pendingRequests,
        isLoading,
        isSyncing,
        isOffline,
        activeTab,
        setActiveTab,
        saveCustodyCard,
        deleteCustodyCard,
        saveDevice,
        deleteDevice,
        saveMovement,
        saveTicket,
        deleteTicket,
        savePhoneEntry,
        deletePhoneEntry,
        saveTelecomNetwork,
        deleteTelecomNetwork,
        approvePendingRequest,
        rejectPendingRequest,
        updateHeadEmail,
        requestJoinDepartment,
        logAuditAction,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
