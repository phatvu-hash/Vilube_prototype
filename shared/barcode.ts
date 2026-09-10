/**
 * Tem carton kho Bao Bì — cấu trúc barcode theo HDSD phần 5.1
 *
 *   9082228 | 3000 | PCE | 0008083
 *   mã hàng   SL     ĐVT   mã kiểm tra trùng (mỗi carton một mã)
 */
export interface CartonBarcode {
  raw: string
  itemCode: string // 7 ký tự
  qty: number // 4 ký tự
  uomCode: string // 3 ký tự
  checkCode: string // 7 ký tự — lưu nội bộ, không hiển thị
}

/** Ánh xạ mã đơn vị trong barcode sang nhãn hiển thị trên app */
export const UOM_BY_CODE: Record<string, string> = {
  PCE: 'CÁI',
  CTN: 'THÙNG',
  PLT: 'PALLET',
  KGM: 'KG',
  DRM: 'DRUM',
}

const RE = /^([0-9A-Z]{7})\|(\d{4})\|([A-Z]{3})\|([0-9A-Z]{7})$/

/** Trả về null nếu barcode sai định dạng */
export function parseCartonBarcode(raw: string): CartonBarcode | null {
  const m = RE.exec(raw.trim().toUpperCase())
  if (!m) return null
  return { raw: raw.trim().toUpperCase(), itemCode: m[1], qty: Number(m[2]), uomCode: m[3], checkCode: m[4] }
}

/** Dựng barcode chuẩn từ các thành phần (dùng cho dữ liệu demo) */
export function buildCartonBarcode(itemCode: string, qty: number, uomCode: string, check: string): string {
  return `${itemCode}|${String(Math.round(qty)).padStart(4, '0')}|${uomCode}|${check.padStart(7, '0')}`
}

// ------------------------------------------------------------------
// Tem phuy kho NVL — DrumID gộp bốn phần, ngăn bằng dấu sổ đứng
//
//   MTL001 | 2609101 | 200 | DR0000001
//   mã hàng  số lô     SL kg  mã phuy (mỗi phuy một mã)
//
// Dùng chung dấu ngăn với tem carton kho Bao Bì (user chốt 10/09/2026) để hai
// loại tem có một quy ước duy nhất. Khác tem carton ở chỗ có sẵn số lô: phuy
// nguyên liệu bắt buộc truy xuất theo lô, nên số lô nằm ngay trên tem thay vì
// tra ngược từ đơn.
// ------------------------------------------------------------------
export interface DrumBarcode {
  raw: string
  itemCode: string // mã hàng
  lot: string // số lô nhà cung cấp
  qty: number // số lượng trong phuy, đơn vị cơ sở (KG)
  drumId: string // mã phuy
}

/** Một đoạn của tem phuy: chữ hoa, số và vài dấu nối thường gặp trên tem */
const SEG = '[0-9A-Z][0-9A-Z._-]{0,19}'
const DRUM_RE = new RegExp(`^(${SEG})\\|(${SEG})\\|(\\d+(?:[.,]\\d+)?)\\|(${SEG})$`)

/** Trả về null nếu tem sai định dạng */
export function parseDrumBarcode(raw: string): DrumBarcode | null {
  const s = raw.trim().toUpperCase()
  const m = DRUM_RE.exec(s)
  if (!m) return null
  const qty = Number(m[3].replace(',', '.'))
  if (!Number.isFinite(qty) || qty <= 0) return null
  return { raw: s, itemCode: m[1], lot: m[2], qty, drumId: m[4] }
}

/** Dựng tem phuy chuẩn từ dữ liệu dòng đơn nhập */
export function buildDrumBarcode(itemCode: string, lot: string, qty: number, drumId: string): string {
  return `${itemCode}|${lot}|${qty}|${drumId}`.toUpperCase()
}

/**
 * Sinh mã kiện mới cho hàng chưa có tem (nút Gen ID ở màn Nhập hàng chủ động).
 *
 * Quy tắc user chốt 10/09/2026: tiền tố kho + số thứ tự tăng dần, giữ 6 chữ số.
 * Lấy số lớn nhất đang có trong hệ thống rồi cộng 1 nên mã sinh ra không đụng
 * phuy/pallet nào đã nhận trước đó.
 */
export function genPackageId(prefix: string, used: Iterable<string>, digits = 6): string {
  const re = new RegExp(`^${prefix}(\\d+)$`)
  let max = 0
  let width = digits
  for (const code of used) {
    const m = re.exec(String(code).trim().toUpperCase())
    if (!m) continue
    max = Math.max(max, Number(m[1]))
    width = Math.max(width, m[1].length)
  }
  return prefix + String(max + 1).padStart(width, '0')
}
