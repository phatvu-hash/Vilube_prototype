import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, RefreshCw } from 'lucide-react'
import { useApp, usedPackageIds, useWhKind } from '@/store'
import { itemsOf, itemByCode, itemById } from '@shared/items'
import { inboundTypes, mkLotInternal } from '@shared/catalog'
import { buildDrumBarcode, genPackageId, parseDrumBarcode } from '@shared/barcode'
import { toast } from '@/lib/toast'
import { addDays, fmt, todayIso } from '@/lib/utils'
import { baseUnit, fmtQty, fromUnit, toUnit, unitsOf } from '@shared/uom'
import { useT } from '@/i18n'
import { MobileAppBar } from '@/components/mobile/MobileAppBar'
import { ScanField } from '@/components/ui/ScanField'
import { InputField } from '@/components/ui/InputField'
import { SelectField } from '@/components/ui/SelectField'
import { UomSegment } from '@/components/ui/UomSegment'
import { Button } from '@/components/ui/Button'
import { ScreenScroll, StickyFooter } from '@/components/mobile/parts'
import { ConfirmModal } from '@/components/mobile/ConfirmModal'

/** Số lô mẫu để chọn nhanh khi hàng chưa có tem */
const LOTS_NVL = ['2711050000', '2711050001', '2711050010']
const LOTS_BB = ['2613030000', '2613030001', '2613030002']

/**
 * PHẦN 3 — Nhập hàng chủ động (Khác → Nhập hàng)
 *
 * Hai trường hợp, người dùng chọn theo việc kiện hàng đã có tem hay chưa:
 *
 *  1. ĐÃ CÓ mã kiện — quét thẳng tem phuy (kho NVL). Hệ thống cắt chuỗi tem để
 *     điền sẵn mã hàng, số lô và số lượng; người dùng chỉ sửa lại số lượng cho
 *     khớp tồn thực tế (phuy có thể đã vơi) rồi bấm NHẬN HÀNG.
 *  2. CHƯA CÓ mã kiện — chọn mặt hàng trước, bấm nút ⟳ để sinh mã mới, nhập
 *     tiếp số lô / NSX / HSD / số lượng rồi bấm NHẬN HÀNG.
 */
export function NhanHang() {
  const nav = useNavigate()
  const t = useT()
  const kind = useWhKind()
  const receiveDirect = useApp((s) => s.receiveDirect)

  const isNvl = kind === 'NVL'
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
  /** Số lượng in trên tem — giữ lại để đối chiếu khi người dùng sửa số thực tế */
  const [tagQty, setTagQty] = useState<number | null>(null)
  const [received, setReceived] = useState(0) // số lần đã bấm NHẬN HÀNG trên màn này
  const [askPrint, setAskPrint] = useState(false)

  const catalog = useMemo(() => itemsOf(kind), [kind])
  const item = itemById[itemId]
  const units = unitsOf(item, kind)
  const curUnit = unit || units[0]
  const fromTag = tagQty !== null // dữ liệu đang lấy từ tem quét được
  const pkgLabel = isNvl ? t('Drum ID') : t('Pallet ID')

  const itemOptions = useMemo(
    () => catalog.map((x) => ({ value: x.id, label: `${x.code} - ${x.name}`, sub: x.packingCode })),
    [catalog],
  )
  const scanItemOptions = useMemo(
    () => catalog.map((x) => ({ value: x.code, label: x.code, sub: x.name })),
    [catalog],
  )
  /** Số lô trên tem có thể ngoài danh sách mẫu — thêm vào để hiển thị đúng */
  const lotOptions = useMemo(() => {
    const base = isNvl ? LOTS_NVL : LOTS_BB
    const all = lot && !base.includes(lot) ? [lot, ...base] : base
    return all.map((x) => ({ value: x, label: x }))
  }, [isNvl, lot])

  /**
   * Danh sách mã "quét" được của ô mã kiện — mô phỏng máy quét của handheld.
   * Kho NVL bắn ra trọn tem phuy bốn phần để chạy đúng luồng cắt chuỗi;
   * kho Bao Bì chỉ có mã pallet trần.
   */
  const scanPkgOptions = useMemo(() => {
    if (!isNvl)
      return Array.from({ length: 6 }, (_, i) => ({
        value: `PLT${String(i + 1).padStart(6, '0')}`,
        label: `PLT${String(i + 1).padStart(6, '0')}`,
        sub: t('Tem pallet'),
      }))
    return catalog.slice(0, 6).map((x, i) => {
      const drumId = `DRM${String(700001 + i)}`
      const lotNcc = `27110${String(50000 + i)}`
      const raw = buildDrumBarcode(x.code, lotNcc, x.kgPerCarton, drumId)
      return { value: raw, label: drumId, sub: `${x.code} · ${fmt(x.kgPerCarton)} KG · ${t('Số lô')} ${lotNcc}` }
    })
  }, [catalog, isNvl, t])

  /** Quét mã hàng → chọn luôn mặt hàng tương ứng */
  const onScanItem = (code: string) => {
    setItemCode(code)
    const found = catalog.find((x) => x.code === code)
    if (found) onPickItem(found.id)
  }

  const onPickItem = (id: string) => {
    setItemId(id)
    const it = itemById[id]
    setItemCode(it?.code ?? '')
    setUnit(baseUnit(it))
    setQtyStr('')
    setTagQty(null)
  }

  /** Mã kiện đã nằm đâu đó trong hệ thống thì cảnh báo — dễ là quét nhầm phuy cũ */
  const warnIfUsed = (code: string) => {
    const dup = usedPackageIds().some((x) => x.toUpperCase() === code.toUpperCase())
    if (dup) toast(t('{0} {1} đã có trong hệ thống — kiểm tra lại trước khi nhận', pkgLabel, code))
    return dup
  }

  /**
   * TRƯỜNG HỢP 1 — quét mã kiện đã có sẵn.
   * Tem phuy gồm bốn phần "mã hàng / số lô / số lượng / mã phuy" (shared/barcode.ts):
   * cắt chuỗi ra rồi điền sẵn mặt hàng, số lô, số lượng.
   */
  const onScanPackage = (raw: string) => {
    const v = raw.trim().toUpperCase()
    if (!v) return

    const bc = isNvl ? parseDrumBarcode(v) : null
    if (!bc) {
      // Không phải tem đầy đủ → coi như mã kiện trần, người dùng tự nhập phần còn lại
      setPalletId(v)
      setTagQty(null)
      warnIfUsed(v)
      return
    }

    const it = itemByCode[bc.itemCode]
    if (!it || it.wh !== kind) {
      setPalletId(v)
      setTagQty(null)
      return toast(t('Mã hàng {0} trên tem không có trong danh mục kho này', bc.itemCode))
    }

    setItemId(it.id)
    setItemCode(it.code)
    setUnit(baseUnit(it))
    setLot(bc.lot)
    setQtyStr(fmtQty(bc.qty))
    setTagQty(bc.qty)
    setPalletId(bc.drumId)

    if (!warnIfUsed(bc.drumId))
      toast(t('Đã đọc tem {0} · {1} · {2} {3} — sửa số lượng nếu tồn thực tế khác', bc.drumId, it.code, fmt(bc.qty), baseUnit(it)))
  }

  /**
   * TRƯỜNG HỢP 2 — hàng chưa có tem: sinh mã kiện mới.
   * Quy tắc: tiền tố kho (DRM / PLT) + số thứ tự 6 chữ số, nối tiếp mã lớn nhất
   * đang có trong hệ thống.
   */
  const genPkgId = () => {
    if (!item) return toast(t('Chọn mặt hàng ở ô SKU - Tên hàng trước khi sinh mã'))
    const id = genPackageId(isNvl ? 'DRM' : 'PLT', usedPackageIds())
    setPalletId(id)
    setTagQty(null)
    toast(t('Đã sinh {0} {1}', pkgLabel, id))
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

  const resetLine = () => {
    setItemCode('')
    setItemId('')
    setPalletId('')
    setLot('')
    setMfg('')
    setExp('')
    setLotInternal('')
    setUnit('')
    setQtyStr('')
    setTagQty(null)
  }

  const submit = () => {
    if (!item) return toast(t('Chọn mặt hàng ở ô SKU - Tên hàng'))
    if (!palletId.trim())
      return toast(isNvl ? t('Quét tem phuy hoặc bấm nút sinh mã DRUM ID') : t('Quét tem pallet hoặc bấm nút sinh mã PALLET ID'))
    if (!lot.trim()) return toast(t('Nhập hoặc chọn số lô'))
    const qty = fromUnit(Number(qtyStr) || 0, curUnit, item)
    if (qty <= 0) return toast(t('Nhập số lượng xác nhận'))

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

    toast(
      isNvl
        ? t('Đã nhận {0} {1} · phuy {2} đã chuyển sang công việc Cất hàng', fmt(qty), baseUnit(item), palletId)
        : t('Đã nhận {0} {1} · pallet {2} đã chuyển sang công việc Cất hàng', fmt(qty), baseUnit(item), palletId),
    )
    setReceived((n) => n + 1)
    resetLine()
  }

  /** Bấm nút tích góc phải trên — hoàn tất đơn, hỏi in barcode (HDSD bước 13–15) */
  const finish = () => {
    if (received === 0) return toast(t('Nhập số lượng xác nhận'))
    setAskPrint(true)
  }

  const bigQty = Number(qtyStr) || 0
  const qtyBase = fromUnit(bigQty, curUnit, item)
  const tagDiff = fromTag && tagQty !== null ? qtyBase - tagQty : 0

  return (
    <>
      <MobileAppBar
        title={t('Nhận hàng')}
        right={
          <button
            type="button"
            onClick={finish}
            aria-label={t('Hoàn tất đơn')}
            className="grid size-9 place-items-center rounded-full text-navy active:bg-navy-50"
          >
            <Check className="size-6" strokeWidth={2.4} />
          </button>
        }
      />

      <ScreenScroll className="form-fill px-4 py-3">
        <SelectField
          label={t('Loại đơn hàng nhập')}
          required
          value={orderType}
          options={inboundTypes.map((x) => ({ value: x, label: t(x) }))}
          onChange={setOrderType}
          emphasis
        />

        <div className="grid grid-cols-2 gap-2">
          <InputField label={t('Postingdate')} value={postingDate} onChange={setPostingDate} type="date" calendar />
          <ScanField
            label={t('Mã hàng')}
            value={itemCode}
            onChange={onScanItem}
            options={scanItemOptions}
            sheetTitle={t('Quét {0}', t('Mã hàng').toLowerCase())}
          />
        </div>

        <SelectField
          label={t('SKU - Tên hàng')}
          required
          value={itemId}
          options={itemOptions}
          onChange={onPickItem}
          emphasis
          disabled={fromTag}
        />

        {/* Ô mã kiện: quét tem có sẵn (TH1) hoặc bấm ⟳ sinh mã mới (TH2) */}
        <div className="flex items-stretch gap-2">
          <ScanField
            className="flex-1"
            label={pkgLabel}
            required
            value={palletId}
            onChange={setPalletId}
            onCommit={onScanPackage}
            options={scanPkgOptions}
            sheetTitle={isNvl ? t('Quét tem phuy') : t('Quét {0}', pkgLabel.toLowerCase())}
          />
          <button
            type="button"
            onClick={genPkgId}
            aria-label={t('Sinh {0} mới', pkgLabel)}
            className="grid w-12 shrink-0 place-items-center rounded-lg bg-navy text-white active:bg-navy-900 disabled:opacity-40"
            disabled={fromTag}
          >
            <RefreshCw className="size-5" strokeWidth={2} />
          </button>
        </div>

        <p className="-mt-1 px-1 text-[12px] text-muted">
          {fromTag
            ? t('Thông tin lấy từ tem — chỉ sửa số lượng cho khớp tồn thực tế.')
            : t('Đã có tem thì quét thẳng; chưa có tem thì chọn SKU rồi bấm ⟳ để sinh mã.')}
        </p>

        <SelectField
          label={t('Số lô')}
          value={lot}
          options={lotOptions}
          onChange={setLot}
          disabled={fromTag}
        />

        <div className="grid grid-cols-2 gap-2">
          <InputField label={t('Ngày sản xuất')} value={mfg} onChange={onMfg} type="date" calendar />
          <InputField label={t('Hạn sử dụng')} value={exp} onChange={setExp} type="date" calendar />
        </div>

        <InputField label={t('Số lô nội bộ')} value={lotInternal} onChange={setLotInternal} />

        <UomSegment qty={bigQty} units={units} selected={curUnit} onSelect={onUnit} />

        <InputField
          label={t('Số lượng xác nhận ({0})', curUnit)}
          required
          value={qtyStr}
          onChange={setQtyStr}
          type="number"
          scan
        />

        {fromTag && tagQty !== null && (
          <p className="-mt-1 px-1 text-[12px] text-muted">
            {tagDiff === 0
              ? t('Khớp số lượng in trên tem ({0} {1})', fmt(tagQty), baseUnit(item))
              : t('Tem ghi {0} {1} · lệch {2} {3}', fmt(tagQty), baseUnit(item), (tagDiff > 0 ? '+' : '') + fmt(tagDiff), baseUnit(item))}
          </p>
        )}
      </ScreenScroll>

      <StickyFooter>
        <Button block onClick={submit}>
          {t('NHẬN HÀNG')}
        </Button>
      </StickyFooter>

      <ConfirmModal
        open={askPrint}
        message={t('Bạn có muốn in barcode không?')}
        onYes={() => {
          setAskPrint(false)
          toast(t('Đã gửi lệnh in barcode'))
          nav('/m', { replace: true })
        }}
        onNo={() => {
          setAskPrint(false)
          toast(t('Bỏ qua in barcode'))
          nav('/m', { replace: true })
        }}
      />
    </>
  )
}
