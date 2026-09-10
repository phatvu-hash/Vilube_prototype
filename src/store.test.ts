import { beforeEach, describe, expect, it } from 'vitest'
import { useApp } from './store'
import { sampleDataSet } from '@shared/sample'
import { WH_NVL } from '@shared/catalog'

/** Phiếu soạn NVL mẫu: dòng 1 lấy 180 kg phuy DRM080011 lô 2711030000 tại D2.1 */
const nvlOrder = () => useApp.getState().pickOrders.find((o) => o.whId === WH_NVL)!

beforeEach(() => {
  const d = sampleDataSet()
  useApp.setState({
    warehouseId: WH_NVL,
    asns: d.asns,
    putaways: d.putaways,
    pickOrders: d.pickOrders,
    inventory: d.inventory,
    receipts: [],
  })
})

describe('soạn hàng — trừ tồn đúng phuy đã quét', () => {
  it('soạn đúng phuy trên phiếu thì chỉ trừ tồn phuy đó', () => {
    const order = nvlOrder()
    const line = order.lines[0]
    const before = useApp.getState().inventory.find((r) => r.palletId === line.palletId)!.qty

    useApp.getState().pick(order.id, line.id, line.qtyRequired)

    const inv = useApp.getState().inventory
    expect(inv.find((r) => r.palletId === line.palletId)!.qty).toBe(before - line.qtyRequired)
    expect(nvlOrder().lines[0].qtyPicked).toBe(line.qtyRequired)
  })

  it('đổi lô: dòng phiếu chuyển sang phuy mới, phuy cũ giữ nguyên tồn', () => {
    const order = nvlOrder()
    const line = order.lines[0]
    // Phuy dự phòng cùng vị trí, khác lô — do buildDataSet sinh kèm để demo đổi lô
    const spare = useApp
      .getState()
      .inventory.find(
        (r) => r.itemId === line.itemId && r.locationId === line.locationId && r.palletId !== line.palletId,
      )!
    expect(spare).toBeDefined()
    const oldQty = useApp.getState().inventory.find((r) => r.palletId === line.palletId)!.qty

    useApp.getState().pick(order.id, line.id, 100, {
      palletId: spare.palletId,
      lot: spare.lot,
      lotNcc: spare.lot,
      mfgDate: spare.mfgDate,
      expDate: spare.expDate,
    })

    const after = nvlOrder().lines[0]
    expect(after.palletId).toBe(spare.palletId)
    expect(after.lot).toBe(spare.lot)
    expect(after.expDate).toBe(spare.expDate)
    expect(after.qtyPicked).toBe(100)

    const inv = useApp.getState().inventory
    expect(inv.find((r) => r.palletId === spare.palletId)!.qty).toBe(spare.qty - 100)
    // phuy cũ được nhả khỏi phiếu, tồn không đổi
    expect(inv.find((r) => r.palletId === line.palletId)!.qty).toBe(oldQty)
  })
})
