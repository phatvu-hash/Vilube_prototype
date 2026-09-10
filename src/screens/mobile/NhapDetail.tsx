import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp, useWhKind } from '@/store'
import { itemById } from '@shared/items'
import { mkLotInternal } from '@shared/catalog'
import { toast } from '@/lib/toast'
import { addDays, fmt, todayIso } from '@/lib/utils'
import { baseUnit, fmtQty, fromUnit, toUnit, unitsOf } from '@shared/uom'
import { UOM_BY_CODE, parseCartonBarcode, parseDrumBarcode } from '@shared/barcode'
import { useT } from '@/i18n'
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
  const t = useT()
  const kind = useWhKind()
  const { asnId } = useParams()
  const asn = useApp((s) => s.asns.find((a) => a.id === asnId))
  const receive = useApp((s) => s.receive)

  const isNvl = kind === 'NVL'
  /** Kho NVL: đơn có phuy đăng ký sẵn thì quét DrumID, không thì chọn tay như thẻ khác nhãn */
  const nvlScanMode = Boolean(asn?.lines.some((l) => l.packages.length > 0))

  const [tab, setTab] = useState('nhan')
  const [doc, setDoc] = useState(false)

  // form
  const [scanCode, setScanCode] = useState('') // mã carton (BB) / mã phuy (NVL)
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
  const units = unitsOf(item, kind)
  const curUnit = unit || units[0]

  /** Chế độ đang thao tác: quét tem (carton/phuy) hay nhập tay */
  const scanMode = isNvl ? nvlScanMode : tab === 'nhan'

  /** Mã kiện còn chờ nhận trên toàn đơn — mô phỏng danh sách máy quét đọc được */
  const packageOptions = useMemo(() => {
    if (!asn) return []
    return asn.lines.flatMap((l) =>
      l.packages
        .filter((c) => !c.received)
        .map((c) => ({
          value: c.barcode ?? c.code,
          label: c.barcode ?? c.code,
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
          sub: t('Còn phải nhận {0} {1}', fmt(l.qtyExpected - l.qtyReceived), baseUnit(itemById[l.itemId])),
        })),
    [asn, t],
  )

  if (!asn) return <MobileAppBar title={t('Không tìm thấy đơn nhập')} />

  const remaining = line ? line.qtyExpected - line.qtyReceived : 0

  const resetForm = () => {
    setScanCode('')
    setPalletCode('')
    setLineId('')
    setLot('')
    setLotInternal('')
    setMfg('')
    setExp('')
    setUnit('')
    setQtyStr('')
  }

  const fillFromLine = (l: (typeof asn.lines)[number], u: string, qtyBase: number) => {
    const it = itemById[l.itemId]
    setLineId(l.id)
    setLot(l.lot)
    setLotInternal(l.lotInternal || mkLotInternal(l.mfgDate, todayIso()))
    setMfg(l.mfgDate)
    setExp(l.expDate)
    setUnit(u)
    setQtyStr(fmtQty(toUnit(qtyBase, u, it)))
  }

  /**
   * Kho Bao Bì — quét tem carton (HDSD 5.1).
   * Barcode: mã hàng | số lượng | ĐVT | mã kiểm tra trùng
   */
  const onScanCarton = (raw: string) => {
    if (!raw.trim()) return
    const bc = parseCartonBarcode(raw)
    if (!bc) return toast(t('Barcode sai định dạng — cần dạng MãHàng|SốLượng|ĐVT|MãKiểmTra'))

    // 1. Chặn quét trùng theo mã kiểm tra trùng (7 ký tự cuối)
    const dup = asn.lines.some((l) => l.packages.some((c) => c.code === bc.checkCode && c.received))
    if (dup) return toast(t('Mã carton {0} đã được quét — không nhận trùng', bc.checkCode))

    // 2. Mã hàng phải thuộc đơn nhập
    const found = asn.lines.find((l) => itemById[l.itemId]?.code === bc.itemCode)
    if (!found) return toast(t('Mã hàng {0} không thuộc đơn nhập này', bc.itemCode))

    // 3. Ánh xạ đơn vị của barcode sang nhãn trên app
    const uom = UOM_BY_CODE[bc.uomCode]
    if (!uom) return toast(t('Đơn vị {0} trong barcode chưa được khai báo', bc.uomCode))

    // 4. Không vượt số lượng còn lại của đơn
    const it = itemById[found.itemId]
    const qtyBase = fromUnit(bc.qty, uom, it)
    const left = found.qtyExpected - found.qtyReceived
    if (qtyBase > left) return toast(t('Số lượng {0} vượt số còn lại {1} của đơn', fmt(qtyBase), fmt(left)))

    fillFromLine(found, uom, qtyBase)
  }

  /**
   * Kho NVL — quét tem phuy.
   * Tem: mã hàng / số lô / số lượng / mã phuy — hệ thống cắt chuỗi rồi đối chiếu
   * từng phần với đơn nhập, sai phần nào báo đúng phần đó.
   */
  const onScanDrum = (raw: string) => {
    if (!raw.trim()) return
    const bc = parseDrumBarcode(raw)
    if (!bc) return toast(t('Tem phuy sai định dạng — cần dạng MãHàng|SốLô|SốLượng|MãPhuy'))

    // 1. Mã hàng phải thuộc đơn nhập
    const found = asn.lines.find((l) => itemById[l.itemId]?.code.toUpperCase() === bc.itemCode)
    if (!found) return toast(t('Mã hàng {0} không thuộc đơn nhập này', bc.itemCode))

    // 2. Số lô trên tem phải khớp số lô của dòng hàng
    if (found.lot && found.lot.toUpperCase() !== bc.lot)
      return toast(t('Số lô {0} trên tem không khớp số lô {1} của đơn', bc.lot, found.lot))

    // 3. Mã phuy phải có trên đơn và chưa quét lần nào
    const pkg = found.packages.find((c) => c.code.toUpperCase() === bc.drumId)
    if (!pkg) return toast(t('Mã phuy {0} không có trên đơn nhập này', bc.drumId))
    if (pkg.received) return toast(t('Mã phuy {0} đã được quét — không nhận trùng', bc.drumId))

    // 4. Số lượng trên tem phải khớp phuy đã đăng ký và không vượt số còn lại
    if (bc.qty !== pkg.qty)
      return toast(t('Số lượng {0} trên tem không khớp {1} của phuy trên đơn', fmt(bc.qty), fmt(pkg.qty)))
    const left = found.qtyExpected - found.qtyReceived
    if (bc.qty > left) return toast(t('Số lượng {0} vượt số còn lại {1} của đơn', fmt(bc.qty), fmt(left)))

    const it = itemById[found.itemId]
    fillFromLine(found, baseUnit(it), bc.qty)
    // đơn chưa ghi số lô thì lấy luôn số lô in trên tem
    if (!found.lot) setLot(bc.lot)
  }

  /** Chọn mặt hàng ở thẻ khác nhãn / đơn NVL không có phuy đăng ký sẵn */
  const onPickLine = (id: string) => {
    const l = asn.lines.find((x) => x.id === id)
    if (!l) return
    fillFromLine(l, baseUnit(itemById[l.itemId]), l.qtyExpected - l.qtyReceived)
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
    if (!line || !item)
      return toast(
        scanMode
          ? isNvl
            ? t('Quét mã phuy trước')
            : t('Quét mã carton trước')
          : t('Quét mã pallet và chọn mã hàng'),
      )
    if (!isNvl && tab === 'khac' && !palletCode.trim()) return toast(t('Quét mã Pallet ID trước khi nhận hàng'))
    const qty = fromUnit(Number(qtyStr) || 0, curUnit, item)
    if (qty <= 0) return toast(t('Nhập số lượng xác nhận'))
    if (!lot.trim()) return toast(t('Số lô đang trống — nhập hoặc chọn số lô'))
    if (qty > remaining) return toast(t('Số lượng {0} vượt số còn lại {1} của đơn', fmt(qty), fmt(remaining)))

    // Mã kiện dùng để đánh dấu đã nhận + mã pallet/phuy đưa sang công việc cất hàng.
    // Kho NVL lấy mã phuy cắt ra từ tem, không lấy nguyên chuỗi vừa quét.
    const bc = scanMode && !isNvl ? parseCartonBarcode(scanCode) : null
    const drum = scanMode && isNvl ? parseDrumBarcode(scanCode) : null
    const packageCode = isNvl ? drum?.drumId : (bc?.checkCode ?? undefined)
    const palletId = isNvl
      ? (drum?.drumId ?? `DRM-${asn.code.slice(-4)}-${asn.lines.indexOf(line) + 1}`)
      : tab === 'khac'
        ? palletCode.trim()
        : `PLT-${asn.code.slice(-4)}-${asn.lines.indexOf(line) + 1}`

    receive(asn.id, line.id, {
      packageCode,
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
      toast(t('Đã nhận xong toàn bộ đơn — chuyển sang công việc Cất hàng'))
      nav('/m', { replace: true })
    } else {
      const left = Math.max(0, remaining - qty)
      toast(
        left > 0
          ? t('Đã nhận {0} {1} · còn {2} {1} trên dòng này', fmt(qty), baseUnit(item), fmt(left))
          : t('Đã nhận {0} {1} · quét mã tiếp theo', fmt(qty), baseUnit(item)),
      )
    }
  }

  const receivedTotal = asn.lines.reduce((s, l) => s + l.qtyReceived, 0)
  const expectedTotal = asn.lines.reduce((s, l) => s + l.qtyExpected, 0)

  return (
    <>
      <MobileAppBar title={t('Chi tiết nhập hàng')} onDoc={() => setDoc(true)} />

      <ScreenScroll className="form-fill px-4 py-3">
        {/* Kho Bao Bì có 2 thẻ; kho NVL nhận thẳng theo phuy nên không có thẻ */}
        {!isNvl && (
          <SegmentTabs
            tabs={TABS.map((x) => ({ ...x, label: t(x.label) }))}
            active={tab}
            onChange={(k) => {
              setTab(k)
              resetForm()
            }}
          />
        )}

        <div className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-1.5 text-[12px] text-navy">
          <span>{t('Đơn {0} · {1}', asn.code, t(asn.type))}</span>
          <span className="font-bold">
            {t('{0}% đã nhận', Math.round((receivedTotal / expectedTotal) * 100))}
          </span>
        </div>

        {scanMode ? (
          <ScanField
            label={isNvl ? t('Quét mã phuy') : t('Quét mã carton')}
            required
            value={scanCode}
            onChange={setScanCode}
            onCommit={isNvl ? onScanDrum : onScanCarton}
            options={packageOptions}
            emptyText={
              isNvl ? t('Đơn này không còn phuy chờ nhận') : t('Đơn này không còn carton dán nhãn chờ nhận')
            }
          />
        ) : (
          <ScanField
            label={t('Quét mã pallet')}
            required
            value={palletCode}
            onChange={setPalletCode}
            options={palletOptions.map((o) => ({ ...o, sub: t(o.sub) }))}
            sheetTitle={t('Quét tem Pallet ID')}
          />
        )}

        {scanMode ? (
          <InputField
            label={t('SKU - Tên hàng')}
            value={item ? `${item.code} - ${item.name}` : ''}
            onChange={() => {}}
            readOnly
            emphasis
          />
        ) : (
          <SelectField
            label={t('SKU - Tên hàng')}
            required
            value={lineId}
            options={lineOptions}
            onChange={onPickLine}
            emphasis
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          <InputField label={t('Mã hàng')} value={item?.code ?? ''} onChange={() => {}} readOnly scan />
          <SelectField
            label={t('Số lô')}
            value={lot}
            options={
              lot
                ? [{ value: lot, label: lot }]
                : (asn.lines.filter((l) => l.lot).map((l) => ({ value: l.lot, label: l.lot })) ?? [])
            }
            onChange={setLot}
          />
        </div>

        <InputField label={t('Số lô nội bộ')} value={lotInternal} onChange={setLotInternal} />

        <div className="grid grid-cols-2 gap-2">
          <InputField label={t('Ngày sản xuất')} value={mfg} onChange={onMfg} type="date" calendar />
          <InputField label={t('Hạn sử dụng')} value={exp} onChange={setExp} type="date" calendar />
        </div>

        <UomSegment
          qty={qtyStr ? Number(qtyStr) : toUnit(remaining, curUnit, item)}
          units={units}
          selected={curUnit}
          onSelect={onUnit}
        />

        <InputField
          label={t('Số lượng xác nhận ({0})', curUnit)}
          required
          value={qtyStr}
          onChange={setQtyStr}
          type="number"
          scan
        />
      </ScreenScroll>

      <StickyFooter>
        <Button block onClick={submit}>
          {t('NHẬN HÀNG')}
        </Button>
      </StickyFooter>

      <JobDocSheet
        open={doc}
        onClose={() => setDoc(false)}
        title={t('Chi tiết đơn nhập')}
        meta={[
          { label: t('Mã đơn'), value: asn.code },
          { label: t('Số đơn nhập'), value: asn.pnk },
          { label: t('Loại đơn nhập'), value: t(asn.type) },
        ]}
        lines={asn.lines.map((l) => ({
          id: l.id,
          name: `${itemById[l.itemId]?.code} - ${itemById[l.itemId]?.name}`,
          sub: t('Số lô {0}', l.lot || '—'),
          right: `${fmt(l.qtyReceived)}/${fmt(l.qtyExpected)}`,
          done: l.qtyReceived >= l.qtyExpected,
        }))}
      />
    </>
  )
}
