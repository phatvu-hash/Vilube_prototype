import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp, useWhKind, type PickSource } from '@/store'
import { itemById } from '@shared/items'
import { locationById } from '@shared/catalog'
import { buildDrumBarcode } from '@shared/barcode'
import { checkDrumForPick, type BatchWarning, type DrumScanError, type DrumScanResult } from '@shared/pick'
import { toast } from '@/lib/toast'
import { fmt, fmtDateSlash, todayIso } from '@/lib/utils'
import { fmtQty, fromUnit, toUnit, unitsOf } from '@shared/uom'
import { useT, type TFn } from '@/i18n'
import { MobileAppBar } from '@/components/mobile/MobileAppBar'
import { ScanField } from '@/components/ui/ScanField'
import { InputField } from '@/components/ui/InputField'
import { SelectField } from '@/components/ui/SelectField'
import { UomSegment } from '@/components/ui/UomSegment'
import { Button } from '@/components/ui/Button'
import { ScreenScroll, StickyFooter } from '@/components/mobile/parts'
import { JobDocSheet } from '@/components/mobile/JobDocSheet'
import { ConfirmModal } from '@/components/mobile/ConfirmModal'

/** Kết quả quét tem phuy đã qua hết các bước kiểm tra */
type DrumOk = Extract<DrumScanResult, { ok: true }>

/** Lỗi chặn — quét lại phuy khác, không cho soạn phuy này */
function errorText(t: TFn, e: DrumScanError): string {
  if (e.kind === 'BAD_FORMAT')
    return t('Tem phuy sai định dạng — cần dạng MãHàng|SốLô|SốLượng|MãPhuy')
  if (e.kind === 'NOT_IN_STOCK') return t('Phuy {0} không tồn tại trong kho', e.drumId)
  if (e.kind === 'NOT_IN_ORDER')
    return t('Phuy {0} thuộc mã hàng {1} — không nằm trong phiếu soạn này', e.drumId, e.itemCode)
  return t(
    'Phuy {0} đang ở vị trí {1} — không phải vị trí đang soạn',
    e.drumId,
    locationById[e.atLocationId]?.code ?? e.atLocationId,
  )
}

/** Lô không đáp ứng — nêu rõ lý do rồi hỏi Có / Không */
function warningText(t: TFn, w: BatchWarning): string {
  if (w.kind === 'EXPIRED') return t('lô {0} đã hết hạn ngày {1}', w.lot, fmtDateSlash(w.expDate))
  if (w.kind === 'NEAR_EXPIRY')
    return t('lô {0} chỉ còn {1} ngày sử dụng (HSD {2})', w.lot, w.days, fmtDateSlash(w.expDate))
  if (w.kind === 'OTHER_LOT') return t('lô {0} khác lô đề xuất {1}', w.lot, w.lineLot)
  return t('còn lô {0} hạn dùng sớm hơn ({1}) chưa xuất', w.bestLot, fmtDateSlash(w.bestExpDate))
}

export function SoanDetail() {
  const nav = useNavigate()
  const t = useT()
  const kind = useWhKind()
  const { orderId } = useParams()
  const order = useApp((s) => s.pickOrders.find((o) => o.id === orderId))
  const allInventory = useApp((s) => s.inventory)
  const pick = useApp((s) => s.pick)

  const isNvl = kind === 'NVL'
  const [lineId, setLineId] = useState('')
  const [palletCode, setPalletCode] = useState('')
  const [unit, setUnit] = useState('')
  const [qtyStr, setQtyStr] = useState('')
  const [doc, setDoc] = useState(false)
  /** Phuy đã quét hợp lệ, sẵn sàng soạn */
  const [scan, setScan] = useState<DrumOk | null>(null)
  /** Phuy quét được nhưng lô không đáp ứng — đang chờ trả lời Có / Không */
  const [ask, setAsk] = useState<DrumOk | null>(null)

  const pending = useMemo(() => order?.lines.filter((l) => l.qtyPicked < l.qtyRequired) ?? [], [order])
  // dòng đang thao tác: dòng người dùng chọn, mặc định là dòng chờ soạn đầu tiên
  const line = pending.find((l) => l.id === lineId) ?? pending[0]
  const item = line ? itemById[line.itemId] : undefined
  const units = unitsOf(item, kind)
  const curUnit = unit || line?.unit || units[0]
  const remaining = line ? line.qtyRequired - line.qtyPicked : 0

  const zones = useMemo(() => [...new Set(pending.map((l) => l.zone))], [pending])
  const inventory = useMemo(
    () => allInventory.filter((r) => r.whId === order?.whId),
    [allInventory, order],
  )

  /**
   * Mã "quét" được ở vị trí của các dòng đang chờ soạn.
   * Kho NVL đưa nguyên tem bốn phần để màn hình cắt chuỗi đúng như máy quét thật.
   */
  const scanOptions = useMemo(() => {
    if (!isNvl)
      return pending.map((l) => ({
        value: l.palletId,
        label: l.palletId,
        sub: t('Tại vị trí {0}', locationById[l.locationId]?.code ?? ''),
      }))
    const byCode = new Map<string, { value: string; label: string; sub: string }>()
    for (const l of pending) {
      for (const r of inventory) {
        if (r.itemId !== l.itemId || r.locationId !== l.locationId || r.qty <= 0) continue
        const it = itemById[r.itemId]
        const qty = it?.kgPerCarton && it.kgPerCarton > 0 ? Math.min(it.kgPerCarton, r.qty) : r.qty
        const value = buildDrumBarcode(it?.code ?? '', r.lot, qty, r.palletId)
        byCode.set(value, {
          value,
          label: r.palletId,
          sub: `${locationById[r.locationId]?.code ?? ''} · ${t('lô {0}', r.lot)}${
            r.lot === l.lot ? ` · ${t('lô đề xuất')}` : ` · ${t('khác lô')}`
          }`,
        })
      }
    }
    return [...byCode.values()]
  }, [isNvl, pending, inventory, t])

  if (!order) return <MobileAppBar title={t('Không tìm thấy phiếu soạn')} />

  /** Lô đang hiển thị: theo phuy vừa quét nếu có, không thì theo dòng phiếu */
  const batch = scan
    ? { lotNcc: scan.drum.lot, lot: scan.row.lot, mfgDate: scan.row.mfgDate, expDate: scan.row.expDate }
    : { lotNcc: line?.lotNcc ?? '', lot: line?.lot ?? '', mfgDate: line?.mfgDate ?? '', expDate: line?.expDate ?? '' }

  const selectLine = (id: string) => {
    setLineId(id)
    setPalletCode('')
    setUnit('')
    setQtyStr('')
    setScan(null)
    setAsk(null)
  }

  /** Nhận phuy vừa quét: chuyển sang đúng dòng, điền lô và số lượng theo tem */
  const applyScan = (res: DrumOk) => {
    const it = itemById[res.line.itemId]
    const left = res.line.qtyRequired - res.line.qtyPicked
    const u = res.line.unit || unitsOf(it, kind)[0]
    setAsk(null)
    setScan(res)
    setLineId(res.line.id)
    setPalletCode(res.drum.raw)
    setUnit('')
    setQtyStr(fmtQty(toUnit(Math.min(res.drum.qty, res.row.qty, left), u, it)))
  }

  /**
   * Quét Drum ID (kho NVL) — cắt chuỗi tem rồi đối chiếu tồn và phiếu soạn.
   * Kho Bao Bì vẫn quét Pallet ID trần, kiểm tra ở nút Soạn hàng như cũ.
   */
  const onScan = (raw: string) => {
    if (!isNvl || !raw.trim() || !line) return
    const res = checkDrumForPick(raw, {
      line,
      pendingLines: pending,
      inventory,
      today: todayIso(),
    })
    if (!res.ok) {
      setScan(null)
      setPalletCode('')
      return toast(errorText(t, res.error))
    }
    if (res.warnings.length) return setAsk(res)
    applyScan(res)
  }

  const onUnit = (u: string) => {
    const base = fromUnit(Number(qtyStr) || 0, curUnit, item)
    setUnit(u)
    setQtyStr(qtyStr ? fmtQty(toUnit(base, u, item)) : '')
  }

  const submit = () => {
    if (!line || !item) return
    if (!palletCode.trim())
      return toast(isNvl ? t('Quét mã DRUM ID tại vị trí trước khi soạn') : t('Quét mã PALLET ID tại vị trí trước khi soạn'))
    if (isNvl && !scan) return toast(t('Quét lại tem phuy — mã hiện tại chưa được hệ thống chấp nhận'))
    if (!isNvl && palletCode.trim().toUpperCase() !== line.palletId.toUpperCase())
      return toast(t('Pallet không khớp — cần quét {0}', line.palletId))
    const qty = fromUnit(Number(qtyStr) || 0, curUnit, item)
    if (qty <= 0) return toast(t('Nhập số lượng đã soạn ở ô XÁC NHẬN SỐ LƯỢNG'))
    if (qty > remaining)
      return toast(t('Số lượng soạn {0} vượt số còn lại {1} của dòng', fmt(qty), fmt(remaining)))
    if (scan && qty > scan.drum.qty)
      return toast(t('Số lượng soạn {0} vượt {1} ghi trên tem phuy {2}', fmt(qty), fmt(scan.drum.qty), scan.row.palletId))

    // Đổi lô: dòng phiếu chuyển sang phuy vừa quét, phuy cũ nhả về tồn
    const source: PickSource | undefined = scan
      ? {
          palletId: scan.row.palletId,
          lot: scan.row.lot,
          lotNcc: scan.drum.lot,
          mfgDate: scan.row.mfgDate,
          expDate: scan.row.expDate,
        }
      : undefined
    const swapped = Boolean(scan && scan.row.palletId.toUpperCase() !== line.palletId.toUpperCase())
    const oldPallet = line.palletId

    pick(order.id, line.id, qty, source)
    const left = pending.length - (qty >= remaining ? 1 : 0)
    setPalletCode('')
    setQtyStr('')
    setLineId('')
    setUnit('')
    setScan(null)

    if (swapped) toast(t('Đã đổi sang phuy {0} · phuy {1} trả về tồn', scan!.row.palletId, oldPallet))

    if (left <= 0) {
      toast(t('Đã soạn xong phiếu soạn tổng — về Danh sách công việc'))
      nav('/m', { replace: true })
    } else {
      toast(
        qty >= remaining
          ? t('Đã soạn xong dòng này · còn {0} dòng trên phiếu', left)
          : t('Đã soạn {0} · còn thiếu {1}', fmt(qty), fmt(remaining - qty)),
      )
    }
  }

  return (
    <>
      <MobileAppBar
        title={t('Chi tiết soạn hàng')}
        onDoc={() => setDoc(true)}
        onRefresh={() => {
          selectLine('')
          toast(t('Đã làm mới — hiển thị dòng chờ soạn kế tiếp'))
        }}
      />

      <ScreenScroll className="form-fill px-4 py-3">
        {!line ? (
          <div className="py-16 text-center text-[15px] text-muted">{t('Phiếu này đã soạn xong.')}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                label={t('Khu vực')}
                value={line.zone}
                options={zones.map((z) => ({ value: z, label: z }))}
                onChange={(z) => {
                  const first = pending.find((l) => l.zone === z)
                  if (first) selectLine(first.id)
                }}
              />
              <SelectField
                label={t('Vị trí')}
                value={line.id}
                options={pending
                  .filter((l) => l.zone === line.zone)
                  .map((l) => ({
                    value: l.id,
                    label: locationById[l.locationId]?.code ?? '',
                    sub: `${itemById[l.itemId]?.code} · ${t('còn {0}', fmt(l.qtyRequired - l.qtyPicked))}`,
                  }))}
                onChange={selectLine}
              />
            </div>

            <ScanField
              label={isNvl ? t('Drum ID') : t('Pallet ID')}
              required
              value={palletCode}
              onChange={setPalletCode}
              onCommit={onScan}
              options={scanOptions}
            />

            <InputField
              label={t('Mã hàng - Tên hàng')}
              value={item ? `${item.code} - ${item.name}` : ''}
              onChange={() => {}}
              readOnly
            />

            <div className="grid grid-cols-2 gap-2">
              <InputField label={t('Số lô NCC')} value={batch.lotNcc} onChange={() => {}} readOnly />
              <InputField label={t('Số lô')} value={batch.lot} onChange={() => {}} readOnly />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <InputField label={t('Ngày sản xuất')} value={batch.mfgDate} onChange={() => {}} readOnly type="date" calendar />
              <InputField label={t('Hạn sử dụng')} value={batch.expDate} onChange={() => {}} readOnly type="date" calendar />
            </div>

            <UomSegment qty={toUnit(remaining, curUnit, item)} units={units} selected={curUnit} onSelect={onUnit} />

            <InputField
              label={t('Xác nhận số lượng ({0})', curUnit)}
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
          {t('Soạn hàng')}
        </Button>
      </StickyFooter>

      <ConfirmModal
        open={Boolean(ask)}
        message={
          ask
            ? t(
                'Phuy {0}: {1}. Vẫn soạn phuy này?',
                ask.row.palletId,
                ask.warnings.map((w) => warningText(t, w)).join('; '),
              )
            : ''
        }
        onYes={() => ask && applyScan(ask)}
        onNo={() => {
          setAsk(null)
          setPalletCode('')
          setScan(null)
        }}
      />

      <JobDocSheet
        open={doc}
        onClose={() => setDoc(false)}
        title={t('Chi tiết phiếu soạn tổng')}
        meta={[
          { label: t('Số đơn hàng'), value: order.soNumber },
          { label: t('Mã đơn hàng'), value: order.code },
          { label: t('Khách hàng'), value: order.customerName },
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
