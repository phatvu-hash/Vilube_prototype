// ============================================================
// Domain types — bám HDSD WMS App, Kho Bao Bì Vilube
// ============================================================

export type Role = 'thukho' | 'picker' | 'receiver'

export interface Warehouse {
  id: string
  code: string
  name: string
}

export interface Partner {
  id: string
  code: string
  name: string
  type: 'supplier' | 'customer'
}

export interface Location {
  id: string
  zone: string // khu vực, vd 1001
  code: string // vị trí, vd A1.1
  type: 'storage' | 'receive' | 'staging'
}

// ---------- Nhận hàng (đơn nhập / ASN) ----------
export type AsnStatus = 'NEW' | 'PARTIAL' | 'RECEIVED'

/** 1 thùng carton đã dán tem nhãn — quét mã là ra đủ thông tin */
export interface Carton {
  code: string // mã carton in trên tem
  qty: number // số lượng (đơn vị cơ sở) trong thùng
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
  cartons: Carton[]
}

export interface Asn {
  id: string
  code: string // mã đơn
  pnk: string // số đơn nhập
  supplierId: string
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
  palletId: string
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
  palletId: string
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
  soNumber: string // số đơn hàng
  code: string // mã đơn hàng
  customerId: string
  deliveryDate: string
  note?: string
  status: PickStatus
  assignedTo?: string
  lines: PickLine[]
}

// ---------- Tồn ----------
export interface InventoryRow {
  id: string
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
