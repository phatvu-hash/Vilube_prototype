// ============================================================
// Domain types — bám HDSD WMS App Vilube (Kho Bao Bì + Kho NVL)
// ============================================================

export type Role = 'thukho' | 'picker' | 'receiver'

/** Loại kho — quyết định giao diện và nghiệp vụ bên trong */
export type WarehouseKind = 'BB' | 'NVL'

export interface Warehouse {
  id: string
  code: string
  name: string
  kind: WarehouseKind
  /** Mô tả ngắn hiện ở màn hình Chọn kho */
  hint: string
}

export interface Location {
  id: string
  whId: string
  zone: string // khu vực, vd 1001
  code: string // vị trí, vd A1.1
  type: 'storage' | 'receive' | 'staging'
}

// ---------- Nhận hàng (đơn nhập / ASN) ----------
export type AsnStatus = 'NEW' | 'PARTIAL' | 'RECEIVED'

/**
 * 1 kiện hàng đã được đăng ký sẵn trên đơn nhập.
 *  - Kho Bao Bì: 1 thùng carton dán tem — quét barcode là ra đủ thông tin.
 *  - Kho NVL:    1 phuy — quét DrumID là ra đủ thông tin.
 */
export interface ReceivePackage {
  code: string // mã carton / mã phuy in trên tem
  barcode?: string // barcode đầy đủ (kho Bao Bì): 9082228|3000|PCE|0008083
  qty: number // số lượng (đơn vị cơ sở) trong kiện
  received: boolean
}

export interface AsnLine {
  id: string
  itemId: string
  qtyExpected: number // đơn vị cơ sở
  qtyReceived: number
  lot: string // số lô
  lotInternal: string // số lô nội bộ
  mfgDate: string
  expDate: string
  packages: ReceivePackage[]
}

export interface Asn {
  id: string
  whId: string
  code: string // mã đơn
  pnk: string // số đơn nhập
  supplierName: string
  type: string // loại đơn nhập
  deliveryDate: string
  note?: string
  status: AsnStatus
  assignedTo?: string
  lines: AsnLine[]
}

// ---------- Cất hàng (putaway) ----------
export interface PutawayPallet {
  id: string
  palletId: string // Kho BB: Pallet ID · Kho NVL: Drum ID
  itemId: string
  qty: number // đơn vị cơ sở
  unit: string // đơn vị lúc nhận
  lot: string
  lotInternal: string
  mfgDate: string
  expDate: string
  suggestedLocationId: string
  toLocationId?: string
}

export type PutawayStatus = 'NEW' | 'IN_PROGRESS' | 'DONE'

export interface PutawayTask {
  id: string
  whId: string
  wmsCode: string // mã WMS
  asnCode: string // mã đơn
  receivedDate: string // ngày nhập hàng
  type: string // loại đơn
  status: PutawayStatus
  assignedTo?: string
  pallets: PutawayPallet[]
}

// ---------- Soạn hàng theo phiếu soạn tổng ----------
export type PickStatus = 'NEW' | 'PICKING' | 'PICKED'

export interface PickLine {
  id: string
  zone: string // khu vực
  locationId: string
  palletId: string // Kho BB: Pallet ID · Kho NVL: Drum ID
  itemId: string
  lotNcc: string // số lô NCC
  lot: string // số lô
  mfgDate: string
  expDate: string
  qtyRequired: number // đơn vị cơ sở
  unit: string // đơn vị đề xuất soạn
  qtyPicked: number
}

export interface PickOrder {
  id: string
  whId: string
  soNumber: string // số đơn hàng
  code: string // mã đơn hàng
  customerName: string
  deliveryDate: string
  note?: string
  status: PickStatus
  assignedTo?: string
  lines: PickLine[]
}

// ---------- Tồn ----------
export interface InventoryRow {
  id: string
  whId: string
  itemId: string
  locationId: string
  palletId: string
  lot: string
  lotInternal: string
  mfgDate: string
  expDate: string
  qty: number // đơn vị cơ sở
}

// ---------- Nhập hàng chủ động (Other work) ----------
export interface DirectReceipt {
  id: string
  whId: string
  orderType: string
  postingDate: string
  itemId: string
  palletId: string
  lot: string
  lotInternal: string
  mfgDate: string
  expDate: string
  qty: number
  unit: string
}
