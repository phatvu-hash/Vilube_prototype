import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, useWhKind, type WorkFeature } from '@/store'
import { warehouseById } from '@shared/catalog'
import { itemById } from '@shared/items'
import { fmtDate } from '@/lib/utils'
import { useT } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FilterTabs, JobCard, Row, ScreenScroll, SearchBar } from '@/components/mobile/parts'
import { FeatureSheet } from '@/components/mobile/FeatureSheet'
import { toast } from '@/lib/toast'

const FEATURES = [
  { key: 'nhan', label: 'Nhận hàng' },
  { key: 'cat', label: 'Cất hàng' },
  { key: 'soan', label: 'Soạn hàng' },
]

const TABS = ['Chờ nhập', 'Của Tôi', 'Đã hoàn thành']

const norm = (s: string) => s.toLowerCase().trim()

export function WorkList() {
  const nav = useNavigate()
  const t = useT()
  const kind = useWhKind()
  const user = useApp((s) => s.user)
  const whId = useApp((s) => s.warehouseId)
  const asns = useApp((s) => s.asns)
  const putaways = useApp((s) => s.putaways)
  const pickOrders = useApp((s) => s.pickOrders)
  const feature = useApp((s) => s.workFeature)
  const setFeature = useApp((s) => s.setWorkFeature)
  const claim = useApp((s) => s.claim)

  const [tabIdx, setTabIdx] = useState(0)
  const [sheet, setSheet] = useState(false)
  const [q, setQ] = useState('')

  // đổi tính năng → về tab đầu
  const [prev, setPrev] = useState<WorkFeature>(feature)
  if (feature !== prev) {
    setPrev(feature)
    setTabIdx(0)
  }

  const mine = tabIdx === 1
  const done = tabIdx === 2
  const kw = norm(q)

  // Kho NVL quản lý theo phuy, kho Bao Bì theo pallet
  const unitLabel = kind === 'NVL' ? 'Phuy chờ cất' : 'Pallet chờ cất'
  const totalLabel = kind === 'NVL' ? 'Tổng phuy' : 'Tổng pallet'
  const countLabel = kind === 'NVL' ? '{0} phuy' : '{0} pallet'

  // ---- Nhận hàng ----
  const asnList = useMemo(
    () =>
      asns.filter((a) => {
        if (a.whId !== whId) return false
        const ok = done
          ? a.status === 'RECEIVED'
          : mine
            ? a.assignedTo === user.id && a.status !== 'RECEIVED'
            : !a.assignedTo && a.status !== 'RECEIVED'
        if (!ok) return false
        if (!kw) return true
        return [a.code, a.pnk, a.supplierName].some((x) => norm(x).includes(kw))
      }),
    [asns, whId, done, mine, user.id, kw],
  )

  // ---- Cất hàng ----
  const putawayList = useMemo(
    () =>
      putaways.filter((tk) => {
        if (tk.whId !== whId) return false
        const ok = done
          ? tk.status === 'DONE'
          : mine
            ? tk.assignedTo === user.id && tk.status !== 'DONE'
            : !tk.assignedTo && tk.status !== 'DONE'
        if (!ok) return false
        if (!kw) return true
        return [tk.wmsCode, tk.asnCode].some((x) => norm(x).includes(kw))
      }),
    [putaways, whId, done, mine, user.id, kw],
  )

  // ---- Soạn hàng theo phiếu soạn tổng ----
  const pickList = useMemo(
    () =>
      pickOrders.filter((o) => {
        if (o.whId !== whId) return false
        const ok = done
          ? o.status === 'PICKED'
          : mine
            ? o.assignedTo === user.id && o.status !== 'PICKED'
            : !o.assignedTo && o.status !== 'PICKED'
        if (!ok) return false
        if (!kw) return true
        return [o.soNumber, o.code, o.customerName].some((x) => norm(x).includes(kw))
      }),
    [pickOrders, whId, done, mine, user.id, kw],
  )

  const empty =
    (feature === 'nhan' && asnList.length === 0) ||
    (feature === 'cat' && putawayList.length === 0) ||
    (feature === 'soan' && pickList.length === 0)

  return (
    <>
      <header className="shrink-0 px-4 pb-2 pt-4">
        <h1 className="text-[22px] font-semibold text-slate-600">{t('Danh sách công việc')}</h1>
        <button
          type="button"
          onClick={() => nav('/kho')}
          className="mt-0.5 text-[12px] font-semibold text-brand underline-offset-2 active:underline"
        >
          {whId ? t(warehouseById[whId].name) : ''} · {t('Đổi kho')}
        </button>
      </header>

      <div className="shrink-0 space-y-2 px-4 pb-1">
        <SearchBar
          value={q}
          onChange={setQ}
          onFilter={() => setSheet(true)}
          onScan={() => toast(t('Bật máy quét — quét mã đơn để lọc nhanh công việc'))}
        />
        <FilterTabs tabs={TABS} active={TABS[tabIdx]} onChange={(x) => setTabIdx(TABS.indexOf(x))} />
      </div>

      <ScreenScroll className="space-y-3 px-4 py-3">
        {empty && <div className="py-20 text-center text-[16px] text-muted">{t('Danh sách trống')}</div>}

        {/* ---------------- NHẬN HÀNG ---------------- */}
        {feature === 'nhan' &&
          asnList.map((a) => {
            const total = a.lines.reduce((s, l) => s + l.qtyExpected, 0)
            const got = a.lines.reduce((s, l) => s + l.qtyReceived, 0)
            return (
              <JobCard
                key={a.id}
                title={t('NHẬP HÀNG')}
                badge={
                  a.status === 'RECEIVED' ? (
                    <StatusBadge tone="done" label={t('Đã nhận')} />
                  ) : a.status === 'PARTIAL' ? (
                    <StatusBadge tone="progress" label={t('Nhận một phần')} />
                  ) : (
                    <StatusBadge tone="new" label={t('Mới')} />
                  )
                }
              >
                <Row
                  label={t('Nhà cung cấp')}
                  value={a.supplierName}
                  rLabel={t('Ngày giao hàng')}
                  rValue={fmtDate(a.deliveryDate)}
                />
                <Row label={t('Mã đơn')} value={a.code} rLabel={t('Số đơn nhập')} rValue={a.pnk} />
                <Row label={t('Loại đơn nhập')} value={t(a.type)} rLabel={t('Ghi chú')} rValue={a.note} />
                {a.status === 'PARTIAL' && (
                  <div className="pt-1 text-[12px] text-label">
                    {t('Đã nhận {0}% khối lượng đơn', Math.round((got / total) * 100))}
                  </div>
                )}
                <Button
                  block
                  className="mt-3"
                  onClick={() => {
                    claim('asn', a.id)
                    nav(`/m/nhap/${a.id}`)
                  }}
                >
                  {a.status === 'RECEIVED'
                    ? t('Xem lại')
                    : a.status === 'PARTIAL'
                      ? t('Tiếp tục')
                      : t('Chấp nhận')}
                </Button>
              </JobCard>
            )
          })}

        {/* ---------------- CẤT HÀNG ---------------- */}
        {feature === 'cat' &&
          putawayList.map((tk) => {
            const pending = tk.pallets.filter((p) => !p.toLocationId).length
            return (
              <JobCard
                key={tk.id}
                title={t('CẤT HÀNG')}
                badge={
                  tk.status === 'DONE' ? (
                    <StatusBadge tone="done" label={t('Hoàn thành')} />
                  ) : tk.status === 'IN_PROGRESS' ? (
                    <StatusBadge tone="progress" label={t('Đang cất')} />
                  ) : (
                    <StatusBadge tone="new" label={t('Mới')} />
                  )
                }
              >
                <Row
                  label={t('Mã WMS')}
                  value={tk.wmsCode}
                  rLabel={t('Ngày nhập hàng')}
                  rValue={fmtDate(tk.receivedDate)}
                />
                <Row label={t('Mã đơn')} value={tk.asnCode} rLabel={t('Loại đơn')} rValue={t(tk.type)} />
                <Row
                  label={t(unitLabel)}
                  value={t(countLabel, pending)}
                  rLabel={t(totalLabel)}
                  rValue={tk.pallets.length}
                />
                <Button
                  block
                  className="mt-3"
                  onClick={() => {
                    claim('putaway', tk.id)
                    nav(`/m/cat/${tk.id}`)
                  }}
                >
                  {tk.status === 'DONE'
                    ? t('Xem lại')
                    : tk.status === 'IN_PROGRESS'
                      ? t('Tiếp tục')
                      : t('Chấp nhận')}
                </Button>
              </JobCard>
            )
          })}

        {/* ---------------- SOẠN HÀNG ---------------- */}
        {feature === 'soan' &&
          pickList.map((o) => {
            const first = o.lines.find((l) => l.qtyPicked < l.qtyRequired)
            return (
              <JobCard
                key={o.id}
                title={t('ĐƠN HÀNG BÁN')}
                badge={
                  o.status === 'PICKED' ? (
                    <StatusBadge tone="done" label={t('Hoàn thành')} />
                  ) : o.status === 'PICKING' ? (
                    <StatusBadge tone="progress" label={t('Đang soạn')} />
                  ) : (
                    <StatusBadge tone="new" label={t('Mới')} />
                  )
                }
              >
                <Row
                  label={t('Số đơn hàng')}
                  value={o.soNumber}
                  rLabel={t('Ngày giao hàng')}
                  rValue={fmtDate(o.deliveryDate)}
                />
                <Row
                  label={t('Khách hàng')}
                  value={o.customerName}
                  rLabel={t('Mã đơn hàng')}
                  rValue={o.code}
                />
                <Row
                  label={t('Số dòng hàng')}
                  value={t('{0} dòng', o.lines.length)}
                  rLabel={t('Mặt hàng đầu')}
                  rValue={first ? itemById[first.itemId]?.code : '—'}
                />
                <Button
                  block
                  className="mt-3"
                  onClick={() => {
                    claim('pick', o.id)
                    nav(`/m/soan/${o.id}`)
                  }}
                >
                  {o.status === 'PICKED'
                    ? t('Xem lại')
                    : o.status === 'PICKING'
                      ? t('Tiếp tục')
                      : t('Chấp nhận')}
                </Button>
              </JobCard>
            )
          })}
      </ScreenScroll>

      <FeatureSheet
        open={sheet}
        value={feature}
        options={FEATURES}
        onChange={(k) => setFeature(k as WorkFeature)}
        onClose={() => setSheet(false)}
      />
    </>
  )
}
