import type { ReactNode } from 'react'
import { ScanLine, Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n'

/** Vùng cuộn chính của 1 màn mobile */
export function ScreenScroll({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('no-scrollbar flex-1 overflow-y-auto', className)}>{children}</div>
}

/** Footer dính đáy chứa nút hành động chính */
export function StickyFooter({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 border-t border-line bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {children}
    </div>
  )
}

/** Ô TÌM KIẾM + icon quét + nút bộ lọc (HDSD bước 2 & 4) */
export function SearchBar({
  value,
  onChange,
  placeholder = 'TÌM KIẾM',
  onFilter,
  onScan,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  onFilter?: () => void
  onScan?: () => void
}) {
  const t = useT()
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-lg bg-field px-3 py-2.5">
        <Search className="size-4 text-muted" strokeWidth={2} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t(placeholder)}
          className="min-w-0 flex-1 bg-transparent text-[13px] font-medium uppercase tracking-wide text-ink placeholder:text-muted focus:outline-none"
        />
        <button type="button" onClick={onScan} aria-label={t('Quét mã')}>
          <ScanLine className="size-5 text-navy" strokeWidth={1.75} />
        </button>
      </div>
      {onFilter && (
        <button
          type="button"
          onClick={onFilter}
          aria-label={t('Bộ lọc tính năng')}
          className="grid size-11 shrink-0 place-items-center rounded-lg bg-field text-navy active:bg-navy-50"
        >
          <SlidersHorizontal className="size-5" strokeWidth={1.75} />
        </button>
      )}
    </div>
  )
}

/** Tab gạch chân: Chờ nhập / Của Tôi / Đã hoàn thành */
export function FilterTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[]
  active: string
  onChange: (t: string) => void
}) {
  const t = useT()
  return (
    <div className="flex items-center gap-5 border-b border-line">
      {tabs.map((tab) => {
        const on = tab === active
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={cn(
              'relative -mb-px py-2.5 text-[15px] transition',
              on ? 'font-semibold text-navy' : 'font-medium text-muted',
            )}
          >
            {t(tab)}
            {on && <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-navy" />}
          </button>
        )
      })}
    </div>
  )
}

/** Hàng label–value 2 cột trong thẻ công việc */
export function Row({
  label,
  value,
  rLabel,
  rValue,
}: {
  label: string
  value: ReactNode
  rLabel?: string
  rValue?: ReactNode
}) {
  return (
    <div className="grid grid-cols-2 gap-2 py-1.5">
      <div className="min-w-0">
        <div className="text-[13px] text-label">{label}</div>
        <div className="truncate text-[15px] font-semibold text-brand">{value || '—'}</div>
      </div>
      {rLabel !== undefined && (
        <div className="min-w-0 text-right">
          <div className="text-[13px] text-label">{rLabel}</div>
          <div className="truncate text-[15px] font-semibold text-brand">{rValue || '—'}</div>
        </div>
      )}
    </div>
  )
}

/** Thẻ công việc trắng, bo góc — dùng chung cho 3 loại công việc */
export function JobCard({ title, badge, children }: { title: string; badge: ReactNode; children: ReactNode }) {
  return (
    <article className="rounded-card border border-line bg-white p-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold tracking-wide text-slate-800">{title}</h3>
        {badge}
      </div>
      <div className="my-2 border-t border-line" />
      {children}
    </article>
  )
}
