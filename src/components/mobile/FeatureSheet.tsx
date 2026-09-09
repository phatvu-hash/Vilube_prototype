import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useT } from '@/i18n'

export interface FeatureOption {
  key: string
  label: string
}

interface Props {
  open: boolean
  value: string
  options: FeatureOption[]
  onChange: (key: string) => void
  onClose: () => void
  title?: string
}

function Radio({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'grid size-5 shrink-0 place-items-center rounded-full border-2',
        active ? 'border-navy' : 'border-slate-300',
      )}
    >
      {active && <span className="size-2.5 rounded-full bg-navy" />}
    </span>
  )
}

/** Bộ lọc "Tính năng" — panel trượt từ phải, theo HDSD bước 2 */
export function FeatureSheet({ open, value, options, onChange, onClose, title = 'Tính năng' }: Props) {
  const t = useT()
  return (
    <div className={cn('absolute inset-0 z-50', open ? '' : 'pointer-events-none')}>
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/30 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex w-[62%] flex-col bg-white shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-[17px] font-semibold text-slate-700">{t(title)}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-slate-500 active:bg-slate-100"
            aria-label={t('Đóng')}
          >
            <X className="size-6" strokeWidth={2} />
          </button>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto px-5">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => {
                onChange(o.key)
                onClose()
              }}
              className="flex w-full items-center gap-3 border-b border-line/60 py-3 text-left last:border-0"
            >
              <Radio active={o.key === value} />
              <span className="text-[13px] font-bold uppercase tracking-wide text-brand">{t(o.label)}</span>
            </button>
          ))}
        </div>
        <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button block onClick={onClose}>
            {t('Đóng')}
          </Button>
        </div>
      </div>
    </div>
  )
}
