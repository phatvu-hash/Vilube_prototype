import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boxes, Check, Droplets, Globe } from 'lucide-react'
import { useApp } from '@/store'
import { useLang, useT, type Lang } from '@/i18n'
import { warehouses } from '@/data/mock'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/Button'
import { ScreenScroll } from '@/components/mobile/parts'
import { cn } from '@/lib/utils'

const ICON = { BB: Boxes, NVL: Droplets } as const

const LANGS: { key: Lang; label: string; short: string }[] = [
  { key: 'vi', label: 'Tiếng Việt', short: 'VI' },
  { key: 'en', label: 'English', short: 'EN' },
]

/**
 * Bước 0 — Chọn kho thao tác.
 * Đứng trước màn hình chính: chọn kho Bao Bì hoặc kho Nguyên vật liệu,
 * và đổi ngôn ngữ hiển thị cho toàn app.
 */
export function ChonKho() {
  const nav = useNavigate()
  const t = useT()
  const lang = useLang((s) => s.lang)
  const setLang = useLang((s) => s.setLang)
  const user = useApp((s) => s.user)
  const current = useApp((s) => s.warehouseId)
  const setWarehouse = useApp((s) => s.setWarehouse)

  const [picked, setPicked] = useState(current ?? warehouses[0].id)
  const wh = warehouses.find((w) => w.id === picked)

  const enter = () => {
    if (!wh) return
    setWarehouse(wh.id)
    toast(t('Đã vào {0}', t(wh.name)))
    nav('/m', { replace: true })
  }

  return (
    <>
      <header className="shrink-0 border-b border-line px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Smartlog WMS</div>
            <h1 className="mt-0.5 text-[22px] font-semibold text-navy">{t('Chọn kho thao tác')}</h1>
          </div>

          {/* Đổi ngôn ngữ — áp dụng cho toàn bộ app */}
          <div className="flex shrink-0 overflow-hidden rounded-lg border border-navy/25">
            {LANGS.map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => setLang(l.key)}
                aria-label={l.label}
                className={cn(
                  'px-2.5 py-1.5 text-[12px] font-bold tracking-wide transition',
                  l.key === lang ? 'bg-navy text-white' : 'bg-white text-navy',
                )}
              >
                {l.short}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-snug text-label">
          <Globe className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={1.8} />
          {t('Chọn kho bạn sẽ làm việc. Mỗi kho có màn hình và nghiệp vụ riêng.')}
        </p>
      </header>

      <ScreenScroll className="space-y-3 px-4 py-4">
        <div className="rounded-card border border-line bg-white p-3.5 shadow-sm">
          <div className="text-[17px] font-bold text-navy">{user.name}</div>
          <div className="mt-0.5 text-[13px] text-slate-600">
            {t('Thủ kho')} · {user.code}
          </div>
        </div>

        {warehouses.map((w) => {
          const Icon = ICON[w.kind]
          const on = w.id === picked
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setPicked(w.id)}
              className={cn(
                'flex w-full items-center gap-3.5 rounded-card border-2 bg-white p-3.5 text-left shadow-sm transition',
                on ? 'border-navy' : 'border-line',
              )}
            >
              <span
                className={cn(
                  'grid size-14 shrink-0 place-items-center rounded-lg',
                  on ? 'bg-navy text-white' : 'bg-field text-navy',
                )}
              >
                <Icon className="size-8" strokeWidth={1.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[16px] font-bold text-navy">{t(w.name)}</span>
                  {w.id === current && (
                    <span className="shrink-0 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      {t('Đang chọn')}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-label">{t(w.hint)}</span>
                <span className="mt-1 block text-[11px] font-semibold tracking-wide text-muted">{w.code}</span>
              </span>
              {on && <Check className="size-6 shrink-0 text-navy" strokeWidth={2.6} />}
            </button>
          )
        })}
      </ScreenScroll>

      <div className="shrink-0 border-t border-line bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button block onClick={enter}>
          {t('VÀO KHO')}
        </Button>
      </div>
    </>
  )
}
