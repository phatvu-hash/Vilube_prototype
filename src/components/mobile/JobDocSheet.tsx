import type { ReactNode } from 'react'
import { BottomSheet } from '@/components/mobile/BottomSheet'

export interface DocMeta {
  label: string
  value: ReactNode
}

export interface DocLine {
  id: string
  name: string
  sub?: string
  right: ReactNode
  done?: boolean
}

/** Sheet "Chi tiết công việc" — mở từ icon chứng từ trên app bar */
export function JobDocSheet({
  open,
  onClose,
  title,
  meta,
  lines,
}: {
  open: boolean
  onClose: () => void
  title: string
  meta: DocMeta[]
  lines: DocLine[]
}) {
  return (
    <BottomSheet open={open} title={title} onClose={onClose}>
      <div className="mx-2 mb-3 rounded-lg bg-field px-3.5 py-2.5">
        {meta.map((m) => (
          <div key={m.label} className="flex items-baseline justify-between gap-3 py-1">
            <span className="shrink-0 text-[13px] text-label">{m.label}</span>
            <span className="truncate text-[14px] font-semibold text-brand">{m.value || '—'}</span>
          </div>
        ))}
      </div>
      <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-label">
        Danh sách dòng hàng
      </div>
      {lines.map((l) => (
        <div
          key={l.id}
          className="flex items-start justify-between gap-3 border-b border-line/70 px-2 py-2.5 last:border-0"
        >
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold text-ink">{l.name}</div>
            {l.sub && <div className="truncate text-[12px] text-muted">{l.sub}</div>}
          </div>
          <div
            className={
              'shrink-0 text-[14px] font-bold tabular-nums ' + (l.done ? 'text-success' : 'text-brand')
            }
          >
            {l.right}
          </div>
        </div>
      ))}
    </BottomSheet>
  )
}
