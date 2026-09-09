import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/store'
import { itemById } from '@/data/items'
import { locationById, partnerById } from '@/data/mock'
import { toast } from '@/lib/toast'
import { fmt } from '@/lib/utils'
import { fmtQty, fromUnit, toUnit, unitsOf } from '@/lib/uom'
import { MobileAppBar } from '@/components/mobile/MobileAppBar'
import { ScanField } from '@/components/ui/ScanField'
import { InputField } from '@/components/ui/InputField'
import { SelectField } from '@/components/ui/SelectField'
import { UomSegment } from '@/components/ui/UomSegment'
import { Button } from '@/components/ui/Button'
import { ScreenScroll, StickyFooter } from '@/components/mobile/parts'
import { JobDocSheet } from '@/components/mobile/JobDocSheet'

export function SoanDetail() {
  const nav = useNavigate()
  const { orderId } = useParams()
  const order = useApp((s) => s.pickOrders.find((o) => o.id === orderId))
  const pick = useApp((s) => s.pick)

  const [lineId, setLineId] = useState('')
  const [palletCode, setPalletCode] = useState('')
  const [unit, setUnit] = useState('')
  const [qtyStr, setQtyStr] = useState('')
  const [doc, setDoc] = useState(false)

  const pending = useMemo(() => order?.lines.filter((l) => l.qtyPicked < l.qtyRequired) ?? [], [order])
  // dòng đang thao tác: dòng người dùng chọn, mặc định là dòng chờ soạn đầu tiên
  const line = pending.find((l) => l.id === lineId) ?? pending[0]
  const item = line ? itemById[line.itemId] : undefined
  const units = unitsOf(item)
  const curUnit = unit || line?.unit || units[0]
  const remaining = line ? line.qtyRequired - line.qtyPicked : 0

  const zones = useMemo(() => [...new Set(pending.map((l) => l.zone))], [pending])

  if (!order) return <MobileAppBar title="Không tìm thấy phiếu soạn" />

  const selectLine = (id: string) => {
    setLineId(id)
    setPalletCode('')
    setUnit('')
    setQtyStr('')
  }

  const onUnit = (u: string) => {
    const base = fromUnit(Number(qtyStr) || 0, curUnit, item)
    setUnit(u)
    setQtyStr(qtyStr ? fmtQty(toUnit(base, u, item)) : '')
  }

  const submit = () => {
    if (!line || !item) return
    if (!palletCode.trim()) return toast('Quét mã PALLET ID tại vị trí trước khi soạn')
    if (palletCode.trim().toUpperCase() !== line.palletId.toUpperCase())
      return toast(`Pallet không khớp — cần quét ${line.palletId}`)
    const qty = fromUnit(Number(qtyStr) || 0, curUnit, item)
    if (qty <= 0) return toast('Nhập số lượng đã soạn ở ô XÁC NHẬN SỐ LƯỢNG')

    pick(order.id, line.id, qty)
    const left = pending.length - (qty >= remaining ? 1 : 0)
    setPalletCode('')
    setQtyStr('')
    setLineId('')
    setUnit('')

    if (left <= 0) {
      toast('Đã soạn xong phiếu soạn tổng — về Danh sách công việc')
      nav('/m', { replace: true })
    } else {
      toast(
        qty >= remaining
          ? `Đã soạn xong dòng này · còn ${left} dòng trên phiếu`
          : `Đã soạn ${fmt(qty)} · còn thiếu ${fmt(remaining - qty)}`,
      )
    }
  }

  return (
    <>
      <MobileAppBar
        title="Chi tiết soạn hàng"
        onDoc={() => setDoc(true)}
        onRefresh={() => {
          selectLine('')
          toast('Đã làm mới — hiển thị dòng chờ soạn kế tiếp')
        }}
      />

      <ScreenScroll className="form-fill px-4 py-3">
        {!line ? (
          <div className="py-16 text-center text-[15px] text-muted">Phiếu này đã soạn xong.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                label="Khu vực"
                value={line.zone}
                options={zones.map((z) => ({ value: z, label: z }))}
                onChange={(z) => {
                  const first = pending.find((l) => l.zone === z)
                  if (first) selectLine(first.id)
                }}
              />
              <SelectField
                label="Vị trí"
                value={line.id}
                options={pending
                  .filter((l) => l.zone === line.zone)
                  .map((l) => ({
                    value: l.id,
                    label: locationById[l.locationId]?.code ?? '',
                    sub: `${itemById[l.itemId]?.code} · còn ${fmt(l.qtyRequired - l.qtyPicked)}`,
                  }))}
                onChange={selectLine}
              />
            </div>

            <ScanField
              label="Pallet ID"
              required
              value={palletCode}
              onChange={setPalletCode}
              options={[
                {
                  value: line.palletId,
                  label: line.palletId,
                  sub: `Tại vị trí ${locationById[line.locationId]?.code}`,
                },
              ]}
            />

            <InputField
              label="Mã hàng - Tên hàng"
              value={item ? `${item.code} - ${item.name}` : ''}
              onChange={() => {}}
              readOnly
            />

            <div className="grid grid-cols-2 gap-2">
              <InputField label="Số lô NCC" value={line.lotNcc} onChange={() => {}} readOnly />
              <InputField label="Số lô" value={line.lot} onChange={() => {}} readOnly />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <InputField label="Ngày sản xuất" value={line.mfgDate} onChange={() => {}} readOnly type="date" calendar />
              <InputField label="Hạn sử dụng" value={line.expDate} onChange={() => {}} readOnly type="date" calendar />
            </div>

            <UomSegment qty={toUnit(remaining, curUnit, item)} units={units} selected={curUnit} onSelect={onUnit} />

            <InputField
              label={`Xác nhận số lượng (${curUnit})`}
              required
              value={qtyStr}
              onChange={setQtyStr}
              type="number"
              scan
            />
          </>
        )}
      </ScreenScroll>

      <StickyFooter>
        <Button block disabled={!line} onClick={submit}>
          Soạn hàng
        </Button>
      </StickyFooter>

      <JobDocSheet
        open={doc}
        onClose={() => setDoc(false)}
        title="Chi tiết phiếu soạn tổng"
        meta={[
          { label: 'Số đơn hàng', value: order.soNumber },
          { label: 'Mã đơn hàng', value: order.code },
          { label: 'Khách hàng', value: partnerById[order.customerId]?.name },
        ]}
        lines={order.lines.map((l) => ({
          id: l.id,
          name: `${locationById[l.locationId]?.code} · ${itemById[l.itemId]?.code}`,
          sub: itemById[l.itemId]?.name,
          right: `${fmt(l.qtyPicked)}/${fmt(l.qtyRequired)}`,
          done: l.qtyPicked >= l.qtyRequired,
        }))}
      />
    </>
  )
}
