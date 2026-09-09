import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronsRight } from 'lucide-react'
import { useApp, useWhKind, nextSuggestion } from '@/store'
import { itemByCode, itemById } from '@shared/items'
import { locationById, storageLocationsOf } from '@shared/catalog'
import { toast } from '@/lib/toast'
import { fmt } from '@/lib/utils'
import { toUnit, unitsOf } from '@shared/uom'
import { useT } from '@/i18n'
import { MobileAppBar } from '@/components/mobile/MobileAppBar'
import { ScanField } from '@/components/ui/ScanField'
import { InputField } from '@/components/ui/InputField'
import { UomSegment } from '@/components/ui/UomSegment'
import { Button } from '@/components/ui/Button'
import { ScreenScroll, StickyFooter } from '@/components/mobile/parts'
import { JobDocSheet } from '@/components/mobile/JobDocSheet'

export function CatDetail() {
  const nav = useNavigate()
  const t = useT()
  const kind = useWhKind()
  const { taskId } = useParams()
  const task = useApp((s) => s.putaways.find((x) => x.id === taskId))
  const putaway = useApp((s) => s.putaway)

  const isNvl = kind === 'NVL'
  const [itemCode, setItemCode] = useState('') // kho NVL quét mã hàng trước (HDSD bước 7)
  const [palletCode, setPalletCode] = useState('')
  const [toLoc, setToLoc] = useState('')
  const [suggestId, setSuggestId] = useState('')
  const [unit, setUnit] = useState('')
  const [doc, setDoc] = useState(false)

  const pending = task?.pallets.filter((p) => !p.toLocationId) ?? []
  const pallet = pending.find((p) => p.palletId === palletCode)
  const item = pallet ? itemById[pallet.itemId] : undefined
  const units = unitsOf(item, kind)
  // mặc định hiển thị theo đơn vị cơ sở (CÁI/KG) như mockup HDSD
  const curUnit = unit || units[0]

  // quét pallet/phuy → lấy vị trí đề xuất tương ứng
  useEffect(() => {
    if (pallet) setSuggestId(pallet.suggestedLocationId)
  }, [pallet])

  if (!task) return <MobileAppBar title={t('Không tìm thấy công việc')} />

  const storage = storageLocationsOf(task.whId)
  const suggested = locationById[suggestId] ?? storage[0]
  // Kho NVL lọc theo mã hàng đã quét trước, đúng thứ tự thao tác trong HDSD
  const scanList = isNvl && itemCode ? pending.filter((p) => itemById[p.itemId]?.code === itemCode) : pending

  const confirm = () => {
    if (!pallet) return toast(isNvl ? t('Quét mã DRUMID trước') : t('Quét mã PALLETID trước'))
    const code = toLoc.trim().toUpperCase()
    if (!code) return toast(t('Quét mã vị trí ở ô ĐẾN VỊ TRÍ'))
    const loc = storage.find((l) => l.code.toUpperCase() === code)
    if (!loc) return toast(t('Không tồn tại vị trí "{0}"', code))

    putaway(task.id, pallet.id, loc.id)
    const left = pending.length - 1
    setPalletCode('')
    setItemCode('')
    setToLoc('')
    setUnit('')
    setSuggestId('')

    if (left <= 0) {
      toast(t('Đã cất {0} vào {1} — hoàn tất công việc', pallet.palletId, loc.code))
      nav('/m', { replace: true })
    } else {
      toast(
        t(
          'Đã cất {0} vào {1} · còn {2} chờ cất',
          pallet.palletId,
          loc.code,
          t(isNvl ? '{0} phuy' : '{0} pallet', left),
        ),
      )
    }
  }

  return (
    <>
      <MobileAppBar title={t('Cất hàng')} onDoc={() => setDoc(true)} />

      <ScreenScroll className="form-fill px-4 py-3">
        {pending.length === 0 ? (
          <div className="py-16 text-center text-[15px] text-muted">{t('Công việc này đã cất xong.')}</div>
        ) : (
          <>
            {isNvl ? (
              // Kho NVL: quét MÃ HÀNG trước, rồi mới quét DRUMID
              <>
                <ScanField
                  label={t('Mã hàng')}
                  required
                  value={itemCode}
                  onChange={(v) => {
                    setItemCode(v)
                    setPalletCode('')
                  }}
                  options={[...new Set(pending.map((p) => itemById[p.itemId]?.code ?? ''))].map((c) => ({
                    value: c,
                    label: c,
                    sub: itemByCode[c]?.name,
                  }))}
                />
                <ScanField
                  label={t('DrumID')}
                  required
                  value={palletCode}
                  onChange={setPalletCode}
                  options={scanList.map((p) => ({
                    value: p.palletId,
                    label: p.palletId,
                    sub: `${itemById[p.itemId]?.code} · ${fmt(p.qty)} ${unitsOf(itemById[p.itemId])[0]}`,
                  }))}
                />
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <ScanField
                  label={t('PalletID')}
                  required
                  value={palletCode}
                  onChange={setPalletCode}
                  options={pending.map((p) => ({
                    value: p.palletId,
                    label: p.palletId,
                    sub: `${itemById[p.itemId]?.code} · ${fmt(p.qty)} ${unitsOf(itemById[p.itemId])[0]}`,
                  }))}
                />
                <InputField label={t('Mã hàng')} value={item?.code ?? ''} onChange={() => {}} readOnly scan />
              </div>
            )}

            <InputField
              label={t('SKU - Tên hàng')}
              value={item ? `${item.code} - ${item.name}` : ''}
              onChange={() => {}}
              readOnly
              emphasis
            />

            <UomSegment
              qty={pallet ? toUnit(pallet.qty, curUnit, item) : 0}
              units={units}
              selected={curUnit}
              onSelect={setUnit}
            />

            <div className="grid grid-cols-2 gap-2">
              <InputField label={t('Số lô')} value={pallet?.lot ?? ''} onChange={() => {}} readOnly />
              <InputField
                label={t('Số lô nội bộ')}
                value={pallet?.lotInternal ?? ''}
                onChange={() => {}}
                readOnly
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <InputField label={t('Ngày sản xuất')} value={pallet?.mfgDate ?? ''} onChange={() => {}} readOnly type="date" calendar />
              <InputField label={t('Hạn sử dụng')} value={pallet?.expDate ?? ''} onChange={() => {}} readOnly type="date" calendar />
            </div>

            {/* Vị trí đề xuất — bấm mũi tên kép để lấy vị trí khác (HDSD) */}
            <div>
              <div className="text-[13px] text-slate-500">{t('Vị trí đề xuất')}</div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setToLoc(suggested.code)}
                  className="text-[40px] font-bold leading-tight tracking-tight text-navy"
                >
                  {suggested.code}
                </button>
                <button
                  type="button"
                  aria-label={t('Lấy vị trí khác')}
                  onClick={() => setSuggestId(nextSuggestion(task.whId, suggested.id))}
                  className="grid size-10 place-items-center rounded-lg text-brand active:bg-navy-50"
                >
                  <ChevronsRight className="size-7" strokeWidth={2.5} />
                </button>
              </div>
              <div className="text-[11px] text-muted">
                {t('Khu vực {0} · chạm vào mã để điền nhanh', suggested.zone)}
              </div>
            </div>

            <ScanField
              label={t('Đến vị trí')}
              required
              value={toLoc}
              onChange={setToLoc}
              options={storage.map((l) => ({
                value: l.code,
                label: l.code,
                sub: t('Khu vực {0}', l.zone),
              }))}
              sheetTitle={t('Quét mã vị trí')}
            />
          </>
        )}
      </ScreenScroll>

      <StickyFooter>
        <Button block disabled={pending.length === 0} onClick={confirm}>
          {t('XÁC NHẬN')}
        </Button>
      </StickyFooter>

      <JobDocSheet
        open={doc}
        onClose={() => setDoc(false)}
        title={t('Chi tiết công việc cất hàng')}
        meta={[
          { label: t('Mã WMS'), value: task.wmsCode },
          { label: t('Mã đơn'), value: task.asnCode },
          { label: t('Loại đơn'), value: t(task.type) },
        ]}
        lines={task.pallets.map((p) => ({
          id: p.id,
          name: `${p.palletId} · ${itemById[p.itemId]?.code}`,
          sub: itemById[p.itemId]?.name,
          right: p.toLocationId ? locationById[p.toLocationId]?.code : t('Chờ cất'),
          done: Boolean(p.toLocationId),
        }))}
      />
    </>
  )
}
