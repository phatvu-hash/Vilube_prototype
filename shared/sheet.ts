// ============================================================
// Đọc Google Sheet đơn nhập / đơn xuất → dữ liệu miền của app.
//
// Hàm thuần, không đụng mạng: Worker lo việc tải CSV rồi đưa chuỗi vào đây.
// Nhờ vậy toàn bộ phần dễ sai (parse, kiểm tra, sinh mã kiện) test được offline.
// ============================================================
import type {
  Asn,
  AsnLine,
  InventoryRow,
  PickLine,
  PickOrder,
  PutawayPallet,
  PutawayTask,
  ReceivePackage,
} from './types'
import { itemByCode } from './items'
import { kindOf, locationByCode, mkLotInternal, storageLocationsOf, whIdOfKind } from './catalog'
import { baseUnit, unitsOf } from './uom'
import { buildCartonBarcode, buildDrumBarcode } from './barcode'

export interface SheetError {
  sheet: string
  /** Số dòng như người dùng thấy trong Sheets (dòng 1 là tiêu đề) */
  row: number
  column: string
  value: string
  message: string
}

export interface DataSet {
  asns: Asn[]
  putaways: PutawayTask[]
  pickOrders: PickOrder[]
  inventory: InventoryRow[]
  errors: SheetError[]
}

// ---------------------------------------------------------------- CSV

/** Parse CSV theo RFC 4180: hỗ trợ dấu nháy kép, dấu phẩy và xuống dòng trong ô */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const src = text.replace(/^﻿/, '')

  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += c
      continue
    }
    if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += c
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  // bỏ những dòng trắng hoàn toàn
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

/** Dòng CSV → object theo tiêu đề, khoá viết hoa không dấu cách */
function toRecords(rows: string[][]): Record<string, string>[] {
  if (!rows.length) return []
  const head = rows[0].map((h) => h.trim().toUpperCase())
  return rows.slice(1).map((r) => {
    const o: Record<string, string> = {}
    head.forEach((h, i) => (o[h] = (r[i] ?? '').trim()))
    return o
  })
}

// ---------------------------------------------------------------- tiện ích

/** dd/MM/yyyy · dd-MM-yyyy · yyyy-MM-dd → yyyy-MM-dd; chuỗi rỗng giữ nguyên */
export function toIsoDate(raw: string): string | null {
  const s = raw.trim()
  if (!s) return ''
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (m) return s
  m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(s)
  if (!m) return null
  const [, d, mo, y] = m
  const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
  return Number.isNaN(new Date(iso).getTime()) ? null : iso
}

/** Bỏ dấu phân cách nghìn rồi đổi sang số */
function toNumber(raw: string): number | null {
  const s = raw.trim().replace(/[.,\s](?=\d{3}\b)/g, '')
  if (!s) return null
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/**
 * Tăng mã kiện: giữ nguyên phần chữ đầu, cộng 1 vào phần số cuối và giữ độ dài.
 * 0008083 → 0008084 · DRM100001 → DRM100002
 */
export function nextPackageCode(code: string, step: number): string {
  const m = /^(.*?)(\d+)$/.exec(code.trim())
  if (!m) return `${code}${step}`
  const [, prefix, digits] = m
  return prefix + String(Number(digits) + step).padStart(digits.length, '0')
}

// ---------------------------------------------------------------- dựng dữ liệu

interface Ctx {
  sheet: string
  errors: SheetError[]
}

function fail(ctx: Ctx, row: number, column: string, value: string, message: string) {
  ctx.errors.push({ sheet: ctx.sheet, row, column, value, message })
  return null
}

/**
 * Dòng không mang chút định danh nào của đơn thì coi như dòng trắng và bỏ qua
 * lặng lẽ — thường là dòng ghi chú người dùng gõ dưới bảng. Dòng có dữ liệu
 * nhưng sai giá trị vẫn phải báo lỗi như thường.
 */
function isBlankRow(r: Record<string, string>, keys: string[]): boolean {
  return keys.every((k) => !(r[k] ?? '').trim())
}

/** Kiểm tra phần dùng chung cho cả hai tab: kho và mã hàng */
function readWarehouseAndItem(ctx: Ctx, r: Record<string, string>, rowNo: number) {
  const khoRaw = r.KHO ?? ''
  const kho = khoRaw.trim().toUpperCase()
  if (kho !== 'BB' && kho !== 'NVL')
    return fail(ctx, rowNo, 'KHO', khoRaw, 'Mã kho phải là BB hoặc NVL')

  const whId = whIdOfKind(kho)
  const codeRaw = r.MA_HANG ?? ''
  const item = itemByCode[codeRaw.trim()]
  if (!item) return fail(ctx, rowNo, 'MA_HANG', codeRaw, 'Mã hàng không có trong danh mục')
  if (item.wh !== kho)
    return fail(ctx, rowNo, 'MA_HANG', codeRaw, `Mã hàng thuộc kho ${item.wh}, không phải kho ${kho}`)

  return { whId, kho, item }
}

/** Sinh danh sách kiện từ SO_KIEN / SL_MOI_KIEN / MA_KIEN_DAU */
function buildPackages(
  ctx: Ctx,
  r: Record<string, string>,
  rowNo: number,
  kho: string,
  itemCode: string,
  lot: string,
): ReceivePackage[] | null {
  const soKien = r.SO_KIEN ?? ''
  const slMoi = r.SL_MOI_KIEN ?? ''
  const maDau = r.MA_KIEN_DAU ?? ''
  const filled = [soKien, slMoi, maDau].filter((x) => x.trim() !== '').length
  if (filled === 0) return [] // hàng chưa dán tem — hợp lệ
  if (filled < 3)
    return fail(
      ctx, rowNo, 'SO_KIEN',
      `${soKien}/${slMoi}/${maDau}`,
      'Điền đủ cả SO_KIEN, SL_MOI_KIEN và MA_KIEN_DAU, hoặc bỏ trống cả ba',
    )

  const n = toNumber(soKien)
  const qty = toNumber(slMoi)
  if (n === null || n <= 0) return fail(ctx, rowNo, 'SO_KIEN', soKien, 'Số kiện phải là số dương')
  if (qty === null || qty <= 0)
    return fail(ctx, rowNo, 'SL_MOI_KIEN', slMoi, 'Số lượng mỗi kiện phải là số dương')

  const first = maDau.trim()
  if (kho === 'BB' && !/^\d{7}$/.test(first))
    return fail(ctx, rowNo, 'MA_KIEN_DAU', maDau, 'Kho BB cần mã kiện 7 chữ số để ghép barcode')
  if (kho === 'NVL') {
    // Tem phuy ngăn các phần bằng dấu sổ đứng nên mã phuy không được chứa ký tự đó
    if (!/^[0-9A-Za-z][0-9A-Za-z._-]{0,19}$/.test(first))
      return fail(
        ctx, rowNo, 'MA_KIEN_DAU', maDau,
        'Mã phuy chỉ gồm chữ, số và các dấu . _ - (không có dấu |)',
      )
    if (!lot.trim())
      return fail(ctx, rowNo, 'SO_LO', r.SO_LO ?? '', 'Kho NVL có phuy dán tem thì bắt buộc có số lô')
  }

  return Array.from({ length: n }, (_, i) => {
    const code = i === 0 ? first : nextPackageCode(first, i)
    return {
      code,
      // Kho BB ghép tem carton, kho NVL ghép tem phuy — hai định dạng khác nhau,
      // xem shared/barcode.ts
      barcode:
        kho === 'BB'
          ? buildCartonBarcode(itemCode, qty, 'PCE', code)
          : buildDrumBarcode(itemCode, lot.trim(), qty, code),
      qty,
      received: false,
    }
  })
}

/**
 * Cột DA_NHAN cho phép dựng sẵn hàng đã nhận trước buổi demo, nhờ vậy công việc
 * Cất hàng có việc để làm mà không phải bấm nhận hàng trước.
 */
function buildAsns(csv: string, errors: SheetError[]): { asns: Asn[]; putaways: PutawayTask[] } {
  const ctx: Ctx = { sheet: 'DON_NHAP', errors }
  const records = toRecords(parseCsv(csv))
  const byKey = new Map<string, Asn>()
  const putawayByKey = new Map<string, PutawayTask>()

  records.forEach((r, idx) => {
    const rowNo = idx + 2 // +1 bỏ tiêu đề, +1 vì Sheets đếm từ 1
    if (isBlankRow(r, ['MA_DON', 'MA_HANG', 'SO_LUONG'])) return
    const head = readWarehouseAndItem(ctx, r, rowNo)
    if (!head) return
    const { whId, kho, item } = head

    const maDon = (r.MA_DON ?? '').trim()
    if (!maDon) return fail(ctx, rowNo, 'MA_DON', '', 'Thiếu mã đơn')

    const qty = toNumber(r.SO_LUONG ?? '')
    if (qty === null || qty <= 0)
      return fail(ctx, rowNo, 'SO_LUONG', r.SO_LUONG ?? '', 'Số lượng phải là số dương')

    const ngayGiao = toIsoDate(r.NGAY_GIAO ?? '')
    if (ngayGiao === null)
      return fail(ctx, rowNo, 'NGAY_GIAO', r.NGAY_GIAO ?? '', 'Ngày phải theo dạng dd/MM/yyyy')
    const nsx = toIsoDate(r.NSX ?? '')
    if (nsx === null) return fail(ctx, rowNo, 'NSX', r.NSX ?? '', 'Ngày phải theo dạng dd/MM/yyyy')
    const hsd = toIsoDate(r.HSD ?? '')
    if (hsd === null) return fail(ctx, rowNo, 'HSD', r.HSD ?? '', 'Ngày phải theo dạng dd/MM/yyyy')

    const packages = buildPackages(ctx, r, rowNo, kho, item.code, r.SO_LO ?? '')
    if (packages === null) return

    const daNhanRaw = (r.DA_NHAN ?? '').trim()
    let daNhan = 0
    if (daNhanRaw) {
      const v = toNumber(daNhanRaw)
      if (v === null || v < 0)
        return fail(ctx, rowNo, 'DA_NHAN', daNhanRaw, 'Số lượng đã nhận phải là số không âm')
      if (v > qty)
        return fail(ctx, rowNo, 'DA_NHAN', daNhanRaw, `Đã nhận ${v} vượt số lượng đặt ${qty}`)
      daNhan = v
    }

    const key = `${whId}|${maDon}`
    let asn = byKey.get(key)
    if (!asn) {
      asn = {
        id: `asn-${kho.toLowerCase()}-${maDon}`,
        whId,
        code: maDon,
        pnk: (r.SO_DON_NHAP ?? '').trim(),
        supplierName: (r.NHA_CUNG_CAP ?? '').trim(),
        type: (r.LOAI_DON ?? '').trim() || 'Nhập Nhà cung cấp',
        deliveryDate: ngayGiao,
        note: (r.GHI_CHU ?? '').trim(),
        status: 'NEW',
        lines: [],
      }
      byKey.set(key, asn)
    }

    const lineNo = asn.lines.length + 1
    const line: AsnLine = {
      id: `${asn.id}-l${lineNo}`,
      itemId: item.id,
      qtyExpected: qty,
      qtyReceived: daNhan,
      lot: (r.SO_LO ?? '').trim(),
      lotInternal: mkLotInternal(nsx, ngayGiao),
      mfgDate: nsx,
      expDate: hsd,
      packages: markReceived(packages, daNhan),
    }
    asn.lines.push(line)

    if (daNhan > 0) addPutaway(putawayByKey, asn, line, item.id, kho, lineNo, daNhan)
  })

  // trạng thái đơn suy từ số đã nhận của các dòng
  const asns = [...byKey.values()].map((a) => {
    const all = a.lines.every((l) => l.qtyReceived >= l.qtyExpected)
    const any = a.lines.some((l) => l.qtyReceived > 0)
    return { ...a, status: all ? ('RECEIVED' as const) : any ? ('PARTIAL' as const) : a.status }
  })

  return { asns, putaways: [...putawayByKey.values()] }
}

/** Đánh dấu các kiện đầu tiên là đã nhận, đủ để phủ số lượng DA_NHAN */
function markReceived(packages: ReceivePackage[], daNhan: number): ReceivePackage[] {
  if (daNhan <= 0) return packages
  let left = daNhan
  return packages.map((p) => {
    if (left >= p.qty) {
      left -= p.qty
      return { ...p, received: true }
    }
    return p
  })
}

/** Dựng công việc cất hàng cho phần đã nhận sẵn */
function addPutaway(
  map: Map<string, PutawayTask>,
  asn: Asn,
  line: AsnLine,
  itemId: string,
  kho: string,
  lineNo: number,
  qty: number,
) {
  const key = `${asn.whId}|${asn.code}`
  let task = map.get(key)
  if (!task) {
    task = {
      id: `pa-${kho.toLowerCase()}-${asn.code}`,
      whId: asn.whId,
      wmsCode: `WMS${asn.code.slice(-8)}`,
      asnCode: asn.code,
      receivedDate: asn.deliveryDate,
      type: asn.type,
      status: 'NEW',
      pallets: [],
    }
    map.set(key, task)
  }

  const locs = storageLocationsOf(asn.whId)
  const isNvl = kho === 'NVL'
  // Kho NVL cất từng phuy nên mỗi kiện đã nhận là một dòng; kho BB gom lên 1 pallet
  const received = line.packages.filter((p) => p.received)
  const rows: { palletId: string; qty: number }[] =
    isNvl && received.length
      ? received.map((p) => ({ palletId: p.code, qty: p.qty }))
      : [{ palletId: `${isNvl ? 'DRM' : 'PLT'}-${asn.code.slice(-4)}-${lineNo}`, qty }]

  rows.forEach((row, i) => {
    const pallet: PutawayPallet = {
      id: `${task!.id}-p${task!.pallets.length + 1}`,
      palletId: row.palletId,
      itemId,
      qty: row.qty,
      unit: isNvl ? 'DRUM' : 'PALLET',
      lot: line.lot,
      lotInternal: line.lotInternal,
      mfgDate: line.mfgDate,
      expDate: line.expDate,
      suggestedLocationId: locs[(task!.pallets.length + i) % locs.length].id,
    }
    task!.pallets.push(pallet)
  })
}

function buildPickOrders(csv: string, errors: SheetError[]): { orders: PickOrder[]; inventory: InventoryRow[] } {
  const ctx: Ctx = { sheet: 'DON_XUAT', errors }
  const records = toRecords(parseCsv(csv))
  const byKey = new Map<string, PickOrder>()
  const inventory: InventoryRow[] = []

  records.forEach((r, idx) => {
    const rowNo = idx + 2
    if (isBlankRow(r, ['MA_DON_HANG', 'MA_HANG', 'SO_LUONG'])) return
    const head = readWarehouseAndItem(ctx, r, rowNo)
    if (!head) return
    const { whId, kho, item } = head

    const maDon = (r.MA_DON_HANG ?? '').trim()
    if (!maDon) return fail(ctx, rowNo, 'MA_DON_HANG', '', 'Thiếu mã đơn hàng')

    const loc = locationByCode(whId, r.VI_TRI ?? '')
    if (!loc) return fail(ctx, rowNo, 'VI_TRI', r.VI_TRI ?? '', 'Vị trí không có trong kho này')

    const qty = toNumber(r.SO_LUONG ?? '')
    if (qty === null || qty <= 0)
      return fail(ctx, rowNo, 'SO_LUONG', r.SO_LUONG ?? '', 'Số lượng phải là số dương')

    const ngayGiao = toIsoDate(r.NGAY_GIAO ?? '')
    if (ngayGiao === null)
      return fail(ctx, rowNo, 'NGAY_GIAO', r.NGAY_GIAO ?? '', 'Ngày phải theo dạng dd/MM/yyyy')
    const nsx = toIsoDate(r.NSX ?? '')
    if (nsx === null) return fail(ctx, rowNo, 'NSX', r.NSX ?? '', 'Ngày phải theo dạng dd/MM/yyyy')
    const hsd = toIsoDate(r.HSD ?? '')
    if (hsd === null) return fail(ctx, rowNo, 'HSD', r.HSD ?? '', 'Ngày phải theo dạng dd/MM/yyyy')

    const palletId = (r.MA_PALLET ?? '').trim()
    if (!palletId)
      return fail(ctx, rowNo, 'MA_PALLET', '', 'Thiếu mã pallet (kho BB) hoặc mã phuy (kho NVL)')

    const dvtRaw = (r.DVT ?? '').trim().toUpperCase()
    const allowed = unitsOf(item, kindOf(whId))
    if (dvtRaw && !allowed.includes(dvtRaw))
      return fail(ctx, rowNo, 'DVT', r.DVT ?? '', `Đơn vị phải là một trong ${allowed.join(' / ')}`)

    const key = `${whId}|${maDon}`
    let order = byKey.get(key)
    if (!order) {
      order = {
        id: `so-${kho.toLowerCase()}-${maDon}`,
        whId,
        soNumber: (r.SO_DON_HANG ?? '').trim(),
        code: maDon,
        customerName: (r.KHACH_HANG ?? '').trim(),
        deliveryDate: ngayGiao,
        note: (r.GHI_CHU ?? '').trim(),
        status: 'NEW',
        lines: [],
      }
      byKey.set(key, order)
    }

    const line: PickLine = {
      id: `${order.id}-l${order.lines.length + 1}`,
      zone: loc.zone,
      locationId: loc.id,
      palletId,
      itemId: item.id,
      lotNcc: (r.SO_LO_NCC ?? '').trim(),
      lot: (r.SO_LO ?? '').trim(),
      mfgDate: nsx,
      expDate: hsd,
      qtyRequired: qty,
      unit: dvtRaw || baseUnit(item, kindOf(whId)),
      qtyPicked: 0,
    }
    order.lines.push(line)

    // Tồn tại vị trí suy ra từ chính dòng phiếu — mặc định gấp đôi để soạn thoải mái
    const ton = toNumber(r.TON_TAI_VI_TRI ?? '')
    inventory.push({
      id: `inv-${line.id}`,
      whId,
      itemId: item.id,
      locationId: loc.id,
      palletId,
      lot: line.lot,
      lotInternal: mkLotInternal(nsx, ngayGiao),
      mfgDate: nsx,
      expDate: hsd,
      qty: ton !== null && ton > 0 ? ton : qty * 2,
    })

    const spare = spareDrum(line, item.kgPerCarton, ngayGiao, whId)
    if (spare) inventory.push(spare)
  })

  return { orders: [...byKey.values()], inventory }
}

/**
 * Phuy dự phòng khác lô — chỉ kho NVL.
 *
 * Phiếu soạn chỉ định sẵn một phuy cho mỗi dòng, nên nếu tồn chỉ có đúng phuy đó
 * thì không dựng được tình huống nhân viên cầm nhầm phuy khác lô. Ở đây sinh
 * thêm một phuy cùng mã hàng, cùng vị trí, lô mới hơn và hạn dùng muộn hơn:
 * quét phuy này sẽ chạm cả hai cảnh báo "khác lô" và "sai FEFO" để demo bước
 * hỏi Có / Không rồi đổi lô. Bỏ đoạn này khi nối tồn thật từ WMS.
 */
function spareDrum(line: PickLine, kgPerDrum: number, ngayGiao: string, whId: string): InventoryRow | null {
  if (kindOf(whId) !== 'NVL') return null
  const nsx = addDaysIso(line.mfgDate, 30)
  const hsd = addDaysIso(line.expDate, 30)
  if (!nsx || !hsd) return null
  return {
    id: `inv-${line.id}-spare`,
    whId,
    itemId: line.itemId,
    locationId: line.locationId,
    palletId: nextDrumId(line.palletId),
    lot: nextLot(line.lot),
    lotInternal: mkLotInternal(nsx, ngayGiao),
    mfgDate: nsx,
    expDate: hsd,
    qty: kgPerDrum > 0 ? kgPerDrum : line.qtyRequired,
  }
}

/** DRM080011 → DRM080511, giữ nguyên bề dài phần số */
function nextDrumId(code: string): string {
  const m = /^([A-Z]+)(\d+)$/.exec(code.toUpperCase())
  if (!m) return `${code}-2`
  return m[1] + String(Number(m[2]) + 500).padStart(m[2].length, '0')
}

/** 2711030000 → 2711030001; lô không phải số thì thêm hậu tố */
function nextLot(lot: string): string {
  return /^\d+$/.test(lot) ? String(Number(lot) + 1).padStart(lot.length, '0') : `${lot}B`
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  d.setDate(d.getDate() + days)
  const p = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** Dựng toàn bộ dữ liệu từ hai tab CSV */
export function buildDataSet(inboundCsv: string, outboundCsv: string): DataSet {
  const errors: SheetError[] = []
  const { asns, putaways } = buildAsns(inboundCsv, errors)
  const { orders, inventory } = buildPickOrders(outboundCsv, errors)
  return { asns, putaways, pickOrders: orders, inventory, errors }
}
