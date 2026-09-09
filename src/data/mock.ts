import type {
  Asn,
  InventoryRow,
  Location,
  Partner,
  PickOrder,
  PutawayTask,
  ReceivePackage,
  Warehouse,
  WarehouseKind,
} from '@/types'
import { itemById } from '@/data/items'
import { buildCartonBarcode } from '@/lib/barcode'

// ---------------- Kho ----------------
export const WH_BB = 'w-bb'
export const WH_NVL = 'w-nvl'

export const warehouses: Warehouse[] = [
  {
    id: WH_BB,
    code: 'VLB-BB',
    name: 'Kho Bao Bì',
    kind: 'BB',
    hint: 'Nhận theo tem carton · quản lý bằng Pallet ID · CÁI / THÙNG / PALLET',
  },
  {
    id: WH_NVL,
    code: 'VLB-NVL',
    name: 'Kho Nguyên vật liệu',
    kind: 'NVL',
    hint: 'Nhận theo phuy · quản lý bằng Drum ID · KG / DRUM / PALLET',
  },
]
export const warehouseById = Object.fromEntries(warehouses.map((w) => [w.id, w]))
export const kindOf = (whId: string): WarehouseKind => warehouseById[whId]?.kind ?? 'BB'

// ---------------- Đối tác ----------------
export const partners: Partner[] = [
  { id: 'sup-motul', code: 'MOTUL', name: 'Motul Asia Pacific', type: 'supplier' },
  { id: 'sup-vlbsx', code: 'VLB-SX', name: 'Vilube — Xưởng sản xuất', type: 'supplier' },
  { id: 'sup-baobi', code: 'BB-DH', name: 'Bao Bì Đại Hưng', type: 'supplier' },
  { id: 'sup-infineum', code: 'INFI', name: 'Infineum Singapore', type: 'supplier' },
  { id: 'sup-lubrizol', code: 'LZ', name: 'Lubrizol Vietnam', type: 'supplier' },
  { id: 'sup-sk', code: 'SKEP', name: 'SK Enmove — YUBASE', type: 'supplier' },
  { id: 'cus-a', code: 'CUSA', name: 'Customer A', type: 'customer' },
  { id: 'cus-b', code: 'CUSB', name: 'Customer B', type: 'customer' },
  { id: 'cus-pn', code: 'DLPN', name: 'Đại lý Phương Nam', type: 'customer' },
  { id: 'cus-line1', code: 'LINE1', name: 'Xưởng pha chế — Line 1', type: 'customer' },
  { id: 'cus-line2', code: 'LINE2', name: 'Xưởng đóng gói — Line 2', type: 'customer' },
]
export const partnerById = Object.fromEntries(partners.map((p) => [p.id, p]))

// ---------------- Vị trí ----------------
export const locations: Location[] = [
  // Kho Bao Bì
  { id: 'loc-rcv', whId: WH_BB, zone: '1000', code: 'RECV', type: 'receive' },
  { id: 'loc-a11', whId: WH_BB, zone: '1001', code: 'A1.1', type: 'storage' },
  { id: 'loc-a12', whId: WH_BB, zone: '1001', code: 'A1.2', type: 'storage' },
  { id: 'loc-a21', whId: WH_BB, zone: '1001', code: 'A2.1', type: 'storage' },
  { id: 'loc-a22', whId: WH_BB, zone: '1001', code: 'A2.2', type: 'storage' },
  { id: 'loc-b11', whId: WH_BB, zone: '1002', code: 'B1.1', type: 'storage' },
  { id: 'loc-b12', whId: WH_BB, zone: '1002', code: 'B1.2', type: 'storage' },
  { id: 'loc-b21', whId: WH_BB, zone: '1002', code: 'B2.1', type: 'storage' },
  { id: 'loc-c11', whId: WH_BB, zone: '1003', code: 'C1.1', type: 'storage' },
  { id: 'loc-c12', whId: WH_BB, zone: '1003', code: 'C1.2', type: 'storage' },
  { id: 'loc-stg', whId: WH_BB, zone: '1000', code: 'STAGE', type: 'staging' },
  // Kho Nguyên vật liệu
  { id: 'nloc-rcv', whId: WH_NVL, zone: '2000', code: 'RECV', type: 'receive' },
  { id: 'nloc-d11', whId: WH_NVL, zone: '2001', code: 'D1.1', type: 'storage' },
  { id: 'nloc-d12', whId: WH_NVL, zone: '2001', code: 'D1.2', type: 'storage' },
  { id: 'nloc-d21', whId: WH_NVL, zone: '2001', code: 'D2.1', type: 'storage' },
  { id: 'nloc-d22', whId: WH_NVL, zone: '2001', code: 'D2.2', type: 'storage' },
  { id: 'nloc-e11', whId: WH_NVL, zone: '2002', code: 'E1.1', type: 'storage' },
  { id: 'nloc-e12', whId: WH_NVL, zone: '2002', code: 'E1.2', type: 'storage' },
  { id: 'nloc-e21', whId: WH_NVL, zone: '2002', code: 'E2.1', type: 'storage' },
  { id: 'nloc-stg', whId: WH_NVL, zone: '2000', code: 'STAGE', type: 'staging' },
]
export const locationById = Object.fromEntries(locations.map((l) => [l.id, l]))
export const storageLocationsOf = (whId: string) =>
  locations.filter((l) => l.whId === whId && l.type === 'storage')

// ---------------- Loại đơn ----------------
export const inboundTypes = [
  'Nhập Nhà cung cấp',
  'Nhập BTP từ Sản xuất',
  'Tái nhập từ sản xuất',
  'Nhập trả hàng bán',
  'Nhập điều chuyển kho',
]

// ---------------- Helper ----------------
const dd = (iso: string) => {
  const d = new Date(iso)
  const p = (x: number) => String(x).padStart(2, '0')
  return `${p(d.getDate())}${p(d.getMonth() + 1)}${String(d.getFullYear()).slice(2)}`
}
/** Số lô nội bộ = ddMMyy(NSX)-ddMMyy(ngày nhập) — theo mẫu 270926-140726 trong HDSD */
export const mkLotInternal = (mfg: string, received: string) => `${dd(mfg)}-${dd(received)}`

/** Carton kho Bao Bì — mã carton chính là 7 ký tự cuối của barcode (mã kiểm tra trùng) */
const mkCartons = (itemCode: string, n: number, qty: number, firstCheck: number): ReceivePackage[] =>
  Array.from({ length: n }, (_, i) => {
    const check = String(firstCheck + i).padStart(7, '0')
    return { code: check, barcode: buildCartonBarcode(itemCode, qty, 'PCE', check), qty, received: false }
  })

/** Phuy kho NVL — quét thẳng DrumID, không có barcode ghép chuỗi */
const mkDrums = (prefix: string, n: number, qty: number): ReceivePackage[] =>
  Array.from({ length: n }, (_, i) => ({
    code: `${prefix}${String(i + 1).padStart(4, '0')}`,
    qty,
    received: false,
  }))

/** số lượng 1 thùng theo masterdata */
const perCtn = (itemId: string) => itemById[itemId]?.unitsPerCarton ?? 1
/** số kg 1 phuy theo masterdata */
const perDrum = (itemId: string) => itemById[itemId]?.kgPerCarton ?? 1

// ============================================================
// KHO BAO BÌ
// ============================================================

export const asns: Asn[] = [
  // Đơn dùng cho bộ test case phần 5 của HDSD — số liệu khớp bảng 5.2
  {
    id: 'asn-1',
    whId: WH_BB,
    code: '25000000002',
    pnk: 'MDTRDS2220240',
    supplierId: 'sup-motul',
    type: 'Nhập Nhà cung cấp',
    deliveryDate: '2024-08-20',
    note: '',
    status: 'NEW',
    lines: [
      {
        id: 'asn1-l1',
        itemId: '9082228',
        qtyExpected: 9000,
        qtyReceived: 0,
        lot: '2613030000',
        lotInternal: mkLotInternal('2026-09-27', '2024-08-20'),
        mfgDate: '2026-09-27',
        expDate: '2028-09-27',
        packages: mkCartons('9082228', 3, 3000, 8083),
      },
    ],
  },
  {
    id: 'asn-2',
    whId: WH_BB,
    code: '25000000003',
    pnk: 'MDTRDS2220241',
    supplierId: 'sup-vlbsx',
    type: 'Nhập BTP từ Sản xuất',
    deliveryDate: '2024-08-20',
    note: 'Hàng chưa dán tem',
    status: 'NEW',
    lines: [
      {
        id: 'asn2-l1',
        itemId: '9083101',
        qtyExpected: perCtn('9083101') * 4,
        qtyReceived: 0,
        lot: '2613030010',
        lotInternal: mkLotInternal('2026-07-14', '2024-08-20'),
        mfgDate: '2026-07-14',
        expDate: '2028-07-14',
        packages: [],
      },
      {
        id: 'asn2-l2',
        itemId: '9084010',
        qtyExpected: perCtn('9084010') * 2,
        qtyReceived: 0,
        lot: '',
        lotInternal: '',
        mfgDate: '',
        expDate: '',
        packages: [],
      },
    ],
  },
  {
    id: 'asn-3',
    whId: WH_BB,
    code: '25000000004',
    pnk: 'MDTRDS2220242',
    supplierId: 'sup-baobi',
    type: 'Nhập Nhà cung cấp',
    deliveryDate: '2024-08-21',
    note: '',
    status: 'NEW',
    lines: [
      {
        id: 'asn3-l1',
        itemId: '9085220',
        qtyExpected: perCtn('9085220') * 5,
        qtyReceived: 0,
        lot: '2613030020',
        lotInternal: mkLotInternal('2026-05-10', '2024-08-21'),
        mfgDate: '2026-05-10',
        expDate: '2028-05-10',
        packages: mkCartons('9085220', 5, perCtn('9085220'), 9001),
      },
      {
        id: 'asn3-l2',
        itemId: '9083104',
        qtyExpected: perCtn('9083104') * 4,
        qtyReceived: 0,
        lot: '2613030021',
        lotInternal: mkLotInternal('2026-05-10', '2024-08-21'),
        mfgDate: '2026-05-10',
        expDate: '2028-05-10',
        packages: mkCartons('9083104', 4, perCtn('9083104'), 9101),
      },
    ],
  },

  // ============================================================
  // KHO NGUYÊN VẬT LIỆU
  // ============================================================
  {
    id: 'nasn-1',
    whId: WH_NVL,
    code: '26000000010',
    pnk: 'MDNVL2400115',
    supplierId: 'sup-sk',
    type: 'Nhập Nhà cung cấp',
    deliveryDate: '2024-08-20',
    note: '',
    status: 'NEW',
    lines: [
      {
        id: 'nasn1-l1',
        itemId: '7101500',
        qtyExpected: perDrum('7101500') * 8,
        qtyReceived: 0,
        lot: '2711050000',
        lotInternal: mkLotInternal('2026-06-12', '2024-08-20'),
        mfgDate: '2026-06-12',
        expDate: '2029-06-12',
        packages: mkDrums('DRM10', 8, perDrum('7101500')),
      },
      {
        id: 'nasn1-l2',
        itemId: '7103004',
        qtyExpected: perDrum('7103004') * 4,
        qtyReceived: 0,
        lot: '2711050001',
        lotInternal: mkLotInternal('2026-06-12', '2024-08-20'),
        mfgDate: '2026-06-12',
        expDate: '2029-06-12',
        packages: mkDrums('DRM11', 4, perDrum('7103004')),
      },
    ],
  },
  {
    id: 'nasn-2',
    whId: WH_NVL,
    code: '26000000011',
    pnk: 'MDNVL2400116',
    supplierId: 'sup-infineum',
    type: 'Nhập Nhà cung cấp',
    deliveryDate: '2024-08-21',
    note: 'Phụ gia — kiểm tra CoA trước khi nhận',
    status: 'NEW',
    lines: [
      {
        id: 'nasn2-l1',
        itemId: '7202133',
        qtyExpected: perDrum('7202133') * 4,
        qtyReceived: 0,
        lot: '2711050010',
        lotInternal: mkLotInternal('2026-04-02', '2024-08-21'),
        mfgDate: '2026-04-02',
        expDate: '2028-04-02',
        packages: mkDrums('DRM20', 4, perDrum('7202133')),
      },
    ],
  },
  {
    id: 'nasn-3',
    whId: WH_NVL,
    code: '26000000012',
    pnk: 'MDNVL2400117',
    supplierId: 'sup-vlbsx',
    type: 'Tái nhập từ sản xuất',
    deliveryDate: '2024-08-21',
    note: 'Phuy dùng dở trả về kho',
    status: 'NEW',
    lines: [
      {
        id: 'nasn3-l1',
        itemId: '7207750',
        qtyExpected: 240,
        qtyReceived: 0,
        lot: '',
        lotInternal: '',
        mfgDate: '',
        expDate: '',
        packages: [],
      },
    ],
  },
]

// ---------------- Công việc cất hàng (đã nhận, chờ cất) ----------------
export const putaways: PutawayTask[] = [
  {
    id: 'pa-1',
    whId: WH_BB,
    wmsCode: 'WMS24080012',
    asnCode: '25000000001',
    receivedDate: '2024-08-19',
    type: 'Nhập Nhà cung cấp',
    status: 'NEW',
    pallets: [
      {
        id: 'pa1-p1',
        palletId: 'PLT000001',
        itemId: '9082230',
        qty: perCtn('9082230') * 4,
        unit: 'PALLET',
        lot: '2613030040',
        lotInternal: mkLotInternal('2026-06-26', '2024-08-19'),
        mfgDate: '2026-06-26',
        expDate: '2028-06-26',
        suggestedLocationId: 'loc-a11',
      },
      {
        id: 'pa1-p2',
        palletId: 'PLT000002',
        itemId: '9083101',
        qty: perCtn('9083101') * 8,
        unit: 'PALLET',
        lot: '2613030041',
        lotInternal: mkLotInternal('2026-06-26', '2024-08-19'),
        mfgDate: '2026-06-26',
        expDate: '2028-06-26',
        suggestedLocationId: 'loc-a12',
      },
      {
        id: 'pa1-p3',
        palletId: 'PLT000003',
        itemId: '9086015',
        qty: perCtn('9086015') * 6,
        unit: 'PALLET',
        lot: '2613030042',
        lotInternal: mkLotInternal('2026-06-26', '2024-08-19'),
        mfgDate: '2026-06-26',
        expDate: '2028-06-26',
        suggestedLocationId: 'loc-b11',
      },
    ],
  },
  {
    id: 'npa-1',
    whId: WH_NVL,
    wmsCode: 'WMS24080031',
    asnCode: '26000000009',
    receivedDate: '2024-08-19',
    type: 'Nhập Nhà cung cấp',
    status: 'NEW',
    pallets: [
      {
        id: 'npa1-p1',
        palletId: 'DRM090001',
        itemId: '7101150',
        qty: perDrum('7101150'),
        unit: 'DRUM',
        lot: '2711040000',
        lotInternal: mkLotInternal('2026-05-08', '2024-08-19'),
        mfgDate: '2026-05-08',
        expDate: '2029-05-08',
        suggestedLocationId: 'nloc-d11',
      },
      {
        id: 'npa1-p2',
        palletId: 'DRM090002',
        itemId: '7101150',
        qty: perDrum('7101150'),
        unit: 'DRUM',
        lot: '2711040000',
        lotInternal: mkLotInternal('2026-05-08', '2024-08-19'),
        mfgDate: '2026-05-08',
        expDate: '2029-05-08',
        suggestedLocationId: 'nloc-d12',
      },
      {
        id: 'npa1-p3',
        palletId: 'DRM090003',
        itemId: '7203910',
        qty: perDrum('7203910'),
        unit: 'DRUM',
        lot: '2711040005',
        lotInternal: mkLotInternal('2026-05-08', '2024-08-19'),
        mfgDate: '2026-05-08',
        expDate: '2028-05-08',
        suggestedLocationId: 'nloc-e11',
      },
    ],
  },
]

// ---------------- Phiếu soạn tổng (Soạn hàng) ----------------
export const pickOrders: PickOrder[] = [
  {
    id: 'so-1',
    whId: WH_BB,
    soNumber: '25000000002',
    code: 'MDTRDS2220241',
    customerId: 'cus-line2',
    deliveryDate: '2024-08-20',
    status: 'NEW',
    lines: [
      {
        id: 'so1-l1',
        zone: '1001',
        locationId: 'loc-a21',
        palletId: 'PLT000101',
        itemId: '9082228',
        lotNcc: '2600123456',
        lot: '2600123456',
        mfgDate: '2026-09-27',
        expDate: '2028-09-27',
        qtyRequired: 6000,
        unit: 'CÁI',
        qtyPicked: 0,
      },
      {
        id: 'so1-l2',
        zone: '1001',
        locationId: 'loc-a22',
        palletId: 'PLT000104',
        itemId: '9084010',
        lotNcc: '2600123457',
        lot: '2600123457',
        mfgDate: '2026-06-26',
        expDate: '2028-06-26',
        qtyRequired: 5000,
        unit: 'CÁI',
        qtyPicked: 0,
      },
      {
        id: 'so1-l3',
        zone: '1002',
        locationId: 'loc-b21',
        palletId: 'PLT000107',
        itemId: '9086015',
        lotNcc: '2600123458',
        lot: '2600123458',
        mfgDate: '2026-05-05',
        expDate: '2028-05-05',
        qtyRequired: 60,
        unit: 'CÁI',
        qtyPicked: 0,
      },
    ],
  },
  {
    id: 'so-2',
    whId: WH_BB,
    soNumber: '25000000002',
    code: 'MDTRDS2220240',
    customerId: 'cus-a',
    deliveryDate: '2024-08-20',
    status: 'NEW',
    lines: [
      {
        id: 'so2-l1',
        zone: '1001',
        locationId: 'loc-a11',
        palletId: 'PLT000102',
        itemId: '9083104',
        lotNcc: '2600123460',
        lot: '2600123460',
        mfgDate: '2026-04-18',
        expDate: '2028-04-18',
        qtyRequired: 800,
        unit: 'CÁI',
        qtyPicked: 0,
      },
      {
        id: 'so2-l2',
        zone: '1003',
        locationId: 'loc-c12',
        palletId: 'PLT000111',
        itemId: '9085220',
        lotNcc: '2600123461',
        lot: '2600123461',
        mfgDate: '2026-07-14',
        expDate: '2028-07-14',
        qtyRequired: 10000,
        unit: 'CÁI',
        qtyPicked: 0,
      },
    ],
  },
  {
    id: 'so-3',
    whId: WH_BB,
    soNumber: '25000000003',
    code: 'MDTRDS2220243',
    customerId: 'cus-pn',
    deliveryDate: '2024-08-21',
    note: 'Giao trước 10h',
    status: 'NEW',
    lines: [
      {
        id: 'so3-l1',
        zone: '1002',
        locationId: 'loc-b12',
        palletId: 'PLT000109',
        itemId: '9083101',
        lotNcc: '2600123470',
        lot: '2600123470',
        mfgDate: '2026-03-02',
        expDate: '2028-03-02',
        qtyRequired: 1200,
        unit: 'CÁI',
        qtyPicked: 0,
      },
    ],
  },
  // ---- Kho NVL: phiếu xuất NVL cho xưởng pha chế ----
  {
    id: 'nso-1',
    whId: WH_NVL,
    soNumber: '26000000020',
    code: 'MDNVL2400220',
    customerId: 'cus-line1',
    deliveryDate: '2024-08-20',
    status: 'NEW',
    lines: [
      {
        id: 'nso1-l1',
        zone: '2001',
        locationId: 'nloc-d21',
        palletId: 'DRM080011',
        itemId: '7101500',
        lotNcc: '2711030000',
        lot: '2711030000',
        mfgDate: '2026-06-12',
        expDate: '2029-06-12',
        qtyRequired: 180,
        unit: 'KG',
        qtyPicked: 0,
      },
      {
        id: 'nso1-l2',
        zone: '2001',
        locationId: 'nloc-d22',
        palletId: 'DRM080014',
        itemId: '7101900',
        lotNcc: '2711030004',
        lot: '2711030004',
        mfgDate: '2026-06-12',
        expDate: '2029-06-12',
        qtyRequired: 186,
        unit: 'KG',
        qtyPicked: 0,
      },
      {
        id: 'nso1-l3',
        zone: '2002',
        locationId: 'nloc-e12',
        palletId: 'DRM080021',
        itemId: '7202133',
        lotNcc: '2711030010',
        lot: '2711030010',
        mfgDate: '2026-04-02',
        expDate: '2028-04-02',
        qtyRequired: 95,
        unit: 'KG',
        qtyPicked: 0,
      },
    ],
  },
  {
    id: 'nso-2',
    whId: WH_NVL,
    soNumber: '26000000021',
    code: 'MDNVL2400221',
    customerId: 'cus-line2',
    deliveryDate: '2024-08-21',
    status: 'NEW',
    lines: [
      {
        id: 'nso2-l1',
        zone: '2002',
        locationId: 'nloc-e21',
        palletId: 'DRM080031',
        itemId: '7207750',
        lotNcc: '2711030020',
        lot: '2711030020',
        mfgDate: '2026-02-18',
        expDate: '2028-02-18',
        qtyRequired: 188,
        unit: 'KG',
        qtyPicked: 0,
      },
    ],
  },
]

// ---------------- Tồn kho ----------------
export const inventory: InventoryRow[] = [
  { id: 'inv-1', whId: WH_BB, itemId: '9082228', locationId: 'loc-a21', palletId: 'PLT000101', lot: '2600123456', lotInternal: '270926-190824', mfgDate: '2026-09-27', expDate: '2028-09-27', qty: 12000 },
  { id: 'inv-2', whId: WH_BB, itemId: '9084010', locationId: 'loc-a22', palletId: 'PLT000104', lot: '2600123457', lotInternal: '260626-190824', mfgDate: '2026-06-26', expDate: '2028-06-26', qty: 30000 },
  { id: 'inv-3', whId: WH_BB, itemId: '9086015', locationId: 'loc-b21', palletId: 'PLT000107', lot: '2600123458', lotInternal: '050526-190824', mfgDate: '2026-05-05', expDate: '2028-05-05', qty: 360 },
  { id: 'inv-4', whId: WH_BB, itemId: '9083104', locationId: 'loc-a11', palletId: 'PLT000102', lot: '2600123460', lotInternal: '180426-190824', mfgDate: '2026-04-18', expDate: '2028-04-18', qty: 3200 },
  { id: 'inv-5', whId: WH_BB, itemId: '9085220', locationId: 'loc-c12', palletId: 'PLT000111', lot: '2600123461', lotInternal: '140726-190824', mfgDate: '2026-07-14', expDate: '2028-07-14', qty: 50000 },
  { id: 'inv-6', whId: WH_BB, itemId: '9083101', locationId: 'loc-b12', palletId: 'PLT000109', lot: '2600123470', lotInternal: '020326-190824', mfgDate: '2026-03-02', expDate: '2028-03-02', qty: 9600 },
  { id: 'ninv-1', whId: WH_NVL, itemId: '7101500', locationId: 'nloc-d21', palletId: 'DRM080011', lot: '2711030000', lotInternal: '120626-190824', mfgDate: '2026-06-12', expDate: '2029-06-12', qty: 720 },
  { id: 'ninv-2', whId: WH_NVL, itemId: '7101900', locationId: 'nloc-d22', palletId: 'DRM080014', lot: '2711030004', lotInternal: '120626-190824', mfgDate: '2026-06-12', expDate: '2029-06-12', qty: 744 },
  { id: 'ninv-3', whId: WH_NVL, itemId: '7202133', locationId: 'nloc-e12', palletId: 'DRM080021', lot: '2711030010', lotInternal: '020426-190824', mfgDate: '2026-04-02', expDate: '2028-04-02', qty: 380 },
  { id: 'ninv-4', whId: WH_NVL, itemId: '7207750', locationId: 'nloc-e21', palletId: 'DRM080031', lot: '2711030020', lotInternal: '180226-190824', mfgDate: '2026-02-18', expDate: '2028-02-18', qty: 376 },
]

// ---------------- Người dùng demo ----------------
export const demoUsers = [{ id: 'u-1', name: 'Nguyễn Văn Tâm', role: 'thukho' as const, code: 'NV001' }]
