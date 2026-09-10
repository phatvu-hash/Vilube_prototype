import { useMemo, useState } from 'react'
import { useApp, useWhKind } from '@/store'
import { itemById } from '@shared/items'
import { confirmLocationOf, locationById, mkLotInternal } from '@shared/catalog'
import { buildDrumBarcode, parseDrumBarcode } from '@shared/barcode'
import type { PickLine } from '@shared/types'
import { toast } from '@/lib/toast'
import { fmt } from '@/lib/utils'
import { baseUnit, fmtQty } from '@shared/uom'
import { useT } from '@/i18n'
import { MobileAppBar } from '@/components/mobile/MobileAppBar'
import { ScanField } from '@/components/ui/ScanField'
import { InputField } from '@/components/ui/InputField'
import { Button } from '@/components/ui/Button'
import { ScreenScroll, StickyFooter } from '@/components/mobile/parts'
import { JobDocSheet } from '@/components/mobile/JobDocSheet'

/**
 * Khác → Chiết rót (kho NVL)
 *
 * Phuy nguyên vật liệu phải lấy nguyên phuy khỏi vị trí, trong khi đơn chỉ cần
 * một phần, nên phần dôi ra phải chiết sang phuy khác rồi trả lại hệ thống:
 *
 *   1. Quét mã phiếu soạn WMS (hoặc số đơn hàng xuất).
 *   2. Quét DrumID đã soạn — tem phuy cắt chuỗi ra mã hàng / số lô / SL / mã phuy.
 *   3. SL cần chiết rót tự điền = SL trên tem phuy − SL đơn cần soạn.
 *   4. Xác nhận → unpick đúng phần vượt đó ra vị trí confirm của kho.
 */
export function ChietRot() {
  const t = useT()
  const kind = useWhKind()
  const whId = useApp((s) => s.warehouseId)
  const pickOrders = useApp((s) => s.pickOrders)
  const inventory = useApp((s) => s.inventory)
  const pick = useApp((s) => s.pick)
  const decant = useApp((s) => s.decant)

  const [orderCode, setOrderCode] = useState('')
  const [drumCode, setDrumCode] = useState('')
  const [lineId, setLineId] = useState('')
  const [drumQty, setDrumQty] = useState(0) // SL đọc được trên tem phuy
  const [qtyStr, setQtyStr] = useState('')
  const [doc, setDoc] = useState(false)

  const confirmLoc = confirmLocationOf(whId ?? '')
  const whOrders = useMemo(() => pickOrders.filter((o) => o.whId === whId), [pickOrders, whId])

  /** Nhận cả mã đơn hàng lẫn số đơn hàng — thực địa quét được tem nào dùng tem đó */
  const order = useMemo(() => {
    const code = orderCode.trim().toUpperCase()
    if (!code) return undefined
    return whOrders.find((o) => o.code.toUpperCase() === code || o.soNumber.toUpperCase() === code)
  }, [whOrders, orderCode])

  /** SL thực nằm trong phuy: phần còn ở vị trí cộng phần đã soạn ra khỏi vị trí */
  const drumQtyOf = (l: PickLine) =>
    (inventory.find((r) => r.itemId === l.itemId && r.locationId === l.locationId && r.palletId === l.palletId)
      ?.qty ?? 0) + l.qtyPicked

  const line = order?.lines.find((l) => l.id === lineId)
  const item = line ? itemById[line.itemId] : undefined
  const unit = baseUnit(item, kind)
  const required = line?.qtyRequired ?? 0
  const excess = Math.max(0, drumQty - required)
  const lotInternal = line
    ? inventory.find((r) => r.palletId === line.palletId && r.itemId === line.itemId)?.lotInternal ||
      mkLotInternal(line.mfgDate, order?.deliveryDate ?? '')
    : ''

  const orderOptions = useMemo(
    () =>
      whOrders.map((o) => ({
        value: o.code,
        label: o.code,
        sub: `${o.soNumber} · ${o.customerName}`,
      })),
    [whOrders],
  )

  /** Chỉ liệt kê phuy còn dôi ra so với SL đơn cần — đúng việc của màn này */
  const drumOptions = useMemo(() => {
    if (!order) return []
    return order.lines
      .map((l) => ({ l, qty: drumQtyOf(l) }))
      .filter(({ l, qty }) => qty > l.qtyRequired)
      .map(({ l, qty }) => {
        const it = itemById[l.itemId]
        return {
          value: buildDrumBarcode(it?.code ?? '', l.lotNcc || l.lot, qty, l.palletId),
          label: l.palletId,
          sub: `${it?.code} · ${fmt(qty)} ${baseUnit(it, kind)} · ${t('cần soạn {0}', fmt(l.qtyRequired))}`,
        }
      })
    // inventory đổi sau mỗi lần chiết rót nên phải tính lại danh sách
  }, [order, inventory, kind, t])

  const resetDrum = () => {
    setDrumCode('')
    setLineId('')
    setDrumQty(0)
    setQtyStr('')
  }

  const onScanOrder = (code: string) => {
    setOrderCode(code)
    resetDrum()
  }

  /** Cắt chuỗi tem phuy → mã hàng, số lô, SL, mã phuy; rồi khớp về dòng soạn */
  const onScanDrum = (raw: string) => {
    const bc = parseDrumBarcode(raw)
    const code = (bc?.drumId ?? raw).trim().toUpperCase()
    setDrumCode(code)
    if (!code) return
    if (!order) {
      setLineId('')
      return toast(t('Quét mã phiếu soạn WMS trước'))
    }
    const found = order.lines.find((l) => l.palletId.toUpperCase() === code)
    if (!found) {
      setLineId('')
      setDrumQty(0)
      setQtyStr('')
      return toast(t('Phuy {0} không có trên phiếu soạn {1}', code, order.code))
    }
    const qty = bc?.qty ?? drumQtyOf(found)
    setLineId(found.id)
    setDrumQty(qty)
    const ex = Math.max(0, qty - found.qtyRequired)
    setQtyStr(ex > 0 ? fmtQty(ex) : '')
    if (ex <= 0) toast(t('Phuy này không có SL soạn vượt — không cần chiết rót'))
  }

  const submit = () => {
    if (!order) return toast(t('Quét mã phiếu soạn WMS trước'))
    if (!line || !item) return toast(t('Quét DRUM ID đã soạn'))
    if (!confirmLoc) return toast(t('Kho này chưa khai báo vị trí confirm'))
    const qty = Number(qtyStr) || 0
    if (qty <= 0) return toast(t('Nhập số lượng cần chiết rót'))
    if (qty > excess)
      return toast(t('SL chiết rót {0} vượt SL soạn vượt {1} của phuy', fmt(qty), fmt(excess)))

    // Phuy đã rời vị trí thì coi như dòng soạn đã lấy đủ, phần dôi ra mới đem đi chiết
    if (line.qtyPicked < line.qtyRequired) pick(order.id, line.id, line.qtyRequired - line.qtyPicked)
    decant(order.id, line.id, qty)

    toast(
      t(
        'Đã chiết rót {0} {1} · unpick về vị trí {2}',
        fmt(qty),
        unit,
        locationById[confirmLoc.id]?.code ?? '',
      ),
    )
    resetDrum()
  }

  return (
    <>
      <MobileAppBar title={t('Chiết rót')} onDoc={order ? () => setDoc(true) : undefined} />

      <ScreenScroll className="form-fill px-4 py-3">
        <ScanField
          label={t('Đơn soạn hàng (Mã phiếu soạn WMS)')}
          required
          emphasis
          value={orderCode}
          onChange={setOrderCode}
          onCommit={onScanOrder}
          options={orderOptions}
          emptyText={t('Kho này chưa có phiếu soạn nào')}
        />

        <ScanField
          label={t('Drum ID')}
          required
          value={drumCode}
          onChange={setDrumCode}
          onCommit={onScanDrum}
          options={drumOptions}
          emptyText={order ? t('Phiếu này không còn phuy nào soạn vượt') : t('Quét mã phiếu soạn WMS trước')}
        />

        <InputField label={t('Mã hàng')} value={item?.code ?? ''} onChange={() => {}} readOnly />

        <InputField
          label={t('SKU - Tên hàng')}
          value={item ? `${item.code} · ${item.name}` : ''}
          onChange={() => {}}
          readOnly
          emphasis
        />

        <div className="grid grid-cols-2 gap-2">
          <InputField label={t('Số lô')} value={line?.lot ?? ''} onChange={() => {}} readOnly />
          <InputField label={t('Số lô NCC')} value={line?.lotNcc ?? ''} onChange={() => {}} readOnly />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <InputField
            label={t('Ngày sản xuất')}
            value={line?.mfgDate ?? ''}
            onChange={() => {}}
            readOnly
            type="date"
            calendar
          />
          <InputField
            label={t('Hạn sử dụng')}
            value={line?.expDate ?? ''}
            onChange={() => {}}
            readOnly
            type="date"
            calendar
          />
        </div>

        <InputField label={t('Số lô nội bộ')} value={lotInternal} onChange={() => {}} readOnly />

        {/* Cho thấy SL cần chiết rót ở dưới từ đâu ra: tem phuy trừ đi SL đơn cần */}
        <div className="grid grid-cols-2 gap-2">
          <InputField
            label={t('SL trên tem phuy ({0})', unit)}
            value={drumQty ? fmtQty(drumQty) : ''}
            onChange={() => {}}
            readOnly
          />
          <InputField
            label={t('SL đơn cần soạn ({0})', unit)}
            value={line ? fmtQty(required) : ''}
            onChange={() => {}}
            readOnly
          />
        </div>

        <InputField
          label={t('Số lượng cần chiết rót ({0})', unit)}
          required
          emphasis
          value={qtyStr}
          onChange={setQtyStr}
          type="number"
          scan
        />
      </ScreenScroll>

      <StickyFooter>
        <Button block disabled={!line} onClick={submit}>
          {t('XÁC NHẬN CHIẾT RÓT')}
        </Button>
      </StickyFooter>

      {order && (
        <JobDocSheet
          open={doc}
          onClose={() => setDoc(false)}
          title={t('Chi tiết phiếu soạn tổng')}
          meta={[
            { label: t('Số đơn hàng'), value: order.soNumber },
            { label: t('Mã đơn hàng'), value: order.code },
            { label: t('Khách hàng'), value: order.customerName },
            { label: t('Vị trí confirm'), value: confirmLoc ? locationById[confirmLoc.id]?.code : '' },
          ]}
          lines={order.lines.map((l) => {
            const qty = drumQtyOf(l)
            return {
              id: l.id,
              name: `${l.palletId} · ${itemById[l.itemId]?.code}`,
              sub: `${t('tem phuy {0}', fmt(qty))} · ${t('cần soạn {0}', fmt(l.qtyRequired))}`,
              right: `${t('vượt {0}', fmt(Math.max(0, qty - l.qtyRequired)))}`,
              done: qty <= l.qtyRequired,
            }
          })}
        />
      )}
    </>
  )
}
