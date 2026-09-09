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
