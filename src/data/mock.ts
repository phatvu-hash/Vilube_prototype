import type {
  Asn,
  Carton,
  InventoryRow,
  Location,
  Partner,
  PickOrder,
  PutawayTask,
  Warehouse,
} from '@/types'
import { itemById } from '@/data/items'

// ---------------- Kho ----------------
export const warehouses: Warehouse[] = [
  { id: 'w-bb', code: 'VLB-BB', name: 'Kho Bao Bì Vilube' },
]
export const warehouseById = Object.fromEntries(warehouses.map((w) => [w.id, w]))

// ---------------- Đối tác ----------------
export const partners: Partner[] = [
  { id: 'sup-motul', code: 'MOTUL', name: 'Motul Asia Pacific', type: 'supplier' },
  { id: 'sup-vlbsx', code: 'VLB-SX', name: 'Vilube — Xưởng sản xuất', type: 'supplier' },
  { id: 'sup-baobi', code: 'BB-DH', name: 'Bao Bì Đại Hưng', type: 'supplier' },
  { id: 'cus-a', code: 'CUSA', name: 'Customer A', type: 'customer' },
  { id: 'cus-b', code: 'CUSB', name: 'Customer B', type: 'customer' },
  { id: 'cus-pn', code: 'DLPN', name: 'Đại lý Phương Nam', type: 'customer' },
]
export const partnerById = Object.fromEntries(partners.map((p) => [p.id, p]))

// ---------------- Vị trí ----------------
export const locations: Location[] = [
  { id: 'loc-rcv', zone: '1000', code: 'RECV', type: 'receive' },
  { id: 'loc-a11', zone: '1001', code: 'A1.1', type: 'storage' },
  { id: 'loc-a12', zone: '1001', code: 'A1.2', type: 'storage' },
  { id: 'loc-a21', zone: '1001', code: 'A2.1', type: 'storage' },
  { id: 'loc-a22', zone: '1001', code: 'A2.2', type: 'storage' },
  { id: 'loc-b11', zone: '1002', code: 'B1.1', type: 'storage' },
  { id: 'loc-b12', zone: '1002', code: 'B1.2', type: 'storage' },
  { id: 'loc-b21', zone: '1002', code: 'B2.1', type: 'storage' },
  { id: 'loc-c11', zone: '1003', code: 'C1.1', type: 'storage' },
  { id: 'loc-c12', zone: '1003', code: 'C1.2', type: 'storage' },
  { id: 'loc-stg', zone: '1000', code: 'STAGE', type: 'staging' },
]
export const locationById = Object.fromEntries(locations.map((l) => [l.id, l]))
export const storageLocations = locations.filter((l) => l.type === 'storage')

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

const mkCartons = (prefix: string, n: number, qty: number): Carton[] =>
  Array.from({ length: n }, (_, i) => ({
    code: `${prefix}${String(i + 1).padStart(3, '0')}`,
    qty,
    received: false,
  }))

/** số lượng 1 thùng theo masterdata */
const perCtn = (itemId: string) => itemById[itemId]?.unitsPerCarton ?? 1

// ---------------- Đơn nhập (Nhận hàng) ----------------
export const asns: Asn[] = [
  {
    id: 'asn-1',
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
        itemId: '103207',
        qtyExpected: perCtn('103207') * 6,
        qtyReceived: 0,
        lot: '2613030000',
        lotInternal: mkLotInternal('2026-09-27', '2024-08-20'),
        mfgDate: '2026-09-27',
        expDate: '2028-09-27',
        cartons: mkCartons('CTN103207', 6, perCtn('103207')),
      },
      {
        id: 'asn1-l2',
        itemId: '103208',
        qtyExpected: perCtn('103208') * 5,
        qtyReceived: 0,
        lot: '2613030001',
        lotInternal: mkLotInternal('2026-09-27', '2024-08-20'),
        mfgDate: '2026-09-27',
        expDate: '2028-09-27',
        cartons: mkCartons('CTN103208', 5, perCtn('103208')),
      },
      {
        id: 'asn1-l3',
        itemId: '104179',
        qtyExpected: 24,
        qtyReceived: 0,
        lot: '2613030002',
        lotInternal: mkLotInternal('2026-08-15', '2024-08-20'),
        mfgDate: '2026-08-15',
        expDate: '2028-08-15',
        cartons: mkCartons('CTN104179', 6, 4),
      },
    ],
  },
  {
    id: 'asn-2',
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
        itemId: '102797',
        qtyExpected: 189 * 4, // 4 phuy × 189 kg
        qtyReceived: 0,
        lot: '2613030010',
        lotInternal: mkLotInternal('2026-07-14', '2024-08-20'),
        mfgDate: '2026-07-14',
        expDate: '2028-07-14',
        cartons: [],
      },
      {
        id: 'asn2-l2',
        itemId: '103900',
        qtyExpected: perCtn('103900') * 8,
        qtyReceived: 0,
        lot: '',
        lotInternal: '',
        mfgDate: '',
        expDate: '',
        cartons: [],
      },
    ],
  },
  {
    id: 'asn-3',
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
        itemId: '103897',
        qtyExpected: perCtn('103897') * 10,
        qtyReceived: 0,
        lot: '2613030020',
        lotInternal: mkLotInternal('2026-05-10', '2024-08-21'),
        mfgDate: '2026-05-10',
        expDate: '2028-05-10',
        cartons: mkCartons('CTN103897', 10, perCtn('103897')),
      },
    ],
  },
]

// ---------------- Công việc cất hàng (đã nhận, chờ cất) ----------------
export const putaways: PutawayTask[] = [
  {
    id: 'pa-1',
    wmsCode: 'WMS24080012',
    asnCode: '25000000001',
    receivedDate: '2024-08-19',
    type: 'Nhập Nhà cung cấp',
    status: 'NEW',
    pallets: [
      {
        id: 'pa1-p1',
        palletId: 'DR000001',
        itemId: '103283',
        qty: 20 * 32,
        unit: 'PALLET',
        lot: '2613030000',
        lotInternal: mkLotInternal('2026-06-26', '2024-08-19'),
        mfgDate: '2026-06-26',
        expDate: '2027-06-26',
        suggestedLocationId: 'loc-a11',
      },
      {
        id: 'pa1-p2',
        palletId: 'DR000002',
        itemId: '103285',
        qty: 4 * 36,
        unit: 'PALLET',
        lot: '2613030003',
        lotInternal: mkLotInternal('2026-06-26', '2024-08-19'),
        mfgDate: '2026-06-26',
        expDate: '2027-06-26',
        suggestedLocationId: 'loc-a12',
      },
      {
        id: 'pa1-p3',
        palletId: 'DR000003',
        itemId: '107262',
        qty: 36,
        unit: 'PALLET',
        lot: '2613030004',
        lotInternal: mkLotInternal('2026-06-26', '2024-08-19'),
        mfgDate: '2026-06-26',
        expDate: '2027-06-26',
        suggestedLocationId: 'loc-b11',
      },
    ],
  },
  {
    id: 'pa-2',
    wmsCode: 'WMS24080013',
    asnCode: '25000000005',
    receivedDate: '2024-08-19',
    type: 'Tái nhập từ sản xuất',
    status: 'NEW',
    pallets: [
      {
        id: 'pa2-p1',
        palletId: 'DR000010',
        itemId: '102798',
        qty: 187.8 * 4,
        unit: 'PALLET',
        lot: '2613030030',
        lotInternal: mkLotInternal('2026-07-01', '2024-08-19'),
        mfgDate: '2026-07-01',
        expDate: '2028-07-01',
        suggestedLocationId: 'loc-c11',
      },
    ],
  },
]

// ---------------- Phiếu soạn tổng (Soạn hàng) ----------------
export const pickOrders: PickOrder[] = [
  {
    id: 'so-1',
    soNumber: '25000000002',
    code: 'MDTRDS2220241',
    customerId: 'cus-b',
    deliveryDate: '2024-08-20',
    status: 'NEW',
    lines: [
      {
        id: 'so1-l1',
        zone: '1001',
        locationId: 'loc-a21',
        palletId: 'DR000001',
        itemId: '103207',
        lotNcc: '2600123456',
        lot: '2600123456',
        mfgDate: '2026-09-27',
        expDate: '2027-09-27',
        qtyRequired: 60,
        unit: 'CÁI',
        qtyPicked: 0,
      },
      {
        id: 'so1-l2',
        zone: '1001',
        locationId: 'loc-a22',
        palletId: 'DR000004',
        itemId: '103285',
        lotNcc: '2600123457',
        lot: '2600123457',
        mfgDate: '2026-06-26',
        expDate: '2027-06-26',
        qtyRequired: 24,
        unit: 'CÁI',
        qtyPicked: 0,
      },
      {
        id: 'so1-l3',
        zone: '1002',
        locationId: 'loc-b21',
        palletId: 'DR000007',
        itemId: '107262',
        lotNcc: '2600123458',
        lot: '2600123458',
        mfgDate: '2026-05-05',
        expDate: '2028-05-05',
        qtyRequired: 8,
        unit: 'CÁI',
        qtyPicked: 0,
      },
    ],
  },
  {
    id: 'so-2',
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
        palletId: 'DR000002',
        itemId: '103796',
        lotNcc: '2600123460',
        lot: '2600123460',
        mfgDate: '2026-04-18',
        expDate: '2028-04-18',
        qtyRequired: 120,
        unit: 'CÁI',
        qtyPicked: 0,
      },
      {
        id: 'so2-l2',
        zone: '1003',
        locationId: 'loc-c12',
        palletId: 'DR000011',
        itemId: '102797',
        lotNcc: '2600123461',
        lot: '2600123461',
        mfgDate: '2026-07-14',
        expDate: '2028-07-14',
        qtyRequired: 189,
        unit: 'DRUM',
        qtyPicked: 0,
      },
    ],
  },
  {
    id: 'so-3',
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
        palletId: 'DR000009',
        itemId: '104919',
        lotNcc: '2600123470',
        lot: '2600123470',
        mfgDate: '2026-03-02',
        expDate: '2028-03-02',
        qtyRequired: 40,
        unit: 'CÁI',
        qtyPicked: 0,
      },
    ],
  },
]

// ---------------- Tồn kho ----------------
export const inventory: InventoryRow[] = [
  { id: 'inv-1', itemId: '103207', locationId: 'loc-a21', palletId: 'DR000001', lot: '2600123456', lotInternal: '270926-190824', mfgDate: '2026-09-27', expDate: '2027-09-27', qty: 480 },
  { id: 'inv-2', itemId: '103285', locationId: 'loc-a22', palletId: 'DR000004', lot: '2600123457', lotInternal: '260626-190824', mfgDate: '2026-06-26', expDate: '2027-06-26', qty: 144 },
  { id: 'inv-3', itemId: '107262', locationId: 'loc-b21', palletId: 'DR000007', lot: '2600123458', lotInternal: '050526-190824', mfgDate: '2026-05-05', expDate: '2028-05-05', qty: 36 },
  { id: 'inv-4', itemId: '103796', locationId: 'loc-a11', palletId: 'DR000002', lot: '2600123460', lotInternal: '180426-190824', mfgDate: '2026-04-18', expDate: '2028-04-18', qty: 576 },
  { id: 'inv-5', itemId: '102797', locationId: 'loc-c12', palletId: 'DR000011', lot: '2600123461', lotInternal: '140726-190824', mfgDate: '2026-07-14', expDate: '2028-07-14', qty: 756 },
  { id: 'inv-6', itemId: '104919', locationId: 'loc-b12', palletId: 'DR000009', lot: '2600123470', lotInternal: '020326-190824', mfgDate: '2026-03-02', expDate: '2028-03-02', qty: 96 },
]

// ---------------- Người dùng demo ----------------
export const demoUsers = [
  { id: 'u-1', name: 'Nguyễn Văn Tâm', role: 'thukho' as const, warehouseId: 'w-bb', code: 'NV001' },
]
