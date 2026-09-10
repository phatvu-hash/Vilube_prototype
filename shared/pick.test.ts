import { describe, expect, it } from 'vitest'
import { checkDrumForPick } from './pick'
import { sampleDataSet } from './sample'
import { WH_NVL } from './catalog'
import { itemById } from './items'
import { buildDrumBarcode } from './barcode'
import type { InventoryRow, PickLine } from './types'

const TODAY = '2026-09-10'
const LOC = 'loc-nvl-d21'
const LOC2 = 'loc-nvl-d22'

/** Dòng phiếu soạn: 180 kg dầu gốc SN 500, phuy DRM080011 lô 2711030000 tại D2.1 */
const line: PickLine = {
  id: 'so-nvl-1-l1',
  zone: '2001',
  locationId: LOC,
  palletId: 'DRM080011',
  itemId: '7101500',
  lotNcc: '2711030000',
  lot: '2711030000',
  mfgDate: '2026-06-12',
  expDate: '2029-06-12',
  qtyRequired: 180,
  unit: 'KG',
  qtyPicked: 0,
}

const inv = (over: Partial<InventoryRow>): InventoryRow => ({
  id: `inv-${over.palletId}`,
  whId: 'w-nvl',
  itemId: '7101500',
  locationId: LOC,
  palletId: 'DRM080011',
  lot: '2711030000',
  lotInternal: '120626-100926',
  mfgDate: '2026-06-12',
  expDate: '2029-06-12',
  qty: 360,
  ...over,
})

const ctx = (inventory: InventoryRow[], cur: PickLine = line) => ({
  line: cur,
  pendingLines: [line],
  inventory,
  today: TODAY,
})

const tem = (itemCode: string, lot: string, qty: number, drumId: string) =>
  buildDrumBarcode(itemCode, lot, qty, drumId)

describe('quét tem phuy ở màn soạn hàng', () => {
  it('quét đúng phuy đề xuất thì cho soạn thẳng, không hỏi lại', () => {
    const res = checkDrumForPick(tem('7101500', '2711030000', 180, 'DRM080011'), ctx([inv({})]))
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.drum.lot).toBe('2711030000')
    expect(res.drum.qty).toBe(180)
    expect(res.line.id).toBe(line.id)
    expect(res.warnings).toEqual([])
  })

  it('tem không cắt được thành bốn phần thì báo sai định dạng', () => {
    const res = checkDrumForPick('DRM080011', ctx([inv({})]))
    expect(res).toMatchObject({ ok: false, error: { kind: 'BAD_FORMAT' } })
  })

  it('mã phuy không có trong tồn thì báo không tồn tại', () => {
    const res = checkDrumForPick(tem('7101500', '2711030000', 180, 'DRM099999'), ctx([inv({})]))
    expect(res).toMatchObject({ ok: false, error: { kind: 'NOT_IN_STOCK', drumId: 'DRM099999' } })
  })

  it('phuy hết tồn cũng coi như không tồn tại', () => {
    const res = checkDrumForPick(
      tem('7101500', '2711030000', 180, 'DRM080011'),
      ctx([inv({ qty: 0 })]),
    )
    expect(res).toMatchObject({ ok: false, error: { kind: 'NOT_IN_STOCK' } })
  })

  it('phuy của mã hàng không nằm trong phiếu thì báo không thuộc phiếu soạn', () => {
    const other = inv({ palletId: 'DRM080021', itemId: '7202133' })
    const res = checkDrumForPick(tem('7202133', '2711030010', 190, 'DRM080021'), ctx([inv({}), other]))
    expect(res).toMatchObject({ ok: false, error: { kind: 'NOT_IN_ORDER', itemCode: '7202133' } })
  })

  it('phuy đang ở vị trí khác thì báo sai vị trí', () => {
    const far = inv({ palletId: 'DRM080012', locationId: LOC2 })
    const res = checkDrumForPick(tem('7101500', '2711030000', 180, 'DRM080012'), ctx([inv({}), far]))
    expect(res).toMatchObject({
      ok: false,
      error: { kind: 'WRONG_LOCATION', drumId: 'DRM080012', atLocationId: LOC2 },
    })
  })

  it('phuy khác lô cùng vị trí thì hỏi lại vì khác lô và sai FEFO', () => {
    const spare = inv({
      palletId: 'DRM080511',
      lot: '2711030001',
      mfgDate: '2026-07-12',
      expDate: '2029-07-12',
      qty: 200,
    })
    const res = checkDrumForPick(tem('7101500', '2711030001', 200, 'DRM080511'), ctx([inv({}), spare]))
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.row.palletId).toBe('DRM080511')
    expect(res.warnings.map((w) => w.kind).sort()).toEqual(['NOT_FEFO', 'OTHER_LOT'])
  })

  it('lô quá hạn thì hỏi lại', () => {
    const old = inv({ palletId: 'DRM080013', lot: '2611030000', expDate: '2026-08-01' })
    const res = checkDrumForPick(tem('7101500', '2611030000', 180, 'DRM080013'), ctx([old]))
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.warnings.some((w) => w.kind === 'EXPIRED')).toBe(true)
  })

  it('lô còn dưới 90 ngày thì hỏi lại vì cận hạn', () => {
    const near = inv({ palletId: 'DRM080014', lot: '2611030001', expDate: '2026-10-01' })
    const res = checkDrumForPick(tem('7101500', '2611030001', 180, 'DRM080014'), ctx([near]))
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.warnings).toContainEqual({
      kind: 'NEAR_EXPIRY',
      lot: '2611030001',
      expDate: '2026-10-01',
      days: 21,
    })
  })

  it('quét phuy của dòng khác trong phiếu thì chuyển sang dòng đó', () => {
    const line2: PickLine = {
      ...line,
      id: 'so-nvl-1-l2',
      locationId: LOC2,
      palletId: 'DRM080014',
      lot: '2711030004',
    }
    const row2 = inv({ palletId: 'DRM080014', locationId: LOC2, lot: '2711030004' })
    const res = checkDrumForPick(tem('7101500', '2711030004', 180, 'DRM080014'), {
      line, // đang mở dòng 1
      pendingLines: [line, line2],
      inventory: [inv({}), row2],
      today: TODAY,
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.line.id).toBe('so-nvl-1-l2')
  })
})

describe('quét tem trên chính dữ liệu mẫu của phiếu soạn NVL', () => {
  const data = sampleDataSet()
  const order = data.pickOrders.find((o) => o.whId === WH_NVL)!
  const inventory = data.inventory.filter((r) => r.whId === WH_NVL)
  const first = order.lines[0]
  const ctxOrder = { line: first, pendingLines: order.lines, inventory, today: TODAY }
  const code = (itemId: string) => itemById[itemId].code

  it('quét phuy hệ thống đề xuất thì soạn thẳng', () => {
    const row = inventory.find((r) => r.palletId === first.palletId)!
    const res = checkDrumForPick(tem(code(first.itemId), row.lot, 180, row.palletId), ctxOrder)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.warnings).toEqual([])
  })

  it('quét phuy dự phòng khác lô thì hỏi lại rồi mới cho đổi lô', () => {
    const spare = inventory.find(
      (r) => r.itemId === first.itemId && r.locationId === first.locationId && r.palletId !== first.palletId,
    )!
    const res = checkDrumForPick(tem(code(first.itemId), spare.lot, spare.qty, spare.palletId), ctxOrder)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.line.id).toBe(first.id)
    expect(res.warnings.map((w) => w.kind).sort()).toEqual(['NOT_FEFO', 'OTHER_LOT'])
  })
})
