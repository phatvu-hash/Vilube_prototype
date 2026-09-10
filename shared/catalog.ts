// ============================================================
// Danh mục nền dùng chung cho app và Worker: kho, đối tác, vị trí, loại đơn.
// Chỉ dùng đường dẫn tương đối để Worker bundle được.
// ============================================================
import type { Location, Warehouse, WarehouseKind } from './types'

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
/** 'BB' / 'NVL' trong Sheet → id kho nội bộ */
export const whIdOfKind = (kind: string) => (kind.trim().toUpperCase() === 'NVL' ? WH_NVL : WH_BB)

const storage = (whId: string, zone: string, code: string): Location => ({
  id: `loc-${whId === WH_BB ? 'bb' : 'nvl'}-${code.toLowerCase().replace('.', '')}`,
  whId,
  zone,
  code,
  type: 'storage',
})

export const locations: Location[] = [
  // Kho Bao Bì
  { id: 'loc-bb-recv', whId: WH_BB, zone: '1000', code: 'RECV', type: 'receive' },
  storage(WH_BB, '1001', 'A1.1'),
  storage(WH_BB, '1001', 'A1.2'),
  storage(WH_BB, '1001', 'A2.1'),
  storage(WH_BB, '1001', 'A2.2'),
  storage(WH_BB, '1002', 'B1.1'),
  storage(WH_BB, '1002', 'B1.2'),
  storage(WH_BB, '1002', 'B2.1'),
  storage(WH_BB, '1002', 'B2.2'),
  storage(WH_BB, '1003', 'C1.1'),
  storage(WH_BB, '1003', 'C1.2'),
  storage(WH_BB, '1003', 'C2.1'),
  { id: 'loc-bb-stage', whId: WH_BB, zone: '1000', code: 'STAGE', type: 'staging' },
  // Kho Nguyên vật liệu
  { id: 'loc-nvl-recv', whId: WH_NVL, zone: '2000', code: 'RECV', type: 'receive' },
  storage(WH_NVL, '2001', 'D1.1'),
  storage(WH_NVL, '2001', 'D1.2'),
  storage(WH_NVL, '2001', 'D2.1'),
  storage(WH_NVL, '2001', 'D2.2'),
  storage(WH_NVL, '2002', 'E1.1'),
  storage(WH_NVL, '2002', 'E1.2'),
  storage(WH_NVL, '2002', 'E2.1'),
  storage(WH_NVL, '2002', 'E2.2'),
  { id: 'loc-nvl-stage', whId: WH_NVL, zone: '2000', code: 'STAGE', type: 'staging' },
]
export const locationById = Object.fromEntries(locations.map((l) => [l.id, l]))
export const storageLocationsOf = (whId: string) =>
  locations.filter((l) => l.whId === whId && l.type === 'storage')
/** Vị trí confirm — nơi hàng soạn vượt được unpick về sau khi chiết rót */
export const confirmLocationOf = (whId: string) =>
  locations.find((l) => l.whId === whId && l.type === 'staging')
/** Tra vị trí theo mã hiển thị (A1.1) trong phạm vi một kho */
export const locationByCode = (whId: string, code: string) =>
  locations.find((l) => l.whId === whId && l.code.toUpperCase() === code.trim().toUpperCase())

export const inboundTypes = [
  'Nhập Nhà cung cấp',
  'Nhập BTP từ Sản xuất',
  'Tái nhập từ sản xuất',
  'Nhập trả hàng bán',
  'Nhập điều chuyển kho',
]

// ---------------- Helper dùng chung ----------------
const dd = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '000000'
  const p = (x: number) => String(x).padStart(2, '0')
  return `${p(d.getDate())}${p(d.getMonth() + 1)}${String(d.getFullYear()).slice(2)}`
}
/** Số lô nội bộ = ddMMyy(NSX)-ddMMyy(ngày nhập) — theo mẫu 270926-140726 trong HDSD */
export const mkLotInternal = (mfg: string, received: string) =>
  mfg ? `${dd(mfg)}-${dd(received)}` : ''
