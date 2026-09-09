import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/store'
import { itemById } from '@/data/items'
import { mkLotInternal } from '@/data/mock'
import { toast } from '@/lib/toast'
import { addDays, fmt, todayIso } from '@/lib/utils'
import { baseUnit, fmtQty, fromUnit, toUnit, unitsOf } from '@/lib/uom'
import { MobileAppBar } from '@/components/mobile/MobileAppBar'
import { SegmentTabs } from '@/components/ui/SegmentTabs'
import { ScanField } from '@/components/ui/ScanField'
import { InputField } from '@/components/ui/InputField'
import { SelectField } from '@/components/ui/SelectField'
import { UomSegment } from '@/components/ui/UomSegment'
import { Button } from '@/components/ui/Button'
import { ScreenScroll, StickyFooter } from '@/components/mobile/parts'
import { JobDocSheet } from '@/components/mobile/JobDocSheet'

const TABS = [
  { key: 'nhan', label: 'Thẻ nhãn' },
  { key: 'khac', label: 'Thẻ khác nhãn' },
]

export function NhapDetail() {
  const nav = useNavigate()
  const { asnId } = useParams()
  const asn = useApp((s) => s.asns.find((a) => a.id === asnId))
  const receive = useApp((s) => s.receive)

  const [tab, setTab] = useState('nhan')
  const [doc, setDoc] = useState(false)

  // form
  const [cartonCode, setCartonCode] = useState('')
  const [palletCode, setPalletCode] = useState('')
  const [lineId, setLineId] = useState('')
  const [lot, setLot] = useState('')
  const [lotInternal, setLotInternal] = useState('')
  const [mfg, setMfg] = useState('')
  const [exp, setExp] = useState('')
  const [unit, setUnit] = useState('')
  const [qtyStr, setQtyStr] = useState('')

  const line = asn?.lines.find((l) => l.id === lineId)
  const item = line ? itemById[line.itemId] : undefined
  const units = unitsOf(item)
  const curUnit = unit || units[0]

  /** Mã carton còn chờ nhận trên toàn đơn */
  const cartonOptions = useMemo(() => {
    if (!asn) return []
    return asn.lines.flatMap((l) =>
      l.cartons
        .filter((c) => !c.received)
        .map((c) => ({
          value: c.code,
          label: c.code,
          sub: `${itemById[l.itemId]?.code} · ${itemById[l.itemId]?.name}`,
        })),
    )
  }, [asn])

  /** Tem Pallet ID dán mới cho hàng chưa có nhãn */
  const palletOptions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const code = `PLT${String(i + 1).padStart(6, '0')}`
        return { value: code, label: code, sub: 'Tem pallet dán mới' }
      }),
    [],
  )

  const lineOptions = useMemo(
    () =>
      (asn?.lines ?? [])
        .filter((l) => l.qtyReceived < l.qtyExpected)
        .map((l) => ({
          value: l.id,
          label: `${itemById[l.itemId]?.code} - ${itemById[l.itemId]?.name}`,
          sub: `Còn phải nhận ${fmt(l.qtyExpected - l.qtyReceived)} ${baseUnit(itemById[l.itemId])}`,
        })),
    [asn],
  )

  if (!asn) return <MobileAppBar title="Không tìm thấy đơn nhập" />

  const remaining = line ? line.qtyExpected - line.qtyReceived : 0

  const resetForm = () => {
    setCartonCode('')
    setPalletCode('')
    setLineId('')
    setLot('')
    setLotInternal('')
    setMfg('')
    setExp('')
    setUnit('')
    setQtyStr('')
  }

  /** Quét mã carton → hệ thống tự điền toàn bộ thông tin (HDSD bước 8–9) */
  const onScanCarton = (code: string) => {
    setCartonCode(code)
    const found = asn.lines.find((l) => l.cartons.some((c) => c.code === code))
    const carton = found?.cartons.find((c) => c.code === code)
    if (!found || !carton) return
    const it = itemById[found.itemId]
    setLineId(found.id)
    setLot(found.lot)
    setLotInternal(found.lotInternal || mkLotInternal(found.mfgDate, todayIso()))
    setMfg(found.mfgDate)
    setExp(found.expDate)
    setUnit(baseUnit(it))
    setQtyStr(String(carton.qty))
  }

  /** Chọn mặt hàng ở thẻ khác nhãn */
  const onPickLine = (id: string) => {
    setLineId(id)
    const l = asn.lines.find((x) => x.id === id)
    if (!l) return
    const it = itemById[l.itemId]
    setLot(l.lot)
    setLotInternal(l.lotInternal)
    setMfg(l.mfgDate)
    setExp(l.expDate)
    setUnit(baseUnit(it))
    setQtyStr(fmtQty(toUnit(l.qtyExpected - l.qtyReceived, baseUnit(it), it)))
  }

  const onMfg = (v: string) => {
    setMfg(v)
    if (v && !exp) setExp(addDays(v, 730))
    if (v) setLotInternal(mkLotInternal(v, todayIso()))
  }

  const onUnit = (u: string) => {
    const base = fromUnit(Number(qtyStr) || 0, curUnit, item)
    setUnit(u)
    setQtyStr(fmtQty(toUnit(base, u, item)))
  }

  const submit = () => {
    if (!line || !item) return toast(tab === 'nhan' ? 'Quét mã carton trước' : 'Quét mã pallet và chọn mã hàng')
    if (tab === 'khac' && !palletCode.trim()) return toast('Quét mã Pallet ID trước khi nhận hàng')
    const qty = fromUnit(Number(qtyStr) || 0, curUnit, item)
    if (qty <= 0) return toast('Nhập số lượng xác nhận')
    if (!lot.trim()) return toast('Số lô đang trống — nhập hoặc chọn số lô')

    const palletId =
      tab === 'khac' ? palletCode.trim() : `PLT-${asn.code.slice(-4)}-${asn.lines.indexOf(line) + 1}`

    receive(asn.id, line.id, {
      cartonCode: tab === 'nhan' ? cartonCode : undefined,
      palletId,
      itemId: line.itemId,
      qty,
      unit: curUnit,
      lot: lot.trim(),
      mfgDate: mfg,
      expDate: exp,
      lotInternal: lotInternal || mkLotInternal(mfg, todayIso()),
    })

    const doneAll =
      asn.lines.every((l) => (l.id === line.id ? l.qtyReceived + qty : l.qtyReceived) >= l.qtyExpected)
    resetForm()

    if (doneAll) {
      toast('Đã nhận xong toàn bộ đơn — chuyển sang công việc Cất hàng')
      nav('/m', { replace: true })
    } else {
      const left = Math.max(0, remaining - qty)
      toast(
        left > 0
          ? `Đã nhận ${fmt(qty)} ${baseUnit(item)} · còn ${fmt(left)} ${baseUnit(item)} trên dòng này`
          : `Đã nhận ${fmt(qty)} ${baseUnit(item)} · quét mã tiếp theo`,
      )
    }
  }

  const receivedTotal = asn.lines.reduce((s, l) => s + l.qtyReceived, 0)
  const expectedTotal = asn.lines.reduce((s, l) => s + l.qtyExpected, 0)

  return (
    <>
      <MobileAppBar title="Chi tiết nhập hàng" onDoc={() => setDoc(true)} />

      <ScreenScroll className="form-fill px-4 py-3">
        <SegmentTabs
          tabs={TABS}
          active={tab}
          onChange={(k) => {
            setTab(k)
            resetForm()
          }}
        />

        <div className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-1.5 text-[12px] text-navy">
          <span>
            Đơn <b>{asn.code}</b> · {asn.type}
          </span>
          <span className="font-bold">
            {Math.round((receivedTotal / expectedTotal) * 100)}% đã nhận
          </span>
        </div>

        {tab === 'nhan' ? (
          <ScanField
            label="Quét mã carton"
            required
            value={cartonCode}
            onChange={onScanCarton}
            options={cartonOptions}
            emptyText="Đơn này không còn carton dán nhãn chờ nhận"
          />
        ) : (
          <ScanField
            label="Quét mã pallet"
            required
            value={palletCode}
            onChange={setPalletCode}
            options={palletOptions}
            sheetTitle="Quét tem Pallet ID"
          />
        )}

        {tab === 'nhan' ? (
          <InputField
            label="SKU - Tên hàng"
            value={item ? `${item.code} - ${item.name}` : ''}
            onChange={() => {}}
            readOnly
            emphasis
          />
        ) : (
          <SelectField
            label="SKU - Tên hàng"
            required
            value={lineId}
            options={lineOptions}
            onChange={onPickLine}
            emphasis
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          <InputField label="Mã hàng" value={item?.code ?? ''} onChange={() => {}} readOnly scan />
          <SelectField
            label="Số lô"
            value={lot}
            options={
              lot
                ? [{ value: lot, label: lot }]
                : (asn.lines.filter((l) => l.lot).map((l) => ({ value: l.lot, label: l.lot })) ?? [])
            }
            onChange={setLot}
          />
        </div>

        <InputField label="Số lô nội bộ" value={lotInternal} onChange={setLotInternal} />

        <div className="grid grid-cols-2 gap-2">
          <InputField label="Ngày sản xuất" value={mfg} onChange={onMfg} type="date" calendar />
          <InputField label="Hạn sử dụng" value={exp} onChange={setExp} type="date" calendar />
        </div>

        <UomSegment
          qty={toUnit(remaining, curUnit, item)}
          units={units}
          selected={curUnit}
          onSelect={onUnit}
        />

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

      <JobDocSheet
        open={doc}
        onClose={() => setDoc(false)}
        title="Chi tiết đơn nhập"
        meta={[
          { label: 'Mã đơn', value: asn.code },
          { label: 'Số đơn nhập', value: asn.pnk },
          { label: 'Loại đơn nhập', value: asn.type },
        ]}
        lines={asn.lines.map((l) => ({
          id: l.id,
          name: `${itemById[l.itemId]?.code} - ${itemById[l.itemId]?.name}`,
          sub: `Số lô ${l.lot || '—'}`,
          right: `${fmt(l.qtyReceived)}/${fmt(l.qtyExpected)}`,
          done: l.qtyReceived >= l.qtyExpected,
        }))}
      />
    </>
  )
}
