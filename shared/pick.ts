// ============================================================
// Soạn hàng kho NVL — kiểm tra tem phuy vừa quét
//
// Quét DrumID xong, hệ thống cắt chuỗi tem bốn phần (shared/barcode.ts) để lấy
// mã hàng · số lô · số lượng · mã phuy, rồi đối chiếu với tồn kho và phiếu soạn:
//
//   - Sai ở bốn bước đầu  → báo lỗi, không cho soạn phuy này.
//   - Qua được bốn bước   → xét lô: hết hạn, khác lô đề xuất, sai FEFO thì trả
//                           về cảnh báo để màn hình hỏi Có / Không.
//
// Tách khỏi màn hình để kiểm bằng test và để Worker dùng lại được sau này.
// ============================================================
import { parseDrumBarcode, type DrumBarcode } from './barcode'
import { itemByCode } from './items'
import type { InventoryRow, PickLine } from './types'

/** Còn từ chừng này ngày trở xuống là cận hạn — hỏi lại trước khi soạn */
export const NEAR_EXPIRY_DAYS = 90

export type DrumScanError =
  /** Chuỗi quét không cắt được thành MãHàng|SốLô|SốLượng|MãPhuy */
  | { kind: 'BAD_FORMAT'; raw: string }
  /** Mã phuy không có trong tồn kho */
  | { kind: 'NOT_IN_STOCK'; drumId: string }
  /** Mã hàng trên tem không nằm trong phiếu soạn đang mở */
  | { kind: 'NOT_IN_ORDER'; drumId: string; itemCode: string }
  /** Phuy có thật nhưng đang nằm ở vị trí khác */
  | { kind: 'WRONG_LOCATION'; drumId: string; atLocationId: string }

export type BatchWarning =
  | { kind: 'EXPIRED'; lot: string; expDate: string }
  | { kind: 'NEAR_EXPIRY'; lot: string; expDate: string; days: number }
  | { kind: 'OTHER_LOT'; lot: string; lineLot: string }
  | { kind: 'NOT_FEFO'; lot: string; bestLot: string; bestExpDate: string }

export type DrumScanResult =
  | { ok: false; error: DrumScanError }
  | {
      ok: true
      drum: DrumBarcode
      /** Dòng tồn của phuy vừa quét */
      row: InventoryRow
      /** Dòng phiếu soạn khớp phuy này — có thể khác dòng đang mở trên màn hình */
      line: PickLine
      /** Rỗng nghĩa là soạn thẳng; có phần tử thì hỏi Có / Không trước */
      warnings: BatchWarning[]
    }

export interface DrumScanContext {
  /** Dòng người dùng đang mở trên màn hình */
  line: PickLine
  /** Các dòng còn phải soạn của phiếu */
  pendingLines: PickLine[]
  /** Tồn của kho đang thao tác */
  inventory: InventoryRow[]
  /** Hôm nay, dạng yyyy-MM-dd */
  today: string
}

const daysBetween = (fromIso: string, toIso: string): number | null => {
  const a = new Date(fromIso).getTime()
  const b = new Date(toIso).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return Math.round((b - a) / 86_400_000)
}

/** Kiểm tra tem phuy vừa quét trước khi cho soạn */
export function checkDrumForPick(raw: string, ctx: DrumScanContext): DrumScanResult {
  const drum = parseDrumBarcode(raw)
  if (!drum) return { ok: false, error: { kind: 'BAD_FORMAT', raw: raw.trim() } }

  // 1. Phuy phải đang có tồn trong kho
  const row = ctx.inventory.find((r) => r.palletId.toUpperCase() === drum.drumId && r.qty > 0)
  if (!row) return { ok: false, error: { kind: 'NOT_IN_STOCK', drumId: drum.drumId } }

  // 2. Mã hàng trên tem phải thuộc phiếu soạn đang mở
  const item = itemByCode[drum.itemCode]
  const inOrder = item && ctx.pendingLines.some((l) => l.itemId === item.id)
  if (!item || !inOrder || item.id !== row.itemId)
    return { ok: false, error: { kind: 'NOT_IN_ORDER', drumId: drum.drumId, itemCode: drum.itemCode } }

  // 3. Phuy phải nằm ở vị trí của một dòng đang chờ soạn.
  //    Quét phuy thuộc dòng khác thì chuyển luôn sang dòng đó cho đỡ thao tác.
  const line =
    ctx.pendingLines.find(
      (l) => l.itemId === row.itemId && l.locationId === row.locationId && l.id === ctx.line.id,
    ) ?? ctx.pendingLines.find((l) => l.itemId === row.itemId && l.locationId === row.locationId)
  if (!line)
    return { ok: false, error: { kind: 'WRONG_LOCATION', drumId: drum.drumId, atLocationId: row.locationId } }

  // 4. Lô có đáp ứng không — không đạt thì hỏi lại chứ không chặn
  const warnings: BatchWarning[] = []
  const left = daysBetween(ctx.today, row.expDate)
  if (left !== null && left < 0) warnings.push({ kind: 'EXPIRED', lot: row.lot, expDate: row.expDate })
  else if (left !== null && left <= NEAR_EXPIRY_DAYS)
    warnings.push({ kind: 'NEAR_EXPIRY', lot: row.lot, expDate: row.expDate, days: left })

  if (row.lot && line.lot && row.lot !== line.lot)
    warnings.push({ kind: 'OTHER_LOT', lot: row.lot, lineLot: line.lot })

  // FEFO — còn lô cùng mã hàng hạn dùng sớm hơn thì lẽ ra phải xuất lô đó trước
  const best = ctx.inventory
    .filter((r) => r.itemId === row.itemId && r.qty > 0 && r.expDate)
    .reduce<InventoryRow | null>((m, r) => (!m || r.expDate < m.expDate ? r : m), null)
  if (best && row.expDate && best.expDate < row.expDate)
    warnings.push({ kind: 'NOT_FEFO', lot: row.lot, bestLot: best.lot, bestExpDate: best.expDate })

  return { ok: true, drum, row, line, warnings }
}
