import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, type WorkFeature } from '@/store'
import { partnerById } from '@/data/mock'
import { itemById } from '@/data/items'
import { fmtDate } from '@/lib/utils'
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
  const user = useApp((s) => s.user)
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

  // ---- Nhận hàng ----
  const asnList = useMemo(
    () =>
      asns.filter((a) => {
        const ok = done
          ? a.status === 'RECEIVED'
          : mine
            ? a.assignedTo === user.id && a.status !== 'RECEIVED'
            : !a.assignedTo && a.status !== 'RECEIVED'
        if (!ok) return false
        if (!kw) return true
        return [a.code, a.pnk, partnerById[a.supplierId]?.name ?? ''].some((x) => norm(x).includes(kw))
      }),
    [asns, done, mine, user.id, kw],
  )

  // ---- Cất hàng ----
  const putawayList = useMemo(
    () =>
      putaways.filter((t) => {
        const ok = done
          ? t.status === 'DONE'
          : mine
            ? t.assignedTo === user.id && t.status !== 'DONE'
            : !t.assignedTo && t.status !== 'DONE'
        if (!ok) return false
        if (!kw) return true
        return [t.wmsCode, t.asnCode].some((x) => norm(x).includes(kw))
      }),
    [putaways, done, mine, user.id, kw],
  )

  // ---- Soạn hàng theo phiếu soạn tổng ----
  const pickList = useMemo(
    () =>
      pickOrders.filter((o) => {
        const ok = done
          ? o.status === 'PICKED'
          : mine
            ? o.assignedTo === user.id && o.status !== 'PICKED'
            : !o.assignedTo && o.status !== 'PICKED'
        if (!ok) return false
        if (!kw) return true
        return [o.soNumber, o.code, partnerById[o.customerId]?.name ?? ''].some((x) => norm(x).includes(kw))
      }),
    [pickOrders, done, mine, user.id, kw],
  )

  const empty =
    (feature === 'nhan' && asnList.length === 0) ||
    (feature === 'cat' && putawayList.length === 0) ||
    (feature === 'soan' && pickList.length === 0)

  return (
    <>
      <header className="shrink-0 px-4 pb-2 pt-4">
        <h1 className="text-[22px] font-semibold text-slate-600">Danh sách công việc</h1>
      </header>

      <div className="shrink-0 space-y-2 px-4 pb-1">
        <SearchBar
          value={q}
          onChange={setQ}
          onFilter={() => setSheet(true)}
          onScan={() => toast('Bật máy quét — quét mã đơn để lọc nhanh công việc')}
        />
        <FilterTabs tabs={TABS} active={TABS[tabIdx]} onChange={(t) => setTabIdx(TABS.indexOf(t))} />
      </div>

      <ScreenScroll className="space-y-3 px-4 py-3">
        {empty && <div className="py-20 text-center text-[16px] text-muted">Danh sách trống</div>}

        {/* ---------------- NHẬN HÀNG ---------------- */}
        {feature === 'nhan' &&
          asnList.map((a) => {
            const total = a.lines.reduce((s, l) => s + l.qtyExpected, 0)
            const got = a.lines.reduce((s, l) => s + l.qtyReceived, 0)
            return (
              <JobCard
                key={a.id}
                title="NHẬP HÀNG"
                badge={
                  a.status === 'RECEIVED' ? (
                    <StatusBadge tone="done" label="Đã nhận" />
                  ) : a.status === 'PARTIAL' ? (
                    <StatusBadge tone="progress" label="Nhận một phần" />
                  ) : (
                    <StatusBadge tone="new" label="Mới" />
                  )
                }
              >
                <Row
                  label="Nhà cung cấp"
                  value={partnerById[a.supplierId]?.name}
                  rLabel="Ngày giao hàng"
                  rValue={fmtDate(a.deliveryDate)}
                />
                <Row label="Mã đơn" value={a.code} rLabel="Số đơn nhập" rValue={a.pnk} />
                <Row label="Loại đơn nhập" value={a.type} rLabel="Ghi chú" rValue={a.note} />
                {a.status === 'PARTIAL' && (
                  <div className="pt-1 text-[12px] text-label">
                    Đã nhận {Math.round((got / total) * 100)}% khối lượng đơn
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
                  {a.status === 'RECEIVED' ? 'Xem lại' : a.status === 'PARTIAL' ? 'Tiếp tục' : 'Chấp nhận'}
                </Button>
              </JobCard>
            )
          })}

        {/* ---------------- CẤT HÀNG ---------------- */}
        {feature === 'cat' &&
          putawayList.map((t) => {
            const pending = t.pallets.filter((p) => !p.toLocationId).length
            return (
              <JobCard
                key={t.id}
                title="CẤT HÀNG"
                badge={
                  t.status === 'DONE' ? (
                    <StatusBadge tone="done" label="Hoàn thành" />
                  ) : t.status === 'IN_PROGRESS' ? (
                    <StatusBadge tone="progress" label="Đang cất" />
                  ) : (
                    <StatusBadge tone="new" label="Mới" />
                  )
                }
              >
                <Row
                  label="Mã WMS"
                  value={t.wmsCode}
                  rLabel="Ngày nhập hàng"
                  rValue={fmtDate(t.receivedDate)}
                />
                <Row label="Mã đơn" value={t.asnCode} rLabel="Loại đơn" rValue={t.type} />
                <Row label="Pallet chờ cất" value={`${pending} pallet`} rLabel="Tổng pallet" rValue={t.pallets.length} />
                <Button
                  block
                  className="mt-3"
                  onClick={() => {
                    claim('putaway', t.id)
                    nav(`/m/cat/${t.id}`)
                  }}
                >
                  {t.status === 'DONE' ? 'Xem lại' : t.status === 'IN_PROGRESS' ? 'Tiếp tục' : 'Chấp nhận'}
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
                title="ĐƠN HÀNG BÁN"
                badge={
                  o.status === 'PICKED' ? (
                    <StatusBadge tone="done" label="Hoàn thành" />
                  ) : o.status === 'PICKING' ? (
                    <StatusBadge tone="progress" label="Đang soạn" />
                  ) : (
                    <StatusBadge tone="new" label="Mới" />
                  )
                }
              >
                <Row
                  label="Số đơn hàng"
                  value={o.soNumber}
                  rLabel="Ngày giao hàng"
                  rValue={fmtDate(o.deliveryDate)}
                />
                <Row
                  label="Khách hàng"
                  value={partnerById[o.customerId]?.name}
                  rLabel="Mã đơn hàng"
                  rValue={o.code}
                />
                <Row
                  label="Số dòng hàng"
                  value={`${o.lines.length} dòng`}
                  rLabel="Mặt hàng đầu"
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
                  {o.status === 'PICKED' ? 'Xem lại' : o.status === 'PICKING' ? 'Tiếp tục' : 'Chấp nhận'}
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
