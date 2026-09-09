import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n'

/** Bottom-sheet dùng chung cho dropdown & mô phỏng quét mã */
export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
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
          'absolute inset-x-0 bottom-0 flex max-h-[72%] flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-3.5">
          <h2 className="text-[18px] font-semibold text-slate-700">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-slate-500 active:bg-slate-100"
            aria-label={t('Đóng')}
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  )
}
