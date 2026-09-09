import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomSheet } from '@/components/mobile/BottomSheet'

export interface Option {
  value: string
  label: string
  sub?: string
}

interface Props {
  label: string
  value?: string
  options: Option[]
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  emphasis?: boolean
  disabled?: boolean
}

/** Field hiển thị giá trị + mở bottom-sheet để chọn (dropdown kiểu mobile) */
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = '---',
  required,
  emphasis,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-2 rounded-lg bg-field px-3.5 py-2.5 text-left disabled:opacity-60"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-label">
            {label}
            {required && <span className="text-danger"> *</span>}
          </span>
          <span
            className={cn(
              'block truncate text-[15px]',
              current ? (emphasis ? 'font-semibold text-brand' : 'font-medium text-ink') : 'text-muted',
            )}
          >
            {current?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown className="size-5 shrink-0 text-muted" strokeWidth={2} />
      </button>

      <BottomSheet open={open} title={label} onClose={() => setOpen(false)}>
        {options.length === 0 && (
          <div className="px-4 py-10 text-center text-[15px] text-muted">Không có dữ liệu</div>
        )}
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-3 text-left text-[15px]',
                active ? 'bg-navy-50 font-semibold text-navy' : 'text-ink active:bg-slate-50',
              )}
            >
              <span className="min-w-0">
                <span className="block truncate">{o.label}</span>
                {o.sub && <span className="block truncate text-[12px] text-muted">{o.sub}</span>}
              </span>
              {active && <Check className="size-5 shrink-0 text-navy" strokeWidth={2.5} />}
            </button>
          )
        })}
      </BottomSheet>
    </>
  )
}
