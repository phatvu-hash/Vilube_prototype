import { useState } from 'react'
import { AlertTriangle, CloudOff, Loader2, RefreshCw } from 'lucide-react'
import { useApp } from '@/store'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'
import { BottomSheet } from '@/components/mobile/BottomSheet'

const hhmm = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '--:--'
  const p = (x: number) => String(x).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}

/**
 * Trạng thái nguồn dữ liệu, đặt ở màn hình Chọn kho — nơi người dùng nhìn thấy
 * trước khi bước vào thao tác, để biết dữ liệu đã về đủ chưa.
 */
export function DataStatus() {
  const t = useT()
  const load = useApp((s) => s.load)
  const source = useApp((s) => s.source)
  const generatedAt = useApp((s) => s.generatedAt)
  const notice = useApp((s) => s.notice)
  const errors = useApp((s) => s.sheetErrors)
  const asns = useApp((s) => s.asns)
  const pickOrders = useApp((s) => s.pickOrders)
  const loadData = useApp((s) => s.loadData)
  const [open, setOpen] = useState(false)

  const loading = load === 'loading'

  return (
    <>
      <div className="rounded-card border border-line bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-navy" strokeWidth={2.2} />
          ) : source === 'sample' ? (
            <CloudOff className="size-4 shrink-0 text-warning" strokeWidth={2.2} />
          ) : null}
          <span className="min-w-0 flex-1 text-[12px] leading-snug text-label">
            {loading
              ? t('Đang tải dữ liệu đơn hàng…')
              : source === 'sample'
                ? t('Đang dùng dữ liệu mẫu offline')
                : t(
                    'Đã tải {0} đơn nhập · {1} đơn xuất · lúc {2}',
                    asns.length,
                    pickOrders.length,
                    hhmm(generatedAt),
                  )}
          </span>
          <button
            type="button"
            onClick={() => void loadData(true)}
            disabled={loading}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-navy/25 px-2 py-1 text-[12px] font-semibold text-navy active:bg-navy-50 disabled:opacity-50"
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} strokeWidth={2.2} />
            {t('Tải lại')}
          </button>
        </div>

        {notice && !loading && (
          <p className="mt-1.5 text-[11px] leading-snug text-muted">{notice}</p>
        )}

        {errors.length > 0 && !loading && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-2 flex w-full items-center gap-2 rounded-lg bg-warning/10 px-2.5 py-1.5 text-left"
          >
            <AlertTriangle className="size-4 shrink-0 text-warning" strokeWidth={2.2} />
            <span className="min-w-0 flex-1 text-[12px] font-medium text-slate-700">
              {t('Bỏ qua {0} dòng do lỗi', errors.length)}
            </span>
            <span className="shrink-0 text-[11px] font-semibold text-brand">{t('Xem chi tiết')}</span>
          </button>
        )}
      </div>

      <BottomSheet open={open} title={t('Dòng bị bỏ qua')} onClose={() => setOpen(false)}>
        {errors.map((e, i) => (
          <div key={i} className="border-b border-line/70 px-3.5 py-2.5 last:border-0">
            <div className="text-[12px] font-semibold text-brand">
              {t('Tab {0} · dòng {1} · cột {2}', e.sheet, e.row, e.column)}
            </div>
            <div className="text-[14px] text-ink">{e.message}</div>
            {e.value && <div className="text-[12px] text-muted">“{e.value}”</div>}
          </div>
        ))}
      </BottomSheet>
    </>
  )
}
