import { getCachedAccessToken } from '../firebase';
import { Device, CustodyCard } from '../types';

interface SheetExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export async function exportInventoryToGoogleSheets(
  title: string,
  devices: Device[],
  custodyCards: CustodyCard[]
): Promise<SheetExportResult> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('يرجى تسجيل الدخول بحساب Google أولاً لمنح الإذن بربط جداول Google Sheets');
  }

  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `${title} - ${new Date().toLocaleDateString('ar-SY')}`,
        locale: 'ar_SY',
        timeZone: 'Asia/Damascus',
      },
      sheets: [
        { properties: { title: 'سجل الحواسيب والتجهيزات' } },
        { properties: { title: 'بطاقات العهدة الشخصية' } },
      ],
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.json();
    throw new Error(errorData.error?.message || 'فشل إنشاء جدول بيانات Google Sheets');
  }

  const spreadsheetData = await createResponse.json();
  const spreadsheetId = spreadsheetData.spreadsheetId;
  const spreadsheetUrl = spreadsheetData.spreadsheetUrl;

  const deviceRows: any[][] = [
    [
      'م',
      'اسم الجهاز',
      'النوع',
      'الشركة المصنعة',
      'الطراز',
      'الرقم التسلسلي',
      'رقم العهدة / المالي',
      'الحالة الفنية',
      'حالة التواجد',
      'الموقع / القسم',
      'الموظف المسؤول',
      'تاريخ الاستلام',
      'ملاحظات',
    ],
    ...devices.map((d, index) => [
      index + 1,
      d.name,
      d.category,
      d.manufacturer,
      d.model,
      d.serialNumber,
      d.assetNumber,
      d.condition,
      d.status,
      d.location,
      d.assignedEmployee || '-',
      d.deliveryDate || '-',
      d.notes || '',
    ]),
  ];

  const cardRows: any[][] = [
    [
      'رقم البطاقة',
      'الاسم الثلاثي للموظف',
      'الصفة الوظيفية',
      'المديرية',
      'الدائرة / الشعبة',
      'مركز العمل',
      'تاريخ الإنشاء',
      'عدد المواد المسلمة',
      'الحالة',
      'مصادقة الإدارة',
    ],
    ...custodyCards.map((c) => [
      c.cardNumber,
      c.employeeName,
      c.jobTitle,
      c.directorate,
      `${c.department} - ${c.division}`,
      c.workCenter,
      c.creationDate,
      c.items.length,
      c.status === 'active' ? 'نشطة ومسجلة' : 'مؤرشفة',
      c.adminEndorsement || 'تمت المصادقة',
    ]),
  ];

  const updateValuesResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: 'سجل الحواسيب والتجهيزات!A1',
            values: deviceRows,
          },
          {
            range: 'بطاقات العهدة الشخصية!A1',
            values: cardRows,
          },
        ],
      }),
    }
  );

  if (!updateValuesResponse.ok) {
    const errorData = await updateValuesResponse.json();
    throw new Error(errorData.error?.message || 'فشل تحديث البيانات في Google Sheets');
  }

  return { spreadsheetId, spreadsheetUrl };
}
