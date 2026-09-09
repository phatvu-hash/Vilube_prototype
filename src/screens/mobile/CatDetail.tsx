import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronsRight } from 'lucide-react'
import { useApp, nextSuggestion } from '@/store'
import { itemById } from '@/data/items'
import { locationById, storageLocations } from '@/data/mock'
import { toast } from '@/lib/toast'
import { fmt } from '@/lib/utils'
import { toUnit, unitsOf } from '@/lib/uom'
import { MobileAppBar } from '@/components/mobile/MobileAppBar'
import { ScanField } from '@/components/ui/ScanField'
import { InputField } from '@/components/ui/InputField'
import { UomSegment } from '@/components/ui/UomSegment'
import { Button } from '@/components/ui/Button'
import { ScreenScroll, StickyFooter } from '@/components/mobile/parts'
import { JobDocSheet } from '@/components/mobile/JobDocSheet'

export function CatDetail() {
  const nav = useNavigate()
  const { taskId } = useParams()
  const task = useApp((s) => s.putaways.find((t) => t.id === taskId))
  const putaway = useApp((s) => s.putaway)

  const [palletCode, setPalletCode] = useState('')
  const [toLoc, setToLoc] = useState('')
  const [suggestId, setSuggestId] = useState('')
  const [unit, setUnit] = useState('')
  const [doc, setDoc] = useState(false)

  const pending = task?.pallets.filter((p) => !p.toLocationId) ?? []
  const pallet = pending.find((p) => p.palletId === palletCode)
  const item = pallet ? itemById[pallet.itemId] : undefined
  const units = unitsOf(item)
  // mặc định hiển thị theo đơn vị cơ sở (CÁI/KG) như mockup HDSD
  const curUnit = unit || units[0]

  // quét pallet → lấy vị trí đề xuất của pallet đó
  useEffect(() => {
    if (pallet) setSuggestId(pallet.suggestedLocationId)
  }, [pallet])

  if (!task) return <MobileAppBar title="Không tìm thấy công việc" />

  const suggested = locationById[suggestId] ?? storageLocations[0]

  const confirm = () => {
    if (!pallet) return toast('Quét mã PALLETID trước')
    const code = toLoc.trim().toUpperCase()
    if (!code) return toast('Quét mã vị trí ở ô ĐẾN VỊ TRÍ')
    const loc = storageLocations.find((l) => l.code.toUpperCase() === code)
    if (!loc) return toast(`Không tồn tại vị trí "${code}"`)

    putaway(task.id, pallet.id, loc.id)
    const left = pending.length - 1
    setPalletCode('')
    setToLoc('')
    setUnit('')
    setSuggestId('')

    if (left <= 0) {
      toast(`Đã cất pallet ${pallet.palletId} vào ${loc.code} — hoàn tất công việc`)
      nav('/m', { replace: true })
    } else {
      toast(`Đã cất ${pallet.palletId} vào ${loc.code} · còn ${left} pallet chờ cất`)
    }
  }

  return (
    <>
      <MobileAppBar title="Cất hàng" onDoc={() => setDoc(true)} />

      <ScreenScroll className="space-y-2 px-4 py-3">
        {pending.length === 0 ? (
          <div className="py-16 text-center text-[15px] text-muted">Công việc này đã cất xong.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <ScanField
                label="PalletID"
                required
                value={palletCode}
                onChange={setPalletCode}
                options={pending.map((p) => ({
                  value: p.palletId,
                  label: p.palletId,
                  sub: `${itemById[p.itemId]?.code} · ${fmt(p.qty)} ${unitsOf(itemById[p.itemId])[0]}`,
                }))}
              />
              <InputField label="Mã hàng" value={item?.code ?? ''} onChange={() => {}} readOnly scan />
            </div>

            <InputField
              label="SKU - Tên hàng"
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
              <InputField label="Số lô" value={pallet?.lot ?? ''} onChange={() => {}} readOnly />
              <InputField label="Số lô nội bộ" value={pallet?.lotInternal ?? ''} onChange={() => {}} readOnly />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <InputField label="Ngày sản xuất" value={pallet?.mfgDate ?? ''} onChange={() => {}} readOnly type="date" calendar />
              <InputField label="Hạn sử dụng" value={pallet?.expDate ?? ''} onChange={() => {}} readOnly type="date" calendar />
            </div>

            {/* Vị trí đề xuất — bấm mũi tên kép để lấy vị trí khác (HDSD bước 9) */}
            <div>
              <div className="text-[13px] text-slate-500">Vị trí đề xuất</div>
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
                  aria-label="Lấy vị trí khác"
                  onClick={() => setSuggestId(nextSuggestion(suggested.id))}
                  className="grid size-10 place-items-center rounded-lg text-brand active:bg-navy-50"
                >
                  <ChevronsRight className="size-7" strokeWidth={2.5} />
                </button>
              </div>
              <div className="text-[11px] text-muted">Khu vực {suggested.zone} · chạm vào mã để điền nhanh</div>
            </div>

            <ScanField
              label="Đến vị trí"
              required
              value={toLoc}
              onChange={setToLoc}
              options={storageLocations.map((l) => ({
                value: l.code,
                label: l.code,
                sub: `Khu vực ${l.zone}`,
              }))}
              sheetTitle="Quét mã vị trí"
            />
          </>
        )}
      </ScreenScroll>

      <StickyFooter>
        <Button block disabled={pending.length === 0} onClick={confirm}>
          XÁC NHẬN
        </Button>
      </StickyFooter>

      <JobDocSheet
        open={doc}
        onClose={() => setDoc(false)}
        title="Chi tiết công việc cất hàng"
        meta={[
          { label: 'Mã WMS', value: task.wmsCode },
          { label: 'Mã đơn', value: task.asnCode },
          { label: 'Loại đơn', value: task.type },
        ]}
        lines={task.pallets.map((p) => ({
          id: p.id,
          name: `${p.palletId} · ${itemById[p.itemId]?.code}`,
          sub: itemById[p.itemId]?.name,
          right: p.toLocationId ? locationById[p.toLocationId]?.code : 'Chờ cất',
          done: Boolean(p.toLocationId),
        }))}
      />
    </>
  )
}
