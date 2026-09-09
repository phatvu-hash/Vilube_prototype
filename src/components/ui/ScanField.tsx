import { useState } from 'react'
import { ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomSheet } from '@/components/mobile/BottomSheet'

export interface ScanOption {
  value: string
  label: string
  sub?: string
}

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  /** Danh sách mã có thể "quét" — mô phỏng máy quét của handheld */
  options: ScanOption[]
  placeholder?: string
  required?: boolean
  emphasis?: boolean
  sheetTitle?: string
  emptyText?: string
}

/**
 * Ô quét mã. Trên handheld thật, bấm ô này rồi bắn máy quét.
 * Ở prototype: chạm icon quét → chọn mã trong danh sách mô phỏng.
 */
export function ScanField({
  label,
  value,
  onChange,
  options,
  placeholder = '---',
  required,
  emphasis,
  sheetTitle,
  emptyText = 'Không còn mã nào để quét',
}: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="flex items-center gap-2 rounded-lg bg-field px-3.5 py-2">
        <label className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-label">
            {label}
            {required && <span className="text-danger"> *</span>}
          </span>
          <input
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'block w-full bg-transparent text-[15px] font-medium placeholder:text-muted focus:outline-none',
              emphasis ? 'font-semibold text-brand' : 'text-ink',
            )}
          />
        </label>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Quét mã"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-navy active:bg-navy-100"
        >
          <ScanLine className="size-5" strokeWidth={1.75} />
        </button>
      </div>

      <BottomSheet
        open={open}
        title={sheetTitle ?? (/^qu[ée]t/i.test(label) ? label : `Quét ${label.toLowerCase()}`)}
        onClose={() => setOpen(false)}
      >
        <p className="px-3.5 pb-2 text-[12px] text-muted">
          Mô phỏng máy quét — chạm vào mã bên dưới để "quét".
        </p>
        {options.length === 0 && (
          <div className="px-4 py-10 text-center text-[15px] text-muted">{emptyText}</div>
        )}
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              onChange(o.value)
              setOpen(false)
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left active:bg-slate-50"
          >
            <ScanLine className="size-5 shrink-0 text-navy" strokeWidth={1.75} />
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold text-ink">{o.label}</span>
              {o.sub && <span className="block truncate text-[12px] text-muted">{o.sub}</span>}
            </span>
          </button>
        ))}
      </BottomSheet>
    </>
  )
}
