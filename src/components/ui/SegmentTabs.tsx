import { cn } from '@/lib/utils'

/** 2 thẻ lớn: THẺ NHÃN | THẺ KHÁC NHÃN (màn Chi tiết nhập hàng) */
export function SegmentTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string }[]
  active: string
  onChange: (k: string) => void
}) {
  return (
    <div className="flex overflow-hidden rounded-lg border-2 border-navy">
      {tabs.map((t, i) => {
        const on = t.key === active
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={cn(
              'flex-1 px-3 py-3 text-center text-[14px] font-bold uppercase tracking-wide transition',
              i > 0 && 'border-l-2 border-navy',
              on ? 'bg-navy text-white' : 'bg-white text-brand',
            )}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
