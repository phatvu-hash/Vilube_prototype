import { useState } from 'react'
import { AlertTriangle, CloudOff, Database, Loader2, RefreshCw } from 'lucide-react'
import { useApp } from '@/store'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'
import { BottomSheet } from '@/components/mobile/BottomSheet'
import { Button } from '@/components/ui/Button'

const hhmm = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '--:--'
  const p = (x: number) => String(x).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}

/**
 * Chip trạng thái dữ liệu nằm trên thanh trên cùng, cạnh đồng hồ — như một
 * thông báo hệ thống. Chạm vào mở bảng chi tiết kèm nút tải lại.
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
  const problem = source === 'sample' || errors.length > 0

  const label = loading
    ? t('Đang tải…')
    : source === 'sample'
      ? t('Dữ liệu mẫu')
      : t('{0} nhập · {1} xuất', asns.length, pickOrders.length)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('Dữ liệu đơn hàng')}
        className={cn(
          'flex min-w-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition active:bg-white/20',
          problem && !loading ? 'bg-warning/25 text-amber-100' : 'bg-white/12 text-white/85',
        )}
      >
        {loading ? (
          <Loader2 className="size-3 shrink-0 animate-spin" strokeWidth={2.4} />
        ) : source === 'sample' ? (
          <CloudOff className="size-3 shrink-0" strokeWidth={2.4} />
        ) : (
          <Database className="size-3 shrink-0" strokeWidth={2.4} />
        )}
        <span className="truncate">{label}</span>
        {errors.length > 0 && !loading && (
          <AlertTriangle className="size-3 shrink-0 text-amber-200" strokeWidth={2.6} />
        )}
      </button>

      <BottomSheet open={open} title={t('Dữ liệu đơn hàng')} onClose={() => setOpen(false)}>
        <div className="mx-2 mb-3 rounded-lg bg-field px-3.5 py-2.5">
          {[
            [t('Nguồn'), source === 'sheet' ? t('Google Sheet') : t('Dữ liệu mẫu trong app')],
            [t('Cập nhật lúc'), hhmm(generatedAt)],
            [t('Đơn nhập'), String(asns.length)],
            [t('Đơn xuất'), String(pickOrders.length)],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 py-1">
              <span className="shrink-0 text-[13px] text-label">{k}</span>
              <span className="truncate text-[14px] font-semibold text-brand">{v}</span>
            </div>
          ))}
        </div>

        {notice && (
          <p className="mx-2 mb-3 rounded-lg bg-warning/10 px-3 py-2 text-[12px] leading-snug text-slate-700">
            {notice}
          </p>
        )}

        {errors.length > 0 && (
          <>
            <div className="px-3.5 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wide text-label">
              {t('Bỏ qua {0} dòng do lỗi', errors.length)}
            </div>
            {errors.map((e, i) => (
              <div key={i} className="border-b border-line/70 px-3.5 py-2.5 last:border-0">
                <div className="text-[12px] font-semibold text-brand">
                  {t('Tab {0} · dòng {1} · cột {2}', e.sheet, e.row, e.column)}
                </div>
                <div className="text-[14px] text-ink">{e.message}</div>
                {e.value && <div className="truncate text-[12px] text-muted">“{e.value}”</div>}
              </div>
            ))}
          </>
        )}

        <div className="px-2 pb-2 pt-3">
          <p className="pb-2 text-[11px] leading-snug text-muted">
            {t('Tải lại lấy bản mới nhất từ bảng tính và bỏ thao tác đang làm dở.')}
          </p>
          <Button
            block
            variant="outline"
            disabled={loading}
            onClick={async () => {
              await loadData(true)
              setOpen(false)
            }}
          >
            <RefreshCw className={cn('size-5', loading && 'animate-spin')} /> {t('Tải lại')}
          </Button>
        </div>
      </BottomSheet>
    </>
  )
}
