import type { ItemMaster } from '@/data/items'
import type { WarehouseKind } from '@/types'

/**
 * Đơn vị tính theo nhóm quy cách (bám HDSD):
 *  - Hàng thùng (CARTON)  → CÁI · THÙNG · PALLET
 *  - Hàng phuy   (DRUM)   → KG  · DRUM  · PALLET
 *  - Pail / Jerrycan      → CÁI · PALLET
 */
export function unitsOf(item?: ItemMaster, wh: WarehouseKind = 'BB'): string[] {
  // chưa chọn hàng thì lấy bộ đơn vị mặc định của kho đang thao tác
  if (!item) return wh === 'NVL' ? ['KG', 'DRUM', 'PALLET'] : ['CÁI', 'THÙNG', 'PALLET']
  if (item.group === 'DRUM') return ['KG', 'DRUM', 'PALLET']
  if (item.group === 'PAIL' || item.group === 'JCAN') return ['CÁI', 'PALLET']
  return ['CÁI', 'THÙNG', 'PALLET']
}

/** Đơn vị cơ sở (đơn vị nhỏ nhất dùng để lưu số lượng) */
export function baseUnit(item?: ItemMaster, wh: WarehouseKind = 'BB'): string {
  return unitsOf(item, wh)[0]
}

/** Số đơn vị cơ sở nằm trong 1 `unit` */
export function unitRatio(item: ItemMaster | undefined, unit: string): number {
  if (!item) return 1
  if (item.group === 'DRUM') {
    if (unit === 'DRUM') return item.kgPerCarton
    if (unit === 'PALLET') return item.kgPerCarton * item.cartonsPerPallet
    return 1 // KG
  }
  if (item.group === 'PAIL' || item.group === 'JCAN') {
    if (unit === 'PALLET') return item.cartonsPerPallet
    return 1 // CÁI
  }
  if (unit === 'THÙNG') return item.unitsPerCarton
  if (unit === 'PALLET') return item.unitsPerCarton * item.cartonsPerPallet
  return 1 // CÁI
}

/** đơn vị cơ sở → số lượng theo `unit` */
export function toUnit(base: number, unit: string, item?: ItemMaster): number {
  return base / unitRatio(item, unit)
}

/** số lượng theo `unit` → đơn vị cơ sở */
export function fromUnit(qty: number, unit: string, item?: ItemMaster): number {
  return Math.round(qty * unitRatio(item, unit))
}

export function fmtQty(n: number): string {
  if (!Number.isFinite(n)) return '0'
  return Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(2)).toString()
}
