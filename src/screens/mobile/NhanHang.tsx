import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useApp, useWhKind } from '@/store'
import { itemsOf, itemById } from '@shared/items'
import { inboundTypes, mkLotInternal } from '@shared/catalog'
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

/** PHẦN 3 — Nhập hàng chủ động (Khác → Nhập hàng) */
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
  const [received, setReceived] = useState(0) // số lần đã bấm NHẬN HÀNG trên màn này
  const [askPrint, setAskPrint] = useState(false)

  const catalog = useMemo(() => itemsOf(kind), [kind])
  const item = itemById[itemId]
  const units = unitsOf(item, kind)
  const curUnit = unit || units[0]

  const itemOptions = useMemo(
    () => catalog.map((x) => ({ value: x.id, label: `${x.code} - ${x.name}`, sub: x.packingCode })),
    [catalog],
  )
  const scanItemOptions = useMemo(
    () => catalog.map((x) => ({ value: x.code, label: x.code, sub: x.name })),
    [catalog],
  )
  const palletOptions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const code = isNvl ? `DRM${String(i + 1).padStart(6, '0')}` : `PLT${String(i + 1).padStart(6, '0')}`
        return { value: code, label: code, sub: isNvl ? 'Tem phuy' : 'Tem pallet' }
      }),
    [isNvl],
  )

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
  }

  const submit = () => {
    if (!item) return toast(t('Chọn mặt hàng ở ô SKU - Tên hàng'))
    if (!palletId.trim()) return toast(isNvl ? t('Quét mã DRUM ID') : t('Quét mã PALLET ID'))
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
        />

        <div className="grid grid-cols-2 gap-2">
          <ScanField
            label={isNvl ? t('Drum ID') : t('Pallet ID')}
            required
            value={palletId}
            onChange={setPalletId}
            options={palletOptions.map((o) => ({ ...o, sub: t(o.sub) }))}
          />
          <SelectField
            label={t('Số lô')}
            value={lot}
            options={(isNvl
              ? ['2711050000', '2711050001', '2711050010']
              : ['2613030000', '2613030001', '2613030002']
            ).map((x) => ({ value: x, label: x }))}
            onChange={setLot}
          />
        </div>

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
