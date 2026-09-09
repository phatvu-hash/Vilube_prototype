import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store'
import { items, itemById } from '@/data/items'
import { inboundTypes, mkLotInternal } from '@/data/mock'
import { toast } from '@/lib/toast'
import { addDays, fmt, todayIso } from '@/lib/utils'
import { baseUnit, fmtQty, fromUnit, toUnit, unitsOf } from '@/lib/uom'
import { MobileAppBar } from '@/components/mobile/MobileAppBar'
import { ScanField } from '@/components/ui/ScanField'
import { InputField } from '@/components/ui/InputField'
import { SelectField } from '@/components/ui/SelectField'
import { UomSegment } from '@/components/ui/UomSegment'
import { Button } from '@/components/ui/Button'
import { ScreenScroll, StickyFooter } from '@/components/mobile/parts'

/** PHẦN 3 — Nhập hàng chủ động (Khác → Nhập hàng) */
export function NhanHang() {
  const nav = useNavigate()
  const receiveDirect = useApp((s) => s.receiveDirect)

  const [orderType, setOrderType] = useState(inboundTypes[2])
  const [postingDate, setPostingDate] = useState(todayIso())
  const [itemCode, setItemCode] = useState('')
  const [itemId, setItemId] = useState('')
  const [palletId, setPalletId] = useState('')
  const [lot, setLot] = useState('')
  const [mfg, setMfg] = useState('')
  const [exp, setExp] = useState('')
  const [lotInternal, setLotInternal] = useState('')
  const [unit, setUnit] = useState('')
  const [qtyStr, setQtyStr] = useState('')

  const item = itemById[itemId]
  const units = unitsOf(item)
  const curUnit = unit || units[0]

  const itemOptions = useMemo(
    () => items.map((x) => ({ value: x.id, label: `${x.code} - ${x.name}`, sub: x.packingCode })),
    [],
  )
  const scanItemOptions = useMemo(
    () => items.slice(0, 12).map((x) => ({ value: x.code, label: x.code, sub: x.name })),
    [],
  )
  const palletOptions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const code = `DR${String(i + 1).padStart(6, '0')}`
        return { value: code, label: code, sub: 'Tem pallet' }
      }),
    [],
  )

  /** Quét mã hàng → chọn luôn mặt hàng tương ứng */
  const onScanItem = (code: string) => {
    setItemCode(code)
    const found = items.find((x) => x.code === code)
    if (found) onPickItem(found.id)
  }

  const onPickItem = (id: string) => {
    setItemId(id)
    const it = itemById[id]
    setItemCode(it?.code ?? '')
    setUnit(baseUnit(it))
    setQtyStr('')
  }

  const onMfg = (v: string) => {
    setMfg(v)
    if (v) {
      if (!exp) setExp(addDays(v, 730))
      setLotInternal(mkLotInternal(v, postingDate))
    }
  }

  const onUnit = (u: string) => {
    const base = fromUnit(Number(qtyStr) || 0, curUnit, item)
    setUnit(u)
    setQtyStr(qtyStr ? fmtQty(toUnit(base, u, item)) : '')
  }

  const submit = () => {
    if (!item) return toast('Chọn mặt hàng ở ô SKU - Tên hàng')
    if (!palletId.trim()) return toast('Quét mã PALLET ID')
    if (!lot.trim()) return toast('Nhập hoặc chọn số lô')
    const qty = fromUnit(Number(qtyStr) || 0, curUnit, item)
    if (qty <= 0) return toast('Nhập số lượng xác nhận')

    receiveDirect({
      orderType,
      postingDate,
      itemId: item.id,
      palletId: palletId.trim(),
      lot: lot.trim(),
      lotInternal: lotInternal || mkLotInternal(mfg || postingDate, postingDate),
      mfgDate: mfg,
      expDate: exp,
      qty,
      unit: curUnit,
    })

    toast(`Đã nhận ${fmt(qty)} ${baseUnit(item)} · pallet ${palletId} đã chuyển sang công việc Cất hàng`)
    nav('/m', { replace: true })
  }

  const bigQty = Number(qtyStr) || 0

  return (
    <>
      <MobileAppBar title="Nhận hàng" doc />

      <ScreenScroll className="space-y-3 px-4 py-3">
        <SelectField
          label="Loại đơn hàng nhập"
          required
          value={orderType}
          options={inboundTypes.map((t) => ({ value: t, label: t }))}
          onChange={setOrderType}
          emphasis
        />

        <InputField label="Postingdate" value={postingDate} onChange={setPostingDate} type="date" calendar />

        <ScanField
          label="Mã hàng"
          value={itemCode}
          onChange={onScanItem}
          options={scanItemOptions}
          sheetTitle="Quét mã hàng"
        />

        <SelectField
          label="SKU - Tên hàng"
          required
          value={itemId}
          options={itemOptions}
          onChange={onPickItem}
          emphasis
        />

        <ScanField label="Pallet ID" required value={palletId} onChange={setPalletId} options={palletOptions} />

        <SelectField
          label="Số lô"
          value={lot}
          options={['2613030000', '2613030001', '2613030002'].map((x) => ({ value: x, label: x }))}
          onChange={setLot}
        />

        <div className="grid grid-cols-2 gap-2">
          <InputField label="Ngày sản xuất" value={mfg} onChange={onMfg} type="date" calendar />
          <InputField label="Hạn sử dụng" value={exp} onChange={setExp} type="date" calendar />
        </div>

        <InputField label="Số lô nội bộ" value={lotInternal} onChange={setLotInternal} />

        <UomSegment qty={bigQty} units={units} selected={curUnit} onSelect={onUnit} />

        <InputField
          label={`Số lượng xác nhận (${curUnit})`}
          required
          value={qtyStr}
          onChange={setQtyStr}
          type="number"
          scan
        />
      </ScreenScroll>

      <StickyFooter>
        <Button block onClick={submit}>
          NHẬN HÀNG
        </Button>
      </StickyFooter>
    </>
  )
}
