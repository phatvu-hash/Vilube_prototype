import { Calendar, ScanLine } from 'lucide-react'
import type { HTMLInputTypeAttribute } from 'react'
import { cn, fmtDateSlash } from '@/lib/utils'
import { useT } from '@/i18n'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  scan?: boolean
  onScan?: () => void
  calendar?: boolean
  readOnly?: boolean
  emphasis?: boolean
  type?: HTMLInputTypeAttribute
  className?: string
}

/** Ô field nền xám nhạt, nhãn nhỏ phía trên — khớp mockup HDSD */
export function InputField({
  label,
  value,
  onChange,
  placeholder = '---',
  required,
  scan,
  onScan,
  calendar,
  readOnly,
  emphasis,
  type = 'text',
  className,
}: Props) {
  const t = useT()
  return (
    <label className={cn('relative flex items-center gap-2 rounded-lg bg-field px-3.5 py-2', className)}>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-label">
          {label}
          {required && <span className="text-danger"> *</span>}
        </span>
        {readOnly && type === 'date' ? (
          <span className="block truncate text-[15px] font-medium text-ink">
            {value ? fmtDateSlash(value) : placeholder}
          </span>
        ) : (
        <input
          type={type}
          inputMode={type === 'number' ? 'decimal' : undefined}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'block w-full bg-transparent text-[15px] font-medium placeholder:text-muted focus:outline-none',
            emphasis ? 'font-semibold text-brand' : 'text-ink',
            readOnly && 'cursor-default',
          )}
        />
        )}
      </span>
      {scan && (
        <button type="button" onClick={onScan} aria-label={t('Quét mã')} className="shrink-0">
          <ScanLine className="size-5 text-navy" strokeWidth={1.75} />
        </button>
      )}
      {calendar && <Calendar className="size-5 shrink-0 text-muted" strokeWidth={1.75} />}
    </label>
  )
}
